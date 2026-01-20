# MoSCoW-Anforderungen

## Projektübersicht
**Projekt:** AI Test Case Generator  
**Version:** 1.0  
**Datum:** Januar 2026

---

## 1. MUST (Muss-Kriterien)

Die folgenden Anforderungen sind **zwingend erforderlich** für das Minimal Viable Product (MVP).

| ID | Anforderung | Beschreibung |
|----|-------------|--------------|
| MK-1 | Testfall-Generierung | Automatische Generierung von strukturierten Testfällen aus User Story-Text mittels KI |
| MK-2 | Dashboard-Eingabeformular | Webbasiertes Formular zur Eingabe von User Stories |
| MK-3 | Testfall-Anzeige | Darstellung der generierten Testfälle in strukturierter Form (Cards) |
| MK-4 | Projekt-Management | Verwaltung von Projekten als Organisationseinheiten |
| MK-5 | Testfall-Persistenz | Speicherung von Testfällen zur späteren Verwendung |
| MK-6 | TestPlan-Übersicht | Zentrale Ansicht aller gespeicherten Testfälle organisiert nach Projekten |
| MK-7 | Testfall-Bearbeitung | Manuelle Anpassung generierter Testfälle (Inline-Editing) |
| MK-8 | Testfall-Löschung | Entfernen von Testfällen aus Projekten |
| MK-9 | Excel-Export | Export von Testfällen als Excel-Datei (.xlsx) |
| MK-10 | REST API | Backend-API für alle Frontend-Operationen mit OpenAPI-Dokumentation |

---

## 2. SHOULD (Soll-Kriterien)

Die folgenden Anforderungen sind **wünschenswert** und erhöhen den Wert des Produkts signifikant.

| ID | Anforderung | Beschreibung | Status |
|----|-------------|--------------|--------|
| SK-1 | Dokument-Upload | Hochladen von Anforderungsdokumenten (.docx, .txt) zur erweiterten Kontextanalyse | ✅ Implementiert |
| SK-2 | Umfassende Testfall-Generierung | Modus für erweiterte Testabdeckung ("Kompakt" vs. "Umfassend") | ✅ Implementiert |
| SK-3 | Re-Generation mit Kontext | Erneute Generierung mit bisherigen Testfällen als Referenz | ✅ Implementiert |
| SK-4 | Projekt-Umbenennung | Nachträgliche Änderung von Projektnamen | ✅ Implementiert |
| SK-5 | Expand/Collapse All | Bulk-Steuerung für Auf-/Zuklappen von User Stories | ✅ Implementiert |
| SK-6 | Custom Confirmation Dialogs | Benutzerdefinierte Bestätigungsdialoge statt Browser-Alerts | ✅ Implementiert |
| SK-7 | Toast-Benachrichtigungen | Nicht-invasive Feedback-Messages für Benutzeraktionen | ✅ Implementiert |
| SK-8 | JIRA/Azure DevOps-Export-Format | Export-Formate optimiert für gängige Test-Management-Tools | ✅ Implementiert |

---

## 3. COULD (Kann-Kriterien)

Die folgenden Anforderungen sind **optionale Erweiterungen**, die den Funktionsumfang zusätzlich verbessern.

| ID | Anforderung | Beschreibung | Status |
|----|-------------|--------------|--------|
| KK-1 | Docker-Containerisierung | Vollständige Container-basierte Deployment-Lösung | ✅ Implementiert |
| KK-2 | API-Dokumentation | Automatisch generierte, interaktive API-Dokumentation (Swagger) | ✅ Implementiert |
| KK-3 | Responsive Design | Optimierung für verschiedene Bildschirmgrößen (Desktop, Tablet, Mobile) | ✅ Implementiert |
| KK-4 | Erweiterte Fehlerbehandlung | Robuste Error-Handling-Strategie | ✅ Implementiert |
| KK-5 | Logo-Navigation | Klick auf Logo führt zur Dashboard-Ansicht | ✅ Implementiert |

---

## 4. WON'T (Abgrenzungs-Kriterien)

Die folgenden Funktionalitäten sind **explizit nicht Teil** dieses Projekts.

| ID | Anforderung | Begründung |
|----|-------------|------------|
| AK-1 | Test-Automatisierung (Execution) | Fokus liegt auf Testfall-Generierung, nicht auf Ausführung |
| AK-2 | Defect-Tracking / Bug-Management | Bug-Tracking ist eigenständige Domäne (JIRA, Azure DevOps) |
| AK-3 | Requirement-Management | Requirement-Management ist separate Disziplin |
| AK-4 | Test-Daten-Management | Testdaten-Generierung ist komplexe separate Aufgabe |
| AK-5 | Performance-Testing / Load-Testing | Performance-Tests benötigen spezielle Tools (JMeter, K6) |
| AK-6 | Mobile App / Native Apps | Projekt ist als Web-Anwendung konzipiert |
| AK-7 | AI-Model-Training / Fine-Tuning | Training von LLMs benötigt erhebliche Ressourcen |
| AK-8 | Real-Time-Collaboration | Real-Time-Collaboration benötigt komplexe Infrastruktur |

---

## Zusammenfassung

| Kategorie | Anzahl | Umsetzung |
|-----------|--------|-----------|
| **MUST** | 10 | 10/10 (100%) |
| **SHOULD** | 8 | 8/8 (100%) |
| **COULD** | 5 | 5/5 (100%) |
| **WON'T** | 8 | Bewusst ausgegrenzt |

**Gesamtergebnis:** Alle MUST-, SHOULD- und COULD-Anforderungen wurden erfolgreich implementiert.
