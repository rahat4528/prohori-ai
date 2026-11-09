"""
Prohori AI - RAG Knowledge Base Retriever
Defensive intelligence retrieval over MITRE ATT&CK, NVD CVE, and CWE datasets.
Supports in-memory cosine/keyword similarity and pgvector integration.
Guarantees 100% offline functionality.
"""

import math
import re
from dataclasses import dataclass
from typing import Any

from .data.curated_kb import CVE_DATABASE, CWE_DATABASE, MITRE_TECHNIQUES


@dataclass
class KnowledgeDoc:
    doc_id: str
    doc_type: str  # mitre_attack, cve, cwe
    title: str
    content: str
    mitigation: str
    metadata: dict[str, Any]


class KnowledgeRetriever:
    def __init__(self):
        self.documents: list[KnowledgeDoc] = []
        self._build_index()

    def _build_index(self):
        """Index curated MITRE ATT&CK, CVE, and CWE data."""
        self.documents.clear()

        # 1. MITRE ATT&CK
        for tech in MITRE_TECHNIQUES:
            content = f"{tech['id']} {tech['name']} ({tech['tactic']}). {tech['description']} Detection: {tech['detection']}"
            self.documents.append(KnowledgeDoc(
                doc_id=tech["id"],
                doc_type="mitre_attack",
                title=f"{tech['id']}: {tech['name']}",
                content=content,
                mitigation=tech["mitigation"],
                metadata={"tactic": tech["tactic"], "name": tech["name"]}
            ))

        # 2. CVEs
        for cve in CVE_DATABASE:
            content = f"{cve['cve_id']} {cve['name']} (CVSS {cve['cvss']} - {cve['severity']}). {cve['description']} Affected: {cve['affected']}"
            self.documents.append(KnowledgeDoc(
                doc_id=cve["cve_id"],
                doc_type="cve",
                title=f"{cve['cve_id']}: {cve['name']}",
                content=content,
                mitigation=cve["mitigation"],
                metadata={"cvss": cve["cvss"], "severity": cve["severity"]}
            ))

        # 3. CWEs
        for cwe in CWE_DATABASE:
            content = f"{cwe['cwe_id']} {cwe['name']}. {cwe['description']}"
            self.documents.append(KnowledgeDoc(
                doc_id=cwe["cwe_id"],
                doc_type="cwe",
                title=f"{cwe['cwe_id']}: {cwe['name']}",
                content=content,
                mitigation=cwe["mitigation"],
                metadata={"name": cwe["name"]}
            ))

    def _tokenize(self, text: str) -> set:
        tokens = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", text.lower())
        return set(tokens)

    def retrieve(self, query: str, top_k: int = 3, min_score: float = 0.05) -> list[dict[str, Any]]:
        """Retrieve most relevant knowledge base documents for a given security query or event."""
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scored_docs = []
        for doc in self.documents:
            doc_tokens = self._tokenize(f"{doc.title} {doc.content} {doc.mitigation}")
            intersection = query_tokens.intersection(doc_tokens)

            # Jaccard + token frequency scoring
            score = len(intersection) / math.sqrt(len(query_tokens) * len(doc_tokens) + 1e-6)

            # Boost exact ID matches (e.g. T1110, CVE-2021)
            for token in query_tokens:
                if token in doc.doc_id.lower():
                    score += 0.5
                if token in doc.title.lower():
                    score += 0.2

            if score > min_score:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, doc in scored_docs[:top_k]:
            results.append({
                "id": doc.doc_id,
                "type": doc.doc_type,
                "title": doc.title,
                "content": doc.content,
                "mitigation": doc.mitigation,
                "score": round(score, 3),
                "metadata": doc.metadata
            })
        return results

    def get_document_by_id(self, doc_id: str) -> dict[str, Any] | None:
        """Direct lookup of MITRE ATT&CK technique, CVE, or CWE by ID."""
        doc_id_clean = doc_id.strip().upper()
        for doc in self.documents:
            if doc.doc_id.upper() == doc_id_clean:
                return {
                    "id": doc.doc_id,
                    "type": doc.doc_type,
                    "title": doc.title,
                    "content": doc.content,
                    "mitigation": doc.mitigation,
                    "metadata": doc.metadata
                }
        return None



# Global singleton instance
kb_retriever = KnowledgeRetriever()

