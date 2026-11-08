"""
Configuration for Prohori Deception Sensor
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class DeceptionSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "infra/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PORT: int = 8081
    HOST: str = "0.0.0.0"
    EVENT_API_URL: str = os.getenv("EVENT_API_URL", "http://localhost:8000")

    # Honeypot behavior
    SIMULATED_DELAY_SEC: float = 0.5
    BRUTE_FORCE_THRESHOLD: int = 3
    BRUTE_FORCE_WINDOW_SEC: int = 60


deception_settings = DeceptionSettings()

