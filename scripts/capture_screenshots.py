"""
Prohori AI - Screenshot Capture Suite via Playwright
Captures multi-resolution screenshots across English and Bengali,
and logs browser console errors/warnings and external network requests.
"""

import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

RESOLUTIONS = [
    ("1920x1080", 1920, 1080),
    ("1366x768", 1366, 768),
    ("1024x768", 1024, 768),
    ("390x844", 390, 844)
]

LANGUAGES = ["en", "bn"]

async def capture_suite(mode="after"):
    out_dir = ROOT / "docs" / "screenshots" / mode
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"[*] Starting screenshot capture for mode: {mode} -> {out_dir}")

    console_logs = []
    network_requests = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME_PATH, headless=True)

        for res_name, width, height in RESOLUTIONS:
            for lang in LANGUAGES:
                print(f"\n[*] Capturing {res_name} in {lang.upper()}...")
                context = await browser.new_context(
                    viewport={"width": width, "height": height},
                    device_scale_factor=1.0
                )
                page = await context.new_page()

                def handle_console(msg):
                    if msg.type in ["error", "warning"]:
                        console_logs.append(f"[{res_name}][{lang}][{msg.type}] {msg.text}")

                def handle_request(req):
                    url = req.url
                    if not (url.startswith("http://localhost:3000") or url.startswith("http://127.0.0.1:8000") or url.startswith("data:")):
                        network_requests.append(url)

                page.on("console", handle_console)
                page.on("request", handle_request)

                await page.goto("http://localhost:3000", wait_until="networkidle")
                await asyncio.sleep(1.2)

                # Set language
                if lang == "bn":
                    bn_btn = page.locator("button:has-text('বাংলা')").first
                    if await bn_btn.count() > 0:
                        await bn_btn.click()
                        await asyncio.sleep(0.6)
                else:
                    en_btn = page.locator("button:has-text('English')").first
                    if await en_btn.count() > 0:
                        await en_btn.click()
                        await asyncio.sleep(0.6)

                # If no alerts yet, click "Run demo" to populate
                article_cards = page.locator("article[role='article']")
                if await article_cards.count() == 0:
                    run_demo_btn = page.locator("button:has-text('Run demo'), button:has-text('ডেমো চালান')").first
                    if await run_demo_btn.count() > 0:
                        await run_demo_btn.click()
                        await asyncio.sleep(1.5)

                # 1. Main Dashboard view
                main_path = out_dir / f"dashboard_{res_name}_{lang}.png"
                await page.screenshot(path=str(main_path), full_page=False)
                print(f"  -> Saved {main_path.name}")

                # If mobile, also capture the "Threat Analysis" tab
                if width < 900:
                    analysis_tab = page.locator("button[role='tab']:has-text('Analysis'), button[role='tab']:has-text('বিশ্লেষণ')").first
                    if await analysis_tab.count() > 0:
                        await analysis_tab.click()
                        await asyncio.sleep(0.5)
                        mobile_path = out_dir / f"analysis_{res_name}_{lang}.png"
                        await page.screenshot(path=str(mobile_path), full_page=False)
                        print(f"  -> Saved {mobile_path.name}")
                        # Switch back to alerts
                        alerts_tab = page.locator("button[role='tab']:has-text('Alerts'), button[role='tab']:has-text('সতর্কতা')").first
                        if await alerts_tab.count() > 0:
                            await alerts_tab.click()
                            await asyncio.sleep(0.3)

                # 2. Audit Log Drawer (via Shift+A)
                try:
                    await page.keyboard.press("Shift+A")
                    await asyncio.sleep(0.8)
                    audit_path = out_dir / f"audit_{res_name}_{lang}.png"
                    await page.screenshot(path=str(audit_path), full_page=False)
                    print(f"  -> Saved {audit_path.name}")
                    await page.keyboard.press("Escape")
                    await asyncio.sleep(0.4)
                except Exception as e:
                    print(f"  ! Error capturing audit log: {e}")

                # 3. Pitch Deck Modal (via Shift+P)
                if width >= 1024:
                    try:
                        await page.keyboard.press("Shift+P")
                        await asyncio.sleep(0.8)
                        deck_path = out_dir / f"pitch_deck_{res_name}_{lang}.png"
                        await page.screenshot(path=str(deck_path), full_page=False)
                        print(f"  -> Saved {deck_path.name}")
                        await page.keyboard.press("Escape")
                        await asyncio.sleep(0.4)
                    except Exception as e:
                        print(f"  ! Error capturing pitch deck: {e}")

                # 4. Keyboard Shortcuts Modal (via ?)
                if width >= 1024 and lang == "en":
                    try:
                        await page.keyboard.press("?")
                        await asyncio.sleep(0.6)
                        shortcuts_path = out_dir / f"shortcuts_{res_name}_{lang}.png"
                        await page.screenshot(path=str(shortcuts_path), full_page=False)
                        print(f"  -> Saved {shortcuts_path.name}")
                        await page.keyboard.press("Escape")
                        await asyncio.sleep(0.4)
                    except Exception as e:
                        print(f"  ! Error capturing shortcuts modal: {e}")

                await context.close()

        await browser.close()

    # Save report
    report_file = out_dir / "report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump({
            "mode": mode,
            "console_errors_and_warnings": console_logs,
            "external_requests": list(set(network_requests))
        }, f, indent=2)

    print(f"\n[+] Capture complete! Report saved to {report_file}")
    print(f"Total console warnings/errors: {len(console_logs)}")
    print(f"External requests: {len(set(network_requests))}")
    if network_requests:
        print("External URLs found:", set(network_requests))

if __name__ == "__main__":
    mode_arg = sys.argv[1] if len(sys.argv) > 1 else "after"
    asyncio.run(capture_suite(mode_arg))
