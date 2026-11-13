"""
Runtime Palette Verification for Prohori AI using Playwright.

Inspects getComputedStyle on rendered DOM elements on the main screen,
verifying that background-color, color, and border-color resolve strictly
to the approved 90/10 palette:
  • Navy:   rgb(20, 33, 61) / rgba(20, 33, 61, ...)
  • Cream: rgb(244, 237, 224) / rgba(244, 237, 224, ...)
  • Coral: rgb(255, 98, 88) / rgba(255, 98, 88, ...)
"""
import re
import sys

from playwright.sync_api import sync_playwright

ALLOWED_RGB = [
    (20, 33, 61),      # Navy #14213D
    (244, 237, 224),   # Cream #F4EDE0
    (255, 98, 88),     # Coral #FF6258
]

RGBA_PATTERN = re.compile(r"rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+)\s*)?\)")
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def is_valid_color(color_str):
    if not color_str or color_str in ("transparent", "none", "inherit", "initial", "unset"):
        return True
    m = RGBA_PATTERN.match(color_str.strip())
    if not m:
        return False
    r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
    alpha = float(m.group(4)) if m.group(4) is not None else 1.0

    # Fully transparent elements are valid
    if alpha == 0:
        return True

    # Otherwise must match one of the 3 approved base hues
    for ar, ag, ab in ALLOWED_RGB:
        if (r, g, b) == (ar, ag, ab):
            return True
    return False


def run_check():
    print("Connecting to live console at http://localhost:3000...")
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        except Exception:
            browser = p.chromium.launch(headless=True)

        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        try:
            page.goto("http://localhost:3000", wait_until="networkidle", timeout=10000)
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"Error loading page: {e}")
            browser.close()
            sys.exit(1)

        # Inspect all rendered elements in DOM
        elements_data = page.evaluate("""() => {
            const results = [];
            const skipTags = ['SCRIPT', 'STYLE', 'META', 'HEAD', 'LINK', 'TITLE', 'PATH', 'CIRCLE', 'POLYGON', 'POLYLINE', 'LINE', 'G', 'RECT'];
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                if (skipTags.includes(el.tagName)) continue;
                const style = window.getComputedStyle(el);
                
                // Only evaluate border color if border is actually rendered
                const hasTopBorder = style.borderTopStyle !== 'none' && style.borderTopWidth !== '0px';
                const hasRightBorder = style.borderRightStyle !== 'none' && style.borderRightWidth !== '0px';
                const hasBottomBorder = style.borderBottomStyle !== 'none' && style.borderBottomWidth !== '0px';
                const hasLeftBorder = style.borderLeftStyle !== 'none' && style.borderLeftWidth !== '0px';

                results.push({
                    tag: el.tagName.toLowerCase(),
                    className: typeof el.className === 'string' ? el.className : '',
                    id: el.id || '',
                    bg: style.backgroundColor,
                    color: style.color,
                    borderTopColor: hasTopBorder ? style.borderTopColor : 'transparent',
                    borderRightColor: hasRightBorder ? style.borderRightColor : 'transparent',
                    borderBottomColor: hasBottomBorder ? style.borderBottomColor : 'transparent',
                    borderLeftColor: hasLeftBorder ? style.borderLeftColor : 'transparent',
                });
            }
            return results;
        }""")

        total_inspected = len(elements_data)
        violations = []

        for item in elements_data:
            identifier = f"<{item['tag']} class='{item['className']}' id='{item['id']}'>"
            for prop in ["bg", "color", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"]:
                val = item[prop]
                if not is_valid_color(val):
                    violations.append((identifier, prop, val))

        print("=" * 60)
        print("PROHORI AI — RUNTIME COMPUTED PALETTE AUDIT")
        print(f"Inspected rendered DOM elements: {total_inspected}")
        print("=" * 60)

        if not violations:
            print("[PASS] 100% Runtime Palette Compliance!")
            print("Every rendered element resolves strictly to Navy, Cream, Coral, or transparent.")
            browser.close()
            sys.exit(0)
        else:
            print(f"[FAIL] Found {len(violations)} runtime style violations:")
            for ident, prop, val in violations[:20]:
                print(f"  {ident} -> {prop}: {val}")
            if len(violations) > 20:
                print(f"  ... and {len(violations) - 20} more violations.")
            browser.close()
            sys.exit(1)


if __name__ == "__main__":
    run_check()
