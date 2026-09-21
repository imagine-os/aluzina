# Brand

Aluzina's visual identity as defined by the founder's brand manual. Entry convention: `knowledge/README.md`. Source documents: the **silver edition** `docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA-silver-2026-09-21.pdf` (current; extraction diff `extraction-silver.md`; served by the hub at `/brand/MANUAL-DE-MARCA-ALUZINA.pdf`, D-051) and the **gold edition** `MANUAL-DE-MARCA-ALUZINA-gold-2026-09-21.pdf` (superseded; extraction `extraction.md`). Both editions are the same page with the same seven sections; only the metal, the primary logo, the footer band and the textures changed.

## Identity

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
```

- Name: **ALUZINA** (custom wordmark). Descriptor / tagline: **"UNIVERSO DE DISEÑO"** ("design universe"); since the silver edition a second lockup **"INTERIORISMO / ILUMINACIÓN"** ("interior design / lighting") sits under the primary logo (see Logo, silver edition; which one is primary is open, D-052).
- Verticals: **PRODUCTOS**, **ESPACIOS**, **ARTE** (products, spaces, art).
- Themes (alchemical): **FUEGO**, **AGUA**, **AIRE**, **TIERRA**, **NEUTRO** (fire, water, air, earth, neutral).

## Logo and monogram (silver edition)

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA -1.pdf, Slack #aluzina-brand-kit, Justin Massion, prompt 0014 (extraction-silver.md)
supersedes: brand.md#logo-and-monogram-gold-edition
```

- Wordmark geometry unchanged (Didone-style capitals, concave flare feet, no crossbar on the A, vertical slabs).
- **Primary rendering: the wordmark filled with the iridescent gradient on white** (-45deg, periwinkle top-left -> aqua -> lime bottom-right). It is no longer metallic.
- **New lockup under the primary logo**: a thin periwinkle 1 pt slash "\" and two lines "INTERIORISMO / ILUMINACIÓN" in periwinkle `#C2D1F7`, DIN Round Pro Bold ~17 pt, wide tracking. The DESCRIPTOR section and the footer still print "UNIVERSO DE DISEÑO" in flat silver `#C0C0C0`: the manual carries two descriptors.
- Footer band: **flat black `#000000`**, full bleed, iridescent wordmark (left -> right), descriptor "UNIVERSO DE DISEÑO" in flat silver, thin iridescent strips at the page top and bottom.
- Monogram: geometry and the three official stem variants (**periwinkle**, **aqua**, **lime**) unchanged; the small left foot is now flat silver `#C0C0C0`.
- Clear space, minimum size and misuse rules are still not in the manual.

## Logo and monogram (gold edition)

```
status: superseded
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
superseded-by: brand.md#logo-and-monogram-silver-edition (2026-09-21, prompt 0014)
```

- Wordmark "ALUZINA": high-contrast Didone-style capitals, custom-drawn; hairline serifs replaced by small concave "star/flare" feet; A has no crossbar; L is a bare stem with a flared foot; Z has a sharp diagonal. Letterforms are cut into vertical slabs so the metallic gradient reads as facets.
- Primary rendering: wordmark filled with the metallic gold gradient on white.
- Footer lockup: wordmark filled with the iridescent gradient on a full-bleed metallic-gold band, descriptor in flat gold (`#98876D`) beside it, thin iridescent strip under the band.
- Monogram: the "A" alone (flared foot, leaning right stem). Stem filled with one secondary color; the small left foot is always flat gold `#98876D`. Three official variants: **periwinkle**, **aqua**, **lime**.
- Clear space, minimum size and misuse rules are not in the manual — see "What the manual does not define" below.

## Color (silver edition)

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA -1.pdf, Slack #aluzina-brand-kit, Justin Massion, prompt 0014 (extraction-silver.md, colors.json)
supersedes: brand.md#color-gold-edition
```

| Role | Name | Pantone | HEX | RGB | CMYK |
| --- | --- | --- | --- | --- | --- |
| Primary (metal) | Silver | **877 C** | `#C0C0C0` | 192,192,192 | 0,0,0,25 |
| Secondary | Periwinkle | 270 C | `#C2D1F7` | 194,209,247 | 21,12,0,0 |
| Secondary | Aqua / Mint | 3245 C | `#82FEE7` | 130,254,231 | 38,0,20,0 |
| Secondary | Lime | 379 C | `#DDFF79` | 221,255,121 | 16,0,67,0 |
| Neutral (new) | Black | – | `#000000` | 0,0,0 | – |

