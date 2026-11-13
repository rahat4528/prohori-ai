@echo off
title Prohori AI - All-in-One Local Setup & Launcher
cd /d "%~dp0"

echo ======================================================================
echo          PROHORI AI - Automated Local Stack Launcher
echo               Team Orionids - DIU CSE
echo ======================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in your system PATH!
    echo Please install Python 3.11+ from https://www.python.org/
    echo Make sure to check "Add python.exe to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: 2. Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 3. Setup .env if missing
if not exist ".env" (
    echo [*] Creating .env configuration from .env.example ...
    copy .env.example .env >nul
)

:: 4. Setup Python Virtual Environment if missing
if not exist ".venv" (
    echo [*] Creating Python virtual environment (.venv) ...
    python -m venv .venv
    echo [*] Installing Python dependencies (this may take 1-2 minutes) ...
    call .venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)

:: 5. Setup Frontend dependencies if missing
if not exist "web\node_modules" (
    echo [*] Installing frontend npm dependencies ...
    cd web
    call npm install
    cd ..
)

echo.
echo ======================================================================
echo Launching Prohori AI microservices in dedicated terminal windows...
echo ======================================================================

:: Launch 1: Event API & AI Core (Port 8000)
start "Prohori [1/4] - Event API & AI Core (Port 8000)" cmd /k "cd /d "%~dp0" && set PYTHONPATH=%~dp0api;%~dp0 && call .venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Launch 2: Deception Honeypot Sensor (Port 8081)
start "Prohori [2/4] - Deception Honeypot (Port 8081)" cmd /k "cd /d "%~dp0" && set PYTHONPATH=%~dp0api;%~dp0 && call .venv\Scripts\activate.bat && python -m uvicorn sensors.deception.main:app --host 127.0.0.1 --port 8081 --reload"

:: Launch 3: API Abuse Guard Rate Limiter (Port 8082)
start "Prohori [3/4] - API Abuse Guard (Port 8082)" cmd /k "cd /d "%~dp0" && set PYTHONPATH=%~dp0api;%~dp0 && set UPSTREAM_URL=http://127.0.0.1:8000 && set EVENT_API_URL=http://127.0.0.1:8000 && call .venv\Scripts\activate.bat && python -m uvicorn sensors.ratelimiter.main:app --host 127.0.0.1 --port 8082 --reload"

:: Launch 4: React Operator Console (Port 3000)
start "Prohori [4/4] - React Web Console (Port 3000)" cmd /k "cd /d "%~dp0web" && npm run dev"

echo.
echo ======================================================================
echo [SUCCESS] All 4 Prohori AI services are running!
echo ======================================================================
echo   - Operator Console:    http://localhost:3000
echo   - Event API & Core:    http://localhost:8000
echo   - Interactive Docs:    http://localhost:8000/docs
echo   - Deception Honeypot:  http://localhost:8081
echo   - API Abuse Guard:     http://localhost:8082
echo ======================================================================
echo.
echo Opening Web Console in browser...
ping 127.0.0.1 -n 4 >nul
start http://localhost:3000
