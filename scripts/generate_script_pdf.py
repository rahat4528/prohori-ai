"""
Prohori AI - Executive Teleprompter & Speaking Script PDF Generator
Produces a high-readability, multi-page, print-ready A4 PDF document
with exact time slots, visual cues, and word-for-word spoken narration.
"""

import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
OUTPUT_PDF = DOCS_DIR / "PROHORI_DEMO_SPEAKING_SCRIPT.pdf"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PROHORI AI — Official Demo Pitch Script</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 15mm 14mm 15mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 8pt;
        color: #64748b;
        font-family: -apple-system, sans-serif;
      }
      @bottom-left {
        content: "PROHORI AI // International AI Builders Congress 2026";
        font-size: 8pt;
        color: #94a3b8;
        font-family: -apple-system, sans-serif;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 9.5pt;
      margin: 0;
      padding: 0;
    }
    
    /* Document Header */
    .doc-header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand-title {
      font-size: 19pt;
      font-weight: 900;
      color: #0369a1;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 10pt;
      font-weight: 600;
      color: #334155;
      margin: 3px 0 0;
    }
    .meta-box {
      text-align: right;
      font-size: 8pt;
      color: #64748b;
      line-height: 1.4;
    }
    .badge-pill {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      display: inline-block;
    }

    /* Reference Summary Card */
    .summary-card {
      background: #0f172a;
      color: #f8fafc;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      border: 1px solid #1e293b;
    }
    .summary-title {
      font-size: 10pt;
      font-weight: 800;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
    }
    .summary-table th {
      text-align: left;
      padding: 4px 6px;
      background: #1e293b;
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-table td {
      padding: 5px 6px;
      border-bottom: 1px solid #1e293b;
      color: #cbd5e1;
    }
    .summary-table tr:last-child td {
      border-bottom: none;
    }
    .time-tag {
      font-family: monospace;
      color: #38bdf8;
      font-weight: 700;
    }
    .msg-quote {
      color: #38bdf8;
      font-weight: 600;
      font-style: italic;
    }

    /* Scene Card */
    .scene-card {
      break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      margin-bottom: 14px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .scene-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 7px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .scene-name {
      font-size: 10pt;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .scene-time-badge {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.5pt;
      font-weight: 800;
      color: #0284c7;
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .scene-body {
      padding: 10px 14px;
    }
    .action-box {
      background: #f1f5f9;
      border-left: 3px solid #64748b;
      padding: 6px 10px;
      border-radius: 0 4px 4px 0;
      margin-bottom: 8px;
      font-size: 8pt;
      color: #334155;
    }
    .action-box strong {
      color: #0f172a;
      font-weight: 700;
    }
    .speech-box {
      background: #ffffff;
      border: 1.5px solid #0284c7;
      border-left: 5px solid #0284c7;
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
      font-size: 10pt;
      color: #0f172a;
      line-height: 1.55;
      font-weight: 500;
    }
    .speech-box strong {
      color: #0284c7;
      font-weight: 700;
    }
    .cue-marker {
      background: #fef08a;
      color: #854d0e;
      padding: 1px 4px;
      border-radius: 3px;
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      margin-right: 4px;
    }
    .pause-marker {
      color: #94a3b8;
      font-size: 8pt;
      font-style: italic;
      margin: 0 4px;
    }

    /* Teleprompter Tips Block */
    .checklist-card {
      break-inside: avoid;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 14px;
      font-size: 8.5pt;
      color: #166534;
    }
    .checklist-card h4 {
      margin: 0 0 6px;
      font-size: 9.5pt;
      font-weight: 800;
      color: #15803d;
    }
    .checklist-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .checklist-grid ul {
      margin: 0;
      padding-left: 16px;
    }
    .checklist-grid li {
      margin-bottom: 4px;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: Header + Pitch Overview + Scenes 1 & 2 -->
  <div class="doc-header">
    <div>
      <h1 class="brand-title">PROHORI AI ("প্রহরী")</h1>
      <p class="brand-subtitle">Official Teleprompter & Speaking Script — 140s Video Walkthrough</p>
    </div>
    <div class="meta-box">
      <div><strong>Event:</strong> AI Builders Congress 2026</div>
      <div><strong>Team:</strong> Team Orionids · DIU</div>
      <div><span class="badge-pill">4K UHD · 140 Seconds</span></div>
    </div>
  </div>

  <!-- Reference Table matching CloudCamp Screenshot -->
  <div class="summary-card">
    <div class="summary-title"><span>📊</span> 140-Second Video Architecture & Evaluator Rubric Map</div>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Time Slot</th>
          <th>Rubric Stage</th>
          <th>What You Show On Screen</th>
          <th>Key Evaluator Message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="time-tag">0:00 – 0:18</span></td>
          <td><strong>1. Problem (The Vibe)</strong></td>
          <td>4K Splash Card &rarr; Sovereign air-gapped dashboard & status counters</td>
          <td><span class="msg-quote">"This problem matters: Foreign clouds leak national logs"</span></td>
        </tr>
        <tr>
          <td><span class="time-tag">0:18 – 0:38</span></td>
          <td><strong>2. Solution (Discovery)</strong></td>
          <td>Devices modal opens &rarr; Live Layer-2 ARP sweep populates subnet hosts</td>
          <td><span class="msg-quote">"This is how we solve it: Zero-agent live network baseline"</span></td>
        </tr>
        <tr>
          <td><span class="time-tag">0:38 – 0:56</span></td>
          <td><strong>3. Demo (Threat Mesh)</strong></td>
          <td>"Run demo" clicked &rarr; Honeypot & rate limiter events stream over WebSockets</td>
          <td><span class="msg-quote">"This is how it works: Multi-sensor edge telemetry under 35ms"</span></td>
        </tr>
        <tr>
          <td><span class="time-tag">0:56 – 1:18</span></td>
          <td><strong>4. AI Approach (RAG)</strong></td>
          <td>Critical alert inspection &rarr; AI Root Cause Evidence & MITRE [T1110.001]</td>
          <td><span class="msg-quote">"This is real AI thinking: Zero hallucinations, verified citations"</span></td>
        </tr>
        <tr>
          <td><span class="time-tag">1:18 – 1:38</span></td>
          <td><strong>5. Localization (Bangla)</strong></td>
          <td>Language toggle clicked &rarr; Full UI & threat narrative transforms to Bengali</td>
          <td><span class="msg-quote">"Accessible defense: Native Bangla narratives for local admins"</span></td>
        </tr>
        <tr>
          <td><span class="time-tag">1:38 – 1:56</span></td>
          <td><strong>6. Safety Gate (HITL)</strong></td>
          <td>Surgical iptables rules &rarr; "Approve Defense" clicked &rarr; Enforced</td>
          <td><span class="msg-quote">"Responsible AI: Mandatory human confirmation for firewall cuts"</span></td>
        </tr>
        <tr>
          <td><span class="time-tag">1:56 – 2:12</span></td>
          <td><strong>7. Auditability (Audit Log)</strong></td>
          <td>Drawer opened &rarr; Immutable records of model IDs, prompt hashes, sign-offs</td>
          <td><span class="msg-quote">"Accountability: Cryptographic ledger for compliance & forensics"</span></td>
        </tr>
        <tr>
          <td><span class="time-tag">2:12 – 2:20</span></td>
          <td><strong>8. Impact & Vision</strong></td>
          <td>Pitch Deck modal previewed &rarr; Return to clean live dashboard</td>
          <td><span class="msg-quote">"We can build and scale this: Deployable on commodity hardware"</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Scene 1 -->
  <div class="scene-card">
    <div class="scene-header">
      <div class="scene-name"><span>🛡️ Scene 1: The Problem & Sovereign Mission</span></div>
      <div class="scene-time-badge">0:00 – 0:18 (18s)</div>
    </div>
    <div class="scene-body">
      <div class="action-box">
        <strong>SCREEN ACTION:</strong> 
        Opening 4K pitch card displays <em>PROHORI AI</em> with three core pillars (0:00–0:05). The card fades into the live dark-mode console. Operator smooth-scrolls down through the alert feed (0:05–0:12) and scrolls back up to the top status counters and green "Sovereign Mode" pill (0:12–0:18).
      </div>
      <div class="speech-box">
        <span class="cue-marker">READ</span>
        "Every thirty-nine seconds, an institution somewhere in the world faces a cyberattack. But regional banks, universities, and hospitals across Bangladesh cannot afford hundred-thousand-dollar commercial SIEMs or twenty-four-seven security teams. Worse, sending internal network logs to foreign clouds violates national data sovereignty.<span class="pause-marker">[breathe]</span><br><br>
        This is <strong>PROHORI AI</strong> — Bangladesh's first self-hostable, bilingual AI SOC analyst, engineered to deliver autonomous cyber defense entirely on local infrastructure."
      </div>
    </div>
  </div>

  <!-- Scene 2 -->
  <div class="scene-card">
    <div class="scene-header">
      <div class="scene-name"><span>🌐 Scene 2: Layer-2 Network Asset Discovery</span></div>
      <div class="scene-time-badge">0:18 – 0:38 (20s)</div>
    </div>
    <div class="scene-body">
      <div class="action-box">
        <strong>SCREEN ACTION:</strong> 
        Operator moves cursor to header and clicks <strong>"Devices"</strong> (0:18). The modal opens listing subnet IPs, MAC addresses, and hostnames. Operator hovers over the gateway and clicks <strong>"Scan LAN"</strong> (0:24). The active ARP sweep pulses and discovers connected devices. Operator clicks <strong>"Close"</strong> (0:34) to return to the dashboard.
      </div>
      <div class="speech-box">
        <span class="cue-marker">READ</span>
        "Before defending a perimeter, you must know what is on your network. Prohori features automated Layer-Two ARP asset discovery. With a single click,<span class="cue-marker">SYNC: CLICK SCAN</span> it scans the local subnet, identifying workstations, routers, and IoT devices with zero agents required. Unknown or rogue devices are cataloged immediately, establishing an authoritative baseline in seconds."
      </div>
    </div>
  </div>

  <!-- Scene 3 -->
  <div class="scene-card">
    <div class="scene-header">
      <div class="scene-name"><span>⚡ Scene 3: Multi-Sensor Live Attack Ingestion</span></div>
      <div class="scene-time-badge">0:38 – 0:56 (18s)</div>
    </div>
    <div class="scene-body">
      <div class="action-box">
        <strong>SCREEN ACTION:</strong> 
        Operator clicks <strong>"Run demo"</strong> in the top navigation bar (0:38). Attacks hit the Deception Honeypot (Port 8081) and Rate Limiter (Port 8082). Incoming alerts stream via WebSockets into the feed. Top counters increment in real time. Operator scrolls down to observe the alerts (0:48–0:56).
      </div>
      <div class="speech-box">
        <span class="cue-marker">READ</span>
        "Now, let's watch Prohori respond to an active multi-vector attack.<span class="cue-marker">SYNC: CLICK RUN DEMO</span> As adversaries probe our perimeter, our edge sensors respond. Our deception honeypot traps unauthorized credential probes, while our rate limiter blocks aggressive reconnaissance floods. In under thirty-five milliseconds, raw telemetry is ingested, scrubbed of passwords and secrets, and streamed live to the operator."
      </div>
    </div>
  </div>

  <!-- Scene 4 -->
  <div class="scene-card">
    <div class="scene-header">
      <div class="scene-name"><span>🧠 Scene 4: Grounded AI Triage & MITRE ATT&CK Citations</span></div>
      <div class="scene-time-badge">0:56 – 1:18 (22s)</div>
    </div>
    <div class="scene-body">
      <div class="action-box">
        <strong>SCREEN ACTION:</strong> 
        Operator clicks the top critical alert card (0:56). The Incident Detail panel opens on the right. Operator smooth-scrolls down through the AI SOC Analyst Verdict, Root Cause Evidence, and pauses directly over the verified MITRE ATT&CK citation pills (<code>[T1110.001]</code>, <code>[CWE-307]</code>) (1:10–1:18).
      </div>
      <div class="speech-box">
        <span class="cue-marker">READ</span>
        "Here is Prohori's greatest breakthrough: hallucination-free, explainable AI. Operating through an on-premise Offline RAG engine, Prohori reconciles threat severity by cross-referencing telemetry with curated MITRE ATT&CK techniques and NVD CVE records. Every single diagnostic claim is backed by verified technique citations like <strong>T-eleven-ten</strong>.<span class="pause-marker">[pause]</span> No hallucinations—only grounded, defensible intelligence."
      </div>
    </div>
  </div>

  <!-- Scene 5 -->
  <div class="scene-card">
    <div class="scene-header">
      <div class="scene-name"><span>🇧🇩 Scene 5: 100% Native Bengali Linguistic Parity</span></div>
      <div class="scene-time-badge">1:18 – 1:38 (20s)</div>
    </div>
    <div class="scene-body">
      <div class="action-box">
        <strong>SCREEN ACTION:</strong> 
        Operator scrolls to the header and clicks the language toggle button (<strong>"বাংলায় পরিবর্তন করুন"</strong>) (1:18). The entire UI transforms into natural Bengali. Threat titles, root causes, and containment guidance render in Bangla (<code>অননুমোদিত প্রবেশ চেষ্টা</code>). Operator scrolls to demonstrate parity, then clicks back to English (1:33).
      </div>
      <div class="speech-box">
        <span class="cue-marker">READ</span>
        "Traditional security tools overwhelm junior sysadmins with cryptic English telemetry. Prohori bridges this national talent gap with one-hundred-percent native Bengali linguistic parity. At the touch of a button,<span class="cue-marker">SYNC: CLICK BANGLA TOGGLE</span> root causes, impact assessments, and remediation playbooks are translated into clear, professional Bangla—empowering local IT administrators across regional institutions to respond with confidence."
      </div>
    </div>
  </div>

  <!-- Scene 6 -->
  <div class="scene-card">
    <div class="scene-header">
      <div class="scene-name"><span>🔒 Scene 6: Human-in-the-Loop Active Containment</span></div>
      <div class="scene-time-badge">1:38 – 1:56 (18s)</div>
    </div>
    <div class="scene-body">
      <div class="action-box">
        <strong>SCREEN ACTION:</strong> 
        Operator scrolls down in the threat panel to the <strong>Recommended Countermeasures</strong> section (1:38). Precision <code>iptables</code> and Windows netsh commands are displayed with an amber "Pending Human Approval" badge. Operator hovers and clicks <strong>"Approve Defense"</strong> (1:46). The card transitions to green <strong>"Contained / Enforced"</strong>.
      </div>
      <div class="speech-box">
        <span class="cue-marker">READ</span>
        "Responsible AI is non-negotiable. Prohori strictly enforces Human-in-the-Loop governance. It never executes destructive autonomous actions. Instead, the AI generates precision OS-level containment scripts—such as iptables rules or Windows firewall commands—and pauses for operator approval. When the analyst clicks <strong>'Approve Defense'</strong>,<span class="cue-marker">SYNC: CLICK APPROVE</span> the adversary is instantly severed at the firewall."
      </div>
    </div>
  </div>

  <!-- Scene 7 -->
  <div class="scene-card">
    <div class="scene-header">
      <div class="scene-title"><span>📜 Scene 7: Cryptographic Append-Only Audit Trail</span></div>
      <div class="scene-time-badge">1:56 – 2:12 (16s)</div>
    </div>
    <div class="scene-body">
      <div class="action-box">
        <strong>SCREEN ACTION:</strong> 
        Operator scrolls up, clicks <strong>"More"</strong> in header, then clicks <strong>"Audit Trail"</strong> (1:56). The audit drawer slides open. Operator smooth-scrolls through immutable log entries showing timestamps, model IDs, citation hashes, and operator approval stamps. Operator closes the drawer (2:10).
      </div>
      <div class="speech-box">
        <span class="cue-marker">READ</span>
        "For compliance and forensic accountability, every event triage, prompt trace, model version, and human approval is cryptographically committed to an immutable, append-only audit ledger. Institutional leadership and auditors can verify exactly why an alert was triggered and who authorized containment."
      </div>
    </div>
  </div>

  <!-- Scene 8 -->
  <div class="scene-card">
    <div class="scene-header">
      <div class="scene-title"><span>🚀 Scene 8: Pitch Deck & Sovereign Vision Conclusion</span></div>
      <div class="scene-time-badge">2:12 – 2:20 (8s)</div>
    </div>
    <div class="scene-body">
      <div class="action-box">
        <strong>SCREEN ACTION:</strong> 
        Operator clicks <strong>"More"</strong> &rarr; <strong>"Pitch Deck"</strong> modal showing the architecture diagram and team credentials (2:12). Operator closes the modal to finish on the clean, live, running Prohori console (2:18–2:20).
      </div>
      <div class="speech-box">
        <span class="cue-marker">READ</span>
        "<strong>PROHORI AI</strong>: one-hundred-percent sovereign, self-hostable in under five minutes, and accessible in our mother tongue. Empowering Bangladesh with resilient digital defense.<span class="pause-marker">[smile]</span> Thank you."
      </div>
    </div>
  </div>

  <!-- Presenter Pre-Flight Checklist -->
  <div class="checklist-card">
    <h4>🎙️ Presenter Pre-Flight Checklist (Teleprompter Advice):</h4>
    <div class="checklist-grid">
      <div>
        <strong>Voice & Pacing:</strong>
        <ul>
          <li>Speak at a calm, authoritative pace (~130 words per minute).</li>
          <li>Look for the yellow <span class="cue-marker">SYNC</span> markers to align your voice with the button clicks on screen.</li>
          <li>Take a 1-second breath between scene transitions.</li>
        </ul>
      </div>
      <div>
        <strong>Technical Terms to Pronounce Clearly:</strong>
        <ul>
          <li><strong>SIEM:</strong> pronounce as <em>"Sim"</em>.</li>
          <li><strong>SOC:</strong> pronounce as <em>"Sock"</em>.</li>
          <li><strong>T1110.001:</strong> pronounce as <em>"T-eleven-ten"</em>.</li>
          <li><strong>ARP:</strong> pronounce letters <em>"A-R-P"</em>.</li>
        </ul>
      </div>
    </div>
  </div>

</body>
</html>
"""


async def generate_pdf():
    print("============================================================")
    print("PROHORI AI - GENERATING EXECUTIVE TELEPROMPTER PDF SCRIPT")
    print(f"Output File: {OUTPUT_PDF}")
    print("============================================================")

    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=True)
        page = await browser.new_page()

        await page.set_content(HTML_TEMPLATE, wait_until="networkidle")
        await page.pdf(
            path=str(OUTPUT_PDF),
            format="A4",
            print_background=True,
            margin={
                "top": "10mm",
                "bottom": "10mm",
                "left": "12mm",
                "right": "12mm"
            }
        )

        await browser.close()

    size_kb = OUTPUT_PDF.stat().st_size / 1024
    print(f"[SUCCESS] PDF Generated successfully: {OUTPUT_PDF} ({size_kb:.2f} KB)")


if __name__ == "__main__":
    asyncio.run(generate_pdf())
