"""
Prohori AI - LLM Provider Factory
"""

import os
from .base import LLMProvider
from .gemini import GeminiProvider
from .groq import GroqProvider
from .ollama import OllamaProvider
from .offline import DeterministicOfflineProvider


def get_llm_provider() -> LLMProvider:
    """Instantiate configured LLM provider according to environment variables."""
    choice = os.getenv("LLM_PROVIDER", "auto").lower()

    if choice == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        model = os.getenv("OLLAMA_MODEL", "llama3.2")
        return OllamaProvider(base_url=base_url, model=model)

    if choice == "groq" or (choice == "auto" and os.getenv("GROQ_API_KEY")):
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
            return GroqProvider(api_key=api_key, model=model)

    if choice == "gemini" or (choice == "auto" and os.getenv("GEMINI_API_KEY")):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            return GeminiProvider(api_key=api_key, model=model)

    if choice == "offline":
        return DeterministicOfflineProvider()

    # Default fallback to deterministic offline RAG engine
    return DeterministicOfflineProvider()


__all__ = [
    "LLMProvider",
    "GeminiProvider",
    "GroqProvider",
    "OllamaProvider",
    "DeterministicOfflineProvider",
    "get_llm_provider"
]

