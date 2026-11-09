# Prohori AI - Windows PowerShell Startup Script
# Sets PYTHONPATH and launches the FastAPI backend and sensors safely.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

$env:PYTHONPATH = "$rootDir\api;$rootDir"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       PROHORI AI - Sentinel SOC Stack Launcher (Team Orionids)" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "[+] Root directory: $rootDir" -ForegroundColor Yellow
Write-Host "[+] PYTHONPATH set to: $env:PYTHONPATH" -ForegroundColor Yellow
Write-Host "[+] Launching Event API on http://127.0.0.1:8000 ..." -ForegroundColor Green

& "$rootDir\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
