# Aluzina design system: brand foundation

Source: `docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA.pdf` (+ `extraction.md`). The manual is a style sheet, not a rulebook; everything marked *(inferred)* is our reading. Tokens live in `apps/hub/src/design/tokens.ts` and are generated into `src/styles/tokens.css` by `npm run tokens` (P-07). Never hard-code a hex in a component.

## 1. Palette (`--color-*`, per theme)

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` / `surface` / `surface-raised` | #FBFBF9 / #FFFFFF / #F4F1EB | #121110 / #1B1917 / #242120 | page, cards, raised cards (warm off-white; warm near-black) |
| `text` / `text-muted` | #231F20 / #6B655C | #F3EFE8 / #A89F92 | body; captions, eyebrows, secondary text |
| `border` / `hairline` | #E4DFD6 / #CFC4B2 | #34302B / #5A5044 | component borders; gold-tinted section rules (`hr`, `.hairline`) |
| `primary` / `primary-text` | #231F20 / #FFFFFF | #F3EFE8 / #121110 | the one solid primary button per screen (ink, not gold: gold is never a fill for controls) |
| `accent` / `accent-soft` / `accent-text` | #98876D / #EFEBE3 / #4E4333 | #B9A88A / #2C2620 / #E7D7B5 | flat gold accent (borders, icons, hover), its wash, text on the wash |
| `focus` | #6F6250 | #F1D7AA | the single global focus ring (`:focus-visible`) |
| `success`, `warning`, `danger`, `info` (+ `-soft`) | greens / ambers / reds / periwinkle-blues, >= 4.5:1 on bg and surface | idem | status. Always with text or an icon, never colour alone |
| `tint-periwinkle` / `tint-aqua` / `tint-lime` | #E9EEFC / #DFFCF6 / #F3FCD9 | #232A3D / #17332E / #26301A | pastel washes for chips, section backgrounds, category colour |
| `metal-text` | #6F6250 | #D9C9A6 | flat metal readable as text: outlines, eyebrows in gold, descriptor |
| `overlay` / `shadow` | rgb(35 31 32 / .45) / rgb(35 31 32 / .12) | rgb(0 0 0 / .6) / rgb(0 0 0 / .5) | Modal / Drawer scrim; `--shadow-sm/md/lg` are built on `--color-shadow` |

Raw brand constants (`--brand-gold #98876D`, `--brand-gold-highlight #F1D7AA`, `--brand-periwinkle #C2D1F7`, `--brand-aqua #82FEE7`, `--brand-lime #DDFF79`, `--brand-ink #231F20`) exist for the marks and gradients only. **The pastels are never text**: #82FEE7 on white is ~1.2:1. Use them as fills, tints, monogram stems and gradient stops.

Contrast checked (WCAG): text, text-muted, accent-text, metal-text, success, warning, danger, info on bg and surface >= 4.5:1 in both themes (lowest: light warning on bg 4.52); focus vs bg >= 3:1 (5.7 light, 13.5 dark). No values were adjusted from the brief.

## 2. The metal switch (gold -> silver)

Pantone 875 C is a metallic ink; on screen gold is a gradient, never flat (except thin outlines and text). Justin expects gold to become silver, so the metal is one token group:

- `tokens.metal = { gold: {base, highlight, shade}, silver: {...} }`, `tokens.metalDefault = 'gold'`.
- `:root` gets `--metal-base / --metal-highlight / --metal-shade` from `metalDefault`; every metal is also emitted as `:root[data-metal="gold"|"silver"]`.
- **To switch for real**: change `metalDefault` to `'silver'` and run `npm run tokens`. One line.
- **To preview at runtime**: `document.documentElement.dataset.metal = 'silver'` (a dev-mode toggle can set `<html data-metal>`; the key `aluzina.metal` is reserved for it).
- Everything that should follow the switch uses the `--metal-*` vars or `--gradient-metal*`: BrandMark, `.surface-metal`, `.text-metal`, `.sheen`. The semantic `--color-accent*`, `--color-hairline`, `--color-metal-text` are theme colours and stay gold-tinted until the palette itself is re-derived; if silver ships, re-derive those four per theme (neutral greys) in the same change.

## 3. Gradients (`--gradient-*`)

