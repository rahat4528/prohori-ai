"""
In-memory interaction and frequency tracker for Deception Sensor.
Maintains sliding-window counts per IP to tag brute-force patterns.
"""

from collections import defaultdict
from datetime import UTC, datetime


class InteractionTracker:
    def __init__(self, window_seconds: int = 60, threshold: int = 3):
        self.window_seconds = window_seconds
        self.threshold = threshold
        # ip -> list of timestamps
        self.history: dict[str, list[datetime]] = defaultdict(list)

    def record_attempt(self, ip: str) -> tuple[int, bool]:
        """Record an attempt from IP.

        Returns (count_in_window, is_brute_force_suspected).
        """
        now = datetime.now(UTC)
        timestamps = self.history[ip]

        # Prune older than window_seconds
        cutoff = now.timestamp() - self.window_seconds
        timestamps = [ts for ts in timestamps if ts.timestamp() >= cutoff]
        timestamps.append(now)
        self.history[ip] = timestamps

        count = len(timestamps)
        is_brute = count >= self.threshold
        return count, is_brute

    def reset(self):
        """Reset history (useful for tests)."""
        self.history.clear()

