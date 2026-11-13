"""
Prohori AI - Stage Demo Reset Script
Resets database and in-memory state to a clean slate (empty alert list).
Works via FastAPI endpoint if running, or directly touches SQLite if stopped.
"""

import os
import sqlite3
import sys

import httpx

API_BASE = os.getenv("API_BASE", "http://127.0.0.1:8000")
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prohori.db")

def reset_via_api() -> bool:
    try:
        resp = httpx.post(f"{API_BASE}/demo/reset", timeout=5.0)
        if resp.status_code == 200:
            print("[SUCCESS] API reset endpoint called successfully:", resp.json())
            return True
        else:
            print(f"[WARN] API returned status {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print(f"[INFO] Backend API not reachable on {API_BASE}: {e}")
        return False

def reset_via_sqlite() -> bool:
    if not os.path.exists(DB_PATH):
        print(f"[INFO] SQLite database does not exist at {DB_PATH}; already clean.")
        return True
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM events;")
        cursor.execute("DELETE FROM incidents;")
        conn.commit()
        conn.close()
        print(f"[SUCCESS] Directly purged 'events' and 'incidents' from SQLite {DB_PATH}.")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to reset SQLite database: {e}")
        return False

def main():
    print("=== Prohori AI: Stage Demo Reset ===")
    api_ok = reset_via_api()
    if not api_ok:
        print("[INFO] Falling back to direct SQLite cleanup...")
        sql_ok = reset_via_sqlite()
        if not sql_ok:
            print("[FAIL] Could not reset demo state.")
            sys.exit(1)
    print("=== Demo state is now CLEAN. Next run will show 0 alerts ===")

if __name__ == "__main__":
    main()

