# Software Requirements Specification (SRS)
## AI Test Case Generator

**Projekt:** KI-gestützte Testfall-Optimierung  
**Autorin:** Fadime Konuk  
**Studiengang:** SDE26 (Master)  
**Version:** 1.0.0  
**Datum:** 24. November 2025  
**Status:** Final

---

## Dokumentinformationen

| **Attribut** | **Wert** |
|--------------|----------|
| **Dokumenttitel** | Software Requirements Specification (SRS) |
| **Projekt** | AI Test Case Generator |
| **Version** | 1.0.0 |
| **Erstellt am** | 24. November 2025 |
| **Autorin** | Fadime Konuk |
| **Reviewer** | [Professor/Betreuer einfügen] |
| **Status** | Final |
| **Vertraulichkeit** | Intern (Hochschulprojekt) |

---

## Änderungshistorie

| **Version** | **Datum** | **Autor** | **Beschreibung** |
|-------------|-----------|-----------|------------------|
| 0.1 | 15.09.2025 | Fadime Konuk | Initiales Dokument erstellt |
| 0.5 | 20.10.2025 | Fadime Konuk | Funktionale Anforderungen erweitert |
| 0.8 | 10.11.2025 | Fadime Konuk | Nicht-funktionale Anforderungen hinzugefügt |
| 1.0 | 24.11.2025 | Fadime Konuk | Finalisierung nach Implementierung |

---

# 1. Einleitung

## 1.1. Zweck

### 1.1.1. Hintergründe und Ziele des Projekts

#### Hintergrund
Die manuelle Erstellung von Testfällen ist in modernen Softwareentwicklungsprojekten ein zeitaufwändiger und fehleranfälliger Prozess. QA-Teams verbringen durchschnittlich 40-60% ihrer Zeit mit der Dokumentation von Testfällen, wobei die Qualität stark von der Erfahrung und Auslastung der einzelnen Tester abhängt. Studien zeigen, dass 30-40% der kritischen Fehler erst in der Produktion entdeckt werden, da wichtige Testszenarien (Edge Cases, negative Tests) bei der manuellen Erstellung häufig übersehen werden.

Mit dem Aufkommen von Large Language Models (LLMs) wie GPT-4 eröffnen sich neue Möglichkeiten zur Automatisierung dieser Aufgabe. Die Fähigkeit von KI-Modellen, natürlichsprachliche Anforderungen zu verstehen und strukturierte Testfälle zu generieren, bietet erhebliches Potenzial zur Effizienzsteigerung und Qualitätsverbesserung.

#### Projektziele
Das Projekt "AI Test Case Generator" verfolgt folgende Hauptziele:

1. **Effizienzsteigerung**
   - Reduktion der Zeit für Testfall-Erstellung um mindestens 60-70%
   - Automatisierung repetitiver Dokumentationsaufgaben
   - Schnellere Time-to-Market durch beschleunigte QA-Prozesse

2. **Qualitätsverbesserung**
   - Erhöhung der Testabdeckung durch systematische KI-Analyse
   - Konsistente Testfall-Struktur und -Qualität
   - Identifikation von Edge Cases und negativen Szenarien, die manuell oft übersehen werden

3. **Standardisierung**
   - Einheitliche Testfall-Dokumentation über alle Projekte hinweg
   - Best-Practice-Templates für verschiedene Testtypen
   - Wiederverwendbare Testfall-Bibliotheken

4. **Wissensbewahrung**
   - Zentrale Testfall-Repository unabhängig von einzelnen Mitarbeitern
   - Nachvollziehbare Traceability zwischen Anforderungen und Tests
   - Langfristige Dokumentation von Teststrategien

#### Wissenschaftlicher Kontext
Dieses Projekt ist Teil einer Master Thesis im Studiengang Software Development & Engineering (SDE26) und untersucht die praktische Anwendbarkeit von Large Language Models in der Softwarequalitätssicherung. Die Forschungsfrage lautet:

> "Inwieweit kann die KI-gestützte Testfall-Generierung die Effizienz und Qualität im Software-Testing verbessern und welche Voraussetzungen müssen für eine erfolgreiche Integration in bestehende Entwicklungsprozesse erfüllt sein?"

### 1.1.2. Organisatorische Einbettung

#### Projektkontext
Das Projekt wird im Rahmen des 3. Mastersemesters (SDE26) als Master Thesis durchgeführt. Es handelt sich um ein eigenständiges Forschungs- und Entwicklungsprojekt mit Prototyp-Charakter.

**Organisatorische Struktur:**

```
Hochschule
├── Studiengang SDE26
│   ├── Master Thesis Modul
│   │   └── AI Test Case Generator (dieses Projekt)
│   └── Betreuende Professoren
│       ├── Erstbetreuer: [Name einfügen]
│       └── Zweitbetreuer: [Name einfügen]
```

#### Stakeholder

| **Stakeholder** | **Rolle** | **Interesse** |
|-----------------|-----------|---------------|
| **Studentin (Fadime Konuk)** | Entwicklerin, Projektleitung | Abschluss der Master Thesis, praktische KI-Erfahrung |
| **Betreuende Professoren** | Fachliche Betreuung, Bewertung | Wissenschaftliche Qualität, Innovationsgrad |
| **Hochschule** | Auftraggeber (akademisch) | Förderung von KI-Kompetenz, Forschungsergebnisse |
| **Potenzielle Anwender** | QA-Teams, Softwareentwickler | Effizientes Testing, Zeitersparnis |
| **Industrie (optional)** | Kooperationspartner | Evaluierung für realen Einsatz |

#### Projektumfeld
- **Entwicklungsumgebung:** Visual Studio Code, Docker, Git/GitHub
- **Deployment:** Lokal (Development), Docker Container (Production-Ready)
- **Zeitrahmen:** September 2025 - Januar 2026 (5 Monate)
- **Budget:** Kostenlos (Open-Source-Tools, OpenAI API im Rahmen von Hochschul-Credits)

#### Integration in bestehende Prozesse
Der Prototyp ist als **Standalone-Lösung** konzipiert, die sich jedoch in bestehende Entwicklungs-Workflows integrieren lässt:

- **Export-Funktionen:** CSV/Excel-Export für JIRA, Azure DevOps
- **API-First-Design:** REST API ermöglicht Integration in CI/CD-Pipelines
- **Container-Deployment:** Docker ermöglicht einfache Bereitstellung in Unternehmensumgebungen

### 1.1.3. Technische, wirtschaftliche, organisatorische, ergonomische Ziele

#### Technische Ziele

**TZ-1: Architektur und Technologie-Stack**
- Moderne, skalierbare Microservice-Architektur (Backend/Frontend getrennt)
- RESTful API mit FastAPI (Python 3.11+)
- React-basiertes Single-Page-Application (SPA) Frontend
- Docker-Containerisierung für Portabilität und einfaches Deployment

**TZ-2: KI-Integration**
- Nahtlose Integration von OpenAI GPT-4o-mini via API
- Strukturierte Ausgabe mittels Function Calling (JSON-Schema)
- Intelligente Prompt-Engineering-Strategien für konsistente Ergebnisse
- Fehlerbehandlung und Fallback-Mechanismen bei API-Ausfällen

**TZ-3: Datenmanagement**
- JSON-basierte Datenpersistenz für Prototyp (Migration zu PostgreSQL geplant)
- Strukturierte Ordnerstruktur: Projekte → User Stories → Testfälle
- Metadaten-Tracking (Erstellungsdatum, Generator, Status)

**TZ-4: Performance und Skalierbarkeit**
- Asynchrone Request-Verarbeitung (async/await)
- Testfall-Generierung in < 15 Sekunden (Ziel)
- Frontend-Ladezeit < 2 Sekunden
- Unterstützung von Dokumenten bis 50 MB

**TZ-5: Erweiterbarkeit**
- Modulare Service-Architektur (LLMService, StorageService, DocumentService)
- Vorbereitung für Multi-Model-Support (Claude, Llama, etc.)
- Plugin-fähige Architektur für zukünftige Features

#### Wirtschaftliche Ziele

**WZ-1: Kosteneffizienz**
- Reduktion der QA-Personalkosten durch Automatisierung (geschätzt: 60-70% Zeitersparnis)
- Minimierung von Production-Bugs durch bessere Testabdeckung (weniger Nachbesserungskosten)
- ROI-Berechnung: Bei einem QA-Team von 5 Personen à 60.000€/Jahr:
  - Zeitersparnis: 40% der Testfall-Erstellungszeit = 20% der Gesamtarbeitszeit
  - Einsparpotenzial: 5 × 60.000€ × 20% = **60.000€ pro Jahr**

**WZ-2: OpenAI API-Kosten**
- GPT-4o-mini: ~$0.15 pro 1M Input-Tokens, ~$0.60 pro 1M Output-Tokens
- Durchschnittliche Kosten pro Testfall-Generierung: $0.05 - $0.15
- Monatliche Kosten (bei 100 User Stories): ~$10-15
- → Deutlich günstiger als manuelle Erstellung (Personenstunden)

**WZ-3: Time-to-Market**
- Beschleunigung der QA-Phase um 40-50%
- Schnellere Release-Zyklen durch effizienteres Testing
- Wettbewerbsvorteil durch frühere Produktverfügbarkeit

