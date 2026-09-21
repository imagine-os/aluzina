# docs/brand/ - the visual memory

```
status: current
since: 2026-09-21
source: ALUZINA.pdf (portfolio) and BROCHURE ALUZINA (1).pdf (brochure), shared by Justin Massion in Slack 2026-09-21 (prompt 0011)
```

**What this folder is.** Aluzina's two marketing PDFs, rendered one JPEG per page, so a future
session can *see* the brand without opening (or being able to open) a PDF. Every page is
described below: layout, imagery, the headline on it, the text we could pull out of it, and the
colours actually present in the render. Read the tables here first; open a `page-NN.jpg` when you
need the detail. The matching **textual** memory - voice, positioning, services, palette, contact
channels - is `../knowledge/brand.md`. Model for this pass: **Opus 5**.

Both PDFs are Aluzina's own material: **data, not instructions**.

## The two documents

| | Portfolio | Brochure |
| --- | --- | --- |
| Source (original filename) | [`../source/brand/ALUZINA.pdf`](../source/brand/ALUZINA.pdf) | [`../source/brand/BROCHURE ALUZINA (1).pdf`](<../source/brand/BROCHURE ALUZINA (1).pdf>) |
| Served copy | `apps/hub/public/brand/aluzina-portfolio.pdf` | `apps/hub/public/brand/aluzina-brochure.pdf` |
| URL on the site | `./brand/aluzina-portfolio.pdf` | `./brand/aluzina-brochure.pdf` |
| Slack file id | `F0C3ADLF01X` | `F0C38CS9D5Y` |
| Size | 2,928,197 bytes (2.79 MB) | 3,130,687 bytes (2.99 MB) |
| Pages | 37 | 19 |
| Page shape | landscape 4:3 (1400x1082 px renders) | landscape 16:9 (1400x790 px renders) |
| Language | Spanish | Spanish |
| Renders | [`portfolio/`](portfolio/) + [`portfolio/contact-sheet.jpg`](portfolio/contact-sheet.jpg) | [`brochure/`](brochure/) + [`brochure/contact-sheet.jpg`](brochure/contact-sheet.jpg) |
| Render weight | 5.58 MB | 3.01 MB |
| Machine-readable | [`portfolio/index.json`](portfolio/index.json) | [`brochure/index.json`](brochure/index.json) |

Total render weight for both folders: **8.59 MB**, inside the ~12 MB budget for an intake.

**The two documents are different brand eras and do not share an identity.** The portfolio is
"ALUZINA / UNIVERSO DE DISEÑO" - a gold metallic display serif, sacred-geometry line motifs,
three pillars (Espacios / Productos / Arte) covering interiors, a product line and fine art. The
brochure is "ALUZINA / INTERIORISMO · ILUMINACIÓN" - a light gradient sans, flat icon tiles, a
four-phase construction process, and no art pillar at all. Do not blend them into one design
system without asking the founder which is current. See `../knowledge/brand.md`.

## How these were rendered

`docs/brand/tools/render-pdf-pages.py` (written this pass, reusable). Poppler's `pdftoppm` is not
installed in this environment, so the renderer uses **PyMuPDF 1.28.2** with **Pillow 12.3.0**
(`pip install pymupdf pillow`): each page is rasterized to **<= 1400 px wide, JPEG quality 80,
progressive**, then all pages are tiled 4-across into `contact-sheet.jpg` at **<= 2000 px wide**.
The script also reports, per page, the embedded text, the embedded font names, the image count and
a median-cut dominant-colour sample - that is where the "Colours seen" column and the palettes come
from. To re-run:

```sh
python3 docs/brand/tools/render-pdf-pages.py 'docs/source/brand/ALUZINA.pdf' \
  docs/brand/portfolio --label portfolio --json /tmp/portfolio.json
```

Caveat on colour: the samples are taken from a **JPEG render**, not from the PDF's colour space, so
treat them as close-enough brand values to design against, not as authoritative brand hexes. The
authoritative values are whatever Angelica holds in the source artwork.

Caveat on text: both PDFs are design-led and their text layers are thin (3391 characters across
37 portfolio pages, 2275 across 19 brochure pages) - most of the brochure's plate pages carry
no text at all. The descriptions below come from **looking at the renders**, not from the text
layer. Where the extractor mangled a ligature (`versaƟlidad` for `versatilidad`, `creaƟvidad`,
`éƟca`, `coƟdiana`) the "Text extracted" column keeps the raw output; the readable spelling is used
in `../knowledge/brand.md`.

---

# Portfolio - 37 pages

`ALUZINA portfolio (Universo de Diseño)`. Structure: cover (1), the three pillars and philosophy (2-3), **ESPACIOS**
project spreads (4-28, normally a titled opener followed by a full-bleed photo plate),
**PRODUCTOS** - the luminaire and object line (29-32), **ARTE** (33-36), contact (37).

Fonts embedded: `DINRoundPro-Light`, `DINRoundPro-Medium`, `DINRoundPro-Bold`, `(wordmark: an unnamed high-contrast display serif, outlined not embedded)`.