- `--gradient-metal`: 135deg, base 0% -> highlight 22% -> base 48% -> highlight 72% -> base 100% (stops decoded from the manual's shading). Two specular streaks = brushed metal.
- `--gradient-metal-soft`: the same, each stop mixed 30% into `--color-surface`; for large backgrounds behind text.
- `--gradient-iridescent`: 180deg, #C2D1F7 9% -> #82FEE7 48% -> #DDFF79 96% (flat plateaus at both ends). `--gradient-iridescent-x` is the 90deg version (wordmark on the footer band). `--gradient-iridescent-soft`: 35% into `--color-surface`, for backgrounds behind normal text.
- Signature pairings from the manual: iridescent fill inside a gold outline; iridescent wordmark on a gold band; gold wordmark on white.
- Shader work later (Justin's ask): gold = anisotropic brushed metal, two specular streaks moving with scroll / tilt; iridescent = thin-film pastel hue shift, low saturation, never neon. Build it as a progressive enhancement over these gradients, off under `prefers-reduced-motion`.

## 4. Textures and finishes (`src/styles/textures.css`)

Four seamless SVG tiles as masks, coloured by `background-color: var(--color-hairline)` so they follow theme and metal: `.texture-lattice` (diamond / hexagon lattice), `.texture-chevron` (nested chevron wave), `.texture-circles` (circle + star lattice, the ESPACIOS symbol tiled), `.texture-stars` (scattered four-point sparkles). Tile size `--texture-size` (rem, scales with `--scale`). **Apply them to an empty decorative element** (pseudo-element or absolutely positioned `aria-hidden` div): a mask hides the element's own content.

Surfaces: `.surface-metal` (metal gradient, ink text), `.surface-iridescent` (ink text), `.surface-iridescent-soft` (theme text). Text: `.text-metal`, `.text-iridescent` (background-clip text with a solid `--color-metal-text` fallback). `.sheen`: an 8 s highlight sweep on hover / focus-within only, off under reduced motion; never the only affordance (P-03).

## 5. BrandMark atom (`components/atom/BrandMark`)

`<BrandMark kind finish? tone? glyph? size? label? />`

- `kind`: `wordmark` (ALUZINA), `monogram` (the A: stem + small flat-metal foot), `descriptor` (slash + "UNIVERSO DE DISEÑO" in display bold, `--tracking-wide`), `glyph` (with `glyph`: `fuego | agua | aire | tierra | neutro | productos | espacios | arte`).
- `finish`: `metal` (default), `iridescent`, `outline` (stroke `--color-metal-text`, non-scaling 1.5-2 px), `flat`. Glyphs are outlines; the finish paints their stroke.
- `tone`: monogram stem `periwinkle | aqua | lime` (the manual's three variants); the foot is always flat `--metal-base`.
- `size`: `sm` 1.25 rem, `md` 2, `lg` 3.5, `xl` 6 (heights; width follows the shape).
- `label`: aria-label -> `role="img"`; without it the mark is `aria-hidden`.
- Paths: `src/brand/paths.ts` (normalized viewBoxes, extracted from the PDF). Standalone SVGs for docs / OG images: `public/brand/*.svg`.

## 6. Typography

One family, **DIN Round Pro** (Light 300 / Regular 400 / Medium 500 / Bold 700 / Black 900), fallback **Rubik** then system-ui. Licensed files are dropped into `public/fonts/` (see its README); `src/styles/fonts.css` declares the faces. `--font-sans` and `--font-display` are the same stack: hierarchy comes from weight and tracking, not from a second face.

- Headings `h1-h3`: `--font-display`, `--weight-bold`, letter-spacing 0.01em, line-height 1.15. Page titles may go `--weight-black`.
- Eyebrows / section captions: `.eyebrow` (uppercase, medium, `--tracking-caps` 0.18em, 0.75rem, muted); `.eyebrow--wide` (0.35em) for descriptor-like lockups. The manual sets all captions this way.
- Body: 400, 1.5 line-height. Light 300 for large quiet display text only (never below 1.25 rem).
- Uppercase always gets tracking (>= 0.04em, labels; 0.18em captions); mixed case never does.
- Numbers, codes: `--font-mono`.

## 7. Light and dark *(inferred: the manual only shows white and one gold band)*

- Light: warm off-white base, gold wordmark (metal gradient), gold outlines, ink text.
- Dark: warm near-black base (#121110, not blue-black), gold outlines unchanged in hue (`--color-metal-text` lifts to #D9C9A6 for text-level contrast), **iridescent wordmark on dark**, gold wordmark on light. Pastel tints become deep versions of the same hue.
- Metal and iridescent surfaces always carry ink text (`--brand-ink`), in both themes.
- Both themes must be checked on every page (screenshots light + dark). Dark is a first-class theme here, not an inversion filter.

## 8. Not in the manual (do not invent as if it were)

Clear space, minimum sizes, misuse cases, photography / imagery direction, tone of voice, iconography beyond the eight glyphs, layout grid values, accessibility rules. Where we need one (e.g. wordmark min height 1.25 rem = `sm`, clear space = the A's foot width) it is our house rule and should be labelled so in the component docs.

## Files

`apps/hub/src/design/tokens.ts`, `scripts/gen-tokens.mjs` -> `src/styles/tokens.css`; `src/styles/{global,fonts,textures}.css`; `src/brand/paths.ts`; `src/components/atom/BrandMark/*`; `public/brand/*.svg`, `public/fonts/README.md`; `index.html` (Rubik link, monogram favicon).
