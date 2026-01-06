#  Docker Setup

## Schnellstart

### Production Build (optimiert, ohne Hot-Reload)
```bash
docker-compose up --build
```
- **Frontend**: http://localhost (Port 80)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### Development Build (mit Hot-Reload)
```bash
docker-compose -f docker-compose.dev.yml up --build
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## 🗄️ Datenbank

Die Anwendung verwendet **PostgreSQL 15** als Datenbank:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│ PostgreSQL  │
│   (React)   │     │  (FastAPI)  │     │  Database   │
│   :5173     │     │   :8000     │     │   :5432     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Datenbank-Verbindung
| Parameter | Wert |
|-----------|------|
| Host | localhost (oder `db` im Container) |
| Port | 5432 |
| Datenbank | testgen_db |
| Benutzer | testgen |
| Passwort | testgen_secret |

### Datenspeicherort
Die Daten werden in einem Docker Volume gespeichert:
- **Development**: `ki-testfall-generator_postgres_data_dev`
- **Production**: `ki-testfall-generator_postgres_data`

Windows-Pfad: `\\wsl$\docker-desktop-data\data\docker\volumes\...`

Mehr Details: [DATENBANK.md](DATENBANK.md)

##  Voraussetzungen

- Docker Desktop installiert
- `.env` Datei im `/backend` Verzeichnis mit deinem OpenAI API Key:
  ```
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-3.5-turbo
  ```

##  Verwendung

### Alle Services starten
```bash
# Production
docker-compose up

# Development (empfohlen für Entwicklung)
docker-compose -f docker-compose.dev.yml up
```

### Services im Hintergrund starten
```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up -d
```

### Services neu bauen
```bash
# Production
docker-compose up --build

# Development
docker-compose -f docker-compose.dev.yml up --build
```

### Services stoppen
```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

### Logs anzeigen
```bash
# Alle Services
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend
```

### Container aufräumen
```bash
# Stoppe und entferne Container, Netzwerke, Volumes
docker-compose down -v

# Entferne auch Images
docker-compose down -v --rmi all
```

##  Unterschiede zwischen Production und Development

### Production (`docker-compose.yml`)
-  Frontend wird gebaut und mit Nginx ausgeliefert
-  Optimierte Build-Größe
-  Schnellere Ladezeiten
-  Kein Hot-Reload
-  Frontend auf Port 80

### Development (`docker-compose.dev.yml`)
-  Hot-Reload für Frontend (Vite)
-  Hot-Reload für Backend (uvicorn --reload)
-  Code-Änderungen werden sofort übernommen
-  Besseres Debugging
-  Frontend auf Port 5173

##  Volumes

### PostgreSQL Daten (persistent)
- `postgres_data_dev:/var/lib/postgresql/data` - Datenbank-Dateien (Development)
- `postgres_data:/var/lib/postgresql/data` - Datenbank-Dateien (Production)

⚠️ **Wichtig**: Die Daten bleiben erhalten auch wenn Container gestoppt werden!

### Volume inspizieren
```bash
docker volume inspect ki-testfall-generator_postgres_data_dev
```

### Daten löschen
```bash
# Container UND Daten löschen
docker-compose down -v
```

### Development Code-Mounting
- `./backend:/app` - Backend-Code wird gemountet (Hot-Reload)
- `./frontend:/app` - Frontend-Code wird gemountet (Hot-Reload)

##  Netzwerk

Beide Services laufen im gleichen Docker-Netzwerk `testcase-network`:
- Backend erreichbar unter `http://backend:8000` (intern)
- Frontend Nginx proxied `/api` zum Backend

##  Troubleshooting

### Container startet nicht
```bash
# Logs prüfen
docker-compose logs backend
docker-compose logs frontend

# Container neu bauen
docker-compose up --build
```

### Port bereits belegt
```bash
# Windows: Finde Prozess auf Port 8000
netstat -ano | findstr :8000

# Beende Prozess mit Task Manager oder:
taskkill /PID <PID> /F
```

### OpenAI API Key fehlt
```bash
# Prüfe .env Datei in /backend
cat backend/.env

# Sollte enthalten:
# OPENAI_API_KEY=sk-...
```

##  Empfohlener Workflow

1. **Development starten**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Code ändern** - Änderungen werden automatisch übernommen

3. **Testen**: http://localhost:5173

4. **Production Build testen**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   docker-compose up --build
   ```

5. **Aufräumen**:
   ```bash
   docker-compose down -v
   ```

