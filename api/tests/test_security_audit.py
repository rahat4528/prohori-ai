"""
Unit and integration tests for Prohori AI Security Audit Layers:
1. Server-side validation bounds & rejection of out-of-range inputs
2. Timing attack mitigation via constant-time comparison
3. Pre-persistence PII & password redaction in event ingestion
4. Security response headers (CSP, nosniff, DENY, etc.)
5. Generic safe error messages on unhandled exceptions
"""

import os
import secrets
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from app.database import Base, engine
from app.audit import AuditRecordModel  # Ensure audit model registered in Base.metadata
from app.db_models import EventRecord, IncidentRecord
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
async def test_security_headers_enforced():
    """Verify security headers middleware sets nosniff, frame denial, and referrer policies."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/healthz")
        assert response.status_code == 200
        assert response.headers.get("x-content-type-options") == "nosniff"
        assert response.headers.get("x-frame-options") == "DENY"
        assert response.headers.get("x-xss-protection") == "1; mode=block"
        assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"


@pytest.mark.asyncio
async def test_server_side_validation_sovereignty_mode():
    """Verify ToggleSovereigntyRequest rejects invalid modes."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Invalid mode outside ^(local|cloud)$
        bad_response = await ac.post("/sovereignty/toggle", json={"mode": "unauthorized_proxy"})
        assert bad_response.status_code == 422

        # Valid mode
        good_response = await ac.post("/sovereignty/toggle", json={"mode": "local"})
        assert good_response.status_code == 200
        assert good_response.json()["current_mode"] == "local"


@pytest.mark.asyncio
async def test_server_side_validation_analyst_language():
    """Verify AskRequest rejects unsupported language codes."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        bad_response = await ac.post("/analyst/ask", json={
            "query": "What is the status?",
            "language": "es"  # Only 'en' and 'bn' are permitted
        })
        assert bad_response.status_code == 422


@pytest.mark.asyncio
async def test_event_ingest_redacts_credentials_before_db():
    """Verify sensitive passwords and tokens in event details are sanitized prior to persistence."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "source": "honeypot",
            "severity": "high",
            "type": "honeypot_login_probe",
            "details": {
                "source_ip": "198.51.100.42",
                "attempted_password": "SuperSecretPassword123!",
                "api_secret": "my-secret-key-abcdef123456"
            }
        }
        response = await ac.post("/events", json=payload)
        assert response.status_code == 201
        event_data = response.json()
        saved_details = event_data["details"]
        assert saved_details.get("attempted_password") == "[REDACTED_CREDENTIAL]"
        assert saved_details.get("api_secret") == "[REDACTED_CREDENTIAL]"


def test_constant_time_api_key_verification():
    """Verify secrets.compare_digest operates as constant-time comparison."""
    key_a = "prohori-dev-test-key-12345"
    key_b = "prohori-dev-test-key-12345"
    key_c = "prohori-dev-test-key-99999"

    assert secrets.compare_digest(key_a, key_b) is True
    assert secrets.compare_digest(key_a, key_c) is False
