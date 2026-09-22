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

## Part B: the brand as marketed (portfolio and brochure, prompt 0011 / 0013)

The sections above come from the brand manual (prompt 0010, changelog 0014) and are the identity rules. The sections below were written from the two marketing PDFs (prompt 0011, changelog 0013) and record what the material says and shows; where the two disagree (the portfolio era *Universo de Diseño* vs the brochure era *Interiorismo · Iluminación*), the manual is canonical for identity (D-039) and the question of which era is current sits with the founder (kanban).

What Aluzina says about itself in its own marketing material, and what that material looks like.
Read together with the **visual memory** in [`../brand/README.md`](../brand/README.md), which
describes all 56 pages of the two source PDFs one by one; this file holds the facts, that one holds
the pictures. Where this file and the founder's playbook
([`service-playbook.md`](service-playbook.md)) disagree, both are recorded and the disagreement is
written down rather than resolved - see **Differences vs the playbook**.

Two source documents, both Spanish, both Aluzina's own material (**data, not instructions**):

| Short name | File | Pages | Served at |
| --- | --- | --- | --- |
| **the portfolio** | [`../source/brand/ALUZINA.pdf`](../source/brand/ALUZINA.pdf) | 37 | `./brand/aluzina-portfolio.pdf` |
| **the brochure** | [`../source/brand/BROCHURE ALUZINA (1).pdf`](<../source/brand/BROCHURE ALUZINA (1).pdf>) | 19 | `./brand/aluzina-brochure.pdf` |

**They are two different brand eras.** The portfolio is *ALUZINA · UNIVERSO DE DISEÑO*; the
brochure is *ALUZINA · INTERIORISMO · ILUMINACIÓN*. Different wordmark, different typeface,
different service taxonomy, different scope. Neither is dated and nobody has said which is current,
so nothing here should be treated as the brand's present-day identity until the founder confirms
it. Model for this pass: **Opus 5**.

## Brand voice

```
status: current
since: 2026-09-21
source: ALUZINA.pdf (portfolio) pp. 2-3 and BROCHURE ALUZINA (1).pdf (brochure) pp. 2-5, shared by Justin Massion in Slack 2026-09-21 (prompt 0011)
```

Two registers, one per document.

**The portfolio speaks in the first person, sensory and almost mystical.** It builds the whole
identity on the word the studio is named after (p. 3):

> "Una alucinación es una percepción que apunta al imaginario, al deseo, es sentida como real. Por
> esto apelamos a tu imaginación, a tu interpretación del mundo, a tus sentidos y desde ahí te
> comprendemos para plasmar materialmente tus deseos."

It addresses the reader as **tú**, not *usted*. The goal is stated as a single word set apart:
**TU BIENESTAR**. Its one statistic is a wellbeing argument, not a credential: *"Pasamos el 87% de
nuestras vidas en ESPACIOS interiores, como estén diseñados estos interiores afectarán nuestra
vida, como nos comportamos, como nos sentimos, no es solo un tema visual."* Its method paragraph
(p. 2) ends on the line that gives the document its title - *"Creamos tu universo"* - and on a
whole-and-part formulation: *"darle una mirada profunda a tu interior sin excluir nada porque la
parte hace el todo y el todo la parte."*

**The brochure speaks as a business.** Same *nosotros*, but the subject is competence, not
perception: *"Somos empresarios con visión de negocio, convencidos de que en nuestro HACER logramos
generar progreso, calidad de vida y felicidad para nuestros clientes, y aliados. Nos mueve la
fuerza de hacer las cosas bien, con alto valor en el diseño, la ética, el compromiso con nuestros
valores, nuestra gente y nuestro entorno."* It leads with numbers (below) before it says anything
about design.

**Taglines and headline phrases, verbatim:**

| Phrase | Where | Role |
| --- | --- | --- |
| `UNIVERSO DE DISEÑO` | portfolio cover p. 1, back cover p. 37 | the portfolio-era descriptor, locked to the wordmark |
| `ESPACIOS · PRODUCTOS · ARTE` | portfolio pp. 2, 3 | the three pillars, repeated as a refrain |
| `UN ESPACIO PARA CADA NECESIDAD Y DESEO` | portfolio p. 2 | positioning line |
| `Creamos tu universo.` | portfolio p. 2 | closing line of the method paragraph |
| `TU BIENESTAR` | portfolio p. 3 | the stated goal |
| `INTERIORISMO · ILUMINACIÓN` | brochure covers pp. 1, 19 | the brochure-era descriptor, locked to the wordmark |
| `SOMOS` | brochure p. 2 | credentials headline, set very large |
| `HACEMOS VISIONES` | brochure p. 3 | headline over the full-bleed hospitality image |
| `Evocaremos la magia de la transformación espacial y el poder de un diseño que trascienda lo visual.` | brochure p. 3 | statement caption |
| `Somos parte de la vida cotidiana de las personas.` | brochure p. 5 | statement caption |

**The values list** (brochure p. 2), given as "las constantes de nuestro trabajo": coherencia,
armonía, vanguardia, versatilidad, creatividad, atemporalidad, consciencia, experiencias, cercanía,
memorabilidad.

**The design principle** (brochure p. 6): *"Creemos en el diseño coherente y colaborativo; buscamos
que nuestra línea arquitectónica y nuestro concepto de diseño se adecue a las expectativas, deseos
y necesidades reales de cada proyecto…"*

## Positioning and credentials

```
status: current
since: 2026-09-21
source: BROCHURE ALUZINA (1).pdf (brochure) p. 2, shared by Justin Massion in Slack 2026-09-21 (prompt 0011)
```

