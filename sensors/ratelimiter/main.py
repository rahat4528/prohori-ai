"""
Prohori AI - Standalone API Abuse Guard Service (Reverse Proxy / Edge Filter)
DEFENSIVE LAB COMPONENT.
Intercepts incoming traffic, enforces sliding-window rate limits and escalation,
and emits security events to the Prohori Event API.
"""

import os
import httpx
from fastapi import FastAPI, Request, Response
from starlette.responses import StreamingResponse

from .limiter import SlidingWindowRateLimiter
from .middleware import RateLimitMiddleware

app = FastAPI(
    title="Prohori API Abuse Guard Service",
    description="Protective defensive edge filter and rate limiter sensor",
    version="0.1.0"
)

UPSTREAM_URL = os.getenv("UPSTREAM_URL", "http://api:8000")
EVENT_API_URL = os.getenv("EVENT_API_URL", "http://api:8000")

# Configure rate limiter: 10 requests per 10s default
limiter = SlidingWindowRateLimiter(
    window_seconds=int(os.getenv("RATE_LIMIT_WINDOW_SEC", "10")),
    max_requests=int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "10")),
    temp_block_seconds=int(os.getenv("TEMP_BLOCK_SEC", "30")),
    extended_block_seconds=int(os.getenv("EXTENDED_BLOCK_SEC", "180"))
)

# Apply abuse guard middleware
app.add_middleware(
    RateLimitMiddleware,
    limiter=limiter,
    event_api_url=EVENT_API_URL,
    exempt_paths=["/healthz", "/guard/status"]
)


@app.get("/guard/status")
async def guard_status():
    return {
        "status": "active",
        "sensor": "ratelimiter",
        "window_seconds": limiter.window_seconds,
        "max_requests": limiter.max_requests,
        "active_blocks": len(limiter.blocks)
    }


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def proxy_pass(request: Request, path: str):
    """Transparently forward allowed requests to upstream target."""
    target_url = f"{UPSTREAM_URL}/{path}"
    headers = dict(request.headers)
    headers.pop("host", None)

    body = await request.body()

    client = httpx.AsyncClient(timeout=10.0)
    try:
        upstream_req = client.build_request(
            method=request.method,
            url=target_url,
            params=request.query_params,
            headers=headers,
            content=body
        )
        upstream_resp = await client.send(upstream_req, stream=True)
        return StreamingResponse(
            upstream_resp.aiter_raw(),
            status_code=upstream_resp.status_code,
            headers=dict(upstream_resp.headers),
            background=client.aclose
        )
    except Exception as e:
        await client.aclose()
        return Response(
            content=f'{{"error": "Upstream connection error", "details": "{str(e)}"}}',
            status_code=502,
            media_type="application/json"
        )

