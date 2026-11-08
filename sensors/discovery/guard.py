"""
Target Allowlist Enforcement Guard for Asset Discovery Sensor.
MANDATORY DEFENSIVE SAFETY BOUNDARY.
Strictly ensures that asset discovery ONLY runs against explicitly allowlisted lab machines.
Any off-list scan attempt is immediately rejected and recorded in the audit log.
"""

import ipaddress
import logging
import os
from typing import List, Set

logger = logging.getLogger("prohori.discovery.guard")

DEFAULT_ALLOWLIST = [
    "127.0.0.1",
    "localhost",
    "::1",
    "10.0.0.0/8",      # Internal lab subnets
    "172.16.0.0/12",
    "192.168.0.0/16",
    "10.10.10.0/24"
]


class TargetNotAllowlistedError(Exception):
    """Raised when an unauthorized scan target is supplied."""
    pass


class TargetAllowlistGuard:
    def __init__(self, allowed_targets: List[str] = None):
        env_allowlist = os.getenv("DISCOVERY_ALLOWLIST")
        if env_allowlist:
            self.allowlist_raw = [t.strip() for t in env_allowlist.split(",") if t.strip()]
        else:
            self.allowlist_raw = allowed_targets or list(DEFAULT_ALLOWLIST)

        self.allowed_networks: List[ipaddress.IPv4Network | ipaddress.IPv6Network] = []
        self.allowed_hosts: Set[str] = set()

        for item in self.allowlist_raw:
            try:
                if "/" in item:
                    self.allowed_networks.append(ipaddress.ip_network(item, strict=False))
                else:
                    self.allowed_hosts.add(item.lower())
                    # Also try as /32 or /128 IP
                    try:
                        ip_obj = ipaddress.ip_address(item)
                        self.allowed_networks.append(ipaddress.ip_network(f"{item}/{32 if ip_obj.version == 4 else 128}"))
                    except ValueError:
                        pass
            except Exception as e:
                logger.warning(f"Error parsing allowlist entry '{item}': {e}")

    def is_allowed(self, target: str) -> bool:
        """Evaluate if target host/IP is strictly within configured defensive allowlist."""
        target = target.strip().lower()

        # Direct host match
        if target in self.allowed_hosts:
            return True

        # Check IP address / CIDR
        try:
            target_ip = ipaddress.ip_address(target)
            for net in self.allowed_networks:
                if target_ip in net:
                    return True
        except ValueError:
            # Target is a hostname (e.g. localhost, lab-node)
            if target in ("localhost", "127.0.0.1", "::1"):
                return True

        return False

    def verify_or_raise(self, target: str) -> None:
        """Enforces allowlist. Raises TargetNotAllowlistedError if off-list."""
        if not self.is_allowed(target):
            audit_msg = f"SECURITY BOUNDARY VIOLATION: Refused scan against non-allowlisted target '{target}'."
            logger.error(audit_msg)
            raise TargetNotAllowlistedError(audit_msg)


allowlist_guard = TargetAllowlistGuard()
