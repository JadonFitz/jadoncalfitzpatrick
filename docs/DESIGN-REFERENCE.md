# Design Reference

From [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
Primary inspiration for this site: **Apple** (B&W, product-as-hero, controlled drama).
Secondary references: **Notion** (warm neutrals, whisper borders) and **Figma** (pure B&W chrome, airy weight).

---

## Apple

**Visual Theme:** Controlled drama — vast B&W backdrops, products as sculptures. Every pixel serves the product. The interface retreats until invisible.

- **Font:** SF Pro Display (20px+) / SF Pro Text (below 20px), optical sizing
- **Color story:** Binary — pure black `#000000` vs. light gray `#f5f5f7`, sections alternate cinematically
- **Only accent:** Apple Blue `#0071e3` — reserved exclusively for interactive elements
- **Headlines:** SF Pro Display 56px, weight 600, line-height 1.07, letter-spacing -0.28px
- **Nav:** `rgba(0,0,0,0.8)` + `backdrop-filter: saturate(180%) blur(20px)` — glass effect

**Color Palette:**
| Token | Value | Use |
|---|---|---|
| Pure Black | `#000000` | Hero backgrounds |
| Light Gray | `#f5f5f7` | Alternate section backgrounds |
| Near Black | `#1d1d1f` | Primary text on light |
| Apple Blue | `#0071e3` | All interactive elements only |

**Typography:**
| Role | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| Display Hero | 56px | 600 | 1.07 | -0.28px |
| Section Heading | 40px | 600 | 1.10 | normal |
| Tile Heading | 28px | 400 | 1.14 | 0.196px |
| Body | 17px | 400 | 1.47 | -0.374px |
| Caption | 14px | 400 | 1.29 | -0.224px |

**Do's:**
- Negative letter-spacing at ALL text sizes
- Alternate black and `#f5f5f7` section backgrounds for cinematic rhythm
- Pill-shaped CTAs (980px border-radius)

**Don'ts:**
- No additional accent colors
- No gradients, textures, or patterns
- No centered body text — only headlines center
- No opaque navigation

---

## Notion

*Warm, whisper-thin, anti-flashy.*

- **Font:** Modified Inter, aggressive negative letter-spacing (-2.125px at 64px)
- **Warm neutrals:** All grays have yellow-brown undertones (`#f6f5f4`, `#31302e`, `#615d59`, `#a39e98`)
- **Text:** `rgba(0,0,0,0.95)` — not pure black, micro-warmth
- **Borders:** Ultra-thin — `1px solid rgba(0,0,0,0.1)` throughout
- **Shadows:** Multi-layer stacks, max individual opacity 0.05 — depth felt, not seen
- **Accent:** Notion Blue `#0075de` — singular CTA/interactive color only

---

## Figma

*Pure B&W chrome, variable weight, meta precision.*

- **Font:** `figmaSans` variable font — unusual weight stops: 320, 330, 340, 450, 480, 540, 700
- **Color system:** Strictly black and white for UI chrome — vibrant colors only in content
- **Body weight:** 320–340 (lighter than standard regular) — ethereal, airy
- **Letter-spacing:** Always negative on body, always positive on mono labels
- **Button geometry:** Pill (50px) or circular — never sharp corners

---

## Key Principles for This Site

1. **B&W only** — no accent colors, no gradients
2. **Serif for editorial** (Cormorant Garamond) + tight tracking
3. **Product as hero** — the film stills and poster carry all visual weight
4. **Depth felt not seen** — shadows at low opacity, not decorative
5. **Sections alternate** — white `#ffffff` ↔ off-white `#f5f5f4` for rhythm
6. **Interface retreats** — UI elements are dim/transparent until needed
