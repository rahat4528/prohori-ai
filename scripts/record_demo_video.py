"""
Prohori AI - 4K Ultra HD Demo Video Recorder (CloudCamp "Vibe to Production" Design Layout)
Arranged using the official CloudCamp evaluation breakdown as a design reference:
- Stage 1: Problem & Mission (0:00 - 0:18)
- Stage 2: Solution & Network Discovery (0:18 - 0:38)
- Stage 3: Live Demo & Multi-Sensor Flow (0:38 - 1:18)
- Stage 4: AI Approach & Bengali Parity (1:18 - 1:56)
- Stage 5: Impact, Audit Trail & Scale (1:56 - 2:20)

Visual Design:
- High-contrast obsidian/navy glassmorphic card (#0b101b, rgba(11,16,27,0.95))
- Cyan accent border (#38bdf8) and structured section pill badges
- Evaluator-aligned "Key Message" and "Production Feature" lower-third metadata
- 100% edge-to-edge responsive layout, native 4K 2160p UHD resolution
"""

import asyncio
import os
import shutil
import sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
BACKUP_DIR = ROOT / "docs" / "backup"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

TARGET_URL = "http://localhost:3000"
SHOW_TITLES = "--no-title" not in sys.argv and "--clean" not in sys.argv


async def apply_fullwidth_responsive_styles(page):
    """Ensure the console UI fills the full 16:9 canvas with zero wasted side margins."""
    await page.add_style_tag(content="""
        .soc-container {
            max-width: 100% !important;
            padding: 16px 24px 32px !important;
            box-sizing: border-box !important;
        }
        .simplified-grid {
            grid-template-columns: 500px 1fr !important;
            gap: 22px !important;
        }
    """)


async def show_opening_splash(page):
    """Render a structured pitch card inspired by the CloudCamp evaluation layout."""
    if not SHOW_TITLES:
        return
    await page.evaluate("""() => {
        const splash = document.createElement("div");
        splash.id = "prohori-opening-splash";
        splash.style.position = "fixed";
        splash.style.inset = "0";
        splash.style.background = "radial-gradient(circle at 50% 45%, #0d1527 0%, #060911 100%)";
        splash.style.display = "flex";
        splash.style.flexDirection = "column";
        splash.style.alignItems = "center";
        splash.style.justifyContent = "center";
        splash.style.zIndex = "99999999";
        splash.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        splash.style.color = "#ffffff";
        splash.style.transition = "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
        splash.style.pointerEvents = "none";

        splash.innerHTML = `
            <div style="background: rgba(13, 22, 38, 0.95); border: 1.5px solid rgba(56, 189, 248, 0.45); box-shadow: 0 20px 60px rgba(0,0,0,0.85), 0 0 40px rgba(56, 189, 248, 0.2); border-radius: 20px; padding: 36px 48px; max-width: 920px; text-align: center;">
                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 13px; font-weight: 800; padding: 5px 14px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 18px;">
                    <span>🛡️</span> VIBE TO PRODUCTION // HACKATHON PROOF OF EXECUTION
                </div>
                
                <div style="font-size: 48px; font-weight: 900; letter-spacing: -1.2px; margin-bottom: 10px; background: linear-gradient(135deg, #ffffff 40%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    PROHORI AI ("প্রহরী")
                </div>
                
                <div style="font-size: 21px; font-weight: 600; color: #cbd5e1; margin-bottom: 24px; line-height: 1.35;">
                    Self-Hostable Bilingual AI SOC Analyst for Sovereign Cyber Defense
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; text-align: left;">
                    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px;">
                        <div style="color: #38bdf8; font-size: 11px; font-weight: 800; text-transform: uppercase;">1. Problem Solved</div>
                        <div style="color: #f1f5f9; font-size: 13px; font-weight: 600; margin-top: 4px;">Zero Cloud Data Egress</div>
                    </div>
                    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px;">
                        <div style="color: #38bdf8; font-size: 11px; font-weight: 800; text-transform: uppercase;">2. AI Approach</div>
                        <div style="color: #f1f5f9; font-size: 13px; font-weight: 600; margin-top: 4px;">Offline RAG + MITRE Citations</div>
                    </div>
                    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px;">
                        <div style="color: #38bdf8; font-size: 11px; font-weight: 800; text-transform: uppercase;">3. Linguistic Parity</div>
                        <div style="color: #f1f5f9; font-size: 13px; font-weight: 600; margin-top: 4px;">Native Bangla ↔ English</div>
                    </div>
                </div>

                <div style="font-size: 13px; color: #64748b; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                    International AI Builders Congress 2026 // Team Orionids (DIU)
                </div>
            </div>
        `;
        document.body.appendChild(splash);
    }""")


