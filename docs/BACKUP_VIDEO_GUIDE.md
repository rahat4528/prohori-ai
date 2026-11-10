# Prohori AI — Stage Insurance Backup Video Recording Guide

> **Hackathon Survival Insurance**: Stage Wi-Fi frequently collapses during university congress presentations due to cientos of laptops and mobile hotspots contending on the same access points. Having a verified, high-resolution, narrated 60–90 second backup screen recording guarantees you can complete your demo seamlessly even if the venue network disconnects.

---

## 1. Quick Technical Specifications

- **Target Duration**: 60–90 seconds (recommended: 75 seconds).
- **Target Resolution**: 1920x1080 (1080p, 16:9).
- **Target Framerate**: 30 or 60 fps.
- **Audio**: Clear narration in English or bilingual (English context + Bengali explanation).
- **Primary File Name**: `prohori_demo_backup.mp4`
- **Output Storage Path**: Save locally into `docs/backup/prohori_demo_backup.mp4` (git-ignored to avoid repository bloat).

---

## 2. Pre-Flight Preparation Checklist (Do Before Recording)

- [ ] **Step 1: Start All Local Daemons**
  ```powershell
  # Run the background launcher from repo root
  .\scripts\run_all.ps1
  # OR run batch script:
  .\run_dev.bat
  ```
  Verify the services respond:
  - Console: `http://localhost:3000`
  - Backend: `http://127.0.0.1:8000/healthz` (Status: 200, connected)
  - Honeypot: `http://127.0.0.1:8081` (Status: 200)
  - Scanner: `http://127.0.0.1:8083/allowlist` (Status: 200)

- [ ] **Step 2: Clean Browser Window**
  - Open Microsoft Edge or Google Chrome to `http://localhost:3000`.
  - Maximize the browser window (or set to 1920x1080).
  - Press `F11` (full-screen) or hide bookmarks/extension bars to ensure clean visual focus.
  - Set language toggle in header to **Bengali (বাংলা)**.

- [ ] **Step 3: Prepare the Attack Trigger Terminal**
  - Open a second terminal window (PowerShell) on a secondary display, or position it minimized.
  - Type the replay command but do not press enter yet:
    ```powershell
    .venv\Scripts\python scripts/demo_replay.py --delay 1.0
    ```

---

## 3. Second-by-Second Narration Script (75 Seconds)

| Time Window | Visual Screen Action | Spoken Narration (What to Say) |
|:---:|---|---|
| **0:00 – 0:15** | 2-Column Console overview on `http://localhost:3000`. Point mouse at Header (Prohori brand, live status dot, transparent engine badge) and left Alert List. | *"This is the simplified Prohori AI Operator Console running completely on-premises. Designed for 5-second comprehension, it monitors defensive sensors across our network with zero external data egress."* |
| **0:15 – 0:35** | Click the primary **"Run demo"** button (or press `Shift+D`). Show live alert card arriving in left list with high-contrast severity badge and plain-language attack title. | *"An adversary initiates credential stuffing against our decoy surface. In real-time over WebSocket, the event arrives, is classified in plain language, and automatically populates the threat intelligence panel."* |
| **0:35 – 0:50** | Point to the right-hand **Threat Analysis** panel: What Happened narrative with MITRE citations `[T1110.001]`, Recommended Defense, and click suggestion chip *"💡 মূল কৌশল কী?"* to show streaming AI reasoning in Bengali. | *"Our analyst reviews the explanation in native Bengali. Grounded with strict citations to MITRE ATT&CK Technique T1110.001, Prohori's AI core explains the attack vector with zero hallucination."* |
| **0:50 – 0:65** | Click the prominent green **"🛡️ প্রতিরক্ষা অনুমোদন করুন (Approve Defense)"** button. Point to the instant inline audit confirmation card displaying Action ID, timestamp, and active perimeter denylist status. | *"Crucially, Prohori enforces strict Human-in-the-Loop governance. The system never executes destructive blocks autonomously. The operator clicks Approve Defense, instantly enforcing perimeter containment and logging an immutable audit record."* |
| **0:65 – 0:75** | Press `Shift+A` to open the full Audit Log drawer. Point to the append-only entry. Press `Shift+P` to show the 8-Slide Pitch Deck. | *"Every decision is recorded in our append-only audit trail for regulatory compliance. Prohori AI: sovereign, explainable defense for digital nations. Thank you."* |

---

## 4. Recording Tools on Windows

### Method A: Built-in Windows Game Bar / Snipping Tool (Zero Install)
- Press **`Win + Alt + R`** to start recording the browser window immediately.
- A recording pill will appear in the top-right corner.
- Speak into your microphone following the script above.
- Press **`Win + Alt + R`** again to stop recording.
- Videos are saved automatically to `Videos\Captures\`.

### Method B: OBS Studio (If Installed)
- Source: Window Capture &rarr; select browser window (`localhost:3000`).
- Audio: Select your microphone input.
- Click **Start Recording**, execute the flow, then **Stop Recording**.

---

## 5. Three-Copy Redundancy Rule (Mandatory for Stage)

Once recorded, verify playback quality, and create **three independent copies**:
1. **Copy 1 (Presentation Laptop Disk)**: `c:\diu\docs\backup\prohori_demo_backup.mp4`
2. **Copy 2 (USB Flash Drive)**: Plugged in and ready in your pocket or presentation clicker.
3. **Copy 3 (Mobile Phone / Cloud Backup)**: Accessible via phone hotspot or cloud drive in case the presentation laptop fails entirely.

Test playback in VLC or Windows Media Player with sound before leaving for the venue.

