"""
Google Gemini LLM Provider (Free Tier REST integration)
"""

import logging

import httpx

from .base import LLMProvider

logger = logging.getLogger("prohori.llm.gemini")


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model = model
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    @property
    def provider_name(self) -> str:
        return f"gemini ({self.model})"

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        url = f"{self.endpoint}?key={self.api_key}"

        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"System Guidelines:\n{system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow these security analyst instructions."}]})

        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API returned {resp.status_code}: {resp.text}")
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return "No analysis candidate generated."
            return candidates[0]["content"]["parts"][0]["text"]

