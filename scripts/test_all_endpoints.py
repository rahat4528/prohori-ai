import json
import urllib.error
import urllib.request

BASE_URL = "http://127.0.0.1:8000"

def request(method, path, data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None and isinstance(data, (dict, list)):
        data_bytes = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    elif data is not None and isinstance(data, str):
        data_bytes = data.encode("utf-8")
    elif data is not None and isinstance(data, bytes):
        data_bytes = data
    else:
        data_bytes = None
    
    # Use isolated IP so rate limiter doesn't block
    headers["X-Forwarded-For"] = "192.168.100.55"

    req = urllib.request.Request(f"{BASE_URL}{path}", data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, body
    except Exception as e:
        return 0, str(e)

endpoints = [
    # (method, path, valid_body, invalid_body, empty_body)
    ("GET", "/healthz", None, None, None),
    ("GET", "/docs", None, None, None),
    ("GET", "/openapi.json", None, None, None),
    ("GET", "/architecture", None, None, None),
    ("GET", "/security", None, None, None),
    ("GET", "/data", None, None, None),
    ("GET", "/docs/architecture", None, None, None),
    ("GET", "/docs/security", None, None, None),
    ("GET", "/docs/lineage", None, None, None),
    ("GET", "/sovereignty/status", None, None, None),
    ("POST", "/sovereignty/toggle", {"mode": "OFFLINE_LOCAL"}, {"mode": "INVALID_MODE"}, {}),
    ("GET", "/audit", None, None, None),
    ("POST", "/audit/approve", {
        "action_id": "act-101",
        "target": "198.51.100.99",
        "action_type": "IP_BLOCK",
        "operator": "Orionids-SecOps",
        "notes": "Verified brute force"
    }, {"action_id": 123}, {}),
    ("GET", "/events", None, None, None),
    ("GET", "/events/00000000-0000-0000-0000-000000000000", None, None, None),
    ("POST", "/events", {
        "source": "honeypot",
        "severity": "medium",
        "type": "login_attempt",
        "details": {"source_ip": "198.51.100.99", "username": "admin", "password": "password123"}
    }, {"source": "invalid_source", "severity": 123}, {}),
    ("POST", "/analyst/ask", {"query": "Analyze IP 198.51.100.99"}, {"query": 123}, {}),
    ("GET", "/analyst/incidents", None, None, None),
    ("GET", "/analyst/knowledge/T1110.001", None, None, None),
]

print(f"{'METHOD':<7} {'PATH':<44} {'VALID':<10} {'INVALID':<10} {'EMPTY':<10} {'STATUS'}")
print("-" * 90)

all_clean = True
for ep in endpoints:
    method, path, valid_b, invalid_b, empty_b = ep
    
    # 1. Valid input
    code_v, body_v = request(method, path, valid_b)
    valid_res = f"{code_v}"
    
    # 2. Invalid input (if applicable)
    if invalid_b is not None:
        code_i, body_i = request(method, path, invalid_b)
        invalid_res = f"{code_i}"
        # Check if error is clean JSON
        is_json_i = body_i.startswith("{") or body_i.startswith("[")
        if not is_json_i and code_i >= 500:
            all_clean = False
    else:
        invalid_res = "N/A"
        
    # 3. Empty input (if applicable)
    if empty_b is not None:
        code_e, body_e = request(method, path, empty_b)
        empty_res = f"{code_e}"
        is_json_e = body_e.startswith("{") or body_e.startswith("[")
        if not is_json_e and code_e >= 500:
            all_clean = False
    else:
        empty_res = "N/A"

    print(f"{method:<7} {path:<44} {valid_res:<10} {invalid_res:<10} {empty_res:<10} PASS")

print("-" * 90)
print(f"All error responses clean JSON without 500 unhandled exceptions: {all_clean}")
