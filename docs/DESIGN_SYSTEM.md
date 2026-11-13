# Prohori AI ("প্রহরী") — Strict 90/10 Design System & Tactical Color Architecture

**Source of Truth: Strict 90/10 Color System**  
**Project**: Prohori AI · International AI Builders Congress 2026 · SecureAI  
**Design Reference**: 90/10 Color Palette Approach (Navy, Cream, Coral Swatches)

---

## 1. Executive Summary & Design Principle

Prohori AI implements a mathematically disciplined **90/10 color system** engineered for high-stress Security Operations Center (SOC) environments. The human visual system in a crisis suffers severe cognitive tunnel vision; multi-colored dashboards with red, green, yellow, and blue lights create sensory overload and alert fatigue.

The 90/10 approach enforces a strict hierarchy:
- **Navy (`#14213D`)** and **Cream (`#F4EDE0`)** carry **~95–97%** of the visual weight across every screen, establishing a calm, high-contrast, paper-like readability surface.
- **Coral (`#FF6258`)** is reserved strictly as the **~3–5%** attention magnet, used exclusively for elements demanding immediate human decision-making: the primary CTA ("Approve Defense", "Run demo"), active navigation tabs, and critical alert indicators.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROHORI AI 90/10 PALETTE                        │
├──────────────────────────┬──────────────────────────────┬──────────────┤
│ PRIMARY DOMINANT (~60%)  │ SECONDARY DOMINANT (~30%)    │ ACCENT (~10%)│
│ Navy #14213D             │ Cream #F4EDE0                │ Coral #FF6258│
│ RGB(20, 33, 61)          │ RGB(244, 237, 224)           │ RGB(255, 98, 88)│
│ Main backgrounds, nav,   │ Card surfaces, content areas,│ Primary CTAs,│
│ header, dark sections    │ triage panels, text regions  │ action gates │
└──────────────────────────┴──────────────────────────────┴──────────────┘
```

---

## 2. Palette Specification & Token Mapping

### 2.1 Base Hex Values (Hard Rule: Only These Three Hues)
| Role | Name | Hex | RGB | Functional Usage |
|---|---|---|---|---|
| **Primary (Dominant)** | Navy | `#14213D` | `rgb(20, 33, 61)` | Page background, header bar, dark code surfaces, deep borders |
| **Secondary (Dominant)** | Cream | `#F4EDE0` | `rgb(244, 237, 224)` | Card surfaces, intelligence panels, reading areas, light text |
| **Accent (Attention)** | Coral | `#FF6258` | `rgb(255, 98, 88)` | Primary action buttons ("Run demo", "Approve Defense"), focus rings |

### 2.2 Approved Alpha Derivations (Tokens in `:root`)
No arbitrary tints, lightening, or darkening are permitted. The only allowed variations are transparency (alpha) channels of the three base colors:

#### Navy Alpha Tokens (Dark derivations on Cream surfaces)
- `--navy-alpha-04`: `rgba(20, 33, 61, 0.04)` — subtle card inner wells, filter bars
- `--navy-alpha-08`: `rgba(20, 33, 61, 0.08)` — hover states on light buttons, citation badges
- `--navy-alpha-12`: `rgba(20, 33, 61, 0.12)` — badge backgrounds, medium severity pills
- `--navy-alpha-15`: `rgba(20, 33, 61, 0.15)` — subtle dividers on light cards
- `--navy-alpha-20`: `rgba(20, 33, 61, 0.20)` — card borders, input borders
- `--navy-alpha-25`: `rgba(20, 33, 61, 0.25)` — modal dialog borders, subtle shadows
- `--navy-alpha-40`: `rgba(20, 33, 61, 0.40)` — elevation drop shadows
- `--navy-alpha-65`: `rgba(20, 33, 61, 0.65)` — tertiary captions
- `--navy-alpha-75`: `rgba(20, 33, 61, 0.75)` — muted body text (guarantees WCAG AA >= 4.5:1 on Cream)
- `--navy-alpha-85`: `rgba(20, 33, 61, 0.85)` — secondary text on Cream surfaces
- `--navy-alpha-90`: `rgba(20, 33, 61, 0.90)` — strong emphasis text

#### Cream Alpha Tokens (Light derivations on Navy surfaces)
- `--cream-alpha-05`: `rgba(244, 237, 224, 0.05)` — header background tint
- `--cream-alpha-10`: `rgba(244, 237, 224, 0.10)` — engine badges, secondary buttons on dark
- `--cream-alpha-15`: `rgba(244, 237, 224, 0.15)` — active dropdown hover states
- `--cream-alpha-20`: `rgba(244, 237, 224, 0.20)` — header borders, dark scrollbars
- `--cream-alpha-30`: `rgba(244, 237, 224, 0.30)` — dark button borders
- `--cream-alpha-65`: `rgba(244, 237, 224, 0.65)` — muted captions on dark backgrounds
- `--cream-alpha-75`: `rgba(244, 237, 224, 0.75)` — secondary labels on Navy header
- `--cream-alpha-85`: `rgba(244, 237, 224, 0.85)` — primary subtitles on Navy header

#### Coral Alpha Tokens (Attention highlights & focus rings)
- `--coral-alpha-10`: `rgba(255, 98, 88, 0.10)` — active alert selection row tint
- `--coral-alpha-15`: `rgba(255, 98, 88, 0.15)` — icon callout containers
- `--coral-alpha-20`: `rgba(255, 98, 88, 0.20)` — focus glow rings
- `--coral-alpha-30`: `rgba(255, 98, 88, 0.30)` — button hover drop-shadow glows
- `--coral-alpha-50`: `rgba(255, 98, 88, 0.50)` — active selection borders
- `--coral-alpha-80`: `rgba(255, 98, 88, 0.80)` — primary CTA button hover state

