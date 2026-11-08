"""
FastAPI / Starlette Middleware for API Abuse Guard.
Emits security events to the Prohori Event API whenever a client is rate-limited or blocked.
"""

import asyncio
from datetime import datetime, timezone
import json
import logging
from typing import Optional, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
import httpx

from .limiter import SlidingWindowRateLimiter, LimiterDecision

logger = logging.getLogger("prohori.ratelimiter")


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        limiter: Optional[SlidingWindowRateLimiter] = None,
        event_api_url: str = "http://localhost:8000",
        event_callback: Optional[Callable[[dict], None]] = None,
        exempt_paths: Optional[list] = None
    ):
        super().__init__(app)
        self.limiter = limiter or SlidingWindowRateLimiter()
        self.event_api_url = event_api_url
        self.event_callback = event_callback
        self.exempt_paths = exempt_paths or ["/healthz", "/docs", "/openapi.json", "/stream"]

    def get_client_ip(self, request: Request) -> str:
        # Check X-Forwarded-For or custom test client header
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        client_header = request.headers.get("x-client-ip")
        if client_header:
            return client_header.strip()
        return request.client.host if request.client else "127.0.0.1"

    async def emit_block_event(self, ip: str, path: str, decision: LimiterDecision):
        """Send blocked_request event to Event API."""
        severity = "high" if decision.escalation in ("extended_block", "denylist") else "medium"
        event_payload = {
            "source": "ratelimiter",
            "severity": severity,
            "type": "blocked_request",
            "details": {
                "source_ip": ip,
                "path": path,
                "window": decision.window,
                "count": decision.count,
                "limit": decision.limit,
                "escalation": decision.escalation,
                "retry_after": decision.retry_after,
                "ts": datetime.now(timezone.utc).isoformat()
            }
        }

        # If a direct callback is registered (e.g. running inside same process), call it
        if self.event_callback:
            try:
                if asyncio.iscoroutinefunction(self.event_callback):
                    await self.event_callback(event_payload)
                else:
                    self.event_callback(event_payload)
                return
            except Exception as e:
                logger.warning(f"Error executing internal event callback: {e}")

        # Otherwise send via HTTP to Event API
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                await client.post(f"{self.event_api_url}/events", json=event_payload)
                logger.info(f"Emitted ratelimiter event for {ip} -> {decision.escalation}")
        except Exception as e:
            logger.warning(f"Could not forward ratelimiter event to {self.event_api_url}: {e}")

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # Bypass exempt paths
        if any(path.startswith(exempt) for exempt in self.exempt_paths):
            return await call_next(request)

        client_ip = self.get_client_ip(request)
        decision = self.limiter.evaluate(client_ip, path)

        if not decision.allowed:
            # Emit telemetry
            asyncio.create_task(self.emit_block_event(client_ip, path, decision))

            headers = {
                "Retry-After": str(decision.retry_after),
                "X-RateLimit-Limit": str(decision.limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Escalation": decision.escalation
            }

            return JSONResponse(
                status_code=decision.status_code,
                content={
                    "error": "rate_limit_exceeded",
                    "message": decision.message,
                    "retry_after_seconds": decision.retry_after,
                    "escalation": decision.escalation
                },
                headers=headers
            )

        # Allowed request
        response = await call_next(request)
        remaining = max(0, decision.limit - decision.count)
        response.headers["X-RateLimit-Limit"] = str(decision.limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Escalation"] = decision.escalation
        return response
