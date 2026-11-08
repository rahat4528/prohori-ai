"""
Prohori AI - Correlation Agent
Links individual sensor events sharing common source IPs or campaign markers into high-level Incidents.
Generates attack chain progression timelines and bilingual incident summaries.
"""

from collections import defaultdict
from datetime import datetime, timezone
import logging
from typing import List, Dict, Any
from uuid import uuid4

logger = logging.getLogger("prohori.analyst.correlation")


class Incident:
    def __init__(self, incident_id: str, source_ip: str, events: List[Dict[str, Any]]):
        self.incident_id = incident_id
        self.source_ip = source_ip
        self.events = sorted(events, key=lambda e: e.get("ts", ""))
        self.severity = self._compute_severity()
        self.summary_en, self.summary_bn = self._generate_bilingual_summary()

    def _compute_severity(self) -> str:
        severities = [e.get("severity", "info") for e in self.events]
        if "critical" in severities or len(self.events) >= 5:
            return "critical"
        if "high" in severities or len(self.events) >= 3:
            return "high"
        if "medium" in severities:
            return "medium"
        return "low"

    def _generate_bilingual_summary(self) -> tuple[str, str]:
        event_types = set(e.get("type") for e in self.events)
        stages = []
        if any("recon" in t for t in event_types):
            stages.append("Reconnaissance (অনুসন্ধান)")
        if any("login" in t or "brute" in t for t in event_types):
            stages.append("Credential Access (অননুমোদিত প্রবেশ চেষ্টা)")
        if any("blocked" in t or "flood" in t for t in event_types):
            stages.append("Denial of Service (সার্ভিস অচল করার চেষ্টা)")

        stage_str = " ➔ ".join(stages) if stages else "Defensive Activity"

        summary_en = (
            f"Multi-stage attack campaign detected from IP {self.source_ip} comprising {len(self.events)} correlated events. "
            f"Observed kill chain: {stage_str}. Recommended action: Immediate perimeter block."
        )
        summary_bn = (
            f"আইপি {self.source_ip} থেকে {len(self.events)} টি সমন্বিত ঘটনার সমন্বয়ে একটি বহুমুখী সাইবার আক্রমণ শনাক্ত করা হয়েছে। "
            f"আক্রমণের ধাপসমূহ: {stage_str}। অবিলম্বে পেরিমিটার ফায়ারওয়ালে আইপি ব্লক করার সুপারিশ করা হচ্ছে।"
        )
        return summary_en, summary_bn

    def to_dict(self) -> Dict[str, Any]:
        return {
            "incident_id": self.incident_id,
            "source_ip": self.source_ip,
            "severity": self.severity,
            "event_count": len(self.events),
            "events": self.events,
            "summary_en": self.summary_en,
            "summary_bn": self.summary_bn,
            "first_seen": self.events[0].get("ts") if self.events else None,
            "last_seen": self.events[-1].get("ts") if self.events else None
        }


class CorrelationAgent:
    def correlate_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Correlate a list of events into structured security incidents."""
        # Group by source_ip found in event details
        ip_groups = defaultdict(list)

        for event in events:
            details = event.get("details", {})
            ip = details.get("source_ip")
            if not ip:
                ip = details.get("target_host", "internal_lab")
            ip_groups[ip].append(event)

        incidents = []
        for idx, (ip, group_events) in enumerate(ip_groups.items(), 1):
            # Form an incident if there are multiple events or high/critical event
            has_urgent = any(e.get("severity") in ("high", "critical") for e in group_events)
            if len(group_events) >= 2 or has_urgent:
                inc_id = f"INC-2026-{idx:04d}"
                inc = Incident(inc_id, ip, group_events)
                incidents.append(inc.to_dict())

        # Sort incidents highest severity first
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        incidents.sort(key=lambda x: severity_order.get(x["severity"], 5))
        return incidents


correlation_agent = CorrelationAgent()

