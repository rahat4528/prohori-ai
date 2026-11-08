"""
Sliding-Window Rate Limiter with Progressive Escalation.
DEFENSIVE LAB-SCOPED GUARD.
Protects endpoints against flood, brute-force, and resource exhaustion.
"""

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Set, Optional


@dataclass
class LimiterDecision:
    allowed: bool
    status_code: int = 200
    retry_after: int = 0
    escalation: str = "normal"  # normal, warn, temp_block, extended_block, denylist, allowlist
    count: int = 0
    limit: int = 10
    window: str = "10s"
    message: str = "OK"


class SlidingWindowRateLimiter:
    def __init__(
        self,
        window_seconds: int = 10,
        max_requests: int = 10,
        warn_ratio: float = 0.7,
        temp_block_seconds: int = 30,
        extended_block_seconds: int = 180,
        repeat_offender_threshold: int = 2
    ):
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self.warn_threshold = int(max_requests * warn_ratio)
        self.temp_block_seconds = temp_block_seconds
        self.extended_block_seconds = extended_block_seconds
        self.repeat_offender_threshold = repeat_offender_threshold

        # Sets for explicit access control
        self.allowlist: Set[str] = set()
        self.denylist: Set[str] = set()

        # In-memory tracking
        # ip -> list of unix timestamps
        self.requests: Dict[str, List[float]] = defaultdict(list)
        # ip -> unix timestamp until which IP is blocked
        self.blocks: Dict[str, float] = {}
        # ip -> count of times blocked (for escalation)
        self.offense_count: Dict[str, int] = defaultdict(int)

    def add_to_allowlist(self, ip: str) -> None:
        self.allowlist.add(ip)

    def remove_from_allowlist(self, ip: str) -> None:
        self.allowlist.discard(ip)

    def add_to_denylist(self, ip: str) -> None:
        self.denylist.add(ip)

    def remove_from_denylist(self, ip: str) -> None:
        self.denylist.discard(ip)

    def evaluate(self, ip: str, path: str) -> LimiterDecision:
        now = datetime.now(timezone.utc).timestamp()
        window_label = f"{self.window_seconds}s"

        # Check allowlist
        if ip in self.allowlist:
            return LimiterDecision(
                allowed=True,
                status_code=200,
                escalation="allowlist",
                count=0,
                limit=self.max_requests,
                window=window_label,
                message="Allowlisted client"
            )

        # Check denylist
        if ip in self.denylist:
            return LimiterDecision(
                allowed=False,
                status_code=403,
                retry_after=self.extended_block_seconds,
                escalation="denylist",
                count=self.max_requests,
                limit=self.max_requests,
                window=window_label,
                message="Access denied: IP in security denylist"
            )

        # Check active blocks
        blocked_until = self.blocks.get(ip, 0.0)
        if now < blocked_until:
            remaining = int(blocked_until - now) + 1
            offenses = self.offense_count[ip]
            escalation_stage = "extended_block" if offenses >= self.repeat_offender_threshold else "temp_block"
            return LimiterDecision(
                allowed=False,
                status_code=429,
                retry_after=remaining,
                escalation=escalation_stage,
                count=len(self.requests[ip]),
                limit=self.max_requests,
                window=window_label,
                message=f"Rate limit exceeded. Escalated to {escalation_stage}."
            )

        # Prune older timestamps for sliding window
        cutoff = now - self.window_seconds
        timestamps = [ts for ts in self.requests[ip] if ts >= cutoff]
        timestamps.append(now)
        self.requests[ip] = timestamps
        count = len(timestamps)

        # Check if limit exceeded
        if count > self.max_requests:
            self.offense_count[ip] += 1
            offenses = self.offense_count[ip]

            if offenses >= self.repeat_offender_threshold:
                # Escalation: Extended block
                block_duration = self.extended_block_seconds
                escalation_stage = "extended_block"
            else:
                # Escalation: Temporary block
                block_duration = self.temp_block_seconds
                escalation_stage = "temp_block"

            self.blocks[ip] = now + block_duration

            return LimiterDecision(
                allowed=False,
                status_code=429,
                retry_after=block_duration,
                escalation=escalation_stage,
                count=count,
                limit=self.max_requests,
                window=window_label,
                message=f"Rate limit exceeded: {count}/{self.max_requests} requests. Blocking for {block_duration}s."
            )

        # Warning zone
        if count >= self.warn_threshold:
            return LimiterDecision(
                allowed=True,
                status_code=200,
                escalation="warn",
                count=count,
                limit=self.max_requests,
                window=window_label,
                message=f"Warning: {count}/{self.max_requests} requests in {window_label} window."
            )

        # Normal traffic
        return LimiterDecision(
            allowed=True,
            status_code=200,
            escalation="normal",
            count=count,
            limit=self.max_requests,
            window=window_label,
            message="OK"
        )

    def reset(self) -> None:
        """Clear all state (for tests)."""
        self.requests.clear()
        self.blocks.clear()
        self.offense_count.clear()
        self.allowlist.clear()
        self.denylist.clear()

