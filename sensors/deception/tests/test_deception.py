"""
Unit tests for Deception Sensor (Simulated Honeypot)
"""

import pytest
from httpx import AsyncClient, ASGITransport
from sensors.deception.main import app, tracker
from sensors.deception.config import deception_settings


@pytest.fixture(autouse=True)
def reset_tracker():
    tracker.reset()
    yield
    tracker.reset()


@pytest.mark.asyncio
async def test_honeypot_login_page_renders():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/login")
        assert resp.status_code == 200
        assert "Secure Administration Portal" in resp.text


@pytest.mark.asyncio
async def test_honeypot_login_rejection():
    # Set simulated delay to 0 for fast tests
    deception_settings.SIMULATED_DELAY_SEC = 0.0

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/login",
            data={"username": "admin", "password": "wrongpassword123"},
            headers={"x-forwarded-for": "192.168.1.50"}
        )
        assert resp.status_code == 401
        data = resp.json()
        assert data["status"] == "error"
        assert data["error_code"] == "AUTH_FAILED_ERR_9104"


@pytest.mark.asyncio
async def test_honeypot_brute_force_detection():
    deception_settings.SIMULATED_DELAY_SEC = 0.0
    deception_settings.BRUTE_FORCE_THRESHOLD = 3

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First 2 attempts
        for i in range(2):
            resp = await client.post(
                "/login",
                data={"username": f"user_{i}", "password": "password"},
                headers={"x-forwarded-for": "10.0.0.99"}
            )
            assert resp.status_code == 401

        # 3rd attempt should trigger brute force threshold in tracker
        resp3 = await client.post(
            "/login",
            data={"username": "user_3", "password": "password"},
            headers={"x-forwarded-for": "10.0.0.99"}
        )
        assert resp3.status_code == 401
        count, is_brute = tracker.record_attempt("10.0.0.99")
        assert is_brute is True


@pytest.mark.asyncio
async def test_honeypot_recon_traps():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/.env")
        assert resp.status_code == 404