The brochure's credentials panel, verbatim: **8 años**, **más de 50 proyectos en Colombia**,
**4 proyectos internacionales**, **más de 16.743 m² de experiencia**.

The brochure is undated, so "8 años" cannot be converted into a founding year - see **Unknowns**.
Two of the four international projects are probably `casa-nueva-york-colin-kamesh-raja` and
`casa-miami-ovy-on-the-drums`, whose names embed New York and Miami, but the brochure never says
so.

The brochure splits its market three ways (p. 4): **DISEÑO RESIDENCIAL**, **DISEÑO HOTELERÍA**,
**DISEÑO COMERCIAL**. Its client lists on p. 2 are split only two ways, residencial and comercial -
hotelería has no list of its own, though Hotel Mantyx sits in the comercial list.

## Services as marketed

```
status: current
since: 2026-09-21
source: ALUZINA.pdf (portfolio) pp. 2-3, BROCHURE ALUZINA (1).pdf (brochure) pp. 4, 6, shared by Justin Massion in Slack 2026-09-21 (prompt 0011)
```

Neither document markets the playbook's five services. Each cuts the offer a different way.

**The portfolio sells three pillars** (pp. 2-3), which are *output types*:

| Pillar | What the portfolio says it is |
| --- | --- |
| **ESPACIOS** | "Creación y desarrollo de ideas para crear un elemento." Space types named on p. 2: **Comerciales, Personales, Efímeros**. |
| **PRODUCTOS** | "Diseño y producción de mobiliario y productos para espacios a tu medida. Línea de luminarias y producto aluzina." |
| **ARTE** | "Expresamos nuestra visión del mundo, a través de recursos mixtos, como la pintura bajo diversas técnicas (acrílico, óleo, aerosol, vinilo), fotografía, plásticos (cerámica, madera)." |

**The portfolio's method** (p. 2), as one sentence: start from the client's needs or desires →
gather information on client, user and space → analyse the data → empathise with the space, the
client, their brand and the surroundings → build a strategy on a conceptual framework and the
sensory world → design.

**The brochure sells four capabilities** (p. 4), which are *trades*: **INTERIORISMO**,
**MOBILIARIO**, **ILUMINACIÓN**, **CONSTRUCCIÓN** - each as an icon tile, over the three market
tiles (residencial / hotelería / comercial).

**The brochure's delivery process** (p. 6) is four phases, construction-led:

| Phase | Name | Steps as printed |
| --- | --- | --- |
| FASE 1 | CONCEPTUALIZACIÓN | Concepto base · Línea base · Modelo base · Producción de entrega |
| FASE 2 | CONSTRUCTIVOS / LICENCIA | Preproyectos · Etapa previa al desarrollo · Dibujo planos de obra · Coordinación de licencia |
| FASE 3 | DETALLES | Taller de diseño · Producción de planimetría · Entrega a clientes · Construcción |
| FASE 4 | SUPERVISIÓN / CIERRE | Inicio de obra · Marcación de obra · Curaduría · Finalización obra |

## Projects / portfolio

```
status: current
since: 2026-09-21
source: ALUZINA.pdf (portfolio) pp. 4-36 and BROCHURE ALUZINA (1).pdf (brochure) p. 2, shared by Justin Massion in Slack 2026-09-21 (prompt 0011)
```

Two lists that barely overlap: the portfolio **shows** 13 projects, the brochure **names** 20, and
only three appear in both.

**Shown in the portfolio** (each has a stable slug and page numbers in
[`../brand/portfolio/index.json`](../brand/portfolio/index.json); full one-line descriptions and
what each photograph shows are in [`../brand/README.md`](../brand/README.md)):

| Slug | Project | Type | Pages |
| --- | --- | --- | --- |
| `brewhouse-bar-cerveza-artesanal` | Brew House - bar de cerveza artesanal | commercial / hospitality | 4-5 |
| `club-union-sala-de-masajes` | Club Unión - sala de masajes | wellness | 6-7 |
| `sodime-consultorio-medico` | Sodime - consultorio médico | healthcare | 8-9 |
| `terminal-norte-plazoleta-comida` | Terminal Norte - plazoleta de comida | public / F&B | 10 |
| `coassist-aseguradora` | Coassist - aseguradora | commercial / office | 11-12 |
| `casa-clasico-contemporanea` | Casa clásico-contemporánea | residential | 13-14 |
| `apartaestudio-i` | Apartaestudio (I) | residential | 15-16 |
| `apartamento-moderno` | Apartamento moderno | residential | 17-18 |
| `apartaestudio-ii` | Apartaestudio (II) | residential | 19-20 |
| `apartamento` | Apartamento con vista | residential | 21-22 |
| `gahia-pop-up` | Gahia pop-up (Art Events) | event / retail pop-up | 23-24 |
| `music-and-art-i` | Music & Art (I) (Art Events) | event | 25-26 |
| `music-and-art-ii` | Music & Art (II) (Art Events) | event | 27-28 |

**Named in the brochure** (p. 2, twenty names in two numbered lists, no images attached to any of
them; slugs in [`../brand/brochure/index.json`](../brand/brochure/index.json)):

- *Residencial:* Apartamento Parma Noham Ebresum · Casa Nueva York Colin Kamesh Raja · Casa Miami
  Ovy on the drums · Apartamento La Estrella Estela Clavel · Apartamento Poblado Rio Escondido ·
  Apartamento Terrasino Cumbres · Parta estudio loma de los parra · Apartamento Seta · Apartaestudio
  Asemssi · Apartamento Cubik Envigado.