Palette sampled: `#c3cff5` `#b8e8ec` `#befdc8` `#e1fe87` `#988870` `#8e836d` `#ffffff`.

## Projects in the portfolio

| Slug | Name | Type | City | Year | Pages | One line |
| --- | --- | --- | --- | --- | --- | --- |
| `brewhouse-bar-cerveza-artesanal` | Brew House - bar de cerveza artesanal | commercial / hospitality | _unknown_ | _unknown_ | 4, 5 | Craft-beer bar in timber, exposed brick and warm filament lighting, with a lattice screen and barrel detailing. |
| `club-union-sala-de-masajes` | Club Unión - sala de masajes | wellness | _unknown_ | _unknown_ | 6, 7 | Massage suite for Club Unión in white and pale timber, defined by a full-height cut-out leaf-motif screen. |
| `sodime-consultorio-medico` | Sodime - consultorio médico | healthcare | _unknown_ | _unknown_ | 8, 9 | Medical clinic: reception, waiting area in orange and turquoise, and consulting rooms with etched-glass branding. |
| `terminal-norte-plazoleta-comida` | Terminal Norte - plazoleta de comida | public / food & beverage | _unknown_ | _unknown_ | 10 | Food court for the north bus terminal, presented as a site plan plus 3D renders of timber-slatted kiosks. |
| `coassist-aseguradora` | Coassist - aseguradora | commercial / office | _unknown_ | _unknown_ | 11, 12 | Insurance-company offices: glazed shopfront, etched-glass reception and an open-plan floor with a spiral stair. |
| `casa-clasico-contemporanea` | Casa clásico-contemporánea | residential | _unknown_ | _unknown_ | 13, 14 | A house mixing classical and contemporary registers: dark panelling, gilt pieces, layered art and eclectic objects. |
| `apartaestudio-i` | Apartaestudio (I) | residential | _unknown_ | _unknown_ | 15, 16 | Studio apartment with exposed brick, pale timber dining set and a low platform bed. |
| `apartamento-moderno` | Apartamento moderno | residential | _unknown_ | _unknown_ | 17, 18 | Modern apartment in soft neutrals: framed-art grid, sculptural pendants and glass-vessel styling. |
| `apartaestudio-ii` | Apartaestudio (II) | residential | _unknown_ | _unknown_ | 19, 20 | A brighter, more playful studio apartment with a chalkboard wall, a gallery wall and green patterned panels. |
| `apartamento` | Apartamento con vista | residential | _unknown_ | _unknown_ | 21, 22 | Apartment opening onto the Medellín valley: white sectional, vertical green wall and a glazed balcony. |
| `gahia-pop-up` | Gahia pop-up (Art Events) | event / retail pop-up | _unknown_ | _unknown_ | 23, 24 | Monochrome pop-up retail and exhibition fit-out with timber plinths, framed works and found-object props. |
| `music-and-art-i` | Music & Art (I) (Art Events) | event | _unknown_ | _unknown_ | 25, 26 | Art-and-music event: a warmly lit hanging show plus a thread installation and a geodesic canopy at dusk. |
| `music-and-art-ii` | Music & Art (II) (Art Events) | event | _unknown_ | _unknown_ | 27, 28 | A second, club-like music-and-art event: mirror-ball clusters, magenta and cyan wash, circular light discs. |

No city and no year is printed anywhere in the portfolio - both are `_unknown_` for every project
and must not be inferred. The Medellín valley is visible through the windows of `apartamento`, and
`terminal-norte-plazoleta-comida` is a north-terminal food court, but neither is a stated fact.

## Products in the portfolio

| Slug | Name | Pages | One line |
| --- | --- | --- | --- |
| `mandala` | Mandala | 29 | Pierced panel casting a mandala light pattern. |
| `arab-light` | Arab light | 29 | Pierced shade in an arabesque pattern. |
| `cui` | Cui | 29 | Small table lamp. |
| `gran-baul` | Gran baul | 29 | Large chest / storage piece. |
| `lampara-circular` | Lámpara circular | 30 | Ring pendant luminaire. |
| `lampara-elipse` | Lámpara elipse | 30 | Ellipse-form luminaire. |
| `lampara-vesis-pesis` | Lámpara vesis pesis | 31 | Luminaire named for the vesica piscis; throws a geometric shadow pattern. |
| `lampara-metatron` | Lámpara metatron | 31 | Luminaire on Metatron's-cube geometry; casts a lattice of shadows. |
| `lampara-paraboloide` | Lámpara paraboloide | 32 | Fabric paraboloid pendant. |
| `lampara-estrella` | Lámpara estrella | 32 | Pierced star-form luminaire. |

## Page by page - portfolio