- The hex line printed under the 877 C swatch still reads `#98876D`: a leftover of the gold edition (the vector data has zero `#98876D` fills; every silver shape, stroke and text span is `#C0C0C0`, and RGB / CMYK agree with `#C0C0C0`). `#C0C0C0` is the token; the print line is an export defect (D-052). Pantone's own sRGB for 877 C is darker (~`#8A8D8F`); the manual uses web silver.
- Pantone 877 C is a **metallic ink**. `#C0C0C0` is the flat value (swatch, outlines, monogram foot, descriptor text, patterns, the flat disc); on screen the metal renders as the ramp under Gradients.
- Caption ink `#231F20` unchanged (section captions). Flat black `#000000` is new: the footer band and one texture disc.
- Vector fill audit of the silver page: `#C2D1F7` x15, `#C0C0C0` x14, `#82FEE7` x2, `#DDFF79` x2, `#000000` x2; strokes `#C0C0C0` x507 at 1.0 pt and `#C2D1F7` x1 at 1.0 pt; one metallic shading (2 uses), five iridescent shadings (13 uses). Leftover gold text: the printed hex line and the PRODUCTOS / ESPACIOS / ARTE labels.

## Color (gold edition)

```
status: superseded
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
superseded-by: brand.md#color-silver-edition (2026-09-21, prompt 0014)
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

## Gradients (silver edition)

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA -1.pdf, shading xref 55 / function 54 (Slack #aluzina-brand-kit, Justin Massion, prompt 0014; extraction-silver.md)
supersedes: brand.md#gradients-gold-edition (metallic part only; the iridescent part is unchanged)
```

- **Metallic silver** (axial, smooth, extend both): `#FFFFFF 0% -> #E0E0E0 37.15% -> #999999 68.99% -> #4D4D4D 100%`. No saw-tooth bands and no second variant; the highlight is pure white and `#C0C0C0` is not a stop. Used twice: the metallic texture disc at 0deg (white left -> dark right) and the wordmark-and-stars pattern row at 45deg. **Not used on the primary logo any more.** App token: `--gradient-metal` (135deg) with `--metal-stop-1..5` for the SVG marks.
- **Iridescent**: byte-identical to the gold edition (`#C2D1F7 -> #82FEE7 -> #DDFF79` at 0.09 / 0.483 / 0.962, plus the same reverse and footer variants). It now also fills the primary LOGO wordmark at -45deg.
- Combined signature now: iridescent wordmark on white or on black; iridescent fill inside a silver outline (the PRODUCTOS / ESPACIOS / ARTE symbols).
- Shader guidance unchanged in intent: metal = anisotropic brushed metal, iridescent = thin-film pastel shift; the metal now reads from the silver `--metal-*` vars.

## Gradients (gold edition)

```
status: superseded
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf, gradient shading functions (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
superseded-by: brand.md#gradients-silver-edition (2026-09-21, prompt 0014); the iridescent stops stay current
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

## Graphic elements and textures (silver edition)

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA -1.pdf (Slack #aluzina-brand-kit, Justin Massion, prompt 0014; extraction-silver.md)
supersedes: brand.md#graphic-elements-and-textures-gold-edition
```

- Glyph and symbol geometry unchanged; every outline is now **1.0 pt flat silver `#C0C0C0`** (alchemical glyphs were 2.1-2.4 pt gold, vertical symbols 1.65-1.7 pt gold). Iridescent fills and the iridescent-outline row unchanged. FUEGO..NEUTRO labels stay aqua; PRODUCTOS / ESPACIOS / ARTE labels are still gold `#98876D` (export leftover, D-052).
- Textures: **four discs**: iridescent (vertical, unchanged), **black `#000000` (new)**, metallic silver (ramp at 0deg; the gold disc was -45deg), **flat silver `#C0C0C0` (replaces the gold outline-only disc)**. The four line patterns keep their geometry at 1.0 pt `#C0C0C0`; the wordmark-and-stars row keeps its metallic fill, now silver at 45deg.
- Grid: unchanged (content column ~600 pt centred in 736 pt). The six hairline separators exist in the file as zero-width fills and render invisible (export defect, D-052); the app keeps 1 px silver hairlines.

## Graphic elements and textures (gold edition)

```
status: superseded
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0010)
superseded-by: brand.md#graphic-elements-and-textures-silver-edition (2026-09-21, prompt 0014)
```

- Five alchemical glyphs in thin gold outline (1.5pt): FUEGO (up-triangle), AGUA (down-triangle), AIRE (up-triangle with bar), TIERRA (down-triangle with bar), NEUTRO (two overlapping diamonds / crossed chevrons). Labels in aqua.
- Three vertical symbols, each in three finishes (gold outline + iridescent fill; iridescent outline; flat gold outline): PRODUCTOS (tall kite/crystal with nested inner kite), ESPACIOS (circle enclosing a pentagram-like star of triangles and a diamond), ARTE (nested chevrons, five concentric).
- Textures: circle filled iridescent; circle filled metallic gold; circle with gold outline only. Four seamless gold line patterns at 1-1.5pt stroke on white: wordmark letters repeated with sparkle stars between; diamond/hexagon lattice; concentric-chevron / triangle wave; circle-and-star lattice (the ESPACIOS symbol tiled).
- Grid: content column ~600pt centered inside a 736pt page; thin gold hairline separators between sections; generous white space. No numeric grid system is given.

