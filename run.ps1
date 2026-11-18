# Prohori AI - All-in-One Local Development Stack Launcher (PowerShell)
# Author: Team Orionids
# Competition: International AI Builders Congress 2026 (InfraSphere AI -> SecureAI)

$ErrorActionPreference = "Stop"

# 1. Ensure working directory is the project root without trailing slash
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
$scriptDir = $scriptDir.TrimEnd('\').TrimEnd('/')
Set-Location $scriptDir

# 2. Automatically bypass execution policy in current session if possible
try {
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction SilentlyContinue
} catch {}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       PROHORI AI - Sentinel SOC Stack Launcher (Team Orionids)" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "[+] Root directory: $scriptDir" -ForegroundColor Yellow

# 3. Check Python (Supports python and Windows py launcher)
$pythonCmd = "python"
try {
    $null = & python --version 2>&1
} catch {
    try {
        $null = & py -3 --version 2>&1
        $pythonCmd = "py -3"
    } catch {
        Write-Error "[!] Python 3.11+ is required but not found in PATH. Please install Python from https://www.python.org/ and check 'Add python.exe to PATH'."
        exit 1
    }
}
Write-Host "[+] Python runtime detected ($pythonCmd)" -ForegroundColor Green

# 4. Check Node.js & npm
try {
    $nodeVer = & node --version 2>&1
    $npmVer = & npm --version 2>&1
    Write-Host "[+] Node.js detected: $nodeVer (npm: $npmVer)" -ForegroundColor Green
} catch {
    Write-Error "[!] Node.js 18+ and npm are required but not found in PATH. Please install Node.js from https://nodejs.org/"
    exit 1
}

# 5. Setup .env configuration
if (-not (Test-Path "$scriptDir\.env")) {
    Write-Host "[*] Creating .env from .env.example ..." -ForegroundColor Yellow
    Copy-Item "$scriptDir\.env.example" "$scriptDir\.env"
}

# 6. Setup Python Virtual Environment (.venv) & verify dependencies
$venvPython = "$scriptDir\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "[*] Creating Python virtual environment (.venv) ..." -ForegroundColor Yellow
    if ($pythonCmd -eq "py -3") {
        & py -3 -m venv "$scriptDir\.venv"
    } else {
        & python -m venv "$scriptDir\.venv"
    }
}

# Verify critical backend package is installed; self-heal if interrupted
if (-not (Test-Path "$scriptDir\.venv\Lib\site-packages\uvicorn")) {
    Write-Host "[*] Installing Python backend dependencies (this may take 1-2 minutes) ..." -ForegroundColor Yellow
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r "$scriptDir\requirements.txt"
}

# 7. Setup Frontend dependencies if missing
if (-not (Test-Path "$scriptDir\web\node_modules\vite")) {
    Write-Host "[*] Installing frontend npm dependencies ..." -ForegroundColor Yellow
    npm --prefix "$scriptDir\web" install
}

Write-Host "`n[+] Spawning Prohori AI microservices in dedicated terminal windows..." -ForegroundColor Cyan

# Service 1: Event API & AI Core (Port 8000)
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$scriptDir'; `$env:PYTHONPATH='$scriptDir\api;$scriptDir'; & '$venvPython' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# Service 2: Deception Honeypot Sensor (Port 8081)
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$scriptDir'; `$env:PYTHONPATH='$scriptDir\api;$scriptDir'; & '$venvPython' -m uvicorn sensors.deception.main:app --host 0.0.0.0 --port 8081 --reload"

# Service 3: API Abuse Guard Rate Limiter (Port 8082)
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$scriptDir'; `$env:PYTHONPATH='$scriptDir\api;$scriptDir'; `$env:UPSTREAM_URL='http://127.0.0.1:8000'; `$env:EVENT_API_URL='http://127.0.0.1:8000'; & '$venvPython' -m uvicorn sensors.ratelimiter.main:app --host 0.0.0.0 --port 8082 --reload"

# Service 4: Asset Discovery Sensor (Port 8083)
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$scriptDir'; `$env:PYTHONPATH='$scriptDir\api;$scriptDir'; `$env:EVENT_API_URL='http://127.0.0.1:8000'; & '$venvPython' -m uvicorn sensors.discovery.main:app --host 0.0.0.0 --port 8083 --reload"

# Service 5: React Operator Console (Port 3000)
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "Set-Location '$scriptDir'; npm --prefix web run dev"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] All 5 Prohori AI microservices launched!" -ForegroundColor Green
Write-Host "  - Operator Console:        http://localhost:3000" -ForegroundColor White
Write-Host "  - Event API & Core:        http://localhost:8000" -ForegroundColor White
Write-Host "  - Interactive Docs:        http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Deception Honeypot:      http://localhost:8081" -ForegroundColor White
Write-Host "  - API Abuse Guard:         http://localhost:8082" -ForegroundColor White
Write-Host "  - Asset Discovery Sensor:  http://localhost:8083" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

Start-Sleep -Seconds 3
try {
    Start-Process "http://localhost:3000"
} catch {}
