# Projektstruktur – Alle Dateien erklärt

---

## Backend

### `backend/app/main.py`
Startet die FastAPI-Anwendung. Hier wird CORS konfiguriert, damit das Frontend (andere Domain/Port) auf die API zugreifen darf. Beim Start werden die Services (LLM, Storage) initialisiert.

### `backend/app/api/routes.py`
Enthält alle API-Endpunkte. Jeder Endpunkt ist eine Funktion mit einem Decorator wie `@router.post("/generate-test-cases")`. Hier wird definiert, was passiert wenn das Frontend einen Request schickt.

### `backend/app/models/schemas.py`
Pydantic-Modelle für Datenvalidierung. Wenn ein Request reinkommt, prüft Pydantic automatisch ob die Daten korrekt sind. Zum Beispiel: Hat der Request ein `user_story` Feld? Ist es ein String? Falls nicht → 422 Fehler.

### `backend/app/services/llm_service.py`
Die Kernlogik für KI-Testfall-Generierung. Dieser Service:
- Baut den Prompt aus der User Story
- Schickt den Prompt an OpenAI GPT-4
- Parst die JSON-Antwort zu Testfall-Objekten
- Filtert Duplikate und irrelevante Testfälle raus

### `backend/app/services/storage_service.py`
Speichert und lädt Daten über die PostgreSQL-Datenbank. Der Service verwendet SQLAlchemy ORM und bietet Methoden für:
- Projekte erstellen/löschen/umbenennen
- User Stories speichern/laden
- Testfälle verwalten
- Staging (gemerkte Testfälle) verwalten

### `backend/app/database.py`
Datenbank-Konfiguration und SQLAlchemy-Modelle. Definiert:
- Verbindung zur PostgreSQL-Datenbank
- Tabellen: `projects`, `user_stories`, `test_cases`, `staging_testcases`
- `init_db()` Funktion zum Erstellen der Tabellen beim Start

### `backend/app/__init__.py`
Leere Datei mit nur einem Kommentar. Macht den Ordner `app` zu einem Python-Paket. Ohne diese Datei würde `from app.services import ...` nicht funktionieren.

### `backend/app/api/__init__.py`
Paketmarker für den `api` Ordner. Ermöglicht Imports wie `from app.api.routes import router`.

### `backend/app/models/__init__.py`
Paketmarker für den `models` Ordner. Ermöglicht Imports wie `from app.models.schemas import TestCase`.

### `backend/app/services/__init__.py`
Paketmarker für den `services` Ordner. Ermöglicht Imports wie `from app.services.llm_service import LLMService`.

### `backend/run_server.py`
Kleines Startskript für lokale Entwicklung. Startet uvicorn (den Python-Webserver) mit der FastAPI-App. Alternativ kann man auch `uvicorn app.main:app --reload` direkt ausführen.

### `backend/tests/__init__.py`
Paketmarker für den `tests` Ordner. Ermöglicht pytest, die Tests korrekt zu finden und auszuführen.

### `backend/tests/test_api.py`
Automatisierte Tests mit pytest. Testet ob die API-Endpunkte korrekt funktionieren: Health-Check, Testfall-Generierung, Fehlerbehandlung bei ungültigen Eingaben.

### `backend/requirements.txt`
Liste aller Python-Pakete die installiert werden müssen. Enthält FastAPI, uvicorn, openai, pydantic, python-dotenv etc. Wird mit `pip install -r requirements.txt` installiert.

### `backend/Dockerfile`
Bauanleitung für das Docker-Image (Production). Definiert welches Base-Image verwendet wird, kopiert den Code rein, installiert Dependencies und startet den Server.

### `backend/Dockerfile.dev`
Bauanleitung für das Docker-Image (Development). Ähnlich wie Production, aber mit Hot-Reload aktiviert – Änderungen am Code werden automatisch neu geladen.

### `backend/.env`
Umgebungsvariablen wie der OpenAI API-Key. Diese Datei ist in `.gitignore` und wird NICHT zu GitHub gepusht (Sicherheit!).