- *Comercial:* Hotel Mantyx · Coassist · Bebo · Sodime · Área metropolitana de Medellín · Semana de
  la juventud · Mantyx · Alcaldía de Medellín · London City barber shop · Brewhouse cervecería.

Names are transcribed exactly as printed, including *"Parta estudio loma de los parra"*, which
reads as a typo for *Apartaestudio*.

**The three that appear in both documents:** Coassist, Sodime, Brewhouse cervecería. These are
recorded as `relatedPortfolioSlug` in the brochure index so a schema worker can relate the rows.

**Aluzina's own product line** (portfolio pp. 29-32) - not client work: the objects *Mandala*,
*Arab light*, *Cui*, *Gran baul*, and the luminaires *circular*, *elipse*, *vesis pesis*,
*metatron*, *paraboloide*, *estrella*. The geometry names (vesica piscis, Metatron's cube) match
the sacred-geometry line motifs used throughout the portfolio.

**Art work** (portfolio pp. 33-36): collage, photography, illustration, drawing, oil and acrylic
painting, murals, and painting on timber cross-sections.

## Visual identity (palette, type, imagery)

```
status: current
since: 2026-09-21
source: ALUZINA.pdf (portfolio) and BROCHURE ALUZINA (1).pdf (brochure), colour and font values measured from the page renders in ../brand/, shared by Justin Massion in Slack 2026-09-21 (prompt 0011)
```

Colour values are sampled from the **JPEG page renders**, not from the PDFs' colour space. They are
close enough to design against; the authoritative values live in Angelica's source artwork.

**The one thing both eras share: a light, luminous gradient** running blue → aqua → mint → lime.
This is the brand's only consistent visual asset.

| Token | Hex | Where |
| --- | --- | --- |
| Periwinkle / pale blue | `#c3cff5`, `#bfd0e3` | gradient start, both covers |
| Aqua | `#b8e8ec`, `#b6f6e0` | gradient middle; brochure "RESIDENCIAL" heading |
| Mint | `#befdc8`, `#cfffde` | gradient; portfolio contact icons |
| Lime | `#e1fe87`, `#e3ff9a`, `#d5fdaf` | gradient end; brochure "COMERCIAL" heading |
| Bronze / gold | `#988870`, `#a09078`, `#9e9b7a` | portfolio wordmark (metallic gradient fill) |
| Warm taupe | `#8e836d` | portfolio body and caption type |
| Paper white | `#ffffff` | the dominant colour of almost every non-photographic page |
| Black | `#000000` | brochure body and headings |

**Typography.** Embedded fonts, by document:

- Portfolio: `DINRoundPro-Light`, `DINRoundPro-Medium`, `DINRoundPro-Bold`. All running text and
  every caption is DIN Round Pro, set in **wide letterspacing** and mostly in caps - e.g.
  `E S P A C I O S`. The **wordmark itself is not embedded type**: it is outlined artwork in a
  high-contrast display serif with flared, almost Didone serifs.
- Brochure: `DINRoundPro-Light`, `DINRoundPro-Medium`, `DINRoundPro-Bold`, plus `Calibri` and
  `Calibri-Bold`. Calibri carries the body copy, the client lists and the phase steps. Its presence
  next to DIN Round Pro suggests the brochure was assembled in an office tool rather than a layout
  tool - worth confirming before treating the brochure as a typographic reference.

**DIN Round Pro is therefore the one typeface both documents share**, and the closest thing Aluzina
has to a brand face in this material.

**Wordmarks.**

- Portfolio (`../brand/portfolio/page-01.jpg`): `ALUZINA` in the display serif, filled with a
  gold/bronze metallic gradient, on a cover split diagonally - a blue-to-lime gradient triangle on
  the left, white on the right. A thin diagonal slash separates the wordmark from the stacked,
  letterspaced `UNIVERSO / DE DISEÑO`.
- Brochure (`../brand/brochure/page-01.jpg`): `ALUZINA` in a **light letterspaced sans**, filled
  with the blue-to-mint-to-lime gradient, on white over a soft prism/light-refraction photograph,
  with the same diagonal slash and the stacked `INTERIORISMO / ILUMINACIÓN`.

The **diagonal slash** is the only graphic device that survives from one era to the other.

**Motifs and imagery.**

- Portfolio: line-drawn **sacred geometry** - polyhedra, triangles, chevrons - as section markers
  and pillar icons; the same geometry names the luminaires. Layout is white-dominated, with photos
  placed as loose asymmetric collages of 2-8 images per page and a small letterspaced caption. Its
  photography is warm and mixed in quality; several project shots are visibly older or lower
  resolution.
- Brochure: **full-bleed edge-to-edge photography** - thirteen of nineteen pages are a single
  uncaptioned image. The photography is markedly better and more recent-looking: wide interiors,
  natural light, timber slats, planted walls, black steel-framed glazing, the Medellín valley
  through the windows. Flat gradient-tile icons carry the capabilities. Recurring subjects: timber
  slat walls, green/planted walls, murals (a "Medellín" graffiti wall, a pop-art face), indoor-
  outdoor rooms, and lighting as the hero.
- Caution: the four capability icons on brochure p. 4 appear to carry a faint **stock-image
  watermark**. Do not reuse those icons as brand assets without checking licensing.

## Contact channels

```
status: current
since: 2026-09-21
source: ALUZINA.pdf (portfolio) p. 37 and BROCHURE ALUZINA (1).pdf (brochure) pp. 1, 19, shared by Justin Massion in Slack 2026-09-21 (prompt 0011)
```

Channels only. **Personal phone numbers and email addresses printed in these PDFs are deliberately
not copied into the repo or into memory** - the contact details are in the source PDF
(`../source/brand/ALUZINA.pdf` p. 37 and both brochure covers).

| Channel | Handle / address as printed | Where |
| --- | --- | --- |
| Website | `WWW.ALUZINA.CO` | portfolio p. 37 |
| Instagram | `@aluzinaa` | portfolio p. 37; brochure pp. 1, 19 |
| Facebook | `@aluzinaaespacio` | portfolio p. 37 |
| Phone (mobile) | *contact details in the source PDF* | portfolio p. 37; brochure pp. 1, 19 |
| Email | *contact details in the source PDF*, on the `aluzina.co` domain | portfolio p. 37 |

**Two findings that affect other knowledge entries:**

1. **The domain here is `aluzina.co`, not `aluzinaa.com`.** [`public-sites.md`](public-sites.md)
   documents the live sites as **aluzinaa.com** and **direccion.aluzinaa.com** (two a's, `.com`).
   The portfolio prints **www.aluzina.co** (one a, `.co`) and an email on the same domain. Whether
   `aluzina.co` still resolves, redirects, or has been replaced is not known - see **Unknowns**.
2. **The Instagram handle is `@aluzinaa`.** [`social-channels.md`](social-channels.md) is `draft`
   precisely because the handle was unresolved between `aluzina.espacios` and `@aluzinaa`. Both
   PDFs print `@aluzinaa`, and the portfolio prints `@aluzinaaespacio` for **Facebook** - which
   looks like the origin of the `aluzina.espacios` confusion. This is evidence, not confirmation:
   the PDFs are undated and the profile scraped on 2026-09-21 was `aluzina.espacios`.

## Differences vs the playbook

```
status: current
since: 2026-09-21
source: comparison of ALUZINA.pdf (portfolio) and BROCHURE ALUZINA (1).pdf (brochure) against service-playbook.md (ALUZINA Operating System – Service Delivery Playbook v1.0), prompt 0011
```

The founder's playbook and this marketing material describe the same studio in three incompatible
vocabularies. **Nothing here supersedes the playbook** - the playbook is the canonical service model
(D-033) and stays so. This section exists so the gap is visible instead of being quietly averaged
away.

| | Playbook | Portfolio | Brochure |
| --- | --- | --- | --- |
| Language | English | Spanish | Spanish |
| Descriptor | "Interior Design & Emotional Lighting" | "Universo de Diseño" | "Interiorismo · Iluminación" |
| Tagline | "Spaces + Light + Experiences that transform" | "Un espacio para cada necesidad y deseo" / "Creamos tu universo" | "Hacemos visiones" |
| Offer is cut by | **depth of engagement** (a service ladder) | **output type** (Espacios / Productos / Arte) | **trade** (Interiorismo / Mobiliario / Iluminación / Construcción) and **market** (Residencial / Hotelería / Comercial) |
| Process | 10-step client journey, LEAD → FOLLOW-UP | one method paragraph, 6 moves | 4 construction phases, FASE 1-4 |
| Pipeline | 15 statuses | none | none |

**Specific mismatches to put to the founder:**

1. **None of the five playbook services is named in either document.** There is no "Creative
   Digital Consultation", no "In-Person Consultation" and no "Interior Styling" anywhere in the
   marketing material. Only *Comprehensive Interior Design* (≈ interiorismo) and
   *Execution / Construction* (≈ construcción) have obvious counterparts. The two consultation
   products and styling are, as far as the client-facing material goes, invisible.
2. **The brochure sells two things the playbook has no service for:** `MOBILIARIO` (furniture
   design and production) and `ILUMINACIÓN` as a standalone trade. The portfolio goes further and
   sells a named **product line** of luminaires and objects.
3. **The portfolio's ARTE pillar has no counterpart at all.** Murals, painting, photography,
   illustration and work on timber are a whole revenue line the operating system does not model.
4. **"Emotional lighting"** - the playbook's central positioning phrase - **appears in neither
   document**. The brochure says `ILUMINACIÓN`, flatly.
5. **The brochure's four phases are not the playbook's ten steps.** FASE 2 and FASE 4 include
   *coordinación de licencia* and *curaduría* - permitting and building-control work that the
   playbook's journey never names. Conversely the brochure has nothing for LEAD, DIAGNOSIS, BRIEF
   or FOLLOW-UP.
6. **Espacios "Efímeros"** (ephemeral / temporary spaces - the pop-ups and events on portfolio
   pp. 23-28) is a named space type in the portfolio and a real body of work, with no service,
   phase or status in the playbook.

**How to use this until the founder rules.** Keep `service-playbook.md` and
`apps/hub/src/domain/playbook.ts` as the operating model. Treat this file as what the *market*
currently sees. Do not retire either. A kanban card should carry the reconciliation question.

## Portfolio projects as records

```
status: current
since: 2026-09-21
source: docs/brand/portfolio/index.json and docs/brand/brochure/index.json (prompt 0011), seeded by apps/hub/src/data/seed/assets.ts (prompt 0013, Justin: "properly saved by project and relational in the proper way in the database"); model Fable 5.1
```

The two PDFs and everything the portfolio shows are **rows in the Hub**, derived at seed time from the
two `index.json` files (imported through the `@docs` alias), so this folder stays the source of truth
and a re-render of the pages updates the data. `SEED_VERSION` 6.

**Documents and pages** (`assets`, new entity): `ast-portfolio` (37 pages, `./brand/aluzina-portfolio.pdf`)
and `ast-brochure` (19 pages, `./brand/aluzina-brochure.pdf`), each with `palette`, `fonts`, `bytes`,
`pageCount`, Slack `sourceFileId` and `sourceName`; one `page` row per render (`ast-portfolio-p01` …
`ast-brochure-p19`, `repoPath = docs/brand/<doc>/page-NN.jpg`, `url: null` because the renders are not
served by the app, `parentId` = the document, `palette` = the page's colours, `textExcerpt` = headline).
`publishedAt` is `null` for both: **neither PDF is dated**.

**Projects** (`projects`, one per portfolio project, id `prj-pf-<slug>`; `pipelineStatus: closed`,
`phase: delivered`, `approval: client-approved`, `leadDesignerId: u-alejandra`, `budgetCop: 0`):

| Slug | Project id | Hub `type` (closest) | `serviceCode` (guess) | Client row |
| --- | --- | --- | --- | --- |
| `brewhouse-bar-cerveza-artesanal` | `prj-pf-brewhouse-bar-cerveza-artesanal` | hospitality | 03 | `cl-brewhouse` Brew House |
| `club-union-sala-de-masajes` | `prj-pf-club-union-sala-de-masajes` | wellness | 03 | `cl-club-union` Club Unión |
| `sodime-consultorio-medico` | `prj-pf-sodime-consultorio-medico` | commercial (healthcare) | 03 | `cl-sodime` Sodime |
| `terminal-norte-plazoleta-comida` | `prj-pf-terminal-norte-plazoleta-comida` | hospitality (public F&B) | 03 | `cl-terminal-norte` Terminal Norte |
| `coassist-aseguradora` | `prj-pf-coassist-aseguradora` | commercial | 03 | `cl-coassist` Coassist |
| `casa-clasico-contemporanea` | `prj-pf-casa-clasico-contemporanea` | residential | 03 | none |
| `apartaestudio-i` | `prj-pf-apartaestudio-i` | residential | 03 | none |
| `apartamento-moderno` | `prj-pf-apartamento-moderno` | residential | 03 | none |
| `apartaestudio-ii` | `prj-pf-apartaestudio-ii` | residential | 03 | none |
| `apartamento` | `prj-pf-apartamento` | residential | 03 | none |
| `gahia-pop-up` | `prj-pf-gahia-pop-up` | commercial (event / pop-up) | null | `cl-gahia` Gahia |
| `music-and-art-i` | `prj-pf-music-and-art-i` | commercial (event) | null | none |
| `music-and-art-ii` | `prj-pf-music-and-art-ii` | commercial (event) | null | none |

Each project also has a **space** `sp-pf-<slug>` (kind `project`, `aboutType: projects`) under the new
area `sp-portfolio` (Spaces > Portfolio), and a **note** `post-pf-<slug>` (the page-by-page text of the
portfolio for that project, from `index.json`) filed in both. Two more notes sit in `sp-portfolio`:
`post-brochure-clients` (the twenty names on brochure p. 2) and `post-portfolio-products` (the product
and luminaire line, pp. 29-32).

**Relations** (`relations`, D-026), all derived: page `part-of` document (56); portfolio page `depicts`
project (25; new relation kind `depicts`, "shows", distinct from a mention); project `for-client` client (6);
project `produced-by` role `founder` (13); brochure p. 2 `references` the three projects both documents
share (Coassist, Sodime, Brew House); brochure pp. 4 and 6 and portfolio p. 2 `applies-to` playbook
services `03` / `E` (new relation target registry `services`, id = service code; a **guess** at the closest
playbook service, the documents predate the playbook); each note `references` the document or pages it
was read from. G-08 `/brand/documents` renders the projects and services per document from these rows;
the graph (K-04) and any post can relate to `assets:<id>` and `services:<code>`.

**What is `_unknown_` and how the placeholder reads in the rows:**

- **Year / start date**: no portfolio project is dated. `projects.startDate` needs a string, so every
  portfolio project carries the placeholder **`2024-01-01`**; treat it as `_unknown_`, never as a fact.
  `dueDate` is `null`.
- **City**: `location` is `Ubicación no publicada` for all but `prj-pf-apartamento` (`Medellín`, because
  the page shows the Medellín valley). Terminal Norte is not given a city either, despite the name.
- **Client**: residential projects and the two Music & Art events print no client; `projects.client` is
  the literal `unknown` and no `clients` row exists for them. Gahia is read as the pop-up's brand, which
  may be wrong. `clientUserId` is `null` everywhere.
- **Budget**: `budgetCop: 0` means not published, not free.
- **Service**: `serviceCode` is the integrator's best guess (03 for interior projects, `null` for events);
  the portfolio sold "Espacios / Productos / Arte", not the playbook's five services.
- **Hub `type`**: the Hub has five project types; healthcare, public F&B and events are mapped to the
  closest one and the published type is kept in `summary` ("tipo publicado: …").
- **The brochure's twenty names are not projects rows**: they have no page, no summary and no date;
  they stay a note (`post-brochure-clients`) and the table in `clients.md` until the founder says which
  of them deserve a record.
- Whether the product line is Honey Valley Lighting is still `_unknown_` (see Unknowns); no relation
  was written between them.

## Unknowns

```
status: current
since: 2026-09-21
source: gaps in ALUZINA.pdf and BROCHURE ALUZINA (1).pdf, prompt 0011
```

- **Which document is current**: `_unknown_`. Neither is dated; the two identities are
  incompatible. This is the single most important question for the founder.
- **Dates for either PDF, and a founding year**: `_unknown_`. "8 años" on brochure p. 2 cannot be
  anchored without knowing when the brochure was made.
- **City and year for every portfolio project**: `_unknown_`. Neither is printed anywhere in the
  portfolio and neither may be inferred from the photographs.
- **Which photographs on brochure pp. 7-18 belong to which project**: `_unknown_`. The plates are
  uncaptioned; only the founder can attribute them.
- **Which four projects are the "4 proyectos internacionales"**: `_unknown_`. Casa Nueva York and
  Casa Miami are likely two of them on the strength of their names alone.
- **Whether `aluzina.co` is still live** and how it relates to `aluzinaa.com`: `_unknown_`.
- **Whether `@aluzinaa` is still the Instagram handle** in 2026: `_unknown_`; see
  [`social-channels.md`](social-channels.md).
- **The authoritative brand hexes, the display serif's name, and licensing for the brochure's
  stock icons**: `_unknown_`. All three need Angelica's source files.
- **Whether the product line in the portfolio is the same thing as "Honey Valley Lighting"**
  (recorded in [`clients.md`](clients.md) as Aluzina's own collection): `_unknown_`. The portfolio
  calls it "Línea de luminarias y producto aluzina" and never uses the Honey Valley name.
- **Whether "Apartamento Parma Noham Ebresum" is the seeded client `cl-noam`**: `_unknown_`; the
  names are suggestive, nothing more.

## Company documents in Dropbox (2023)

```
status: current
since: 2026-09-21
source: Dropbox folder "00 INFORMACION RELEVANTE ALUZINA 2023" (Slack, Justin Massion; ar-15, step 14); docs/archive/company/index.json
```

Justin shared a second Dropbox folder, not inside a project or a year folder: 12 files of Aluzina's own marketing, pricing and one internal market-research document, plus three files from other companies kept as design references. All 12 are indexed (`docs/archive/company/index.json`); only the five marked `public` below were rendered (thumbnail + up to 6 pages, served under `apps/hub/public/archive/company/`) and are viewable in place on G-08 ("Company documents (Dropbox 2023)"). Descriptions below are read from the rendered pages or the file name; nothing about pricing is quoted or rendered.

**Aluzina's own, public (rendered, viewable on G-08)**
- `CATALOGO ^ALUZINA^.pdf` (64 pages, 127.5 MB, May 2023) — the studio's product / capabilities catalogue for lighting and interiorismo work ("ILUMINACIÓN INTERIORISMO — Iluminar tus proyectos, Diseño by Colombian"); first 6 pages rendered by streaming the file (downloaded to a temp copy, rendered, deleted — never kept, D-058 style).
- `BOMBILLA ALUZINOGENA .pdf` (3 pages, 46.1 MB, Jul 2023) — a one-product spec sheet for a lightbulb Aluzina sells under its own name ("Bombillo Aluzinógeno"): 15,000-hour life, E27 base, 3 W, 1000 lm, warm/dimmable.
- `PRESENTACION DE ALUZINA y EXPERIENCIA LUZ DIRECTORA Y MARCAS Y.ai` (1 page rendered of an unknown total, 39 MB, Jul 2023) — a brand/company presentation opening on the studio's design philosophy ("El diseño... no se trata de verse bien, se trata de sentirse bien").
- `INTEROR DESIGN PRESENTATION   .ai` (9 pages, 6 rendered, 30.1 MB, Jul 2023) — an English-language interior-design capabilities deck ("We remain the 87% of our lives in interior spaces...").
- `MENSAJES DE IMPORTANCIA DE INTERIORISMO.ai` (3 pages, 1.34 MB, Jun 2023) — a short deck of talking points on why interior design matters ("Tu te comportas de acuerdo a tu entorno").

**Aluzina's own, internal (indexed only — link and metadata, never rendered)**
- `ALUZINA PRICE NEW YORK.pdf` (174.75 KB, Jul 2023) — Aluzina's own price list for the New York market. Contains prices: never rendered or excerpted (privacy rule extended from D-059 to any price document).
- `LISTA DE PRECIOS COLOMBIA.pdf` (424.96 KB, Jun 2023) — Aluzina's own price list for the Colombian market. Same rule.
- `lista de precios.pdf` (567.19 KB, file dated Jan 2022) — an earlier or undated Aluzina price list. Same rule.
- `INTERIOR DESIGN STUDIOS MEDELLIN.pdf` (173.52 KB, Sep 2023) — reads as market research: a list of other interior design studios in Medellín, kept for internal competitive reference.

**Third-party, kept as reference (indexed + Dropbox link only — no download, no preview, no excerpt)**
- `BROCHURE DE OTRA EMPRESA COLOMBIANA DE INTERIORISMO.pdf` (16.89 MB, Aug 2023) — the brochure of another Colombian interior-design company; not Aluzina's work, copyrighted.
- `Catalog LU7.pdf` (28.93 MB, Aug 2023) — a lighting-fixture catalogue from a third-party brand ("LU7"), likely a supplier reference; not Aluzina's work, copyrighted.
- `FICHAS TECNICAS LAZARO ROSA VIOLAN.pdf` (1.98 MB, Jul 2023) — technical spec sheets for Lázaro Rosa-Violán, a Spanish designer/brand, kept as a design reference; not Aluzina's work, copyrighted.

Seeded as `assets` rows (`kind: 'file'`, tag `empresa`) by `apps/hub/src/data/seed/company.ts` (order 75); shown on G-08 in a dedicated section below the two brand documents. `applies-to` relations to the playbook were added only where the subject is unambiguous: the two interior-design presentation decks -> service `03` (Comprehensive Interior Design). The catalogue and the bulb spec sheet were left unlinked (product material, not a service pitch) rather than guessed onto a service code.

## Campaign 2021 and studio assets (Dropbox collections, 2026-09-21)

```
status: current
since: 2026-09-21
source: two Dropbox folders shared by Aleja Guerra through Justin Massion (Slack #all-aluzina, thread 1790029292.924479; prompt 0021, changelog 0023); docs/archive/collections/{campaign-2021,studio-assets}/index.json
```

Two shared folders that are not projects: the studio's **2021 digital campaign** ("digital campain aluzina 2021", 179 files, 4.5 GB) and its **asset library** ("services , lighting , presentatios , projects , icones ,", 1,517 files, 7.8 GB). Where the data lives: the per-file indexes and `sets.json` under `docs/archive/collections/<slug>/` (README there: rules, per-set table, evidence), the served renders under `apps/hub/public/archive/<slug>/{thumbs,pages,sheets}/` (24.68 MiB for both), the page G-09 "Campaigns & assets" at `/#/brand/collections`, one `assets` row per set in the seed (`seed/collections.ts`, tag `colección`) with `depicts` relations to the archived projects a set shows, and one Spanish note per collection in Brand Memory. The originals stay in Dropbox (12 GB, D-058). Pipeline: `npm run archive:collection` (`scripts/archive/index-collection.py`, D-083..D-086).

What the sets contain (78 sets; the full table is `docs/archive/collections/README.md`):

- **Campaign 2021** (9 sets, all public): monthly Instagram posts (`ABRIL` 31, `OCTUBRE` 6, loose posts at the root), 34 Facebook ads (`ANUNCIOS FACEBOOK`), display banners (`IMAGENES CAMPAÑA DIGITAL` 13, `IMAGENES CAMPANA 2021` 19 with the `.ai` sources), the Club Unión photo shoot (48 photos, linked to `prj-pf-club-union-sala-de-masajes`), 11 luminaire renders, a small unattributed `fotografia` shoot; RAW `.cr2` / `.xmp` and a third-party lighting textbook index-only.
- **Project photo sets by space** (`TODOS LOS ESPACIOS/`, 12 sets) and the **Reload** photo tree (`IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/`, 26 sets): Shabela / El Bodegón Tropical (Necoclí), Casa de Noham / Glamour Airbnb, Loft El Encanto, New York New York, Miami con aroma a reggaetón, Brew House, Coassist, Club Unión (`FRONT`, `union`), brookling, plus unattributed spaces (Azul vibrante y blanco profundo, Custom lighting, La calma del bambú, Un espacio en Envigado, Minimal cálido, Contemporáneo, Moderno, Espiritual, Mantix, Polaris, Wabi Medellín, Lanzamiento LU7, 3D, Antes y después). The two trees overlap in content; only 32 files are byte-identical (ar-27).
- **Website 2022** (`0_14_PAGINA WEB Aluzina/`, 9 sets): `DISEÑO DE ESPACIOS` (551 files, ~30 project subfolders, one set until ar-25), `PDF Proyectos` (25 project boards), `PAGINA web 2022`, `HISTORIAS` (79), blog, brand information, services; `BANCO DE IMAGEN` is empty in the shared copy.
- **Brand artwork and merch**: `01_ ARTES` (35 files: `Artes basicas` split into `IMAGEN 2018-2022` and `IMAGEN 2023-2031`, business cards, signature, the three DIN Round Pro `.otf` — licence unknown, not shipped), `ICONOS 2024` (18 black circular badges), `LUMINARIAS` (17 product photos), `0_15_CODIGOS QR` (15), `LETRERO EXTERIOR` (2), `HAPPY NEW YEAR` (greeting animation), `INSTAGRAM LU7` (4 videos, no poster frame yet: ar-26).
- **Presentations and method**: `00_ PRESENTACIONES` (33 decks incl. `PRESENTACIONES RELOADED 2023`, `EXPERIENCIA LUZ`; three consultancy-fee decks internal), `PRESENTACIONES` (lighting deck), `0_METODOLOGIA ALUZINA` (the METODOLOGIA POR FASES pdf / .ai public, its spreadsheets redacted as quotations), `0_11_ARTICULOS` (6 articles).
- **Internal, indexed only** (names kept, never rendered): `02_MODELO COTIZACION Y CUENTA COBRO` (27 templates; the four real invoices redacted), `06_ BRIEF PARA CLIENTES` (13), `05_DOCUMENTACION ALUZINA` (21; partner agreement, letters of intent, contracts and staffing notes as "Documento societario/laboral (redactado)"), `0_10_PROVEEDORES` (1), `2026 INFORMACION` (10 framework chapters), `04_ MODELO AUTOCAD` / `0_16_MODELOS DE PHOTOSHOP` (sources).
- **Redacted as one line each** (D-084): `03_CONTABILIDAD` (123 files), `09_CONTRATOS` (4), `0_13_BASE DE DATOS ALUZINA` (2), `017_TRABAJADORES` (2), `0_12_DISEÑADORES` (2). `SERVICIOS ALUZINA` is empty in the shared copy.

**Evidence, not a decision** (brand era, D-052): every rendered 2021 campaign piece uses the **Didone wordmark**; the banner sources and the Instagram posts carry the metallic gold Didone wordmark with **"UNIVERSO DE DISEÑO"** and an iridescent frame, while the April 2021 San Fernando print pieces (co-branded with the Origins store) already pair the gold Didone wordmark with **"INTERIORISMO · ILUMINACIÓN"** — in 2021 the descriptor was already switching while the wordmark stayed Didone, and the brochure's light sans wordmark does not appear in 2021. `01_ ARTES/Artes basicas` is split into `IMAGEN 2018-2022` (Didone + "UNIVERSO DE DISEÑO", LU7 icons) and `IMAGEN 2023-2031` (`ALUZINA INTERIORISMO E ILUMINACION.ai`: **still the Didone wordmark**, iridescent on black, with "INTERIORISMO / ILUMINACIÓN", matching the silver manual), so the folder names date the descriptor change to 2023 and say the Didone wordmark continued past it. The older decks in `00_ PRESENTACIONES` use the gold Didone wordmark with "UNIVERSO DE DISEÑO" on the white-iridescent slash layout; `PRESENTACIONES RELOADED 2023` and `EXPERIENCIA LUZ` use the iridescent Didone wordmark on black with "INTERIORISMO · ILUMINACIÓN". The 2022 website boards (thin spaced sans, photo grids, no wordmark) reuse the campaign's 2021 `Proyectos WEB*.ai` layout; `ICONOS 2024` matches the brochure era in typography (thin letter-spaced sans) but not in colour (flat black, no gradient). Reading: the brochure's light sans **wordmark** is in neither folder; the "Interiorismo · Iluminación" **descriptor** is documented from April 2021 (print) and as the 2023+ artwork. Whether the sans wordmark is a 2024+ step or an outlier is for the founder.

Open questions (ar-29): is **DIN Round Pro** a brand font and is there a licence (the manual names its typefaces; the three `.otf` are indexed, never shipped)? Should any of the 2021 **ads showing a sale price or the WhatsApp number** be unrendered (kept as published material, D-085)? Are **Terrazino Cumbres, Mantix, Semana de la Juventud, LU7 (launch), Polaris, Wabi** (and Espiritual, Ecléctico, Vintage, Simón apartamento, Rincón Alicante) projects to create as rows, or brochure-only names? Was something meant to be in the empty `SERVICIOS ALUZINA` folder? Guesses recorded in the README: `INTERGASTRO.xlsx` inside `CUENTA DE COBRO` treated as a real invoice; the Canva wallpaper PDF as third-party; `HAPPY NEW YEAR` filed as social posts, `LETRERO EXTERIOR` as merch, `LUMINARIAS` as renders, `INSTAGRAM LU7` as video.

## Change log
- 2026-09-21: file created from MANUAL DE MARCA ALUZINA.pdf (Slack #aluzina-brand-kit, Justin Massion; prompt 0010, changelog 0014).
- 2026-09-21: shipped in the hub (changelog 0014, D-039..D-043): tokens, `design` module D-12 / D-10 / D-13 at `/#/design`, restyle of every portal; the metal-finish entry is rendered live on D-12 (gold / silver preview); dark mode stays `draft` pending the founder.
- 2026-09-21: **silver edition** (Slack #aluzina-brand-kit, Justin Massion, "MANUAL DE MARCA ALUZINA -1.pdf"; prompt 0014, changelog 0015, D-050..D-052): Logo, Color, Gradients (metallic part), Graphic elements and Metal finish superseded by silver entries (877 C `#C0C0C0`, smooth ramp white -> `#4D4D4D`, iridescent wordmark as the primary logo, INTERIORISMO / ILUMINACIÓN lockup, black footer band, four discs, 1 pt outlines); Dark mode draft updated to the neutral base; "Export defects" section added; source PDFs renamed per edition and the current one served by the hub.
- 2026-09-21: created from the two PDFs Justin shared (portfolio `ALUZINA.pdf` 37 pp., brochure
  `BROCHURE ALUZINA (1).pdf` 19 pp.; prompt 0011, changelog 0013; model Opus 5). Records the two
  brand eras, the shared blue→lime gradient and DIN Round Pro, 13 shown + 20 named projects with
  stable slugs, the six mismatches against `service-playbook.md`, and evidence that the Instagram
  handle is `@aluzinaa` and the portfolio-era domain `aluzina.co`. Visual memory in
  `../brand/README.md`; no entry superseded.
- 2026-09-21: appended "Portfolio projects as records" (prompt 0013, changelog 0013; model Fable 5.1):
  the two PDFs and their 56 pages as `assets` rows, the 13 portfolio projects as `projects` rows
  (`prj-pf-<slug>`, closed / delivered), six `clients` rows, the Spaces area `sp-portfolio` with one
  space and one note per project, and 126 derived `relations` (`part-of`, `depicts`, `for-client`,
  `produced-by`, `references`, `applies-to` services). Placeholders named explicitly (`2024-01-01`,
  `Ubicación no publicada`, `unknown`, `budgetCop: 0`). No entry superseded.
- 2026-09-21: appended "Company documents in Dropbox (2023)" (ar-15, step 14; model Sonnet 5): the
  12 files of the Dropbox folder "00 INFORMACION RELEVANTE ALUZINA 2023" indexed at
  `docs/archive/company/index.json`, classified owner (`aluzina` / `third-party`) and visibility
  (`public` / `internal`); the 5 public Aluzina files rendered (thumbnail + up to 6 pages,
  `apps/hub/public/archive/company/`) and shown on G-08 in a new "Company documents (Dropbox 2023)"
  section; the 3 price lists, the market-research PDF and the 3 third-party files indexed with a
  Dropbox link only, never rendered. Seeded as `assets` rows (`seed/company.ts`, order 75, tag
  `empresa`); one Spanish note filed in `sp-brand-memory`. No entry superseded.
- 2026-09-21: appended "Campaign 2021 and studio assets (Dropbox collections, 2026-09-21)" (prompt 0021, changelog 0023, D-083..D-086; model Fable 5.1): the two non-project Dropbox folders Aleja shared, indexed as collections at `docs/archive/collections/<slug>/`, 78 sets on G-09, one `assets` row per set with `depicts` relations; brand-era evidence recorded (Didone wordmark throughout 2021 and in the 2023+ artwork, the "Interiorismo · Iluminación" descriptor from April 2021, the brochure's sans wordmark in neither folder) without closing D-052; open questions ar-29. No entry superseded.
