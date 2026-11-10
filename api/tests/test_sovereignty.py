"""
Unit and Integration Tests for Data Sovereignty Mode & Immutable Audit Log
"""

import pytest
import pytest_asyncio
from app.database import Base, engine
from app.main import app
from httpx import ASGITransport, AsyncClient


@pytest_asyncio.fixture
async def setup_sovereignty_db():
    from app.routes.sovereignty import SOVEREIGNTY_STATE
    SOVEREIGNTY_STATE["local_mode"] = True
    SOVEREIGNTY_STATE["cloud_egress_blocked"] = True
    SOVEREIGNTY_STATE["pii_redaction_enforced"] = True
    from sensors.ratelimiter.limiter import default_limiter
    default_limiter.reset()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()



@pytest.mark.asyncio
async def test_sovereignty_status_and_toggle(setup_sovereignty_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check default status
        status_resp = await client.get("/sovereignty/status")
        assert status_resp.status_code == 200
        data = status_resp.json()
        assert "sovereignty_mode" in data
        assert data["cloud_egress_blocked"] is True

        # Toggle to cloud
        toggle_resp = await client.post("/sovereignty/toggle", json={"mode": "cloud"})
        assert toggle_resp.status_code == 200
        assert toggle_resp.json()["current_mode"] == "cloud"

        # Toggle back to local
        toggle_local = await client.post("/sovereignty/toggle", json={"mode": "local"})
        assert toggle_local.status_code == 200
        assert toggle_local.json()["current_mode"] == "local"


@pytest.mark.asyncio
async def test_audit_log_records_triage_and_human_approval(setup_sovereignty_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Ingest an event (generates automatic audit record)
        post_resp = await client.post("/events", json={
            "source": "honeypot",
            "severity": "high",
            "type": "brute_force_suspected",
            "details": {"source_ip": "192.168.1.189"}
        })
        assert post_resp.status_code == 201

        # 2. Check audit log has entry
        audit_resp = await client.get("/audit")
        assert audit_resp.status_code == 200
        audit_trail = audit_resp.json()
        assert len(audit_trail) >= 1
        triage_entry = next((a for a in audit_trail if a["action_type"] == "AI_TRIAGE_PERFORMED"), None)
        assert triage_entry is not None
        assert triage_entry["actor"] == "AI_SOC_ANALYST"

        # 3. Approve a countermeasure (HITL)
        approve_resp = await client.post("/audit/approve", json={
            "action_id": "ACT-TEST-001",
            "target": "192.168.1.189",
            "action_type": "FIREWALL_BLOCK_IP",
            "operator_id": "operator-sakib-01"
        })
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "APPROVED"

        # 4. Verify approval is in immutable audit trail
        audit_resp2 = await client.get("/audit?action_type=COUNTERMEASURE_APPROVED")
        assert audit_resp2.status_code == 200
        approved_entries = audit_resp2.json()
        assert len(approved_entries) == 1
        assert approved_entries[0]["human_approved"] is True
        assert approved_entries[0]["operator_id"] == "operator-sakib-01"