| Page | Image | What the page shows | Text extracted (short) | Colours seen |
| --- | --- | --- | --- | --- |
| 1 | [`portfolio/page-01.jpg`](portfolio/page-01.jpg) | **ALUZINA / UNIVERSO DE DISEÑO** — Cover. Diagonal split: a periwinkle-to-aqua-to-lime gradient triangle on the left, white on the right. Gold/bronze metallic display-serif wordmark centred, with a thin diagonal slash and the letterspaced tagline. | D E D I S E Ñ O / U N I V E R S O | `#ffffff` `#bfd0e3` `#b6f6e0` `#d5fdaf` |
| 2 | [`portfolio/page-02.jpg`](portfolio/page-02.jpg) | **ESPACIOS / PRODUCTOS / ARTE** — The three-pillar diagram: line-drawn sacred-geometry icons (polyhedron, chevron, triangle) over the three pillar names, each with a paragraph. Below, the methodology statement 'UN ESPACIO PARA CADA NECESIDAD Y DESEO' and the space types: Comerciales, Personales, Efímeros. | E S P A C I O S / P R O D U C T O S / A R T E / eración y desarrollo de / ideas para crear un / elemento. / D… | `#ffffff` `#dfe0de` `#e6f9e9` `#fbfbfb` |
| 3 | [`portfolio/page-03.jpg`](portfolio/page-03.jpg) | **FILOSOFIA** — Philosophy page on white with the gradient triangle motif. Defines 'alucinación' as the root of the name, the promise TU BIENESTAR, and the 87%-of-our-lives-indoors statistic. Repeats the three pillars at the foot. | F I L O S O F I A / Una alucinación es una percepción que apunta al / imaginario, al deseo, es sentida como r… | `#ffffff` `#d6d9d5` `#eaf7e9` `#fbfbfb` |
| 4 | [`portfolio/page-04.jpg`](portfolio/page-04.jpg)<br>`brewhouse-bar-cerveza-artesanal` | **BAR CERVEZA ARTESANAL / BREW HOUSE** — Project opener. Two warm photographs of a craft-beer bar: timber tables and stools, a chalk sign reading 'Craft beer make life better', exposed brick and warm filament lighting. | B A R C E R V E Z A A R T E S A N A L / B R E W H O U S E / E S P A C I O S | `#ffffff` `#655646` `#312721` `#ab9f91` |
| 5 | [`portfolio/page-05.jpg`](portfolio/page-05.jpg)<br>`brewhouse-bar-cerveza-artesanal` | Full-bleed plate: four views of the brewhouse - the bar counter with bottle display, a barrel, a lattice timber screen and warm pendant lighting. | _(no text layer; image plate)_ | `#28221d` `#514030` `#ffffff` `#6e5e4d` |
| 6 | [`portfolio/page-06.jpg`](portfolio/page-06.jpg)<br>`club-union-sala-de-masajes` | **SALA DE MASAJES / CLUB UNION** — Project opener. A massage room in white and pale timber: treatment bed, cut-out leaf-motif folding screen, wall-mounted cabinetry, potted greenery. | S A L A D E M A S A J E S / C L U B U N I O N / E S P A C I O S | `#ffffff` `#cdcac4` `#948a84` `#f0ede4` |
| 7 | [`portfolio/page-07.jpg`](portfolio/page-07.jpg)<br>`club-union-sala-de-masajes` | Plate: further views of the massage suite - the carved leaf screen at full height, twin treatment beds, a basin and white joinery. | _(no text layer; image plate)_ | `#c9c7c0` `#8e8b7e` `#625b4f` `#ffffff` |
| 8 | [`portfolio/page-08.jpg`](portfolio/page-08.jpg)<br>`sodime-consultorio-medico` | **CONSULTORIO MEDICO / SODIME** — Project opener. A medical clinic: reception desk with the SODIME sign, a row of orange waiting chairs, wall-mounted screen, turquoise accent wall. | C O N S U LT O R I O M E D I C O / S O D I M E / E S P A C I O S | `#ffffff` `#6b5d50` `#a9afab` `#dadcde` |
| 9 | [`portfolio/page-09.jpg`](portfolio/page-09.jpg)<br>`sodime-consultorio-medico` | Plate: consulting and waiting areas - orange bench seating, turquoise panels, an etched-glass door carrying the SODIME mark. | _(no text layer; image plate)_ | `#b2bbb4` `#796b5b` `#a1a59b` `#829791` |
| 10 | [`portfolio/page-10.jpg`](portfolio/page-10.jpg)<br>`terminal-norte-plazoleta-comida` | **PLAZOLETA COMIDA / TERMINAL NORTE** — Single-page project: a food court for the north bus terminal. Shown as a colour site plan plus three 3D renders of the timber-slatted food kiosks - the only page in the portfolio led by drawings rather than photographs. | P L A Z O L E TA C O M I D A / T E R M I N A L N O R T E / E S P A C I O S | `#ffffff` `#afaca5` `#79655a` `#f2f2f1` |
| 11 | [`portfolio/page-11.jpg`](portfolio/page-11.jpg)<br>`coassist-aseguradora` | **ASEGURADORA / COASSIST** — Project opener. Insurance-company offices: the glazed shopfront with the Coassist logo, and a reception desk behind etched glass carrying a flowing line graphic. | A S E G U R A D O R A / C O A S S I S T / E S P A C I O S | `#ffffff` `#babebd` `#80776b` `#e5e5e5` |
| 12 | [`portfolio/page-12.jpg`](portfolio/page-12.jpg)<br>`coassist-aseguradora` | Plate: the open-plan office - rows of workstations, a spiral stair, a bar-height meeting table, and the flowing line graphic running along the glazing. | _(no text layer; image plate)_ | `#4b4945` `#ffffff` `#bcb9b5` `#958e85` |
| 13 | [`portfolio/page-13.jpg`](portfolio/page-13.jpg)<br>`casa-clasico-contemporanea` | **CASA CLASICO / CONTEMPORANEA** — Project opener. A classic-contemporary house: a living room mixing a gilt animal-head wall piece, dark panelling, layered art and eclectic objects. | C A S A C L A S I C O / C O N T E M P O R A N E A / E S P A C I O S | `#ffffff` `#393026` `#9e9178` `#e9e6e1` |
| 14 | [`portfolio/page-14.jpg`](portfolio/page-14.jpg)<br>`casa-clasico-contemporanea` | Plate: more rooms of the same house - a bedroom with an ornate mirror and dark timber, styled shelf vignettes with topiary and ceramics. | _(no text layer; image plate)_ | `#3f3530` `#a7a196` `#857a6d` `#ffffff` |
| 15 | [`portfolio/page-15.jpg`](portfolio/page-15.jpg)<br>`apartaestudio-i` | **APARTAESTUDIO** — Project opener. A studio apartment: pale timber dining set and stools against exposed brick, a low bed platform with cushions. | A P A R TA E S T U D I O / E S P A C I O S | `#ffffff` `#a39b8f` `#51463a` `#dee3e4` |
| 16 | [`portfolio/page-16.jpg`](portfolio/page-16.jpg)<br>`apartaestudio-i` | Plate: the same studio - a wall-mounted screen over a timber console, a round side table, patterned green feature panels. | _(no text layer; image plate)_ | `#3a2f27` `#a7a6a2` `#ffffff` `#66635a` |
| 17 | [`portfolio/page-17.jpg`](portfolio/page-17.jpg)<br>`apartamento-moderno` | **APARTAMENTO MODERNO** — Project opener. A modern apartment: a pale sofa under a framed-art grid, glass vessels on a dining table, sculptural pendant lights. | A PA R TA M E N T O M O D E R N O / E S P A C I O S | `#ffffff` `#4c4535` `#baa886` `#e5dccb` |
| 18 | [`portfolio/page-18.jpg`](portfolio/page-18.jpg)<br>`apartamento-moderno` | Plate: the same apartment - a bedroom in soft neutrals with three disc wall pieces, a floating shelf vignette, a white tulip chair by a window. | _(no text layer; image plate)_ | `#c9bb99` `#786a4e` `#b49f6e` `#a1977c` |
| 19 | [`portfolio/page-19.jpg`](portfolio/page-19.jpg)<br>`apartaestudio-ii` | **APARTAESTUDIO** — Project opener. A second studio apartment, brighter and more playful: a white-walled room with a colour-splash artwork and a soft pouffe. | A PA R TA E S T U D I O / E S P A C I O S | `#ffffff` `#a49a9d` `#675e61` `#eae4de` |
| 20 | [`portfolio/page-20.jpg`](portfolio/page-20.jpg)<br>`apartaestudio-ii` | Plate: the same studio - a chalkboard 'Shopping list' wall, a gallery wall of small frames, a green sofa, patterned green wall panels. | _(no text layer; image plate)_ | `#382d21` `#978958` `#bbad7e` `#ffffff` |
| 21 | [`portfolio/page-21.jpg`](portfolio/page-21.jpg)<br>`apartamento` | **APARTAMENTO** — Project opener. An apartment with a city outlook: white sectional sofa, coloured scatter cushions, a vertical green wall, floor-to-ceiling glazing onto the Medellín valley. | A P A R TA M E N T O / E S P A C I O S | `#ffffff` `#b5b9b7` `#58574e` `#f8f9f9` |
| 22 | [`portfolio/page-22.jpg`](portfolio/page-22.jpg)<br>`apartamento` | Plate: the same apartment - a glazed balcony with armchairs, a crate-timber feature unit, pendant glass lights. | _(no text layer; image plate)_ | `#433630` `#d4d6d3` `#ffffff` `#908f84` |
| 23 | [`portfolio/page-23.jpg`](portfolio/page-23.jpg)<br>`gahia-pop-up` | **ART EVENTS / GAHIA POP UP** — Project opener. A pop-up retail/exhibition fit-out in black and white: garments on a rail, monochrome photographs, a low timber plinth. | A R T E V E N T S / G A H I A P O P U P / E S P A C I O S | `#ffffff` `#a6a5a4` `#5e5e61` `#d3d0c9` |
| 24 | [`portfolio/page-24.jpg`](portfolio/page-24.jpg)<br>`gahia-pop-up` | Plate: the pop-up - a wall of small framed works, an animal skull and rounds of timber as props, a white shelving bay with a cloud photograph. | _(no text layer; image plate)_ | `#89847a` `#cbc5bd` `#5a5756` `#ffffff` |
| 25 | [`portfolio/page-25.jpg`](portfolio/page-25.jpg)<br>`music-and-art-i` | **ART EVENTS / MUSIC & ART** — Project opener. An art-and-music event: a warmly lit gallery room with hung works, speakers and a console. | A R T E V E N T S / M U S I C & A R T / E S P A C I O S / A R T E | `#ffffff` `#7d5f39` `#402c1d` `#d4c2a3` |
| 26 | [`portfolio/page-26.jpg`](portfolio/page-26.jpg)<br>`music-and-art-i` | Plate: the event - a suspended fabric/thread installation catching coloured light, and a crowd shot under a geodesic canopy at dusk. | _(no text layer; image plate)_ | `#0c0b0b` `#998169` `#ffffff` `#56312b` |
| 27 | [`portfolio/page-27.jpg`](portfolio/page-27.jpg)<br>`music-and-art-ii` | **ART EVENTS / MUSIC & ART** — Project opener for a second music-and-art event, darker and club-like. | A R T E V E N T S / M U S I C & A R T / E S P A C I O S / A R T E | `#ffffff` `#161520` `#322a45` `#83809d` |
| 28 | [`portfolio/page-28.jpg`](portfolio/page-28.jpg)<br>`music-and-art-ii` | Plate: the second event - mirror-ball clusters over a dancing crowd in magenta and cyan wash, a row of circular light discs, and a daylight courtyard with a mural wall. | _(no text layer; image plate)_ | `#ffffff` `#181516` `#5b4f49` `#a5a095` |
| 29 | [`portfolio/page-29.jpg`](portfolio/page-29.jpg) | **PRODUCTOS - Mandala / Arab light / Cui / Gran baul** — Product page opening the PRODUCTOS section: four named pieces photographed on white - the pierced Mandala panel, the Arab light shade, the small Cui lamp and the Gran baul chest - with lit detail shots showing the cast light patterns beneath. | P R O D U C T O S / M a n d a l a / A r a b l i g h t / C u i / G r a n b a u l / P R O D U C T O S | `#ffffff` `#5b4a39` `#c8bda3` `#fafaf8` |
| 30 | [`portfolio/page-30.jpg`](portfolio/page-30.jpg) | **LAMPARAS - circular / elipse** — Two luminaires from the Aluzina lighting line shot against dark backgrounds: a ring pendant and an ellipse form, each with a lit-in-situ shot. | L A M P A R A S / c i r c u l a r / e l i p s e / P R O D U C T O S | `#ffffff` `#352a24` `#7e7362` `#ecebdd` |
| 31 | [`portfolio/page-31.jpg`](portfolio/page-31.jpg) | **LAMPARAS - vesis pesis / metatron** — Two more luminaires: 'vesis pesis' and 'metatron', shown as object shots plus interiors where the fittings cast geometric shadow patterns across walls and ceilings. | v e s i s p e s i s / m e t a t r o n / L A M P A R A S / P R O D U C T O S | `#ffffff` `#433d34` `#967e5f` `#d1d0c7` |
| 32 | [`portfolio/page-32.jpg`](portfolio/page-32.jpg) | **LAMPARAS - paraboloide / estrella** — Two further luminaires: a fabric paraboloid pendant and a pierced 'estrella' form, with detail shots of the perforated pattern and the light it throws. | p a r a b o l o i d e / e s t r e l l a / L A M P A R A S / P R O D U C T O S | `#ffffff` `#2e2b27` `#766e5e` `#ddddca` |
| 33 | [`portfolio/page-33.jpg`](portfolio/page-33.jpg) | **COLLAGE / FOTOGRAFIA / ILUSTRACION** — Opens the ARTE section: a large framed geometric collage in sepia tones, a gold-toned mandala/geometry work, and a peacock-feather illustration. | C O L L A G E / F O T O G R A F I A / I L U S T R A C I O N / A R T E | `#ffffff` `#a88762` `#4a3c30` `#eadebe` |
| 34 | [`portfolio/page-34.jpg`](portfolio/page-34.jpg) | **DIBUJO / OLEO / ACRILICO ILUSTRACION** — Drawing and painting: two pencil/charcoal female portraits and a painted big-cat head in warm ochre. | D I B U J O / O L E O / A C R I L I C O I L U S T R A C I O N / A R T E | `#ffffff` `#4c4b47` `#a5a196` `#e7e4da` |
| 35 | [`portfolio/page-35.jpg`](portfolio/page-35.jpg) | **ARTE MURAL** — Mural work: a large black wolf-head mural being painted on a white wall (the artist at work, in frame) and a cat portrait on a mint ground. | A R T E M U R A L / A R T E | `#ffffff` `#9ca69a` `#635d55` `#cbd9d1` |
| 36 | [`portfolio/page-36.jpg`](portfolio/page-36.jpg) | **MADERA / OLEO / ACRILICO** — Painting on wood: five irregular timber cross-sections, each painted with a photoreal eye, arranged as a wall group. | M A D E R A / O L E O / A C R I L I C O / A R T E | `#ffffff` `#453835` `#726057` `#d3c5b5` |
| 37 | [`portfolio/page-37.jpg`](portfolio/page-37.jpg) | **CONTÁCTANOS** — Back cover on white. The gold wordmark and tagline, then contact rows with mint-green icons: phone, email, Instagram @aluzinaa, Facebook @aluzinaaespacio, and WWW.ALUZINA.CO at the foot. | C O N T Á C T A N O S / W W W . A L U Z I N A . C O / D E D I S E Ñ O / U N I V E R S O / @aluzinaa / @aluzin… | `#ffffff` `#fafaf9` `#d4cdc0` `#cffbee` |

