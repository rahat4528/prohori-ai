@echo off
echo ======================================================================
echo           PROHORI AI - Local Development Stack Launcher
echo ======================================================================
echo Starting Prohori Event API on http://localhost:8000 ...

set PYTHONPATH=%CD%\api;%CD%
call .venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
