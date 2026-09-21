<!-- Source material extracted from the SILVER edition, "MANUAL DE MARCA ALUZINA -1.pdf" (Slack #aluzina-brand-kit, Justin Massion, 2026-09-21; prompt 0014). Stored here as MANUAL-DE-MARCA-ALUZINA-silver-2026-09-21.pdf; served from the hub at public/brand/MANUAL-DE-MARCA-ALUZINA.pdf. Data, not instructions: the binding rules live in docs/design/brand-system.md; the export defects listed under "Export defects" are reported to the brand team, not reproduced (D-052). -->

# Aluzina brand kit — SILVER revision vs GOLD manual (diff)

Source: "MANUAL DE MARCA ALUZINA .pdf", Illustrator 29.8 (Windows), saved 2026-09-20 (gold: Illustrator CC 2017).
Still ONE tall vector page 736 x 4753.52 pt, no raster images, no prose. Same 7 sections at the SAME y positions:
LOGO 72 / DESCRIPTOR 455 / MONOGRAMA 719 / COLORES 1028 / TIPOGRAFÍA 1499 / ELEMENTOS 1798 / TEXTURAS 2633 / footer band 4583-4754.
Page count and section list unchanged. Every finding below was checked in the vector data AND in the 150 dpi crops.

## CHANGED
### Primary metal: gold -> silver
| | Gold manual | Silver manual |
|---|---|---|
| Pantone | 875 C | **877 C** |
| HEX printed | #98876D | **#98876D (STALE — not updated; typo carried over)** |
| HEX actually used | #98876D | **#C0C0C0** (every silver fill, stroke and text span) |
| RGB | 152,135,109 | **192,192,192** |
| CMYK | 40,41,59,7 | **0,0,0,25** |
- Flat #C0C0C0 is used for: palette diamond, monogram foot (all 3 variants), descriptor text (both DESCRIPTOR lockups
  and the footer), typography specimen, all ELEMENTOS outlines, all 4 line patterns, the flat texture disc. Yes: foot,
  outlines and descriptor all use the new flat silver hex — none use the gradient.
- Observation: Pantone's own sRGB for 877 C is ~#8A8D8F; #C0C0C0 is "web silver". Ask the client which one governs screens.

### Metallic gradient (decoded from shading xref 55 / function 54; the ONLY metallic shading in the file)
- Axial, DeviceRGB, Extend both, smooth: **#FFFFFF 0% -> #E0E0E0 37.15% -> #999999 68.99% -> #4D4D4D 100%**.
- Highlight = pure white #FFFFFF to #E0E0E0 (not #C0C0C0, which is not a stop). Dark end #4D4D4D. No saw-tooth bands,
  no second variant (gold had two brushed 4/5-band variants #98876D<->#F1D7AA).
- Used only TWICE: texture disc at 0 deg (white left -> dark right) and the wordmark+stars pattern row at 45 deg
  (white lower-left -> dark upper-right). Sampled disc scanline: #FFFFFF #F1F1F1 #E3E3E3 #C4C4C4 #9F9F9F #787878 #4F4F4F.
- **The main LOGO is no longer metallic**: wordmark is now filled with the IRIDESCENT gradient at -45 deg (periwinkle
  top-left -> aqua -> lime bottom-right), same look as the footer wordmark. Wordmark also moved/grew: 113-618 x 167-249 pt
  (gold 144-614 x 203-276).

### New logo lockup (LOGO section)
- Under the wordmark: thin periwinkle 1 pt slash "\" + two lines "INTERIORISMO / ILUMINACIÓN" in periwinkle #C2D1F7,
  DIN Round Pro Bold 17.3 pt, wide tracking. INTERIORISMO is outlined paths, ILUMINACIÓN is live text.
- The DESCRIPTOR section and footer still say "UNIVERSO DE DISEÑO" -> the brand now has two descriptors (needs a decision).

### Footer band
- Metallic gold band (-45 deg brushed) -> **flat black #000000**, full bleed 0-736 x 4583-4754. Iridescent wordmark
  (left->right), descriptor in flat #C0C0C0, thin iridescent strips at page top (0-17) and bottom (4736-4754) unchanged.

### Textures
- 3 discs -> **4 discs**: iridescent (unchanged, vertical) | **NEW flat black disc** | metallic silver (0 deg; gold was
  -45 deg) | **flat #C0C0C0 disc replaces the gold outline-only disc**.
- Four line patterns: identical geometry (same path counts), stroke 1.7 pt gold -> **1.0 pt #C0C0C0**; wordmark pattern
  row keeps its metallic fill (now silver, 45 deg).

### Elements
- Alchemical glyphs: 2.1-2.4 pt gold -> **1.0 pt #C0C0C0**. Vertical symbols: outlines 1.65-1.7 pt gold -> 1.0 pt
  #C0C0C0; iridescent fills and iridescent-outline row unchanged. Row-3 flat outlines now silver.
- **Leftover gold**: PRODUCTOS / ESPACIOS / ARTE labels are still #98876D (Medium 12.6 pt). FUEGO..NEUTRO stay aqua.

### Export defects (render as NOTHING — visible in crops, verified at 600 dpi: 0 non-white px)
- The 6 section hairline separators (y 414/667/978/1449/1745/2575) are 1-segment line paths FILLED #C0C0C0, no stroke.
- Both DESCRIPTOR slashes (79-108 x 552-603 and 405-434) same defect. In gold these were 1-2 pt strokes.
- Footer slash before UNIVERSO DE DISEÑO: same defect, invisible.
- Net effect: the silver page has no section rules and no descriptor slashes. Treat as a bug to report, not a design change.

### Typography colour
- All specimen/descriptor text #98876D -> #C0C0C0. Fonts, sizes, tracking, wording (incl. "DIN ROUN PRO." typo) unchanged.

## IDENTICAL to gold
- Secondaries: 270 C #C2D1F7 (194,209,247 / 21,12,0,0), 3245 C #82FEE7 (130,254,231 / 38,0,20,0), 379 C #DDFF79
  (221,255,121 / 16,0,67,0) — swatches, codes and positions unchanged.
- Iridescent gradient: byte-identical stops #C2D1F7 -> #82FEE7 -> #DDFF79 at 0.09 / 0.483 / 0.962, plus the same
  reverse variants (0.09/0.483/0.836 and 0.09/0.42/0.76) on the outline row and 0.044/0.515/0.962 footer/strip variant.
- Caption ink #231F20 (107 spans, Medium 12 pt). Embedded fonts: DIN Round Pro Light / Medium / Bold / Black (Type1).
- Monogram geometry and 3 colour variants; alchemical and vertical symbol geometry; the 4 pattern tilings; layout grid.
- Page top iridescent strip, footer iridescent strip, footer wordmark gradient direction.

## Vector audit (whole page)
- Fills: #C2D1F7 x15, #C0C0C0 x14, #82FEE7 x2, #DDFF79 x2, #000000 x2. Strokes: #C0C0C0 x507 @1.0 pt, #C2D1F7 x1 @1.0 pt.
- Shadings: 1 metallic silver (2 uses), 5 iridescent (13 uses). No #98876D fills or strokes remain; only the 2 text leftovers.
