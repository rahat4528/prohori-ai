# Prohori AI ("প্রহরী") — Video Pitch Script & Backup Recording Protocol

**Team**: Team Orionids  
**Event**: International AI Builders Congress 2026 · InfraSphere AI &rarr; SecureAI  
**Target Duration**: 4 minutes (240 seconds) [Optimized for 4–5 minute slot with Q&A buffer]  
**Backup Video Target Duration**: 60–90 seconds (no-fail screen recording)  
**Tone**: Confident, technically precise, authoritative, grounded, accessible.

---

## 1. Verbatim 3-Minute Voiceover Script (180 Seconds)

> [!NOTE]
> **Pacing & Ratio**: Approximately 90% of the demonstration is focused exclusively on the **Bilingual AI SOC Analyst core** (triaging alerts, Bengali/English reasoning, MITRE ATT&CK grounding, and human-in-the-loop defense approval). The three defensive sensors are presented as simple upstream data feeds in exactly 20 seconds.

---

### [0:00 - 0:25] The Problem: The Midnight Alarm & Cyber Inequality
*(Visual: Presenter on camera or Slide 1: Arif at his desk in Gazipur at 2:00 AM surrounded by cryptic English terminal alarms)*

> "Distinguished judges, meet Arif. He is the sole IT officer at a 150-person export garment factory in Gazipur. 
> It's 2:00 AM. His firewall is firing thousands of cryptic, red English alerts. Arif is not a certified cyber forensic investigator, and his organization cannot afford a dedicated multi-analyst security operations center. 
> Buried inside that wall of noise is an active credential stuffing attack. By 8:00 AM, his servers are locked. 
> Small organizations and public offices across emerging markets are left defenseless — priced out of legacy enterprise tools, and prevented by data sovereignty mandates from shipping national telemetry overseas."

---

### [0:25 - 0:45] Data Sources: 3 Lightweight Sensors (20-Second Focus)
*(Visual: Slide 4 or quick camera pan showing the architecture: 3 sensors feeding one unified bus)*

> "To protect networks like Arif's, we deploy three lightweight defensive sensors: 
> 1. An isolated deception honeypot that safely traps attacker probes, 
> 2. A token-bucket API abuse guard that throttles volumetric floods, and 
> 3. An allowlisted asset scanner. 
> But these sensors are just the eyes. Prohori's true breakthrough is the mind: our **Bilingual AI SOC Analyst core**."

---

### [0:45 - 2:25] The Live Demonstration: The Bilingual AI SOC Analyst (100 Seconds)
*(Visual: Screen switches smoothly to live Operator Console at `localhost:3000`. Clean dark interface with real-time connection badge active.)*

> "Watch our live console. In the background terminal, we trigger our replay attack campaign. 
> Within 30 milliseconds, the telemetry flows through our PII redaction layer into our central event bus. 
> The AI Analyst immediately triages the incoming stream, clusters correlated events, and declares Incident `INC-2026-0001` with High Severity.
> 
> Now, look at what makes Prohori transformative: the **'Ask the Analyst'** reasoning panel. 
> Arif doesn't need to decipher raw syslog packets. In natural Bengali, he asks: 
> *'কী ঘটেছে? কতটা বিপজ্জনক?'*
> 
> Look at the response streaming in real time. 
> The AI Analyst answers in fluent, grammatically natural Bengali: 
> *'প্রহরী এআই ডিকয় সারফেসে একাধিক অননুমোদিত ক্রেডেনশিয়াল স্টাফিং শনাক্ত করেছে। এটি MITRE ATT&CK টেকনিক [T1110.001] এর সাথে মিলে যায়...'*
> 
> Notice that our AI does not hallucinate. Every verdict is grounded in a local pgvector knowledge base containing MITRE ATT&CK techniques, NIST CVE records, and CWE security weaknesses, displaying clickable citation badges.
> 
> With a single toggle, the operator can switch between Bengali and plain English, enabling instant cross-functional collaboration.
> 
> Finally, observe Responsible AI in action: the AI Analyst recommends an actionable countermeasure — *'Block adversary IP 192.168.1.105 at the perimeter firewall'* — but the AI never executes destructive firewall rules unilaterally. 
> Arif reviews the reasoning and clicks **'Approve Defense'**. 
> The status immediately updates to `APPROVED`, and the action is permanently written to our append-only audit log. 
> Complex threat triage that once took 45 minutes is resolved in thirty seconds."

---

### [2:25 - 2:45] Technical Depth & National Data Sovereignty (20 Seconds)
*(Visual: Architecture diagram highlighting the Local Ollama / Offline toggle and PII redaction flow)*