**WZ-4: Skalierung**
- Keine linearen Kostensteigerungen bei wachsendem Projektumfang
- Wiederverwendung von Testfällen über Projekte hinweg
- Reduzierung von Onboarding-Zeit für neue QA-Mitarbeiter (standardisierte Testfälle)

#### Organisatorische Ziele

**OZ-1: Prozessoptimierung**
- Integration in Agile/Scrum-Workflows (Sprint Planning, Definition of Done)
- Automatisierung der Testdokumentation als Teil der User Story-Bearbeitung
- Reduzierung von Meeting-Zeiten für Testfall-Reviews

**OZ-2: Wissensmanagement**
- Zentrale Testfall-Bibliothek als Single Source of Truth
- Nachvollziehbare Traceability: Anforderung → User Story → Testfälle
- Unabhängigkeit von Einzelpersonen (Knowledge Retention)

**OZ-3: Collaboration**
- Plattform-unabhängiger Zugriff (Browser-basiert)
- Export-Funktionen für nahtlose Integration in bestehende Tools (JIRA, Azure DevOps)
- Vorbereitung für Team-Collaboration-Features (Kommentare, Reviews)

**OZ-4: Compliance und Audit**
- Dokumentierte Testfall-Historie (Metadaten: Ersteller, Datum, Änderungen)
- Nachweisbarkeit der Testabdeckung für Audits
- Standardisierte Testfall-Struktur für regulierte Branchen

#### Ergonomische Ziele

**EZ-1: Benutzerfreundlichkeit (Usability)**
- Intuitive Benutzeroberfläche mit minimaler Einarbeitungszeit (< 15 Minuten)
- Self-Explanatory UI-Elemente (klare Labels, Tooltips)
- Drag & Drop für Datei-Uploads
- Inline-Editing ohne Modal-Dialoge

**EZ-2: Accessibility**
- Tastaturnavigation für alle Hauptfunktionen
- Semantisches HTML für Screen-Reader-Kompatibilität
- Kontrastreiche Farben (WCAG 2.1 Level AA angestrebt)
- Responsive Design für Desktop, Tablet, Mobile

**EZ-3: Feedback und Transparenz**
- Echtzeit-Feedback durch Toast-Benachrichtigungen
- Loading-Spinner bei längeren Operationen
- Custom Confirmation-Dialoge statt Browser-Alerts
- Klare Fehlermeldungen mit Handlungsempfehlungen

**EZ-4: Effizienz der Interaktion**
- Keyboard-Shortcuts für häufige Aktionen (geplant)
- Bulk-Operationen ("Alle auswählen", "Alle merken")
- Expand/Collapse-Steuerung für große Testfall-Listen
- Autosave-Funktion (geplant)

**EZ-5: Cognitive Load Reduction**
- Strukturierte Darstellung (Dashboard vs. TestPlan)
- Gruppierung von Testfällen nach User Stories
- Farbkodierung für Prioritäten und Status
- Minimalistisches Design (kein UI-Clutter)

---

## 1.2. Produktumfang

### 1.2.1. Muss-Kriterien

Die folgenden Anforderungen sind **zwingend erforderlich** für den Minimal Viable Product (MVP) und müssen für einen erfolgreichen Projektabschluss implementiert sein:

#### MK-1: Testfall-Generierung
**Beschreibung:** Automatische Generierung von strukturierten Testfällen aus User Story-Text mittels KI.

**Akzeptanzkriterien:**
- System nimmt User Story-Text als Input (Titel, Beschreibung, optional: Akzeptanzkriterien)
- KI generiert mindestens 5-10 Testfälle pro User Story
- Jeder Testfall enthält:
  - Eindeutiger Titel (TC-X Format)
  - Beschreibung
  - Vorbedingungen (Preconditions) - Liste
  - Testschritte (Steps) - nummerierte Liste
  - Erwartetes Ergebnis (Expected Result)
  - Priorität (High, Medium, Low)
- Generierung erfolgt in < 30 Sekunden (90. Perzentil)
- System zeigt Loading-Indikator während der Generierung

#### MK-2: Dashboard-Eingabeformular
**Beschreibung:** Webbasiertes Formular zur Eingabe von User Stories.

**Akzeptanzkriterien:**
- Eingabefelder für:
  - User Story Titel (Pflichtfeld, max. 200 Zeichen)
  - Beschreibung (Pflichtfeld, mehrzeilig, max. 10.000 Zeichen)
  - Akzeptanzkriterien (optional, mehrzeilig)
- Button "Testfälle generieren"
- Validierung: Titel und Beschreibung müssen ausgefüllt sein
- Fehlermeldung bei leeren Pflichtfeldern

#### MK-3: Testfall-Anzeige
**Beschreibung:** Darstellung der generierten Testfälle in strukturierter Form.

**Akzeptanzkriterien:**
- Testfälle werden als Karten (Cards) dargestellt
- Expand/Collapse-Funktion pro Testfall
- Anzeige aller Testfall-Attribute (siehe MK-1)
- Checkbox zur Auswahl einzelner Testfälle
- Button "Alle auswählen" / "Alle abwählen"

#### MK-4: Projekt-Management
**Beschreibung:** Verwaltung von Projekten als Organisationseinheiten.

**Akzeptanzkriterien:**
- Erstellen neuer Projekte mit individuellem Namen
- Löschen von Projekten (mit Bestätigungsdialog)
- Anzeige aller Projekte in Sidebar
- "Hauptseite" (default) ist immer vorhanden und nicht löschbar

#### MK-5: Testfall-Persistenz
**Beschreibung:** Speicherung von Testfällen zur späteren Verwendung.

**Akzeptanzkriterien:**
- "Merken"-Funktion: Ausgewählte Testfälle in Staging speichern
- "Alle merken"-Funktion: Alle Testfälle einer User Story speichern
- Testfälle bleiben nach Browser-Reload erhalten
- Speicherung erfolgt im Backend (JSON-Dateien)

#### MK-6: TestPlan-Übersicht
**Beschreibung:** Zentrale Ansicht aller gespeicherten Testfälle organisiert nach Projekten.

**Akzeptanzkriterien:**
- Projekt-Sidebar zur Navigation
- Anzeige von User Stories mit Testfall-Anzahl
- Gruppierung: Projekt → User Story → Testfälle
- Expand/Collapse für User Story-Gruppen

#### MK-7: Testfall-Bearbeitung
**Beschreibung:** Manuelle Anpassung generierter Testfälle.

**Akzeptanzkriterien:**
- Inline-Editing von:
  - Titel
  - Beschreibung
  - Vorbedingungen (Hinzufügen/Entfernen/Ändern)
  - Schritte (Hinzufügen/Entfernen/Ändern)
  - Erwartetes Ergebnis
  - Priorität
- Speichern-Button mit Bestätigung
- Abbrechen-Button (Änderungen verwerfen)

#### MK-8: Testfall-Löschung
**Beschreibung:** Entfernen von Testfällen aus Projekten.

**Akzeptanzkriterien:**
- Löschen-Button pro Testfall
- Bestätigungsdialog vor Löschung
- Unwiderrufliches Löschen aus Backend-Storage

#### MK-9: Excel-Export
**Beschreibung:** Export von Testfällen als Excel-Datei.

**Akzeptanzkriterien:**
- Export-Button pro User Story
- Excel-Datei (.xlsx) mit Spalten:
  - Test Case ID, Title, Description, Preconditions, Test Steps, Expected Result, Priority, User Story
- UTF-8-Kodierung (korrekte Darstellung von Umlauten)
- Dateiname: `{UserStory}_TestCases.xlsx`

#### MK-10: REST API
**Beschreibung:** Backend-API für alle Frontend-Operationen.

**Akzeptanzkriterien:**
- OpenAPI-Dokumentation verfügbar unter `/api/docs`
- Endpunkte für:
  - Testfall-Generierung (POST `/generate-test-cases`)
  - Projekt-Verwaltung (GET/POST/DELETE `/projects`)
  - Testfall-Verwaltung (GET/POST/PUT/DELETE)
  - Staging (GET/POST/PUT/DELETE `/staging`)
  - Export (GET `/projects/{project}/{us}/export/csv`)
- JSON-basierte Request/Response
- HTTP-Status-Codes gemäß REST-Standards

### 1.2.2. Soll-Kriterien

Die folgenden Anforderungen sind **wünschenswert** und erhöhen den Wert des Produkts, sind aber nicht zwingend erforderlich:

#### SK-1: Dokument-Upload
**Beschreibung:** Hochladen von Anforderungsdokumenten zur erweiterten Kontextanalyse.

**Akzeptanzkriterien:**
- Unterstützung für .docx (Word) und .txt Dateien
- Drag & Drop-Funktion
- Mehrfach-Upload (bis zu 5 Dateien gleichzeitig)
- Größenlimit: 50 MB pro Datei
- Text-Extraktion und Einbindung in LLM-Prompt

**Status:**  Implementiert

#### SK-2: Umfassende Testfall-Generierung
**Beschreibung:** Modus für erweiterte Testabdeckung mit dynamischer Anzahl.

