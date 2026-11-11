"""
Prohori AI - Automated Silent Screen Capture Script via Playwright
Generates a 60-90 second backup video of the Operator Console at http://localhost:3000.

Usage:
  pip install playwright
  playwright install chromium
  python docs/backup/record_demo_playwright.py
"""

import asyncio
import os
import sys
from pathlib import Path


async def record_demo():
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("[!] Playwright is not installed.")
        print("    To run automated capture: pip install playwright && playwright install chromium")
        sys.exit(1)

    backup_dir = Path(__file__).resolve().parent
    video_dir = backup_dir / "recordings"
    video_dir.mkdir(parents=True, exist_ok=True)

    print(f"[*] Starting Playwright recording session. Output: {video_dir}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(video_dir),
            record_video_size={"width": 1920, "height": 1080}
        )
        page = await context.new_page()

        print("[*] Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await asyncio.sleep(3)

        # 1. Overview & Top Counters
        print("[*] Scene 1: Top Counters & Threat Overview")
        await asyncio.sleep(5)

        # 2. Inspect incident banner
        print("[*] Scene 2: Highlighting Incident Correlation")
        try:
            incident_card = page.locator("text=CRITICAL MULTI-STAGE INCIDENT").first
            if await incident_card.count() > 0:
                await incident_card.hover()
                await asyncio.sleep(4)
        except Exception as e:
            print(f"    Note: {e}")

        # 3. Open Event Drawer
        print("[*] Scene 3: Opening Event Detail Drawer")
        try:
            event_row = page.locator("tr").nth(1)
            if await event_row.count() > 0:
                await event_row.click()
                await asyncio.sleep(5)
                # Scroll within drawer
                await page.mouse.wheel(0, 300)
                await asyncio.sleep(3)
        except Exception as e:
            print(f"    Note: {e}")

        # 4. Ask the Analyst panel
        print("[*] Scene 4: Interacting with Ask the Analyst Panel")
        try:
            ask_input = page.locator("input[placeholder*='Ask'], textarea[placeholder*='Ask']").first
            if await ask_input.count() > 0:
                await ask_input.click()
                await ask_input.fill("কী ধরনের আক্রমণ শনাক্ত হয়েছে এবং কীভাবে প্রতিকার করব?")
                await asyncio.sleep(2)
                submit_btn = page.locator("button:has-text('Ask'), button:has-text('জিজ্ঞাসা')").first
                if await submit_btn.count() > 0:
                    await submit_btn.click()
                    await asyncio.sleep(8)
        except Exception as e:
            print(f"    Note: {e}")

        # 5. One-Click Defense Approval
        print("[*] Scene 5: Demonstrating Human-in-the-Loop Defense Approval")
        try:
            approve_btn = page.locator("button:has-text('Approve Defense'), button:has-text('অনুমোদন')").first
            if await approve_btn.count() > 0:
                await approve_btn.hover()
                await asyncio.sleep(2)
                await approve_btn.click()
                await asyncio.sleep(5)
        except Exception as e:
            print(f"    Note: {e}")

        # 6. Audit Trail & Wrap up
        print("[*] Scene 6: Inspecting Append-Only Audit Trail")
        try:
            audit_tab = page.locator("text=Audit Trail, text=অডিট লগ").first
            if await audit_tab.count() > 0:
                await audit_tab.click()
                await asyncio.sleep(6)
        except Exception as e:
            print(f"    Note: {e}")

        await asyncio.sleep(3)
        await context.close()
        await browser.close()

    # Rename latest recorded video
    videos = list(video_dir.glob("*.webm"))
    if videos:
        latest = max(videos, key=os.path.getctime)
        target = backup_dir / "prohori_demo_backup_silent.webm"
        if target.exists():
            target.unlink()
        latest.rename(target)
        print(f"[+] Backup video successfully recorded: {target}")


if __name__ == "__main__":
    asyncio.run(record_demo())

