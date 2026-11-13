# Prohori AI ("প্রহরী") — Step-by-Step Local Testing Guide for Any Clean PC

This guide explains how anyone (teammate, judge, or evaluator) can clone, run, and test the entire Prohori AI cybersecurity platform locally on another computer from scratch. No prior setup knowledge is assumed.

---

## 📋 Prerequisites Checklist

Before you begin, make sure the following 3 free tools are installed on your computer:

1. **Git**: [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Verify in terminal: `git --version`
2. **Python** (version 3.11, 3.12, or 3.13): [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - **Crucial for Windows**: Ensure the checkbox **"Add Python to PATH"** is checked during installation.
   - Verify in terminal: `python --version` (or `python3 --version`)
3. **Node.js** (LTS version 18, 20, or 22): [https://nodejs.org/](https://nodejs.org/)
   - Verify in terminal: `node --version` and `npm --version`

---

## 🚀 Step 1: Clone the GitHub Repository

Open your terminal (PowerShell, Command Prompt, or Terminal on Mac/Linux) and navigate to the directory where you want to keep the project:

```bash
git clone https://github.com/rahat4528/prohori-ai.git
cd prohori-ai
```

*(Note: If the repository is private, make sure your GitHub account has been granted collaborator access, or use your personal access token).*

---

## 🐍 Step 2: Set Up the Python Virtual Environment

Create an isolated Python environment so dependencies don't conflict with system packages:

### On Windows (PowerShell or Command Prompt):
```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### On macOS / Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
pip install -r requirements.txt
```

*(This installs FastAPI, Uvicorn, SQLAlchemy, SQLite/PostgreSQL drivers, STIX 2.1 knowledge tools, and test suites. Takes ~1–2 minutes).*

---

## ⚙️ Step 3: Configure Environment Settings (`.env`)

Copy the pre-configured template into your active `.env` file:

### On Windows:
```cmd
copy .env.example .env
```

### On macOS / Linux:
```bash
cp .env.example .env
```

> **Zero Cloud Keys Required**: The default configuration runs 100% locally in **Data Sovereignty Mode** using our built-in Deterministic Offline RAG engine. You do NOT need any API keys or credit card to test.

---

## 💻 Step 4: Install Web Console Dependencies

Install the frontend packages for the React 19 + Vite operator console:

```bash
cd web
npm install
cd ..
```

*(Takes ~30–60 seconds).*

---

## 🎬 Step 5: Start the Full Stack

You can launch the entire platform either with the one-click launcher or manually terminal-by-terminal.

### Option A: One-Click Launcher (Windows)
In the project root folder `prohori-ai`, run:
```cmd
run_dev.bat
```
*(Or in PowerShell: `./run_dev.bat`)*

This automatically starts all 5 subsystems in separate windows:
1. Event Ingestion API & AI Core (Port `8000`)
2. Deception Honeypot Sensor (Port `8081`)
3. API Abuse Guard Reverse Proxy (Port `8082`)
4. Asset Discovery Scanner (Port `8083`)
5. React Operator Console (Port `3000`)

### Option B: Manual Startup (Windows / macOS / Linux)
Open 4 separate terminal windows in the `prohori-ai` directory:

- **Terminal 1: Event API & AI SOC Analyst Core**
  ```bash
  # Windows:
  .venv\Scripts\activate
  $env:PYTHONPATH="api;."
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

  # macOS / Linux:
  source .venv/bin/activate
  export PYTHONPATH="api:."
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```

- **Terminal 2: Deception Honeypot Sensor**
  ```bash
  # Windows:
  .venv\Scripts\activate
  python -m uvicorn sensors.deception.main:app --host 127.0.0.1 --port 8081

  # macOS / Linux:
  source .venv/bin/activate
  python -m uvicorn sensors.deception.main:app --host 127.0.0.1 --port 8081
  ```

- **Terminal 3: API Abuse Guard & Rate Limiter**
  ```bash
  # Windows:
  .venv\Scripts\activate
  $env:PYTHONPATH="api;."
  $env:UPSTREAM_URL="http://127.0.0.1:8000"
  $env:EVENT_API_URL="http://127.0.0.1:8000"
  python -m uvicorn sensors.ratelimiter.main:app --host 127.0.0.1 --port 8082

  # macOS / Linux:
  source .venv/bin/activate
  export PYTHONPATH="api:."
  export UPSTREAM_URL="http://127.0.0.1:8000"
  export EVENT_API_URL="http://127.0.0.1:8000"
  python -m uvicorn sensors.ratelimiter.main:app --host 127.0.0.1 --port 8082
  ```

- **Terminal 4: React Operator Console**
  ```bash
  cd web
  npm run dev
  ```

---

## 🌐 Step 6: Verify Access in Your Browser

Open Google Chrome or any modern browser and visit:

| Service | URL | Expected Response |
|---|---|---|
| **Operator Console** | [http://localhost:3000](http://localhost:3000) | Prohori AI console renders in Navy `#14213D` and Cream `#F4EDE0` |
| **API Health Check** | [http://127.0.0.1:8000/healthz](http://127.0.0.1:8000/healthz) | `{"status": "healthy", "database": "connected"}` |
| **Interactive API Sandbox** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive Swagger UI displaying all 18 endpoints |
| **Deception Trap** | [http://127.0.0.1:8081](http://127.0.0.1:8081) | Simulated decoy login interface |

---

## 🎯 Step 7: Run the Full Live Demonstration Walkthrough

Perform the complete 6-stage operational test in your browser at [http://localhost:3000](http://localhost:3000):

1. **Trigger Simulated Attack**:
   - Click the **"Run demo"** button in the header (or press keyboard shortcut `Shift + D`).
2. **Observe Real-Time Ingestion**:
   - Within milliseconds, a new threat card appears in the left column:  
     `Brute Force Suspected (192.168.1.189) [T1110.001]`.
3. **Review AI Threat Analysis**:
   - Click on the alert. The right panel immediately loads:
     - Threat Severity: `HIGH`
     - Attacker IP: `192.168.1.189`
     - Verified Grounded Citations: `[T1110.001: Password Guessing]`, `[CWE-307]`
     - Language Toggle: Click **"বাংলা"** to read the natural Bengali translation.
4. **Interact with the AI SOC Analyst Chatbot**:
   - Scroll to **"Ask AI Analyst About This Threat"**.
   - Click **"🛡️ Firewall commands"**: Watch it generate exact `sudo iptables -A INPUT -s 192.168.1.189 -j DROP` rules.
   - Click **"👤 Insider or external?"**: Watch it evaluate `192.168.1.189` as an **RFC 1918 private LAN address** and warn of potential lateral movement.
5. **Approve Defensive Countermeasure (Human-in-the-Loop)**:
   - Click the prominent **"Approve Defense Countermeasure"** button.
   - An inline cryptographic confirmation appears confirming the adversary IP is now blocked on the rate limiter.
6. **Inspect the Immutable Audit Trail**:
   - Click **"Audit Log"** in the footer (or press `Shift + A`).
   - The drawer reveals the append-only audit record with timestamp, operator ID, and defense decision.

---

## 🧪 Step 8: Run Automated Verification Tests

Run our automated verification suites to guarantee that everything passes with zero errors:

```powershell
# 1. Run Complete Pytest Suite (43 tests)
.venv\Scripts\python -m pytest

# 2. Run 15-Point Architectural Verification
.venv\Scripts\python scripts/verify_e2e.py

# 3. Verify Strict 90/10 Palette Compliance (Navy, Cream, Coral)
.venv\Scripts\python scripts/check_palette.py

# 4. Verify TypeScript Compilation & Production Build
cd web
npm run build
cd ..
```

**Certified Benchmark**:
- Pytest: **43 / 43 PASSED (100%)**
- Architectural E2E: **15 / 15 PASSED (100%)**
- Palette Compliance: **100% Compliant (Zero unauthorized colors)**
- Frontend Build: **Built in ~400ms (0 errors)**

---

## 🛠️ Step 9: Common Troubleshooting & Quick Fixes

### 1. "Port 8000 (or 3000) is already in use"
If an old process is lingering on a port:
- **Windows (PowerShell)**:
  ```powershell
  Get-NetTCPConnection -LocalPort 8000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```
- **macOS / Linux**:
  ```bash
  kill -9 $(lsof -t -i:8000)
  kill -9 $(lsof -t -i:3000)
  ```

### 2. "Running scripts is disabled on this system" (Windows PowerShell ExecutionPolicy)
Run PowerShell as Administrator or bypass for current process:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 3. "ModuleNotFoundError: No module named 'app'"
Make sure `PYTHONPATH` includes `api` and the project root:
- Windows: `$env:PYTHONPATH = "api;."`
- Linux/Mac: `export PYTHONPATH="api:."`

### 4. Browser Cache or Stale Session
If the browser shows an old layout, press `Ctrl + F5` (or `Cmd + Shift + R`) to force a hard refresh.
