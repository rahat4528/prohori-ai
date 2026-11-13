# Prohori AI - All-in-One Local Development Stack Launcher (PowerShell)
# Author: Team Orionids - Daffodil International University (CSE)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

Set-Location $rootDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       PROHORI AI - Sentinel SOC Stack Launcher (Team Orionids)" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "[+] Root directory: $rootDir" -ForegroundColor Yellow

# 1. Check Python
try {
    $pyVer = & python --version 2>&1
    Write-Host "[+] Python detected: $pyVer" -ForegroundColor Green
} catch {
    Write-Error "[!] Python 3.11+ is required but not found in PATH."
    exit 1
}

# 2. Check Node.js
try {
    $nodeVer = & node --version 2>&1
    Write-Host "[+] Node.js detected: $nodeVer" -ForegroundColor Green
} catch {
    Write-Error "[!] Node.js 18+ is required but not found in PATH."
    exit 1
}

# 3. Setup .env
if (-not (Test-Path "$rootDir\.env")) {
    Write-Host "[*] Creating .env from .env.example ..." -ForegroundColor Yellow
    Copy-Item "$rootDir\.env.example" "$rootDir\.env"
}

# 4. Setup Python Virtual Environment
$venvPython = "$rootDir\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "[*] Creating Python virtual environment (.venv) ..." -ForegroundColor Yellow
    python -m venv "$rootDir\.venv"
    Write-Host "[*] Installing Python backend dependencies (1-2 minutes) ..." -ForegroundColor Yellow
    & "$rootDir\.venv\Scripts\pip.exe" install --upgrade pip
    & "$rootDir\.venv\Scripts\pip.exe" install -r "$rootDir\requirements.txt"
}

# 5. Setup Frontend dependencies
if (-not (Test-Path "$rootDir\web\node_modules")) {
    Write-Host "[*] Installing frontend npm dependencies ..." -ForegroundColor Yellow
    Push-Location "$rootDir\web"
    npm install
    Pop-Location
}

Write-Host "`n[+] Spawning Prohori AI microservices in dedicated windows..." -ForegroundColor Cyan

# Service 1: Event API & AI Core
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir'; `$env:PYTHONPATH='$rootDir\api;$rootDir'; & '$rootDir\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# Service 2: Deception Honeypot Sensor
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir'; `$env:PYTHONPATH='$rootDir\api;$rootDir'; & '$rootDir\.venv\Scripts\python.exe' -m uvicorn sensors.deception.main:app --host 127.0.0.1 --port 8081 --reload"

# Service 3: API Abuse Guard Rate Limiter
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir'; `$env:PYTHONPATH='$rootDir\api;$rootDir'; `$env:UPSTREAM_URL='http://127.0.0.1:8000'; `$env:EVENT_API_URL='http://127.0.0.1:8000'; & '$rootDir\.venv\Scripts\python.exe' -m uvicorn sensors.ratelimiter.main:app --host 127.0.0.1 --port 8082 --reload"

# Service 4: React Operator Console
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\web'; npm run dev"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] All 4 Prohori AI microservices launched!" -ForegroundColor Green
Write-Host "  - Operator Console:    http://localhost:3000" -ForegroundColor White
Write-Host "  - Event API & Core:    http://localhost:8000" -ForegroundColor White
Write-Host "  - Interactive Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Deception Honeypot:  http://localhost:8081" -ForegroundColor White
Write-Host "  - API Abuse Guard:     http://localhost:8082" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
