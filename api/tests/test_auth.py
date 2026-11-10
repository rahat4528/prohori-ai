"""
Unit and Integration Tests for Prohori AI Opt-in API Key Authentication
"""
import os

import pytest
import pytest_asyncio
from app.database import Base, engine
from app.main import app
from httpx import ASGITransport, AsyncClient


@pytest_asyncio.fixture
async def setup_auth_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
async def test_auth_disabled_when_env_var_unset(setup_auth_db):
    """When PROHORI_API_KEY is unset, write endpoints allow open requests (demo mode)."""
    if "PROHORI_API_KEY" in os.environ:
        del os.environ["PROHORI_API_KEY"]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # POST /events without header succeeds
        resp = await client.post("/events", json={
            "source": "honeypot",
            "severity": "low",
            "type": "test_unauthenticated_allowed",
            "details": {"source_ip": "10.0.0.1"}
        })
        assert resp.status_code == 201

        # POST /audit/approve without header succeeds
        appr_resp = await client.post("/audit/approve", json={
            "action_id": "ACT-TEST-01",
            "target": "10.0.0.1",
            "action_type": "FIREWALL_BLOCK_IP",
            "operator_id": "test-admin"
        })
        assert appr_resp.status_code == 200

        # POST /sovereignty/toggle without header succeeds
        togg_resp = await client.post("/sovereignty/toggle", json={"mode": "local"})
        assert togg_resp.status_code == 200


@pytest.mark.asyncio
async def test_auth_enforced_when_env_var_set(setup_auth_db):
    """When PROHORI_API_KEY is configured, write endpoints reject missing/invalid keys and allow matching keys."""
    test_key = "secure-prohori-token-12345"
    os.environ["PROHORI_API_KEY"] = test_key

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        event_payload = {
            "source": "honeypot",
            "severity": "high",
            "type": "brute_force_suspected",
            "details": {"source_ip": "192.168.1.99"}
        }

        # 1. Missing header -> 401 Unauthorized
        resp_missing = await client.post("/events", json=event_payload)
        assert resp_missing.status_code == 401
        assert "Invalid or missing X-API-Key" in resp_missing.json()["detail"]

        # 2. Invalid key -> 401 Unauthorized
        resp_invalid = await client.post(
            "/events",
            json=event_payload,
            headers={"X-API-Key": "wrong-token-abc"}
        )
        assert resp_invalid.status_code == 401

        # 3. Matching key -> 201 Created
        resp_valid = await client.post(
            "/events",
            json=event_payload,
            headers={"X-API-Key": test_key}
        )
        assert resp_valid.status_code == 201

        # 4. Protected /audit/approve with matching key -> 200 OK
        resp_appr = await client.post(
            "/audit/approve",
            json={
                "action_id": "ACT-TEST-02",
                "target": "192.168.1.99",
                "action_type": "FIREWALL_BLOCK_IP",
                "operator_id": "test-admin"
            },
            headers={"X-API-Key": test_key}
        )
        assert resp_appr.status_code == 200

        # 5. Protected /sovereignty/toggle rejected if header missing
        resp_togg_fail = await client.post("/sovereignty/toggle", json={"mode": "cloud"})
        assert resp_togg_fail.status_code == 401

        # 6. Protected /sovereignty/toggle allowed with matching key
        resp_togg_ok = await client.post(
            "/sovereignty/toggle",
            json={"mode": "cloud"},
            headers={"X-API-Key": test_key}
        )
        assert resp_togg_ok.status_code == 200

    # Cleanup environment variable
    del os.environ["PROHORI_API_KEY"]
