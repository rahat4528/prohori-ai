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
| **0:00 – 0:15** | Dashboard overview on `http://localhost:3000`. Point mouse at Top Counters and Incident Timeline. | *"This is the Prohori AI Operator Console running completely on-premises. We are monitoring three defensive sensors: our deception honeypot, API abuse guard, and asset discovery scanner."* |
| **0:15 – 0:35** | Trigger attack script in terminal. Switch back to browser. Show the 5 event cards arriving live over WebSocket with red severity badges. | *"Now, an adversary begins reconnaissance and launches a credential stuffing burst against our decoy surface. In real-time over WebSocket, the events hit our unified event stream and are triaged."* |
| **0:35 – 0:50** | Click on the critical incident card. Open **"Ask the Analyst"** panel. Click *"কী ঘটেছে? কতটা বিপজ্জনক?"*. Watch the streaming response generate in Bengali with blue `[T1110.001]` MITRE badge. | *"Our on-duty analyst can ask questions in native Bengali. Prohori’s AI Analyst explains the threat progression in plain Bangla, grounded with strict citations to MITRE ATT&CK Technique T1110.001."* |
| **0:50 – 0:65** | Click the green **"Approve Defense"** button. Point to the status changing to `APPROVED` and containment notification. | *"Crucially, Prohori enforces Human-in-the-Loop governance. The system never executes destructive blocks autonomously. The operator reviews the recommendation and clicks Approve Defense, instantly updating the perimeter denylist."* |
| **0:65 – 0:75** | Press `Shift+A` to open the Audit Log drawer. Point to the append-only entry with timestamp and operator ID. Press `Shift+P` to show the Pitch Deck. | *"Every decision is recorded in our append-only audit log for institutional compliance. Prohori AI: sovereign, explainable defense for digital nations. Thank you."* |

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

