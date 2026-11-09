"""
Prohori AI - API Abuse Guard (Rate Limiter Sensor)
Protects API surfaces with sliding-window limiting, progressive escalation, and event emission.
"""
from .limiter import LimiterDecision, SlidingWindowRateLimiter
from .middleware import RateLimitMiddleware

__all__ = ["LimiterDecision", "RateLimitMiddleware", "SlidingWindowRateLimiter"]

