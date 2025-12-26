# ki-testfall-generator
Prototype for AI-based test case optimization (Master Thesis Project – SDE26)
# Projekt: KI-gestützte Testfall-Optimierung

**Version:** 0.2  
**Autorin:** Fadime Konuk  
**Studiengang:** SDE26  
**Semester:** 3 (Master Thesis Project)

---

## 1) Erweiterte funktionale Anforderungen (aus Sicht der Umsetzung)

Diese Anforderungen beschreiben, **wie** der Prototyp umgesetzt werden soll und **welche Funktionen** er im Detail enthalten muss. Sie beziehen sich auf die Benutzerinteraktion, UI-Elemente, Datenflüsse und KI-basierte Testfall-Generierung.

### FR-01 – Eingabemaske (Dashboard)
Es soll ein Dashboard bereitgestellt werden, auf dem Nutzer:innen verschiedene **Input-Felder** ausfüllen können, um Testfälle zu generieren.  
Die Eingabefelder umfassen mindestens:
- **Titel der User Story** (Textfeld)
- **Beschreibung der User Story** (mehrzeiliges Textfeld)
- _optional:_ **Akzeptanzkriterien**, **Systemkomponente**, **Priorität**
- **Button „Testfälle generieren“**

Beim Klick auf den Button ruft das System den KI-Service auf, der aus der Beschreibung automatisch Testfälle erzeugt.

### FR-02 – KI-gestützte Testfallgenerierung
Die KI soll aus der User-Story-Beschreibung automatisch eine **variable Anzahl** an Testfällen generieren – abhängig von:
- der **Länge und Komplexität** der User Story,
- den vorhandenen **Akzeptanzkriterien**,
- optionalen Zusatzinformationen (**Systemkomponente**, **Risikostufe**).

Jeder generierte Testfall soll enthalten:
- **Titel**
- **Vorbedingung (Precondition)**
- **Aktionen (Steps)**
- **Erwartetes Ergebnis (Expected Result)**

Das System verwendet ein **LLM** (z. B. GPT oder lokales Modell), um diese Felder aus dem Text der User Story zu extrahieren oder zu generieren.

### FR-03 – Automatische Organisation und Ordnerstruktur
Wird eine User Story verarbeitet, soll automatisch ein **Ordner** erstellt werden, der den **Titel der User Story** trägt. Alle zugehörigen Testfälle werden innerhalb dieses Ordners gespeichert.

Die Testfälle können innerhalb des Systems in **Hauptordner** verschoben werden (z. B. pro Projekt oder Release). Diese Hauptordner sind **manuell benennbar** und dienen der **Strukturierung**.

---

### FR-04 – Testplan-Verwaltung
Es soll eine eigene **Testplan-Seite** geben, auf der alle erstellten Testfälle angezeigt, gefiltert und bearbeitet werden können.

**Funktionen:**
- Auswahl einzelner Testfälle  
- Bearbeiten von Titel, Vorbedingung, Aktion und erwartetem Ergebnis  
- Löschen oder Verschieben von Testfällen  
- Markieren von Testfällen als *„Übernommen“*, *„Zu prüfen“*, *„Verworfen“*

Wenn eine User Story auf dem Dashboard verarbeitet wurde, kann sie mit einem Button **„merken“** markiert werden.  
Markierte User Stories erscheinen automatisch im **Testplan** als *„bereit zur Bearbeitung“*.

---

### FR-05 – Nachverfolgung (Traceability)
Für jede User Story wird im System festgehalten:
- Welche Testfälle daraus generiert wurden  
- In welchem Ordner/Testplan diese liegen  
- Ob sie manuell verändert wurden  

Damit entsteht eine einfache **Traceability** zwischen *User Story ↔ Testfälle ↔ Testplan*.

### FR-06 – Exportfunktionen
Die generierten und bearbeiteten Testfälle können exportiert werden:
- als **CSV- oder Excel-Datei**
- im Format, das in **Jira** oder **Azure DevOps Test Plans** importiert werden kann

Der Export enthält alle relevanten Felder:
- **Titel**
- **Vorbedingung**
- **Aktionen**
- **Erwartetes Ergebnis**
- **Status**
- **Quelle der User Story**

---

### FR-07 – Dashboard & Usability
Das Dashboard dient als zentrale Steuerzentrale des Systems und bietet:
- eine klare Übersicht über eingegebene **User Stories**
- einen **Fortschrittsindikator** (*„in Bearbeitung“*, *„fertig generiert“*)
- **einfache Bedienung** (Button-basiert)
- **strukturierte Ansicht** der generierten Testfälle mit Checkboxen zur Auswahl

---