**Akzeptanzkriterien:**
- Toggle-Switch: "Kompakt" (3-5 Tests) vs. "Umfassend" (15-40 Tests)
- Dynamische Anzahl basierend auf Komplexität der User Story
- Abdeckung von Edge Cases, negativen Szenarien, Performance-Tests

**Status:**  Implementiert

#### SK-3: Re-Generation mit Kontext
**Beschreibung:** Erneute Generierung mit bisherigen Testfällen als Referenz.

**Akzeptanzkriterien:**
- "Re-Generieren"-Button im Dashboard
- System analysiert bereits generierte Testfälle
- Identifikation von Testfall-Lücken
- Ziel: Mindestens 2x mehr Tests als vorher (keine Duplikate)

**Status:**  Implementiert

#### SK-4: Projekt-Umbenennung
**Beschreibung:** Nachträgliche Änderung von Projektnamen.

**Akzeptanzkriterien:**
- Umbenennen-Button in Projekt-Sidebar (Hover-Aktion)
- Modal-Dialog mit Eingabefeld
- Validierung: Name darf nicht leer sein, nicht bereits existieren
- "Hauptseite" kann nicht umbenannt werden

**Status:**  Implementiert

#### SK-5: Expand/Collapse All
**Beschreibung:** Bulk-Steuerung für Auf-/Zuklappen von User Stories.

**Akzeptanzkriterien:**
- Toolbar mit Buttons "Alle ausklappen" / "Alle einklappen"
- Wirkt auf alle User Stories im aktuellen Projekt
- Visuelles Feedback (Icons: ▼/▶)

**Status:**  Implementiert

#### SK-6: Custom Confirmation Dialogs
**Beschreibung:** Benutzerdefinierte Bestätigungsdialoge statt Browser-Alerts.

**Akzeptanzkriterien:**
- Modernes UI-Design (Gradients, Animationen)
- Keyboard-Navigation (Escape = Cancel, Enter = Confirm)
- Ton-Varianten: "danger" (rot) für Löschungen, "default" (blau) für andere
- Verwendung bei: Projekt löschen, User Story löschen, Testfall löschen

**Status:**  Implementiert

#### SK-7: Toast-Benachrichtigungen
**Beschreibung:** Nicht-invasive Feedback-Messages für Benutzeraktionen.

**Akzeptanzkriterien:**
- Anzeige in Ecke (oben rechts oder unten rechts)
- Auto-Dismiss nach 3-5 Sekunden
- Typen: Success (grün), Error (rot), Info (blau), Warning (gelb)
- Beispiele: "Testfälle gespeichert", "Projekt gelöscht", "Export erfolgreich"

**Status:**  Implementiert

#### SK-8: JIRA/Azure DevOps-Export-Format
**Beschreibung:** Export-Formate optimiert für gängige Test-Management-Tools.

**Akzeptanzkriterien:**
- JIRA-Format: Spalten gemäß JIRA Test Case Import
- Azure DevOps-Format: Spalten gemäß Azure Test Plans
- Generic-Format: Standard-CSV
- Auswahl im Export-Dialog

**Status:**  Implementiert (JIRA/Azure in Backend, Frontend nutzt Excel)

### 1.2.3. Kann-Kriterien

Die folgenden Anforderungen sind **optional** und werden nur implementiert, wenn Zeit und Ressourcen es erlauben:

#### KK-1: Benutzer-Authentifizierung
**Beschreibung:** Login-System mit Rollen und Berechtigungen.

**Akzeptanzkriterien:**
- Registrierung, Login, Logout
- Rollen: Admin, QA-Lead, Tester
- Projekt-spezifische Zugriffsrechte
- Session-Management mit JWT-Tokens

**Status:**  Nicht implementiert (zukünftige Erweiterung)

#### KK-2: Multi-Model-Support
**Beschreibung:** Unterstützung mehrerer LLM-Provider.

**Akzeptanzkriterien:**
- Auswahl zwischen OpenAI, Claude, Llama, Mistral
- Einheitliche Abstraktionsschicht (LLMService)
- Konfiguration via UI oder Umgebungsvariablen

**Status:**  Nicht implementiert (Architektur vorbereitet)

#### KK-3: Versionierung von Testfällen
**Beschreibung:** Git-ähnliches Tracking von Änderungen.

**Akzeptanzkriterien:**
- Historie aller Änderungen pro Testfall
- Diff-Ansicht (alt vs. neu)
- Rollback zu früheren Versionen

**Status:**  Nicht implementiert

#### KK-4: Kommentar-Funktion
**Beschreibung:** Diskussionen zu Testfällen.

**Akzeptanzkriterien:**
- Kommentar-Thread pro Testfall
- @-Mentions für Kollegen
- Markdown-Unterstützung

**Status:**  Nicht implementiert

#### KK-5: Test-Ausführungs-Tracking
**Beschreibung:** Status-Management für Testdurchläufe.

**Akzeptanzkriterien:**
- Status: Passed, Failed, Blocked, Skipped
- Test-Läufe mit Datum und Tester
- Statistiken: Pass Rate, Failure Rate

**Status:**  Nicht implementiert

#### KK-6: Automatische Akzeptanzkriterien-Extraktion
**Beschreibung:** KI erkennt ACs aus User Story-Text.

**Akzeptanzkriterien:**
- Parsing von "Given-When-Then" Strukturen
- Nummerierung und Formatierung
- Manuelle Korrekturmöglichkeit

**Status:**  Nicht implementiert (Prompt-Engineering teilweise berücksichtigt)

#### KK-7: Dark Mode
**Beschreibung:** Dunkles UI-Theme für bessere Ergonomie.

**Akzeptanzkriterien:**
- Toggle-Switch in Header
- Konsistente Farbanpassung aller Komponenten
- Persistierung der Einstellung (LocalStorage)

**Status:**  Nicht implementiert

#### KK-8: Internationalisierung (i18n)
**Beschreibung:** Unterstützung mehrerer Sprachen.

**Akzeptanzkriterien:**
- Sprachen: Deutsch (Standard), Englisch
- Sprachumschaltung im UI
- Übersetzung aller Labels, Buttons, Messages

**Status:**  Nicht implementiert (aktuell nur Deutsch)

### 1.2.4. Abgrenzungs-Kriterien

Die folgenden Funktionalitäten sind **explizit nicht Teil** dieses Projekts und werden bewusst ausgegrenzt:

#### AK-1: Test-Automatisierung (Execution)
**Beschreibung:** Automatische Ausführung von Tests (z.B. Selenium, Playwright).

**Begründung:**
- Fokus liegt auf **Testfall-Generierung**, nicht auf Ausführung
- Testfall-Generierung und -Ausführung sind separate Domänen
- Ausführungs-Tools (Selenium, Cypress) sind bereits etabliert

**Abgrenzung:**
- System generiert **Dokumentation** für manuelle/automatisierte Tests
- Keine Integration mit Test-Runner-Frameworks
- Export-Funktionen erlauben Import in Ausführungs-Tools

#### AK-2: Defect-Tracking / Bug-Management
**Beschreibung:** Verwaltung von gefundenen Bugs und deren Status.

**Begründung:**
- Bug-Tracking ist eigenständige Domäne (JIRA, Azure DevOps)
- Projekt fokussiert auf Testfall-Erstellung, nicht Bug-Lifecycle
- Integration über Export-Funktionen ausreichend

**Abgrenzung:**
- Keine Bug-Datenbank
- Keine Verlinkung Testfall ↔ Bug
- Export von Testfällen → Import in Bug-Tracker möglich

#### AK-3: Requirement-Management
**Beschreibung:** Verwaltung und Versionierung von Anforderungen.

**Begründung:**
- Requirement-Management ist separate Disziplin (Tools: DOORS, Jama)
- Projekt konsumiert Anforderungen (User Stories), verwaltet sie aber nicht
- Fokus auf Downstream-Prozess (Requirements → Tests)

**Abgrenzung:**
- Keine Anforderungs-Datenbank
- Keine Traceability-Matrix (Requirements ↔ Tests)
- User Stories werden als Input akzeptiert, aber nicht versioniert

#### AK-4: Test-Daten-Management
**Beschreibung:** Verwaltung und Generierung von Testdaten.

**Begründung:**
- Testdaten-Generierung ist komplexe separate Aufgabe
- Benötigt Schema-Kenntnisse (Datenbank, API-Modelle)
- Außerhalb des Scopes einer Testfall-Dokumentation

**Abgrenzung:**
- Testfälle können Beispieldaten **erwähnen** (z.B. "Benutzer: Max Mustermann")
- Keine automatische Generierung realistischer Testdaten
- Keine Anonymisierung von Produktionsdaten

#### AK-5: Performance-Testing / Load-Testing
**Beschreibung:** Durchführung von Last- und Performance-Tests.

**Begründung:**
- Performance-Tests benötigen spezielle Tools (JMeter, K6, Gatling)
- Generierung von Performance-Testfällen möglich, aber Ausführung nicht
- Fokus liegt auf funktionalen Tests

**Abgrenzung:**
- System kann **funktionale** Testfälle für Performance-Szenarien generieren (z.B. "Teste Login mit 1000 gleichzeitigen Benutzern")
- Keine Ausführung von Load-Tests
- Keine Generierung von JMeter/K6-Skripten

