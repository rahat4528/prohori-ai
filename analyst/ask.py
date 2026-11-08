"""
Prohori AI - "Ask the Analyst" Natural Language Reasoning Engine
Handles free-text operator questions with grounded, cited bilingual responses.
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional

from knowledge.retriever import kb_retriever
from analyst.redaction import redact_string
from analyst.providers import get_llm_provider, LLMProvider

logger = logging.getLogger("prohori.analyst.ask")


def is_bangla_text(text: str) -> bool:
    """Check if string contains Bengali script characters."""
    return bool(re.search(r"[\u0980-\u09FF]", text))


class AnalystAssistant:
    def __init__(self, provider: Optional[LLMProvider] = None):
        self.provider = provider or get_llm_provider()

    async def answer_question(
        self,
        question: str,
        recent_events: List[Dict[str, Any]],
        language_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """Answer free-text security question grounded in recent events and MITRE/CVE knowledge."""
        # Scrub question of potential PII
        clean_question = redact_string(question)

        # Determine target language
        target_lang = language_override or ("bn" if is_bangla_text(clean_question) else "en")

        # Retrieve matching knowledge items
        retrieved_docs = kb_retriever.retrieve(clean_question, top_k=3)
        citations = [doc["id"] for doc in retrieved_docs]

        kb_context = "\n".join([
            f"- [{d['id']}] {d['title']}: {d['content']}. Mitigation: {d['mitigation']}"
            for d in retrieved_docs
        ])

        # Format top 5 recent events for context
        event_summaries = []
        referenced_event_ids = []
        for ev in recent_events[:5]:
            referenced_event_ids.append(str(ev.get("id")))
            event_summaries.append(
                f"- [{ev.get('ts')}] Source: {ev.get('source')}, Type: {ev.get('type')}, Severity: {ev.get('severity')}, Details: {ev.get('details')}"
            )
        events_context = "\n".join(event_summaries) if event_summaries else "No recent events recorded."

        lang_instruction = (
            "Provide your complete response in fluent, natural-sounding BANGLA (বাংলা) for Bangladeshi security officers."
            if target_lang == "bn"
            else "Provide your complete response in clear, concise ENGLISH."
        )

        prompt = f"""
QUESTION FROM SECURITY OPERATOR / JUDGE:
"{clean_question}"

OPERATOR INSTRUCTION:
{lang_instruction}

GROUNDED KNOWLEDGE BASE CONTEXT (MITRE ATT&CK & CVEs):
{kb_context}

RECENT TELEMETRY EVENTS IN THE STORE:
{events_context}

Provide a direct, authoritative, and helpful answer.
You MUST cite the relevant MITRE ATT&CK technique (e.g. [T1110.001], [T1499.002]) or CVE if applicable.
Do not hallucinate facts outside the telemetry and knowledge base.
"""

        system_prompt = (
            "You are Prohori Sentinel's AI SOC Analyst. "
            "You explain cyber threats concisely, accurately, and with exact citations. "
            f"Respond strictly in {'Bangla (বাংলা)' if target_lang == 'bn' else 'English'}."
        )

        try:
            answer_text = await self.provider.generate(prompt, system_prompt=system_prompt)
        except Exception as e:
            logger.warning(f"Error generating answer with LLM ({e}), using offline engine.")
            from analyst.providers.offline import DeterministicOfflineProvider
            offline_prov = DeterministicOfflineProvider()
            answer_text = await offline_prov.generate(f"{clean_question} {target_lang}")

        return {
            "question": clean_question,
            "answer": answer_text,
            "language": target_lang,
            "citations": citations,
            "referenced_event_ids": referenced_event_ids,
            "provider": self.provider.provider_name
        }


analyst_assistant = AnalystAssistant()
