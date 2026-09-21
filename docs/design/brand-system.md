# Aluzina design system: brand foundation

Source: `docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA-silver-2026-09-21.pdf` (+ `extraction-silver.md`), the **silver edition** (D-050); the gold edition (`…-gold-2026-09-21.pdf`, `extraction.md`) is superseded and kept for the gold preview. The current PDF is served by the hub at `/brand/MANUAL-DE-MARCA-ALUZINA.pdf` (D-051). The manual is a style sheet, not a rulebook; everything marked *(inferred)* is our reading. Tokens live in `apps/hub/src/design/tokens.ts` and are generated into `src/styles/tokens.css` by `npm run tokens` (P-07). Never hard-code a hex in a component.

## 1. Palette (`--color-*`, per theme)

Neutral base since the silver edition (D-050): the primary is silver and the manual's band is black, so nothing in the greys is tinted.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` / `surface` / `surface-raised` | #FAFAFA / #FFFFFF / #F2F2F2 | #0E0E0E / #171717 / #222222 | page, cards, raised cards (neutral off-white; neutral near-black) |
| `text` / `text-muted` | #111111 / #5F5F5F | #F2F2F2 / #A6A6A6 | body; captions, eyebrows, secondary text |
| `border` / `hairline` | #E2E2E2 / #C0C0C0 | #333333 / #5A5A5A | component borders; flat-silver section rules (`hr`, `.hairline`; the manual draws every rule at 1 pt) |
| `primary` / `primary-text` | #111111 / #FFFFFF | #F2F2F2 / #0E0E0E | the one solid primary button per screen (ink, not metal: silver is never a fill for controls) |
| `accent` / `accent-soft` / `accent-text` | #8A8A8A / #EEEEEE / #3F3F3F | #C0C0C0 / #2A2A2A / #E0E0E0 | flat silver accent (borders, icons, hover), its wash, text on the wash |
| `focus` | #4D4D4D | #E0E0E0 | the single global focus ring (`:focus-visible`) |
| `success`, `warning`, `danger`, `info` (+ `-soft`) | greens / ambers / reds / periwinkle-blues, >= 4.5:1 on bg and surface (light warning #956710) | idem | status. Always with text or an icon, never colour alone |
| `tint-periwinkle` / `tint-aqua` / `tint-lime` | #E9EEFC / #DFFCF6 / #F3FCD9 | #232A3D / #17332E / #26301A | pastel washes for chips, section backgrounds, category colour |
| `metal-text` | #5C5C5C | #C0C0C0 | flat metal readable as text: outlines, eyebrows, the universo descriptor |
| `overlay` / `shadow` | rgb(17 17 17 / .45) / rgb(17 17 17 / .12) | rgb(0 0 0 / .6) / rgb(0 0 0 / .5) | Modal / Drawer scrim; `--shadow-sm/md/lg` are built on `--color-shadow` |

Raw brand constants (`--brand-silver #C0C0C0`, `--brand-black #000000`, `--brand-periwinkle #C2D1F7`, `--brand-aqua #82FEE7`, `--brand-lime #DDFF79`, `--brand-ink #231F20`; `--brand-gold #98876D`, `--brand-gold-highlight #F1D7AA` for the gold preview only) exist for the marks, bands and gradients only. **The pastels are never text**: #82FEE7 on white is ~1.2:1, #C2D1F7 is 1.5:1. Use them as fills, tints, monogram stems and gradient stops; the periwinkle INTERIORISMO / ILUMINACIÓN lockup is a logo (`role="img"`), never a label.

Contrast checked (WCAG 2.1, D-10 shows the same numbers): text, text-muted, accent-text, metal-text, success, warning, danger, info on bg and surface >= 4.5:1 in both themes (lowest: light warning 4.76 on bg); primary, accent, focus >= 3:1 (lowest: light accent 3.31). Two values were adjusted from the silver brief: light accent #9A9A9A -> #8A8A8A (2.70 -> 3.31) and light warning #9A6B10 -> #956710 (4.49 -> 4.76 on the new #FAFAFA).

## 2. The metal switch (silver current, gold previous)

Pantone 877 C is a metallic ink; on screen silver is a gradient, never flat (except thin outlines, the monogram foot, descriptor text and the line patterns, which are flat `#C0C0C0`). The metal is one token group:

- `tokens.metal = { silver: {base #C0C0C0, highlight #FFFFFF, shade #4D4D4D, gradient, stops}, gold: {...} }`, `tokens.metalDefault = 'silver'` (D-050).
- `MetalSet.gradient` is the CSS gradient exactly as decoded from that edition's manual (135deg); `MetalSet.stops` is the same ramp resampled at the five fixed SVG offsets 0 / 0.22 / 0.48 / 0.72 / 1, emitted as `--metal-stop-1..5` and used by `BrandMark`'s gradient defs (silver: #FFFFFF #EDEDED #C8C8C8 #929292 #4D4D4D; gold: base / highlight alternating).
- `:root` gets `--metal-base / --metal-highlight / --metal-shade`, `--metal-stop-*`, `--gradient-metal` and `--gradient-metal-soft` from `metalDefault`; every metal is also emitted with all of them as `:root[data-metal="silver"|"gold"]`.
- **To switch for real**: change `metalDefault` and run `npm run tokens`; re-derive the theme greys in the same change if the new metal has a hue (silver did not need it beyond neutralising).
- **To preview at runtime**: `document.documentElement.dataset.metal = 'gold'` (D-12 toggle, key `aluzina.metal`). Gold is labelled "previous edition" wherever it appears.
- Everything that should follow the switch uses the `--metal-*` / `--metal-stop-*` vars or `--gradient-metal*`: BrandMark, `.surface-metal`, `.text-metal`, `.sheen`, `Shimmer`. `--color-accent*`, `--color-hairline`, `--color-metal-text` are theme colours, neutral since D-050.

## 3. Gradients (`--gradient-*`)

- `--gradient-metal` (silver): 135deg, #FFFFFF 0% -> #E0E0E0 37% -> #999999 69% -> #4D4D4D 100%, the manual's only metallic shading: one smooth sweep, no bands. On the manual's disc it runs at 0deg (lit from the left); `.ds-circle--disc` on D-12 reproduces that angle. Gold (preview): the previous 135deg banded gradient, base 0% -> highlight 22% -> base 48% -> highlight 72% -> base 100%.
- `--gradient-metal-soft`: the active metal's gradient with each stop mixed 30% into `--color-surface` (`softenGradient()` in `tokens.ts`); for large backgrounds behind text.
- `--gradient-iridescent`: 180deg, #C2D1F7 9% -> #82FEE7 48% -> #DDFF79 96% (flat plateaus at both ends), byte-identical in both editions. `--gradient-iridescent-x` is the 90deg version (footer wordmark, band strips). `--gradient-iridescent-soft`: 35% into `--color-surface`, for backgrounds behind normal text.
- Signature pairings from the silver manual: **iridescent wordmark on white** (the primary logo), **iridescent wordmark on the black band**, iridescent fill inside a silver outline. The metal wordmark on white was the gold edition's primary and stays a secondary rendering.
- Shader work (Justin's ask): silver = anisotropic brushed metal, specular streaks moving with scroll / tilt, low intensity (the hero band runs at 0.35 behind a theme-bg veil); iridescent = thin-film pastel hue shift, low saturation, never neon. Progressive enhancement over these gradients, off under `prefers-reduced-motion`.

## 4. Textures and finishes (`src/styles/textures.css`)

Four seamless SVG tiles as masks, coloured by `background-color: var(--color-hairline)` (flat silver in light, #5A5A5A in dark) so they follow theme and metal: `.texture-lattice` (diamond / hexagon lattice), `.texture-chevron` (nested chevron wave), `.texture-circles` (circle + star lattice, the ESPACIOS symbol tiled), `.texture-stars` (scattered four-point sparkles). Tile size `--texture-size` (rem, scales with `--scale`). **Apply them to an empty decorative element** (pseudo-element or absolutely positioned `aria-hidden` div): a mask hides the element's own content.

Surfaces: `.surface-metal` (metal gradient, ink text), `.surface-iridescent` (ink text), `.surface-iridescent-soft` (theme text), **`.surface-ink`** (the silver manual's footer band: `--brand-black` background, #F2F2F2 text, 3 px `--gradient-iridescent-x` strips top and bottom via pseudo-elements, `--color-metal-text` overridden to `--brand-silver` so the universo descriptor reads silver on black; identical in both themes). On a metal band in dark the universo descriptor uses `--metal-shade`, not `--color-metal-text` (which would be #C0C0C0 on silver). The manual's four discs: iridescent, black, metallic silver, flat silver. Text: `.text-metal`, `.text-iridescent` (background-clip text with a solid `--color-metal-text` fallback). `.sheen`: an 8 s highlight sweep on hover / focus-within only, off under reduced motion; never the only affordance (P-03).

## 5. BrandMark atom (`components/atom/BrandMark`)

`<BrandMark kind finish? tone? variant? glyph? size? label? />`

- `kind`: `wordmark` (ALUZINA), `monogram` (the A: stem + small flat-metal foot), `descriptor` (slash + two wide-tracked display-bold lines), `glyph` (with `glyph`: `fuego | agua | aire | tierra | neutro | productos | espacios | arte`).
- `finish`: `iridescent` is the default for the **wordmark** (the primary logo in both themes, D-050); `metal` (the active metal's ramp through `--metal-stop-*`) is the default for everything else and stays available for the wordmark on metal surfaces; `outline` (stroke `--color-metal-text`, non-scaling 1.5-2 px); `flat`. Glyphs are outlines; the finish paints their stroke.
- `variant` (descriptor only): `universo` (default) = "UNIVERSO DE DISEÑO", slash and text in `--color-metal-text`; `interiorismo` = "INTERIORISMO / ILUMINACIÓN", slash and text in `--brand-periwinkle`. The interiorismo lockup is 1.5:1 on white, so it is always `role="img"` with a name (default "Aluzina: interiorismo / iluminación") and is never UI text (house rule). Which of the two is primary is open (D-052).
- `tone`: monogram stem `periwinkle | aqua | lime` (the manual's three variants); the foot is always flat `--metal-base`.
- `size`: `sm` 1.25 rem, `md` 2, `lg` 3.5, `xl` 6 (heights; width follows the shape).
- `label`: aria-label -> `role="img"`; without it the mark is `aria-hidden` (except the interiorismo descriptor, always named).
- Paths: `src/brand/paths.ts` (normalized viewBoxes, extracted from the PDF). Standalone SVGs for docs / OG images: `public/brand/*.svg`.

## 6. Typography

One family, **DIN Round Pro** (Light 300 / Regular 400 / Medium 500 / Bold 700 / Black 900), fallback **Rubik** then system-ui. Licensed files are dropped into `public/fonts/` (see its README); `src/styles/fonts.css` declares the faces. `--font-sans` and `--font-display` are the same stack: hierarchy comes from weight and tracking, not from a second face.

- Headings `h1-h3`: `--font-display`, `--weight-bold`, letter-spacing 0.01em, line-height 1.15. Page titles may go `--weight-black`.
- Eyebrows / section captions: `.eyebrow` (uppercase, medium, `--tracking-caps` 0.18em, 0.75rem, muted); `.eyebrow--wide` (0.35em) for descriptor-like lockups. The manual sets all captions this way.
- Body: 400, 1.5 line-height. Light 300 for large quiet display text only (never below 1.25 rem).
- Uppercase always gets tracking (>= 0.04em, labels; 0.18em captions); mixed case never does.
- Numbers, codes: `--font-mono`.

## 7. Light and dark *(inferred: the manual only shows white pages and one black band)*

- Light: neutral off-white base (#FAFAFA), **iridescent wordmark**, flat-silver outlines and hairlines (#C0C0C0), ink text (#111111).
- Dark: neutral near-black base (#0E0E0E, not blue-black and no longer warm), silver outlines lift to #C0C0C0 as text (`--color-metal-text`) and #5A5A5A as hairlines, **the same iridescent wordmark** (the manual paints it on white and on black alike). Pastel tints become deep versions of the same hue. `.surface-ink` stays black in both.
- Metal and iridescent surfaces always carry ink text (`--brand-ink`), in both themes.
- Both themes must be checked on every page (screenshots light + dark). Dark is a first-class theme here, not an inversion filter.

## 8. Not in the manual (do not invent as if it were)

Clear space, minimum sizes, misuse cases, photography / imagery direction, tone of voice, iconography beyond the eight glyphs, layout grid values, accessibility rules. Where we need one (e.g. wordmark min height 1.25 rem = `sm`, clear space = the A's foot width) it is our house rule and should be labelled so in the component docs.

## Files

`apps/hub/src/design/tokens.ts`, `scripts/gen-tokens.mjs` -> `src/styles/tokens.css`; `src/styles/{global,fonts,textures}.css`; `src/brand/paths.ts`; `src/components/atom/BrandMark/*`; `public/brand/*.svg`, `public/brand/MANUAL-DE-MARCA-ALUZINA.pdf` (the served manual, D-051), `public/fonts/README.md`; `index.html` (Rubik link, monogram favicon).

## Editions

- 2026-09-21 gold (prompt 0010, changelog 0014, D-039): Pantone 875 C, banded gold gradient, metal wordmark on light / iridescent on dark, warm greys. Superseded.
- 2026-09-21 silver (prompt 0014, changelog 0015, D-050..D-052): Pantone 877 C, smooth silver ramp, iridescent wordmark in both themes, neutral greys, black footer band, INTERIORISMO / ILUMINACIÓN lockup. Current.