#### AK-6: Mobile App / Native Apps
**Beschreibung:** Mobile Anwendungen (iOS, Android).

**Begründung:**
- Projekt ist als **Web-Anwendung** konzipiert (Browser-basiert)
- Mobile-Optimierung vorhanden (Responsive Design)
- Native Apps außerhalb des Scopes

**Abgrenzung:**
- Nutzung im mobilen Browser möglich (responsive)
- Keine nativen iOS/Android-Apps
- Keine Offline-Funktionalität (erfordert Web-Backend)

#### AK-7: AI-Model-Training / Fine-Tuning
**Beschreibung:** Training eigener KI-Modelle für Testfall-Generierung.

**Begründung:**
- Training von LLMs benötigt erhebliche Ressourcen (GPU, Daten, Zeit)
- Nutzung bestehender Modelle (OpenAI GPT) ist kostengünstiger
- Fine-Tuning ist Forschungsprojekt für sich

**Abgrenzung:**
- Nutzung von **vortrainierten Modellen** (OpenAI API)
- Prompt-Engineering für Qualitätsverbesserung
- Keine Sammlung von Trainingsdaten
- Keine eigenen Modell-Weights

#### AK-8: Real-Time-Collaboration
**Beschreibung:** Gleichzeitiges Bearbeiten von Testfällen durch mehrere Nutzer.

**Begründung:**
- Real-Time-Collaboration benötigt komplexe Infrastruktur (WebSockets, Conflict Resolution)
- Single-User-Prototyp ausreichend für MVP
- Feature für zukünftige Versionen geplant

**Abgrenzung:**
- Ein Nutzer pro Browser-Session
- Keine Live-Updates bei Änderungen anderer Nutzer
- Keine Presence-Indicators ("Max bearbeitet gerade...")

---

## 1.3. Definitionen, Akronyme, Abkürzungen

### Definitionen

| **Begriff** | **Definition** |
|-------------|----------------|
| **Testfall (Test Case)** | Strukturierte Beschreibung eines Tests mit Vorbedingungen, Schritten, erwartetem Ergebnis und Priorität. |
| **User Story** | Kurze, natürlichsprachliche Beschreibung einer Anforderung aus Nutzersicht (Format: "Als [Rolle] möchte ich [Funktion], damit [Nutzen]"). |
| **Akzeptanzkriterium (AC)** | Messbare Bedingung, die erfüllt sein muss, damit eine User Story als abgeschlossen gilt. Oft im "Given-When-Then"-Format. |
| **Edge Case** | Grenzfall oder Extremsituation, die vom typischen Nutzungsverhalten abweicht (z.B. leere Eingaben, maximale Werte). |
| **Happy Path** | Standardszenario ohne Fehler oder Ausnahmen, bei dem alles wie erwartet funktioniert. |
| **Staging** | Temporärer Speicherbereich für generierte Testfälle, bevor sie einem Projekt zugeordnet werden. |
| **Prompt** | Eingabetext für ein Large Language Model (LLM), der die Aufgabenstellung und Anforderungen beschreibt. |
| **Function Calling** | OpenAI-Feature, bei dem das Modell strukturierte Daten (JSON) gemäß einem vordefinierten Schema zurückgibt. |
| **Deduplication** | Prozess der Entfernung von duplizierten oder sehr ähnlichen Testfällen basierend auf Textähnlichkeit. |
| **Traceability** | Nachvollziehbarkeit der Beziehung zwischen Anforderungen (User Stories) und Tests. |
| **MVP (Minimum Viable Product)** | Minimalste Version eines Produkts mit gerade ausreichenden Features, um Nutzerfeedback zu erhalten. |
| **Prototyp** | Frühes, funktionsfähiges Modell eines Systems zur Evaluierung von Konzepten. |

### Akronyme und Abkürzungen

| **Akronym** | **Bedeutung** | **Erklärung** |
|-------------|---------------|---------------|
| **AC** | Acceptance Criteria | Akzeptanzkriterien |
| **AI** | Artificial Intelligence | Künstliche Intelligenz |
| **API** | Application Programming Interface | Programmierschnittstelle |
| **ASGI** | Asynchronous Server Gateway Interface | Standard für asynchrone Python-Webserver |
| **CRUD** | Create, Read, Update, Delete | Grundlegende Datenoperationen |
| **CSV** | Comma-Separated Values | Dateiformat für tabellarische Daten |
| **DOCX** | Document (Microsoft Word XML) | Word-Dokumentformat |
| **FAQ** | Frequently Asked Questions | Häufig gestellte Fragen |
| **GPT** | Generative Pre-trained Transformer | LLM-Architektur von OpenAI |
| **HMR** | Hot Module Replacement | Automatisches Neuladen geänderter Code-Module |
| **HTTP** | Hypertext Transfer Protocol | Protokoll für Webkommunikation |
| **i18n** | Internationalization | Mehrsprachigkeit |
| **JSON** | JavaScript Object Notation | Datenformat |
| **JWT** | JSON Web Token | Standard für Authentifizierungs-Tokens |
| **LLM** | Large Language Model | Großes Sprachmodell (KI) |
| **MVP** | Minimum Viable Product | Minimalprodukt |
| **NFR** | Non-Functional Requirement | Nicht-funktionale Anforderung |
| **QA** | Quality Assurance | Qualitätssicherung |
| **REST** | Representational State Transfer | Architekturstil für APIs |
| **ROI** | Return on Investment | Kapitalrendite |
| **SPA** | Single-Page Application | Web-App ohne Seitenwechsel |
| **SQL** | Structured Query Language | Datenbankabfragesprache |
| **SRS** | Software Requirements Specification | Software-Anforderungsspezifikation (dieses Dokument) |
| **SSO** | Single Sign-On | Einmalige Anmeldung für mehrere Systeme |
| **TC** | Test Case | Testfall |
| **UI** | User Interface | Benutzeroberfläche |
| **US** | User Story | Nutzeranforderung |
| **UX** | User Experience | Nutzererlebnis |
| **WCAG** | Web Content Accessibility Guidelines | Richtlinien für barrierefreie Webinhalte |
| **XLSX** | Excel Open XML Spreadsheet | Excel-Dateiformat |

### Technologie-spezifische Begriffe

| **Begriff** | **Kontext** | **Bedeutung** |
|-------------|-------------|---------------|
| **FastAPI** | Backend-Framework | Modernes Python-Web-Framework mit automatischer OpenAPI-Dokumentation |
| **Uvicorn** | Server | ASGI-Server für FastAPI-Anwendungen |
| **Pydantic** | Datenvalidierung | Python-Library für Schema-basierte Validierung |
| **React** | Frontend-Framework | JavaScript-Library für UI-Komponenten |
| **Vite** | Build-Tool | Schnelles Build-Tool für moderne Web-Apps |
| **Axios** | HTTP-Client | Promise-basierte HTTP-Library für Browser |
| **Docker** | Containerisierung | Plattform für Container-basiertes Deployment |
| **nginx** | Web-Server | Hochperformanter Web-Server für statische Dateien |
| **Mammoth** | Dokument-Parser | Library zum Extrahieren von Text aus .docx-Dateien |
| **XLSX** | Excel-Library | JavaScript-Library für Excel-Datei-Generierung |
| **OpenAI API** | KI-Service | Cloud-API für GPT-Modelle |
| **GPT-4o-mini** | LLM-Modell | Kompaktes, kosteneffizientes GPT-4-Modell |

---

## 1.4. Referenzen

### Externe Dokumente und Standards

| **Dokument** | **Typ** | **Relevanz** |
|--------------|---------|--------------|
| **IEEE 830-1998** | Standard | IEEE Recommended Practice for Software Requirements Specifications (SRS-Template-Basis) |
| **ISO/IEC 25010** | Standard | Software Quality Model (Qualitätskriterien für NFRs) |
| **ISTQB Glossary** | Terminologie | Standardisierte Test-Terminologie (Test Case, Test Plan, etc.) |
| **OpenAI API Documentation** | Technische Dokumentation | https://platform.openai.com/docs/api-reference |
| **FastAPI Documentation** | Technische Dokumentation | https://fastapi.tiangolo.com/ |
| **React Documentation** | Technische Dokumentation | https://react.dev/ |

### Projektinterne Dokumente

| **Dokument** | **Beschreibung** | **Dateiname** |
|--------------|------------------|---------------|
| **Projektübersicht** | Umfassende technische Dokumentation des Projekts | `PROJEKTÜBERSICHT.md` |
| **README** | Installationsanleitung und Schnellstart-Guide | `README.md` |
| **OpenAPI-Spec** | Automatisch generierte API-Dokumentation | `/api/docs` (Laufzeit) |
| **Docker-Compose-Files** | Konfiguration für Dev/Prod-Umgebungen | `docker-compose.yml`, `docker-compose.dev.yml` |

### Wissenschaftliche Quellen (für Master Thesis)

| **Quelle** | **Relevanz** |
|------------|--------------|
| **"Language Models are Few-Shot Learners"** (Brown et al., 2020) | Grundlagen zu GPT-3 und Few-Shot-Learning |
| **"Evaluating Large Language Models Trained on Code"** (Chen et al., 2021) | LLMs für Code-Generierung (ähnliche Domäne) |
| **"Automated Test Case Generation: A Survey"** (Anand et al., 2013) | Stand der Technik in automatischer Testgenerierung |
| **"ChatGPT for Software Testing: Promises and Pitfalls"** (Schäfer et al., 2023) | Evaluierung von LLMs für QA-Aufgaben |

