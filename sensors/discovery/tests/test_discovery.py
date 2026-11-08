"""
Unit and Safety Tests for Defensive Asset Discovery Sensor
Specifically verifies that off-list targets are strictly blocked by the guard.
"""

import pytest
from httpx import AsyncClient, ASGITransport

from sensors.discovery.guard import TargetAllowlistGuard, TargetNotAllowlistedError
from sensors.discovery.cve_matcher import CVEMatcher
from sensors.discovery.main import app


def test_allowlist_guard_allows_permitted_targets():
    guard = TargetAllowlistGuard(allowed_targets=["127.0.0.1", "localhost", "10.0.0.0/24"])

    assert guard.is_allowed("127.0.0.1") is True
    assert guard.is_allowed("localhost") is True
    assert guard.is_allowed("10.0.0.42") is True
    # Should not raise
    guard.verify_or_raise("10.0.0.42")


def test_allowlist_guard_strictly_refuses_off_list_targets():
    guard = TargetAllowlistGuard(allowed_targets=["127.0.0.1", "10.0.0.0/24"])

    forbidden_targets = [
        "8.8.8.8",
        "google.com",
        "1.1.1.1",
        "192.168.5.5",
        "203.0.113.195",
        "aws.amazon.com"
    ]

    for target in forbidden_targets:
        assert guard.is_allowed(target) is False
        with pytest.raises(TargetNotAllowlistedError) as exc_info:
            guard.verify_or_raise(target)
        assert "SECURITY BOUNDARY VIOLATION" in str(exc_info.value)


def test_cve_matcher():
    matcher = CVEMatcher()

    # Log4Shell match
    log4j_matches = matcher.match_banner("Apache Log4j/2.14.1 Enterprise Server")
    assert len(log4j_matches) > 0
    assert log4j_matches[0]["cve_id"] == "CVE-2021-44228"
    assert log4j_matches[0]["severity"] == "critical"

    # OpenSSH Terrapin match
    ssh_matches = matcher.match_banner("SSH-2.0-OpenSSH_8.9p1 Ubuntu")
    assert len(ssh_matches) > 0
    assert ssh_matches[0]["cve_id"] == "CVE-2023-38606"


@pytest.mark.asyncio
async def test_scan_endpoint_refuses_off_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/scan", json={"target": "8.8.8.8"})
        assert resp.status_code == 403
        data = resp.json()
        assert "SECURITY BOUNDARY VIOLATION" in data["detail"]


@pytest.mark.asyncio
async def test_scan_endpoint_allows_local():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Scan a non-listening high port on localhost
        resp = await client.post("/scan", json={"target": "127.0.0.1", "ports": [59999]})
        assert resp.status_code == 200
        data = resp.json()
        assert data["allowlist_verified"] is True
        assert data["target"] == "127.0.0.1"


@pytest.mark.asyncio
async def test_allowlist_view():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/allowlist")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "enforced"
        assert "DEFENSIVE_LAB_ONLY" in data["policy"]
