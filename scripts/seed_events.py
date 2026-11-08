"""
Prohori AI - Event Seeder Script
Emits sample test events for each source and severity to verify the API pipeline.
"""

import sys
import time
import httpx
from datetime import datetime, timezone

API_BASE = "http://localhost:8000"

SAMPLE_EVENTS = [
    {
        "source": "honeypot",
        "severity": "medium",
        "type": "login_attempt",
        "details": {
            "source_ip": "192.168.1.105",
            "username_tried": "admin",
            "password_tried": "admin123",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "target_path": "/wp-login.php",
            "simulated_surface": "deception_web_admin"
        }
    },
    {
        "source": "honeypot",
        "severity": "high",
        "type": "brute_force_suspected",
        "details": {
            "source_ip": "192.168.1.105",
            "attempts_count": 14,
            "time_window_sec": 30,
            "target_service": "simulated_ssh",
            "alert": "Multiple failed credential submissions in burst window"
        }
    },
    {
        "source": "ratelimiter",
        "severity": "medium",
        "type": "blocked_request",
        "details": {
            "source_ip": "203.0.113.42",
            "path": "/api/v1/events",
            "window": "1m",
            "count": 68,
            "limit": 60,
            "action": "temporary_block_60s"
        }
    },
    {
        "source": "scanner",
        "severity": "low",
        "type": "open_port",
        "details": {
            "target_host": "10.0.0.15",
            "port": 8080,
            "protocol": "tcp",
            "state": "open",
            "banner": "Apache/2.4.41 (Ubuntu)",
            "allowlist_verified": True
        }
    },
    {
        "source": "scanner",
        "severity": "info",
        "type": "service_identified",
        "details": {
            "target_host": "10.0.0.15",
            "service": "http",
            "port": 80,
            "headers": {"Server": "nginx/1.18.0"}
        }
    },
    {
        "source": "analyst",
        "severity": "critical",
        "type": "triage_summary",
        "details": {
            "correlated_events": 5,
            "suspected_threat": "T1110.001 - Brute Force Password Guessing",
            "confidence": 0.95
        },
        "analyst": {
            "summary": "Coordinated brute force attempts followed by API flooding detected from 192.168.1.105.",
            "bangla_summary": "১৯২.১৬৮.১.১০৫ থেকে সমন্বিত ব্রুট-ফোর্স পাসওয়ার্ড আক্রমণ এবং এপিআই অতিরিক্ত অনুরোধ শনাক্ত করা হয়েছে। অবিলম্বে আইপি ব্লক করার সুপারিশ করা হচ্ছে।",
            "mitre_technique": "T1110.001",
            "recommended_action": "Block IP 192.168.1.105 at perimeter firewall",
            "requires_human_approval": True
        }
    }
]


def seed():
    print(f"[*] Checking Prohori Event API health at {API_BASE}/healthz ...")
    try:
        health_resp = httpx.get(f"{API_BASE}/healthz", timeout=5.0)
        print(f"[+] Healthz response: {health_resp.status_code} -> {health_resp.json()}")
    except Exception as e:
        print(f"[-] Could not reach API at {API_BASE}: {e}")
        print("    Ensure the API server is running (e.g. uvicorn app.main:app or docker-compose).")
        sys.exit(1)

    print(f"[*] Posting {len(SAMPLE_EVENTS)} seed events to {API_BASE}/events ...\n")
    created_events = []
    for idx, event_data in enumerate(SAMPLE_EVENTS, 1):
        try:
            resp = httpx.post(f"{API_BASE}/events", json=event_data, timeout=5.0)
            if resp.status_code == 201:
                created = resp.json()
                created_events.append(created)
                print(f"[{idx}/{len(SAMPLE_EVENTS)}] [OK] Ingested {created['source']} ({created['severity']}) -> ID: {created['id']}")
            else:
                print(f"[{idx}/{len(SAMPLE_EVENTS)}] [FAIL] Status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[{idx}/{len(SAMPLE_EVENTS)}] [ERR] {e}")

    print(f"\n[+] Successfully posted {len(created_events)} events.")

    # Verify querying GET /events
    print("\n[*] Verifying GET /events filter and pagination...")
    list_resp = httpx.get(f"{API_BASE}/events?limit=10", timeout=5.0)
    if list_resp.status_code == 200:
        data = list_resp.json()
        print(f"[+] Verified GET /events: Total events in store = {data['total']}, Retrieved = {len(data['events'])}")
    else:
        print(f"[-] GET /events returned status {list_resp.status_code}: {list_resp.text}")


if __name__ == "__main__":
    seed()
