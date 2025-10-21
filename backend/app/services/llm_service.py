"""
LLM Service for generating test cases using OpenAI API
— US-/AC-getriebene Generierung ohne generische Schablonen; Dup-Filter inklusive.
"""
import os, json, traceback, asyncio, re
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter
from openai import OpenAI
from dotenv import load_dotenv
from app.models.schemas import TestCase


def _norm(s: str) -> List[str]:
    """Kleine Tokenisierung + Normalisierung für Jaccard-Ähnlichkeit."""
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9äöüß]+", " ", s)
    toks = [t for t in s.split() if t and len(t) > 2]
    return toks

def _jaccard(a: List[str], b: List[str]) -> float:
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    inter = len(sa & sb)
    uni = len(sa | sb)
    return inter / uni if uni else 0.0

def _looks_like(keyword_set: set, text: str) -> bool:
    t = (text or "").lower()
    return any(k in t for k in keyword_set)


class LLMService:
    """Service for interacting with LLM to generate *relevant* (US-/AC-basierte) test cases"""

    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.1"))
        self.top_p = float(os.getenv("OPENAI_TOP_P", "1.0"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "1800"))

        self.client = None
        self.client_available = False
        self.last_generation_source = "unknown"

        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                self.client_available = True
                print(f"OpenAI client configured, model={self.model}")
            except Exception:
                traceback.print_exc()

    # ========= Public API =========

    async def generate_test_cases(
        self,
        user_story: str,
        num_cases: int = 5,
        acceptance_criteria: Optional[List[str]] = None,
        roles: Optional[List[str]] = None,
        nfrs: Optional[List[str]] = None,
        seed: Optional[int] = None,
    ) -> List[TestCase]:
        """
        Erzeugt Testfälle, die ausschließlich durch User Story / ACs / NFRs gedeckt sind.
        Keine generischen Pflichtquoten, kein Füllmaterial.
        """
        acceptance_criteria = acceptance_criteria or []
        roles = roles or []
        nfrs = nfrs or []

        # Wunsch-Anzahl ist eine Obergrenze – wir generieren *höchstens* so viele,
        # aber füllen nicht künstlich auf, wenn es weniger sinnvolle Fälle gibt.
        target_max = max(num_cases or 0, 0)

        # 1) (Optional) Analysepass (robust, aber kein Muss)
        analysis = {}
        try:
            analysis = await self._analyze_user_story(user_story)
        except Exception as e:
            print("Analysis failed:", e)

        # 2) Prompt bauen
        prompt = self._create_prompt(user_story, target_max, analysis, acceptance_criteria, roles, nfrs)

        # 3) LLM-Aufruf (funktionales JSON via Function-Calling)
        cases_raw = await self._call_llm_returning_cases(prompt, seed)

        # 4) Post-Processing: strikte Relevanz + Dedup + Trimmen
        relevant_cases = self._filter_irrelevant(cases_raw, user_story, acceptance_criteria, nfrs)
        unique_cases = self._deduplicate(relevant_cases)

        # 5) Limit anwenden (keine künstliche Auffüllung!)
        if target_max > 0:
            unique_cases = unique_cases[:target_max]

        self.last_generation_source = "openai" if self.client_available else "mock"
        return unique_cases

    # ========= LLM Calls =========

    async def _call_llm_returning_cases(self, prompt: str, seed: Optional[int]) -> List[Dict[str, Any]]:
        if not self.client_available:
            print("OpenAI client not configured → returning empty")
            return []

        system_msg = (
            "Du bist Senior QA Engineer. "
            "Erzeuge *nur* Testfälle, die aus der User Story und (falls vorhanden) aus expliziten Akzeptanzkriterien/NFRs "
            "logisch folgen. "
            "Wenn eine Kategorie (z. B. Performance, Security, Boundary) nicht durch US/AC/NFRs motiviert ist, "
            "erzeuge dafür *keinen* Test. "
            "Jeder Test muss Akzeptanzkriterien im Feld 'covers' referenzieren (oder leer lassen, wenn keine ACs angegeben sind). "
            "Alle Ausgaben ausschließlich über die Funktion 'return_testcases'."
        )

        functions = [{
            "name": "return_testcases",
            "description": "Gebe ein JSON-Objekt mit der Eigenschaft 'test_cases' zurück.",
            "parameters": {
                "type": "object",
                "required": ["test_cases"],
                "properties": {
                    "test_cases": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["title","description","type","preconditions","steps","expected_result","priority"],
                            "properties": {
                                "title":{"type":"string"},
                                "description":{"type":"string"},
                                "type":{"type":"string","enum":["functional","security","performance","integration","usability","data-driven"]},
                                "preconditions":{"type":"array","items":{"type":"string"}},
                                "steps":{"type":"array","items":{"type":"string"}},
                                "expected_result":{"type":"string"},
                                "priority":{"type":"string","enum":["High","Medium","Low"]},
                                "covers":{"type":"array","items":{"type":"string"}}
                            }
                        }
                    }
                }
            }
        }]

        def _call():
            return self.client.chat.completions.create(
                model=self.model,
                temperature=self.temperature,
                top_p=self.top_p,
                seed=seed,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                functions=functions,
                function_call={"name": "return_testcases"},
                max_tokens=self.max_tokens
            )

        try:
            resp = await asyncio.to_thread(_call)
            msg = resp.choices[0].message
            args = msg.function_call and msg.function_call.arguments
            data = json.loads(args) if args else {}
            return data.get("test_cases", [])
        except Exception:
            traceback.print_exc()
            return []

    async def _analyze_user_story(self, user_story: str) -> dict:
        """Strukturierte Extraktion (optional)."""
        if not self.client_available:
            return {}
        system = (
            "Du bist ein präziser Analytiker für User Stories. "
            "Gib ausschließlich JSON über die Funktion 'return_extraction' zurück."
        )
        user = f"Analysiere diese User Story:\n\n{user_story}\n"

        functions = [{
            "name": "return_extraction",
            "description": "Strukturierte US-Extraktion",
            "parameters": {
                "type": "object",
                "required": ["summary","preconditions","entities","constraints","acceptance_criteria","primary_feature"],
                "properties": {
                    "summary": {"type":"string"},
                    "preconditions": {"type":"array","items":{"type":"string"}},
                    "entities": {"type":"array","items":{"type":"string"}},
                    "constraints": {"type":"array","items":{"type":"string"}},
                    "acceptance_criteria": {"type":"array","items":{"type":"string"}},
                    "primary_feature": {"type":"string"}
                }
            }
        }]

        def _call():
            return self.client.chat.completions.create(
                model=self.model,
                temperature=0.0,   # Analyse deterministischer
                top_p=1.0,
                messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
                functions=functions,
                function_call={"name": "return_extraction"},
                max_tokens=500
            )

        try:
            resp = await asyncio.to_thread(_call)
            msg = resp.choices[0].message
            args = msg.function_call and msg.function_call.arguments
            return json.loads(args) if args else {}
        except Exception:
            traceback.print_exc()
            return {}

    # ========= Prompting =========

    def _create_prompt(
        self,
        user_story: str,
        target_max: int,
        analysis: dict,
        acceptance_criteria: List[str],
        roles: List[str],
        nfrs: List[str],
    ) -> str:
        """
        Klare Regeln gegen generische Schablonen:
        - Erzeuge nur Tests, die durch US/AC/NFRs motiviert sind.
        - Keine Pflichtquoten (keine erzwungenen Boundary/Performance/Security).
        - Jeder Test: konkrete Daten, nummerierte Schritte, 'covers' mit AC-Referenzen (falls vorhanden).
        - Wenn ein potentieller Test nicht gerechtfertigt ist → NICHT erzeugen.
        """
        ac_block = "\n".join(f"- {ac}" for ac in acceptance_criteria) or "(keine expliziten ACs)"
        roles_block = ", ".join(roles) or "(keine Rollen angegeben)"
        nfrs_block = ", ".join(nfrs) or "(keine NFRs)"

        analysis_block = ""
        if analysis:
            try:
                # optional, hilft dem Modell die US zu verstehen
                analysis_block = "\n--- Analyse (optional) ---\n" + json.dumps(analysis, ensure_ascii=False)
            except Exception:
                pass

        cap = f"Erzeuge bis zu {target_max} Testfällen." if target_max > 0 else "Erzeuge eine sinnvolle Anzahl an Testfällen."
        rules = (
            f"{cap}\n"
            "- Erzeuge *nur* Tests, die streng aus User Story / ACs / NFRs folgen.\n"
            "- Wenn Boundary/Negative/Performance/Security nicht explizit nahegelegt sind, lasse sie weg.\n"
            "- Jeder Test muss *einen klaren Zweck* haben und darf keine Duplikate zu anderen Tests sein.\n"
            "- Schritte nummerieren (1., 2., 3.), konkrete Beispielwerte verwenden.\n"
            "- Feld 'covers' mit den abgedeckten ACs füllen (Wortlaut oder ID), sonst leer lassen.\n"
            "- Ausgabe ausschließlich über die Funktion als JSON: {'test_cases': [...]}.\n"
        )

        return (
            "User Story:\n"
            f"{user_story}\n\n"
            "Akzeptanzkriterien:\n"
            f"{ac_block}\n\n"
            f"Rollen: {roles_block}\n"
            f"NFRs: {nfrs_block}\n"
            f"{analysis_block}\n\n"
            "Regeln:\n"
            f"{rules}"
        )

    # ========= Relevanz-Filter & Dedup =========

    def _filter_irrelevant(
        self,
        raw_cases: List[Dict[str, Any]],
        user_story: str,
        acs: List[str],
        nfrs: List[str],
    ) -> List[TestCase]:
        """
        Entfernt Fälle, die thematisch nicht passen:
        - Security nur, wenn US/AC/NFRs Begriffe wie auth/role/permission/security enthalten.
        - Performance nur, wenn US/AC/NFRs 'performance', 'latenz', 'Last' etc. erwähnen.
        - Boundary nur, wenn Felder/Größen/Längen/limits/intervalle/Min/Max etc. vorkommen.
        - Integration nur, wenn externe Systeme/IDs/Downstream erwähnt sind.
        """
        text = " ".join([user_story] + acs + nfrs).lower()

        kw_security = {"security", "sicherheit", "auth", "autor", "permission", "berechtigung", "role", "rollen", "oauth"}
        kw_perf     = {"performance", "latenz", "last", "load", "reaktionszeit", "response time", "throughput"}
        kw_boundary = {"grenz", "min", "max", "obergrenze", "untergrenze", "range", "limit", "länge", "maxlength", "anzahl", "wertbereich"}
        kw_integr   = {"schnittstelle", "api", "extern", "downstream", "webhook", "queue", "id", "ma11", "ma10"}

        allow_security  = _looks_like(kw_security, text)
        allow_perf      = _looks_like(kw_perf, text)
        allow_boundary  = _looks_like(kw_boundary, text)
        allow_integr    = _looks_like(kw_integr, text)

        filtered: List[TestCase] = []
        for i, tc in enumerate(raw_cases, start=1):
            ttype = (tc.get("type") or "").lower().strip()
            title = (tc.get("title") or "").strip()
            if not title.startswith("TC-"):
                title = f"TC-{i} {title}"
            tc["title"] = title

            if ttype == "security" and not allow_security:
                continue
            if ttype == "performance" and not allow_perf:
                continue
            if ttype == "data-driven" and not allow_boundary:
                # 'data-driven' wird in deinem Schema oft für Grenz-/Werte-Varianten benutzt
                continue
            if ttype == "integration" and not allow_integr:
                continue

            # AC-Referenz ist erwünscht – wenn ACs vorhanden sind, prüfe auf minimale Deckung
            if acs:
                covers = [c.strip() for c in (tc.get("covers") or []) if c and c.strip()]
                # toleranter Check: Substring-Match reicht (derselbe Wortlaut ist selten 1:1)
                if not any(any(a.lower() in c.lower() or c.lower() in a.lower() for a in acs) for c in covers):
                    # Falls der Test offensichtlich zum US-Kern gehört, aber covers fehlt, akzeptieren wir ihn.
                    # (Optional: hier strenger machen und droppen)
                    pass

            filtered.append(TestCase(
                title=tc["title"],
                description=tc.get("description",""),
                preconditions=tc.get("preconditions",[]) or [],
                steps=tc.get("steps",[]) or [],
                expected_result=tc.get("expected_result",""),
                priority=tc.get("priority","Medium")
            ))

        return filtered

    def _deduplicate(self, cases: List[TestCase]) -> List[TestCase]:
        """
        Entfernt Duplikate/nahe Duplikate anhand von Titel/Schritten/Erwartung (Jaccard).
        """
        out: List[TestCase] = []
        seen_titles = set()
        for tc in cases:
            t_tok = _norm(tc.title)
            s_tok = _norm(" ".join(tc.steps))
            e_tok = _norm(tc.expected_result)

            is_dup = False
            for ex in out:
                t2 = _norm(ex.title)
                s2 = _norm(" ".join(ex.steps))
                e2 = _norm(ex.expected_result)

                # Titel sehr ähnlich ODER (Schritte & Erwartung ähnlich)
                if _jaccard(t_tok, t2) >= 0.7 or (
                    _jaccard(s_tok, s2) >= 0.6 and _jaccard(e_tok, e2) >= 0.6
                ):
                    is_dup = True
                    break

            if is_dup:
                continue

            # harte Titel-Dubletten abfangen
            if tc.title in seen_titles:
                continue
            seen_titles.add(tc.title)
            out.append(tc)

        return out

    # ========= Connectivity Test =========

    async def test_connection(self) -> dict:
        if not self.client_available:
            return {"ok": False, "error": "OpenAI client not configured"}
        try:
            def _ping():
                return self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role":"user","content":"ping"}],
                    max_tokens=1,
                    temperature=0.0
                )
            await asyncio.to_thread(_ping)
            return {"ok": True, "model": self.model}
        except Exception as e:
            traceback.print_exc()
            return {"ok": False, "error": str(e)}