### Tools und Plattformen

| **Tool** | **URL** | **Verwendung** |
|----------|---------|----------------|
| **GitHub** | https://github.com/Fati26-Knk/ki-testfall-generator | Versionskontrolle, Issue-Tracking |
| **OpenAI Platform** | https://platform.openai.com/ | API-Key-Verwaltung, Usage-Monitoring |
| **Visual Studio Code** | https://code.visualstudio.com/ | Entwicklungsumgebung |
| **Docker Hub** | https://hub.docker.com/ | Container-Images (node, python, nginx) |

---

# 2. Funktionale Anforderungen

Die funktionalen Anforderungen beschreiben **WAS** das System tun soll - die spezifischen Funktionen und Features aus Benutzersicht. Alle hier aufgeführten Anforderungen sind **vollständig implementiert**.

## 2.1. Benutzeroberfläche und Navigation

### FA-01: Dashboard für Testfall-Generierung
**Priorität:** MUSS  
**Beschreibung:** Das System stellt eine Dashboard-Ansicht bereit, in der Benutzer User Stories eingeben und Testfälle generieren können.

**Akzeptanzkriterien:**
- Benutzer muss in der Lage sein, User Story Titel (Pflichtfeld, max. 200 Zeichen) einzugeben
- Benutzer muss in der Lage sein, User Story Beschreibung (Pflichtfeld, mehrzeilig) einzugeben
- Benutzer kann optional Akzeptanzkriterien hinzufügen
- Benutzer muss in der Lage sein, zwischen "Kompakt" (3-5 Tests) und "Umfassend" (15-40 Tests) zu wählen
- Benutzer kann den Button "Testfälle generieren" nur aktivieren, wenn Pflichtfelder ausgefüllt sind
- Benutzer muss in der Lage sein, generierte Testfälle unterhalb des Formulars als Karten zu sehen
- Benutzer kann Dokumente per Drag & Drop hochladen (DOCX, TXT)

**Status:**  Implementiert  
**Traceability:** MK-1, MK-2, SK-1, SK-2

---

### FA-02: TestPlan-Übersicht
**Priorität:** MUSS  
**Beschreibung:** Das System bietet eine TestPlan-Ansicht zur Verwaltung gespeicherter Testfälle, organisiert nach Projekten und User Stories.

**Akzeptanzkriterien:**
- Benutzer muss in der Lage sein, alle Projekte in der Sidebar zu sehen (default: "Hauptseite")
- Benutzer muss in der Lage sein, durch Klick auf ein Projekt die zugehörigen User Stories zu laden
- Benutzer soll User Stories standardmäßig eingeklappt (collapsed) sehen
- Benutzer muss in der Lage sein, durch Klick auf User Story Header die Testfall-Liste zu expandieren/kollabieren
- Benutzer muss in der Lage sein, die Testfall-Anzahl pro User Story zu sehen (z.B. "10 Testfälle")
- Benutzer muss in der Lage sein, zwischen Dashboard und TestPlan über Header-Buttons zu navigieren

**Status:**  Implementiert  
**Traceability:** MK-6, SK-5

---

## 2.2. Testfall-Generierung (KI-gestützt)

### FA-03: KI-basierte Testfall-Erstellung
**Priorität:** MUSS  
**Beschreibung:** Das System generiert automatisch strukturierte Testfälle aus natürlichsprachlichen User Stories mittels OpenAI GPT-4o-mini.

**Akzeptanzkriterien:**
- Benutzer muss in der Lage sein, User Story (Titel, Beschreibung) als Input zu verwenden
- Benutzer kann optional Akzeptanzkriterien und hochgeladene Dokumente hinzufügen
- Benutzer muss in der Lage sein, 3-40 Testfälle zu erhalten (abhängig von gewähltem Modus)
- Benutzer muss in der Lage sein, in jedem Testfall folgende Informationen zu sehen:
  - Eindeutige ID (z.B. "TC-001")
  - Aussagekräftiger Titel (max. 150 Zeichen)
  - Kurze Beschreibung des Testziels
  - Array von Vorbedingungen
  - Array von nummerierten Testschritten
  - Erwartetes Ergebnis
  - Priorität ("High", "Medium" oder "Low")
- Benutzer soll die Generierung in < 30 Sekunden abgeschlossen sehen (90. Perzentil)
- Benutzer muss in der Lage sein, einen Loading-Spinner während der Generierung zu sehen
- Benutzer muss in der Lage sein, bei Fehlern (Timeout, API-Fehler) eine aussagekräftige Fehlermeldung zu erhalten

**Status:**  Implementiert  
**Traceability:** MK-1, SK-2

---

### FA-04: Dokument-Upload für Kontext-Anreicherung
**Priorität:** SOLL  
**Beschreibung:** Benutzer können Anforderungsdokumente hochladen, deren Inhalt zur Verbesserung der Testfall-Generierung genutzt wird.

**Akzeptanzkriterien:**
- Benutzer muss in der Lage sein, .docx (Microsoft Word) und .txt (Plain Text) Dateien hochzuladen
- Benutzer muss in der Lage sein, Dateien per Drag & Drop oder File-Picker-Dialog hochzuladen
- Benutzer kann bis zu 5 Dateien gleichzeitig hochladen
- Benutzer kann Dateien bis zu 50 MB Größe hochladen
- Benutzer muss in der Lage sein, hochgeladene Dateien in einer Liste zu sehen
- Benutzer muss in der Lage sein, einzelne Dateien vor Generierung zu entfernen
- System muss automatisch Text aus hochgeladenen Dokumenten extrahieren (Mammoth.js für .docx)
- System muss extrahierten Text in den LLM-Prompt integrieren

**Status:**  Implementiert  
**Traceability:** SK-1

---

### FA-05: Re-Generierung mit Testfall-Analyse
**Priorität:** SOLL  
**Beschreibung:** System analysiert bereits generierte Testfälle und erzeugt zusätzliche Tests zur Schließung von Testfall-Lücken.

**Akzeptanzkriterien:**
- Benutzer muss in der Lage sein, nach erster Generierung einen "Re-Generieren"-Button zu sehen
- Benutzer muss in der Lage sein, durch Klick auf "Re-Generieren" zusätzliche Testfälle zu erhalten
- System muss bisherige Testfälle an LLM senden mit Instruktion "Analysiere Lücken, generiere neue Tests"
- Benutzer muss in der Lage sein, neue Testfälle zu erhalten, die unterschiedlich zu bestehenden sind
- Benutzer soll mindestens 2x mehr Tests als vorher erhalten (z.B. 5 → 12)
- System muss Duplikate vermeiden (Ähnlichkeitsschwelle: 80%)

**Status:**  Implementiert  
**Traceability:** SK-3

---

## 2.3. Projekt- und Testfall-Verwaltung

### FA-06: Projekt-Erstellung und -Verwaltung
**Priorität:** MUSS  
**Beschreibung:** Benutzer können Projekte als Organisationseinheiten für Testfälle erstellen und verwalten.

**Akzeptanzkriterien:**
- Benutzer muss in der Lage sein, durch Klick auf "Neues Projekt" einen Eingabe-Dialog zu öffnen
- Benutzer muss in der Lage sein, einen Projektnamen einzugeben (max. 100 Zeichen)
- System muss validieren, dass Name nicht leer ist und nicht bereits existiert
- Benutzer muss in der Lage sein, das neue Projekt sofort in der Sidebar zu sehen
- Benutzer kann "Hauptseite" als Standard-Projekt nutzen, das nicht gelöscht werden kann
- Benutzer muss in der Lage sein, Projekte über einen Löschen-Button mit Bestätigungsdialog zu entfernen
- System muss beim Löschen eines Projekts alle zugehörigen User Stories und Testfälle entfernen (CASCADE)

**Status:**  Implementiert  
**Traceability:** MK-4

---

### FA-07: Projekt-Umbenennung
**Priorität:** SOLL  
**Beschreibung:** Benutzer können Projektnamen nachträglich ändern.

**Akzeptanzkriterien:**
- Beim Hover über ein Projekt wird dem Benutzer ein "Umbenennen"-Icon (Stift) angezeigt
- Der Benutzer kann durch Klick auf das Icon ein Modal mit vorausgefülltem Textfeld öffnen
- Das System validiert, dass der neue Name weder leer ist noch bereits existiert
- Die Umbenennung der "Hauptseite" ist nicht möglich (System-Schutz)
- Die Namensänderung wird dem Benutzer sofort in der UI angezeigt
- Die Ordnerstruktur im Backend wird automatisch aktualisiert (`data/{old_name}` → `data/{new_name}`)

**Status:**  Implementiert  
**Traceability:** SK-4

---

### FA-08: Testfall-Persistierung
**Priorität:** MUSS  
**Beschreibung:** Benutzer können ausgewählte Testfälle speichern und Projekten zuordnen.

