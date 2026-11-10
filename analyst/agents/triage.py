"""
Prohori AI - Triage Agent
Autonomous, grounded security event analysis with dual English & Bangla narratives.
Grounds every claim in MITRE ATT&CK, NVD CVE, or CWE knowledge bases.
"""

import json
import logging
import re
from typing import Any

from analyst.providers import LLMProvider, get_llm_provider
from analyst.redaction import sanitize_for_analyst
from knowledge.retriever import kb_retriever

logger = logging.getLogger("prohori.analyst.triage")

TRIAGE_SYSTEM_PROMPT = """You are the Lead AI SOC Analyst for Prohori AI ("প্রহরী"), an enterprise defensive security operations center.
Your job is to analyze incoming defensive sensor events, reconcile their severity, and produce analyst-grade, explainable incident narratives in English and Bangla.

CRITICAL RULES:
1. EXPLAINABILITY & CITATIONS: You must ground your analysis in the provided MITRE ATT&CK or CVE knowledge items. Always cite the exact ID (e.g., [T1110.001], [CVE-2021-44228], [CWE-307]). If you cannot ground a claim, explicitly state you lack evidence rather than hallucinating.
2. BILINGUAL ACCURACY: Provide both a fluent English narrative and an accurate, natural-sounding Bengali (Bangla) narrative for Bangladeshi operators and leadership.
3. HUMAN-IN-THE-LOOP DEFENSE: Never suggest destructive or autonomous counter-attacks. Only suggest defensive containment (edge blocking, rate-limiting, credential rotation) and flag requires_human_approval=true.
4. OUTPUT FORMAT: Respond ONLY with a valid JSON object matching the requested schema. No conversational filler.
"""


class TriageAgent:
    def __init__(self, provider: LLMProvider | None = None):
        self.provider = provider or get_llm_provider()

    async def triage_event(self, event_data: dict[str, Any]) -> dict[str, Any]:
        """Perform autonomous, grounded triage on an ingested event."""
        # Step 1: Mandatory PII & Secret Redaction
        clean_event = sanitize_for_analyst(event_data)

        # Step 2: Knowledge Base Retrieval (RAG)
        query = f"{clean_event.get('source')} {clean_event.get('type')} {json.dumps(clean_event.get('details', {}))}"
        retrieved_docs = kb_retriever.retrieve(query, top_k=3)

        rag_context = "\n".join([
            f"- [{doc['id']}] {doc['title']}: {doc['content']}. Recommended Mitigation: {doc['mitigation']}"
            for doc in retrieved_docs
        ])

        # Step 3: Construct Analyst Prompt
        prompt = f"""
ANALYZE THE FOLLOWING DEFENSIVE SECURITY EVENT:
- Source: {clean_event.get('source')}
- Reported Sensor Severity: {clean_event.get('severity')}
- Event Type: {clean_event.get('type')}
- Scrubbed Telemetry Details: {json.dumps(clean_event.get('details', {}), indent=2)}

GROUNDED KNOWLEDGE BASE CONTEXT (RAG):
{rag_context}

Return a single JSON object with these exact keys:
{{
  "severity": "info" | "low" | "medium" | "high" | "critical",
  "confidence": 0.0 to 1.0,
  "narrative_en": "1-2 concise sentences in English explaining what happened and citing the exact MITRE ATT&CK or CVE ID from context.",
  "narrative_bn": "1-2 concise sentences in fluent Bangla explaining the event clearly to Bangladeshi security staff with citations.",
  "citations": ["T1110.001", "CWE-307"],
  "mitre_technique": "Primary MITRE ID",
  "recommended_action": "Clear, defensive next step requiring human operator approval.",
  "requires_human_approval": true
}}
"""

        # Step 4: Call Model
        try:
            raw_response = await self.provider.generate(prompt, system_prompt=TRIAGE_SYSTEM_PROMPT, format="json")

            # Extract JSON block
            json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
            try:
                if json_match:
                    triage_result = json.loads(json_match.group(0))
                else:
                    triage_result = json.loads(raw_response)
            except json.JSONDecodeError as json_err:
                logger.warning(f"LLM returned invalid JSON ({json_err}). Falling back to deterministic RAG engine.")
                raise ValueError(f"Invalid JSON returned by LLM: {json_err}") from json_err

            # Step 5: Strict Grounding Validation against Knowledge Base
            known_kb_ids = {doc.doc_id for doc in kb_retriever.documents}
            raw_citations = triage_result.get("citations", [])
            valid_citations = []
            for cit in raw_citations:
                clean_cit = str(cit).strip().strip("[]")
                if clean_cit in known_kb_ids:
                    valid_citations.append(clean_cit)
                else:
                    logger.warning(f"Filtered ungrounded citation '{cit}' not found in knowledge base.")

            # If no valid citations remain, fallback to top retrieved RAG document
            if not valid_citations and retrieved_docs:
                valid_citations = [retrieved_docs[0]["id"]]

            triage_result["citations"] = valid_citations

            # Reconcile mitre_technique with knowledge base
            mitre_val = str(triage_result.get("mitre_technique", "")).strip().strip("[]")
            if mitre_val and mitre_val not in known_kb_ids:
                logger.warning(f"Reconciling ungrounded mitre_technique '{mitre_val}' to '{retrieved_docs[0]['id']}'")
                triage_result["mitre_technique"] = retrieved_docs[0]["id"]
            elif not mitre_val and retrieved_docs:
                triage_result["mitre_technique"] = retrieved_docs[0]["id"]

            # Ensure required fields exist
            triage_result.setdefault("requires_human_approval", True)
            triage_result.setdefault("provider", self.provider.provider_name)
            triage_result.setdefault("model", getattr(self.provider, "model", "deterministic-rules-stix2.1"))
            return triage_result

        except Exception as e:
            logger.warning(f"Error calling LLM provider ({e}). Falling back to deterministic RAG engine.")
            from analyst.providers.offline import DeterministicOfflineProvider
            offline_prov = DeterministicOfflineProvider()
            offline_raw = await offline_prov.generate(prompt, system_prompt="json")
            fallback_dict = json.loads(offline_raw)
            fallback_dict["provider"] = "deterministic-offline-rag (fallback)"
            fallback_dict["model"] = "deterministic-rules-stix2.1"
            fallback_dict["fallback_reason"] = f"LLM unavailable or invalid output: {str(e)}"
            return fallback_dict


triage_agent = TriageAgent()