async def hide_opening_splash(page):
    """Smoothly fade out the opening title splash."""
    if not SHOW_TITLES:
        return
    await page.evaluate("""() => {
        const splash = document.getElementById("prohori-opening-splash");
        if (splash) {
            splash.style.opacity = "0";
            setTimeout(() => splash.remove(), 800);
        }
    }""")


async def update_banner(page, time_tag: str, segment: str, title: str, key_message: str):
    """Render a structured, clean evaluator banner matching the reference layout."""
    if not SHOW_TITLES:
        return
    await page.evaluate("""({time_tag, segment, title, key_message}) => {
        let el = document.getElementById("prohori-demo-banner");
        if (!el) {
            el = document.createElement("div");
            el.id = "prohori-demo-banner";
            el.style.position = "fixed";
            el.style.bottom = "32px";
            el.style.left = "50%";
            el.style.transform = "translateX(-50%)";
            el.style.backgroundColor = "rgba(11, 16, 27, 0.96)";
            el.style.border = "1px solid rgba(56, 189, 248, 0.4)";
            el.style.boxShadow = "0 14px 35px rgba(0, 0, 0, 0.85), 0 0 25px rgba(56, 189, 248, 0.25)";
            el.style.borderRadius = "14px";
            el.style.padding = "10px 24px";
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.gap = "18px";
            el.style.zIndex = "9999999";
            el.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            el.style.color = "#ffffff";
            el.style.backdropFilter = "blur(14px)";
            el.style.pointerEvents = "none";
            document.body.appendChild(el);
        }
        el.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 3px;">
                <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.45); color: #38bdf8; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 5px; font-family: monospace; letter-spacing: 0.5px; white-space: nowrap;">${time_tag} · ${segment}</div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 0.4px; margin-top: 1px;">KEY MESSAGE:</div>
            </div>
            <div style="height: 38px; width: 1px; background: rgba(255, 255, 255, 0.15);"></div>
            <div style="display: flex; flex-direction: column;">
                <div style="font-size: 16.5px; font-weight: 800; color: #ffffff; line-height: 1.25; letter-spacing: -0.2px;">${title}</div>
                <div style="font-size: 12.5px; color: #38bdf8; font-weight: 600; line-height: 1.25; margin-top: 3px;">"${key_message}"</div>
            </div>
        `;
    }""", {"time_tag": time_tag, "segment": segment, "title": title, "key_message": key_message})


async def smooth_scroll(page, delta_y: int, steps: int = 15, delay: float = 0.05):
    """Simulate smooth human operator scrolling."""
    step_y = delta_y / steps
    for _ in range(steps):
        await page.mouse.wheel(0, step_y)
        await asyncio.sleep(delay)