**Akzeptanzkriterien:**
- Der Benutzer wählt Testfälle über Checkboxen aus
- Der Button "Ausgewählte merken" speichert die markierten Testfälle
- Der Button "Alle merken" speichert alle Testfälle der aktuellen User Story
- Das Ziel-Projekt kann der Benutzer über ein Dropdown auswählen (Standard: "Hauptseite")
- Gespeicherte Testfälle sind sofort in der TestPlan-Ansicht sichtbar
- Eine Toast-Benachrichtigung informiert den Benutzer: "X Testfälle gespeichert"
- Die Testfälle werden im Backend persistiert (JSON-Dateien)

**Status:**  Implementiert  
**Traceability:** MK-5

---

### FA-09: Testfall-Inline-Editing
**Priorität:** MUSS  
**Beschreibung:** Benutzer können gespeicherte Testfälle direkt in der TestPlan-Ansicht bearbeiten.

**Akzeptanzkriterien:**
- Der "Bearbeiten"-Button (Stift-Icon) aktiviert den Bearbeitungsmodus für den Benutzer
- Im Bearbeitungsmodus kann der Benutzer folgende Felder ändern:
  - Titel (Textfeld)
  - Beschreibung (Textarea)
  - Vorbedingungen (editierbare Liste - Hinzufügen/Entfernen/Ändern)
  - Schritte (editierbare Liste - Hinzufügen/Entfernen/Ändern)
  - Erwartetes Ergebnis (Textarea)
  - Priorität (Dropdown: High/Medium/Low)
- Der "Speichern"-Button (Häkchen) sichert die Änderungen des Benutzers
- Der "Abbrechen"-Button (X) verwirft alle Änderungen
- Beim Speichern aktualisiert das System das Backend (PUT-Request)
- Beim Abbrechen wird die UI auf den ursprünglichen Zustand zurückgesetzt

**Status:**  Implementiert  
**Traceability:** MK-7

---

### FA-10: Testfall-Löschung
**Priorität:** MUSS  
**Beschreibung:** Benutzer können einzelne Testfälle, User Stories oder ganze Projekte löschen.

**Akzeptanzkriterien:**
- Das Mülleimer-Icon ermöglicht dem Benutzer das Löschen eines Testfalls
- Der Button im User Story Header löscht die gesamte User Story
- Der Button in der Sidebar löscht das ausgewählte Projekt
- Vor jeder Löschung erscheint ein Custom Confirmation Dialog (Ton: "danger")
- Der Bestätigungstext zeigt dem Benutzer die Konsequenzen (z.B. "10 Testfälle werden gelöscht")
- Nach erfolgreicher Löschung erhält der Benutzer eine Toast-Benachrichtigung
- Beim Löschen einer User Story werden alle zugehörigen Testfälle automatisch entfernt (CASCADE)
- Beim Löschen eines Projekts werden alle User Stories und Testfälle automatisch entfernt (CASCADE)

**Status:**  Implementiert  
**Traceability:** MK-8, SK-6

---

### FA-11: Expand/Collapse-Steuerung
**Priorität:** SOLL  
**Beschreibung:** Benutzer können alle User Stories in einem Projekt gleichzeitig auf- oder zuklappen.

**Akzeptanzkriterien:**
- Die Toolbar zeigt dem Benutzer die Buttons "Alle ausklappen" und "Alle einklappen"
- Ein Klick auf "Alle ausklappen" expandiert alle User Stories im aktuellen Projekt
- Ein Klick auf "Alle einklappen" kollabiert alle User Stories im aktuellen Projekt
- Visuelles Feedback erfolgt durch Icons: ▼ für expandiert, ▶ für kollabiert

**Status:**  Implementiert  
**Traceability:** SK-5

---

## 2.4. Export und Integration

### FA-12: Excel-Export (XLSX)
**Priorität:** MUSS  
**Beschreibung:** Benutzer können Testfälle einer User Story als Excel-Datei herunterladen.

**Akzeptanzkriterien:**
- Der Export-Button (Download-Icon) startet den Excel-Export für die User Story
- Die Excel-Datei (.xlsx) enthält folgende Spalten:
  - Test Case ID (z.B. "TC-001")
  - Title
  - Description
  - Preconditions (durch Semikolon getrennt)
  - Test Steps (nummeriert, durch Newline getrennt)
  - Expected Result
  - Priority
  - User Story (Titel der User Story)
- Umlaute und Sonderzeichen werden korrekt dargestellt (UTF-8-Kodierung)
- Der Dateiname ist aussagekräftig: `{UserStory-Titel}_TestCases_{Datum}.xlsx`
- Der Browser-Download startet automatisch

**Status:**  Implementiert  
**Traceability:** MK-9

---

## 2.5. Benutzer-Feedback und Dialoge

### FA-13: Custom Confirmation Dialogs
**Priorität:** SOLL  
**Beschreibung:** System verwendet benutzerdefinierte Bestätigungsdialoge statt Browser-Standard-Alerts.

**Akzeptanzkriterien:**
- Bei kritischen Aktionen (Löschen) sieht der Benutzer einen modernen Custom Dialog
- Der Dialog lässt sich per Tastatur bedienen: Escape = Cancel, Enter = Confirm
- Die Ton-Variante "danger" (rot) kennzeichnet Löschungen visuell
- Klare Bestätigungstexte und Button-Labels führen den Benutzer
- Der Cancel-Button wird automatisch fokussiert, um Fehlbedienungen zu vermeiden

**Status:**  Implementiert  
**Traceability:** SK-6

---

### FA-14: Toast-Benachrichtigungen
**Priorität:** SOLL  
**Beschreibung:** System zeigt nicht-invasive Feedback-Messages für Benutzeraktionen.

**Akzeptanzkriterien:**
- Toast-Benachrichtigungen erscheinen für den Benutzer in der Bildschirmecke
- Die Toasts verschwinden nach 3-5 Sekunden automatisch
- Farbcodierung unterscheidet die Typen: Success (grün), Error (rot), Info (blau)
- Aussagekräftige Nachrichten informieren den Benutzer (z.B. "Testfälle gespeichert", "Projekt gelöscht")

**Status:**  Implementiert  
**Traceability:** SK-7

---

## 2.6. Zusammenfassung Funktionale Anforderungen

| **Kategorie** | **Anzahl** | **Status** |
|---------------|------------|------------|
| **UI & Navigation** | 2 |  Vollständig |
| **Testfall-Generierung** | 3 |  Vollständig |
| **Verwaltung** | 6 |  Vollständig |
| **Export** | 1 |  Vollständig |
| **Benutzer-Feedback** | 2 |  Vollständig |
| **SUMME** | **14** | **100% implementiert** |

---

# 3. Nicht-Funktionale Anforderungen

Die nicht-funktionalen Anforderungen beschreiben **WIE** das System arbeiten soll - Qualitätskriterien, Performance, Sicherheit, Usability. Alle hier aufgeführten Anforderungen sind **vollständig implementiert** oder **erfüllt**.

## 3.1. Performance und Skalierbarkeit

### NFA-01: Ladezeit der Anwendung
**Priorität:** MUSS  
**Beschreibung:** Die Anwendung muss schnell laden und responsiv sein.

**Messbare Kriterien:**
- Benutzer muss in der Lage sein, das Frontend innerhalb von < 2 Sekunden zu sehen (First Contentful Paint)
- Benutzer muss in der Lage sein, das Dashboard innerhalb von < 1 Sekunde nach Login zu sehen
- Benutzer muss in der Lage sein, die TestPlan-Ansicht innerhalb von < 2 Sekunden zu laden (bei 100 User Stories)

**Testmethode:**
- Lighthouse Performance-Score: > 90
- Network Throttling: Slow 3G
- Messung mit Chrome DevTools Performance Tab

**Status:**  Erfüllt (Vite Build-Optimierung, Code-Splitting)

---

### NFA-02: Testfall-Generierungszeit
**Priorität:** MUSS  
**Beschreibung:** Die KI-gestützte Testfall-Generierung muss performant sein.

**Messbare Kriterien:**
- Benutzer muss in der Lage sein, Kompakt-Modus (3-5 Tests) innerhalb von < 10 Sekunden abgeschlossen zu sehen (90. Perzentil)
- Benutzer muss in der Lage sein, Umfassend-Modus (15-40 Tests) innerhalb von < 30 Sekunden abgeschlossen zu sehen (90. Perzentil)
- Benutzer muss in der Lage sein, Re-Generierung innerhalb von < 25 Sekunden abgeschlossen zu sehen
- System muss nach 60 Sekunden Timeout mit Fehler und Retry-Option reagieren

**Abhängigkeiten:**
- OpenAI API Response Time (nicht direkt beeinflussbar)
- Netzwerklatenz (minimiert durch Async-Requests)

**Status:**  Erfüllt (durchschnittlich 8-15 Sekunden)

---

### NFA-03: Aktualisierungszeit bei Benutzeraktionen
**Priorität:** SOLL  
**Beschreibung:** Änderungen müssen für Benutzer sofort sichtbar sein.

**Messbare Kriterien:**
- Benutzer muss in der Lage sein, Änderungen nach Klick auf "Speichern" innerhalb von < 1 Sekunde zu sehen
- Benutzer muss in der Lage sein, beim Projekt-Wechsel die neuen Inhalte innerhalb von < 2 Sekunden zu sehen
- Benutzer muss in der Lage sein, aktualisierte Daten ohne Seiten-Reload zu sehen (Echtzeit-Updates)

