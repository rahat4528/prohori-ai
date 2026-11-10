"""
FastAPI Routes for Congress Deliverables: /pitchdeck, /presentation, /architecture, /data, /security
Serves dark-theme, responsive presentation and technical documentation pages.
"""

from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["Congress Submission Pages"])

DOCS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "docs"


def read_doc_file(filename: str) -> str:
    path = DOCS_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    return f"# {filename}\nDocumentation file not found."


HTML_PRESENTATION = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prohori AI — International AI Builders Congress 2026 Presentation</title>
  <style>
    body { background: #070a0f; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; }
    .container { max-width: 960px; margin: 0 auto; }
    header { border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    h1 { font-size: 22px; font-weight: 800; color: #38bdf8; margin: 0; }
    .tag { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: monospace; }
    .card { background: #0d121c; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .card h2 { font-size: 16px; font-weight: 700; color: #f8fafc; margin-top: 0; border-bottom: 1px solid #162032; padding-bottom: 8px; display: flex; justify-content: space-between; }
    .card p, .card li { font-size: 13px; color: #cbd5e1; line-height: 1.6; }
    ul { padding-left: 20px; }
    .callout { background: #0f172a; border-left: 3px solid #38bdf8; padding: 8px 12px; margin-top: 10px; font-size: 12px; color: #94a3b8; }
    .nav-links { display: flex; gap: 10px; }
    .nav-links a { color: #94a3b8; text-decoration: none; font-size: 12px; padding: 4px 8px; border: 1px solid #1e293b; border-radius: 4px; }
    .nav-links a:hover { color: #38bdf8; border-color: #38bdf8; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>PROHORI AI // প্রহরী এসওসি</h1>
        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Winning Pitch Deck & Submission — International AI Builders Congress 2026</p>
      </div>
      <div class="nav-links">
        <a href="/">Console</a>
        <a href="/architecture">Architecture</a>
        <a href="/data">Data Lineage</a>
        <a href="/security">Security</a>
        <a href="/docs">API Docs</a>
      </div>
    </header>

    <div class="card">
      <h2>1. The Problem: Cybersecurity Talent Crisis in Emerging Nations <span class="tag">0:00 - 0:30</span></h2>
      <ul>
        <li>85% of Bangladeshi SMEs, banks, and government offices cannot afford a dedicated 24/7 Security Operations Center.</li>
        <li>SOC analysts are scarce, burned out, and cost $40k–$100k/year each; Mean-Time-To-Understand (MTTU) is 45 minutes per alert.</li>
        <li><strong>Data Sovereignty Crisis:</strong> Existing cloud SOC solutions export sensitive national security logs to overseas servers, violating data sovereignty.</li>
      </ul>
      <div class="callout">Impact: Emerging market infrastructure is unprotected against automated cyber threats.</div>
    </div>

    <div class="card">
      <h2>2. The Solution: Prohori AI ("প্রহরী") <span class="tag">0:30 - 1:00</span></h2>
      <ul>
        <li>A self-hostable, AI-native Security Operations Center. Four defensive sensors feed one unified event bus.</li>
        <li><strong>The AI SOC Analyst:</strong> Real-time autonomous triage, correlation, and natural language explanations in <strong>English and Bengali (বাংলা)</strong>.</li>
        <li><strong>RAG Grounding:</strong> Every verdict cites MITRE ATT&CK techniques (e.g. [T1110.001]) and CVEs with zero hallucination.</li>
        <li><strong>Zero-Cloud Sovereignty:</strong> Runs 100% on-premises with local models (Ollama / Llama 3.2).</li>
      </ul>
      <div class="callout">Key Difference: An active agentic reasoning core, not a surface-level dashboard.</div>
    </div>

    <div class="card">
      <h2>3. The Money-Shot Live Demonstration <span class="tag">1:00 - 2:00</span></h2>
      <ul>
        <li>Simulated adversary attacks the Honeypot with brute force; WebSocket pushes alert instantly to console.</li>
        <li>Operator asks in native Bangla: <em>"কী ঘটেছে? কতটা বিপজ্জনক?"</em></li>
        <li>AI Analyst streams answer in natural Bengali, citing MITRE [T1110.001] and weakness [CWE-307].</li>
        <li>Recommends firewall perimeter block. Operator approves (Human-in-the-Loop) &rarr; verified in Immutable Audit Trail.</li>
      </ul>
      <div class="callout">KPI: Alert understanding drops from 45 minutes to 3 seconds.</div>
    </div>

    <div class="card">
      <h2>4. AI-Native Reference Architecture & Grounding <span class="tag">2:00 - 2:30</span></h2>
      <ul>
        <li><strong>Sensors:</strong> Deception Honeypot, API Abuse Guard, Allowlisted Asset Scanner.</li>
        <li><strong>Storage:</strong> PostgreSQL + pgvector for high-dimensional semantic search.</li>
        <li><strong>Agents:</strong> Triage Agent, Correlation Agent, and Response Advisor.</li>
        <li><strong>PII Redaction:</strong> Mandatory scrubbing of passwords, JWTs, and API tokens prior to LLM reasoning.</li>
      </ul>
      <div class="callout">Technical Excellence: 100% offline fallback; zero dependencies on paid cloud services.</div>
    </div>

    <div class="card">
      <h2>5. Commercial Viability & Global Impact <span class="tag">2:30 - 3:00</span></h2>
      <ul>
        <li><strong>Market:</strong> 100,000+ SMEs, 60+ commercial banks, and public infrastructure in Bangladesh.</li>
        <li><strong>Business Model:</strong> Open-source Community Edition + $1,200/node/year On-Premise Enterprise License + $99/mo SME Managed SaaS.</li>
        <li><strong>Responsible AI:</strong> Strict allowlist boundaries, HITL approval requirement, and immutable audit logs.</li>
      </ul>
      <div class="callout">Summary: Built in Bangladesh for emerging nations worldwide.</div>
    </div>
  </div>
</body>
</html>
"""


@router.get("/pitchdeck", response_class=HTMLResponse, summary="View Congress Pitch Deck Presentation")
@router.get("/presentation", response_class=HTMLResponse, summary="View Congress Presentation")
async def get_presentation():
    return HTMLResponse(content=HTML_PRESENTATION, status_code=200)


@router.get("/architecture", response_class=HTMLResponse, summary="Architecture Documentation")
@router.get("/docs/architecture", response_class=HTMLResponse, summary="Architecture Documentation")
async def get_architecture_page():
    md = read_doc_file("ARCHITECTURE.md")
    return HTMLResponse(content=f"<html><body style='background:#070a0f;color:#f1f5f9;font-family:sans-serif;padding:30px;'><pre style='white-space:pre-wrap;'>{md}</pre></body></html>")


@router.get("/data", response_class=HTMLResponse, summary="Data Lineage Documentation")
@router.get("/docs/lineage", response_class=HTMLResponse, summary="Data Lineage Documentation")
@router.get("/docs/data", response_class=HTMLResponse, summary="Data Lineage Documentation")
async def get_data_page():
    md = read_doc_file("DATA_LINEAGE.md")
    return HTMLResponse(content=f"<html><body style='background:#070a0f;color:#f1f5f9;font-family:sans-serif;padding:30px;'><pre style='white-space:pre-wrap;'>{md}</pre></body></html>")


@router.get("/security", response_class=HTMLResponse, summary="Security Controls Documentation")
@router.get("/docs/security", response_class=HTMLResponse, summary="Security Controls Documentation")
async def get_security_page():
    md = read_doc_file("SECURITY.md")
    return HTMLResponse(content=f"<html><body style='background:#070a0f;color:#f1f5f9;font-family:sans-serif;padding:30px;'><pre style='white-space:pre-wrap;'>{md}</pre></body></html>")

