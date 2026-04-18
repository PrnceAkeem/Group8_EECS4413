@echo off
cd /d "%~dp0"
docker compose down --remove-orphans 2>nul
docker compose up --build -d
echo Waiting for server...
:wait
curl -s http://localhost:5050/health | find "ok" >nul 2>&1
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait
)
start http://localhost:5050