**Status:**  Erfüllt (Echtzeit-Updates in UI via React State)

---

### NFA-04: Skalierbarkeit
**Priorität:** SOLL  
**Beschreibung:** System muss mit wachsender Datenmenge skalieren.

**Messbare Kriterien:**
- System muss in der Lage sein, min. 100 Projekte ohne Performance-Degradation zu verwalten
- System muss in der Lage sein, min. 500 User Stories pro Projekt zu verwalten
- System muss in der Lage sein, min. 50 Testfälle pro User Story zu verwalten
- System muss in der Lage sein, insgesamt min. 10.000 Testfälle zu verwalten
- Benutzer muss in der Lage sein, die UI innerhalb von < 3 Sekunden zu laden (bei 500 User Stories)

**Limitierungen (Prototyp):**
- JSON-basierte Speicherung (geplante Migration zu PostgreSQL für Produktionsumgebung)
- Keine Paginierung implementiert (alle User Stories werden geladen)

**Status:**  Teilweise erfüllt (Prototyp-Skalierung ausreichend, Produktions-Skalierung benötigt DB)

---

## 3.2. Usability und Benutzererfahrung

### NFA-05: Benutzerfreundlichkeit und Klarheit
**Priorität:** MUSS  
**Beschreibung:** Die Informationen müssen benutzerfreundlich und klar strukturiert dargestellt werden.

**Messbare Kriterien:**
- Benutzer muss in der Lage sein, Dashboard/TestPlan ohne Anleitung zu finden (90% in < 30 Sekunden bei User-Tests)
- Benutzer muss in der Lage sein, selbsterklärende Button-Beschriftungen zu sehen (kein Icon ohne Tooltip)
- Benutzer muss in der Lage sein, die Hierarchie zu erkennen (Projekt → User Story → Testfall)
- Benutzer muss in der Lage sein, ausreichende Abstände zwischen UI-Elementen zu sehen (min. 16px)
- Benutzer muss in der Lage sein, Prioritäten farblich zu unterscheiden (High=Rot, Medium=Gelb, Low=Grün)

**Status:**  Erfüllt (Moderne UI mit klarer Informationsarchitektur)

---

### NFA-06: Navigation
**Priorität:** SOLL  
**Beschreibung:** Die Navigationsfunktionen müssen intuitiv bedienbar sein.

**Messbare Kriterien:**
- Benutzer muss in der Lage sein, alle Hauptfunktionen via Tastatur (Tab/Enter) zu erreichen
- Benutzer muss in der Lage sein, die Anwendung auf Tablets/Smartphones zu nutzen (Responsive Design, min. 360px Breite)
- Benutzer muss in der Lage sein, den aktuellen Kontext zu erkennen (z.B. "Projekt: Demo → User Story: Login")
- Benutzer muss in der Lage sein, den Browser-Back-Button wie erwartet zu nutzen (kein SPA-Routing-Fehler)

**Status:**  Erfüllt (Keyboard-Support, Responsive Design)

---

### NFA-07: Benutzerfreundliches Feedback
**Priorität:** MUSS  
**Beschreibung:** System muss klares, verständliches Feedback zu Benutzeraktionen geben.

**Messbare Kriterien:**
- Benutzer muss in der Lage sein, nach erfolgreichen Aktionen (Speichern, Löschen, Export) Toast-Benachrichtigungen zu sehen (3-5s)
- Benutzer muss in der Lage sein, bei längeren Operationen (Generierung, Speichern) Loading-Indikatoren zu sehen
- Benutzer muss in der Lage sein, spezifische und hilfreiche Fehlermeldungen zu erhalten (z.B. "Netzwerkfehler, bitte erneut versuchen" statt "Error 500")
- Benutzer muss in der Lage sein, Custom Dialogs statt Browser-Alerts zu sehen (modernes Design, Keyboard-Support)
- Benutzer muss in der Lage sein, Hover-Tooltips bei Icons ohne Label zu sehen (z.B. "Bearbeiten", "Löschen")

**Status:**  Erfüllt (Toast, Custom Dialogs, Loading-Spinner implementiert)

---

### NFA-08: Accessibility (Barrierefreiheit)
**Priorität:** SOLL  
**Beschreibung:** Anwendung muss für Benutzer mit Einschränkungen zugänglich sein.

**Messbare Kriterien (WCAG 2.1 Level AA):**
- Benutzer muss in der Lage sein, ausreichenden Kontrast zwischen Text und Hintergrund zu sehen (min. 4.5:1)
- Benutzer muss in der Lage sein, alle Funktionen via Tastatur zu erreichen
- Screen-Reader-Benutzer müssen in der Lage sein, semantisches HTML zu nutzen (h1-h6, nav, main, aside, aria-labels)
- Benutzer muss in der Lage sein, deutlich sichtbare Fokus-Indikatoren bei Keyboard-Navigation zu sehen
- Benutzer muss in der Lage sein, Alt-Texte für alle informativen Icons/Bilder zu erhalten
- Screen-Reader-Benutzer müssen in der Lage sein, Fehlermeldungen vorgelesen zu bekommen

**Status:**  Teilweise erfüllt (Keyboard-Navigation , Semantisches HTML , ARIA-Labels teilweise, Kontrast-Optimierung ausstehend)

---

## 3.3. Zuverlässigkeit und Verfügbarkeit

### NFA-09: Datenintegrität beim Löschen
**Priorität:** SOLL  
**Beschreibung:** Der Löschprozess muss sicherstellen, dass alle Verknüpfungen bereinigt sind.

**Messbare Kriterien:**
- System muss beim Löschen eines Projekts alle User Stories und Testfälle entfernen (CASCADE)
- System muss verhindern, dass verwaiste Testfälle (ohne User Story) oder User Stories (ohne Projekt) existieren
- Benutzer muss in der Lage sein, vor Löschung über Konsequenzen informiert zu werden (z.B. "10 Testfälle werden gelöscht")
- System muss Löschungen unwiderruflich durchführen (keine Undo-Funktion)

**Status:**  Erfüllt (CASCADE-Logik im Backend)

---

### NFA-10: Systemverfügbarkeit
**Priorität:** SOLL  
**Beschreibung:** System muss während der Arbeitszeiten zuverlässig verfügbar sein.

**Messbare Kriterien:**
- System muss eine Uptime von 99% erreichen (akademisches Projekt, kein SLA erforderlich)
- Benutzer müssen in der Lage sein, bei OpenAI API-Ausfall eine verständliche Fehlermeldung mit Retry-Option zu sehen
- System muss Graceful Degradation bieten: Frontend funktioniert ohne Backend (nur mit Fehlermeldung, kein Crash)

**Status:**  Erfüllt (Docker-basiertes Deployment, Fehlerbehandlung implementiert)

---

### NFA-11: Fehlerbehandlung
**Priorität:** MUSS  
**Beschreibung:** System muss Fehler robust behandeln und Benutzer angemessen informieren.

**Fehlerszenarien:**
- Benutzer muss in der Lage sein, bei OpenAI API Timeout folgende Meldung zu sehen: "Generierung dauerte zu lange. Bitte erneut versuchen."
- Benutzer muss in der Lage sein, bei Netzwerkfehler folgende Meldung zu sehen: "Verbindung zum Server fehlgeschlagen. Prüfen Sie Ihre Internetverbindung."
- Benutzer muss in der Lage sein, bei ungültiger User Story folgende Meldung zu sehen: "Bitte füllen Sie Titel und Beschreibung aus."
- Benutzer muss in der Lage sein, bei Speicherfehler folgende Meldung zu sehen: "Testfälle konnten nicht gespeichert werden. Bitte erneut versuchen."
- Benutzer muss in der Lage sein, bei zu großer Datei folgende Meldung zu sehen: "Datei ist zu groß (max. 50 MB)."

**Logging:**
- Backend-Logs (uvicorn.log) mit Zeitstempel, Level (INFO/WARNING/ERROR), Nachricht
- Frontend-Logs in Browser-Console (nur Development)

**Status:**  Erfüllt (Try-Catch-Blöcke, Toast-Fehlermeldungen, Backend-Logging)

---

## 3.4. Sicherheit

### NFA-12: Datensicherheit
**Priorität:** MUSS  
**Beschreibung:** Benutzerdaten und Testfälle müssen vor unbefugtem Zugriff geschützt sein.

**Messbare Kriterien:**
- System muss OpenAI API-Key nur im Backend speichern (Umgebungsvariable `.env`), nicht im Frontend
- System muss alle Benutzereingaben serverseitig validieren (Pydantic)
- System muss XSS-Angriffe verhindern: React escapet HTML automatisch, kein `dangerouslySetInnerHTML`
- System muss restriktive CORS-Policy anwenden (nur erlaubte Origins: localhost:3000, localhost:5173, localhost:80)

**Status:**  Erfüllt (Best Practices implementiert)

---

### NFA-13: Input-Validierung
**Priorität:** MUSS  
**Beschreibung:** Alle Benutzereingaben müssen validiert werden.

