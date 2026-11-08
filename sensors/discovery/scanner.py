"""
Prohori AI - Non-Invasive Defensive Port & Service Scanner
Scans strictly allowlisted lab targets with graceful timeouts and banner grabbing.
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional

from .guard import allowlist_guard
from .cve_matcher import cve_matcher

logger = logging.getLogger("prohori.discovery.scanner")

DEFAULT_PORTS = [21, 22, 80, 443, 3000, 5432, 8000, 8080, 8081, 8082]

COMMON_SERVICES = {
    21: "ftp",
    22: "ssh",
    80: "http",
    443: "https",
    3000: "react_web_console",
    5432: "postgresql",
    8000: "prohori_event_api",
    8080: "http_proxy",
    8081: "deception_honeypot",
    8082: "ratelimiter_guard"
}


async def scan_single_port(host: str, port: int, timeout: float = 0.5) -> Optional[Dict[str, Any]]:
    """Attempt non-invasive TCP connection to determine port state and grab banner."""
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port),
            timeout=timeout
        )

        banner = ""
        service_hint = COMMON_SERVICES.get(port, "unknown")

        try:
            # If HTTP port, send non-invasive HEAD request
            if service_hint in ("http", "https", "prohori_event_api", "deception_honeypot", "http_proxy", "react_web_console"):
                writer.write(b"HEAD / HTTP/1.0\r\nHost: " + host.encode() + b"\r\n\r\n")
                await writer.drain()

            # Read initial response / banner
            raw_banner = await asyncio.wait_for(reader.read(256), timeout=0.6)
            banner = raw_banner.decode(errors="ignore").strip().splitlines()[0] if raw_banner else ""
        except Exception:
            pass
        finally:
            writer.close()
            try:
                await writer.wait_closed()
            except Exception:
                pass

        # Check CVE matches
        cve_matches = cve_matcher.match_banner(banner, service=service_hint, port=port)

        return {
            "port": port,
            "state": "open",
            "protocol": "tcp",
            "service": service_hint,
            "banner": banner or f"{service_hint}_active",
            "cve_matches": cve_matches
        }

    except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
        return None


async def scan_target(host: str, ports: Optional[List[int]] = None) -> Dict[str, Any]:
    """Scan an allowlisted target host for active ports, service banners, and CVEs."""
    # Step 1: Enforce allowlist boundary strictly
    allowlist_guard.verify_or_raise(host)

    target_ports = ports or DEFAULT_PORTS
    logger.info(f"Initiating defensive scan on allowlisted target '{host}' ({len(target_ports)} ports)...")

    tasks = [scan_single_port(host, p) for p in target_ports]
    results = await asyncio.gather(*tasks)

    open_services = [r for r in results if r is not None]

    return {
        "target": host,
        "allowlist_verified": True,
        "ports_scanned": len(target_ports),
        "open_ports_count": len(open_services),
        "services": open_services
    }