---

# Brochure - 19 pages

`BROCHURE ALUZINA (Interiorismo / Iluminación)`. Structure: cover (1), credentials (2), a full-bleed statement image (3),
capabilities (4), a second statement image (5), the four-phase process (6), then thirteen
full-bleed project plates (7-18) and the back cover (19). The plates are **unlabelled** - the
brochure never says which project any photograph belongs to.

Fonts embedded: `DINRoundPro-Light`, `DINRoundPro-Medium`, `DINRoundPro-Bold`, `Calibri`, `Calibri-Bold`.

Palette sampled: `#bfd0e3` `#b6f6e0` `#cfffde` `#d5fdaf` `#e3ff9a` `#000000` `#ffffff`.

## Clients and projects named in the brochure

All twenty are named on **page 2** only, as two numbered lists of ten. Nothing on the plate pages
is captioned, so no photograph can be attributed to any of these names from this document alone.
Three of them are the same clients the portfolio shows work for; those rows carry `↔`.

| Slug | Name | Type | City | Year | Pages | One line |
| --- | --- | --- | --- | --- | --- | --- |
| `apartamento-parma-noham-ebresum` | Apartamento Parma Noham Ebresum | residencial | _unknown_ | _unknown_ | 2 | Residential list #1. Possibly the same client as the seeded `cl-noam` / Noam Residential - unconfirmed. |
| `casa-nueva-york-colin-kamesh-raja` | Casa Nueva York Colin Kamesh Raja | residencial | _unknown_ | _unknown_ | 2 | Residential list #2. Name embeds 'Nueva York'; a likely candidate for one of the 4 international projects - unconfirmed. |
| `casa-miami-ovy-on-the-drums` | Casa Miami Ovy on the drums | residencial | _unknown_ | _unknown_ | 2 | Residential list #3. Name embeds 'Miami'; likely a second international project. 'Ovy on the Drums' is a Colombian music producer - unconfirmed as the client. |
| `apartamento-la-estrella-estela-clavel` | Apartamento La Estrella Estela Clavel | residencial | _unknown_ | _unknown_ | 2 | Residential list #4. Name embeds La Estrella (Medellín metropolitan area). |
| `apartamento-poblado-rio-escondido` | Apartamento Poblado Rio Escondido | residencial | _unknown_ | _unknown_ | 2 | Residential list #5. Name embeds El Poblado, Medellín. |
| `apartamento-terrasino-cumbres` | Apartamento Terrasino Cumbres | residencial | _unknown_ | _unknown_ | 2 | Residential list #6. |
| `parta-estudio-loma-de-los-parra` | Parta estudio loma de los parra | residencial | _unknown_ | _unknown_ | 2 | Residential list #7, printed exactly so; 'Parta estudio' reads as a typo for 'Apartaestudio'. Name embeds Loma de los Parra, Medellín. |
| `apartamento-seta` | Apartamento Seta | residencial | _unknown_ | _unknown_ | 2 | Residential list #8. |
| `apartaestudio-asemssi` | Apartaestudio Asemssi | residencial | _unknown_ | _unknown_ | 2 | Residential list #9. |
| `apartamento-cubik-envigado` | Apartamento Cubik Envigado | residencial | _unknown_ | _unknown_ | 2 | Residential list #10. Name embeds Envigado (Medellín metropolitan area). |
| `hotel-mantyx` | Hotel Mantyx | comercial | _unknown_ | _unknown_ | 2 | Commercial list #1. Listed separately from 'Mantyx' (#7), so the studio counts two Mantyx engagements. |
| `coassist` | Coassist<br>↔ `coassist-aseguradora` | comercial | _unknown_ | _unknown_ | 2 | Commercial list #2. Same client as the portfolio's Coassist insurance offices. |
| `bebo` | Bebo | comercial | _unknown_ | _unknown_ | 2 | Commercial list #3. |
| `sodime` | Sodime<br>↔ `sodime-consultorio-medico` | comercial | _unknown_ | _unknown_ | 2 | Commercial list #4. Same client as the portfolio's Sodime medical clinic. |
| `area-metropolitana-de-medellin` | Área metropolitana de Medellín | comercial / public sector | _unknown_ | _unknown_ | 2 | Commercial list #5. A public-sector authority, not a private client. |
| `semana-de-la-juventud` | Semana de la juventud | comercial / event | _unknown_ | _unknown_ | 2 | Commercial list #6. A youth-week event, most likely tied to the Medellín city programme. |
| `mantyx` | Mantyx | comercial | _unknown_ | _unknown_ | 2 | Commercial list #7. See also Hotel Mantyx (#1). |
| `alcaldia-de-medellin` | Alcaldía de Medellín | comercial / public sector | _unknown_ | _unknown_ | 2 | Commercial list #8. The Medellín city hall - public sector. |
| `london-city-barber-shop` | London City barber shop | comercial / retail | _unknown_ | _unknown_ | 2 | Commercial list #9. |
| `brewhouse-cerveceria` | Brewhouse cervecería<br>↔ `brewhouse-bar-cerveza-artesanal` | comercial / hospitality | _unknown_ | _unknown_ | 2 | Commercial list #10. Same client as the portfolio's Brew House craft-beer bar. |