**Messbare Kriterien:**
- Benutzer muss in der Lage sein, bei leeren Pflichtfeldern eine Validierungsmeldung zu erhalten
- System muss Projektnamen auf Eindeutigkeit prüfen
- System muss Dateigrößen auf max. 50 MB begrenzen
- System muss Datei-Typen validieren (nur .docx, .txt)

**Status:**  Erfüllt (Frontend + Backend Validierung)

---

## 3.5. Wartbarkeit und Erweiterbarkeit

### NFA-14: Code-Qualität
**Priorität:** SOLL  
**Beschreibung:** Code muss lesbar, dokumentiert und Best Practices folgen.

**Messbare Kriterien:**
- Entwickler müssen in der Lage sein, Python-Code gemäß PEP 8 Style Guide zu lesen (flake8, black Formatter)
- Entwickler müssen in der Lage sein, JavaScript-Code mit ESLint und React-Plugin zu lesen
- Entwickler müssen in der Lage sein, Docstrings bei allen Funktionen/Klassen zu finden (Python)
- Entwickler müssen in der Lage sein, Kommentare bei komplexer Logik zu finden (z.B. Deduplication-Algorithmus)
- Entwickler müssen in der Lage sein, sprechende Variablen-/Funktionsnamen zu sehen (z.B. `generate_test_cases` statt `gtc`)

**Status:**  Erfüllt (Linter konfiguriert, Docstrings vorhanden)

---

### NFA-15: Modulare Architektur
**Priorität:** SOLL  
**Beschreibung:** Entwickler müssen in der Lage sein, externe Module zu integrieren, ohne Grundfunktionalität zu beeinträchtigen.

**Messbare Kriterien:**
- Entwickler müssen in der Lage sein, Services (LLMService, StorageService, DocumentService) auszutauschen
- Entwickler müssen in der Lage sein, Services über Konstruktor zu injizieren (Dependency Injection, testbar)
- Entwickler müssen in der Lage sein, API-Versionierung zu nutzen (z.B. `/api/v1/...`)
- Entwickler müssen in der Lage sein, LLMService um weitere Modelle zu erweitern (Claude, Llama)

**Status:**  Erfüllt (Service-Architektur, vorbereitet für Multi-Model-Support)

---

### NFA-16: Versionierung
**Priorität:** MUSS  
**Beschreibung:** Code muss versioniert sein und Änderungen müssen nachvollziehbar sein.

**Messbare Kriterien:**
- Entwickler müssen in der Lage sein, Git zur Versionskontrolle zu nutzen (GitHub)
- Entwickler müssen in der Lage sein, Branching-Strategie zu folgen: Main-Branch (stable), Feature-Branches für neue Features
- Entwickler müssen in der Lage sein, aussagekräftige Commit-Messages zu schreiben (z.B. "feat: Add custom confirmation dialogs")
- Entwickler müssen in der Lage sein, Semantic Versioning zu nutzen (v1.0.0, v1.1.0, etc.)

**Status:**  Erfüllt (GitHub-Repository vorhanden)

---

## 3.6. Zusammenfassung Nicht-Funktionale Anforderungen

| **Kategorie** | **Anzahl** | **Status** |
|---------------|------------|------------|
| **Performance** | 4 |  3 vollständig,  1 teilweise |
| **Usability** | 4 |  3 vollständig,  1 teilweise |
| **Zuverlässigkeit** | 3 |  Vollständig |
| **Sicherheit** | 2 |  Vollständig |
| **Wartbarkeit** | 3 |  Vollständig |
| **SUMME** | **16** | **88% vollständig, 12% teilweise** |

---

## 4. Implementierungsstand (Stand 26.12.2025)

Dieses Kapitel fasst den tatsächlich implementierten Funktionsumfang des Prototyps zusammen und ordnet ihn den zuvor beschriebenen Anforderungen zu.

### 4.1 Frontend‑Oberfläche und Design

- **Dark Theme umgesetzt**: Die komplette Anwendung (Dashboard und Testplan‑Ansicht) nutzt ein durchgängiges dunkles Farbschema mit Verlaufshintergrund und glasigen Karten (Glassmorphism).
- **Header mit Logo**: Der Header ist sticky, besitzt eine klare optische Trennung zum Inhalt (Schatten + Abstand) und zeigt ein zentriertes Projekt‑Logo, das per CSS (`background-image`) eingebunden und mit sanften Glow‑Schatten versehen ist.
- **Dashboard‑Layout**: Eingabeformular, Beispiele, Statusmeldungen und generierte Testfälle sind in klar abgegrenzten Karten strukturiert, mit konsistenter Typografie, Buttons und Abständen.
- **Testplan‑Layout angeglichen**: Die Testplan‑Seite wurde vollständig an das Dark Theme angepasst (Karten, Listen, Seitenspalte, Hilfeblöcke, Dropdown‑Bereich) und wirkt nun visuell konsistent zum Dashboard.

### 4.2 Accessibility und Lesbarkeit

- **Kontrast & Farben (NFA‑Usability)**: Texte wurden auf helle Farben (#f1f5f9, #e2e8f0, #cbd5e1) umgestellt, Hintergründe auf dunkle Blautöne, so dass die Kontraste überwiegend WCAG 2.1‑Level AA entsprechen.
- **Mindest‑Schriftgrößen**: Grundschriftgröße wurde auf mindestens 16 px gesetzt; Fließtexte in Dashboard und Testplan sind für ältere oder sehschwache Nutzer gut lesbar.
- **Fokus‑Darstellung**: Für interaktive Elemente (Buttons, Links, Checkboxen) wurde ein deutlich sichtbarer `:focus-visible`‑Rahmen (`outline`) ergänzt, sodass Tastaturnavigation möglich ist.
- **Checkbox‑Benutzbarkeit**: Checkboxen wurden vergrößert und mit klarer Farbgebung versehen, um sie leichter anklickbar und besser erkennbar zu machen.

### 4.3 KI‑Logik und Backend‑Verhalten

- **Sprachkonsistenz**: Die LLM‑Prompts wurden so angepasst, dass Testfälle immer in derselben Sprache wie die User Story generiert werden (z.B. deutsch‑deutsch, englisch‑englisch).
- **Stabile Nummerierung**: Die TC‑IDs im Titel folgen einem durchgängigen Schema (z.B. `TC-1`, `TC-2`, …); die Nummerierung erfolgt nach dem Filtern/Sortieren, wodurch Lücken vermieden werden.
- **Filterung irrelevanter Testfälle**: Der LLM‑Service entfernt überflüssige/irrelevante Einträge und setzt fehlende Typen standardmäßig auf „functional“, um konsistente Datenmodelle sicherzustellen.
- **CORS & API‑Robustheit**: Für die verwendeten Endpunkte wurden OPTIONS‑Routen ergänzt, sodass Browser‑Preflight‑Anfragen sauber beantwortet werden und die SPA stabil mit dem Backend kommuniziert.

### 4.4 Testfall‑Verwaltung und Testplan

- **Dashboard‑Generierung (MK‑1, MK‑2)**: User Stories können über das Dashboard erfasst werden; die KI generiert strukturierte Testfälle mit Titel, Beschreibung, Vorbedingungen, Schritten, erwarteten Ergebnissen und Priorität.
- **Testplan‑Verwaltung**: Generierte Testfälle können in den Testplan übernommen, dort gruppiert, bearbeitet (Titel, Beschreibung, Vorbedingungen, Schritte, erwartete Ergebnisse, Priorität) und projektspezifisch organisiert werden.
- **Nummerierung im UI**: Zusätzlich zur TC‑ID im Titel werden Testfälle im UI mit einer fortlaufenden Nummer (`#1`, `#2`, …) angezeigt, um die Orientierung bei großen Listen zu erleichtern.
- **Hilfebereiche**: Die Testplan‑Seite enthält erklärende Hilfetexte („So funktioniert’s“), die den Workflow „User Story auswählen → Testfälle übernehmen“ für Endnutzer transparent machen.

### 4.5 Abgleich mit Anforderungen

- Die definierten Muss‑Kriterien (MK‑1 ff.) sind mit der aktuellen Implementierung erfüllt; insbesondere die KI‑basierte Testfall‑Generierung, das Dashboard‑Eingabeformular und die Testplan‑Verwaltung sind produktiv nutzbar.
- Die zuvor nur „angestrebten“ Usability‑ und Accessibility‑Anforderungen (Dark Theme, Kontrast, Fokus‑Zustände) sind nun konkret umgesetzt und verbessern die Erfüllung der nicht‑funktionalen Anforderungen im Bereich Usability.
- Offene Punkte betreffen vor allem optionale Erweiterungen (z.B. zukünftige Keyboard‑Shortcuts, Autosave, Migration zu relationaler Datenbank) und sind im SRS weiterhin als „geplant“ bzw. „teilweise erfüllt“ gekennzeichnet.

---

**Ende Abschnitt 2 (Funktionale Anforderungen) und 3 (Nicht-Funktionale Anforderungen)**

---

*Hinweis: Dieses SRS-Dokument repräsentiert den finalen Stand des implementierten Systems. Alle aufgeführten Anforderungen sind entweder vollständig implementiert () oder teilweise erfüllt mit klarem Hinweis auf Limitierungen ().*

