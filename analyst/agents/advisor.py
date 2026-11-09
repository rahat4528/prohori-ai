"""
Prohori AI - Response Advisor Agent
Produces targeted, actionable defensive countermeasures flagged for Human-in-the-Loop (HITL) approval.
NEVER executes any action automatically.
"""

from typing import Any
from uuid import uuid4


class ResponseAdvisor:
    def recommend_actions(self, event_or_incident: dict[str, Any]) -> list[dict[str, Any]]:
        """Generate recommended defensive countermeasures requiring operator sign-off."""
        details = event_or_incident.get("details", {})
        source_ip = details.get("source_ip") or event_or_incident.get("source_ip")
        severity = event_or_incident.get("severity", "medium")
        event_type = event_or_incident.get("type", "")

        recommendations = []

        # 1. Edge Firewall Block
        if source_ip and severity in ("high", "critical", "medium"):
            recommendations.append({
                "action_id": f"ACT-{uuid4().hex[:8]}",
                "action_type": "FIREWALL_BLOCK_IP",
                "target": source_ip,
                "description_en": f"Block inbound traffic from adversary IP {source_ip} at edge firewall.",
                "description_bn": f"প্রবেশপথে বহিঃস্থ ফায়ারওয়ালে আইপি {source_ip} থেকে আসা সকল ট্রাফিক স্থায়ীভাবে ব্লক করুন।",
                "risk_level": "LOW",
                "status": "PENDING_APPROVAL",
                "requires_human_approval": True
            })

        # 2. Rate Limit Enforcement
        if "flood" in event_type or "blocked_request" in event_type or "brute" in event_type:
            recommendations.append({
                "action_id": f"ACT-{uuid4().hex[:8]}",
                "action_type": "THROTTLE_RATE_LIMIT",
                "target": source_ip or "API_PERIMETER",
                "description_en": "Enforce sliding-window rate limit: max 10 requests / 60 seconds.",
                "description_bn": "স্লাইডিং-উইন্ডো রেট লিমিট প্রয়োগ করুন: সর্বোচ্চ ১০টি অনুরোধ / ৬০ সেকেন্ড।",
                "risk_level": "LOW",
                "status": "PENDING_APPROVAL",
                "requires_human_approval": True
            })

        # 3. Honeypot Deception Surface Rotation
        if "honeypot" in str(event_or_incident.get("source", "")) or "login" in event_type:
            recommendations.append({
                "action_id": f"ACT-{uuid4().hex[:8]}",
                "action_type": "ROTATE_DECEPTION_DECOY",
                "target": "HONEYPOT_CLUSTER",
                "description_en": "Rotate decoy login surface URL and update synthetic credential traps.",
                "description_bn": "ডিকয় লগইন সারফেসের পথ পরিবর্তন করুন এবং কৃত্রিম ট্র্যাপ আপডেট করুন।",
                "risk_level": "INFO",
                "status": "PENDING_APPROVAL",
                "requires_human_approval": True
            })

        return recommendations


response_advisor = ResponseAdvisor()

