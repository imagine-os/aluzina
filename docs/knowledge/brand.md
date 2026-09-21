# Brand

Aluzina's visual identity as defined by the founder's brand manual. Entry convention: `knowledge/README.md`. Source document: `docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA.pdf` (extraction notes: `docs/source/brand-kit/extraction.md`).

## Identity

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
```

- Name: **ALUZINA** (custom wordmark). Descriptor / tagline: **"UNIVERSO DE DISEÑO"** ("design universe").
- Verticals: **PRODUCTOS**, **ESPACIOS**, **ARTE** (products, spaces, art).
- Themes (alchemical): **FUEGO**, **AGUA**, **AIRE**, **TIERRA**, **NEUTRO** (fire, water, air, earth, neutral).

## Logo and monogram

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
```

- Wordmark "ALUZINA": high-contrast Didone-style capitals, custom-drawn; hairline serifs replaced by small concave "star/flare" feet; A has no crossbar; L is a bare stem with a flared foot; Z has a sharp diagonal. Letterforms are cut into vertical slabs so the metallic gradient reads as facets.
- Primary rendering: wordmark filled with the metallic gold gradient on white.
- Footer lockup: wordmark filled with the iridescent gradient on a full-bleed metallic-gold band, descriptor in flat gold (`#98876D`) beside it, thin iridescent strip under the band.
- Monogram: the "A" alone (flared foot, leaning right stem). Stem filled with one secondary color; the small left foot is always flat gold `#98876D`. Three official variants: **periwinkle**, **aqua**, **lime**.
- Clear space, minimum size and misuse rules are not in the manual — see "What the manual does not define" below.

## Color

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
```

| Role | Name | Pantone | HEX | RGB | CMYK |
| --- | --- | --- | --- | --- | --- |
| Primary (metal) | Gold / Bronze | 875 C | `#98876D` | 152,135,109 | 40,41,59,7 |
| Secondary | Periwinkle | 270 C | `#C2D1F7` | 194,209,247 | 21,12,0,0 |
| Secondary | Aqua / Mint | 3245 C | `#82FEE7` | 130,254,231 | 38,0,20,0 |
| Secondary | Lime | 379 C | `#DDFF79` | 221,255,121 | 16,0,67,0 |

- Metallic highlight `#F1D7AA`: not in the printed palette, decoded from the gold gradient's shading function (the bright band between the two `#98876D` stops).
- Caption ink `#231F20` (rich black): used only for section labels on the page, not a brand color.
- Pantone 875 C is a **metallic ink**. `#98876D` is the flat print fallback; on screen the brand always renders gold as the gradient (see Gradients), never flat, except for thin outlines and descriptor text.
- Vector fill audit of the manual: only these four hex fills plus the two gradients below exist on the page. Nothing else.

