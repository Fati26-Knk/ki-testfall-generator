"""
LLM Service for generating test cases using OpenAI API
— Verbesserte Version mit dynamischer Abdeckung, gelockerten Filtern und mehr Varianz.
— Unterstützt sowohl Standard OpenAI als auch Azure OpenAI.
"""
import os, json, traceback, asyncio, re
from typing import List, Dict, Any, Optional
from openai import OpenAI, AzureOpenAI
from dotenv import load_dotenv
from app.models.schemas import TestCase


def _norm(s: str) -> List[str]:
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
        
        # Provider-Auswahl: "azure" oder "openai"
        self.provider = os.getenv("LLM_PROVIDER", "azure").lower()
        
        # Azure OpenAI Konfiguration
        self.azure_api_key = os.getenv("AZURE_OPENAI_API_KEY", "")
        self.azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "")
        self.azure_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "")
        self.azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
        
        # Standard OpenAI Konfiguration
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        # 🟢 Mehr Kreativität für bessere Abdeckung
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.6"))
        self.top_p = float(os.getenv("OPENAI_TOP_P", "0.9"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "9000"))

        self.client = None
        self.client_available = False
        self.last_generation_source = "unknown"
        self.using_azure = False

        # Provider basierend auf LLM_PROVIDER Variable auswählen
        if self.provider == "azure":
            if self.azure_api_key and self.azure_endpoint and self.azure_deployment:
                try:
                    self.client = AzureOpenAI(
                        api_key=self.azure_api_key,
                        api_version=self.azure_api_version,
                        azure_endpoint=self.azure_endpoint
                    )
                    self.client_available = True
                    self.using_azure = True
                    self.model = self.azure_deployment  # Bei Azure ist model = deployment name
                    print(f"✅ Azure OpenAI client configured, deployment={self.azure_deployment}")
                except Exception:
                    traceback.print_exc()
            else:
                print("⚠️ LLM_PROVIDER=azure aber Azure-Konfiguration fehlt!")
        elif self.provider == "openai":
            if self.api_key:
                try:
                    self.client = OpenAI(api_key=self.api_key)
                    self.client_available = True
                    print(f"✅ OpenAI client configured, model={self.model}")
                except Exception:
                    traceback.print_exc()
            else:
                print("⚠️ LLM_PROVIDER=openai aber OPENAI_API_KEY fehlt!")
        else:
            print(f"⚠️ Unbekannter LLM_PROVIDER: {self.provider}. Verwende 'azure' oder 'openai'.")

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
        Generiert Testfälle mit deutlich verbesserter Testabdeckung.
        Dynamisch angepasst an die Komplexität der User Story.
        """
        acceptance_criteria = acceptance_criteria or []
        roles = roles or []
        nfrs = nfrs or []

        # Dynamische Zielgröße abhängig von Länge und Komplexität
        text_len = len(user_story)
        if num_cases == 0:
            # Wenn keine Anzahl angegeben, verwende sinnvolle Anzahl basierend auf Komplexität
            if text_len > 1500:
                target_max = 15
            elif text_len > 800:
                target_max = 10
            else:
                target_max = 8
        else:
            # Verwende die angegebene Anzahl, aber mit vernünftigen Limits
            target_max = min(num_cases, 20)  # Maximal 20 Testfälle

        # Optional: Analyse der US
        analysis = {}
        try:
            analysis = await self._analyze_user_story(user_story)
        except Exception as e:
            print("Analysis failed:", e)

        # Prompt erstellen
        prompt = self._create_prompt(user_story, target_max, analysis, acceptance_criteria, roles, nfrs)

        # LLM-Aufruf
        cases_raw = await self._call_llm_returning_cases(prompt, seed)
        print(f"DEBUG: After LLM call: {len(cases_raw)} raw cases")

        # 🧹 Nachbearbeitung: Filter + Dedup
        relevant_cases = self._filter_irrelevant(cases_raw, user_story, acceptance_criteria, nfrs)
        print(f"DEBUG: After filter: {len(relevant_cases)} relevant cases")
        
        unique_cases = self._deduplicate(relevant_cases)
        print(f"DEBUG: After dedup: {len(unique_cases)} unique cases")

        # Limit anwenden (wenn gesetzt)
        if target_max > 0:
            unique_cases = unique_cases[:target_max]
        print(f"DEBUG: After limit: {len(unique_cases)} final cases")

        # IDs neu vergeben für konsistente Nummerierung (TC-1, TC-2, TC-3...)
        for i, tc in enumerate(unique_cases, start=1):
            # Entferne alte TC-Nummer aus dem Titel
            title = tc.title
            # Entferne TC-X prefix falls vorhanden
            title = re.sub(r'^TC-\d+\s*[-:]?\s*', '', title)
            # Füge neue konsistente Nummer hinzu
            tc.title = f"TC-{i} - {title}"

        if self.client_available:
            self.last_generation_source = "azure-openai" if self.using_azure else "openai"
        else:
            self.last_generation_source = "mock"
        return unique_cases

    # ========= Analysis =========

    async def _analyze_user_story(self, user_story: str) -> Dict[str, Any]:
        """
        Optionale Analyse der User Story zur Strukturierung.
        Extrahiert Schlüsselinformationen für bessere Testgenerierung.
        """
        try:
            # Einfache strukturelle Analyse ohne zusätzlichen LLM-Call
            analysis = {
                "summary": user_story[:200] + "..." if len(user_story) > 200 else user_story,
                "complexity": "high" if len(user_story) > 1500 else "medium" if len(user_story) > 800 else "low",
                "entities": [],  # Könnte erweitert werden
                "actions": [],   # Könnte erweitert werden
            }
            return analysis
        except Exception as e:
            print(f"Analysis error: {e}")
            return {}

    # ========= LLM Calls =========

    async def _call_llm_returning_cases(self, prompt: str, seed: Optional[int]) -> List[Dict[str, Any]]:
        if not self.client_available:
            print("❌ OpenAI client not configured → returning empty")
            return []

        system_msg = """
            Du bist ein erfahrener Requirements-basierter Testanalyst und Senior QA Engineer.

            Deine Aufgabe ist es, HOCHWERTIGE, DETAILLIERTE und AUSREICHENDE Testfälle
            auf Basis einer tiefgehenden Analyse der gegebenen User Story zu erstellen.

            KRITISCHE SPRACHREGEL:
            - Verwende IMMER dieselbe Sprache wie die User Story.
            - Ist die User Story auf Deutsch → ALLE Testfälle auf Deutsch.
            - Ist die User Story auf Englisch → ALLE Testfälle auf Englisch.
            - Verwende durchgehend dieselbe Sprache in Titel, Beschreibung, Schritten und erwartetem Ergebnis.

            VERPFLICHTENDE ANALYSE (ZUERST DURCHFÜHREN):
            - Zerlege die User Story in ATOMARE, PRÜFBARE fachliche Regeln.
            - Ein Satz kann MEHRERE Regeln enthalten.
            - Identifiziere alle Bedingungen, Validierungen, Einschränkungen und logischen Verzweigungen.
            - Begrenze dich NICHT auf die Anzahl der Sätze.

            REGELN ZUR TESTFALL-ABLEITUNG:
            - Erstelle ALLE Testfälle, die notwendig sind, um jede identifizierte Regel vollständig zu prüfen.
            - Eine Regel kann MEHRERE Testfälle erfordern (z. B. Happy Path, Alternativfluss, Validierung).
            - Es ist ERWARTET, dass eine kurze User Story zu VIELEN Testfällen führt.
            - Vermische NICHT mehrere Regeln in einem Testfall.

            STRENGE RELEVANZ:
            - Triff KEINE Annahmen.
            - Erfinde KEINE Regeln, Rollen, Validierungen oder Fehlerfälle.
            - Erstelle Testfälle NUR, wenn sie explizit genannt oder eindeutig aus der User Story ableitbar sind.

            KONSISTENZ & QUALITÄT:
            - Alle Testfälle müssen dieselbe Struktur und denselben Detaillierungsgrad haben.
            - Jeder Testfall muss vollständig und eigenständig ausführbar sein.
            - Die Schritte müssen präzise, nummeriert und eindeutig formuliert sein.

            TESTFALL-STRUKTUR (VERPFLICHTEND):
            - Titel (OHNE TC-Nummer)
            - Klare Beschreibung des Testziels
            - Vorbedingungen
            - 4–7 nummerierte Schritte mit konkreten Beispieldaten
            - Erwartetes Ergebnis
            - Priorität (Hoch / Mittel / Niedrig)

            ZIEL:
            - Die Testfälle sollen die User Story in ausführbarer Form widerspiegeln.
            - Das Lesen der Testfälle soll sich anfühlen wie das Lesen der User Story – nur vollständig testbar.

            AUSGABE:
            - Verwende ausschließlich die Funktion "return_testcases".
            - Format: { "test_cases": [ ... ] }
            """


        functions = [{
            "name": "return_testcases",
            "description": "JSON mit Liste von Testfällen zurückgeben.",
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

        def _call(user_prompt: str):
            """Wrapper für den eigentlichen LLM-Call.

            Wir kapseln das in eine Funktion, damit wir bei Bedarf mit einem
            leicht angepassten Prompt (z. B. weniger Testfälle) erneut aufrufen
            können, falls das JSON der Tool-Arguments unvollständig ist.
            """
            # GPT-5.x und neuere Modelle benötigen max_completion_tokens statt max_tokens
            # und tools statt functions
            # Außerdem unterstützen sie KEINE temperature/top_p Parameter (nur Standardwert 1)
            is_new_model = self.model.startswith("gpt-5") or self.model.startswith("o1") or self.model.startswith("o3")
            token_param = "max_completion_tokens" if is_new_model else "max_tokens"
            
            if is_new_model:
                # Neue Tools-API für GPT-5.x (ohne temperature/top_p - nicht unterstützt)
                tools = [{
                    "type": "function",
                    "function": functions[0]
                }]
                return self.client.chat.completions.create(
                    model=self.model,
                    # GPT-5.x Reasoning-Modelle unterstützen keine temperature/top_p
                    seed=seed,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_prompt},
                    ],
                    tools=tools,
                    tool_choice="required",
                    **{token_param: self.max_tokens},
                )
            else:
                # Legacy functions API für ältere Modelle
                return self.client.chat.completions.create(
                    model=self.model,
                    temperature=self.temperature,
                    top_p=self.top_p,
                    seed=seed,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_prompt},
                    ],
                    functions=functions,
                    function_call={"name": "return_testcases"},
                    **{token_param: self.max_tokens},
                )

        async def _invoke_and_parse(user_prompt: str) -> List[Dict[str, Any]]:
            """Führt den Call aus und parst die Funktion-Argumente als JSON."""
            provider = "Azure OpenAI" if self.using_azure else "OpenAI"
            print(f"DEBUG: Calling {provider} with model={self.model}")
            print(f"DEBUG: max_tokens={self.max_tokens}, temperature={self.temperature}")
            resp = await asyncio.to_thread(_call, user_prompt)
            
            # Debug: Vollständige Antwort-Informationen
            choice = resp.choices[0]
            msg = choice.message
            print(f"DEBUG: finish_reason={choice.finish_reason}")
            print(f"DEBUG: usage={resp.usage}")
            print(f"DEBUG: Response received, message={msg}")

            # Support both function_call (deprecated) and tool_calls (new)
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                print(f"DEBUG: tool_calls found, count={len(msg.tool_calls)}")
                args = msg.tool_calls[0].function.arguments
            elif hasattr(msg, "function_call") and msg.function_call:
                print("DEBUG: function_call found (legacy)")
                args = msg.function_call.arguments
            else:
                print("DEBUG: No tool_calls or function_call found!")
                print(f"DEBUG: content={msg.content[:500] if msg.content else 'EMPTY'}")
                args = None

            print(
                "DEBUG: Function call args=",
                (args[:200] + "...") if isinstance(args, str) and len(args) > 200 else args,
            )

            data = json.loads(args) if args else {}
            test_cases = data.get("test_cases", [])
            print(f"DEBUG: Parsed {len(test_cases)} test cases")
            return test_cases

        try:
            try:
                # Erster Versuch mit vollem Prompt
                return await _invoke_and_parse(prompt)
            except json.JSONDecodeError as e:
                # Häufige Ursache: Antwort wurde wegen Token-Limit mitten im JSON
                # abgeschnitten ("Unterminated string"). In diesem Fall versuchen
                # wir einen zweiten, konservativeren Call mit weniger geforderten
                # Testfällen, um die Antwortlänge zu reduzieren.
                print(
                    "WARN: JSON decode failed in _call_llm_returning_cases, retrying with reduced output:",
                    e,
                )
                safe_prompt = (
                    prompt
                    + "\n\nWICHTIG (technischer Hinweis): Generiere diesmal MAXIMAL 6 Testfälle "
                    "und achte streng darauf, dass das JSON der Funktion exakt dem Schema entspricht."
                )
                return await _invoke_and_parse(safe_prompt)
        except Exception as e:
            print(f"ERROR in _call_llm_returning_cases: {e}")
            traceback.print_exc()
            return []

    # ========= Prompt Creation =========

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

        cap = f"Generate EXACTLY {target_max} relevant test cases." if target_max > 0 else "Generate 8-12 relevant test cases."
        rules = (
            f"{cap}\n\n"
            "KRITISCHE SPRACHREGEL:\n"
            "- Verwende IMMER dieselbe Sprache wie die User Story.\n"
            "- Ist die User Story auf Deutsch → ALLE Testfälle auf Deutsch.\n"
            "- Ist die User Story auf Englisch → ALLE Testfälle auf Englisch.\n"
            "- Verwende dieselbe Sprache in ALLEN Feldern (Titel, Beschreibung, Schritte, erwartetes Ergebnis).\n\n"

            "WICHTIG: QUALITÄT UND VOLLSTÄNDIGE ABDECKUNG SIND ENTSCHEIDEND.\n\n"

            "1. VERPFLICHTENDE FACHLICHE ANALYSE (ZUERST):\n"
            "   ✓ Zerlege die User Story in ATOMARE, PRÜFBARE fachliche Regeln.\n"
            "   ✓ Ein einzelner Satz kann MEHRERE Regeln enthalten.\n"
            "   ✓ Identifiziere alle Bedingungen, Validierungen, Einschränkungen und logischen Verzweigungen.\n"
            "   ✓ Begrenze dich NICHT auf die Anzahl der Sätze der User Story.\n\n"

            "2. TESTFALL-ABLEITUNG (KERNSCHRITT):\n"
            "   ✓ Erstelle ALLE Testfälle, die notwendig sind, um JEDE identifizierte Regel vollständig zu prüfen.\n"
            "   ✓ Eine Regel kann MEHRERE Testfälle erfordern (z. B. Happy Path, Alternativfluss, Validierung).\n"
            "   ✓ Es ist ERWARTET, dass auch kurze User Stories zu VIELEN Testfällen führen können.\n"
            "   ✓ Vermische NIEMALS mehrere fachliche Regeln in einem Testfall.\n\n"

            "3. STRENGE RELEVANZ:\n"
            "   ✓ Triff KEINE Annahmen.\n"
            "   ✓ Erfinde KEINE Regeln, Rollen, Validierungen oder Fehlerfälle.\n"
            "   ✓ Erstelle Testfälle NUR, wenn sie explizit genannt oder eindeutig aus der User Story ableitbar sind.\n\n"

            "4. KONSISTENZ & QUALITÄT:\n"
            "   ✓ Alle Testfälle müssen dieselbe Struktur und denselben Detaillierungsgrad haben.\n"
            "   ✓ Jeder Testfall muss vollständig und eigenständig ausführbar sein.\n"
            "   ✓ Keine Unterschiede in Präzision, Detailtiefe oder Formulierung.\n\n"

            "5. TESTSCHRITTE:\n"
            "   ✓ Jeder Schritt muss klar, präzise und eindeutig beschrieben sein.\n"
            "   ✓ Alle Schritte müssen nummeriert sein (1., 2., 3., …).\n"
            "   ✓ Verwende KONKRETE Beispieldaten statt Platzhalter.\n"
            "   ✓ Jeder Klick, jede Eingabe und jede Aktion muss explizit beschrieben sein.\n\n"

            "6. TESTFALL-STRUKTUR (VERPFLICHTEND):\n"
            "   ✓ Titel OHNE TC-Nummer (Nummerierung erfolgt automatisch)\n"
            "   ✓ Klare Beschreibung des Testziels\n"
            "   ✓ Präzise Vorbedingungen\n"
            "   ✓ 4–7 nummerierte Schritte mit konkreten Beispieldaten\n"
            "   ✓ Erwartetes Ergebnis\n"
            "   ✓ Priorität (High / Medium / Low)\n\n"

            "7. ABDECKUNG DER USER STORY:\n"
            "   ✓ Jeder fachliche Aspekt der User Story muss durch mindestens einen Testfall abgedeckt sein.\n"
            "   ✓ Falls Akzeptanzkriterien vorhanden sind: mindestens ein Testfall pro Kriterium.\n"
            "   ✓ Falls mehrere Testfälle zu einer Regel existieren, müssen sie unterschiedliche Aspekte prüfen.\n\n"

            "8. AUSGABE:\n"
            "   ✓ Titel OHNE TC-Präfix (z. B. „Happy Path – Auswahl Ja für verwendeten Brennstoff“)\n"
            "   ✓ Ausschließlich über die Funktion „return_testcases“\n"
            "   ✓ Format: { \"test_cases\": [ ... ] }\n"
            "   ✓ Sprache MUSS exakt der Sprache der User Story entsprechen\n\n"

            "MERKSATZ:\n"
            "Jeder Testfall muss fachlich begründbar und eindeutig aus der User Story ableitbar sein.\n"
        )


        # Prompt zusammenstellen
        prompt = f"""
{rules}

