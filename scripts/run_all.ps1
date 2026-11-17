# Prohori AI - All-in-One Local Development Stack Launcher (PowerShell)
# Author: Team Orionids - East West University (CSE)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$rootDir = $rootDir.TrimEnd('\').TrimEnd('/')

Set-Location $rootDir

# Automatically bypass execution policy in current session
try {
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction SilentlyContinue
} catch {}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       PROHORI AI - Sentinel SOC Stack Launcher (Team Orionids)" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "[+] Root directory: $rootDir" -ForegroundColor Yellow

# 1. Check Python
$pythonCmd = "python"
try {
    $null = & python --version 2>&1
} catch {
    try {
        $null = & py -3 --version 2>&1
        $pythonCmd = "py -3"
    } catch {
        Write-Error "[!] Python 3.11+ is required but not found in PATH."
        exit 1
    }
}
Write-Host "[+] Python detected: $pythonCmd" -ForegroundColor Green

# 2. Check Node.js & npm
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

# 4. Setup Python Virtual Environment (.venv) & verify dependencies
$venvPython = "$rootDir\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "[*] Creating Python virtual environment (.venv) ..." -ForegroundColor Yellow
    if ($pythonCmd -eq "py -3") {
        & py -3 -m venv "$rootDir\.venv"
    } else {
        & python -m venv "$rootDir\.venv"
    }
}

if (-not (Test-Path "$rootDir\.venv\Lib\site-packages\uvicorn")) {
    Write-Host "[*] Installing Python backend dependencies (1-2 minutes) ..." -ForegroundColor Yellow
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r "$rootDir\requirements.txt"
}

# 5. Setup Frontend dependencies
if (-not (Test-Path "$rootDir\web\node_modules\vite")) {
    Write-Host "[*] Installing frontend npm dependencies ..." -ForegroundColor Yellow
    npm --prefix "$rootDir\web" install
}

Write-Host "`n[+] Spawning Prohori AI microservices in dedicated windows..." -ForegroundColor Cyan

# Service 1: Event API & AI Core
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$rootDir'; `$env:PYTHONPATH='$rootDir\api;$rootDir'; & '$venvPython' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# Service 2: Deception Honeypot Sensor
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$rootDir'; `$env:PYTHONPATH='$rootDir\api;$rootDir'; & '$venvPython' -m uvicorn sensors.deception.main:app --host 0.0.0.0 --port 8081 --reload"

# Service 3: API Abuse Guard Rate Limiter
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$rootDir'; `$env:PYTHONPATH='$rootDir\api;$rootDir'; `$env:UPSTREAM_URL='http://127.0.0.1:8000'; `$env:EVENT_API_URL='http://127.0.0.1:8000'; & '$venvPython' -m uvicorn sensors.ratelimiter.main:app --host 0.0.0.0 --port 8082 --reload"

# Service 4: React Operator Console
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$rootDir'; npm --prefix web run dev"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] All 4 Prohori AI microservices launched!" -ForegroundColor Green
Write-Host "  - Operator Console:    http://localhost:3000" -ForegroundColor White
Write-Host "  - Event API & Core:    http://localhost:8000" -ForegroundColor White
Write-Host "  - Interactive Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Deception Honeypot:  http://localhost:8081" -ForegroundColor White
Write-Host "  - API Abuse Guard:     http://localhost:8082" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

Start-Sleep -Seconds 3
try {
    Start-Process "http://localhost:3000"
} catch {}
