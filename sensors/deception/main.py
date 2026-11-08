"""
Prohori AI - Deception Sensor (Simulated Honeypot)
DEFENSIVE SCOPE NOTICE:
This sensor is purely simulated for our own lab environment.
It NEVER executes real commands, NEVER touches host storage/networking,
and NEVER integrates with real credentials or systems.
All actions are static simulations designed to attract and record attacker telemetry.
"""

import asyncio
from datetime import datetime, timezone
import logging
from typing import Optional

from fastapi import FastAPI, Request, Form, status
from fastapi.responses import HTMLResponse, JSONResponse
import httpx

from .config import deception_settings
from .tracker import InteractionTracker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [DECEPTION] %(message)s")
logger = logging.getLogger("prohori.deception")

app = FastAPI(
    title="Prohori Deception Sensor (Simulated Decoy)",
    description="Simulated decoy surface for authorized defensive telemetry",
    version="0.1.0"
)

tracker = InteractionTracker(
    window_seconds=deception_settings.BRUTE_FORCE_WINDOW_SEC,
    threshold=deception_settings.BRUTE_FORCE_THRESHOLD
)

HTML_LOGIN_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Prohori Internal Portal (Lab Gateway)</title>
  <style>
    body { background-color: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 32px; width: 340px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
    h2 { color: #58a6ff; font-size: 20px; margin-top: 0; text-align: center; }
    .notice { font-size: 11px; color: #8b949e; text-align: center; margin-bottom: 20px; }
    label { font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px; }
    input[type="text"], input[type="password"] { width: 100%; box-sizing: border-box; padding: 8px 12px; margin-bottom: 16px; background: #0d1117; border: 1px solid #30363d; color: #fff; border-radius: 6px; }
    button { width: 100%; padding: 10px; background: #238636; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    button:hover { background: #2ea043; }
    .footer { font-size: 10px; color: #484f58; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Secure Administration Portal</h2>
    <div class="notice">Authorized Access Only &bull; Node: DIU-LAB-PROHORI-01</div>
    <form action="/login" method="POST">
      <label for="username">Username / Email</label>
      <input type="text" id="username" name="username" placeholder="admin" required autofocus>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required>
      <button type="submit">Sign In</button>
    </form>
    <div class="footer">Protected by Prohori Sentinel AI Deception Fabric</div>
  </div>
</body>
</html>
"""


async def emit_security_event(event_payload: dict):
    """Safely forward detected interaction to the Event API."""
    url = f"{deception_settings.EVENT_API_URL}/events"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(url, json=event_payload)
            if resp.status_code in (200, 201):
                logger.info(f"Emitted event to API: {event_payload.get('type')} ({event_payload.get('severity')})")
            else:
                logger.warning(f"Failed to emit event. API returned {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.warning(f"Could not reach Event API at {url}: {e}")


def get_client_ip(request: Request) -> str:
    """Extract client IP, taking X-Forwarded-For into account."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@app.get("/", response_class=HTMLResponse)
@app.get("/login", response_class=HTMLResponse)
async def login_surface():
    """Present fake decoy login interface."""
    return HTMLResponse(content=HTML_LOGIN_PAGE, status_code=200)


@app.post("/login")
@app.post("/wp-login.php")
@app.post("/api/v1/auth")
@app.post("/api/login")
async def simulated_login_attempt(
    request: Request,
    username: Optional[str] = Form(None),
    password: Optional[str] = Form(None)
):
    """Simulated login handler.

    Accepts any credentials, introduces realistic hesitation, logs telemetry,
    and returns a simulated static rejection.
    NEVER authenticates or executes commands.
    """
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "Unknown")
    path = request.url.path

    # If payload is JSON rather than form-data:
    if not username and not password:
        try:
            body = await request.json()
            username = body.get("username") or body.get("user") or body.get("email")
            password = body.get("password") or body.get("pass")
        except Exception:
            pass

    username = username or "<unspecified>"
    password = password or "<unspecified>"

    # Track attempts from this IP to detect brute-force patterns
    attempt_count, is_brute_force = tracker.record_attempt(client_ip)

    event_type = "brute_force_suspected" if is_brute_force else "login_attempt"
    severity = "high" if is_brute_force else "medium"

    event_payload = {
        "source": "honeypot",
        "severity": severity,
        "type": event_type,
        "details": {
            "source_ip": client_ip,
            "username_tried": username,
            "password_tried": password,
            "user_agent": user_agent,
            "target_path": path,
            "attempts_in_window": attempt_count,
            "window_seconds": deception_settings.BRUTE_FORCE_WINDOW_SEC,
            "simulated_surface": "fake_admin_login",
            "ts": datetime.now(timezone.utc).isoformat()
        }
    }

    # Simulate realistic authentication processing time
    await asyncio.sleep(deception_settings.SIMULATED_DELAY_SEC)

    # Emit telemetry asynchronously
    asyncio.create_task(emit_security_event(event_payload))

    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "status": "error",
            "message": "Invalid credentials or unauthorized terminal.",
            "error_code": "AUTH_FAILED_ERR_9104"
        }
    )


@app.get("/admin")
@app.get("/.env")
@app.get("/phpmyadmin")
@app.get("/actuator/health")
@app.get("/backup.sql")
async def simulated_recon_trap(request: Request):
    """Simulated trap endpoint for reconnaissance scanners."""
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "Unknown")
    path = request.url.path

    event_payload = {
        "source": "honeypot",
        "severity": "low",
        "type": "recon_probe",
        "details": {
            "source_ip": client_ip,
            "target_path": path,
            "user_agent": user_agent,
            "simulated_surface": "decoy_path_trap",
            "ts": datetime.now(timezone.utc).isoformat()
        }
    }

    asyncio.create_task(emit_security_event(event_payload))

    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Resource not found"}
    )


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "sensor": "deception", "mode": "simulated_isolated"}