## Metal finish (silver edition)

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA -1.pdf, Slack #aluzina-brand-kit, Justin Massion, prompt 0014 ("Here is the updated brand manual with the silver instead of gold")
supersedes: brand.md#metal-finish-gold-edition-draft
```

Silver is the current edition (D-050): Pantone 877 C, flat `#C0C0C0`, metallic ramp white -> `#4D4D4D` (see Gradients). The app's metal tokens default to silver (`tokens.metalDefault = 'silver'`, `--metal-base #C0C0C0`, `--metal-highlight #FFFFFF`, `--metal-shade #4D4D4D`); the neutral greys of both themes were re-derived with it. Gold (875 C) is the previous edition, kept in the tokens for preview only (`<html data-metal="gold">`, D-12 toggle) and labelled "previous edition" wherever it shows.

## Metal finish (gold edition, draft)

```
status: superseded
since: 2026-09-21
source: Justin Massion, Slack #aluzina-brand-kit, 2026-09-21 04:14 UTC (prompt 0010)
superseded-by: brand.md#metal-finish-silver-edition (2026-09-21, prompt 0014)
```

Justin, 2026-09-21: "we will likely change the gold to silver." The manual's printed palette and gradients are gold-only (875 C); no silver values are printed anywhere in the source. The app's metal design tokens default to gold and also define a silver variant so the switch is a token change, not a redesign (decision pointer D-039). Silver values are provisional until the founder confirms a Pantone/hex: candidate Pantone 877 C, base `#A7A9AC`, highlight `#E6E7E8`, built the same way as the gold gradient (brushed bands, same stop bounds).

## Dark mode

```
status: draft
since: 2026-09-21
source: inferred from MANUAL DE MARCA ALUZINA.pdf, pending confirmation (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21 04:14 UTC: "Make sure light and dark mode are great in the hub and software portals we're building"; prompt 0010)
```

The manual shows **only white backgrounds** plus one full-bleed band (metallic gold in the gold edition, **flat black `#000000` in the silver edition**); it defines no dark-mode rule. The following is inferred, not printed in the source, and is pending Angélica's (the founder's) confirmation (updated for silver, prompt 0014):

- (inferred) Dark base: a neutral near-black (`#0E0E0E`, surfaces `#171717` / `#222222`) since the primary is silver and the manual's band is black; the earlier warm `#121110` reading is superseded with the gold edition.
- (inferred) Silver outlines lift to `#C0C0C0` as text on the dark base (10.6:1) and to `#5A5A5A` as hairlines.
- (inferred) Wordmark: the iridescent wordmark in both themes, as the silver manual's LOGO (on white) and footer (on black) both paint it; the metal wordmark stays a secondary rendering.
- (inferred) The pastel secondaries fail contrast as UI text on white (`#82FEE7` on white is roughly 1.2:1) — the manual uses them this way only for small caption labels; the app must not copy that for body or button text in either theme.

## Export defects in the silver manual (to report, not reproduce)

```
status: current
since: 2026-09-21
source: MANUAL DE MARCA ALUZINA -1.pdf vector audit at 600 dpi (Slack #aluzina-brand-kit, Justin Massion, prompt 0014; extraction-silver.md); decision D-052
```

For Angélica, before the next export:

1. The hex printed under the Pantone 877 C swatch still reads `#98876D` (gold). RGB 192,192,192 and CMYK 0,0,0,25 are right; the line should read `#C0C0C0`.
2. The PRODUCTOS / ESPACIOS / ARTE labels (DIN Round Pro Medium 12.6 pt) are still gold `#98876D`; every other silver text moved to `#C0C0C0`.
3. The six section hairline separators (y 414 / 667 / 978 / 1449 / 1745 / 2575), both DESCRIPTOR slashes and the footer slash before UNIVERSO DE DISEÑO are one-segment paths **filled** `#C0C0C0` with no stroke: zero area, they render as nothing (0 non-white pixels at 600 dpi). In the gold edition they were 1-2 pt strokes. They need a 1 pt stroke.

Open question, not a defect: two descriptors coexist (INTERIORISMO / ILUMINACIÓN under the LOGO; UNIVERSO DE DISEÑO in the DESCRIPTOR section and the footer). Justin and Angélica decide which is primary; the app renders both (`BrandMark kind="descriptor" variant`). Also unchanged from gold: the "DIN ROUN PRO." typo in the type specimen.

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
- 2026-09-21: **silver edition** (Slack #aluzina-brand-kit, Justin Massion, "MANUAL DE MARCA ALUZINA -1.pdf"; prompt 0014, changelog 0015, D-050..D-052): Logo, Color, Gradients (metallic part), Graphic elements and Metal finish superseded by silver entries (877 C `#C0C0C0`, smooth ramp white -> `#4D4D4D`, iridescent wordmark as the primary logo, INTERIORISMO / ILUMINACIÓN lockup, black footer band, four discs, 1 pt outlines); Dark mode draft updated to the neutral base; "Export defects" section added; source PDFs renamed per edition and the current one served by the hub.
