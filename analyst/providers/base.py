"""
Prohori AI - LLM Provider Base Interface
Defines the standard asynchronous contract for all LLM backends (Gemini, Groq, Ollama, Offline).
"""

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        """Asynchronously generate a response from the model given a user prompt and optional system prompt."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the provider (e.g. 'gemini', 'groq', 'ollama', 'offline')."""

