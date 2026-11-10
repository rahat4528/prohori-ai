"""
Unit and Integration Tests for Prohori Analyst Features:
- Knowledge base direct retrieval (/knowledge/{id})
- SSE streaming response (/analyst/ask/stream)
- Incident persistence and lifecycle management (ACTIVE -> CONTAINED -> RESOLVED)
- Human-in-the-Loop approval and active perimeter denylist
"""

import json
import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from app.database import Base, engine
from app.main import app


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    from sensors.ratelimiter.limiter import default_limiter
    default_limiter.reset()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()



@pytest.mark.asyncio
async def test_get_knowledge_doc():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test MITRE technique lookup
        resp = await client.get("/analyst/knowledge/T1110.001")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "T1110.001"
        assert "Password Guessing" in data["title"]
        assert "mitigation" in data

        # Test CVE lookup
        resp_cve = await client.get("/analyst/knowledge/CVE-2023-38606")
        assert resp_cve.status_code == 200
        data_cve = resp_cve.json()
        assert data_cve["id"] == "CVE-2023-38606"

        # Test root alias /knowledge/{doc_id}
        resp_alias = await client.get("/knowledge/T1110.001")
        assert resp_alias.status_code == 200
        assert resp_alias.json()["id"] == "T1110.001"

        # Test 404 for nonexistent document
        resp_404 = await client.get("/analyst/knowledge/NONEXISTENT-999")
        assert resp_404.status_code == 404


@pytest.mark.asyncio
async def test_ask_analyst_stream():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "query": "Explain what a brute force attack is and how to mitigate it.",
            "language": "en"
        }
        resp = await client.post("/analyst/ask/stream", json=payload)
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")

        # Read streaming lines
        lines = resp.text.split("\n\n")
        non_empty_lines = [l.strip() for l in lines if l.strip().startswith("data:")]
        assert len(non_empty_lines) > 0

        # Verify final completion event contains metadata
        final_line = non_empty_lines[-1]
        final_payload = json.loads(final_line.replace("data: ", ""))
        assert final_payload["done"] is True
        assert len(final_payload["answer"]) > 0
        assert "citations" in final_payload


@pytest.mark.asyncio
async def test_incident_persistence_and_status_patch():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Ingest two events sharing an attacker IP to trigger correlation
        attacker_ip = "192.168.10.45"
        for i in range(2):
            await client.post("/events", json={
                "source": "honeypot",
                "severity": "high",
                "type": f"login_attempt_{i}",
                "details": {"source_ip": attacker_ip, "username_tried": f"admin_{i}"}
            })

        # List incidents
        incidents_resp = await client.get("/analyst/incidents")
        assert incidents_resp.status_code == 200
        inc_data = incidents_resp.json()
        assert inc_data["total_incidents"] >= 1

        target_inc = next((inc for inc in inc_data["incidents"] if inc["source_ip"] == attacker_ip), None)
        assert target_inc is not None
        assert target_inc["status"] == "ACTIVE"
        inc_id = target_inc["incident_id"]

        # Patch status to CONTAINED
        patch_resp = await client.patch(
            f"/analyst/incidents/{inc_id}/status",
            json={"status": "CONTAINED", "operator_id": "SOC_LEAD_FARHAN", "notes": "Firewall block applied"}
        )
        assert patch_resp.status_code == 200
        patch_data = patch_resp.json()
        assert patch_data["status"] == "CONTAINED"

        # Verify persistence on subsequent get
        incidents_resp2 = await client.get("/analyst/incidents")
        target_inc2 = next((inc for inc in incidents_resp2.json()["incidents"] if inc["incident_id"] == inc_id), None)
        assert target_inc2 is not None
        assert target_inc2["status"] == "CONTAINED"


@pytest.mark.asyncio
async def test_human_approval_denylist_enforcement():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        test_ip = "203.0.113.88"

        # Approve firewall drop action for IP
        approve_resp = await client.post("/audit/approve", json={
            "action_id": "ACT-BLOCK-001",
            "target": test_ip,
            "action_type": "PERIMETER_FIREWALL_DROP",
            "operator_id": "OPERATOR_RAFIQ"
        })
        assert approve_resp.status_code == 200
        data = approve_resp.json()
        assert data["status"] == "APPROVED"
        assert data["enforcement"] == "ACTIVE_DENYLIST_UPDATED"

        # Verify IP is in active denylist
        denylist_resp = await client.get("/ratelimiter/denylist")
        assert denylist_resp.status_code == 200
        assert test_ip in denylist_resp.json()["active_denied_ips"]

        # Remove from denylist
        del_resp = await client.delete(f"/ratelimiter/denylist/{test_ip}")
        assert del_resp.status_code == 200
        assert del_resp.json()["status"] == "removed"

        # Verify IP is no longer in denylist
        denylist_resp2 = await client.get("/ratelimiter/denylist")
        assert test_ip not in denylist_resp2.json()["active_denied_ips"]


