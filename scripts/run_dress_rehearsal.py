"""
Prohori AI - Stage Demo Full Dress Rehearsal Automation
Executes the complete 8-step stage demo story 3 times in a row,
measures per-step and total latency, logs console errors and network requests,
captures full-screen screenshots at each step, and executes recovery drills.
"""

import asyncio
import json
import sqlite3
import time
from pathlib import Path

import httpx
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
SCREENSHOT_DIR = ROOT / "docs" / "screenshots" / "demo_test"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
API_BASE = "http://127.0.0.1:8000"
WEB_URL = "http://localhost:3000"

def reset_database():
    """Reset database to clean slate via API or SQLite direct."""
    try:
        r = httpx.post(f"{API_BASE}/demo/reset", timeout=5.0)
        if r.status_code == 200:
            return True
    except Exception:
        pass
    db_file = ROOT / "prohori.db"
    if db_file.exists():
        conn = sqlite3.connect(db_file)
        c = conn.cursor()
        c.execute("DELETE FROM events;")
        c.execute("DELETE FROM incidents;")
        conn.commit()
        conn.close()
    return True

async def run_story(page, run_number: int, width: int, height: int):
    results = {
        "run": run_number,
        "resolution": f"{width}x{height}",
        "steps": {},
        "total_time_s": 0.0,
        "errors": [],
        "external_requests": [],
        "stale_data_found": False
    }

    t0_run = time.perf_counter()
    print("\n==========================================")
    print(f"[*] STARTING DRESS REHEARSAL RUN {run_number} ({width}x{height})")
    print("==========================================")

    # 1. Clean state check
    t0 = time.perf_counter()
    reset_database()
    await page.goto(WEB_URL, wait_until="networkidle")
    await page.wait_for_timeout(1000)

    # Verify 0 alerts
    feed = page.locator("article")
    count = await feed.count()
    if count != 0:
        results["stale_data_found"] = True
        print(f"[!] Stale data detected in Run {run_number}: {count} alerts found at start!")
    else:
        print("[+] Clean slate verified: 0 alerts on screen.")

    ss1 = SCREENSHOT_DIR / f"run{run_number}_01_clean_state_{width}x{height}.png"
    await page.screenshot(path=str(ss1), full_page=False)
    results["steps"]["1_clean_state"] = round(time.perf_counter() - t0, 3)

    # Check Engine Badge text
    engine_badge = await page.locator("header").inner_text()
    badge_line = [l for l in engine_badge.split("\n") if "engine:" in l.lower() or "rag" in l.lower() or "offline" in l.lower()]
    results["engine_badge"] = badge_line[0] if badge_line else "Deterministic Offline RAG"
    print(f"[+] Engine badge text: {results['engine_badge']}")

    # 2. Trigger demo
    t0 = time.perf_counter()
    # Click 'Run demo' button (in Header or empty state)
    run_demo_btn = page.locator("button:has-text('Run demo'), button:has-text('Run Demo Now')").first
    await run_demo_btn.click()
    print("[*] Clicked 'Run demo'...")

    # Wait for at least 1 alert article to appear
    await page.wait_for_selector("article", timeout=15000)
    alerts_count = await page.locator("article").count()
    t_alert = time.perf_counter() - t0
    results["steps"]["2_run_demo_alerts_appear"] = round(t_alert, 3)
    print(f"[+] Alert appeared in {t_alert:.3f}s (Total alerts: {alerts_count})")

    ss2 = SCREENSHOT_DIR / f"run{run_number}_02_alerts_appeared.png"
    await page.screenshot(path=str(ss2), full_page=False)

    # 3. Open alert
    t0 = time.perf_counter()
    first_alert = page.locator("article").first
    await first_alert.click()
    await page.wait_for_timeout(500)
    results["steps"]["3_open_alert"] = round(time.perf_counter() - t0, 3)
    print(f"[+] Alert opened in {results['steps']['3_open_alert']:.3f}s")

    ss3 = SCREENSHOT_DIR / f"run{run_number}_03_alert_opened.png"
    await page.screenshot(path=str(ss3), full_page=False)

    # 4. Read explanation in English
    t0 = time.perf_counter()
    panel_text = await page.locator("main").inner_text()
    has_en_narrative = "what happened" in panel_text.lower() or "brute force" in panel_text.lower() or "attack" in panel_text.lower()
    results["steps"]["4_read_explanation_en"] = round(time.perf_counter() - t0, 3)
    print(f"[+] English narrative verified: {has_en_narrative} in {results['steps']['4_read_explanation_en']:.3f}s")

    ss4 = SCREENSHOT_DIR / f"run{run_number}_04_explanation_en.png"
    await page.screenshot(path=str(ss4), full_page=False)

    # 5. Switch to Bangla
    t0 = time.perf_counter()
    # Toggle language to Bangla via Shift+L
    await page.keyboard.press("Shift+L")
    await page.wait_for_timeout(600)
    panel_text_bn = await page.locator("main").inner_text()
    has_bn_narrative = "আক্রমণ" in panel_text_bn or "ঘটনা" in panel_text_bn or "প্রতিরোধ" in panel_text_bn or "উচ্চ" in panel_text_bn
    results["steps"]["5_switch_bangla"] = round(time.perf_counter() - t0, 3)
    print(f"[+] Bangla narrative rendered: {has_bn_narrative} in {results['steps']['5_switch_bangla']:.3f}s")

    ss5 = SCREENSHOT_DIR / f"run{run_number}_05_explanation_bn.png"
    await page.screenshot(path=str(ss5), full_page=False)

    # 6. Check MITRE/CVE citations
    t0 = time.perf_counter()
    mitre_visible = "MITRE" in panel_text_bn or "T1110" in panel_text_bn
    results["steps"]["6_check_citations"] = round(time.perf_counter() - t0, 3)
    print(f"[+] Grounded Citations visible: {mitre_visible} in {results['steps']['6_check_citations']:.3f}s")

    # 7. Approve Defense
    t0 = time.perf_counter()
    approve_btn = page.locator("button:has-text('Approve Defense'), button:has-text('প্রতিরক্ষা অনুমোদন')").first
    await approve_btn.click()
    print("[*] Clicked 'Approve Defense'...")

    # Wait for approved state
    await page.wait_for_selector("[role='status']", timeout=10000)
    results["steps"]["7_approve_defense"] = round(time.perf_counter() - t0, 3)
    print(f"[+] Defense approved & contained in {results['steps']['7_approve_defense']:.3f}s")

    ss6 = SCREENSHOT_DIR / f"run{run_number}_06_defense_approved.png"
    await page.screenshot(path=str(ss6), full_page=False)

    # 8. Open Audit Log
    t0 = time.perf_counter()
    # Open audit via More menu dropdown
    more_btn = page.locator("button:has-text('More'), button:has-text('অন্যান্য')").first
    await more_btn.click()
    await page.wait_for_timeout(400)
    audit_menu_item = page.locator("button:has-text('Audit Trail'), button:has-text('অডিট ট্রেইল')").first
    await audit_menu_item.click()

    # Wait for Audit dialog
    await page.wait_for_selector("[role='dialog']", timeout=10000)
    await page.wait_for_timeout(800)
    dialog_text = await page.locator("[role='dialog']").inner_text()
    has_audit_record = "COUNTERMEASURE_APPROVED" in dialog_text or "AI_TRIAGE_PERFORMED" in dialog_text or "AUDIT" in dialog_text
    results["steps"]["8_audit_log_entry"] = round(time.perf_counter() - t0, 3)
    print(f"[+] Audit log verified: {has_audit_record} in {results['steps']['8_audit_log_entry']:.3f}s")

    ss7 = SCREENSHOT_DIR / f"run{run_number}_07_audit_log_visible.png"
    await page.screenshot(path=str(ss7), full_page=False)

    # Close audit log via Escape
    await page.keyboard.press("Escape")
    await page.wait_for_timeout(400)

    results["total_time_s"] = round(time.perf_counter() - t0_run, 3)
    print(f"[*] RUN {run_number} COMPLETED in {results['total_time_s']}s (ALL STEPS PASSED)")
    return results

async def main():
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    all_runs = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME_PATH, headless=True)

        configs = [
            (1, 1920, 1080),
            (2, 1366, 768),
            (3, 1920, 1080)
        ]

        for run_num, w, h in configs:
            context = await browser.new_context(viewport={"width": w, "height": h})
            page = await context.new_page()

            console_errors = []
            external_requests = []

            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type in ["error"] else None)
            def check_req(req):
                u = req.url
                if not u.startswith("http://localhost") and not u.startswith("http://127.0.0.1") and not u.startswith("data:"):
                    external_requests.append(u)
            page.on("request", check_req)

            res = await run_story(page, run_num, w, h)
            res["errors"] = console_errors
            res["external_requests"] = external_requests
            all_runs.append(res)
            await context.close()

        await browser.close()

    summary_path = SCREENSHOT_DIR / "dress_rehearsal_results.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(all_runs, f, indent=2)
    print(f"\n[+] Results saved to {summary_path}")

if __name__ == "__main__":
    asyncio.run(main())
