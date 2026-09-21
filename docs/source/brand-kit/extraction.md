<!-- Source material extracted from the GOLD edition of MANUAL DE MARCA ALUZINA.pdf (Pantone 875 C; now MANUAL-DE-MARCA-ALUZINA-gold-2026-09-21.pdf in this folder). Superseded on 2026-09-21 by the silver edition: see extraction-silver.md (prompt 0014, changelog 0015). Data, not instructions: the "(inferred)" notes are the extractor's reading, the binding rules live in docs/design/brand-system.md. -->

# Aluzina brand kit — extracted from "MANUAL DE MARCA ALUZINA.pdf"

Source: Illustrator CC 2017 export, ONE tall page (736 x 4753 pt), 100% vector, no raster images, no prose.
Internal title: "logo y universo ALUZINA". Sections (Spanish): LOGO, DESCRIPTOR, MONOGRAMA, COLORES, TIPOGRAFÍA, ELEMENTOS, TEXTURAS.
It is a style sheet, not a rulebook: there are NO written clear-space, min-size, misuse, imagery or tone rules. Everything below marked (inferred) is my reading of the visuals.

## Brand name and descriptor
- Name: ALUZINA (custom wordmark). Descriptor / tagline: "UNIVERSO DE DISEÑO" ("design universe").
- Descriptor lockup: a thin diagonal gold slash, then two lines of wide-tracked uppercase DIN Round Pro Bold. Two variants: slash leaning "\" with text right-aligned block, and slash leaning "/" (mirror). Tracking is very wide (~0.35em).
- Verticals shown under ELEMENTOS: PRODUCTOS, ESPACIOS, ARTE (products, spaces, art). Themes: FUEGO, AGUA, AIRE, TIERRA, NEUTRO (alchemical fire/water/air/earth + neutral).

