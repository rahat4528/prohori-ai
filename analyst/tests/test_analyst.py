"""
Unit and Integration Tests for Prohori AI SOC Analyst Core & RAG
"""

import pytest
import pytest_asyncio
from app.database import Base, engine
from app.main import app
from httpx import ASGITransport, AsyncClient

from analyst.agents.advisor import response_advisor
from analyst.agents.correlation import correlation_agent
from analyst.agents.triage import triage_agent
from analyst.ask import analyst_assistant
from analyst.redaction import redact_data, redact_string
from knowledge.retriever import kb_retriever


@pytest_asyncio.fixture
async def setup_analyst_db():
    from sensors.ratelimiter.limiter import default_limiter
    default_limiter.reset()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()



def test_pii_and_secret_redaction():
    # Passwords and sensitive keys
    raw_details = {
        "source_ip": "10.0.0.1",
        "username": "admin",
        "password": "SuperSecretPassword123!",
        "api_key": "sk-1234567890abcdef1234567890",
        "nested": {
            "password_tried": "toor",
            "normal_field": "safe_value"
        }
    }
    scrubbed = redact_data(raw_details)
    assert scrubbed["password"] == "[REDACTED_CREDENTIAL]"
    assert scrubbed["api_key"] == "[REDACTED_CREDENTIAL]"
    assert scrubbed["nested"]["password_tried"] == "[REDACTED_CREDENTIAL]"
    assert scrubbed["nested"]["normal_field"] == "safe_value"

    # String regex redaction (JWT, Bearer, email)
    sample_text = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDN secretly sent to admin@example.com"
    redacted_text = redact_string(sample_text)
    assert "admin@example.com" not in redacted_text
    assert "[REDACTED_EMAIL]" in redacted_text


def test_knowledge_base_retrieval():
    # MITRE ATT&CK retrieval
    brute_force_docs = kb_retriever.retrieve("brute force password spraying", top_k=2)
    assert len(brute_force_docs) > 0
    top_doc = brute_force_docs[0]
    assert "T1110" in top_doc["id"]

    # CVE retrieval
    cve_docs = kb_retriever.retrieve("Log4Shell Apache Log4j RCE", top_k=1)
    assert len(cve_docs) > 0
    assert "CVE-2021-44228" in cve_docs[0]["id"]


@pytest.mark.asyncio
async def test_triage_agent_generates_bilingual_narratives():
    sample_event = {
        "source": "honeypot",
        "severity": "high",
        "type": "brute_force_suspected",
        "details": {
            "source_ip": "192.168.1.189",
            "username_tried": "admin",
            "password_tried": "secret123",
            "attempts_in_window": 5
        }
    }
    result = await triage_agent.triage_event(sample_event)
    assert "narrative_en" in result
    assert "narrative_bn" in result
    assert "citations" in result
    assert len(result["citations"]) > 0
    assert result["requires_human_approval"] is True


def test_correlation_agent():
    events = [
        {"ts": "2026-11-09T01:00:00Z", "source": "honeypot", "severity": "low", "type": "recon_probe", "details": {"source_ip": "192.168.1.5"}},
        {"ts": "2026-11-09T01:02:00Z", "source": "honeypot", "severity": "medium", "type": "login_attempt", "details": {"source_ip": "192.168.1.5"}},
        {"ts": "2026-11-09T01:03:00Z", "source": "ratelimiter", "severity": "high", "type": "blocked_request", "details": {"source_ip": "192.168.1.5"}}
    ]
    incidents = correlation_agent.correlate_events(events)
    assert len(incidents) == 1
    inc = incidents[0]
    assert inc["source_ip"] == "192.168.1.5"
    assert inc["event_count"] == 3
    assert inc["severity"] in ("high", "critical")
    assert "summary_en" in inc
    assert "summary_bn" in inc


def test_response_advisor():
    incident = {
        "source_ip": "203.0.113.99",
        "severity": "high",
        "type": "blocked_request",
        "details": {"source_ip": "203.0.113.99"}
    }
    actions = response_advisor.recommend_actions(incident)
    assert len(actions) >= 1
    first_action = actions[0]
    assert first_action["requires_human_approval"] is True
    assert first_action["status"] == "PENDING_APPROVAL"


@pytest.mark.asyncio
async def test_ask_analyst_bilingual():
    recent_events = [{
        "id": "11111111-1111-1111-1111-111111111111",
        "ts": "2026-11-09T01:00:00Z",
        "source": "honeypot",
        "severity": "high",
        "type": "brute_force_suspected",
        "details": {"source_ip": "192.168.1.189"}
    }]

    # English query
    en_res = await analyst_assistant.answer_question(
        question="What happened in the last critical event?",
        recent_events=recent_events,
        language_override="en"
    )
    assert en_res["language"] == "en"
    assert len(en_res["citations"]) > 0

    # Bangla query
    bn_res = await analyst_assistant.answer_question(
        question="কী ঘটেছে? কতটা বিপজ্জনক?",
        recent_events=recent_events,
        language_override="bn"
    )
    assert bn_res["language"] == "bn"


@pytest.mark.asyncio
async def test_analyst_api_endpoints(setup_analyst_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Ingest an event (triggers auto-triage on ingest)
        post_resp = await client.post("/events", json={
            "source": "honeypot",
            "severity": "medium",
            "type": "login_attempt",
            "details": {
                "source_ip": "10.10.10.20",
                "username_tried": "admin",
                "password_tried": "secret"
            }
        })
        assert post_resp.status_code == 201
        created = post_resp.json()
        assert created["analyst"] is not None
        assert "narrative_en" in created["analyst"]
        assert "narrative_bn" in created["analyst"]
        event_id = created["id"]

        # Explicit triage trigger
        triage_resp = await client.post(f"/analyst/triage/{event_id}")
        assert triage_resp.status_code == 200

        # Ask endpoint
        ask_resp = await client.post("/analyst/ask", json={
            "query": "Explain the recent login attempt on the honeypot",
            "language": "en"
        })
        assert ask_resp.status_code == 200
        assert "answer" in ask_resp.json()

        # Incidents endpoint
        inc_resp = await client.get("/analyst/incidents")
        assert inc_resp.status_code == 200
        assert "incidents" in inc_resp.json()