> "Under the hood, Prohori is engineered for absolute national data sovereignty. 
> By default, Prohori operates 100% on-premises using local LLMs like Ollama with Llama 3.2, or our deterministic offline RAG provider. In this sovereignty mode, zero bytes of security telemetry ever leave the host machine or cross international borders. 
> While cloud providers like Groq and Gemini are supported for bandwidth-rich environments, sovereign on-prem deployment is our foundational architectural promise."

---

### [2:45 - 3:00] Scalability, Impact & Closing (15 Seconds)
*(Visual: Slide 8 showing Open Source Community Core, Commercial Hypothesis, and Large QR Code)*

> "Prohori AI bridges the global cybersecurity divide. We offer a free, self-hostable open-source edition for universities and SMEs, alongside an enterprise on-premise hypothesis for banks and critical infrastructure. 
> On behalf of Team Orionids: sovereign, explainable, and bilingual defense for the digital frontier. Scan our QR code to explore the repository. Thank you."

---

## 2. Step-by-Step Recording Protocol for Backup Video (60–90 Seconds)

> [!IMPORTANT]
> Live demos at hackathons can encounter Wi-Fi drops, projector resolution glitches, or port conflicts. Having a crisp, pre-recorded 60–90 second screen capture of the working demo is mandatory insurance.

### Phase 1: Environment Preparation (Run 10 Minutes Before Presentation)

1. **Clean Database & Start API Backend**:
   ```powershell
   cd c:\diu
   $env:PYTHONPATH="api;."
   .venv\Scripts\python -m uvicorn app.main:app --port 8000
   ```
2. **Start Frontend Console**:
   ```powershell
   cd c:\diu\web
   npm run dev
   ```
3. **Open Browser**:
   - Open Google Chrome or Microsoft Edge at `http://localhost:3000`.
   - Press `F11` for clean, distraction-free full-screen mode.
   - Verify the top-right connection badge shows **"LIVE (CONNECTED)"** in bright emerald green.
4. **Prepare Replay Terminal**:
   - Open a secondary compact PowerShell window positioned beside or behind the browser:
     ```powershell
     cd c:\diu
     .venv\Scripts\python scripts/demo_replay.py
     ```
   - Do **NOT** press Enter yet.

---

### Phase 2: Recording with Windows Game Bar

1. **Trigger Recording**:
   - Focus the browser window (`http://localhost:3000`).
   - Press **`Win + Alt + R`** to immediately start recording (or press **`Win + G`** to open the Game Bar overlay and click the Record circle).
   - Verify the small red recording timer appears in the upper right.

2. **Execute the 75-Second Choreography**:
   - **`0:00 - 0:10`**: Show the clean, idle Operator Console. Point cursor at the live system status indicators.
   - **`0:10 - 0:25`**: Switch to terminal and press Enter on `python scripts/demo_replay.py`. Switch back to browser. Show the 5-phase alerts streaming smoothly into the live feed with color-coded severity tags.
   - **`0:25 - 0:50`**: In the "Ask the Analyst" panel, click the suggested prompt chip: *"কী ঘটেছে? কতটা বিপজ্জনক?"*. Show the Bengali narrative streaming in real-time with the blue `[T1110.001]` MITRE citation badge.
   - **`0:50 - 1:05`**: Click on the active incident card. Point to the recommended action ("Block 192.168.1.105"). Click the green **"Approve Defense"** button. Show the status change to `APPROVED` and the toast notification.
   - **`1:05 - 1:15`**: Click the "Audit Log" drawer button in the header. Show the permanent, append-only record with timestamp and model metadata.
   - **`1:15 - 1:20`**: Toggle language to English to show instant bilingual narrative generation.

3. **Stop Recording**:
   - Press **`Win + Alt + R`** again to finish recording.
   - A Windows notification will appear: *"Game clip recorded"*.

---

### Phase 3: File Storage & Redundancy

1. **Default Windows Location**:
   - The video is saved at: `C:\Users\PC\Videos\Captures\*.mp4`.
2. **Rename and Create Backup Copies**:
   - Copy the recorded `.mp4` file and rename it to:
     `c:\diu\docs\assets\prohori_demo_backup_75s.mp4`
   - Copy to a physical USB thumb drive.
   - Upload a copy to Google Drive / OneDrive as a cloud mirror.
3. **CRITICAL GIT RULE**:
   - **Do NOT commit large `.mp4` files into the Git repository!**
   - Ensure `c:\diu\.gitignore` contains `*.mp4`, `*.mov`, `*.webm`.
4. **Emergency Stage Execution Plan**:
   - Open `prohori_demo_backup_75s.mp4` in VLC Media Player or Windows Media Player before walking on stage.
   - Set playback to full screen, paused at `0:00`.
   - Place media player on **Virtual Desktop 2** (`Win + Ctrl + Right Arrow`).
   - If the live browser fails or freezes during Slide 5, press `Win + Ctrl + Right Arrow` and hit the Spacebar to play the backup video seamlessly without breaking vocal cadence.
