"""
Prohori AI - Opt-in API Key Authentication
"""
import logging
import os

from fastapi import Header, HTTPException, status

logger = logging.getLogger("prohori.auth")


def get_configured_api_key() -> str | None:
    """Retrieve PROHORI_API_KEY from environment."""
    key = os.getenv("PROHORI_API_KEY")
    return key.strip() if key and key.strip() else None


async def verify_api_key(
    x_api_key: str | None = Header(default=None, alias="X-API-Key")
) -> None:
    """
    Opt-in API-key authentication for sensitive write endpoints.
    - If PROHORI_API_KEY is NOT set: auth is disabled (local demo mode).
    - If PROHORI_API_KEY IS set: incoming request MUST supply matching X-API-Key.
    """
    configured_key = get_configured_api_key()
    if not configured_key:
        return

    if not x_api_key or x_api_key != configured_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header. Access denied.",
            headers={"WWW-Authenticate": "ApiKey"}
        )
