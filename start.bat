@echo off
echo ================================
echo  AI Test Case Generator
echo  Docker Compose Starter
echo ================================
echo.
echo Wähle eine Option:
echo.
echo [1] Development starten (Hot-Reload, Port 5173)
echo [2] Production starten (Optimiert, Port 80)
echo [3] Services stoppen
echo [4] Alle Container aufräumen
echo.
set /p choice="Deine Wahl (1-4): "

if "%choice%"=="1" (
    echo.
    echo Starte Development-Umgebung...
    echo Frontend: http://localhost:5173
    echo Backend: http://localhost:8000
    echo API Docs: http://localhost:8000/docs
    echo.
    docker-compose -f docker-compose.dev.yml up --build
) else if "%choice%"=="2" (
    echo.
    echo Starte Production-Umgebung...
    echo Frontend: http://localhost
    echo Backend: http://localhost:8000
    echo API Docs: http://localhost:8000/docs
    echo.
    docker-compose up --build
) else if "%choice%"=="3" (
    echo.
    echo Stoppe alle Services...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo Fertig!
) else if "%choice%"=="4" (
    echo.
    echo Räume alle Container, Volumes und Images auf...
    docker-compose down -v --rmi all
    docker-compose -f docker-compose.dev.yml down -v --rmi all
    echo Fertig!
) else (
    echo.
    echo Ungültige Auswahl!
)

echo.
pause
