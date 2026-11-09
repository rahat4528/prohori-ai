"""
Groq Cloud LLM Provider (Free Tier OpenAI-compatible endpoint)
"""

import logging

import httpx

from .base import LLMProvider

logger = logging.getLogger("prohori.llm.groq")


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.api_key = api_key
        self.model = model
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"

    @property
    def provider_name(self) -> str:
        return f"groq ({self.model})"

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 1024
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(self.endpoint, headers=headers, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Groq API returned {resp.status_code}: {resp.text}")
            data = resp.json()
            return data["choices"][0]["message"]["content"]

