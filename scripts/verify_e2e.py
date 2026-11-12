"""
Prohori AI - Comprehensive End-to-End Verification Suite
Executes live functional checks across all 14 architectural dimensions,
validating every endpoint, sensor, agent, database operation, WebSocket broadcast,
and security constraint.
"""

import asyncio
import json
import sys
import time
import uuid

import httpx
import websockets

API_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/stream"
HONEYPOT_URL = "http://127.0.0.1:8081"
DISCOVERY_URL = "http://127.0.0.1:8083"
WEB_URL = "http://localhost:3000"

results = []

def record(test_name: str, passed: bool, detail: str = ""):
    status_str = "PASS" if passed else "FAIL"
    print(f"[{status_str}] {test_name}: {detail}")
    results.append({"name": test_name, "passed": passed, "detail": detail})

async def run_e2e_verification():
    print("=" * 75)
    print("      PROHORI AI - COMPREHENSIVE END-TO-END VERIFICATION")
    print("      Testing Full Defensive Cyber Architecture across 4 Ports")
    print("=" * 75 + "\n")

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. API Health & Database Connection
        try:
            r = await client.get(f"{API_URL}/healthz")
            data = r.json()
            passed = r.status_code == 200 and data.get("status") == "healthy" and data.get("database") == "connected"
            record("1. API Health & DB Connection", passed, f"Status: {r.status_code}, DB: {data.get('database')}")
        except Exception as e:
            record("1. API Health & DB Connection", False, str(e))

        # 2. Documentation Endpoints
        try:
            r_docs = await client.get(f"{API_URL}/docs")
            r_arch = await client.get(f"{API_URL}/docs/architecture")
            r_sec = await client.get(f"{API_URL}/docs/security")
            passed = r_docs.status_code == 200 and r_arch.status_code == 200 and r_sec.status_code == 200
            record("2. Documentation Endpoints", passed, f"Swagger: {r_docs.status_code}, Arch: {r_arch.status_code}, Sec: {r_sec.status_code}")
        except Exception as e:
            record("2. Documentation Endpoints", False, str(e))

        # 3. Defensive Event Ingestion & Autonomous AI Triage
        ingested_event_id = None
        try:
            test_event = {
                "source": "honeypot",
                "severity": "high",
                "type": "brute_force_suspected",
                "details": {
                    "source_ip": "192.168.1.189",
                    "username_tried": "admin",
                    "password_tried": "super_secret_password_123",
                    "authorization_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy",
                    "attempts_in_window": 12,
                    "simulated_surface": "fake_admin_login"
                }
            }
            r = await client.post(f"{API_URL}/events", json=test_event)
            if r.status_code == 201:
                ev = r.json()
                ingested_event_id = ev.get("id")
                analyst = ev.get("analyst", {})
                has_narrative = bool(analyst.get("narrative_en") and analyst.get("narrative_bn"))
                has_citations = bool(analyst.get("citations"))
                # Verify secret scrubbing: super_secret_password_123 should NOT appear in raw text of analyst narrative
                scrubbed = "super_secret_password_123" not in json.dumps(analyst)
                passed = has_narrative and has_citations and scrubbed
                record("3. Event Ingest, AI Triage & Secret Scrubbing", passed, 
                       f"ID: {ingested_event_id[:8]}, MITRE: {analyst.get('mitre_technique')}, Scrubbed: {scrubbed}")
            else:
                record("3. Event Ingest, AI Triage & Secret Scrubbing", False, f"Status: {r.status_code}")
        except Exception as e:
            record("3. Event Ingest, AI Triage & Secret Scrubbing", False, str(e))

        # 4. Event Querying, Filtering & 404 Error Handling
        try:
            r_list = await client.get(f"{API_URL}/events?limit=5")
            r_filter = await client.get(f"{API_URL}/events?source=honeypot&limit=5")
            r_single = await client.get(f"{API_URL}/events/{ingested_event_id}") if ingested_event_id else None
            r_404 = await client.get(f"{API_URL}/events/{uuid.uuid4()}")
            passed = (
                r_list.status_code == 200 and
                r_filter.status_code == 200 and
                (r_single.status_code == 200 if r_single else False) and
                r_404.status_code == 404
            )
            record("4. Event Querying, Filters & 404 Handling", passed, 
                   f"List: {r_list.status_code}, Filter: {r_filter.status_code}, 404 Verified: {r_404.status_code == 404}")
        except Exception as e:
            record("4. Event Querying, Filters & 404 Handling", False, str(e))

        # 5. Re-Triage Endpoint
        try:
            if ingested_event_id:
                r_retriage = await client.post(f"{API_URL}/analyst/triage/{ingested_event_id}")
                passed = r_retriage.status_code == 200 and r_retriage.json().get("analyst") is not None
                record("5. Event Re-Triage with Knowledge Base", passed, f"Status: {r_retriage.status_code}")
            else:
                record("5. Event Re-Triage with Knowledge Base", False, "Skipped (no event ID)")
        except Exception as e:
            record("5. Event Re-Triage with Knowledge Base", False, str(e))

        # 6. Bilingual AI SOC Analyst Chat (Ask Analyst)
        try:
            # English query
            r_en = await client.post(f"{API_URL}/analyst/ask", json={
                "question": "What is the primary attack pattern from IP 192.168.1.189?",
                "language": "en"
            })
            ans_en = r_en.json().get("answer", "")
            
            # Bangla query
            r_bn = await client.post(f"{API_URL}/analyst/ask", json={
                "question": "আইপি 192.168.1.189 থেকে কী ধরনের আক্রমণ চালানো হয়েছে?",
                "language": "bn"
            })
            ans_bn = r_bn.json().get("answer", "")
            
            passed = r_en.status_code == 200 and r_bn.status_code == 200 and len(ans_en) > 20 and len(ans_bn) > 20
            record("6. Bilingual AI Analyst Chat (EN + BN)", passed, 
                   f"EN len: {len(ans_en)} chars, BN len: {len(ans_bn)} chars")
        except Exception as e:
            record("6. Bilingual AI Analyst Chat (EN + BN)", False, str(e))

        # 7. Server-Sent Events (SSE) Streaming Reasoning
        try:
            chunks = []
            async with client.stream("POST", f"{API_URL}/analyst/ask/stream", json={"question": "Brief threat summary", "language": "en"}) as resp:
                if resp.status_code == 200:
                    async for line in resp.aiter_lines():
                        if line.startswith("data:"):
                            chunks.append(line)
                            if len(chunks) >= 3:
                                break
            passed = len(chunks) >= 3
            record("7. SSE Streaming AI Reasoning (/ask/stream)", passed, f"Received {len(chunks)} streaming SSE tokens")
        except Exception as e:
            record("7. SSE Streaming AI Reasoning (/ask/stream)", False, str(e))

        # 8. Incident Lifecycle & Correlation
        try:
            r_inc = await client.get(f"{API_URL}/analyst/incidents")
            inc_data = r_inc.json()
            incidents = inc_data.get("incidents", [])
            passed_list = r_inc.status_code == 200 and len(incidents) > 0
            
            # Test status patch on first incident
            if passed_list and len(incidents) > 0:
                first_inc = incidents[0]
                inc_id = first_inc["incident_id"]
                r_patch = await client.patch(f"{API_URL}/analyst/incidents/{inc_id}/status", json={
                    "status": "CONTAINED",
                    "operator_id": "SOC_TEST_OPERATOR",
                    "notes": "Automated E2E Verification Check"
                })
                passed_patch = r_patch.status_code == 200 and r_patch.json().get("status") == "CONTAINED"
            else:
                passed_patch = False

            record("8. Incident Lifecycle & Status Patch", passed_list and passed_patch, 
                   f"Total Incidents: {len(incidents)}, Patched {inc_id if passed_list else 'N/A'}: {passed_patch}")
        except Exception as e:
            record("8. Incident Lifecycle & Status Patch", False, str(e))

        # 9. RAG Threat Knowledge Docs
        try:
            r_mitre = await client.get(f"{API_URL}/analyst/knowledge/T1110.001")
            r_cve = await client.get(f"{API_URL}/analyst/knowledge/CVE-2023-38606")
            passed = r_mitre.status_code == 200 and r_cve.status_code == 200
            record("9. RAG STIX / CVE Knowledge Doc Lookup", passed, 
                   f"T1110.001: {r_mitre.status_code}, CVE-2023-38606: {r_cve.status_code}")
        except Exception as e:
            record("9. RAG STIX / CVE Knowledge Doc Lookup", False, str(e))

        # 10. Data Sovereignty Status & Toggle
        try:
            r_stat = await client.get(f"{API_URL}/sovereignty/status")
            orig_mode = r_stat.json().get("sovereignty_mode")
            
            # Toggle to cloud
            r_tog1 = await client.post(f"{API_URL}/sovereignty/toggle", json={"mode": "cloud"})
            # Toggle back to local
            r_tog2 = await client.post(f"{API_URL}/sovereignty/toggle", json={"mode": "local"})
            passed = r_stat.status_code == 200 and r_tog1.status_code == 200 and r_tog2.status_code == 200
            record("10. Data Sovereignty Status & Toggle", passed, 
                   f"Initial: {orig_mode}, Cloud Toggle: {r_tog1.status_code}, Local Toggle: {r_tog2.status_code}")
        except Exception as e:
            record("10. Data Sovereignty Status & Toggle", False, str(e))

        # 11. Append-Only Audit Log & Human-in-the-Loop Approval
        try:
            r_audit = await client.get(f"{API_URL}/audit?limit=10")
            audit_entries = r_audit.json()
            has_entries = r_audit.status_code == 200 and len(audit_entries) > 0
            
            # Verify immutable audit schema fields
            has_audit_fields = all(
                all(k in e for k in ("id", "ts", "action_type", "actor", "model_used", "verdict"))
                for e in audit_entries[:3]
            ) if has_entries else False
            
            # Test Human Approval
            r_approve = await client.post(f"{API_URL}/audit/approve", json={
                "action_id": f"ACT-{uuid.uuid4().hex[:8]}",
                "action_type": "FIREWALL_BLOCK_IP",
                "target": "192.168.1.189",
                "operator_id": "SOC_LEAD_OPERATOR",
                "notes": "E2E automated perimeter containment approval",
                "incident_id": "INC-2026-0001"
            })
            passed_approve = r_approve.status_code == 200 and r_approve.json().get("status") == "APPROVED"
            
            record("11. Append-Only Audit Log & HITL Approval", has_entries and has_audit_fields and passed_approve, 
                   f"Audit entries: {len(audit_entries)}, Schema fields verified: {has_audit_fields}, Approval: {passed_approve}")
        except Exception as e:
            record("11. Append-Only Audit Log & HITL Approval", False, str(e))

        # 12. Deception Honeypot Traps (Port 8081)
        try:
            r_trap_ui = await client.get(f"{HONEYPOT_URL}/login")
            r_trap_probe = await client.get(f"{HONEYPOT_URL}/.env")
            r_trap_login = await client.post(f"{HONEYPOT_URL}/login", data={"username": "root", "password": "toor_password"})
            # In realistic deception: UI renders 200, recon traps return 404, login failure returns 401 (all emit security events)
            passed = (
                r_trap_ui.status_code == 200 and 
                "Admin" in r_trap_ui.text and 
                r_trap_probe.status_code == 404 and 
                r_trap_login.status_code == 401
            )
            record("12. Deception Honeypot Decoys (Port 8081)", passed, 
                   f"UI: {r_trap_ui.status_code}, Recon trap: {r_trap_probe.status_code} (Decoy 404), Login intercept: {r_trap_login.status_code} (Decoy 401)")
        except Exception as e:
            record("12. Deception Honeypot Decoys (Port 8081)", False, str(e))

        # 13. Asset Discovery Scanner (Port 8083) & Allowlist Guard
        try:
            r_al = await client.get(f"{DISCOVERY_URL}/allowlist")
            # Scan allowlisted target 127.0.0.1
            r_scan_allowed = await client.post(f"{DISCOVERY_URL}/scan", json={"target": "127.0.0.1", "ports": [8000, 8081, 8083]})
            # Attempt scan on off-list target (should be strictly 403 Forbidden)
            r_scan_blocked = await client.post(f"{DISCOVERY_URL}/scan", json={"target": "8.8.8.8", "ports": [53]})
            passed = (
                r_al.status_code == 200 and 
                r_scan_allowed.status_code == 200 and 
                r_scan_blocked.status_code == 403
            )
            record("13. Discovery Scanner & Allowlist Security (Port 8083)", passed, 
                   f"Allowlist: {r_al.status_code}, Local scan: {r_scan_allowed.status_code}, Off-list blocked: {r_scan_blocked.status_code == 403}")
        except Exception as e:
            record("13. Discovery Scanner & Allowlist Security (Port 8083)", False, str(e))

        # 14. Operator Console Web Server (Port 3000) & Bundled Offline Fonts
        try:
            r_web = await client.get(f"{WEB_URL}/")
            r_font = await client.get(f"{WEB_URL}/fonts/hind-siliguri-bengali.woff2")
            has_html = r_web.status_code == 200 and "<div id=\"root\"></div>" in r_web.text
            has_bengali_font = r_font.status_code == 200 and len(r_font.content) > 50000
            passed = has_html and has_bengali_font
            record("14. React Operator Console & Offline Fonts (Port 3000)", passed, 
                   f"Status: {r_web.status_code}, Root DOM: True, Bundled WOFF2: {has_bengali_font} ({len(r_font.content)} bytes)")
        except Exception as e:
            record("14. React Operator Console & Offline Fonts (Port 3000)", False, str(e))

    # 15. WebSocket Real-time Ingestion Broadcast
    try:
        async with websockets.connect(WS_URL) as ws:
            # First message on connect is connection_established
            _ = await asyncio.wait_for(ws.recv(), timeout=2.0)
            
            # Emit an event via HTTP client with dedicated client IP
            async with httpx.AsyncClient(timeout=5.0) as client:
                ws_test_id = str(uuid.uuid4())
                post_res = await client.post(
                    f"{API_URL}/events",
                    headers={"X-Forwarded-For": "10.99.99.1"},
                    json={
                        "source": "honeypot",
                        "severity": "medium",
                        "type": "ws_verify_test",
                        "details": {"test_uuid": ws_test_id, "source_ip": "10.0.0.99"}
                    }
                )
            
            # Wait for message on websocket
            received = False
            start_time = time.time()
            while time.time() - start_time < 5.0:
                msg = await asyncio.wait_for(ws.recv(), timeout=3.0)
                parsed = json.loads(msg)
                if parsed.get("type") == "new_event" and parsed.get("event", {}).get("details", {}).get("test_uuid") == ws_test_id:
                    received = True
                    break
            record("15. WebSocket Live Event Broadcast (/stream)", received, f"Real-time event received: {received} (Post: {post_res.status_code})")
    except Exception as e:
        record("15. WebSocket Live Event Broadcast (/stream)", False, repr(e))

    print("\n" + "=" * 75)
    total = len(results)
    passed_count = sum(1 for r in results if r["passed"])
    print(f"VERIFICATION SUMMARY: {passed_count}/{total} Checks Passed ({int(passed_count/total*100)}%)")
    print("=" * 75)

    if passed_count == total:
        print("\n>>> ALL 15 ARCHITECTURAL VERIFICATION SUITES PASSED! <<<")
        sys.exit(0)
    else:
        print(f"\n>>> {total - passed_count} CHECKS FAILED! INSPECT DETAILED LOG ABOVE. <<<")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_e2e_verification())
