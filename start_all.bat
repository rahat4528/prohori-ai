@echo off
title Prohori AI - All-in-One Local Setup and Launcher
cd /d "%~dp0"

:: Enforce clean root directory path without trailing backslash
set "PROHORI_ROOT=%~dp0"
if "%PROHORI_ROOT:~-1%"=="\" set "PROHORI_ROOT=%PROHORI_ROOT:~0,-1%"

echo ======================================================================
echo          PROHORI AI - Automated Local Stack Launcher
echo               Team Orionids - East West University (EWU)
echo ======================================================================
echo.

:: 1. Check Python (Supports python and Windows py launcher)
set "PY_CMD=python"
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py -3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_CMD=py -3"
    ) else (
        echo [ERROR] Python is not found in your system PATH!
        echo Please install Python 3.11+ from https://www.python.org/
        echo Make sure to check "Add python.exe to PATH" during installation.
        echo.
        pause
        exit /b 1
    )
)

:: 2. Check Node.js and npm
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 3. Setup .env configuration if missing
if not exist "%PROHORI_ROOT%\.env" (
    echo [*] Creating .env configuration from .env.example ...
    copy "%PROHORI_ROOT%\.env.example" "%PROHORI_ROOT%\.env" >nul
)

:: 4. Setup Python Virtual Environment [.venv] and verify dependencies
if not exist "%PROHORI_ROOT%\.venv\Scripts\python.exe" (
    echo [*] Creating Python virtual environment .venv ...
    %PY_CMD% -m venv "%PROHORI_ROOT%\.venv"
)

:: Verify critical backend package is installed; self-heal if missing or interrupted
if not exist "%PROHORI_ROOT%\.venv\Lib\site-packages\uvicorn" (
    echo [*] Installing Python backend dependencies [this may take 1-2 minutes] ...
    "%PROHORI_ROOT%\.venv\Scripts\python.exe" -m pip install --upgrade pip
    "%PROHORI_ROOT%\.venv\Scripts\python.exe" -m pip install -r "%PROHORI_ROOT%\requirements.txt"
)

:: 5. Setup Frontend dependencies if missing
if not exist "%PROHORI_ROOT%\web\node_modules\vite" (
    echo [*] Installing frontend npm dependencies ...
    call npm --prefix "%PROHORI_ROOT%\web" install
)

echo.
echo ======================================================================
echo Launching Prohori AI microservices in dedicated terminal windows...
echo ======================================================================

:: Launch 1: Event API and AI Core [Port 8000]
start "Prohori [1/4] - Event API and AI Core (Port 8000)" cmd /k "cd /d "%PROHORI_ROOT%" && set "PYTHONPATH=%PROHORI_ROOT%\api;%PROHORI_ROOT%" && "%PROHORI_ROOT%\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Launch 2: Deception Honeypot Sensor [Port 8081]
start "Prohori [2/4] - Deception Honeypot (Port 8081)" cmd /k "cd /d "%PROHORI_ROOT%" && set "PYTHONPATH=%PROHORI_ROOT%\api;%PROHORI_ROOT%" && "%PROHORI_ROOT%\.venv\Scripts\python.exe" -m uvicorn sensors.deception.main:app --host 0.0.0.0 --port 8081 --reload"

:: Launch 3: API Abuse Guard Rate Limiter [Port 8082]
start "Prohori [3/4] - API Abuse Guard (Port 8082)" cmd /k "cd /d "%PROHORI_ROOT%" && set "PYTHONPATH=%PROHORI_ROOT%\api;%PROHORI_ROOT%" && set "UPSTREAM_URL=http://127.0.0.1:8000" && set "EVENT_API_URL=http://127.0.0.1:8000" && "%PROHORI_ROOT%\.venv\Scripts\python.exe" -m uvicorn sensors.ratelimiter.main:app --host 0.0.0.0 --port 8082 --reload"

:: Launch 4: React Operator Console [Port 3000]
start "Prohori [4/4] - React Web Console (Port 3000)" cmd /k "cd /d "%PROHORI_ROOT%" && call npm --prefix web run dev"

echo.
echo ======================================================================
echo [SUCCESS] All 4 Prohori AI services are running!
echo ======================================================================
echo   - Operator Console:    http://localhost:3000
echo   - Event API and Core:  http://localhost:8000
echo   - Interactive Docs:    http://localhost:8000/docs
echo   - Deception Honeypot:  http://localhost:8081
echo   - API Abuse Guard:     http://localhost:8082
echo ======================================================================
echo.
echo Opening Web Console in browser...
ping 127.0.0.1 -n 4 >nul
start http://localhost:3000
