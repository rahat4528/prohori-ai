"""
Prohori AI - Analysis Latency Benchmark Script
Times 20 real alerts through the Event API and AI Triage engine.
"""

import statistics
import time

import httpx

API_BASE = "http://localhost:8000"

def run_benchmark():
    latencies = []
    print(f"[+] Benchmarking 20 live security events against {API_BASE}/events...")
    
    with httpx.Client(timeout=10.0) as client:
        for i in range(1, 21):
            payload = {
                "source": "honeypot" if i % 2 == 0 else "scanner",
                "severity": "high" if i % 3 == 0 else "medium",
                "type": f"benchmark_attack_{i}",
                "details": {
                    "source_ip": f"192.168.1.{i}",
                    "target_service": "ssh" if i % 2 == 0 else "http",
                    "payload_sample": f"attempt_{i}"
                }
            }
            # Use distinct client IP to prevent client-side rate limiting
            headers = {"X-Client-IP": f"10.200.0.{i}"}
            
            t0 = time.perf_counter()
            resp = client.post(f"{API_BASE}/events", json=payload, headers=headers)
            dt = (time.perf_counter() - t0) * 1000.0  # ms
            
            if resp.status_code == 201:
                latencies.append(dt)
                print(f"    Alert {i:02d}: {dt:.2f} ms | Status: 201 Created")
            else:
                print(f"    Alert {i:02d}: Status {resp.status_code} ({resp.text})")
            time.sleep(0.05)

    if not latencies:
        print("[-] No successful requests recorded.")
        return

    latencies.sort()
    med = statistics.median(latencies)
    mean_val = statistics.mean(latencies)
    p95_val = latencies[int(0.95 * len(latencies))]
    min_val = latencies[0]
    max_val = latencies[-1]

    print("\n" + "=" * 55)
    print("           REAL ANALYSIS LATENCY RESULTS")
    print("=" * 55)
    print(f"Sample Count       : {len(latencies)} alerts")
    print(f"Min Latency        : {min_val:.2f} ms")
    print(f"Median Latency     : {med:.2f} ms")
    print(f"Mean Latency       : {mean_val:.2f} ms")
    print(f"P95 Latency        : {p95_val:.2f} ms")
    print(f"Worst Case (Max)   : {max_val:.2f} ms")
    print("=" * 55)

if __name__ == "__main__":
    run_benchmark()

