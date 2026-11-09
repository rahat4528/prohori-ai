"""
Prohori AI - CVE Matching & Enrichment Engine
Correlates identified service banners and port findings against cached CVE database.
Operates 100% offline using local NVD/CVE intelligence.
"""

from typing import Any

from knowledge.data.curated_kb import CVE_DATABASE


class CVEMatcher:
    def __init__(self, cve_db: list[dict[str, Any]] = None):
        self.cve_db = cve_db or CVE_DATABASE

    def match_banner(self, banner: str, service: str = "", port: int = 0) -> list[dict[str, Any]]:
        """Identify matching CVE records for a discovered banner or service."""
        matches = []
        text_to_check = f"{banner} {service} port_{port}".lower()

        for cve in self.cve_db:
            cve_keywords = [
                cve["cve_id"].lower(),
                cve["name"].lower()
            ]

            # Common software keywords
            if "log4j" in cve["name"].lower() and "log4j" in text_to_check:
                matches.append(self._format_match(cve, banner))
                continue
            if "ssh" in cve["name"].lower() and "ssh" in text_to_check:
                # Check for older version pattern
                if any(v in text_to_check for v in ["7.", "8.", "9.0", "9.1", "9.2", "9.3", "9.4", "9.5"]):
                    matches.append(self._format_match(cve, banner))
                    continue
            if "spring" in cve["name"].lower() and "spring" in text_to_check:
                matches.append(self._format_match(cve, banner))
                continue
            if "exchange" in cve["name"].lower() and "exchange" in text_to_check:
                matches.append(self._format_match(cve, banner))
                continue

            # Direct keyword or ID match
            for kw in cve_keywords:
                if kw in text_to_check:
                    matches.append(self._format_match(cve, banner))
                    break

        return matches

    def _format_match(self, cve: dict[str, Any], banner: str) -> dict[str, Any]:
        cvss = cve.get("cvss", 5.0)
        if cvss >= 9.0:
            severity = "critical"
        elif cvss >= 7.0:
            severity = "high"
        elif cvss >= 4.0:
            severity = "medium"
        else:
            severity = "low"

        return {
            "cve_id": cve["cve_id"],
            "name": cve["name"],
            "cvss": cvss,
            "severity": severity,
            "description": cve["description"],
            "mitigation": cve["mitigation"],
            "matched_banner": banner
        }


cve_matcher = CVEMatcher()