async def record_demo():
    mode_label = "Version 1 (With Title & Layout Cards)" if SHOW_TITLES else "Version 2 (Without Title - Clean 4K)"
    print("============================================================")
    print("PROHORI AI - 4K ULTRA HD (2160p / 3840x2160) VIDEO RECORDER")
    print(f"Mode: {mode_label}")
    print("Target Duration: 120-150 seconds (~2m 20s)")
    print(f"Target URL: {TARGET_URL}")
    print(f"Output Directory: {BACKUP_DIR}")
    print("============================================================")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            channel="chrome",
            headless=True,
            args=[
                "--start-maximized",
                "--disable-infobars",
                "--force-device-scale-factor=2",
                "--high-dpi-support=1"
            ]
        )

        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2,
            record_video_dir=str(BACKUP_DIR),
            record_video_size={"width": 3840, "height": 2160},
            permissions=["clipboard-read", "clipboard-write"]
        )

        page = await context.new_page()

        # ------------------------------------------------------------------
        # SECTION 1: Problem (The Vibe) [0:00 - 0:18] (18s)
        # ------------------------------------------------------------------
        print("\n[1/8] Opening Prohori AI Operator Console in 4K...")
        await page.goto(TARGET_URL, wait_until="domcontentloaded")
        await apply_fullwidth_responsive_styles(page)

        if SHOW_TITLES:
            # Show pitch card splash for 4.5 seconds
            await show_opening_splash(page)
            await asyncio.sleep(4.5)
            await hide_opening_splash(page)
            await asyncio.sleep(1.0)
            await update_banner(
                page,
                time_tag="0:00–0:18",
                segment="PROBLEM",
                title='The Sovereign Challenge & Prohori Mission',
                key_message="This problem matters: Foreign cloud SIEMs leak sensitive national telemetry"
            )
            await asyncio.sleep(3.5)
        else:
            await asyncio.sleep(9.0)

        # Smooth scroll down to examine initial status
        await smooth_scroll(page, 320, steps=15, delay=0.08)
        await asyncio.sleep(3)
        # Smooth scroll back up
        await smooth_scroll(page, -320, steps=15, delay=0.08)
        await asyncio.sleep(3)

        # ------------------------------------------------------------------
        # SECTION 2: Solution & Network Asset Discovery [0:18 - 0:38] (20s)
        # ------------------------------------------------------------------
        print("[2/8] Showcasing Layer-2 Network Asset Discovery...")
        await update_banner(
            page,
            time_tag="0:18–0:38",
            segment="SOLUTION",
            title="Automated Layer-2 Network Asset Discovery",
            key_message="This is how we solve it: Zero-agent live ARP broadcast host inventory"
        )
        await asyncio.sleep(1)

        btn_dev = page.locator('header button:has-text("Device")').first
        if await btn_dev.count() > 0:
            await btn_dev.hover()
            await asyncio.sleep(1)
            await btn_dev.click()
            await asyncio.sleep(4)

            # Click Scan LAN
            scan_btn = page.locator('button:has-text("Scan LAN"), button:has-text("স্ক্যান")').first
            if await scan_btn.count() > 0:
                await scan_btn.hover()
                await asyncio.sleep(1)
                await scan_btn.click()
                print("     Triggered active ARP network sweep...")
                await asyncio.sleep(8)

            # Close modal
            close_btn = page.locator('button:has-text("Close"), button[aria-label="Close"], button[aria-label="বন্ধ করুন"]').first
            if await close_btn.count() > 0:
                await close_btn.click()
                await asyncio.sleep(3)

        # ------------------------------------------------------------------
        # SECTION 3: Live Demo / Multi-Sensor Threat Ingestion [0:38 - 0:56] (18s)
        # ------------------------------------------------------------------
        print("[3/8] Triggering multi-sensor live attack detection sequence...")
        await update_banner(
            page,
            time_tag="0:38–0:56",
            segment="DEMO FLOW",
            title="Multi-Sensor Edge Ingestion & WebSocket Stream",
            key_message="This is how it works: Deception honeypot + rate limiter trigger sub-35ms alerts"
        )
        await asyncio.sleep(1)

        btn_demo = page.locator('header button:has-text("Run demo")').first
        if await btn_demo.count() > 0:
            await btn_demo.hover()
            await asyncio.sleep(1)
            await btn_demo.click()
            print("     Emitting multi-sensor telemetry...")
            await asyncio.sleep(8)

        # Smooth scroll through incoming alerts
        await smooth_scroll(page, 250, steps=12, delay=0.08)
        await asyncio.sleep(4)
        await smooth_scroll(page, -250, steps=12, delay=0.08)
        await asyncio.sleep(2)

        # ------------------------------------------------------------------
        # SECTION 4: AI Approach / Grounded Triage & MITRE [0:56 - 1:18] (22s)
        # ------------------------------------------------------------------
        print("[4/8] Inspecting AI Security Analysis & MITRE grounding...")
        await update_banner(
            page,
            time_tag="0:56–1:18",
            segment="AI APPROACH",
            title="Offline RAG & MITRE ATT&CK [T1110.001] Citations",
            key_message="This is real AI thinking: Zero hallucinations, mandatory verified technique IDs"
        )
        await asyncio.sleep(1)

        alert_cards = page.locator('article.alert-feed-item')
        if await alert_cards.count() > 0:
            await alert_cards.first.hover()
            await asyncio.sleep(1)
            await alert_cards.first.click()
            await asyncio.sleep(5)

        # Scroll down in the incident detail view to inspect evidence and citations
        await smooth_scroll(page, 320, steps=15, delay=0.08)
        await asyncio.sleep(5)
        # Inspect MITRE technique citations
        await smooth_scroll(page, 200, steps=10, delay=0.08)
        await asyncio.sleep(6)

        # ------------------------------------------------------------------
        # SECTION 5: Localization / 100% Native Bengali Parity [1:18 - 1:38] (20s)
        # ------------------------------------------------------------------
        print("[5/8] Demonstrating native Bengali linguistic parity...")
        await smooth_scroll(page, -520, steps=18, delay=0.05)
        await asyncio.sleep(1)

        await update_banner(
            page,
            time_tag="1:18–1:38",
            segment="LOCALIZATION",
            title="100% Native Bengali Linguistic Parity (বাংলা ↔ English)",
            key_message="Accessible AI defense: Plain-language narratives empowering local operators"
        )
        await asyncio.sleep(1)

        btn_lang = page.locator('button[aria-label="বাংলায় পরিবর্তন করুন"]').first
        if await btn_lang.count() > 0:
            await btn_lang.hover()
            await asyncio.sleep(1)
            await btn_lang.click()
            print("     Switched interface to Bengali (বাংলা)...")
            await asyncio.sleep(7)

            # Scroll through Bengali translations
            await smooth_scroll(page, 280, steps=12, delay=0.08)
            await asyncio.sleep(4)
            await smooth_scroll(page, -280, steps=12, delay=0.08)
            await asyncio.sleep(2)

            # Switch back to English
            btn_en = page.locator('button[aria-label="Switch to English"]').first
            if await btn_en.count() > 0:
                await btn_en.hover()
                await asyncio.sleep(1)
                await btn_en.click()
                print("     Switched interface back to English...")
                await asyncio.sleep(2)

        # ------------------------------------------------------------------
        # SECTION 6: Safety / Human-in-the-Loop Containment [1:38 - 1:56] (18s)
        # ------------------------------------------------------------------
        print("[6/8] Executing Human-in-the-Loop containment approval...")
        await update_banner(
            page,
            time_tag="1:38–1:56",
            segment="SAFETY GATE",
            title="Human-in-the-Loop Active Containment Approval",
            key_message="Responsible AI: Surgical iptables containment requiring explicit human sign-off"
        )
        await asyncio.sleep(1)

        # Scroll down to the recommended countermeasures
        await smooth_scroll(page, 450, steps=15, delay=0.08)
        await asyncio.sleep(3)

        btn_approve = page.locator('button:has-text("Approve Defense"), button:has-text("প্রতিরক্ষা অনুমোদন")').first
        if await btn_approve.count() > 0:
            await btn_approve.scroll_into_view_if_needed()
            await asyncio.sleep(2)
            await btn_approve.hover()
            await asyncio.sleep(1)
            await btn_approve.click()
            print("     Operator approved surgical defense containment!")
            await asyncio.sleep(8)

        # ------------------------------------------------------------------
        # SECTION 7: Auditability / Cryptographic Audit Trail [1:56 - 2:12] (16s)
        # ------------------------------------------------------------------
        print("[7/8] Inspecting append-only Audit Trail...")
        await smooth_scroll(page, -450, steps=15, delay=0.05)
        await asyncio.sleep(1)

        await update_banner(
            page,
            time_tag="1:56–2:12",
            segment="AUDIT TRAIL",
            title="Cryptographic Append-Only Compliance Ledger",
            key_message="Accountability: Immutable audit trail logging prompts, citations & operator IDs"
        )
        await asyncio.sleep(1)

        btn_more = page.locator('header button:has-text("More")').first
        if await btn_more.count() > 0:
            await btn_more.click()
            await asyncio.sleep(1)
            btn_audit = page.locator('button:has-text("Audit Trail")').first
            if await btn_audit.count() > 0:
                await btn_audit.click()
                await asyncio.sleep(4)

                # Scroll through audit log records
                await smooth_scroll(page, 300, steps=12, delay=0.08)
                await asyncio.sleep(4)

                # Close audit
                btn_close_audit = page.locator('button:has-text("Close"), button[aria-label="Close"]').first
                if await btn_close_audit.count() > 0:
                    await btn_close_audit.click()
                    await asyncio.sleep(2)

        # ------------------------------------------------------------------
        # SECTION 8: Impact & Vision [2:12 - 2:20] (8s)
        # ------------------------------------------------------------------
        print("[8/8] Previewing embedded Pitch Deck modal...")
        await update_banner(
            page,
            time_tag="2:12–2:20",
            segment="IMPACT & SCALE",
            title="National Cybersecurity Sovereignty & Scalability",
            key_message="We can build and scale this: Deployable in 5 mins on commodity hardware"
        )
        await asyncio.sleep(1)

        btn_more = page.locator('header button:has-text("More")').first
        if await btn_more.count() > 0:
            await btn_more.click()
            await asyncio.sleep(1)
            btn_deck = page.locator('button:has-text("Pitch Deck")').first
            if await btn_deck.count() > 0:
                await btn_deck.click()
                await asyncio.sleep(4)
                btn_close_deck = page.locator('button:has-text("Close"), button[aria-label="Close"]').first
                if await btn_close_deck.count() > 0:
                    await btn_close_deck.click()
                    await asyncio.sleep(2)

        # Final clean frame
        await asyncio.sleep(2)

        # Save video
        video = page.video
        await page.close()
        await context.close()
        video_path = await video.path() if video else None
        print(f"\n[+] Raw recorded video: {video_path}")
        await browser.close()

    # Move/standardize video name
    if video_path and os.path.exists(video_path):
        if not SHOW_TITLES:
            target_webm = BACKUP_DIR / "prohori_demo_without_titles_4k.webm"
            target_mp4 = BACKUP_DIR / "prohori_demo_without_titles_4k.mp4"
            shutil.copyfile(video_path, target_webm)
            shutil.copyfile(video_path, target_mp4)
            size_mb = os.path.getsize(target_webm) / (1024 * 1024)
            print(f"\n[SUCCESS] Version 2 (Without Titles) 4K Ultra HD Demo video saved!")
            print(f"  - WebM: {target_webm} ({size_mb:.2f} MB)")
            print(f"  - MP4:  {target_mp4} ({size_mb:.2f} MB)")
        else:
            target_webm = BACKUP_DIR / "prohori_demo_with_titles_4k.webm"
            target_mp4 = BACKUP_DIR / "prohori_demo_with_titles_4k.mp4"
            shutil.copyfile(video_path, target_webm)
            shutil.copyfile(video_path, target_mp4)
            size_mb = os.path.getsize(target_webm) / (1024 * 1024)
            print(f"\n[SUCCESS] Version 1 (With Opening Title & Subtitles) 4K Ultra HD Demo video saved!")
            print(f"  - WebM: {target_webm} ({size_mb:.2f} MB)")
            print(f"  - MP4:  {target_mp4} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    asyncio.run(record_demo())