### FR-08 – Erweiterte Projektstruktur
Das System soll es ermöglichen, mehrere **Projekte** zu verwalten.  
Jedes Projekt hat eigene User Stories, Testfälle und Testpläne.

Innerhalb eines Projekts:
- können User Stories **hinzugefügt, generiert oder gelöscht** werden
- werden Testfälle **automatisch in die zugehörigen Ordner** abgelegt
- können **Hauptordner (Projektordner)** individuell benannt werden

---

### FR-09 – KI-Parametersteuerung (optional)
Fortgeschrittene Nutzer:innen sollen einstellen können:
- **Anzahl der zu generierenden Testfälle**
- **Detaillierungsgrad** (z. B. nur positive Fälle oder auch negative Szenarien)
- **Modellwahl** (z. B. GPT‑4, LLaMA, lokale Instanz)

### FR-10 – Interaktives Auswahl- und Merksystem für Testfälle
Nach der Eingabe einer **User Story** im Dashboard und dem Klick auf **„Testfälle generieren“** werden automatisch mehrere KI-generierte Testfälle angezeigt.  

Der/die Nutzer:in kann:

1. **Testfälle einzeln auswählen oder abwählen** (Checkbox oder Toggle).  
   - Wird ein Testfall ausgewählt, gilt er als *genehmigt* oder *relevant*.  
   - Wird ein Testfall abgewählt, wird er im Hintergrund als *verworfen* markiert.  

2. **Gesamte User Story merken**  
   - Mit einem separaten Button **„User Story merken“** kann die gesamte US gespeichert werden, auch wenn keine Auswahl erfolgt ist.  
   - In diesem Fall werden **alle generierten Testfälle automatisch übernommen.**  

3. **Automatische Synchronisation mit dem Testplan**  
   - Sobald ein Testfall oder eine US markiert wurde, legt das System automatisch einen **Ordner im Testplan** an, dessen Name dem **Titel der User Story** entspricht.  
   - Alle ausgewählten (oder im Fall einer „gemerkten“ US: alle) Testfälle werden in diesen Ordner kopiert.  
   - Der Ordner wird als *„neu angelegt“* markiert und kann später im Testplan bearbeitet oder verschoben werden.  

4. **Reversibilität (Abwahl-Logik)**  
   - Wenn ein Testfall im Dashboard wieder **abgewählt** wird, wird dieser automatisch **aus dem zugehörigen Testplan-Ordner entfernt**.  
   - Wenn eine gesamte US **„entmerkt“** wird, wird der zugehörige Ordner im Testplan **gelöscht oder als „inaktiv“ markiert.**  

5. **Statusanzeige**  
   - Dashboard zeigt an, ob eine User Story bereits im Testplan vorhanden ist (*„Synchronisiert“*, *„In Arbeit“*, *„Nicht übernommen“*).  
   - Testplan zeigt umgekehrt an, aus welcher US ein Testfall stammt (z. B. *„Quelle: US-123 – Login Feature“*).  

---

#### Beispiel-Szenario
> Du gibst im Dashboard eine User Story *„Als Benutzer möchte ich mich einloggen“* ein.  
> Nach Klick auf **„Generieren“** erstellt die KI fünf Testfälle.  
> Du wählst drei davon aus und klickst auf **„Übernehmen“**.  
> → Das System erstellt automatisch im Testplan den Ordner **„US – Login“** und legt dort die drei gewählten Testfälle ab.  
> Wenn du später im Dashboard einen weiteren Testfall abwählst, verschwindet dieser auch aus dem Testplan-Ordner.  
> Wenn du stattdessen auf **„US merken“** klickst, kopiert das System automatisch alle fünf Testfälle in den Testplan.

---

### FR-11 – Automatische Aktualisierung & Nachverfolgung
- Das System speichert für jede US:  
  - **Erstellungsdatum**, **ausgewählte Testfälle**, **Änderungsverlauf**  
  - **Synchronisierungsstatus** (z. B. *neu*, *aktualisiert*, *gelöscht*)  
- Änderungen an Testfällen (Titel, Aktion, erwartetes Ergebnis) werden im Testplan-Modul nachverfolgt und mit der ursprünglichen US verknüpft.  

---

## 2) Zusammenfassung der Interaktion
**Ablauf (Use-Flow):**
1. Nutzer:in öffnet das Dashboard.  
2. Gibt Titel und Beschreibung einer User Story ein.  
3. Klickt auf **„Testfälle generieren“** → KI erzeugt Testfälle.  
4. Die generierten Testfälle erscheinen in einem automatisch erstellten Ordner.  
5. Nutzer:in kann Testfälle markieren, bearbeiten oder in Hauptordner verschieben.  
6. Markierte User Stories erscheinen im Testplan.  
7. Export in Jira/Azure ist möglich.
