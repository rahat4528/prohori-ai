"""
Prohori AI - Live UI & Full Interactive Feature Verifier
Automates browser testing against the live deployed application https://prohori-ai.vercel.app,
tests every core interactive feature, and captures step-by-step screenshots.
"""

import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
SCREENSHOTS_DIR = ROOT / "docs" / "screenshots" / "live_verification"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

TARGET_URL = "https://prohori-ai.vercel.app"

async def run_live_verification():
    print("============================================================")
    print("PROHORI AI - LIVE CONSOLE VERIFICATION & AUTOMATED QA")
    print(f"Target URL: {TARGET_URL}")
    print(f"Output Screenshots: {SCREENSHOTS_DIR}")
    print("============================================================")

    results = []
    console_errors = []

    def log_result(step_name: str, passed: bool, details: str):
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {step_name}: {details}")
        results.append({"step": step_name, "passed": passed, "details": details})

    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=True)
        context = await browser.new_context(
            viewport={"width": 1600, "height": 950},
            permissions=["clipboard-read", "clipboard-write"]
        )

        page = await context.new_page()

        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)

        # ---------------------------------------------------------
        # STEP 1: Initial Navigation & Page Load
        # ---------------------------------------------------------
        print("\n[*] Navigating to live deployment...")
        resp = await page.goto(TARGET_URL, wait_until="networkidle", timeout=30000)
        await asyncio.sleep(2)
        title = await page.title()
        status_code = resp.status if resp else 0

        step1_pass = (status_code == 200 and "Prohori" in title)
        log_result("1. Initial Page Load", step1_pass, f"HTTP {status_code}, Title: '{title}'")
        await page.screenshot(path=str(SCREENSHOTS_DIR / "01_initial_load.png"))

        # ---------------------------------------------------------
        # STEP 2: Header Brand & Operational Badges Check
        # ---------------------------------------------------------
        brand_locator = page.locator("header")
        run_demo_btn = page.locator("button:has-text('Run demo'), button:has-text('ডেমো চালান')").first
        sovereign_badge = page.locator("header").locator("text=/Sovereign RAG|সার্বভৌম/").first

        has_brand = await brand_locator.count() > 0
        has_run_demo = await run_demo_btn.count() > 0
        has_sovereign = await sovereign_badge.count() > 0

        log_result(
            "2. Command Header Elements",
            has_brand and has_run_demo and has_sovereign,
            f"Brand: {has_brand}, Run Demo Button: {has_run_demo}, Sovereign Engine Badge: {has_sovereign}"
        )

        # ---------------------------------------------------------
        # STEP 3: Trigger Live Demo Alerts
        # ---------------------------------------------------------
        print("\n[*] Triggering 'Run demo' button to inject diverse simulated attack events...")
        await run_demo_btn.click()
        await asyncio.sleep(1.5)
        post_click_count = await page.locator("article.alert-feed-item").count()

        # Check for multiple severity labels with geometric shapes
        critical_items = await page.locator("article.alert-feed-item:has-text('Critical'), article.alert-feed-item:has-text('জরুরি')").count()
        high_items = await page.locator("article.alert-feed-item:has-text('High'), article.alert-feed-item:has-text('উচ্চ')").count()
        medium_items = await page.locator("article.alert-feed-item:has-text('Medium'), article.alert-feed-item:has-text('মাঝারি')").count()
        low_items = await page.locator("article.alert-feed-item:has-text('Low'), article.alert-feed-item:has-text('নিম্ন')").count()

        step3_pass = post_click_count > 0 and (critical_items > 0 or high_items > 0 or medium_items > 0)
        log_result(
            "3. Live Demo Trigger & Alert Feed",
            step3_pass,
            f"Alerts in Feed: {post_click_count} (Critical: {critical_items}, High: {high_items}, Medium: {medium_items}, Low: {low_items})"
        )
        await page.screenshot(path=str(SCREENSHOTS_DIR / "02_alerts_feed_populated.png"))

        # ---------------------------------------------------------
        # STEP 4: Select an Alert & Verify Master Incident Dossier
        # ---------------------------------------------------------
        print("\n[*] Selecting first alert to inspect Master Incident Dossier...")
        first_alert = page.locator("article.alert-feed-item").first
        await first_alert.click()
        await asyncio.sleep(1)

        dossier_region = page.locator("div[role='region']").first
        dossier_headline = dossier_region.locator("h2").first
        headline_text = await dossier_headline.inner_text() if await dossier_headline.count() > 0 else ""

        # Check Telemetry Grid items
        has_ip = await dossier_region.locator("text=/Originating IP|উৎস আইপি/").count() > 0
        has_surface = await dossier_region.locator("text=/Target Surface|লক্ষ্য পৃষ্ঠ/").count() > 0
        has_volume = await dossier_region.locator("text=/Observed Volume|উইন্ডোতে প্রচেষ্টার সংখ্যা/").count() > 0

        step4_pass = (await dossier_headline.count() > 0 and has_ip and has_surface and has_volume)
        log_result(
            "4. Master Incident Dossier View",
            step4_pass,
            f"Headline: '{headline_text}', Telemetry Grid: (IP: {has_ip}, Surface: {has_surface}, Volume: {has_volume})"
        )
        await page.screenshot(path=str(SCREENSHOTS_DIR / "03_incident_dossier.png"))

        # ---------------------------------------------------------
        # STEP 5: Test Bilingual Narrative Toggle (EN <-> BN)
        # ---------------------------------------------------------
        print("\n[*] Testing Bilingual Language Toggle inside the Dossier...")
        bn_toggle_btn = page.locator("button.segmented-btn:has-text('বাংলা')").first
        en_toggle_btn = page.locator("button.segmented-btn:has-text('English')").first

        narrative_p = dossier_region.locator("p").first
        text_en = await narrative_p.inner_text() if await narrative_p.count() > 0 else ""

        await bn_toggle_btn.click()
        await asyncio.sleep(0.8)
        text_bn = await narrative_p.inner_text() if await narrative_p.count() > 0 else ""

        # Switch back to English
        await en_toggle_btn.click()
        await asyncio.sleep(0.5)

        step5_pass = (text_en != text_bn and len(text_bn) > 10)
        log_result(
            "5. Bilingual Narrative Toggle",
            step5_pass,
            f"EN snippet: '{text_en[:45]}...' | BN snippet: '{text_bn[:45]}...'"
        )
        await page.screenshot(path=str(SCREENSHOTS_DIR / "04_bilingual_toggle.png"))

        # ---------------------------------------------------------
        # STEP 6: Test Platform Firewall Rules & Copy Interaction
        # ---------------------------------------------------------
        print("\n[*] Testing Firewall Rules by Platform (iptables, UFW, Cisco ACL)...")
        copy_btns = dossier_region.locator("button:has-text('Copy Command'), button:has-text('কমান্ড কপি')")
        copy_count = await copy_btns.count()

        copied_feedback_seen = False
        if copy_count > 0:
            first_copy = copy_btns.first
            await first_copy.click()
            await asyncio.sleep(0.5)
            copied_badge = dossier_region.locator("text=/Copied!|কপি হয়েছে!/").first
            copied_feedback_seen = (await copied_badge.count() > 0)

        step6_pass = (copy_count >= 3 and copied_feedback_seen)
        log_result(
            "6. Platform Firewall Rules & Copy Interaction",
            step6_pass,
            f"Platforms found: {copy_count}, Copy Visual Feedback: {copied_feedback_seen}"
        )

        # ---------------------------------------------------------
        # STEP 7: Test Human-in-the-Loop Containment Gate
        # ---------------------------------------------------------
        print("\n[*] Testing Human-in-the-Loop Containment Approval Gate...")
        approve_btn = dossier_region.locator("button:has-text('Approve Defense'), button:has-text('প্রতিরক্ষা অনুমোদন')").first
        has_approve = await approve_btn.count() > 0

        hitl_pass = False
        audit_details = ""
        if has_approve:
            await approve_btn.click()
            await asyncio.sleep(0.6)

            # Confirm step
            confirm_btn = dossier_region.locator("button:has-text('Confirm Containment'), button:has-text('হ্যাঁ, ব্লক কার্যকর করুন')").first
            if await confirm_btn.count() > 0:
                print("    - Operator confirmation modal presented. Confirming containment...")
                await confirm_btn.click()
                await asyncio.sleep(1.2)

                # Check for verified active status
                verified_card = dossier_region.locator("text=/Defense Verified|সফলভাবে কার্যকর/").first
                audit_id_elem = dossier_region.locator("text=Audit ID:").first
                action_id_elem = dossier_region.locator("text=Action ID:").first

                if await verified_card.count() > 0:
                    hitl_pass = True
                    audit_details = f"Verified: True, Action ID present: {await action_id_elem.count() > 0}, Audit ID present: {await audit_id_elem.count() > 0}"

        log_result(
            "7. Human-in-the-Loop Containment Gate & Audit Record",
            hitl_pass,
            audit_details if hitl_pass else "Approval button or confirmation modal not found"
        )
        await page.screenshot(path=str(SCREENSHOTS_DIR / "05_hitl_approved_state.png"))

        # ---------------------------------------------------------
        # STEP 8: Test Grounded Knowledge Citations Expansion
        # ---------------------------------------------------------
        print("\n[*] Testing Grounded Knowledge Citations expandable cards...")
        citation_card_btns = dossier_region.locator("button:has-text('Details'), button:has-text('বিস্তারিত')")
        cite_count = await citation_card_btns.count()

        expand_pass = False
        if cite_count > 0:
            first_cite = citation_card_btns.first
            await first_cite.click()
            await asyncio.sleep(0.5)

            mitigation_text = dossier_region.locator("text=Recommended Mitigation:").first
            expand_pass = (await mitigation_text.count() > 0)

        log_result(
            "8. Grounded Knowledge Citations (Expandable Details)",
            expand_pass,
            f"Citation Cards: {cite_count}, Mitigation Details Expanded: {expand_pass}"
        )
        await page.screenshot(path=str(SCREENSHOTS_DIR / "06_citation_expanded.png"))

        # ---------------------------------------------------------
        # STEP 9: Test 'Ask AI Analyst' Consultation
        # ---------------------------------------------------------
        print("\n[*] Testing 'Ask AI Analyst' with quick prompt chip...")
        prompt_chip = dossier_region.locator("button:has-text('Primary vector?'), button:has-text('প্রাথমিক ভেক্টর?')").first
        ask_pass = False
        analyst_response_snippet = ""

        if await prompt_chip.count() > 0:
            await prompt_chip.click()
            # Wait for thinking / answering
            await asyncio.sleep(2.5)

            analyst_resp_box = page.locator("div[aria-label='AI Analyst Response'], div[aria-label='এআই বিশ্লেষকের উত্তর']").first
            if await analyst_resp_box.count() > 0:
                ask_pass = True
                analyst_response_snippet = (await analyst_resp_box.inner_text())[:80].replace("\n", " ")

        log_result(
            "9. Ask AI Analyst Consultation & Response",
            ask_pass,
            f"Analyst Answer Box Rendered: {ask_pass} -> '{analyst_response_snippet}...'"
        )
        await page.screenshot(path=str(SCREENSHOTS_DIR / "07_ask_analyst_answered.png"))

        # ---------------------------------------------------------
        # STEP 10: Test Header 'More' Dropdown & Pitch Deck Modal
        # ---------------------------------------------------------
        print("\n[*] Testing Header 'More' Dropdown Menu and Pitch Deck Modal...")
        more_btn = page.locator("button:has-text('More'), button:has-text('অন্যান্য')").first
        modal_pass = False

        if await more_btn.count() > 0:
            await more_btn.click()
            await asyncio.sleep(0.5)

            # Click Pitch Deck
            pitch_deck_item = page.locator("button:has-text('Pitch Deck'), button:has-text('পিচ ডেক')").first
            if await pitch_deck_item.count() > 0:
                await pitch_deck_item.click()
                await asyncio.sleep(1)

                pitch_modal = page.locator("text=/The Cybersecurity Crisis|উন্নয়নশীল অর্থনীতির/").first
                slide_counter = page.locator("text=/Slide 1 of 8|স্লাইড ১ এর ৮/").first
                if await pitch_modal.count() > 0 and await slide_counter.count() > 0:
                    modal_pass = True

                await page.screenshot(path=str(SCREENSHOTS_DIR / "08_pitch_deck_modal.png"))

                # Close modal
                close_btn = page.locator("button:has-text('Close'), button[aria-label='Close Pitch Deck modal']").first
                if await close_btn.count() > 0:
                    await close_btn.click()
                    await asyncio.sleep(0.5)

        log_result(
            "10. Pitch Deck Modal & Slide Navigation",
            modal_pass,
            f"8-Slide Deck Rendered: {modal_pass}"
        )

        # ---------------------------------------------------------
        # Clean up
        # ---------------------------------------------------------
        await context.close()
        await browser.close()

    print("\n============================================================")
    print(f"VERIFICATION SUMMARY: {sum(1 for r in results if r['passed'])}/{len(results)} Passed")
    print(f"Screenshots saved to: {SCREENSHOTS_DIR}")
    print("============================================================")

    return results

if __name__ == "__main__":
    asyncio.run(run_live_verification())
