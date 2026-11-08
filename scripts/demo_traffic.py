"""
Prohori AI - Defensive Demo Traffic Generator
TARGETS OUR OWN LAB ENDPOINTS ONLY.
Generates controlled, benign test traffic to demonstrate:
1. Deception Sensor (simulated honeypot: recon probes, single login, brute-force burst)
2. API Abuse Guard (rate limiter: burst traffic, 429 block, progressive escalation)
"""

import sys
import time
import httpx

EVENT_API = "http://localhost:8000"
DECEPTION_URL = "http://localhost:8081"
GUARD_URL = "http://localhost:8082"


def print_step(title: str):
    print(f"\n{'='*70}\n[DEMO] {title}\n{'='*70}")


def run_deception_demo(client: httpx.Client):
    print_step("Phase 1: Simulating Reconnaissance Probes on Honeypot")
    recon_paths = ["/.env", "/admin", "/phpmyadmin"]
    for path in recon_paths:
        try:
            resp = client.get(f"{DECEPTION_URL}{path}", headers={"User-Agent": "Nmap-Scripting-Engine/1.0"})
            print(f"  --> GET {path} | Response: {resp.status_code} (Decoy trap tripped)")
        except Exception as e:
            print(f"  [!] Failed to reach honeypot at {DECEPTION_URL}{path}: {e}")

    time.sleep(1)

    print_step("Phase 2: Simulating Credential Stuffing & Brute Force Burst")
    attacker_ip = "192.168.1.189"
    passwords = ["admin", "123456", "password", "SuperSecret!", "toor"]

    for idx, pwd in enumerate(passwords, 1):
        try:
            resp = client.post(
                f"{DECEPTION_URL}/login",
                data={"username": "admin", "password": pwd},
                headers={
                    "X-Forwarded-For": attacker_ip,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64)"
                }
            )
            print(f"  [{idx}/{len(passwords)}] POST /login | User: admin, Pass: {pwd} | Status: {resp.status_code}")
            time.sleep(0.3)
        except Exception as e:
            print(f"  [!] Honeypot error: {e}")


def run_ratelimit_demo(client: httpx.Client):
    print_step("Phase 3: Simulating API Request Flood against Abuse Guard")
    # We can hit the guard proxy or the API directly
    target = GUARD_URL if is_service_reachable(GUARD_URL) else EVENT_API
    print(f"  Targeting Abuse Guard endpoint: {target}")

    flooder_ip = "198.51.100.77"
    blocked_count = 0

    # Fire 30 requests in rapid succession to exceed the 25 request window
    for i in range(1, 31):
        try:
            resp = client.get(
                f"{target}/events?limit=1",
                headers={
                    "X-Forwarded-For": flooder_ip,
                    "X-Client-IP": flooder_ip
                }
            )
            if resp.status_code == 200:
                rem = resp.headers.get("X-RateLimit-Remaining", "?")
                print(f"  [Req {i:02d}] 200 OK | Remaining quota: {rem}")
            elif resp.status_code == 429:
                blocked_count += 1
                retry_after = resp.headers.get("Retry-After", "?")
                esc = resp.headers.get("X-RateLimit-Escalation", "?")
                print(f"  [Req {i:02d}] 429 BLOCKED | Escalation: {esc} | Retry-After: {retry_after}s")
        except Exception as e:
            print(f"  [!] Request error: {e}")

    print(f"\n  [+] Abuse Guard successfully blocked {blocked_count} excessive requests from {flooder_ip}")



def is_service_reachable(url: str) -> bool:
    try:
        r = httpx.get(f"{url}/healthz", timeout=1.5)
        return r.status_code in (200, 404)
    except Exception:
        return False


def verify_events_in_api(client: httpx.Client):
    print_step("Phase 4: Verifying Sensor Telemetry in Prohori Event API")
    try:
        resp = client.get(f"{EVENT_API}/events?limit=10")
        if resp.status_code == 200:
            data = resp.json()
            print(f"  [+] Total Events in Store: {data['total']}")
            print("  Recent Events:")
            for ev in data["events"][:8]:
                src = ev["source"].upper()
                sev = ev["severity"].upper()
                ev_type = ev["type"]
                ts = ev["ts"]
                print(f"    - [{ts[:19]}] [{src:11}] [{sev:8}] {ev_type}")
        else:
            print(f"  [-] Failed to query {EVENT_API}/events: {resp.status_code}")
    except Exception as e:
        print(f"  [-] Error querying Event API: {e}")


def main():
    print("""
======================================================================
     PROHORI AI - DEFENSIVE LAB DEMO TRAFFIC GENERATOR
     Target: Authorized lab endpoints on localhost only
======================================================================
    """)
    with httpx.Client(timeout=5.0) as client:
        # Check Event API first
        if not is_service_reachable(EVENT_API):
            print(f"[!] Event API at {EVENT_API} is unreachable.")
            print("    Please start the API: uvicorn app.main:app (or docker compose up)")
            sys.exit(1)

        # Check Honeypot
        if is_service_reachable(DECEPTION_URL):
            run_deception_demo(client)
        else:
            print(f"[i] Honeypot at {DECEPTION_URL} not running standalone. Skipping direct honeypot probes.")

        # Rate limiter demo
        run_ratelimit_demo(client)

        # Verification
        time.sleep(1)
        verify_events_in_api(client)


if __name__ == "__main__":
    main()
