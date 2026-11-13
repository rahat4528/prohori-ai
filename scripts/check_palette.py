"""
Strict 90/10 Palette Enforcement Linter for Prohori AI

Verifies that source files use ONLY the three approved palette colors
and their designated alpha derivations:
  • Primary Navy:   #14213D / rgb(20, 33, 61)
  • Secondary Cream: #F4EDE0 / rgb(244, 237, 224)
  • Accent Coral:   #FF6258 / rgb(255, 98, 88)

Zero external colors, grays, blues, or reds allowed.
"""
import glob
import os
import re
import sys

ALLOWED_HEX = {"#14213d", "#f4ede0", "#ff6258"}

ALLOWED_RGB_BASES = [
    (20, 33, 61),      # Navy
    (244, 237, 224),   # Cream
    (255, 98, 88),     # Coral
]

HEX_REGEX = re.compile(r"#(?:[0-9a-fA-F]{3}){1,2}\b")
RGBA_REGEX = re.compile(r"rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+)\s*)?\)")


def check_file(filepath):
    errors = []
    with open(filepath, encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    for line_num, line in enumerate(lines, start=1):
        # Ignore comments if in css
        clean_line = line.strip()
        if clean_line.startswith("/*") and clean_line.endswith("*/"):
            continue

        # 1. Check Hex codes
        hex_matches = HEX_REGEX.findall(line)
        for h in hex_matches:
            # allow 3-digit shorthand if it maps to allowed, but here only 6-digit is used
            h_lower = h.lower()
            if h_lower not in ALLOWED_HEX:
                errors.append((line_num, f"Unapproved hex color '{h}'"))

        # 2. Check RGB / RGBA codes
        rgba_matches = RGBA_REGEX.finditer(line)
        for m in rgba_matches:
            r = int(m.group(1))
            g = int(m.group(2))
            b = int(m.group(3))
            is_valid_base = False
            for ar, ag, ab in ALLOWED_RGB_BASES:
                if (r, g, b) == (ar, ag, ab):
                    is_valid_base = True
                    break
            if not is_valid_base:
                errors.append((line_num, f"Unapproved RGB/RGBA values '{m.group(0)}'"))

    return errors


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_patterns = [
        os.path.join(root, "web", "src", "**", "*.tsx"),
        os.path.join(root, "web", "src", "**", "*.ts"),
        os.path.join(root, "web", "src", "**", "*.css"),
        os.path.join(root, "web", "index.html"),
    ]

    files = []
    for pat in target_patterns:
        files.extend(glob.glob(pat, recursive=True))

    total_checked = len(files)
    total_violations = 0
    violation_report = {}

    for f in sorted(files):
        errs = check_file(f)
        if errs:
            total_violations += len(errs)
            rel_path = os.path.relpath(f, root)
            violation_report[rel_path] = errs

    print("=" * 60)
    print("PROHORI AI — STRICT 90/10 PALETTE STATIC AUDIT")
    print(f"Scanned: {total_checked} source files")
    print("Allowed Palette: #14213D (Navy), #F4EDE0 (Cream), #FF6258 (Coral)")
    print("=" * 60)

    if total_violations == 0:
        print("[PASS] 100% Palette Compliance! Zero unauthorized colors detected.")
        sys.exit(0)
    else:
        print(f"[FAIL] Found {total_violations} unauthorized color occurrences:\n")
        for rel_path, errs in violation_report.items():
            print(f"File: {rel_path}")
            for lnum, msg in errs:
                print(f"  Line {lnum}: {msg}")
            print()
        sys.exit(1)


if __name__ == "__main__":
    main()