---

## 3. WCAG Accessibility & Contrast Compliance Audit

All color pairings are mathematically verified using the W3C Relative Luminance formula ($L = 0.2126R + 0.7152G + 0.0722B$):

| Text / Foreground | Background Surface | Contrast Ratio | WCAG Rating | Usage Rule |
|---|---|---|---|---|
| **Navy (`#14213D`)** | **Cream (`#F4EDE0`)** | **13.72:1** | **AAA (Pass)** | Standard reading text on all cards and triage views |
| **Cream (`#F4EDE0`)** | **Navy (`#14213D`)** | **13.72:1** | **AAA (Pass)** | Header title, navigation labels, dark code panels |
| **Navy (`#14213D`)** | **Coral (`#FF6258`)** | **5.43:1** | **AA (Pass)** | **Mandatory**: All Coral buttons use Navy text |
| **Coral (`#FF6258`)** | **Navy (`#14213D`)** | **5.43:1** | **AA (Pass)** | Header CTA icons, active badge outlines on dark |
| **Navy Alpha-75** | **Cream (`#F4EDE0`)** | **6.50:1** | **AA (Pass)** | Muted secondary text, timestamps, metric labels |
| **Cream Alpha-75** | **Navy (`#14213D`)** | **6.50:1** | **AA (Pass)** | Subtitles in header and footer |
| *Coral (`#FF6258`)* | *Cream (`#F4EDE0`)* | *2.53:1* | **FAIL (< 4.5:1)** | **PROHIBITED**: Coral text is never placed on Cream |
| *Cream (`#F4EDE0`)* | *Coral (`#FF6258`)* | *2.53:1* | **FAIL (< 4.5:1)** | **PROHIBITED**: Coral buttons never use Cream text |

---

## 4. Semantic Hierarchy without Color Reliance

Because the 90/10 system strictly forbids traffic-light colors (no greens, no yellow, no purples), semantic status is communicated via **shape language, iconography, borders, and typography**:

| Severity / Status | Icon Graphic | Shape & Border Treatment | Palette Token Mapping |
|---|---|---|---|
| **Critical Severity** | `AlertOctagon` | Solid Coral pill with bold Navy text | `.severity-badge-critical`: `bg: var(--coral)`, `text: var(--navy)` |
| **High Severity** | `Flame` | Transparent pill with 2px Coral border | `.severity-badge-high`: `border: 2px solid var(--coral)`, `text: var(--navy)` |
| **Medium Severity** | `AlertTriangle` | Muted Navy-alpha pill with 1px border | `.severity-badge-medium`: `bg: var(--navy-alpha-12)`, `text: var(--navy)` |
| **Low / Info Severity**| `Info` | Ghost outline pill | `.severity-badge-low`: `border: 1px solid var(--navy-alpha-25)`, `text: var(--navy-alpha-75)` |
| **Approved / Contained**| `CheckCircle` | Solid Navy badge with Cream text | `bg: var(--navy)`, `text: var(--cream)` |
| **Pending Approval** | `ShieldAlert` | Coral CTA button | `btn-primary`: `bg: var(--coral)`, `text: var(--navy)` |

---

## 5. Empirical Pixel-Share Measurements

Measurements taken from live Playwright full-resolution captures (`scripts/measure_pixel_share.py`):

| Viewport | Navy Share (`#14213D`) | Cream Share (`#F4EDE0`) | **Combined Dominant** (Target: ~90%) | **Coral Accent** (Target: ~10%, max 15%) | Status |
|---|---|---|---|---|---|
| **1920x1080 (Desktop)** | 27.97% (580k px) | 68.74% (1.42M px) | **96.71%** | **3.29%** (68k px) | **PASS** |
| **1366x768 (Laptop)** | 22.39% (234k px) | 73.08% (766k px) | **95.48%** | **4.52%** (47k px) | **PASS** |
| **390x844 (Mobile)** | 37.55% (123k px) | 58.23% (191k px) | **95.77%** | **4.23%** (13k px) | **PASS** |

The measured accent area remains consistently between **3.29% and 4.52%**, safely beneath the 15% ceiling, ensuring Coral functions strictly as an attention pull for critical decisions.

---

## 6. Automated Palette Enforcement Tools

To prevent color regressions, two automated verification tools are built into the test pipeline:

1. **Static Palette Linter** (`scripts/check_palette.py`):
   - Scans all `.tsx`, `.ts`, `.css`, and `.html` files in `web/src`.
   - Fails if any hex code outside `#14213D`, `#F4EDE0`, and `#FF6258` is detected.
   - Run via:
     ```powershell
     .venv\Scripts\python scripts/check_palette.py
     ```
2. **Runtime Computed Style Inspector** (`scripts/check_runtime_palette.py`):
   - Uses Playwright to inspect `window.getComputedStyle()` on all 215+ rendered DOM elements.
   - Verifies that `backgroundColor`, `color`, and `borderColor` compute strictly to Navy, Cream, Coral, or transparent.
   - Run via:
     ```powershell
     .venv\Scripts\python scripts/check_runtime_palette.py
     ```

---

## 7. Scope & Exclusions

As specified in the architectural requirements:
1. **Decoy Honeypot Trap (Port 8081)**: The simulated login interface retains unbranded, neutral styling to avoid tipping off automated credential-stuffing adversaries.
2. **FastAPI OpenAPI Documentation (`/docs` & `/redoc`)**: Uses standard Swagger UI and ReDoc templates built into the FastAPI runtime.

