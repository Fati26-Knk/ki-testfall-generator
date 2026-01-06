# 🗄️ Datenbank-Dokumentation

## Übersicht

Die Anwendung verwendet **PostgreSQL 15** als Datenbank. Die Daten werden in einem Docker Volume gespeichert und sind persistent.

## Architektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│ PostgreSQL  │
│   (React)   │     │  (FastAPI)  │     │  Database   │
│   :5173     │     │   :8000     │     │   :5432     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ SQLAlchemy  │
                    │    ORM      │
                    └─────────────┘
```

## Datenbank-Tabellen

### `projects` - Projekte
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | INTEGER | Primary Key |
| name | VARCHAR(255) | Eindeutiger Projektname (sanitized) |
| description | TEXT | Originaler Projektname |
| created_at | DATETIME | Erstellungsdatum |
| updated_at | DATETIME | Letzte Änderung |

### `user_stories` - User Stories
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | INTEGER | Primary Key |
| project_id | INTEGER | Foreign Key → projects.id |
| title | VARCHAR(500) | Titel der User Story |
| description | TEXT | Vollständige User Story |
| folder_name | VARCHAR(255) | Sanitized Ordnername |
| status | VARCHAR(50) | Status (new, in_progress, done) |
| created_at | DATETIME | Erstellungsdatum |
| updated_at | DATETIME | Letzte Änderung |

### `test_cases` - Testfälle
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | INTEGER | Primary Key |
| user_story_id | INTEGER | Foreign Key → user_stories.id |
| title | VARCHAR(500) | Testfall-Titel |
| description | TEXT | Beschreibung |
| test_type | VARCHAR(100) | Typ (functional, edge_case, etc.) |
| priority | VARCHAR(50) | Priorität (High, Medium, Low) |
| preconditions | JSON | Liste der Vorbedingungen |
| steps | JSON | Liste der Testschritte |
| expected_result | TEXT | Erwartetes Ergebnis |
| covers | JSON | Abgedeckte Anforderungen |
| created_at | DATETIME | Erstellungsdatum |

### `staging_testcases` - Gemerkte Testfälle (Staging)
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | INTEGER | Primary Key |
| session_id | VARCHAR(100) | Session-ID |
| title | VARCHAR(500) | Testfall-Titel |
| description | TEXT | Beschreibung |
| test_type | VARCHAR(100) | Typ |
| priority | VARCHAR(50) | Priorität |
| preconditions | JSON | Vorbedingungen |
| steps | JSON | Testschritte |
| expected_result | TEXT | Erwartetes Ergebnis |
| covers | JSON | Abgedeckte Anforderungen |
| user_story_text | TEXT | Zugehörige User Story |
| created_at | DATETIME | Erstellungsdatum |

## Datenspeicherung

### Wo werden die Daten gespeichert?

Die Daten werden in einem **Docker Volume** gespeichert:

```
Volume Name: ki-testfall-generator_postgres_data_dev (Development)
Volume Name: ki-testfall-generator_postgres_data (Production)
```

### Speicherort auf Windows (Docker Desktop)

```
\\wsl$\docker-desktop-data\data\docker\volumes\ki-testfall-generator_postgres_data_dev\_data
```

### Volume inspizieren

```bash
docker volume inspect ki-testfall-generator_postgres_data_dev
```

## Verbindungsdetails

### Development
```
Host: localhost (oder db im Container)
Port: 5432
Datenbank: testgen_db
Benutzer: testgen
Passwort: testgen_secret
```

### Connection String
```
postgresql://testgen:testgen_secret@db:5432/testgen_db
```

## Datenbank-Management

### Mit PostgreSQL verbinden (via Docker)

```bash
# In den Container gehen
docker exec -it testcase-db-dev psql -U testgen -d testgen_db

# SQL-Befehle ausführen
\dt                    # Alle Tabellen anzeigen
\d projects           # Tabellenstruktur anzeigen
SELECT * FROM projects;  # Alle Projekte
SELECT * FROM user_stories;  # Alle User Stories
SELECT * FROM test_cases;    # Alle Testfälle
\q                     # Beenden
```

### Datenbank-Backup erstellen

```bash
# Backup erstellen
docker exec testcase-db-dev pg_dump -U testgen testgen_db > backup.sql

# Backup wiederherstellen
docker exec -i testcase-db-dev psql -U testgen testgen_db < backup.sql
```

### Datenbank zurücksetzen

```bash
# Alle Daten löschen (Volume entfernen)
docker-compose down -v
docker-compose up -d
```

⚠️ **Achtung**: Mit `-v` werden alle Daten unwiderruflich gelöscht!

## SQLAlchemy ORM

Die Datenbank-Modelle sind in `backend/app/database.py` definiert:

```python
from app.database import Project, UserStory, TestCase, StagingTestCase

# Neue Session erstellen
from app.database import SessionLocal
db = SessionLocal()

# Projekt erstellen
project = Project(name="MeinProjekt", description="Beschreibung")
db.add(project)
db.commit()

# Projekte abfragen
projects = db.query(Project).all()
```

## Migrations (Alembic)

Für Datenbankmigrationen ist Alembic vorbereitet:

```bash
# Migration erstellen
alembic revision --autogenerate -m "Beschreibung"

# Migrationen ausführen
alembic upgrade head

# Migrationen rückgängig machen
alembic downgrade -1
```

## Vorteile von PostgreSQL

| Vorher (JSON-Dateien) | Jetzt (PostgreSQL) |
|-----------------------|--------------------|
| ❌ Keine Transaktionen | ✅ ACID-Transaktionen |
| ❌ Race Conditions möglich | ✅ Concurrent Access sicher |
| ❌ Keine Relationen | ✅ Referentielle Integrität |
| ❌ Langsam bei vielen Daten | ✅ Optimierte Abfragen |
| ❌ Keine Backups | ✅ Einfache Backups |
| ❌ Nicht skalierbar | ✅ Horizontal skalierbar |

## Troubleshooting

### Datenbank startet nicht

```bash
# Logs prüfen
docker logs testcase-db-dev

# Container neu starten
docker-compose restart db
```

### Verbindung fehlgeschlagen

```bash
# Prüfen ob Container läuft
docker ps | grep testcase-db

# Healthcheck Status
docker inspect testcase-db-dev | grep -A 5 "Health"
```

### Daten sind weg

Prüfe ob das Volume noch existiert:
```bash
docker volume ls | grep postgres
```

Falls nicht, wurde es mit `docker-compose down -v` gelöscht.

## Sicherheit

⚠️ **Wichtig für Produktion:**

1. **Passwort ändern**: Das Standard-Passwort `testgen_secret` ist nur für Development!
2. **Port nicht exponieren**: In Produktion Port 5432 nicht nach außen freigeben
3. **Backups**: Regelmäßige Backups einrichten
4. **SSL**: Verschlüsselte Verbindung aktivieren
