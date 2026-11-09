"""
Unit and Integration Tests for Prohori Event API
"""

# Use SQLite for fast, isolated test runs
import os
from uuid import uuid4

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
async def test_healthz():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/healthz")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ("healthy", "degraded")
        assert "version" in data


@pytest.mark.asyncio
async def test_ingest_and_get_event():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "source": "honeypot",
            "severity": "high",
            "type": "login_attempt",
            "details": {
                "source_ip": "192.168.1.100",
                "username_tried": "root"
            }
        }
        create_resp = await client.post("/events", json=payload)
        assert create_resp.status_code == 201
        created = create_resp.json()
        assert created["source"] == "honeypot"
        assert created["severity"] == "high"
        assert created["type"] == "login_attempt"
        assert created["details"]["username_tried"] == "root"
        event_id = created["id"]

        # Fetch by ID
        get_resp = await client.get(f"/events/{event_id}")
        assert get_resp.status_code == 200
        fetched = get_resp.json()
        assert fetched["id"] == event_id


@pytest.mark.asyncio
async def test_filter_events():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Ingest 3 events
        await client.post("/events", json={
            "source": "ratelimiter",
            "severity": "medium",
            "type": "blocked_request",
            "details": {"path": "/login"}
        })
        await client.post("/events", json={
            "source": "scanner",
            "severity": "low",
            "type": "open_port",
            "details": {"port": 80}
        })

        # Query all
        list_resp = await client.get("/events")
        assert list_resp.status_code == 200
        data = list_resp.json()
        assert data["total"] == 2

        # Filter by source
        filtered = await client.get("/events?source=ratelimiter")
        assert filtered.status_code == 200
        fdata = filtered.json()
        assert fdata["total"] == 1
        assert fdata["events"][0]["source"] == "ratelimiter"


@pytest.mark.asyncio
async def test_get_nonexistent_event():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        non_existent_id = str(uuid4())
        resp = await client.get(f"/events/{non_existent_id}")
        assert resp.status_code == 404


def test_websocket_broadcast():
    from starlette.testclient import TestClient
    with TestClient(app) as client:
        with client.websocket_connect("/stream") as websocket:
            # First message is connection_established handshake
            handshake = websocket.receive_json()
            assert handshake["type"] == "connection_established"

            # Ingest an event via REST
            post_resp = client.post("/events", json={
                "source": "honeypot",
                "severity": "critical",
                "type": "brute_force_suspected",
                "details": {"source_ip": "10.10.10.10"}
            })
            assert post_resp.status_code == 201

            # The WebSocket should receive the broadcasted event
            broadcast_msg = websocket.receive_json()
            assert broadcast_msg["type"] == "new_event"
            assert broadcast_msg["event"]["source"] == "honeypot"
            assert broadcast_msg["event"]["severity"] in ("critical", "high")
            assert broadcast_msg["event"]["type"] == "brute_force_suspected"
            assert broadcast_msg["event"]["details"]["source_ip"] == "10.10.10.10"


