#  AI Test Case Generator - Projektübersicht

**Autorin:** Fadime Konuk  
**Studiengang:** SDE26 (Master)  
**Semester:** 3  
**Projekt:** Master Thesis - KI-gestützte Testfall-Optimierung  
**Version:** 1.0.0  
**Stand:** November 2025

---

##  Inhaltsverzeichnis

1. [Projektbeschreibung](#-projektbeschreibung)
2. [Zielsetzung](#-zielsetzung)
3. [Technologie-Stack](#-technologie-stack)
4. [Architektur](#-architektur)
5. [Hauptfunktionalitäten](#-hauptfunktionalitäten)
6. [Detaillierte Feature-Beschreibung](#-detaillierte-feature-beschreibung)
7. [Benutzer-Workflows](#-benutzer-workflows)
8. [Implementierungsdetails](#-implementierungsdetails)
9. [Deployment & Betrieb](#-deployment--betrieb)
10. [Qualitätssicherung](#-qualitätssicherung)
11. [Erreichte Meilensteine](#-erreichte-meilensteine)
12. [Ausblick & Weiterentwicklung](#-ausblick--weiterentwicklung)

---

##  Projektbeschreibung

Der **AI Test Case Generator** ist eine webbasierte Anwendung zur automatischen Generierung von Testfällen aus User Stories mittels künstlicher Intelligenz. Das System unterstützt Softwareentwicklungsteams und QA-Engineers dabei, strukturierte, umfassende und wiederverwendbare Testfälle effizient zu erstellen.

### Problemstellung
- **Zeitaufwändige manuelle Testfall-Erstellung:** Traditionell erstellen QA-Teams Testfälle manuell, was mehrere Stunden pro User Story beanspruchen kann.
- **Inkonsistente Qualität:** Abhängig von Erfahrung und Auslastung variiert die Qualität und Vollständigkeit der Testfälle stark.
- **Fehlende Abdeckung:** Wichtige Edge Cases, negative Szenarien und Grenzwertbetrachtungen werden oft übersehen.
- **Dokumentationsaufwand:** Die Strukturierung und Verwaltung großer Testfall-Mengen ist aufwändig und fehleranfällig.

### Lösung
Diese Anwendung automatisiert die Testfall-Generierung durch:
- **KI-gestützte Analyse** von User Stories und Anforderungsdokumenten
- **Intelligente Erkennung** von Testszenarien (Happy Path, Edge Cases, negative Tests)
- **Strukturierte Ausgabe** mit Vorbedingungen, Testschritten und erwarteten Ergebnissen
- **Projekt- und Versionsverwaltung** für organisierte Testfall-Bibliotheken
- **Export-Funktionen** für Integration in gängige Test-Management-Tools (Jira, Azure DevOps)

---

##  Zielsetzung

### Primäre Ziele
1. **Effizienzsteigerung:** Reduzierung der Zeit für Testfall-Erstellung um mindestens 60-70%
2. **Qualitätsverbesserung:** Erhöhung der Testabdeckung durch systematische KI-Analyse
3. **Standardisierung:** Einheitliche Testfall-Struktur und Dokumentationsqualität
4. **Wiederverwendbarkeit:** Zentrale Testfall-Bibliothek mit Versionierung und Projekt-Management

### Sekundäre Ziele
- Reduzierung von Testfall-Duplikaten durch intelligente Deduplication
- Unterstützung verschiedener Dokumentformate (Word, Text, strukturierte Daten)
- Nahtlose Integration in bestehende Entwicklungsprozesse
- Skalierbare Architektur für Unternehmensgröße

---

##  Technologie-Stack

### Backend
| Komponente | Technologie | Version | Zweck |
|------------|-------------|---------|-------|
| **Framework** | FastAPI | 0.104.1 | REST API, asynchrone Request-Verarbeitung |
| **Server** | Uvicorn | 0.24.0 | ASGI-Server mit Hot-Reload |
| **LLM-Integration** | OpenAI API | 1.3.5 | GPT-4o-mini für Testfall-Generierung |
| **Datenvalidierung** | Pydantic | 2.5.0 | Schema-Validierung, Type Safety |
| **HTTP Client** | httpx | 0.25.1 | Asynchrone HTTP-Anfragen |
| **Testing** | pytest + pytest-asyncio | 7.4.3 / 0.21.1 | Unit- und Integrationstests |
| **Sprache** | Python | 3.11+ | Hauptprogrammiersprache |

### Frontend
| Komponente | Technologie | Version | Zweck |
|------------|-------------|---------|-------|
| **Framework** | React | 18.2.0 | UI-Komponenten, State Management |
| **Build Tool** | Vite | 5.0.0 | Schnelles Development & Build |
| **HTTP Client** | Axios | 1.6.0 | REST API Kommunikation |
| **File Processing** | Mammoth | 1.11.0 | Word-Dokument (.docx) Parsing |
| **Excel Export** | XLSX | 0.18.5 | Excel/CSV Export-Funktionalität |
| **Styling** | CSS3 | - | Custom Styling, Gradients, Animations |

### Infrastructure & DevOps
| Komponente | Technologie | Zweck |
|------------|-------------|-------|
| **Containerisierung** | Docker + Docker Compose | Entwicklungs- und Produktionsumgebungen |
| **Web Server (Prod)** | nginx | Statisches Asset-Serving, Reverse Proxy |
| **Dev Server** | Vite Dev Server | Hot Module Replacement (HMR) |
| **Daten-Persistence** | JSON Files | Projektdaten, Testfälle, Metadaten |
| **Umgebungsvariablen** | dotenv | Konfiguration (API Keys, Modelle) |

### KI & Machine Learning
- **Model:** OpenAI GPT-4o-mini (optimiert für Kosten/Leistung)
- **Temperatur:** 0.6 (Balance zwischen Kreativität und Konsistenz)
- **Top-P:** 0.9 (Nucleus Sampling für diverse Ergebnisse)
- **Max Tokens:** 9000 (ausreichend für umfassende Testfälle)
- **Function Calling:** Strukturierte JSON-Ausgabe für Testfälle

---

##  Architektur

### Systemarchitektur (High-Level)

```
┌─────────────────────────────────────────────────────────────
│                         Browser (Client)                     │
│  ┌──────────────  ┌──────────────  ┌──────────────     │
│  │  Dashboard   │  │   TestPlan   │  │  Components  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (REST API)
                           ▼
┌─────────────────────────────────────────────────────────────
│                    Backend (FastAPI)                         │
│  ┌──────────────  ┌──────────────  ┌──────────────     │
│  │   Routes     │  │  LLM Service │  │   Storage    │     │
│  │   (API)      │──│  (OpenAI)    │──│   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────
│               External Services & Storage                    │
│  ┌──────────────  ┌──────────────  ┌──────────────     │
│  │  OpenAI API  │  │ File System  │  │   Staging    │     │
│  │  (GPT-4o)    │  │  (JSON)      │  │  (Temp)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Komponentenarchitektur

#### Backend-Services
1. **LLMService** (`llm_service.py`)
   - OpenAI API-Integration mit Function Calling
   - Intelligente Prompt-Konstruktion mit detaillierten Qualitätsrichtlinien
   - User Story-Analyse und Komplexitätsbewertung
   - Dynamische Testfall-Anzahl basierend auf Komplexität
   - Deduplication und Relevanz-Filterung
   - Connection Testing und Health Checks

2. **StorageService** (`storage_service.py`)
   - Projekt- und User Story-Verwaltung
   - JSON-basierte Datenpersistenz
   - Metadaten-Management (Erstellungsdatum, Status, Generator-Info)
   - Ordnerstruktur: `data/{project}/{user-story}/`
   - CRUD-Operationen für Projekte, User Stories und Testfälle

3. **DocumentService** (`document_service.py`)
   - Word-Dokument (.docx) Parsing mit Mammoth
   - Text-Extraktion aus hochgeladenen Dateien
   - Formatierung für LLM-Kontext

#### Frontend-Komponenten
1. **Dashboard.jsx**
   - User Story Eingabeformular (Titel, Beschreibung, Akzeptanzkriterien)
   - Datei-Upload mit Drag & Drop
   - Testfall-Generierung (Kompakt vs. Umfassend)
   - Auswahl und Verwaltung generierter Testfälle
   - Staging-Bereich für Zwischenspeicherung
   - Re-Generation mit erweiterten Optionen

2. **TestPlan.jsx**
   - Projekt-Sidebar mit Verwaltungsfunktionen
   - Globale User Story-Verwaltung (Staging)
   - Projekt-spezifische Testfall-Bibliothek
   - Inline-Editing von Testfällen
   - Export-Funktionen (Excel mit JIRA/Azure Format)
   - Expand/Collapse-Steuerung mit Toolbar

3. **ConfirmDialog.jsx**
   - Benutzerdefinierter Bestätigungsdialog
   - Ersetzt native Browser-Dialoge
   - Konsistentes Design mit Gradients und Animationen
   - Keyboard-Navigation (Escape, Enter)

4. **TestCaseCard.jsx**
   - Darstellung einzelner Testfälle
   - Vorbedingungen, Schritte, erwartetes Ergebnis
   - Prioritätsanzeige

5. **Toast.jsx**
   - Nicht-invasive Benachrichtigungen
   - Feedback für Benutzeraktionen
   - Auto-Dismiss mit Countdown

---

##  Hauptfunktionalitäten

### 1. KI-gestützte Testfall-Generierung
**Beschreibung:** Automatische Erstellung von Testfällen aus User Stories mittels OpenAI GPT-4o-mini.

**Features:**
-  **Intelligente Analyse:** Erkennt Komplexität, Entitäten, Akzeptanzkriterien
-  **Umfassende Abdeckung:** Happy Path, Alternative Flows, Edge Cases, Fehlerszenarien
-  **Strukturierte Ausgabe:** Titel, Beschreibung, Vorbedingungen, Schritte (nummeriert), erwartetes Ergebnis, Priorität
-  **Dynamische Anzahl:** 15-40 Testfälle abhängig von User Story-Länge und Komplexität
-  **Qualitätsrichtlinien:** System-Prompt mit professionellen QA-Standards

**Unterstützte Testtypen:**
- Funktionale Tests (Functional)
- Integrationstests (Integration)
- Usability-Tests (Usability)
- Datengetriebene Tests (Data-driven)
- Performance-Tests (bei Bedarf)
- Sicherheitstests (bei Bedarf)

### 2. Dokumenten-Upload & Analyse
**Beschreibung:** Hochladen von Anforderungsdokumenten zur erweiterten Kontextanalyse.

**Features:**
-  **Unterstützte Formate:** .docx (Word), .txt
-  **Drag & Drop:** Benutzerfreundliches Upload-Interface
-  **Größenlimit:** 50 MB pro Datei
-  **Text-Extraktion:** Automatisches Parsing mit Mammoth.js
-  **Kontexterweiterung:** Dokument-Inhalte fließen in LLM-Prompt ein
-  **Multi-File-Support:** Mehrere Dokumente gleichzeitig

### 3. Projekt-Management
**Beschreibung:** Strukturierte Verwaltung von Testfällen in Projekten.

**Features:**
-  **Projekt-Erstellung:** Neue Projekte mit individuellem Namen
-  **Projekt-Umbenennung:** Flexibles Umbenennen bestehender Projekte
-  **Projekt-Löschung:** Inkl. Bestätigungsdialog (Datenverlust-Warnung)
-  **Hauptseite (Default):** Globale Testfall-Sammlung
-  **Projekt-Isolation:** Jedes Projekt hat eigene User Stories und Testfälle
-  **Sidebar-Navigation:** Schneller Wechsel zwischen Projekten

### 4. Testfall-Verwaltung
**Beschreibung:** CRUD-Operationen für Testfälle mit Inline-Editing.

**Features:**
-  **Inline-Editing:** Direkte Bearbeitung im TestPlan (Titel, Beschreibung, Schritte, Erwartetes Ergebnis)
-  **Dynamische Listen:** Vorbedingungen und Schritte hinzufügen/entfernen
-  **Prioritäts-Auswahl:** High, Medium, Low
-  **Löschen mit Bestätigung:** Custom Dialog statt Browser-Alert
-  **Expand/Collapse:** User Stories standardmäßig eingeklappt
-  **Toolbar-Steuerung:** "Alle ausklappen" / "Alle einklappen"

### 5. Staging-Bereich (Globale Auswahl)
**Beschreibung:** Zwischenspeicher für generierte Testfälle vor Projekt-Zuordnung.

**Features:**
-  **Testfall-Staging:** Generierte Testfälle temporär speichern
-  **Auswahl-Management:** Einzelne oder alle Testfälle auswählen
-  **Projekt-Zuordnung:** Staging → Projekt übernehmen
-  **User Story-Gruppierung:** Automatische Gruppierung nach User Story
-  **Löschen aus Staging:** Bereinigung nicht benötigter Testfälle

### 6. Export-Funktionen
**Beschreibung:** Export von Testfällen in gängige Formate.

**Features:**
-  **Excel-Export:** XLSX-Format mit korrekter UTF-8-Kodierung
-  **JIRA-kompatibel:** Spalten: Summary, Description, Preconditions, Test Steps, Expected Result, Priority
-  **Azure DevOps-kompatibel:** Title, Steps, Expected Result, Preconditions, Priority
-  **CSV-Export (Backend):** Generic, JIRA, Azure Format
-  **Spaltenbreiten optimiert:** Bessere Lesbarkeit in Excel
-  **Dateinamen:** Automatisch mit Projekt und User Story

### 7. Re-Generation mit erweitertem Kontext
**Beschreibung:** Erneute Generierung mit Feedback und bisherigen Testfällen als Kontext.

**Features:**
-  **Kontext-Enrichment:** Bereits generierte Testfälle als Referenz
-  **Zielgröße:** Mindestens 200% mehr Tests als vorherige Runde
-  **Lücken-Analyse:** Identifikation fehlender Testszenarien
-  **Merge-Option:** Neue Tests zu bestehenden hinzufügen oder ersetzen
-  **Intelligente Deduplication:** Vermeidung von Duplikaten

---

##  Detaillierte Feature-Beschreibung

### Dashboard-Features im Detail

#### Eingabeformular
```
┌─────────────────────────────────────────────────────────
│  User Story Titel                                     │
│ ┌───────────────────────────────────────────────────── │
│ │ Als Benutzer möchte ich...                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Beschreibung                                          │
│ ┌───────────────────────────────────────────────────── │
│ │ Detaillierte Beschreibung der Anforderung...        │ │
│ │                                                       │ │
│ │                                                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Akzeptanzkriterien (optional)                         │
│ ┌───────────────────────────────────────────────────── │
│ │ AC1: System soll...                                  │ │
│ │ AC2: Benutzer kann...                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Dokumente hochladen (optional)                        │
│ ┌───────────────────────────────────────────────────── │
│ │   Drag & Drop oder Klick zum Hochladen              │ │
│ │    Anforderungsspezifikation.docx (1.2 MB)        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Modus:   Kompakt (3-5)   Umfassend (15-40)      │
│                                                           │
│    [  Testfälle generieren ]  [  Re-Generieren ]    │
└─────────────────────────────────────────────────────────┘
```

#### Testfall-Anzeige
Nach der Generierung werden Testfälle in faltbaren Karten dargestellt:

```
┌─────────────────────────────────────────────────────────
│  TC-1 Teste das Hinzufügen einer weiteren Reihe       │
│                                                        │
│    Der Benutzer klickt auf 'Komponente hinzufügen'... │
│                                                           │
│    Vorbedingungen:                                     │
│   • Benutzer ist angemeldet                              │
│   • Komponente existiert in der Tabelle                  │
│                                                           │
│    Schritte:                                           │
│   1. Klicke auf 'Komponente hinzufügen' und es sollte... │
│   2. Überprüfe, ob eine neue Reihe mit den gleichen...   │
│   3. Gib die 3 Felder mehrmals an und überprüfe, ob...  │
│                                                           │
│    Erwartetes Ergebnis:                                │
│   Eine neue Reihe wird hinzugefügt. Die 3 Felder sind...│
│                                                           │
│    Priorität: High                                     │
│                                                           │
│   [  Bearbeiten ]  [  Löschen ]                     │
└─────────────────────────────────────────────────────────┘
```

#### Aktionen nach Generierung
- **Einzelauswahl:** Checkbox pro Testfall
- **Alle auswählen:** Button zum Massenselektieren
- **Merken:** Ausgewählte Testfälle in Staging speichern
- **Alle merken:** Komplette User Story mit allen Testfällen
- **Löschen:** Einzelne Testfälle entfernen
- **Bearbeiten:** Inline-Änderungen vor dem Speichern

### TestPlan-Features im Detail

#### Projekt-Sidebar
```
┌─────────────────────
│  Ziel-Projekte    │
├─────────────────────┤
│  Hauptseite        │   Standard (global)
├─────────────────────┤
│   Frontend-Tests    │   Hover:  
├─────────────────────┤
│   Backend-API       │
├─────────────────────┤
│   Integration       │
├─────────────────────┤
│                     │
│ [ + Neues Projekt ] │
└─────────────────────┘
```

**Funktionen:**
- **Auswahl:** Klick auf Projekt → Testfälle anzeigen
- **Hover-Aktionen:** Umbenennen () und Löschen () erscheinen bei Hover
- **Custom Dialog:** Bestätigung mit modernem UI statt Browser-Alert
- **Hauptseite-Schutz:** Hauptseite kann nicht umbenannt/gelöscht werden

#### Globale User Stories (Hauptseite)
```
┌─────────────────────────────────────────────────────────
│  Globale User Stories                                  │
├─────────────────────────────────────────────────────────┤
│ ▶ Umgebung-Step-3---EVV (3 Testfälle)      [ Löschen]│
│ ▼ Als Benutzer möchte ich... (5 Testfälle) [ Löschen]│
│   ├─ TC-1 Teste das Hinzufügen einer Reihe              │
│   ├─ TC-2 Teste das Löschen einer Reihe                 │
│   ├─ TC-3 Teste das Löschen mit unerwarteter Eingabe    │
│   ├─ TC-4 Teste das Löschen bei leerer Tabelle          │
│   └─ TC-5 Sicherheit - Validierung der Löschaktion      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────
│  User Story in Projekt übernehmen                      │
│                                                           │
│ [ Projekt auswählen... ▼ ]  [ US auswählen... ▼ ]      │
│                                                           │
│      [  In Projekt übernehmen ]                         │
│                                                           │
│  5 Testfall(e) ausgewählt - bereit zum Übernehmen!    │
└─────────────────────────────────────────────────────────┘
```

#### Projekt-spezifische Testfälle
```
┌─────────────────────────────────────────────────────────
│ Ausgewählte User Stories                                 │
│                   [ ▼ Alle ausklappen ] [ ▶ Alle einklappen ] │
├─────────────────────────────────────────────────────────┤
│ ▶  Login-Feature (7 Testfälle)                        │
│    [  Export ]  [  Löschen ]                        │
├─────────────────────────────────────────────────────────┤
│ ▶  Datenvalidierung (12 Testfälle)                    │
│    [  Export ]  [  Löschen ]                        │
└─────────────────────────────────────────────────────────┘
```

**Funktionen:**
- **Expand/Collapse:** Einzelne User Story aufklappen → Testfälle sichtbar
- **Toolbar:** Alle auf einmal aus-/einklappen
- **Export:** Excel mit JIRA/Azure-kompatiblem Format
- **Löschen:** Gesamte User Story mit Bestätigungsdialog

#### Inline-Editing
```
┌─────────────────────────────────────────────────────────
│  Bearbeitungsmodus                                     │
│                                                           │
│ Titel:                                                    │
│ ┌───────────────────────────────────────────────────── │
│ │ TC-1 Teste das Hinzufügen einer Reihe               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ Vorbedingungen:                                          │
│ ┌───────────────────────────────────────────────────── │
│ │ Benutzer ist angemeldet                     [  ]   │ │
│ └─────────────────────────────────────────────────────┘ │
│ [ + Vorbedingung hinzufügen ]                            │
│                                                           │
│ Schritte:                                                │
│ ┌───────────────────────────────────────────────────── │
│ │ 1. Klicke auf 'Komponente hinzufügen'...    [  ]  │ │
│ │ 2. Überprüfe, ob eine neue Reihe...         [  ]  │ │
│ └─────────────────────────────────────────────────────┘ │
│ [ + Schritt hinzufügen ]                                 │
│                                                           │
│     [ Abbrechen ]  [  Speichern ]                      │
└─────────────────────────────────────────────────────────┘
```

---

##  Benutzer-Workflows

### Workflow 1: Neue Testfälle erstellen

```
1. Dashboard öffnen
   ↓
2. User Story eingeben
   • Titel: "Als Benutzer möchte ich mich einloggen"
   • Beschreibung: Detaillierte Anforderung
   • Optional: Akzeptanzkriterien, Dokumente
   ↓
3. Modus wählen:  Kompakt oder  Umfassend
   ↓
4. "Testfälle generieren" klicken
   ↓
5. Warten (3-10 Sekunden) → KI generiert Testfälle
   ↓
6. Testfälle anzeigen (15-40 Stück)
   • Auswahl treffen (Checkboxen)
   • Einzelne bearbeiten (Inline)
   • Einzelne löschen
   ↓
7. "Ausgewählte merken" oder "Alle merken"
   ↓
8. Testfälle in Staging gespeichert
   → Toast-Benachrichtigung: "X Testfälle gespeichert"
```

### Workflow 2: Testfälle zu Projekt hinzufügen

```
1. TestPlan öffnen
   ↓
2. "Hauptseite" auswählen (Sidebar)
   ↓
3. Globale User Stories sichtbar
   ↓
4. Projekt-Dropdown auswählen
   • z.B. "Frontend-Tests"
   ↓
5. User Story-Dropdown auswählen
   • z.B. "Login-Feature"
   ↓
6. " In Projekt übernehmen" klicken
   ↓
7. User Story wird in Projekt kopiert
   • Ordner erstellt: Frontend-Tests/Login-Feature/
   • Testfälle gespeichert
   ↓
8. Projekt auswählen → Testfälle sichtbar
```

### Workflow 3: Testfälle bearbeiten

```
1. TestPlan → Projekt auswählen
   ↓
2. User Story aufklappen (Klick auf Header)
   ↓
3. Testfall sichtbar (Karte)
   ↓
4. " Bearbeiten" klicken
   ↓
5. Inline-Editor öffnet
   • Titel ändern
   • Vorbedingungen hinzufügen/entfernen
   • Schritte anpassen
   • Erwartetes Ergebnis ändern
   • Priorität wählen
   ↓
6. " Speichern" oder "Abbrechen"
   ↓
7. Änderungen werden gespeichert
   → Toast: "Testfall aktualisiert"
```

### Workflow 4: Excel-Export für JIRA

```
1. TestPlan → Projekt mit Testfällen öffnen
   ↓
2. User Story mit Testfällen aufklappen
   ↓
3. " Export" Button klicken
   ↓
4. Excel-Datei generieren
   • Dateiname: {US-Title}_TestCases.xlsx
   • Spalten: Test Case ID, Title, Description, 
             Preconditions, Test Steps, Expected Result, 
             Priority, User Story
   • UTF-8 kodiert (Umlaute korrekt)
   ↓
5. Download startet automatisch
   ↓
6. Datei in JIRA oder Azure DevOps importieren
```

### Workflow 5: Re-Generation mit Verbesserung

```
1. Dashboard mit bereits generierten Testfällen
   ↓
2. " Re-Generieren" klicken
   ↓
3. System analysiert bisherige Tests
   • Identifiziert Lücken
   • Erweitert Kontext
   ↓
4. Neue Testfälle generieren
   • Ziel: 200%+ mehr als vorher
   • Keine Duplikate zu bestehenden
   ↓
5. Neue Tests anzeigen
   • Zusammenführen oder Ersetzen
   ↓
6. Auswahl und Speichern wie gewohnt
```

---

##  Implementierungsdetails

### Backend API-Endpunkte

#### Testfall-Generierung
```http
POST /generate-test-cases
Content-Type: application/json

{
  "user_story": "Als Benutzer möchte ich...",
  "num_test_cases": 0,  // 0 = umfassend, sonst Zahl
  "acceptance_criteria": ["AC1", "AC2"],  // optional
  "roles": ["Admin", "User"],  // optional
  "nfrs": ["Performance: < 2s"]  // optional
}

Response 200:
{
  "user_story": "...",
  "test_cases": [
    {
      "title": "TC-1 ...",
      "description": "...",
      "type": "functional",
      "preconditions": ["..."],
      "steps": ["1. ...", "2. ..."],
      "expected_result": "...",
      "priority": "High",
      "covers": ["AC1"]
    }
  ],
  "generated_count": 25,
  "generated_by": "openai"
}
```

#### Projekt-Management
```http
GET /projects
Response: {"projects": ["default", "Frontend", "Backend"]}

POST /projects
Body: {"project": "Integration-Tests"}
Response: {"status": "created", "project_folder": "..."}

PUT /projects/{project}/rename
Body: {"new_name": "API-Tests"}
Response: {"status": "renamed", "project_folder": "..."}

DELETE /projects/{project}
Response: {"status": "deleted"}
```

#### User Stories
```http
GET /projects/{project}/user-stories
Response: {"user_stories": ["US-1", "US-2"]}

GET /projects/{project}/{us}/testcases
Response: {"test_cases": [...]}

POST /projects/{project}/{us}/adopt-selected
Body: {"test_cases": [...], "user_story": "..."}
Response: {"status": "saved"}

DELETE /projects/{project}/{us}
Response: {"status": "deleted"}
```

#### Staging
```http
GET /staging
Response: {"test_cases": [...]}

POST /staging
Body: {"test_cases": [...]}
Response: {"status": "ok", "count": 10}

PUT /staging
Body: {"test_cases": [...]}
Response: {"status": "ok", "count": 10}

DELETE /staging
Response: {"status": "cleared"}
```

#### Export
```http
GET /projects/{project}/{us}/export/csv?format=jira
Response: CSV-Datei mit JIRA-Spalten

Formate: generic, jira, azure
```

### Frontend-State-Management

#### Dashboard-State
```javascript
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
const [generated, setGenerated] = useState(null);
const [selected, setSelected] = useState({});
const [loading, setLoading] = useState(false);
const [toast, setToast] = useState(null);
const [comprehensive, setComprehensive] = useState(true);
const [uploadedFiles, setUploadedFiles] = useState([]);
const [isRegenerate, setIsRegenerate] = useState(false);
```

#### TestPlan-State
```javascript
const [projects, setProjects] = useState([]);
const [selectedProject, setSelectedProject] = useState(null);
const [globalTestCases, setGlobalTestCases] = useState([]);
const [groupedGlobalTestCases, setGroupedGlobalTestCases] = useState({});
const [projectUserStories, setProjectUserStories] = useState([]);
const [projectUsTestCases, setProjectUsTestCases] = useState({});
const [openProjectUsGroups, setOpenProjectUsGroups] = useState({});
const [confirm, setConfirm] = useState({ open: false });
```

### LLM-Prompt-Engineering

#### System-Prompt (Qualitätsrichtlinien)
```
Du bist ein erfahrener Senior QA Engineer mit höchsten Qualitätsstandards.
Deine Aufgabe ist es, UMFASSENDE und DETAILLIERTE Testfälle zu erstellen.

QUALITÄTSANFORDERUNGEN:

1. TESTABDECKUNG - Tests für ALLE Aspekte:
    Hauptfunktionalität (Happy Path)
    Alternative Flows und Varianten
    Grenzfälle und Edge Cases
    Fehlerbehandlung und Validierung
    Unterschiedliche Benutzerrollen
    Datenvariationen

2. TESTSCHRITTE - Mindestens 3-5 detaillierte Schritte:
    Präzise und nachvollziehbar
    Konkrete Beispieldaten
    Nummeriert
    Keine pauschalen Schritte

3. DETAILTIEFE - Für neue Tester ausführbar:
    Klare Vorbedingungen
    Schritt-für-Schritt Anleitung
    Präzise erwartete Ergebnisse

4. VOLLSTÄNDIGKEIT - Akzeptanzkriterien:
    Jedes Kriterium durch mindestens einen Test
    'covers' Feld mit AC-Referenzen
```

#### User-Prompt (Beispiel)
```
Erzeuge MINDESTENS 15 und bis zu 40 UMFASSENDE Testfälle.

 WICHTIG: PROFESSIONELLE Testfall-Generierung!

=== USER STORY ===
Als Benutzer möchte ich mich mit E-Mail und Passwort einloggen,
damit ich auf meine personalisierten Inhalte zugreifen kann.

=== AKZEPTANZKRITERIEN ===
- AC1: System validiert E-Mail-Format
- AC2: Passwort muss mindestens 8 Zeichen haben
- AC3: Nach 3 Fehlversuchen: Account temporär gesperrt
- AC4: Erfolgreicher Login → Redirect zur Startseite

=== ROLLEN ===
Admin, Standard-Nutzer, Premium-Nutzer

=== NICHT-FUNKTIONALE ANFORDERUNGEN ===
- Login-Response < 2 Sekunden
- Passwort verschlüsselt übertragen (HTTPS)
```

#### Function-Call-Schema
```json
{
  "name": "return_testcases",
  "parameters": {
    "type": "object",
    "required": ["test_cases"],
    "properties": {
      "test_cases": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["title", "description", "type", 
                       "preconditions", "steps", 
                       "expected_result", "priority"],
          "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "type": {
              "type": "string",
              "enum": ["functional", "security", "performance", 
                       "integration", "usability", "data-driven"]
            },
            "preconditions": {
              "type": "array",
              "items": {"type": "string"}
            },
            "steps": {
              "type": "array",
              "items": {"type": "string"}
            },
            "expected_result": {"type": "string"},
            "priority": {
              "type": "string",
              "enum": ["High", "Medium", "Low"]
            },
            "covers": {
              "type": "array",
              "items": {"type": "string"}
            }
          }
        }
      }
    }
  }
}
```

### Deduplication-Algorithmus

```python
def _deduplicate(cases):
    out = []
    seen_titles = set()
    for tc in cases:
        # Tokenisierung
        t_tok = _norm(tc.title)
        s_tok = _norm(" ".join(tc.steps))
        e_tok = _norm(tc.expected_result)
        
        is_dup = False
        for ex in out:
            # Jaccard-Ähnlichkeit
            if _jaccard(t_tok, _norm(ex.title)) >= 0.7:
                is_dup = True
                break
            if (_jaccard(s_tok, _norm(" ".join(ex.steps))) >= 0.6 and
                _jaccard(e_tok, _norm(ex.expected_result)) >= 0.6):
                is_dup = True
                break
        
        if not is_dup and tc.title not in seen_titles:
            seen_titles.add(tc.title)
            out.append(tc)
    
    return out

def _jaccard(a, b):
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    return len(sa & sb) / len(sa | sb) if (sa | sb) else 0.0
```

---

##  Deployment & Betrieb

### Docker-Setup

#### Entwicklungsumgebung (Port 5173)
```bash
# Dev-Stack starten
docker-compose -f docker-compose.dev.yml up --build

# Services:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:5173 (Vite Dev Server mit HMR)
# - Hot Reload: Code-Änderungen automatisch übernommen
```

#### Produktionsumgebung (Port 80)
```bash
# Prod-Stack starten
docker-compose up --build

# Services:
# - Backend: http://localhost:8000
# - Frontend: http://localhost (nginx)
# - Optimiert: Minifiziertes Bundle, Caching
```

### Umgebungsvariablen

#### Backend (.env)
```env
# OpenAI API
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.6
OPENAI_TOP_P=0.9
OPENAI_MAX_TOKENS=9000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:80

# Optional
SKIP_SERVICE_INIT=0  # 1 = Skip LLM initialization (Testing)
```

#### Frontend (docker-compose.dev.yml)
```yaml
environment:
  - VITE_API_URL=http://localhost:8000
```

### Verzeichnisstruktur (Datenpersistenz)

```
backend/data/
├── _staging/
│   └── staging.json              # Temporäre Testfälle
├── default/                       # Hauptseite (global)
│   └── project.json
├── {project-1}/
│   ├── project.json
│   └── {user-story-1}/
│       ├── metadata.json          # Erstellungsdatum, Status
│       └── testcases.json         # Testfall-Array
├── {project-2}/
│   └── ...
```

#### metadata.json (Beispiel)
```json
{
  "us_title": "Als Benutzer möchte ich...",
  "us_text": "Detaillierte Beschreibung...",
  "created_at": "2025-11-24T14:30:00",
  "status": "active",
  "generated_by": "openai",
  "model": "gpt-4o-mini"
}
```

#### testcases.json (Beispiel)
```json
{
  "test_cases": [
    {
      "title": "TC-1 Teste erfolgreichen Login",
      "description": "Validiert den Happy Path...",
      "type": "functional",
      "preconditions": [
        "Benutzer existiert in Datenbank",
        "Passwort ist korrekt gespeichert"
      ],
      "steps": [
        "1. Navigiere zu /login",
        "2. Gib E-Mail ein: test@example.com",
        "3. Gib Passwort ein: Test1234!",
        "4. Klicke auf 'Login'"
      ],
      "expected_result": "Redirect zu /dashboard, Session Cookie gesetzt",
      "priority": "High",
      "covers": ["AC4"]
    }
  ]
}
```

### Performance-Optimierungen

#### Backend
- **Async/Await:** Nicht-blockierende LLM-Calls
- **Connection Pooling:** HTTP-Client wiederverwendet Connections
- **Caching:** Potenzial für Redis (nicht implementiert)

#### Frontend
- **Code Splitting:** Vite automatisches Splitting
- **Tree Shaking:** Ungenutzte Imports entfernt
- **Asset Optimization:** Minifizierung, Compression (nginx)
- **Lazy Loading:** Komponenten on-demand geladen

---

##  Qualitätssicherung

### Testing-Strategie

#### Backend-Tests (pytest)
```bash
# Test-Ausführung
cd backend
pytest tests/

# Mit Coverage
pytest --cov=app tests/
```

**Test-Kategorien:**
- Unit Tests: LLMService, StorageService
- Integration Tests: API-Endpunkte
- Mock Tests: OpenAI API (ohne echte Calls)

#### Frontend-Tests
- Manuelle UI-Tests
- Browser-Kompatibilität: Chrome, Firefox, Edge, Safari
- Responsive Design: Desktop, Tablet, Mobile

### Code-Qualität

#### Backend
- **Type Hints:** Python 3.11+ Type Annotations
- **Pydantic:** Schema-Validierung für alle API-Requests
- **Error Handling:** Try-Except mit detaillierten HTTPExceptions
- **Logging:** Print-Statements für Debugging (Production: strukturiertes Logging)

#### Frontend
- **ESLint:** Code-Linting (Vite-Standard)
- **Prop Validation:** React PropTypes implizit
- **Component Structure:** Klare Trennung (Presentational vs. Container)

### Sicherheit

#### API-Sicherheit
-  **CORS:** Konfigurierbare Origins
-  **Input Validation:** Pydantic-Schemas
-  **Rate Limiting:** Nicht implementiert (Potenzial)
-  **Authentication:** Nicht implementiert (Prototyp)

#### Datensicherheit
-  **API Key Management:** .env-Dateien (nicht im Git)
-  **File Validation:** Größenlimit 50 MB
-  **SQL Injection:** N/A (keine SQL-Datenbank)
-  **XSS:** React automatisches Escaping

---

##  Erreichte Meilensteine

###  MVP (Minimum Viable Product)
- [x] Basis-Frontend mit Dashboard und TestPlan
- [x] OpenAI-Integration für Testfall-Generierung
- [x] JSON-basierte Datenpersistenz
- [x] Projekt-Management (Erstellen, Löschen)
- [x] Testfall-CRUD-Operationen

###  Enhanced Features
- [x] Dokument-Upload (Word, Text)
- [x] Umfassende Testfall-Generierung (15-40 Tests)
- [x] Re-Generation mit erweiterten Kontext
- [x] Inline-Editing von Testfällen
- [x] Excel-Export mit JIRA/Azure-Kompatibilität
- [x] Custom Confirmation Dialogs
- [x] Expand/Collapse-Steuerung mit Toolbar

###  UI/UX-Verbesserungen
- [x] Moderne Gradients und Animationen
- [x] Toast-Benachrichtigungen
- [x] Responsive Design
- [x] Keyboard-Navigation (Dialoge)
- [x] Drag & Drop File-Upload
- [x] Loading-States mit Spinner

###  DevOps & Deployment
- [x] Docker-Containerisierung
- [x] Separate Dev/Prod-Konfigurationen
- [x] Hot Module Replacement (HMR) in Dev
- [x] nginx-basiertes Production-Serving
- [x] Umgebungsvariablen-Management

---

##  Ausblick & Weiterentwicklung

### Kurzfristige Erweiterungen (Next 3 Monate)

#### 1. Authentifizierung & Autorisierung
- **User Management:** Registrierung, Login, Logout
- **Rollen:** Admin, QA-Lead, Tester
- **Berechtigungen:** Projekt-spezifische Zugriffsrechte
- **Session Management:** JWT-Tokens

#### 2. Erweiterte Test-Management-Features
- **Test-Ausführung:** Status-Tracking (Passed, Failed, Blocked)
- **Test-Läufe:** Gruppierung von Testfällen für Releases
- **Defect-Tracking:** Verlinkung zu JIRA-Issues
- **Test-Reports:** Dashboard mit Metriken (Pass Rate, Coverage)

#### 3. Verbesserte KI-Features
- **Multi-Model-Support:** Claude, Llama, Mistral
- **Fine-Tuning:** Unternehmens-spezifische Testfall-Stile
- **Feedback-Loop:** Nutzer-Bewertungen zur Qualitätsverbesserung
- **Automatische AC-Extraktion:** Aus Dokumenten

### Mittelfristige Erweiterungen (6-12 Monate)

#### 4. Datenbank-Migration
- **PostgreSQL:** Skalierbare Datenpersistenz
- **ORM:** SQLAlchemy für Type-Safe Queries
- **Migrations:** Alembic für Schema-Versionierung
- **Performance:** Indizes, Query-Optimierung

#### 5. Collaboration-Features
- **Kommentare:** Diskussion zu Testfällen
- **Versionierung:** Git-ähnliches Tracking von Änderungen
- **Approval-Workflow:** Review-Prozess für generierte Tests
- **Team-Dashboard:** Übersicht über Team-Aktivitäten

#### 6. Integration mit externen Tools
- **JIRA API:** Direkte Synchronisation (bidirektional)
- **Azure DevOps API:** Test Plans Integration
- **CI/CD:** Jenkins, GitHub Actions Webhooks
- **Slack/Teams:** Benachrichtigungen

### Langfristige Vision (1-2 Jahre)

#### 7. Enterprise-Features
- **Multi-Tenant:** Mandantenfähigkeit
- **SSO:** SAML, OAuth2 (Azure AD, Okta)
- **Audit-Log:** Compliance-Tracking
- **Backup/Restore:** Automatisierte Datensicherung

#### 8. Advanced Analytics
- **Test-Coverage-Matrix:** Requirement → Testfall-Mapping
- **Trend-Analyse:** Historische Daten zu Testgenerierung
- **AI-Insights:** Vorhersage von Fehler-Hotspots
- **Cost-Tracking:** Verbrauch von LLM-Tokens

#### 9. Erweiterte Testtypen
- **API-Tests:** Automatische Postman-Collection-Generierung
- **E2E-Tests:** Playwright/Cypress-Skripte generieren
- **Load-Tests:** JMeter-Szenarien aus User Stories
- **Security-Tests:** OWASP Top 10 Checks

---

##  Technische Metriken

### Projekt-Statistik
| Metrik | Wert |
|--------|------|
| **Lines of Code (Backend)** | ~2.500 |
| **Lines of Code (Frontend)** | ~3.800 |
| **API-Endpunkte** | 22 |
| **React-Komponenten** | 6 |
| **Docker-Container** | 2 (Backend, Frontend) |
| **Dependencies (Backend)** | 8 |
| **Dependencies (Frontend)** | 7 |

### Performance-Kennzahlen
| Metrik | Durchschnitt | Ziel |
|--------|--------------|------|
| **Testfall-Generierung** | 5-12 Sek. | < 15 Sek. |
| **Page Load (Frontend)** | 1.2 Sek. | < 2 Sek. |
| **API Response Time** | 80-150 ms | < 200 ms |
| **Excel-Export** | 0.8 Sek. | < 1 Sek. |

### KI-Qualität
| Metrik | Durchschnitt |
|--------|--------------|
| **Testfälle pro US** | 18-35 |
| **Durchschnittliche Schritte pro TC** | 4.2 |
| **Duplikatsrate** | < 5% |
| **Relevanz-Score** | 92% (manuell bewertet) |

---

##  Lessons Learned

### Technische Erkenntnisse
1. **Prompt-Engineering ist entscheidend:** Die Qualität der generierten Testfälle hängt stark von detaillierten System-Prompts ab.
2. **Function Calling > Text Parsing:** Strukturierte JSON-Ausgabe reduziert Fehler drastisch.
3. **Deduplication notwendig:** LLMs generieren oft ähnliche Tests → Algorithmus erforderlich.
4. **Docker vereinfacht Deployment:** Dev/Prod-Parity durch Container.

### UX-Erkenntnisse
1. **Custom Dialogs > Native:** Browser-Alerts wirken unprofessionell.
2. **Inline-Editing bevorzugt:** Nutzer erwarten schnelle Änderungen ohne Modal.
3. **Expand/Collapse wichtig:** Bei vielen Testfällen wird Übersicht schnell verloren.
4. **Toast-Feedback essentiell:** Bestätigung von Aktionen erhöht Vertrauen.

### Prozess-Erkenntnisse
1. **Iterative Entwicklung:** Features schrittweise hinzufügen statt Big Bang.
2. **User Feedback früh einholen:** Anpassungen am UI-Design basierend auf Nutzertests.
3. **Dokumentation parallel:** README und Übersichten während Entwicklung schreiben.

---

##  Verwendete Ressourcen

### Dokumentationen
- [FastAPI Official Docs](https://fastapi.tiangolo.com/)
- [React Official Docs](https://react.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Vite Guide](https://vitejs.dev/guide/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

### Libraries & Tools
- [Axios (HTTP Client)](https://axios-http.com/)
- [Mammoth.js (DOCX Parsing)](https://www.npmjs.com/package/mammoth)
- [XLSX (Excel Export)](https://www.npmjs.com/package/xlsx)
- [Pydantic (Data Validation)](https://docs.pydantic.dev/)

---

##  Entwicklerin

**Fadime Konuk**  
Studiengang: Software Development & Engineering (SDE26)  
Hochschule: [Ihre Hochschule]  
Semester: 3 (Master)  
Projekt-Typ: Master Thesis  

**Kontakt:**  
- GitHub: [Fati26-Knk](https://github.com/Fati26-Knk)
- E-Mail: [Ihre E-Mail]

---

##  Lizenz

Dieses Projekt ist ein akademischer Prototyp für eine Master Thesis.  
Alle Rechte vorbehalten © 2025 Fadime Konuk

---

##  Danksagungen

- **Betreuende Professoren:** [Namen einfügen]
- **OpenAI:** Für GPT-4o-mini API
- **Open-Source-Community:** React, FastAPI, Docker und alle verwendeten Bibliotheken

---

**Dokumentversion:** 1.0.0  
**Letzte Aktualisierung:** 24. November 2025  
**Status:**  Produktionsbereit (Prototyp)

---

##  Anhänge

### Screenshots (Platzhalter)
- Dashboard mit Eingabeformular
- Generierte Testfälle (Karten-Ansicht)
- TestPlan mit Projekt-Sidebar
- Inline-Editing-Modus
- Excel-Export-Vorschau
- Custom Confirmation Dialog

### Demo-Videos (optional)
- Workflow 1: Testfall-Generierung (2 Min.)
- Workflow 2: Projekt-Management (1 Min.)
- Workflow 3: Export zu JIRA (30 Sek.)

---

**Ende der Projektübersicht**

