# 🤖 AI Test Case Generator

> KI-gestützte Testfall-Generierung aus User Stories – Automatisch, schnell und umfassend

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)
![React](https://img.shields.io/badge/react-18.x-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

</div>

---

## Über das Projekt

Der **AI Test Case Generator** ist ein KI-gestütztes Tool zur automatischen Generierung von strukturierten Testfällen aus User Stories. Entwickelt als Master Thesis Projekt im Studiengang Software Development & Engineering (SDE26), revolutioniert es den QA-Prozess durch:

- ** 60-70% Zeitersparnis** bei der Testfall-Erstellung
- ** Höhere Testabdeckung** durch systematische KI-Analyse
- ** Standardisierte Dokumentation** über alle Projekte hinweg
- ** Konsistente Qualität** unabhängig von der Erfahrung des Testers

### Hauptfunktionen

-  **KI-Generierung**: Automatische Erstellung von 5-40 Testfällen pro User Story
-  **Projekt-Management**: Organisation mehrerer Projekte mit User Stories
-  **Testfall-Bearbeitung**: Manuelle Anpassung aller generierten Testfälle
-  **Dokument-Upload**: Kontextanalyse durch Upload von .docx/.txt-Dateien
-  **Excel-Export**: Export in JIRA/Azure DevOps-kompatible Formate
-  **Re-Generation**: Erweiterte Testfall-Generierung mit Kontext-Analyse
-  **Persistenz**: Alle Daten bleiben nach Browser-Reload erhalten

---

##  Schnellstart

### Voraussetzungen

- **Docker** & **Docker Compose** installiert
- **OpenAI API Key** (für GPT-4o-mini)
- Optional: **Node.js** & **Python 3.10+** für lokale Entwicklung

###  Mit Docker (empfohlen)

Die einfachste Methode zum Starten des Projekts mit dem **interaktiven Start-Menü**:

```bash
# 1. Repository klonen
git clone https://github.com/Fati26-Knk/ki-testfall-generator.git
cd ki-testfall-generator

# 2. Umgebungsvariable setzen
# Erstelle eine .env Datei im backend/ Ordner:
echo "OPENAI_API_KEY=dein-api-key-hier" > backend/.env

# 3. Start-Skript ausführen (Windows)
.\start.bat

# Oder auf Mac/Linux:
# chmod +x start.sh && ./start.sh
```

**Interaktives Menü öffnet sich:**
```
================================
 AI Test Case Generator
 Docker Compose Starter
================================

Wähle eine Option:

[1] Development starten (Hot-Reload, Port 5173)
[2] Production starten (Optimiert, Port 80)
[3] Services stoppen
[4] Alle Container aufräumen

Deine Wahl (1-4):
```

**Option 1 (Development):**
- Frontend: http://localhost:5173 (mit Hot-Reload)
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Option 2 (Production):**
- Frontend: http://localhost (Port 80)
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

 Die Anwendung läuft jetzt lokal.

###  Lokale Entwicklung (ohne Docker)

#### Backend starten

```bash
cd backend

# Virtuelles Environment erstellen
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Dependencies installieren
pip install -r requirements.txt

# .env Datei erstellen
echo OPENAI_API_KEY=dein-api-key-hier > .env

# Server starten
uvicorn app.main:app --reload --port 8000
```

#### Frontend starten

```bash
cd frontend

# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Öffne: http://localhost:5173
```

---

##  Verwendung

### 1️ Dashboard - Testfälle generieren

1. **User Story eingeben**:
   - Titel: "Als Benutzer möchte ich mich anmelden..."
   - Beschreibung: Detaillierte Beschreibung der Anforderung
   - Akzeptanzkriterien: (Optional) Given-When-Then Szenarien

2. **Optionen wählen**:
   - **Kompakt** (3-5 Tests) oder **Umfassend** (15-40 Tests)
   - Optional: Dokumente hochladen (.docx/.txt)

3. **Generieren klicken** → KI erstellt strukturierte Testfälle

4. **Testfälle durchsehen & auswählen**:
   - Einzelne Testfälle mit Checkbox auswählen
   - Oder "Alle merken" für die gesamte User Story

5. **In Projekt speichern**:
   - Projekt auswählen oder neu erstellen
   - Testfälle werden dauerhaft gespeichert

### 2️ TestPlan - Testfälle verwalten

1. **Projekte navigieren**: Sidebar zeigt alle Projekte
2. **User Stories expandieren**: Klick auf User Story zeigt alle Testfälle
3. **Testfälle bearbeiten**: 
   - Titel, Beschreibung, Schritte, erwartetes Ergebnis
   - Priorität ändern (High/Medium/Low)
4. **Export**: Excel-Download pro User Story
5. **Löschen**: Einzelne Testfälle oder gesamte User Stories entfernen

### 3️ Erweiterte Features

- **Re-Generierung**: "Re-Generieren" Button analysiert bestehende Tests und erstellt zusätzliche Szenarien
- **Expand/Collapse All**: Alle User Stories auf einmal öffnen/schließen
- **Projekt umbenennen**: Hover über Projekt → Edit-Icon
- **Custom Dialogs**: Bestätigungen mit modernem UI (Escape/Enter Shortcuts)

---

##  Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   TestPlan   │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────┼────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Routes  │  │   Services   │  │    Models    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         ├─ LLM Service ────┼─ OpenAI GPT-4o                 │
│         ├─ Storage ────────┼─ PostgreSQL 15 (SQLAlchemy)    │
│         └─ Document ───────┴─ DOCX/TXT Parser               │
└──────────────────────────────────────────────────────────────┘
```

### Technologie-Stack

**Frontend:**
- React 18.x mit Hooks
- Vite (Build Tool)
- Axios (HTTP Client)
- CSS3 mit Gradient Styling

**Backend:**
- Python 3.10+
- FastAPI (Async API Framework)
- OpenAI API (GPT-4o)
- SQLAlchemy 2.0 (PostgreSQL ORM)
- python-docx (DOCX Parsing)
- Pydantic (Datenvalidierung)

**Datenbank:**
- PostgreSQL 15 (Alpine)
- Docker Volume für Persistenz

**Deployment:**
- Docker & Docker Compose
- Nginx (Frontend)
- Uvicorn (Backend ASGI Server)

---

##  Projektstruktur

```
ki-testfall-generator/
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── components/   # UI Komponenten
│   │   ├── services/     # API Service
│   │   └── App.jsx       # Haupt-App
│   ├── Dockerfile        # Production Build
│   └── package.json
│
├── backend/              # FastAPI Backend
│   ├── app/
│   │   ├── api/         # REST Endpoints
│   │   ├── services/    # Business Logic
│   │   ├── models/      # Pydantic Models
│   │   └── database.py  # PostgreSQL ORM Models
│   ├── Dockerfile       # Python Container
│   └── requirements.txt
│
├── docs/                # Dokumentation
│   ├── SRS-Dokument.md  # Software Requirements Specification
│   ├── DATENBANK.md     # PostgreSQL Dokumentation
│   ├── PROJEKTSTRUKTUR.md
│   ├── PROJEKTÜBERSICHT.md
│   └── ANFORDERUNGEN.md
│
├── scripts/             # Utility-Scripts
├── docker-compose.yml   # Multi-Container Setup
└── README.md           # Diese Datei
```

### 💾 Datenbank & Speicherort

Die Anwendung verwendet **PostgreSQL 15** als Datenbank:

| Einstellung | Wert |
|-------------|------|
| Host | `db` (Docker) / `localhost:5432` (extern) |
| Datenbank | `testgen_db` |
| Benutzer | `testgen` |
| Passwort | `testgen_secret` |

**Physischer Speicherort (Windows mit Docker Desktop):**
```
\\wsl$\docker-desktop-data\data\docker\volumes\ki-testfall-generator_postgres_data_dev\_data
```

> **Hinweis:** Die Daten bleiben in einem Docker Volume persistent, auch wenn Container neu gestartet werden.

---

##  Beispiel Testfall

**Input (User Story):**
```
Titel: Als Benutzer möchte ich mich anmelden
Beschreibung: Der Benutzer kann sich mit E-Mail und Passwort anmelden
Akzeptanzkriterien:
- Erfolgreiche Anmeldung mit gültigen Credentials
- Fehlermeldung bei ungültigen Credentials
```

**Output (Generierte Testfälle):**
```
TC-1: Erfolgreiche Anmeldung mit gültigen Credentials
  Vorbedingungen:
    - Benutzer ist registriert
    - Login-Seite ist geöffnet
  Schritte:
    1. E-Mail eingeben: user@example.com
    2. Passwort eingeben: ValidPass123
    3. "Anmelden" Button klicken
  Erwartetes Ergebnis:
    - Benutzer wird zur Dashboard-Seite weitergeleitet
    - Willkommensnachricht wird angezeigt
  Priorität: High

TC-2: Fehlermeldung bei leerem Passwort
  Vorbedingungen: ...
  Schritte: ...
  Erwartetes Ergebnis: ...
  Priorität: Medium

... (3-40 weitere Testfälle je nach Modus)
```

---

##  Beitragen

Dieses Projekt ist im Rahmen einer Master Thesis entstanden. Feedback und Verbesserungsvorschläge sind willkommen!

### Entwicklung

```bash
# Tests ausführen (Backend)
cd backend
pytest tests/

# Frontend Development Server
cd frontend
npm run dev

# Linting
npm run lint  # Frontend
ruff check .  # Backend (falls installiert)
```


---

##  Autorin

**Fadime Konuk**  
Master Thesis Projekt – SDE26  
Hochschule Campus Wien

---

##  Weitere Dokumentation

-  [Software Requirements Specification (SRS)](docs/SRS-Dokument.md)
-  [Projektübersicht](docs/PROJEKTÜBERSICHT.md)
-  [Funktionale Anforderungen](docs/ANFORDERUNGEN.md)
-  [Docker Setup Guide](docs/DOCKER.md)
-  [Lessons Learned](docs/LESSONS-LEARNED.md)

---

<div align="center">

**Erstelle bessere Tests in Minuten, nicht Stunden** 

[Demo ansehen](#) • [Dokumentation](docs/) • [Issues melden](https://github.com/Fati26-Knk/ki-testfall-generator/issues)

</div>