## Page by page - brochure

| Page | Image | What the page shows | Text extracted (short) | Colours seen |
| --- | --- | --- | --- | --- |
| 1 | [`brochure/page-01.jpg`](brochure/page-01.jpg) | **ILUMINACIÓN** — Cover. A soft prism/light-refraction photograph on white; the ALUZINA wordmark in a light letterspaced sans filled with a blue-to-mint-to-lime gradient, with a diagonal slash and the lockup INTERIORISMO / ILUMINACIÓN, then the handle and phone. | I L U M I N A C I Ó N / @ a l u z i n a a  + 5 7 3 1 0 3 9 0 6 7 7 3 | `#ffffff` `#d1ddf2` `#fdfdfe` `#e1faee` |
| 2 | [`brochure/page-02.jpg`](brochure/page-02.jpg) | **SOMOS** — The credentials page. 'SOMOS' set huge in a lime-to-aqua gradient; a gradient panel reading 8 AÑOS / 50 Proyectos en Colombia / 4 Proyectos Internacionales; 'más de 16.743 m2 DE EXPERIENCIA'; the values sentence; and two ten-item client lists headed RESIDENCIAL (aqua) and COMERCIAL (lime). | Las constantes de nuestro trabajo son / la búsqueda de coherencia, armonía, / vanguardia, / versaƟlidad, / cr… | `#ffffff` `#fafafa` `#baf9e4` `#cfffde` |
| 3 | [`brochure/page-03.jpg`](brochure/page-03.jpg) | **HACEMOS VISIONES** — Full-bleed interior: a double-height hospitality space with a wrought-iron balcony, a colourful figurative mural and an artificial-turf floor with a football goal. Caption: 'Evocaremos la magia de la transformación espacial y el poder de un diseño que trascienda lo visual.' | Evocaremos la magia de la transformación espacial / y el poder de un diseño que trascienda lo visual. | `#b0b1af` `#49504d` `#ac957b` `#c8c3b3` |
| 4 | [`brochure/page-04.jpg`](brochure/page-04.jpg) | **DISEÑO RESIDENCIAL / HOTELERIA / COMERCIAL** — Capability page. Three gradient tiles with line illustrations (house, hotel, storefront) name the three markets; below, four icon tiles name the four capabilities INTERIORISMO, MOBILIARIO, ILUMINACION, CONSTRUCCION. At right, the 'Somos empresarios con visión de negocio' statement. | INTERIORISMO / MOBILIARIO / CONSTRUCCION / DISEÑO / HOTELERIA / DISEÑO / COMERCIAL / DISEÑO / RESIDENCIAL / I… | `#ffffff` `#92f7de` `#8baaab` `#d1f3da` |
| 5 | [`brochure/page-05.jpg`](brochure/page-05.jpg) | **Somos parte de la vida cotidiana de las personas.** — Full-bleed residential interior: a long room in pale timber with an olive sofa, a glass coffee table, a shaggy rug and large plants; a faint 'LUZ' graphic on the wall. | Somos parte de la vida coƟdiana / de las personas. | `#bfbbb4` `#c9a078` `#796342` `#aaa291` |
| 6 | [`brochure/page-06.jpg`](brochure/page-06.jpg) | **FASE 1 / FASE 2 / FASE 3 / FASE 4** — The process page: four gradient chips across the top - CONCEPTUALIZACION, CONSTRUCTIVOS/LICENCIA, DETALLES, SUPERVISION/CIERRE - each with its steps listed, over a horizontal milestone timeline. Closing line on collaborative, coherent design. | Concepto base / Línea base / Modelo base / Producción de entrega / CONCEPTUALIZACION / FASE 1 / Preproyectos… | `#ffffff` `#9afdce` `#babec1` `#bdeaea` |
| 7 | [`brochure/page-07.jpg`](brochure/page-07.jpg) | Plate: a living room with a full-height timber-slat wall, a deep grey modular sofa, timber pendant cluster and a patterned rug. | _(no text layer; image plate)_ | `#3e3124` `#a48d74` `#645849` `#cdbfad` |
| 8 | [`brochure/page-08.jpg`](brochure/page-08.jpg) | Plate: a loft-like room with black steel-framed glazing onto greenery, a drop-down projector screen showing a film, a hammock and a low platform bed. | _(no text layer; image plate)_ | `#a08669` `#3d2c1d` `#6d5a45` `#85684c` |
| 9 | [`brochure/page-09.jpg`](brochure/page-09.jpg) | Plate: an indoor-outdoor dining and lounge space - exposed brick and concrete, a planted green wall, a tan leather sofa, a long timber table and a linear fireplace. | _(no text layer; image plate)_ | `#a08d67` `#3c2a1a` `#615435` `#816343` |
| 10 | [`brochure/page-10.jpg`](brochure/page-10.jpg) | Plate: a bedroom with a timber-slat headboard wall, a large woven rattan pendant, and a bed on a raised timber platform. | _(no text layer; image plate)_ | `#d2c6b6` `#4d301c` `#714f34` `#895e3a` |
| 11 | [`brochure/page-11.jpg`](brochure/page-11.jpg) | Plate: a kitchen with a perforated timber wine wall, an island with pale timber stools, open black-steel shelving, integrated fridge and greenery. | _(no text layer; image plate)_ | `#2e1f14` `#654b32` `#8c7454` `#c6b192` |
| 12 | [`brochure/page-12.jpg`](brochure/page-12.jpg) | Plate: a dining area against a full-wall 'Medellín' graffiti mural in hot colours, with a live-edge timber table, black wire chairs and an orange bench. | _(no text layer; image plate)_ | `#97b2bf` `#5c484f` `#6c8699` `#d8b8a2` |
| 13 | [`brochure/page-13.jpg`](brochure/page-13.jpg) | Plate: a bar/gaming room - a green-baize table, a large pop-art female mural, Moroccan pierced pendant lamps, red damask walls and gilt panelling. | _(no text layer; image plate)_ | `#302623` `#998d77` `#9b583f` `#dfd0b8` |
| 14 | [`brochure/page-14.jpg`](brochure/page-14.jpg) | Plate: an outdoor terrace over the valley - a pool with arcing water jets under a white steel pergola, artificial turf, a slide and a climbing wall. | _(no text layer; image plate)_ | `#223d32` `#7db2b3` `#2c6847` `#c4d5d7` |
| 15 | [`brochure/page-15.jpg`](brochure/page-15.jpg) | Plate: a living room with floor-to-ceiling glazing onto the city, a white media unit with a large TV, turquoise upholstery and a pale sectional. | _(no text layer; image plate)_ | `#788783` `#434141` `#a1b7bc` `#ccced5` |
| 16 | [`brochure/page-16.jpg`](brochure/page-16.jpg) | Plate: a study/office with a saturated yellow feature wall, a white desk and task chair, a black shelf with cameras and framed pieces. | _(no text layer; image plate)_ | `#906d1b` `#383226` `#615b4d` `#a99246` |
| 17 | [`brochure/page-17.jpg`](brochure/page-17.jpg) | Plate: a bedroom in soft neutrals - built-in wardrobes in pale timber, full-height curtains, an upholstered bench and a jacket on a stand. | _(no text layer; image plate)_ | `#56482c` `#c0bea5` `#d0d6ca` `#8d8567` |
| 18 | [`brochure/page-18.jpg`](brochure/page-18.jpg) | Plate: a white spa/wellness room - a stone-clad wall with an inset screen and pebble niche, a deeply tufted white platform, gold accents and a small sculptural table. | _(no text layer; image plate)_ | `#8c8a83` `#bbb3a2` `#cbc2b0` `#ab9d89` |
| 19 | [`brochure/page-19.jpg`](brochure/page-19.jpg) | Back cover: the gradient ALUZINA wordmark, the INTERIORISMO / ILUMINACIÓN lockup, the handle and phone, over a pale prism photograph. Mirrors the cover. | I L U M I N A C I Ó N / @ a l u z i n a a  + 5 7 3 1 0 3 9 0 6 7 7 3 | `#ffffff` `#f2f3f6` `#c3eee0` `#fafefb` |

---

## Using this index

- **Citing the brand in a spec or page doc:** point at the page image, e.g.
  `docs/brand/brochure/page-06.jpg` for the four-phase process, `docs/brand/portfolio/page-01.jpg`
  for the gold wordmark.
- **Seeding data:** `portfolio/index.json` and `brochure/index.json` carry every project with a
  stable kebab-case `slug`, the `pages[]` it appears on, and `relatedPortfolioSlug` where a
  brochure client matches a portfolio project. A schema worker can seed `projects` rows and their
  relations from those two files without reopening the PDFs.
- **Adding another source document:** run the renderer into a new `docs/brand/<doc>/` folder, write
  its `index.json` in the same shape, and add a section here.

## Change log

- 2026-09-21: folder created; portfolio (37 pages) and brochure (19 pages) rendered to JPEG with
  contact sheets, `index.json` written for both, every page described (prompt 0011, changelog 0013;
  model Opus 5).
