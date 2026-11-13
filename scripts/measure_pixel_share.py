"""
Measures the exact pixel share of Navy, Cream, and Coral in rendered screenshots.

Source of Truth:
  • Navy:   #14213D (20, 33, 61)
  • Cream:  #F4EDE0 (244, 237, 224)
  • Coral:  #FF6258 (255, 98, 88)
"""
import os
import sys

from PIL import Image


def color_distance(c1, c2):
    return ((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2) ** 0.5

def measure_image(image_path):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} does not exist")
        return None

    img = Image.open(image_path).convert("RGB")
    width, height = img.size
    total_pixels = width * height

    NAVY_RGB = (20, 33, 61)
    CREAM_RGB = (244, 237, 224)
    CORAL_RGB = (255, 98, 88)

    navy_count = 0
    cream_count = 0
    coral_count = 0

    pixels = img.getdata()

    for p in pixels:
        d_navy = color_distance(p, NAVY_RGB)
        d_cream = color_distance(p, CREAM_RGB)
        d_coral = color_distance(p, CORAL_RGB)

        # Classify pixel to nearest dominant palette anchor
        min_d = min(d_navy, d_cream, d_coral)
        if min_d == d_coral and (p[0] > 180 and p[1] < 150 and p[2] < 150):
            coral_count += 1
        elif min_d == d_cream or (p[0] > 150 and p[1] > 150 and p[2] > 130):
            cream_count += 1
        else:
            navy_count += 1

    navy_pct = (navy_count / total_pixels) * 100
    cream_pct = (cream_count / total_pixels) * 100
    coral_pct = (coral_count / total_pixels) * 100

    print("=" * 60)
    print(f"PIXEL SHARE ANALYSIS: {os.path.basename(image_path)}")
    print(f"Resolution: {width}x{height} ({total_pixels:,} pixels)")
    print("-" * 60)
    print(f"Primary (Navy  #14213D):   {navy_pct:5.2f}% ({navy_count:,} pixels)")
    print(f"Secondary (Cream #F4EDE0): {cream_pct:5.2f}% ({cream_count:,} pixels)")
    print(f"Accent (Coral #FF6258):    {coral_pct:5.2f}% ({coral_count:,} pixels)")
    print("-" * 60)
    print(f"Dominant Combined (Navy + Cream): {navy_pct + cream_pct:5.2f}% (Target: ~90%)")
    print(f"Accent Share (Coral):             {coral_pct:5.2f}% (Target: ~10%, max 15%)")
    print("=" * 60)

    return {
        "navy_pct": navy_pct,
        "cream_pct": cream_pct,
        "coral_pct": coral_pct,
        "dominant_pct": navy_pct + cream_pct
    }

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "docs/screenshots/after_palette/dashboard_1920x1080_en.png"
    measure_image(path)
