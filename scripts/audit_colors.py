"""
Color Audit Tool for Prohori AI
Scans web/src, index.html, scripts/generate_pitch_deck.py, etc.
Extracts every color occurrence, file, line, and context.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

HEX_REGEX = re.compile(r'#([0-9a-fA-F]{3,8})\b')
RGB_REGEX = re.compile(r'rgba?\([^\)]+\)')
HSL_REGEX = re.compile(r'hsla?\([^\)]+\)')
NAMED_COLORS = [
    "red", "green", "blue", "yellow", "orange", "purple", "cyan", "magenta",
    "white", "black", "gray", "grey"
]
NAMED_REGEX = re.compile(r'\b(' + '|'.join(NAMED_COLORS) + r')\b', re.IGNORECASE)

EXCLUDE_DIRS = {".git", "node_modules", ".venv", "dist", "build", "__pycache__"}

def scan_files():
    targets = [
        ROOT / "web" / "src",
        ROOT / "web" / "index.html",
        ROOT / "scripts" / "generate_pitch_deck.py"
    ]

    findings = []

    for target in targets:
        if target.is_file():
            files = [target]
        else:
            files = [p for p in target.rglob("*") if p.is_file() and p.suffix in {".tsx", ".ts", ".css", ".html", ".py"}]

        for f in files:
            # Skip excluded
            if any(part in EXCLUDE_DIRS for part in f.parts):
                continue

            try:
                content = f.read_text(encoding="utf-8")
            except Exception:
                continue

            lines = content.splitlines()
            for line_idx, line in enumerate(lines, 1):
                # Look for hex
                for m in HEX_REGEX.finditer(line):
                    val = "#" + m.group(1)
                    findings.append({
                        "file": str(f.relative_to(ROOT)).replace("\\", "/"),
                        "line": line_idx,
                        "type": "hex",
                        "value": val,
                        "context": line.strip()
                    })

                # Look for rgb/rgba
                for m in RGB_REGEX.finditer(line):
                    findings.append({
                        "file": str(f.relative_to(ROOT)).replace("\\", "/"),
                        "line": line_idx,
                        "type": "rgb",
                        "value": m.group(0),
                        "context": line.strip()
                    })

                # Look for hsl
                for m in HSL_REGEX.finditer(line):
                    findings.append({
                        "file": str(f.relative_to(ROOT)).replace("\\", "/"),
                        "line": line_idx,
                        "type": "hsl",
                        "value": m.group(0),
                        "context": line.strip()
                    })

    return findings

def main():
    findings = scan_files()
    print(f"Total color occurrences found before replacement: {len(findings)}")

    # Distinct values
    distinct_hex = sorted(list(set(f["value"].upper() for f in findings if f["type"] == "hex")))
    distinct_rgb = sorted(list(set(f["value"] for f in findings if f["type"] == "rgb")))

    print("\nDistinct Hex colors:")
    for h in distinct_hex:
        count = sum(1 for f in findings if f["value"].upper() == h)
        print(f"  {h}: {count} occurrences")

    print("\nDistinct RGB/RGBA colors:")
    for r in distinct_rgb:
        count = sum(1 for f in findings if f["value"] == r)
        print(f"  {r}: {count} occurrences")

    out_file = ROOT / "docs" / "color_inventory_before.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_occurrences": len(findings),
            "distinct_hex_count": len(distinct_hex),
            "distinct_rgb_count": len(distinct_rgb),
            "distinct_hex": distinct_hex,
            "distinct_rgb": distinct_rgb,
            "findings": findings
        }, f, indent=2)

    print(f"\nInventory written to {out_file}")

if __name__ == "__main__":
    main()
