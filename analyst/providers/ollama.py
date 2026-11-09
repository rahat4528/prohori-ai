"""
Local Ollama LLM Provider (Data-Sovereignty & Offline Mode)
Telemetry never leaves the local machine.
"""

import logging

import httpx

from .base import LLMProvider

logger = logging.getLogger("prohori.llm.ollama")


class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2"):
        self.base_url = base_url.rstrip("/")
        self.model = model

    @property
    def provider_name(self) -> str:
        return f"ollama-local ({self.model})"

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.2
            }
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Ollama returned {resp.status_code}: {resp.text}")
            data = resp.json()
            return data.get("response", "")