### `backend/.env.example`
Vorlage für die `.env` Datei. Zeigt welche Variablen benötigt werden, aber ohne echte Werte. Neue Entwickler kopieren diese Datei zu `.env` und tragen ihre Keys ein.

---

## Frontend

### `frontend/src/main.jsx`
Einstiegspunkt der React-App. Hier wird die App-Komponente ins HTML-Element mit id="root" gerendert. Nur 10 Zeilen – importiert React und rendert `<App />`.

### `frontend/src/App.jsx`
Root-Komponente der Anwendung. Verwaltet den State für die aktuelle Ansicht (Dashboard oder TestPlan) und das aktive Projekt. Wechselt zwischen den beiden Hauptansichten.

### `frontend/src/App.css`
Globale CSS-Styles für die gesamte Anwendung. Enthält das Farbschema, Layout-Grundlagen, Buttons, Inputs und Dark/Light Mode Variablen.

### `frontend/src/components/Dashboard.jsx`
Die Hauptseite zum Generieren von Testfällen. Funktionen:
- Eingabefelder für User Story (Titel, Beschreibung, Akzeptanzkriterien)
- Dokumenten-Upload (Drag & Drop) für TXT und DOCX
- Extrahiert Text aus hochgeladenen Dokumenten mit mammoth.js
- Ruft die Generate-API auf und zeigt die Ergebnisse
- Ermöglicht Auswahl und Speichern von Testfällen

### `frontend/src/components/TestPlan.jsx`
Die Projektverwaltungsseite. Funktionen:
- Liste aller Projekte anzeigen
- Neues Projekt erstellen
- User Stories pro Projekt anzeigen
- Testfälle einer User Story anzeigen und bearbeiten
- CSV-Export
- Projekte und User Stories löschen

### `frontend/src/components/TestCaseCard.jsx`
Zeigt einen einzelnen Testfall als Karte an. Enthält Titel, Beschreibung, Schritte, erwartetes Ergebnis, Priorität. Kann bearbeitet werden (Inline-Editing).

### `frontend/src/components/TestCaseCard.css`
Styles speziell für die Testfall-Karten. Definiert das Aussehen der Karten, Farben für Prioritäten, Hover-Effekte.

### `frontend/src/components/ConfirmDialog.jsx`
Ein wiederverwendbarer Bestätigungsdialog. Wird angezeigt bei kritischen Aktionen wie "Projekt löschen" oder "User Story löschen". Zeigt "Abbrechen" und "Bestätigen" Buttons.

### `frontend/src/components/TestPlan.css`
Styles für die Projektverwaltungsseite. Layout für Projektliste, User Story Liste, Testfall-Tabellen.

### `frontend/src/components/ThemeToggle.jsx`
Ein Schalter zum Wechseln zwischen Dark Mode und Light Mode. Speichert die Präferenz im localStorage, damit sie beim nächsten Besuch erhalten bleibt.

### `frontend/src/components/ThemeToggle.css`
Styles für den Theme-Schalter. Animierter Toggle-Button mit Sonne/Mond Icon.

### `frontend/src/components/Toast.jsx`
Zeigt kurze Benachrichtigungen an (z.B. "Testfall gespeichert", "Datei hochgeladen"). Verschwindet automatisch nach ein paar Sekunden.

### `frontend/src/services/api.js`
HTTP-Client für die Backend-Kommunikation. Verwendet Axios. Enthält Funktionen wie:
- `generateTestCases()` – Testfälle generieren
- `adoptTestCases()` – Testfälle speichern
- `exportTestcasesCsv()` – CSV exportieren
- `getStaging()` – Zwischenspeicher abrufen
- `healthCheck()` – Backend-Status prüfen

### `frontend/index.html`
Die HTML-Basis der Anwendung. Enthält nur ein `<div id="root">` – React rendert die gesamte App dort hinein.

### `frontend/vite.config.js`
Konfiguration für Vite (Build-Tool). Definiert den Dev-Server Port, Proxy-Einstellungen für API-Calls, und Build-Optionen.

