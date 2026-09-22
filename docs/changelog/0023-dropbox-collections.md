version: 0.15.0
date: 2026-09-21
prompt: 0021
intent: Aleja Guerra's two Dropbox folders that are not projects — the 2021 digital campaign and the studio's asset library ("services, lighting, presentations, projects, icons") — downloaded (12.3 GB, 1,696 files), classified with the D-059 rules extended to whole folders and templates, rendered within a 25 MiB budget, indexed as two lazily loaded collections, seeded as one `assets` row per set, and shown on the new Brand page G-09 "Campaigns & assets"; QA matrix 0005; SEED_VERSION 12.
decision: D-083 (a Dropbox collection is `docs/archive/collections/<slug>/index.json`, loaded lazily, never seeded per file; the seed carries one `assets` row per set), D-084 (redaction extensions: one folder-level redacted row for wholly private folders, template folders keep names but never render, currency / quotation content makes a document internal, phones and emails are replaced in excerpts), D-085 (the studio's own published marketing pieces keep their renders even when the artwork shows a price or the WhatsApp number; excerpts drop the figures), D-086 (served budget per collection pass: 25 MiB combined, 512 px thumbs, <= 4 pages, contact sheet + 12 thumbs over 24 renderable files, md5 dedupe; RAW / psd / dwg / fonts / third-party index-only; no third-party font shipped without a licence)
rejected: seeding the 1,568 file rows (the store would pass the 4.5 MB localStorage line and an eager glob would put them in the main bundle: D-083); one `assets` row per file behind a lazy provider (ar-19 first); rendering RAW camera files, `.psd`, `.dwg`, the three DIN Round Pro fonts and the third-party textbook and catalogues (D-068 / D-086); previewing the accounting, contracts, staff, designers and customer-database folders even as file names (D-084); unrendering the 2021 ads that show a sale price or the WhatsApp number (published material, D-085, founder can reverse); splitting `web-diseno-de-espacios` into ~30 project sets in this pass (ar-25); perceptual-hash dedupe of the Reload / Espacios photo trees (ar-27); a hub card for G-09 (the brand portal nav carries it; the hub keeps one brand card)
files: scripts/archive/index-collection.py, package.json (`archive:collection`, 0.15.0), apps/hub/package.json (0.15.0), docs/archive/collections/{README.md,campaign-2021/{index,sets}.json,studio-assets/{index,sets}.json}, apps/hub/public/archive/{campaign-2021,studio-assets}/{thumbs,pages,sheets}/ (743 files, 24.7 MiB), apps/hub/src/domain/collections.ts, apps/hub/src/data/seed/{collections,index}.ts (SEED_VERSION 12), apps/hub/src/modules/brand/{CollectionsPage.tsx,index.ts,specs.ts,strings.ts,brand.css}, apps/hub/src/components/atom/Icon/iconMap.ts, apps/hub/src/modules/README.md, docs/pages/G-09.md, docs/screenshots/G-09/*, docs/qa/0006-collections-qa.md, docs/prompts/0021-dropbox-campaign-and-assets.md, docs/decisions.md, docs/kanban.md, docs/plan/plan.json (0.15.0), docs/build-plan.md, docs/knowledge/{brand,archive}.md, docs/archive/README.md, docs/README.md, docs/reference/surfaces.md; removed docs/changelog/_pending/brand-collections.md
codes: G-09
model: Fable 5.1 (classification, `index-collection.py`, seed, integration), Opus 5 (G-09 page), Sonnet 5 (QA matrix and captures 0006)

# 0023 - Dropbox collections: the 2021 digital campaign and the studio asset folder

Justin, in #all-aluzina (prompt 0021), relayed two Dropbox links from Aleja Guerra with the captions "digital campain aluzina 2021" and "services , lighting , presentatios , projects , icones ,": "Here sre some more items for you to import and organize into the system as appropriate for usefulness and examples". Neither folder is a project folder, so the step-14 pipeline (one project = one deep index seeded file by file) did not fit: the two folders hold 1,696 files, and the store already sits at 3.66 MB of the 4.5 MB localStorage line (changelog 0021 A). This pass introduces a **collection**: a shared folder indexed as one JSON, loaded lazily by the page that shows it, and seeded only as one row per set. Three workers ran in parallel — the pipeline (A, B, D, E), the page (C, its draft merged from `docs/changelog/_pending/brand-collections.md`) and the QA matrix (F) — and this integration pass wrote the numbered docs and verified the whole (G, H).

## A. Intake and inventory (Fable 5.1)

- **Two zips** downloaded from the share links (read-only, through the proxy) and unzipped outside the repo: `digital campain aluzina 2021` 179 files, 4.5 GB; `services , lighting , presentatios , projects , icones ,` 1,517 files, 7.8 GB. Together **1,696 files, 12.3 GB**. The originals never enter the repo (D-058); the unzip tree is the pipeline's `--src`.
- **Dropbox's zip mangled non-ASCII names** (`#Uxxxx` escapes, three of them Mac-Roman mis-decodings): `decode_name()` in the script restores `Ñ`, `ñ`, `Í`, `í`, `¡`, `×`, `—`, checked against `DISEÑO`, `EFÍMERO`, `Medellín`, `¡El diseño!`.
- **What the inventory found**: 39 md5-identical duplicate pairs (32 inside the studio folder count as index rows pointing at their original, the rest are the same content under redacted names or in the campaign's contact-sheet overflow), 14 `.icloud` stubs (files that were never downloaded to the machine that synced the folder), 2 AutoCAD `.bak`, 1 `.dwl2`, 2 macOS aliases and 2 truncated 158-byte JPEGs — all indexed with the tag `roto` and never rendered — and two folders that are **empty in the shared copy**: `SERVICIOS ALUZINA` (the caption's first word, so worth telling the founder) and `0_14_PAGINA WEB Aluzina/BANCO DE IMAGEN`.
- **Attribution as shared**: the header of each index carries `sharedBy` ("Aleja Guerra (via Justin Massion, Slack #all-aluzina)"), `sharedAt` 2026-09-21, the caption verbatim and the share link; `indexedAt` is the run time.

## B. Collections index and renders (Fable 5.1)

`scripts/archive/index-collection.py` (`npm run archive:collection -- --src <dir> --slug <slug>`) classifies every file, plans the renders against a budget, renders (PyMuPDF for pdf / ai, Pillow for images, pillow-heif for HEIC, first frame for GIF, LibreOffice for Office files, ffmpeg for a video frame), runs the R7 privacy self-check and only then writes `docs/archive/collections/<slug>/{index,sets}.json` and `apps/hub/public/archive/<slug>/{thumbs,pages,sheets}/`. Idempotent (renders that match the plan are kept, unreferenced ones pruned); `--dry-run` prints the plan. The full rules table, per-set served bytes and the evidence notes are in `docs/archive/collections/README.md`.

**Rules** (D-059 R1..R7 ported; D-068; D-084..D-086 new):

- **Sets** are one per meaningful folder (top-level subfolders of the campaign; in the studio folder one per space under `TODOS LOS ESPACIOS/`, one per subfolder of `Imagenes Reload/`, one per second-level folder of `0_14_PAGINA WEB Aluzina/`, one per other `ALUZINA/*` folder; loose files go to a `*-root` set). 19 kinds (`social-posts`, `ads`, `banners`, `photo-shoot`, `project-photos`, `renders`, `icons`, `qr`, `merch`, `presentations`, `methodology`, `articles`, `website`, `video`, `fonts`, `sources`, `templates`, `company-docs`, `internal`).
- **Public + render**: the whole campaign except RAW (`.cr2` / `.xmp`) and the third-party lighting textbook; in the studio folder the spaces, the Reload photos, icons, luminaires, presentations, the LU7 videos, the website folders, QR codes, merch art, the greeting animation, the exterior sign, articles and methodology.
- **Redaction**: R1 name pattern -> "<Tipo> (redactado).<ext>" with no render or excerpt; **R2 folder-level rows** (D-084) for `03_CONTABILIDAD` (123 files), `09_CONTRATOS` (4), `0_13_BASE DE DATOS ALUZINA` (2), `017_TRABAJADORES` (2), `0_12_DISEÑADORES` (2): one row each with a count, no file names; **template folders** (`02_MODELO COTIZACION Y CUENTA COBRO`, `06_ BRIEF PARA CLIENTES`) keep their file names, internal, never rendered; **R3 content** (D-084): a document whose text carries a currency amount or quotation wording is internal with no render or excerpt (three consultancy decks, four price-named files); every excerpt replaces phones and emails with "[teléfono omitido]" / "[correo omitido]" and drops when it carries prices, cédula / NIT or birth data; **R4** the three TESTIMONIO portraits become "Testimonio de cliente N" and stay unrendered with the two testimonial `.ai` files and the business cards; the founder's own name stays public; **R5** company, client and project names stay. Company documents (`05_DOCUMENTACION ALUZINA`) are internal with names kept; partner agreement, letters of intent, contracts, staffing notes and the meeting minute are "Documento societario/laboral (redactado)".
- **Third-party** (D-068; owner `third-party`, index only): the campaign textbook, two Foscarini catalogues, the Moroso catalogue, `MyLight.pdf`, a Canva wallpaper export and the three **DIN Round Pro** `.otf` files (tag `fuente`, "licence unknown, not shipped": D-086).
- **Published pieces with figures** (D-085): a few 2021 Instagram / Facebook ads show a sale price ("SALE $380.000") or the studio's WhatsApp number inside the artwork; they were published by the studio, so the renders stay and only the excerpts drop the figures. The founder can ask for any of them to be unrendered (section G).
- **Budget** (D-086): thumbs 512 px q72 (PNG with alpha only for the icon set), pages <= 4 per document (<= 3 for `.ai` over 100 MB), campaign pages 1200 px q72, studio pages 1000 px q68, contact sheets 4 x 320 px cells (<= 48, sampled evenly across a set's subfolders) at q64; a set with more than 24 renderable files gets one contact sheet plus 12 thumbnails (documents first) and the rest are index-only rows — applied to 3 campaign sets and 7 studio sets; md5 dedupe gives one render per content. Result: **campaign 5.1 MB (96 thumbs, 36 pages, 3 sheets), studio 19.5 MB (513 thumbs, 88 pages, 7 sheets), 25,878,267 B = 24.68 MiB combined** of the 25 MiB line; 743 served files, none over 5 MB.
- **Not rendered for tooling reasons**: the four videos (the bundled ffmpeg cannot decode H.264: no poster frame) and `DESIGN PRESENTACION ALUZINA.pptx` (LibreOffice conversion failed); both keep their rows (ar-26).
- **Project links** (`projectIds`, D-060): inferred only from explicit folder / file name tokens and only for ids that exist in the seed (`prj-ar-*` archive rows, `prj-pf-*` portfolio rows): SHABELA, CASA DE NOHAM / Glamour AIRBNB, EL ENCANTO, NEW YORK, MIAMI, CLUB UNION, COASSIST, SODIME, BREW HOUSE, BONNY, JOE GALLINA, INTERGASTRO, brookling, DANS BAR, BIOTECTURA. Names with no row (TERRAZINO CUMBRES, MANTIX, SEMANA DE LA JUVENTUD, LU7, POLARIS, WABI, ESPIRITUAL, ECLECTICO, VINTAGE, SIMON APARTAMENTO, RINCON ALICANTE) are listed in the set note as "atribución desconocida"; nothing was invented.
- **R7 privacy self-check** (recorded in each index's `privacyCheck`): no person name from the list in any name, path, note or excerpt; no public or rendered row whose name matches the pattern unless in the "(redactado)" form; no currency / ID / phone / email pattern in any excerpt or note; every served path exists and nothing unreferenced is served. Both runs passed; a failure exits 1 and writes nothing.

### Per-set summary

**`campaign-2021` — Digital campaign 2021 / Campaña digital 2021**: 9 sets, 179 files (4.8 GB at the source), 0 redacted rows; served 96 thumbs, 36 pages, 3 contact sheets = 5.1 MB. Served bytes per set: `docs/archive/collections/README.md`.

| Set | Folder | Kind | Visibility | Files | Redacted | Source size | Projects (`depicts`, inferred D-060) |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| `root` | `(root)` | social-posts | public | 9 | 0 | 559.8 MB | — |
| `abril` | `ABRIL` | social-posts | public | 31 | 0 | 478.3 MB | — |
| `anuncios-facebook` | `ANUNCIOS FACEBOOK` | ads | public | 34 | 0 | 2294.7 MB | — |
| `imagenes-campana-digital` | `IMAGENES CAMPAÑA DIGITAL` | banners | public | 13 | 0 | 1.2 MB | — |
| `imagenes-campana-2021` | `IMAGENES CAMPANA 2021` | banners | public | 19 | 0 | 405.0 MB | — |
| `imagenes-club-union` | `IMAGENES CLUB UNION` | photo-shoot | public | 48 | 0 | 629.5 MB | `prj-pf-club-union-sala-de-masajes` |
| `imagenes-luminarias` | `IMAGENES LUMINARIAS` | renders | public | 11 | 0 | 24.5 MB | — |
| `octubre` | `OCTUBRE` | social-posts | public | 6 | 0 | 1.6 MB | — |
| `fotografia` | `fotografia` | photo-shoot | public | 8 | 0 | 228.3 MB | — |

**`studio-assets` — Studio assets / Assets del estudio**: 69 sets, 1,517 files (8.4 GB at the source), 32 redacted rows; served 513 thumbs, 88 pages, 7 contact sheets = 19.5 MB. Served bytes per set: `docs/archive/collections/README.md`.

| Set | Folder | Kind | Visibility | Files | Redacted | Source size | Projects (`depicts`, inferred D-060) |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| `aluzina-root` | `ALUZINA` | company-docs | public | 9 | 2 | 133.6 MB | — |
| `presentaciones` | `ALUZINA/00_ PRESENTACIONES` | presentations | public | 33 | 3 | 969.5 MB | — |
| `trabajadores` | `ALUZINA/017_TRABAJADORES` | internal | internal | 2 | 1 | 1.2 MB | — |
| `artes` | `ALUZINA/01_ ARTES` | merch | public | 35 | 0 | 41.0 MB | — |
| `plantillas-cotizacion-y-cuenta-de-cobro` | `ALUZINA/02_MODELO COTIZACION Y CUENTA COBRO` | templates | internal | 27 | 4 | 100.8 MB | — |
| `contabilidad` | `ALUZINA/03_CONTABILIDAD` | internal | internal | 123 | 1 | 17.5 MB | — |
| `modelo-autocad` | `ALUZINA/04_ MODELO AUTOCAD` | sources | public | 3 | 0 | 9.9 MB | — |
| `documentacion-aluzina` | `ALUZINA/05_DOCUMENTACION ALUZINA` | company-docs | internal | 21 | 6 | 6.0 MB | — |
| `brief-para-clientes` | `ALUZINA/06_ BRIEF PARA CLIENTES` | templates | internal | 13 | 0 | 5.9 MB | — |
| `contratos` | `ALUZINA/09_CONTRATOS` | internal | internal | 4 | 1 | 364 KB | — |
| `proveedores` | `ALUZINA/0_10_PROVEEDORES` | internal | internal | 1 | 0 | 60 KB | — |
| `articulos` | `ALUZINA/0_11_ARTICULOS` | articles | public | 6 | 0 | 80.6 MB | — |
| `disenadores` | `ALUZINA/0_12_DISEÑADORES` | internal | internal | 2 | 1 | 304 KB | — |
| `base-de-datos` | `ALUZINA/0_13_BASE DE DATOS  ALUZINA` | internal | internal | 2 | 1 | 392 KB | — |
| `web-root` | `ALUZINA/0_14_PAGINA WEB Aluzina` | website | public | 10 | 0 | 75.6 MB | — |
| `web-blog` | `ALUZINA/0_14_PAGINA WEB Aluzina/Blog` | website | public | 1 | 0 | 119 KB | — |
| `web-diseno-de-espacios` | `ALUZINA/0_14_PAGINA WEB Aluzina/DISEÑO DE ESPACIOS` | website | public | 551 | 2 | 1127.1 MB | `prj-ar-shabela-charcuteria-necocli-2021`, `prj-ar-shabela-fotos`, `prj-ar-shavela`, `prj-ar-noam-house`, `prj-ar-coassist-2021`, `prj-ar-coassist-termial-de-el-sur-2020`, `prj-pf-coassist-aseguradora`, `prj-ar-sodime`, `prj-ar-sodime-producciom`, `prj-pf-sodime-consultorio-medico`, `prj-pf-brewhouse-bar-cerveza-artesanal`, `prj-ar-proyectos-bonny`, `prj-ar-bonny-juego-nube`, `prj-ar-parque-bonny-noriega`, `prj-ar-joe-gallina-interior`, `prj-ar-intergastro`, `prj-ar-dans-bar`, `prj-ar-modulos-biotectura-para-interiorismo` |
| `web-historias` | `ALUZINA/0_14_PAGINA WEB Aluzina/HISTORIAS` | website | public | 79 | 0 | 48.9 MB | — |
| `web-informacion-de-marca` | `ALUZINA/0_14_PAGINA WEB Aluzina/INFORMACION DE MARCA` | website | public | 2 | 0 | 319 KB | — |
| `web-pagina-web-2022` | `ALUZINA/0_14_PAGINA WEB Aluzina/PAGINA web  2022` | website | public | 16 | 0 | 973.8 MB | `prj-ar-coassist-2021`, `prj-ar-coassist-termial-de-el-sur-2020`, `prj-pf-coassist-aseguradora`, `prj-pf-brewhouse-bar-cerveza-artesanal` |
| `web-pdf-proyectos` | `ALUZINA/0_14_PAGINA WEB Aluzina/PDF Proyectos` | website | public | 25 | 0 | 3103.6 MB | — |
| `web-servicios-aluzina` | `ALUZINA/0_14_PAGINA WEB Aluzina/SERVICIOS ALUZINA` | website | public | 3 | 0 | 516 KB | — |
| `codigos-qr` | `ALUZINA/0_15_CODIGOS QR` | qr | public | 15 | 0 | 380.4 MB | — |
| `modelos-de-photoshop` | `ALUZINA/0_16_MODELOS DE PHOTOSHOP` | sources | public | 1 | 0 | 3.8 MB | — |
| `metodologia` | `ALUZINA/0_METODOLOGIA ALUZINA` | methodology | public | 8 | 4 | 58.8 MB | — |
| `informacion-2026` | `ALUZINA/2026 INFORMACION` | internal | internal | 10 | 1 | 590 KB | — |
| `happy-new-year` | `ALUZINA/HAPPY NEW YEAR` | social-posts | public | 6 | 0 | 222.9 MB | — |
| `letrero-exterior` | `ALUZINA/LETRERO EXTERIOR ALUZINA` | merch | public | 2 | 0 | 1.5 MB | — |
| `iconos-2024` | `ICONOS 2024` | icons | public | 18 | 0 | 25.8 MB | — |
| `reload-3d` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/3d` | project-photos | public | 6 | 0 | 2.0 MB | — |
| `reload-antes-y-despues` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/ANTES Y DESPUES` | project-photos | public | 6 | 0 | 2.4 MB | — |
| `reload-azul-vibrante-y-blanco-profundo-area-de-trabajo` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/AZUL VIBRANTE Y BLANCO PROFUNDO - area de trabajo-` | project-photos | public | 24 | 0 | 8.2 MB | — |
| `reload-ale-reload` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/Ale reload` | project-photos | public | 46 | 0 | 13.5 MB | — |
| `reload-brew-house` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/BREW HOUSE` | project-photos | public | 15 | 0 | 7.4 MB | `prj-pf-brewhouse-bar-cerveza-artesanal` |
| `reload-coassist` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/COASSIST` | project-photos | public | 10 | 0 | 7.1 MB | `prj-ar-coassist-2021`, `prj-ar-coassist-termial-de-el-sur-2020`, `prj-pf-coassist-aseguradora` |
| `reload-contemporaneo` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/CONTEMPORANEO` | project-photos | public | 8 | 0 | 3.4 MB | — |
| `reload-custom-lighting` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/Custom LIGHTING` | project-photos | public | 4 | 0 | 1.7 MB | — |
| `reload-el-bodegon-tropical-shabela-en-necocli` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/EL BODEGON TROPICAL -shabela en necocli-` | project-photos | public | 10 | 0 | 13.6 MB | `prj-ar-shabela-charcuteria-necocli-2021`, `prj-ar-shabela-fotos`, `prj-ar-shavela` |
| `reload-espiritual` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/ESPIRITUAL` | project-photos | public | 11 | 0 | 9.2 MB | — |
| `reload-front` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/FRONT` | project-photos | public | 7 | 0 | 9.6 MB | `prj-pf-club-union-sala-de-masajes` |
| `reload-glamour-airbnb` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/Glamour AIRBNB` | project-photos | public | 16 | 0 | 28.3 MB | `prj-ar-noam-house` |
| `reload-la-calma-del-bambu-apartamento-en-el-poblado` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/LA CALMA DEL BAMBU - apartamento en el poblado-` | project-photos | public | 2 | 0 | 1.7 MB | — |
| `reload-lanzamiento-lu7` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/LANZAMIENTO LU7` | project-photos | public | 27 | 0 | 12.3 MB | — |
| `reload-mantix` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/MANTIX` | project-photos | public | 24 | 0 | 15.6 MB | — |
| `reload-miami-con-aroma-a-reggaeton` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/MIAMI CON AROMA A REGGAETON` | project-photos | public | 35 | 0 | 13.0 MB | `prj-ar-casa-miami-ovy` |
| `reload-moderno` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/MODERNO` | project-photos | public | 12 | 0 | 4.3 MB | — |
| `reload-new-york-new-york` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/NEW YORK, NEW YORK` | project-photos | public | 15 | 0 | 6.1 MB | `prj-ar-new-york-house` |
| `reload-polaris` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/POLARIS` | project-photos | public | 13 | 0 | 4.1 MB | — |
| `reload-un-espacio-en-envigado-luminoso-y-femenino` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/UN ESPACIO EN ENVIGADO LUMINOSO Y FEMENINO` | project-photos | public | 13 | 0 | 6.2 MB | — |
| `reload-wabi-medellin` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/WABI MEDELLIN` | project-photos | public | 12 | 0 | 4.3 MB | — |
| `reload-brookling` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/brookling` | project-photos | public | 4 | 0 | 2.0 MB | `prj-ar-brookling-pizza` |
| `reload-union` | `IMAGENES DE PROYECTOS ALUZINA/Imagenes Reload/union` | project-photos | public | 9 | 0 | 3.0 MB | `prj-pf-club-union-sala-de-masajes` |
| `instagram-lu7` | `INSTAGRAM LU7` | video | public | 4 | 0 | 72.9 MB | — |
| `luminarias` | `LUMINARIAS` | renders | public | 17 | 0 | 4.4 MB | — |
| `lighting-presentation` | `PRESENTACIONES` | presentations | public | 4 | 0 | 10.3 MB | — |
| `todos-los-espacios-root` | `TODOS LOS ESPACIOS` | project-photos | internal | 1 | 0 | 8.1 MB | — |
| `espacios-antes-y-despues` | `TODOS LOS ESPACIOS/ANTES Y DESPUES` | project-photos | public | 11 | 5 | 13.7 MB | — |
| `espacios-azul-vibrante-y-blanco-profundo-area-de-trabajo` | `TODOS LOS ESPACIOS/AZUL VIBRANTE Y BLANCO PROFUNDO - area de trabajo-` | project-photos | public | 18 | 0 | 71.2 MB | — |
| `espacios-custom-lighting` | `TODOS LOS ESPACIOS/CUSTOM LIGHTING` | project-photos | public | 10 | 0 | 14.4 MB | — |
| `espacios-el-bodegon-tropical-shabela-en-necocli` | `TODOS LOS ESPACIOS/EL BODEGON TROPICAL -shabela en necocli-` | project-photos | public | 6 | 0 | 25.3 MB | `prj-ar-shabela-charcuteria-necocli-2021`, `prj-ar-shabela-fotos`, `prj-ar-shavela` |
| `espacios-glamour-contemporaneo` | `TODOS LOS ESPACIOS/GLAMOUR CONTEMPORANEO` | project-photos | public | 4 | 0 | 6.8 MB | — |
| `espacios-la-calma-del-bambu-apartamento-en-el-poblado` | `TODOS LOS ESPACIOS/LA CALMA DEL BAMBU - apartamento en el poblado-` | project-photos | public | 4 | 0 | 10.2 MB | — |
| `espacios-loft-el-encanto` | `TODOS LOS ESPACIOS/LOFT EL ENCANTO` | project-photos | public | 21 | 0 | 49.1 MB | `prj-ar-el-encanto`, `prj-ar-el-encanto-2024` |
| `espacios-miami-con-aroma-a-reggaeton` | `TODOS LOS ESPACIOS/MIAMI CON AROMA A REGGAETON` | project-photos | public | 24 | 0 | 57.3 MB | `prj-ar-casa-miami-ovy` |
| `espacios-minimal-calido-medellin` | `TODOS LOS ESPACIOS/MINIMAL CALIDO MEDELLIN` | project-photos | public | 8 | 0 | 5.6 MB | — |
| `espacios-new-york-new-york` | `TODOS LOS ESPACIOS/NEW YORK, NEW YORK` | project-photos | public | 16 | 0 | 31.0 MB | `prj-ar-new-york-house` |
| `espacios-un-espacio-en-envigado-luminoso-y-femenino` | `TODOS LOS ESPACIOS/UN ESPACIO EN ENVIGADO LUMINOSO Y FEMENINO` | project-photos | public | 12 | 0 | 28.3 MB | — |
| `servicios-aluzina` | `SERVICIOS ALUZINA` | internal | internal | 0 | 0 | 0 | — |
| `web-banco-de-imagen` | `ALUZINA/0_14_PAGINA WEB Aluzina/BANCO DE IMAGEN` | website | internal | 0 | 0 | 0 | — |


## C. G-09 "Campaigns & assets" (Opus 5; draft `docs/changelog/_pending/brand-collections.md` merged here)

Route `/#/brand/collections` on the brand portal, permission `brand.manage`, nav order 80, glyph `▧` resolved to the `catalog` icon. The page reads the two indexes lazily and shows them set by set: what each set holds, how much of it the hub can preview, what is internal or redacted and therefore deliberately not served, and which archived project a set depicts. It is the brand-side companion of S-12 / S-13, which cover folders that *are* projects. Page doc: `docs/pages/G-09.md`; captures: `docs/screenshots/G-09/` (390 / 1280 / 3840, dark, Spanish, set view).

Files

- Added `apps/hub/src/domain/collections.ts` — the data contract (`CollectionSlug`, `CollectionSetKind`, `CollectionSet`, `CollectionFile`, `CollectionIndex`), `COLLECTION_SLUGS`, `collectionLoaders` (**lazy** `import.meta.glob` over `@docs/archive/collections/*/index.json`), `loadCollection(slug)`, `servedUrl(slug, rel)`, `isCollectionSlug(v)`. Not re-exported from `domain/index.ts` (shared file, another worker in the tree).
- Added `apps/hub/src/modules/brand/CollectionsPage.tsx`; changed `modules/brand/{index.ts,specs.ts,strings.ts,brand.css}` (route, `collectionsSpec`, `brand.collections.*` + `brand.nav.collections` strings EN + ES complete including a label for all 19 set kinds, `.brand-col__*` / `.brand-grid--sets` / `.brand-grid--files` styles, tokens only).
- Changed `apps/hub/src/components/atom/Icon/iconMap.ts` — one additive line, `'G-09': 'catalog'`, so the nav row does not read the same as G-05 `images`. `apps/hub/src/modules/README.md` — taken codes `G-01..G-09`, next free `G-10`.
- The page worker had created two **stub** indexes (`"stub": true`) so typecheck and build ran before the crawl landed; the pipeline pass overwrote both with the real indexes and the stub banner no longer shows.

Layout: `PageHeader`; `Tabs` switcher (Campaign 2021 | Studio assets) with the caption, who shared it and when, when it was indexed and an "Open in Dropbox" link; four `StatTile`s (sets, files with the total size, files with a preview, internal files with the redacted count); one `Card` per set with a `Thumb` button (cover or folder `FileIcon`), kind and visibility `Badge`s, size, note and one ghost `Button` chip per `projectIds` entry linking to S-13 (`#/brand/archive/<projectId>`); the set view (`?c=<slug>&set=<id>`) with back link, header, the **Download set** `Placeholder`, the contact sheet with "Open full size", a filter `Input`, the preview `Thumb` grid and a row list of the files the hub cannot preview; a `Drawer` per file with ext / size / dimensions / pages / state Badges, `DocumentViewer` over the served renders, path, excerpt, note and "Open in Dropbox". Collection and set live in the URL (linkable; browser Back walks out of a set); filter text and the open file are component state.

Rules the page applies: **`isServed(file)`** is the one previewability test (not redacted, not `internal`, has a `thumb` or `pages[]`); internal and redacted rows are listed by name and size with no preview and no click and say why in a tooltip that is never the only cue (the Badges carry the same fact); a folder-level redacted row (a folder in `path`, empty `ext`) renders with the folder icon (D-084); a thumbnail that fails to load falls back to the file-family icon; loading (`role="status"`) and failure (`EmptyState` naming the file, "Try again" re-runs the import) states; empty set and empty filter states.

### Actions (P-05), all six registered while mounted behind `brand.manage`

| id | label | intent | permission | params | note |
| --- | --- | --- | --- | --- | --- |
| `brand.openCollection` | Open a collection | show the {collection} collection | `brand.manage` | collection: enum:campaign-2021\|studio-assets | |
| `brand.openSet` | Open a set | open the set {set} | `brand.manage` | set: id | answers with the set title, file and redacted counts |
| `brand.filterCollection` | Filter the files | filter the files by {query} | `brand.manage` | query: string | |
| `brand.openCollectionFile` | Preview a file | preview the file {file} | `brand.manage` | file: string | path or bare name; opens the file's set first; refuses unserved files readably |
| `brand.closeCollectionFile` | Close the preview | close the file preview | `brand.manage` | — | |
| `brand.downloadCollectionSet` | Download a set | download the set {set} as a zip | `brand.manage` | set: id | `Placeholder`, answers "not wired yet: downloading a whole set needs file storage; today the Dropbox folder is the download" (D-047) |

Verification by the page worker (against the stub indexes): `npm run tokens && npm run typecheck && npm run build` green; Playwright against `npm run preview`: 0 horizontal overflow and no target under 44 px at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 in both the collection and the set view; 0 page console errors (the sandbox proxy refusing Google Fonts is the one console entry, identical on every hub page); keyboard path Tab -> Enter -> Tab -> Enter -> Escape -> Back; all six actions answer with readable strings through `window.__aluzina.actions.run`; Spanish verified live at 1280 ("Campañas y assets", "Conjuntos", "Vista previa"). Build check: the campaign index lands in its own chunk and no file row appears in the main `assets/index-*.js`. Re-verified against the real indexes in section G.

## D. Seed (Fable 5.1)

`apps/hub/src/data/seed/collections.ts` (order 76) imports the two compact `sets.json` eagerly and seeds, per collection:

- **One `assets` row per set** (78 rows: 9 + 69; D-083): `kind: 'file'`, `source: 'dropbox'`, `stage: 'marketing'`, `mimeType: 'inode/directory'`, `folderPath` the set folder, `sourceUrl` the collection's share link (files carry no per-file href, D-059 R6), `thumbnailUrl` the set cover, `previewUrls` the contact sheet when one exists, `textExcerpt` the set note, `year` when the folder says so. Ids `ast-col-<slug>-<setId>`.
- **Tags**: `colección`, the set kind in Spanish (`redes sociales`, `anuncios`, `banners`, `sesión fotográfica`, `fotos de proyecto`, `renders`, `iconos`, `códigos qr`, `merchandising`, `presentación`, `metodología`, `artículos`, `página web`, `video`, `fuentes`, `fuentes editables`, `plantillas`, `empresa`, `interno`), `público` / `interno` and the collection tag (`campaña 2021` / `assets estudio`). **18 new `tags` registry rows** (`público`, `interno`, `empresa`, `presentación`, `plantillas` already existed).
- **`relations`**: set -> project **`depicts`** for every `projectIds` entry (43 rows: 1 + 42), note "Vínculo inferido del nombre de la carpeta o del archivo (D-060); confirmar con la fundadora."
- **Two Spanish notes** (`posts`, kind `note`, author the brand user) filed in Brand Memory (`sp-brand-memory`), one per collection, listing every set with its visibility and project links, plus the totals and where the index lives.
- `seed/index.ts`: **`SEED_VERSION` 12** (the comment names this pass). Store after the seed (built app, fresh profile, section G): `localStorage['aluzina.data'].length` **1,274,864** on the merged tree (before the merge with pass 3 it was 3,780,189 against 3,659,382 after 0021, i.e. +120,807 chars for 78 assets, 43 relations, 18 tags, 2 posts, 2 filings; pass 3's ar-19 then took the archived files out of the seed, D-071), far under the 4.5 MB line. The per-file rows (1,568) stay in the JSON (D-083).

## E. Brand-era evidence (recorded, not decided)

Two eras are known (`knowledge/brand.md` part B, D-052): portfolio "Universo de Diseño" (gold Didone wordmark) and brochure "Interiorismo · Iluminación" (light sans gradient wordmark). What the two folders show, read from the rendered pieces:

- **Campaign 2021**: every rendered piece uses the **Didone wordmark**. The banner sources (`IMAGENES CAMPANA 2021/*.ai`) and the Instagram posts carry the metallic gold Didone wordmark with **"UNIVERSO DE DISEÑO"** and an iridescent frame. The April 2021 San Fernando print pieces (co-branded with the Origins store) already pair the gold Didone wordmark with **"INTERIORISMO · ILUMINACIÓN"**: in 2021 the descriptor was already switching while the wordmark stayed Didone; the light sans wordmark of the brochure does not appear in 2021.
- **`01_ ARTES/Artes basicas`** is split into `IMAGEN 2018-2022` (Didone + "UNIVERSO DE DISEÑO", LU7 icons) and `IMAGEN 2023-2031` (`ALUZINA INTERIORISMO E ILUMINACION.ai`: **still the Didone wordmark**, iridescent on black, with "INTERIORISMO / ILUMINACIÓN"; it matches the silver brand manual). The folder names date the descriptor change to 2023 and say the Didone wordmark continued past it.
- **`00_ PRESENTACIONES`**: the older decks use the gold Didone wordmark with "UNIVERSO DE DISEÑO" on the white-iridescent slash layout; `PRESENTACIONES RELOADED 2023` and `EXPERIENCIA LUZ` use the iridescent Didone wordmark on black with "INTERIORISMO · ILUMINACIÓN".
- **Website 2022**: project boards in a thin spaced sans with photo grids, no wordmark on the boards; the same board layout appears in the campaign's `Proyectos WEB*.ai` (2021), so the 2022 website reused the 2021 boards. **`ICONOS 2024`**: black circular badges with thin letter-spaced sans copy, no wordmark; the typography matches the brochure era, the colour treatment (flat black, no gradient) does not.
- **Reading**: the brochure's light sans **wordmark** is in neither folder; the "Interiorismo · Iluminación" **descriptor** is documented from April 2021 (print) and as the 2023+ artwork. Whether the sans wordmark is a 2024+ step or an outlier stays the founder's question (D-052; kanban brand-era card; `knowledge/brand.md` "Campaign 2021 and studio assets").

## F. QA (Sonnet 5)

`docs/qa/0006-collections-qa.md`: G-09 at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 (collection view plus two set views: `imagenes-club-union` with a contact sheet and the internal `plantillas-cotizacion-y-cuenta-de-cobro` with redacted rows, plus the folder-level `contabilidad` row and the empty `servicios-aluzina` set), light and dark at 1280, EN and ES at 1280, against the real indexes and served renders (the page worker's captures were against the stubs). Per cell: console errors (Google Fonts proxy excluded), failed requests (none excluded), horizontal overflow, smallest interactive target, `h1` size. Bundle split re-verified (a campaign-only marker appears in the lazy chunk, not in the main entry); store 3,780,189 chars, `seedVersion` 10; all six actions run through the bus with the real ids; contact sheet served with HTTP 200; Spanish read-back. **Result: passes at every width; no code defect.** `docs/screenshots/G-09/` re-captured (nine files, incl. `en-1280-set-internal.jpg` and `en-1280-viewer.jpg` with the Drawer open on `ALUZINA.pdf`); `collectionsSpec.checkedAt` already listed the seven widths. Two observations: (1) the `studio-assets` caption reads "services , lighting , presentatios , projects , icones ," — this is the founder's caption **kept verbatim by design** (the index header records how the folder was shared; the titles "Studio assets / Assets del estudio" are the display names), not garbled pipeline output; (2) at 390 the switcher-plus-stats block pushes a set's heading below a ~900 px fold, so the phone captures of the collection and the set look alike above the fold (observation, not a defect).

## G. Integration and verification (Fable 5.1)

- Versions 0.14.0 -> **0.15.0** (root, hub, `plan.json`); `npm run archive:collection` added next to the other `archive:*` scripts; the pipeline README's prompt reference corrected to 0021 (the pass began as 0020 / changelog 0022 / D-071..D-074 / SEED_VERSION 10 / 0.14.0 and was renumbered when origin/main took those numbers for step 14 pass 3); `_pending/brand-collections.md` merged into C and removed.
- **Race with step 14 pass 3**: while this pass ran, another session pushed changelog 0022 / prompt 0020 / D-071..D-082 / SEED_VERSION 11 / 0.14.0 / ar-23 / `docs/qa/0005` (the archive's lazy chunks, P-06, A-09). This pass fast-forwarded onto it, 3-way merged `brand/{brand.css,specs.ts,strings.ts}` and `iconMap.ts` (both sides kept), re-applied its shared-doc edits and renumbered to 0023 / 0021 / D-083..D-086 / SEED_VERSION 12 / 0.15.0 / ar-25..ar-29 / `docs/qa/0006` (the memory note `aluzina-numbered-docs-race` applied again).
- `npm run tokens && npm run typecheck && npm run build` green on the merged tree (vite 7.3 s). The two collection indexes are lazy chunks (campaign 88.5 kB, studio 749.4 kB); the main bundle is 2,191.53 kB after pass 3 moved the archive indexes into 192 lazy chunks. Playwright smoke as `brand` on `/#/brand/collections` at 1280 against `npm run preview`: **0 console errors** (the Google Fonts proxy refusal excluded, as on every hub page), **124 routes** in the manifest, `window.__aluzina.version` 0.15.0, `aluzina.data.seedVersion` **12**, store length **1,274,864** chars (< 4,500,000; 3,780,189 before the merge), 9 campaign set cards with their 9 covers loaded, 69 studio set cards, no horizontal overflow on either tab.
- Repository footprint: `apps/hub/public/archive/{campaign-2021,studio-assets}` 743 files, **25,878,267 B (24.68 MiB)**, largest file under 5 MB; `docs/archive/collections/` 1.15 MB of JSON. `dist/` and `node_modules/` stay ignored.
- Docs (D-037: kanban, `plan.json` and `build-plan.md` agree): prompt 0021, this changelog, D-083..D-086, done cards for the three passes and backlog cards ar-25..ar-29 under step 14, `knowledge/brand.md` "Campaign 2021 and studio assets" + change-log line, `knowledge/archive.md` "Collections (non-project folders)" + line, `docs/archive/README.md` paragraph on `collections/`, `docs/README.md` map entries, `surfaces.md` (route G-09, the six `brand.*` collection actions, `archive:collection`, `SEED_VERSION` 12, change-log line).

## H. Deferred and founder questions

Backlog cards (step 14, `plan.json` + kanban):

- **ar-25** split `web-diseno-de-espacios` (551 files, three ESPACIO folders with ~30 project subfolders, one set today) per project folder: a one-line change in the rules table, ~30 more sets on the page (Sonnet 5).
- **ar-26** re-run the two collections with a full ffmpeg and a working LibreOffice so the four videos get poster frames and `DESIGN PRESENTACION ALUZINA.pptx` renders; no other change (Sonnet 5).
- **ar-27** perceptual-hash dedupe of `Imagenes Reload/` vs `TODOS LOS ESPACIOS/`: the trees overlap in content but only 32 files are byte-identical, so re-exports render twice; a pHash pass could halve the photo bytes (Sonnet 5).
- **ar-28** S-13 project portal shows the photo sets that depict it through the new `depicts` relations (a "Campaigns & assets" block linking to `?c=<slug>&set=<id>`), the page doc's open question (Opus 5).
- **ar-29** founder questions, one session: (1) the three **DIN Round Pro** fonts carry no licence file — indexed, tagged `fuente`, not shipped; is it the brand font and is there a licence? (2) **brand-era dating** (section E): is the light sans wordmark a 2024+ step or an outlier? (3) the 2021 **ads showing a sale price or the WhatsApp number** keep their renders as published material (D-085); say if any should be unrendered; (4) **attributions with no project row**: Terrazino Cumbres, Mantix, Semana de la Juventud, LU7 (launch), Polaris, Wabi (plus Espiritual, Ecléctico, Vintage, Simón apartamento, Rincón Alicante) — are they projects to create, or brochure-only names? (5) `SERVICIOS ALUZINA` is empty in the shared copy — was something meant to be there? (founder session)

Also noted: G-09's captures and the `checkedAt` widths are the QA pass's (F); a recapture of `docs/screenshots/G-09/` is due whenever the rules change (ar-25 / ar-26). Two collections are hard-coded in `COLLECTION_SLUGS`; a third shared folder should make the collection list data (one row per collection) rather than a third union member. The `duplicateOf` of the two redacted `06_CUENTA DE COBRO SODIME` copies reads like its own path (both redact to the same name); harmless, resolve duplicates by `md5`. A set's `fileCount` counts source files, so `totals.files` (1,517) is larger than `files.length` (1,389) in the studio index because five private folders are one row each.
