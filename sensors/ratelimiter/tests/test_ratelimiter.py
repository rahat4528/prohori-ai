"""
Unit tests for API Abuse Guard (Rate Limiter Sensor)
"""

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from sensors.ratelimiter.limiter import SlidingWindowRateLimiter
from sensors.ratelimiter.middleware import RateLimitMiddleware


def test_sliding_window_normal_and_warn():
    limiter = SlidingWindowRateLimiter(window_seconds=10, max_requests=5, warn_ratio=0.6)
    ip = "192.168.1.200"

    # Requests 1 to 2 -> normal
    d1 = limiter.evaluate(ip, "/api")
    assert d1.allowed is True
    assert d1.escalation == "normal"

    # Request 3 (>= 60% of 5) -> warn
    limiter.evaluate(ip, "/api")
    d3 = limiter.evaluate(ip, "/api")
    assert d3.allowed is True
    assert d3.escalation == "warn"


def test_sliding_window_temp_block_and_escalation():
    limiter = SlidingWindowRateLimiter(
        window_seconds=10,
        max_requests=3,
        temp_block_seconds=15,
        extended_block_seconds=60,
        repeat_offender_threshold=2
    )
    ip = "10.0.0.5"

    # 3 allowed
    for _ in range(3):
        assert limiter.evaluate(ip, "/test").allowed is True

    # 4th request exceeds limit -> first offense, temp_block
    d4 = limiter.evaluate(ip, "/test")
    assert d4.allowed is False
    assert d4.status_code == 429
    assert d4.escalation == "temp_block"
    assert d4.retry_after == 15

    # Simulate block expiration and another burst to test repeat offense
    limiter.blocks[ip] = 0.0  # expire block
    for _ in range(4):
        limiter.requests[ip].append(limiter.requests[ip][-1] + 1)

    # Next evaluation triggers second offense -> extended_block
    d_repeat = limiter.evaluate(ip, "/test")
    assert d_repeat.allowed is False
    assert d_repeat.escalation == "extended_block"
    assert d_repeat.retry_after == 60


def test_allowlist_and_denylist():
    limiter = SlidingWindowRateLimiter(window_seconds=10, max_requests=2)
    limiter.add_to_allowlist("127.0.0.1")
    limiter.add_to_denylist("6.6.6.6")

    # Allowlisted never blocked
    for _ in range(10):
        d = limiter.evaluate("127.0.0.1", "/api")
        assert d.allowed is True
        assert d.escalation == "allowlist"

    # Denylisted immediately denied 403
    d_deny = limiter.evaluate("6.6.6.6", "/api")
    assert d_deny.allowed is False
    assert d_deny.status_code == 403
    assert d_deny.escalation == "denylist"


@pytest.mark.asyncio
async def test_middleware_integration():
    test_app = FastAPI()
    limiter = SlidingWindowRateLimiter(window_seconds=10, max_requests=2, temp_block_seconds=5)

    emitted_events = []

    def mock_callback(event):
        emitted_events.append(event)

    test_app.add_middleware(
        RateLimitMiddleware,
        limiter=limiter,
        event_callback=mock_callback,
        exempt_paths=["/healthz"]
    )

    @test_app.get("/data")
    async def get_data():
        return {"hello": "world"}

    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Request 1 & 2 -> OK
        r1 = await client.get("/data", headers={"x-client-ip": "8.8.8.8"})
        assert r1.status_code == 200
        r2 = await client.get("/data", headers={"x-client-ip": "8.8.8.8"})
        assert r2.status_code == 200

        # Request 3 -> 429 Too Many Requests
        r3 = await client.get("/data", headers={"x-client-ip": "8.8.8.8"})
        assert r3.status_code == 429
        assert "Retry-After" in r3.headers
        assert r3.json()["error"] == "rate_limit_exceeded"

        # Check emitted event
        assert len(emitted_events) == 1
        ev = emitted_events[0]
        assert ev["source"] == "ratelimiter"
        assert ev["type"] == "blocked_request"
        assert ev["details"]["source_ip"] == "8.8.8.8"