## Gradients

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf, gradient shading functions (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
```

- **Metallic gold** (linear, ~45deg, "brushed" bands): `#98876D -> #F1D7AA -> #98876D -> #F1D7AA -> #98876D`, stop bounds ~0.10 / 0.29 / 0.48 / 0.72. A second variant on the page uses 4 bands at bounds 0.24 / 0.57 / 0.85. Reads as satin/brushed metal with two bright highlight streaks.
- **Iridescent / holographic** (linear): `#C2D1F7 -> #82FEE7 -> #DDFF79`, stops ~0.09 / 0.48 / 0.96 (flat plateaus at both ends). Applied top-to-bottom on shapes, left-to-right on the footer wordmark; a reversed variant (aqua -> periwinkle -> lime) appears on outlines.
- Combined signature: iridescent fill inside a gold outline (the PRODUCTOS / ESPACIOS / ARTE symbols), or an iridescent wordmark on a gold band.
- Shader guidance for the app (Justin, 2026-09-21: "consider the realistic textures and gradients ... really beautiful shader technology for ... the iridescent effects"): gold renders as anisotropic brushed metal with two specular streaks that move with tilt/scroll; iridescent renders as a thin-film pastel hue shift periwinkle -> mint -> lime, low saturation, never neon.

## Typography

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
```

- Family: **DIN Round Pro**, weights Light / Regular / Medium / Bold / Black. Licensed font; not checked into the repo.
- Web fallback: **Rubik** (decision pointer D-040).

## Graphic elements and textures

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
```

- Five alchemical glyphs in thin gold outline (1.5pt): FUEGO (up-triangle), AGUA (down-triangle), AIRE (up-triangle with bar), TIERRA (down-triangle with bar), NEUTRO (two overlapping diamonds / crossed chevrons). Labels in aqua.
- Three vertical symbols, each in three finishes (gold outline + iridescent fill; iridescent outline; flat gold outline): PRODUCTOS (tall kite/crystal with nested inner kite), ESPACIOS (circle enclosing a pentagram-like star of triangles and a diamond), ARTE (nested chevrons, five concentric).
- Textures: circle filled iridescent; circle filled metallic gold; circle with gold outline only. Four seamless gold line patterns at 1-1.5pt stroke on white: wordmark letters repeated with sparkle stars between; diamond/hexagon lattice; concentric-chevron / triangle wave; circle-and-star lattice (the ESPACIOS symbol tiled).
- Grid: content column ~600pt centered inside a 736pt page; thin gold hairline separators between sections; generous white space. No numeric grid system is given.

## Metal finish

```
status: draft
since: 2026-09-21
source: Justin Massion, Slack #aluzina-brand-kit, 2026-09-21 04:14 UTC (prompt 0010)
```

Justin, 2026-09-21: "we will likely change the gold to silver." The manual's printed palette and gradients are gold-only (875 C); no silver values are printed anywhere in the source. The app's metal design tokens default to gold and also define a silver variant so the switch is a token change, not a redesign (decision pointer D-039). Silver values are provisional until the founder confirms a Pantone/hex: candidate Pantone 877 C, base `#A7A9AC`, highlight `#E6E7E8`, built the same way as the gold gradient (brushed bands, same stop bounds).

## Dark mode

```
status: draft
since: 2026-09-21
source: inferred from MANUAL DE MARCA ALUZINA.pdf, pending confirmation (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21 04:14 UTC: "Make sure light and dark mode are great in the hub and software portals we're building"; prompt 0010)
```

The manual shows **only white backgrounds** plus one full-bleed metallic-gold band; it defines no dark-mode rule. The following is inferred, not printed in the source, and is pending Angélica's (the founder's) confirmation:

- (inferred) Dark base: a near-black warm tone (e.g. `#141210`) so the gold gradient and iridescent tints stay legible against it.
- (inferred) `#98876D` gold outlines hold as-is on the dark base (contrast roughly 5:1).
- (inferred) Wordmark: gold gradient on light backgrounds, iridescent gradient on dark backgrounds (mirrors the manual's own light-band / gold-band pairing).
- (inferred) The pastel secondaries fail contrast as UI text on white (`#82FEE7` on white is roughly 1.2:1) — the manual uses them this way only for small caption labels; the app must not copy that for body or button text in either theme.

## What the manual does not define

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
```

The manual is a style sheet (logo, colors, type specimen, graphic elements), not a written rulebook. It gives no rules for: clear space, minimum size, misuse, photography direction, tone of voice, or accessibility. These are `_unknown_` until the founder or Justin provides them; the design system should not invent binding rules for them beyond the "not wired yet" placeholders any UI needs.

## Change log

- 2026-09-21: file created from MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion; prompt 0010, changelog 0014).
- 2026-09-21: shipped in the hub (changelog 0014, D-039..D-043): tokens, `design` module D-12 / D-10 / D-13 at `/#/design`, restyle of every portal; the metal-finish entry is rendered live on D-12 (gold / silver preview); dark mode stays `draft` pending the founder.