@pytest.mark.asyncio
async def test_analyst_metadata_provider_and_model():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Ask endpoint returns provider & model in AskResponse
        resp = await client.post("/analyst/ask", json={"query": "What is brute force?", "language": "en"})
        assert resp.status_code == 200
        data = resp.json()
        assert "provider" in data
        assert "model" in data
        assert len(data["provider"]) > 0
        assert len(data["model"]) > 0

        # 2. Ingest event and trigger triage, verify event.analyst contains provider and model
        ingest_resp = await client.post("/events", json={
            "source": "honeypot",
            "severity": "medium",
            "type": "unauthorized_probe",
            "details": {"source_ip": "192.168.1.100", "path": "/admin"}
        })
        assert ingest_resp.status_code == 201
        event_id = ingest_resp.json()["id"]

        triage_resp = await client.post(f"/analyst/triage/{event_id}")
        assert triage_resp.status_code == 200
        triage_data = triage_resp.json()
        assert "analyst" in triage_data and triage_data["analyst"] is not None
        assert "provider" in triage_data["analyst"]
        assert "model" in triage_data["analyst"]


@pytest.mark.asyncio
async def test_triage_invalid_json_fallback():
    """Verify that malformed or non-JSON model output triggers graceful fallback to deterministic RAG."""
    from analyst.agents.triage import TriageAgent
    from analyst.providers.base import LLMProvider

    class BrokenJsonProvider(LLMProvider):
        @property
        def provider_name(self) -> str:
            return "broken-mock-llm"

        async def generate(self, prompt: str, system_prompt: str = "", format: str | None = None) -> str:
            return "I am an AI assistant and I refuse to output JSON: {status: incomplete..."

    agent = TriageAgent(provider=BrokenJsonProvider())
    test_event = {
        "source": "honeypot",
        "severity": "high",
        "type": "login_attempt_burst",
        "details": {"source_ip": "192.168.1.189", "username_tried": "admin"}
    }

    result = await agent.triage_event(test_event)
    assert result is not None
    assert result["provider"] == "deterministic-offline-rag (fallback)"
    assert "fallback_reason" in result
    assert "Invalid JSON" in result["fallback_reason"]
    assert result["severity"] in ["high", "critical"]
    assert len(result["narrative_en"]) > 0
    assert len(result["narrative_bn"]) > 0


@pytest.mark.asyncio
async def test_triage_grounding_validation_filters_hallucinations():
    """Verify that hallucinated citations not present in knowledge base are filtered out."""
    from analyst.agents.triage import TriageAgent
    from analyst.providers.base import LLMProvider

    class HallucinatingProvider(LLMProvider):
        @property
        def provider_name(self) -> str:
            return "hallucinating-mock-llm"

        async def generate(self, prompt: str, system_prompt: str = "", format: str | None = None) -> str:
            return json.dumps({
                "severity": "high",
                "confidence": 0.95,
                "narrative_en": "Attack detected.",
                "narrative_bn": "আক্রমণ শনাক্ত হয়েছে।",
                "citations": ["T9999.888", "CVE-9999-0000", "T1110.001"],
                "mitre_technique": "T9999.888",
                "recommended_action": "Block IP",
                "requires_human_approval": True
            })

    agent = TriageAgent(provider=HallucinatingProvider())
    test_event = {
        "source": "honeypot",
        "severity": "high",
        "type": "login_attempt_burst",
        "details": {"source_ip": "192.168.1.189"}
    }

    result = await agent.triage_event(test_event)
    assert result is not None
    # Hallucinated IDs T9999.888 and CVE-9999-0000 must NOT be in citations
    assert "T9999.888" not in result["citations"]
    assert "CVE-9999-0000" not in result["citations"]
    # Real ID T1110.001 must be preserved
    assert "T1110.001" in result["citations"]
    # mitre_technique must not be the hallucinated T9999.888
    assert result["mitre_technique"] != "T9999.888"