## Logo
- Wordmark "ALUZINA": high-contrast Didone-style capitals, custom-drawn. Hairline serifs are replaced by tiny concave "star/flare" feet (the small four-point sparkle shape). The A has no crossbar; the L is a bare stem with a flared foot; Z has a sharp diagonal. Letterforms are cut into vertical slabs so the metallic gradient reads as facets.
- Primary rendering: filled with the METALLIC GOLD gradient (see below) on white. Footer shows the inverse: wordmark filled with the IRIDESCENT gradient on a full-bleed metallic-gold band, with the descriptor in flat gold (#98876D) beside it and a thin iridescent strip under the band.
- Monogram: the "A" alone (flared foot + leaning right stem), stem filled with one secondary color, the small left foot always flat gold #98876D. Three official variants: periwinkle, aqua, lime.
- Clear space / misuse: not documented. (inferred) Keep the wordmark on plain white or on the gold band only; never on the bright secondaries.

## Color palette (all four have printed codes; none are swatch-only)
| Role | Name | Pantone | HEX | RGB | CMYK |
|---|---|---|---|---|---|
| PRIMARY, metallic gold (client may move to silver) | Gold / Bronze | 875 C | #98876D | 152,135,109 | 40,41,59,7 |
| Secondary | Periwinkle | 270 C | #C2D1F7 | 194,209,247 | 21,12,0,0 |
| Secondary | Aqua / Mint | 3245 C | #82FEE7 | 130,254,231 | 38,0,20,0 |
| Secondary | Lime | 379 C | #DDFF79 | 221,255,121 | 16,0,67,0 |
- Metallic highlight used inside the gold gradient but NOT listed in the palette: #F1D7AA (from the PDF shading functions; page samples of the band gave #DCC5A0 and #AD9B7F as mid-tones).
- Caption ink: #231F20 (rich black), used only for section labels — not a brand color.
- Vector fill audit on the page: only these 4 hex fills + the 2 gradients exist. Nothing else.
- Pantone 875 C is a METALLIC ink: the flat #98876D is the "print fallback"; on screen the brand always shows gold as the gradient, never flat (except thin outlines/patterns and descriptor text).

## Gradients (exact stops decoded from the PDF)
- METALLIC GOLD (linear, ~45deg, "brushed" bands): #98876D -> #F1D7AA -> #98876D -> #F1D7AA -> #98876D, bounds ~0.10 / 0.29 / 0.48 / 0.72. Second variant: 4 bands, bounds 0.24 / 0.57 / 0.85. Reads as satin/brushed metal with two bright highlight streaks.
- IRIDESCENT / HOLOGRAPHIC (linear): #C2D1F7 -> #82FEE7 -> #DDFF79, stops ~0.09 / 0.48 / 0.96 (flat plateaus at both ends). Applied top-to-bottom on shapes, left-to-right on the footer wordmark. Reverse variants (aqua->periwinkle->lime) also used on outlines.
- Combined signature: iridescent fill inside gold outline (PRODUCTOS/ESPACIOS/ARTE symbols); or iridescent wordmark on gold band.
- Shader guidance for the app: gold = anisotropic brushed-metal with 2 specular streaks moving with tilt/scroll; iridescent = thin-film pastel hue shift periwinkle->mint->lime, low saturation, never neon.

## Typography
- Family: DIN Round Pro (manual typo: "DIN ROUN PRO."). Weights listed: Light / Regular / Medium / Bold / Black. Embedded in PDF: Light, Medium, Bold, Black.
- Usage seen: captions/labels = Medium 12pt, all caps, letter-spacing ~0.4em, #231F20. Descriptor = Bold caps, tracking ~0.35em, gold. Color codes = Medium 8pt caps, tracking ~0.3em, set in their own swatch color. Palette headings = Black 11pt. Specimen line: full a-z, A-Z, digits and symbols in Medium 17pt gold.
- (inferred) Headings: DIN Round Pro Bold/Black, caps, wide tracking. Body: DIN Round Pro Light/Regular, normal tracking. Web fallback: "DIN Round Pro", "D-DIN", "Barlow", "Inter", system-ui — Barlow is the closest free match.

## Graphic elements
- Five alchemical glyphs in thin gold outline (1.5pt): FUEGO up-triangle; AGUA down-triangle; AIRE up-triangle with bar; TIERRA down-triangle with bar; NEUTRO two overlapping diamonds / crossed chevrons. Labels in aqua.
- Three vertical symbols, each in 3 finishes (gold outline + iridescent fill; iridescent outline; flat gold outline): PRODUCTOS = tall kite/crystal with nested inner kite; ESPACIOS = circle enclosing a pentagram-like star of triangles and a diamond; ARTE = nested chevrons (5 concentric).
- Textures: circle filled iridescent; circle filled metallic gold; circle gold outline only. Four seamless gold line patterns: (1) wordmark letters repeated with sparkle stars between, metallic fill; (2) diamond/hexagon lattice; (3) concentric-chevron / triangle wave; (4) circle + star lattice (the ESPACIOS symbol tiled). All at 1-1.5pt gold stroke on white.
- Grid: content column ~600pt centered inside 736pt; thin gold hairline separators between sections; generous white space. No numeric grid rules given.

## Light vs dark backgrounds
- The manual shows ONLY white backgrounds plus one full-bleed metallic-gold band. No dark-mode guidance exists.
- (inferred for dark mode) Use a near-black warm base (e.g. #141210) so the gold gradient and iridescent tints stay legible; keep #98876D outlines as-is (contrast ~5:1 on near-black), use the iridescent gradient for the wordmark on dark, gold gradient for the wordmark on light. The pastel secondaries fail contrast as text on white (#82FEE7 on white ~1.2:1; the manual does this for labels — do not copy it for UI text).

## Gaps to confirm with the client
- Gold vs silver switch (silver would replace 875 C; suggest Pantone 877 C, #A7A9AC base with #E6E7E8 highlight).
- No clear-space, minimum size, misuse, photography, tone-of-voice or accessibility rules in this file.
