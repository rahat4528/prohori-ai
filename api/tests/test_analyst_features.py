"""
Unit and Integration Tests for Prohori Analyst Features:
- Knowledge base direct retrieval (/knowledge/{id})
- SSE streaming response (/analyst/ask/stream)
- Incident persistence and lifecycle management (ACTIVE -> CONTAINED -> RESOLVED)
- Human-in-the-Loop approval and active perimeter denylist
"""

import pytest
import pytest_asyncio
import json
from httpx import AsyncClient, ASGITransport

import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from app.main import app
from app.database import engine, Base


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
