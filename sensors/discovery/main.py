"""
Prohori AI - Asset Discovery Sensor Service
DEFENSIVE LAB-SCOPED COMPONENT.
Scans strictly allowlisted internal hosts, discovers active services,
enriches findings with CVE vulnerabilities, and emits security events to the Prohori Event API.
"""

import logging
import os
from datetime import UTC, datetime

import httpx
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from .guard import TargetNotAllowlistedError, allowlist_guard
from .scanner import scan_target

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [DISCOVERY] %(message)s")
logger = logging.getLogger("prohori.discovery")

app = FastAPI(
    title="Prohori Asset Discovery Sensor",
    description="Defensive network asset and vulnerability discovery for authorized lab targets",
    version="0.1.0"
)

EVENT_API_URL = os.getenv("EVENT_API_URL", "http://localhost:8000")


class ScanRequest(BaseModel):
    target: str = Field(..., max_length=255, description="Target hostname or IP (MUST be on defensive allowlist)")
    ports: list[int] | None = Field(None, max_length=100, description="Optional custom port list to probe (1-65535)")

    @field_validator("ports")
    @classmethod
    def validate_ports(cls, v: list[int] | None):
        if v is not None:
            for p in v:
                if not (1 <= p <= 65535):
                    raise ValueError(f"Port {p} is out of valid range (1-65535).")
        return v


async def emit_discovery_events(scan_results: dict):
    """Emit open_port and cve_match events to Event API."""
    target = scan_results["target"]
    url = f"{EVENT_API_URL}/events"
    headers = {"Content-Type": "application/json"}
    api_key = os.getenv("PROHORI_API_KEY")
    if api_key:
        headers["X-API-Key"] = api_key

    async with httpx.AsyncClient(timeout=4.0) as client:
        for svc in scan_results["services"]:
            # 1. Emit open_port / service_identified event
            open_port_payload = {
                "source": "scanner",
                "severity": "low",
                "type": "open_port",
                "details": {
                    "target_host": target,
                    "port": svc["port"],
                    "protocol": svc["protocol"],
                    "service": svc["service"],
                    "banner": svc["banner"],
                    "allowlist_verified": True,
                    "ts": datetime.now(UTC).isoformat()
                }
            }
            try:
                await client.post(url, json=open_port_payload, headers=headers)
            except Exception as e:
                logger.warning(f"Failed to post open_port event: {e}")

            # 2. Emit cve_match events if vulnerabilities found
            for cve in svc.get("cve_matches", []):
                cve_payload = {
                    "source": "scanner",
                    "severity": cve["severity"],
                    "type": "cve_match",
                    "details": {
                        "target_host": target,
                        "port": svc["port"],
                        "service": svc["service"],
                        "cve_id": cve["cve_id"],
                        "cve_name": cve["name"],
                        "cvss": cve["cvss"],
                        "description": cve["description"],
                        "mitigation": cve["mitigation"],
                        "matched_banner": cve["matched_banner"],
                        "ts": datetime.now(UTC).isoformat()
                    }
                }
                try:
                    await client.post(url, json=cve_payload, headers=headers)
                    logger.info(f"Emitted CVE match event [{cve['cve_id']}] for {target}:{svc['port']}")
                except Exception as e:
                    logger.warning(f"Failed to post cve_match event: {e}")


@app.post("/scan", summary="Perform defensive port & vulnerability scan on allowlisted host")
async def execute_scan(req: ScanRequest):
    """Initiates port discovery and CVE matching on target host.

    Target MUST be within configured allowlist or request is refused.
    """
    try:
        results = await scan_target(req.target, req.ports)
        # Asynchronously forward findings to Event API
        import asyncio
        asyncio.create_task(emit_discovery_events(results))
        return results
    except TargetNotAllowlistedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error during scan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan error: {e!s}"
        )


@app.get("/allowlist", summary="View configured target allowlist")
async def get_allowlist():
    return {
        "status": "enforced",
        "configured_allowlist": allowlist_guard.allowlist_raw,
        "policy": "DEFENSIVE_LAB_ONLY",
        "description": "Scans targeting any host or subnet not listed above are rejected with 403 Forbidden."
    }


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "sensor": "discovery", "allowlist_enforced": True}