### `frontend/package.json`
NPM-Konfiguration. Enthält Projektname, Version, Scripts (dev, build, preview) und alle Dependencies (React, Axios, mammoth.js, xlsx).

### `frontend/package-lock.json`
Automatisch generiert von NPM. Speichert die exakten Versionen aller Dependencies. Stellt sicher dass alle Entwickler die gleichen Versionen nutzen.

### `frontend/Dockerfile`
Bauanleitung für das Frontend Docker-Image (Production). Baut die React-App und serviert sie mit nginx.

### `frontend/Dockerfile.dev`
Bauanleitung für Development. Startet den Vite Dev-Server mit Hot-Reload.

### `frontend/nginx.conf`
Konfiguration für den nginx Webserver in Production. Definiert wie Requests geroutet werden und dass alle Routen auf index.html zeigen (für React Router).

---

## Docker & Root

### `docker-compose.yml`
Definiert wie Backend und Frontend zusammen gestartet werden (Production). Ein Befehl `docker-compose up` startet beide Container mit den richtigen Ports und Verbindungen.

### `docker-compose.dev.yml`
Development-Version mit Hot-Reload. Änderungen am Code werden automatisch neu geladen ohne Neustart.

### `start.bat`
Windows-Batch-Skript mit einem Menü. Optionen: Development starten, Production starten, Services stoppen, Container aufräumen. Macht Docker-Befehle einfacher.

### `package.json` (Root)
Projekt-Metadaten für das Gesamtprojekt. Enthält Name, Version, Beschreibung.

### `README.md`
Hauptdokumentation. Erklärt was das Projekt macht, wie man es installiert und startet, und wie man es benutzt.

---

## Dokumentation

### `docs/PROJEKTÜBERSICHT.md`
Detaillierte Beschreibung der Architektur. Erklärt die Technologie-Entscheidungen, den Datenfluss, und wie die Komponenten zusammenarbeiten.

### `docs/SRS-Dokument.md`
Software Requirements Specification. Formale Dokumentation der Anforderungen – was das System können muss, wer die Benutzer sind, welche Funktionen es gibt.

### `docs/ANFORDERUNGEN.md`
Kurzfassung der funktionalen und nicht-funktionalen Anforderungen. Was muss die Software können? Welche Qualitätsanforderungen gibt es?

### `docs/DOCKER.md`
Anleitung zur Docker-Installation und -Nutzung. Erklärt die Docker-Befehle und wie man die Container verwaltet.

### `docs/LESSONS-LEARNED.md`
Entwicklungsnotizen. Dokumentiert Probleme die während der Entwicklung auftraten und wie sie gelöst wurden. Nützlich für zukünftige Wartung.

---

## Tests

### `tests/test_adopt_selected.py`
Testet die Funktion zum selektiven Übernehmen von Testfällen. Prüft ob nur ausgewählte Testfälle gespeichert werden.

### `tests/test_integration_adopt.py`
Integrationstests für den gesamten Adopt-Workflow. Testet das Zusammenspiel von Frontend-Request bis Dateispeicherung.

### `tests/test_storage.py`
Unit-Tests für den Storage-Service. Testet Speichern, Laden, Löschen von Projekten und Testfällen.

### `tests/test_testplan_api.py`
Tests für die Testplan-API-Endpunkte. Prüft ob Projekte und User Stories korrekt abgerufen werden.

### `tests/samples/lnw_openai_response.json`
Beispiel-Antwort von OpenAI. Wird in Tests als Mock verwendet, damit Tests auch ohne echte API-Calls funktionieren.

---

## Hilfsskripte

### `scripts/convert_srs_to_pdf.py`
Konvertiert das SRS-Dokument von Markdown zu PDF. Nützlich für die Abgabe oder zum Drucken.

### `scripts/fix_docs_encoding.py`
Repariert Encoding-Probleme in Dokumenten. Behebt kaputte Umlaute und entfernt ungewollte Sonderzeichen.