=== USER STORY ===
{user_story}

=== AKZEPTANZKRITERIEN ===
{ac_block}

=== ROLLEN ===
{roles_block}

=== NICHT-FUNKTIONALE ANFORDERUNGEN ===
{nfrs_block}

{analysis_block}
"""
        return prompt.strip()

    # ========= Filter =========

    def _filter_irrelevant(self, raw_cases, user_story, acs, nfrs):
        """
        Weniger restriktiv – erlaubt Integration, Security und Performance standardmäßig bei komplexen Stories.
        """
        text = " ".join([user_story] + acs + nfrs).lower()
        allow_all = len(user_story) > 800  # komplexe Storys immer voll erlauben

        filtered = []
        for i, tc in enumerate(raw_cases):
            ttype = (tc.get("type") or "").lower().strip()
            title = (tc.get("title") or "").strip()
            print(f"DEBUG: Filter case {i+1}: title='{title[:50]}...', type='{ttype}', allow_all={allow_all}")
            
            # Entferne TC-Prefix falls vorhanden (wird später neu vergeben)
            title = re.sub(r'^TC-\d+\s*[-:]?\s*', '', title)

            # Wenn type leer ist, als "functional" behandeln
            if not ttype:
                ttype = "functional"
                print(f"DEBUG: No type found, defaulting to 'functional'")

            if allow_all or ttype in ["functional","usability","integration","data-driven","security","performance"]:
                filtered.append(TestCase(
                    title=title,
                    description=tc.get("description",""),
                    preconditions=tc.get("preconditions",[]) or [],
                    steps=tc.get("steps",[]) or [],
                    expected_result=tc.get("expected_result",""),
                    priority=tc.get("priority","Medium")
                ))
                print(f"DEBUG: Case {i+1} PASSED filter")
            else:
                print(f"DEBUG: Case {i+1} REJECTED by filter (type='{ttype}')")

        return filtered

    # ========= Dedup =========

    def _deduplicate(self, cases):
        out = []
        seen_titles = set()
        for tc in cases:
            t_tok = _norm(tc.title)
            s_tok = _norm(" ".join(tc.steps))
            e_tok = _norm(tc.expected_result)
            is_dup = False
            for ex in out:
                if _jaccard(t_tok, _norm(ex.title)) >= 0.7 or (
                    _jaccard(s_tok, _norm(" ".join(ex.steps))) >= 0.6 and
                    _jaccard(e_tok, _norm(ex.expected_result)) >= 0.6
                ):
                    is_dup = True
                    break
            if not is_dup and tc.title not in seen_titles:
                seen_titles.add(tc.title)
                out.append(tc)
        return out

    # ========= Connectivity =========

    async def test_connection(self) -> dict:
        if not self.client_available:
            return {"ok": False, "error": "OpenAI client not configured"}
        try:
            def _ping():
                return self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": "ping"}],
                    max_tokens=1,
                    temperature=0.0
                )
            await asyncio.to_thread(_ping)
            return {"ok": True, "model": self.model}
        except Exception as e:
            traceback.print_exc()
            return {"ok": False, "error": str(e)}
