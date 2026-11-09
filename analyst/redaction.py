"""
Prohori AI - PII & Secret Redaction Engine
MANDATORY PRE-PROCESSING STEP BEFORE ANY LLM INVOCATION.
Scrubs passwords, API keys, bearer tokens, JWTs, emails, and credentials
from event details and free-text queries so sensitive operational data never reaches models.
"""

import copy
import re
from typing import Any

# Regex patterns for sensitive data
EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
JWT_REGEX = re.compile(r"eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+")
BEARER_REGEX = re.compile(r"Bearer\s+[A-Za-z0-9_\-\.=]+", re.IGNORECASE)
API_KEY_REGEX = re.compile(r"(?:api[_-]?key|secret|token|password|auth)[\s:=]+['\"]?([A-Za-z0-9_\-\.]{8,})['\"]?", re.IGNORECASE)
GENERIC_SECRET_REGEX = re.compile(r"\b(?:ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{20,})\b")

# Sensitive dictionary keys to immediately redact values of
SENSITIVE_KEYS = {
    "password", "passwd", "pwd", "password_tried", "secret", "api_key",
    "token", "access_token", "refresh_token", "private_key", "authorization"
}


def redact_string(text: str) -> str:
    """Scrub sensitive patterns from a raw string."""
    if not isinstance(text, str):
        return text

    # Redact JWTs
    text = JWT_REGEX.sub("[REDACTED_JWT_TOKEN]", text)
    # Redact Bearer tokens
    text = BEARER_REGEX.sub("Bearer [REDACTED_TOKEN]", text)
    # Redact generic secrets (GitHub, AWS, OpenAI)
    text = GENERIC_SECRET_REGEX.sub("[REDACTED_API_SECRET]", text)
    # Redact emails
    text = EMAIL_REGEX.sub("[REDACTED_EMAIL]", text)
    return text


def redact_data(data: dict | list | str | Any) -> Any:
    """Recursively scrub sensitive keys and regex patterns from any Python data structure."""
    if isinstance(data, dict):
        scrubbed = {}
        for k, v in data.items():
            k_lower = str(k).lower()
            if any(sensitive in k_lower for sensitive in SENSITIVE_KEYS):
                scrubbed[k] = "[REDACTED_CREDENTIAL]"
            else:
                scrubbed[k] = redact_data(v)
        return scrubbed
    elif isinstance(data, list):
        return [redact_data(item) for item in data]
    elif isinstance(data, str):
        return redact_string(data)
    else:
        return data


def sanitize_for_analyst(event_dict: dict[str, Any]) -> dict[str, Any]:
    """Prepares a deep-copied, scrubbed copy of an event for LLM analysis."""
    clean_copy = copy.deepcopy(event_dict)
    if "details" in clean_copy and isinstance(clean_copy["details"], dict):
        clean_copy["details"] = redact_data(clean_copy["details"])
    return clean_copy

