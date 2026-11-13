"""
Prohori AI - "Ask the Analyst" Natural Language Reasoning Engine
Handles free-text operator questions with grounded, cited bilingual responses.
"""

import json
import logging
import re
from typing import Any

from analyst.providers import LLMProvider, get_llm_provider
from analyst.providers.offline import DeterministicOfflineProvider
from analyst.redaction import redact_string
from knowledge.retriever import kb_retriever

logger = logging.getLogger("prohori.analyst.ask")


def is_bangla_text(text: str) -> bool:
    """Check if string contains Bengali script characters."""
    return bool(re.search(r"[\u0980-\u09FF]", text))


class AnalystAssistant:
    def __init__(self, provider: LLMProvider | None = None):
        self.provider = provider or get_llm_provider()

    async def answer_question(
        self,
        question: str,
        recent_events: list[dict[str, Any]],
        language_override: str | None = None,
        event_context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Answer free-text security question grounded in target event, telemetry, and MITRE/CVE knowledge."""
        # Scrub question of potential PII
        clean_question = redact_string(question)

        # Determine target language
        target_lang = language_override or ("bn" if is_bangla_text(clean_question) else "en")

        # Prioritize target event context
        target_event = event_context or (recent_events[0] if recent_events else {})
        event_type = target_event.get("type", "unknown")
        details = target_event.get("details", {})
        query_terms = f"{clean_question} {event_type} {json.dumps(details)}"

        # Retrieve matching knowledge items
        retrieved_docs = kb_retriever.retrieve(query_terms, top_k=3)
        citations = [doc["id"] for doc in retrieved_docs]

        # Ensure event's known MITRE citation is in citations list if available
        event_analyst = target_event.get("analyst", {}) or {}
        event_mitre = event_analyst.get("mitre_technique")
        if event_mitre and event_mitre not in citations:
            citations.insert(0, event_mitre)

        # Format referenced event IDs
        referenced_event_ids = []
        if target_event.get("id"):
            referenced_event_ids.append(str(target_event["id"]))
        for ev in recent_events[:4]:
            ev_id = str(ev.get("id", ""))
            if ev_id and ev_id not in referenced_event_ids:
                referenced_event_ids.append(ev_id)

        active_provider = self.provider.provider_name
        active_model = getattr(self.provider, "model", "deterministic-rules-stix2.1")

        # Fast path & fallback: Deterministic Offline RAG engine
        if isinstance(self.provider, DeterministicOfflineProvider):
            answer_text, cited_ids = self.provider.generate_answer(
                question=clean_question,
                event_context=target_event,
                recent_events=recent_events,
                target_lang=target_lang,
                retrieved_docs=retrieved_docs
            )
            for cid in cited_ids:
                if cid not in citations:
                    citations.append(cid)
            return {
                "question": clean_question,
                "answer": answer_text,
                "language": target_lang,
                "citations": citations,
                "referenced_event_ids": referenced_event_ids,
                "provider": active_provider,
                "model": active_model
            }

        # Otherwise, query configured external LLM (Ollama, Gemini, Groq)
        kb_context = "\n".join([
            f"- [{d['id']}] {d['title']}: {d['content']}. Mitigation: {d['mitigation']}"
            for d in retrieved_docs
        ])

        target_context = (
            f"TARGET SECURITY EVENT UNDER INVESTIGATION:\n"
            f"- Source: {target_event.get('source')}\n"
            f"- Type: {target_event.get('type')}\n"
            f"- Severity: {target_event.get('severity')}\n"
            f"- Details: {json.dumps(details, indent=2)}\n"
        )

        lang_instruction = (
            "Provide your complete response in fluent, natural-sounding BANGLA (বাংলা) for Bangladeshi security officers."
            if target_lang == "bn"
            else "Provide your complete response in clear, concise ENGLISH."
        )

        prompt = f"""
{target_context}

GROUNDED KNOWLEDGE BASE CONTEXT (MITRE ATT&CK & CVEs):
{kb_context}

QUESTION FROM SECURITY OPERATOR / JUDGE:
"{clean_question}"

OPERATOR INSTRUCTION:
{lang_instruction}

Provide a direct, authoritative, and helpful answer answering the operator's specific question.
Cite relevant MITRE ATT&CK techniques (e.g. [T1110.001], [T1499.002]) or CVEs.
"""

        system_prompt = (
            "You are Prohori Sentinel's AI SOC Analyst. "
            "You explain cyber threats concisely, accurately, and with exact citations. "
            f"Respond strictly in {'Bangla (বাংলা)' if target_lang == 'bn' else 'English'}."
        )

        try:
            answer_text = await self.provider.generate(prompt, system_prompt=system_prompt)
        except Exception as e:
            logger.warning(f"Error generating answer with LLM ({e}), falling back to deterministic RAG engine.")
            offline_prov = DeterministicOfflineProvider()
            answer_text, cited_ids = offline_prov.generate_answer(
                question=clean_question,
                event_context=target_event,
                recent_events=recent_events,
                target_lang=target_lang,
                retrieved_docs=retrieved_docs
            )
            for cid in cited_ids:
                if cid not in citations:
                    citations.append(cid)
            active_provider = "deterministic-offline-rag (fallback)"
            active_model = "deterministic-rules-stix2.1"

        return {
            "question": clean_question,
            "answer": answer_text,
            "language": target_lang,
            "citations": citations,
            "referenced_event_ids": referenced_event_ids,
            "provider": active_provider,
            "model": active_model
        }


analyst_assistant = AnalystAssistant()
