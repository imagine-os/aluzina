version: 0.13.0
date: 2026-09-21
prompt: 0019
intent: Second pass of step 14 (the project archive): every PROYECTOS 2026 folder deep-indexed with previews and the 15 "empty" folders re-checked (ar-06, ar-16); tags, delivery stage, project tags and the project cover editable in the product behind one curation permission (ar-09); an SVG icon system replacing the Unicode nav glyphs across shells, the Spaces tree and the hub cards (ar-11); the 12 company documents of "00 INFORMACION RELEVANTE ALUZINA 2023" on G-08 (ar-15); QA at 2560 / 3840 and dark (ar-18); SEED_VERSION 9.
decision: D-064 (icons resolved by page code, then glyph, then glyph text; Unicode glyphs stay as data), D-065 (archive tags are free text, lower-cased; the registry gains rows lazily; a list saves whole, a single value saves on change), D-066 (a confidential or redacted file is never a cover), D-067 (`archive.curate` is the curation permission for studio and brand), D-068 (third-party documents are indexed, never served; price lists and market research are internal), D-069 (2026 render budgets per folder and the empty-folder correction), D-070 (deep indexes are discovered by glob, one JSON per project)
rejected: an icon font or external icon library (P-07; the set lives in the product as `currentColor` SVG); coloured icons; editing any module's `nav.glyph` or seeded space glyph; a closed tag vocabulary or a registry that gates typing; granting `assets.manage` + `projects.write` to studio for tagging (too wide: the asset library and project creation) in favour of the narrower `archive.curate`; serving third-party brochures or Aluzina's price lists (copyright, prices); 6 pages for every 2026 folder (30.5 MB; budgets per folder keep the 18 folders at 22.4 MB); seeding the 2020-2025 deep indexes now (the store would pass the 4.5 MB localStorage line: ar-19 first)
files: apps/hub/src/auth/permissions.ts, apps/hub/src/data/seed/{index,archive,company}.ts, apps/hub/src/components/atom/Icon/{Icon.tsx,Icon.css,iconMap.ts,Icon.meta.ts,Icon.example.tsx}, apps/hub/src/components/molecule/TagEditor/{TagEditor.tsx,TagEditor.css,TagEditor.meta.ts,TagEditor.example.tsx}, apps/hub/src/components/molecule/SurfaceCard/{SurfaceCard.tsx,SurfaceCard.css,SurfaceCard.meta.ts}, apps/hub/src/components/organism/SpaceTree/{SpaceTree.tsx,SpaceTree.meta.ts}, apps/hub/src/app/shells.tsx, apps/hub/src/modules/hub/HubPage.tsx, apps/hub/src/modules/archive/{ArchiveBrowserPage,ProjectPortalPage}.tsx + {specs,strings}.ts + archive.css, apps/hub/src/modules/brand/{DocumentsPage.tsx,specs.ts,strings.ts,brand.css}, apps/hub/src/design/tokens.ts, apps/hub/src/styles/tokens.css (generated), apps/hub/scripts/gen-tokens.mjs, scripts/archive/{build-index.mjs,render-previews.py}, scripts/screenshots.mjs, docs/archive/{README.md,index.json}, docs/archive/projects/<18 slugs>/index.json + joe-gallina-interior/index.json (re-indexed), docs/archive/company/index.json, apps/hub/public/archive/<18 slugs>/{thumbs,pages}/ (408 + 150 JPEGs, 23.5 MB), apps/hub/public/archive/company/{thumbs,pages}/ (5 + 19, 1.2 MB), package.json + apps/hub/package.json (0.13.0), docs/design/icons.md, docs/pages/{S-12,S-13,HUB-01,K-01,G-08,D-02}.md, docs/screenshots/{S-12,S-13,HUB-01,K-01,S-01,G-08}/*, docs/qa/0004-archive-4k-dark.md, docs/knowledge/{archive,brand,roles-and-portals}.md, docs/prompts/0019-continue-dev-plan.md, docs/decisions.md, docs/build-plan.md, docs/plan/plan.json, docs/kanban.md, docs/reference/surfaces.md, docs/README.md, apps/hub/src/modules/README.md; removed docs/changelog/_pending/{archive-ar06,archive-ar09,icons,company-docs}.md
codes: S-12, S-13, G-08, HUB-01, K-01, D-02
model: Fable 5.1 (integration, the `archive.curate` permission, QA judgement, ar-06 deep indexes), Opus 5 (ar-09 tagging, ar-11 icons), Sonnet 5 (ar-15 company documents)

# 0021 - Step 14 pass 2: 2026 deep indexes, tagging, icon system, company documents

Justin, in the #past-projects thread (prompt 0019): "hi i think you can continue getting things done from the dev plan". The plan (`plan.json` step 14, changelog 0019 section J) had six tasks marked next; four workers took them in parallel and this pass integrates their drafts (sections A-D, merged from `docs/changelog/_pending/`), adds the shared-code changes they requested (E), does the ar-18 QA (F), verifies the whole (G) and files what is deferred (H).

## A. ar-06 + ar-16 — deep index and previews for every PROYECTOS 2026 folder; the 15 "empty" folders re-checked (Fable 5.1)

- **18 deep indexes** for the folders of `PROYECTOS 2026` (link B): every file to full depth (crawler `--depth=8`, 2 s pacing, 60 s back-off, 0 gates, 0 rate limits, 0 errors), redacted with the D-059 rules, at `docs/archive/projects/<slug>/index.json`; served renders under `apps/hub/public/archive/<slug>/{thumbs,pages}/`. `docs/archive/index.json`: `deepIndex` set on the 18 entries, counts refreshed (1444 first-level files, 245 subfolders, 21.4 GB listed); `docs/archive/README.md` regenerated.
- **ar-16 re-check** of the 15 folders listed as empty: 12 hold files (the first pass had read the Dropbox viewer before its grid loaded; the crawler now waits for the grid), 3 stay empty. Their inventory entries (depth 1) are refreshed from the re-crawl (`--raw` now replaces a listed entry when the re-crawl lists more children); the four 2026 ones are deep-indexed as well. `counts.empty` 15 -> 3. `SANTIAGO AGUIRRE ILUMINACION` (root) was already listed in 0019, nothing to retry there.
- **Seed** (D-070): `apps/hub/src/data/seed/archive.ts` replaces the hard-coded `DEEP_INDEXES` map with `import.meta.glob('@docs/archive/projects/*/index.json', { eager: true, import: 'default' })` keyed by the folder slug. Every future deep index is picked up without touching the seed.
- **Scripts** (`scripts/archive/`): `build-index.mjs` — R2 folder pattern extended (`contratos`, `cotizaci*`, `documentacion importante`, `consignaciones`, `pagos`, `proveedores`), R6 safe-ancestor link skips any folder segment matching the file-name pattern after R7 caught eight such links, R3 gains `FIN_CONTENT_RE` (a file whose text reads as a quotation / invoice loses previews and excerpt, whatever its name), explicit `RENAME_FILES` for file names carrying a client's personal name, `yearFolderOfUrl()` reads the year folder of a deep index from its share URL. `render-previews.py` — `download` gains `--allow-re`, `--allow-root`, `--exts` and `--delay`; `stream` gains `--paths-file`; `render` registers HEIC support when `pillow-heif` is present; the privacy folder pattern matches the new R2 folders too.
- **Knowledge**: `docs/knowledge/archive.md` — 2026 table (files / subfolders / main types / latest / note) and the 11 re-checked rows of other years refreshed, header totals, the empty-folders and template bullets rewritten, change-log line.
- **Capture**: `docs/screenshots/S-13/en-1280-2026.jpg` (HOY as studio, 1280).

### Per-folder counts (18 folders of PROYECTOS 2026)

Files = every file in the deep index; redacted = D-059 (name / folder / content); downloaded = kept originals for rendering; streamed = PDFs over the 15 MB download cap rendered from a temp file and deleted; thumbs / pages / bytes = what is served.

| Folder | Slug | Files | Redacted | Downloaded | Streamed | Thumbs | Pages | Served bytes | Served settings |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 01_ CARTAGENA COPETRAN | `cartagena-copetran` | 37 | 16 | 12 | 3 | 12 | 12 | 1,257,545 | 4 pages |
| 02_LINA ZAPATA | `lina-zapata` | 26 | 0 | 26 | 0 | 26 | 0 | 1,136,531 | 6 pages, 640 / 1200 q72 |
| 03_ANDRES Y ANDREA | `andres-y-andrea` | 28 | 26 | 0 | 1 | 1 | 6 | 429,029 | 6 pages, 640 / 1200 q72 |
| 04_DECERO | `decero` | 5 | 4 | 1 | 0 | 1 | 6 | 410,661 | 6 pages, 640 / 1200 q72 |
| 05_SODIME | `sodime` | 76 | 1 | 50 | 1 | 45 | 22 | 3,179,185 | 4 pages |
| 06_YOLIMA CLIENTA | `yolima-clienta` | 5 | 2 | 2 | 1 | 3 | 10 | 850,449 | 6 pages, 640 / 1200 q72 |
| 07_PLAY SET | `play-set` | 46 | 0 | 36 | 1 | 37 | 8 | 2,718,109 | 4 pages |
| 08_HONEY VALLEY LUMINARIA | `honey-valley-luminaria` | 83 | 0 | 82 | 1 | 83 | 8 | 3,398,527 | 4 pages, thumbs 512 px |
| 09_LINA TABARES | `lina-tabares` | 7 | 1 | 6 | 0 | 6 | 0 | 345,273 | 6 pages, 640 / 1200 q72 |
| 010_HOY | `hoy` | 206 | 45 | 153 | 3 | 152 | 47 | 6,122,404 | 4 pages, thumbs 512 px, pages 1000 px q68 |
| 011_SPORTI | `sporti` | 14 | 6 | 5 | 1 | 5 | 10 | 843,149 | 6 pages, 640 / 1200 q72 |
| 013_CASA DHARMA SAN PEDRO DE LOS MILAGROS | `casa-dharma-san-pedro-de-los-milagros` | 5 | 1 | 4 | 0 | 4 | 0 | 163,727 | 6 pages, 640 / 1200 q72 |
| 014_ROBLE COLONIAL GUATAPE | `roble-colonial-guatape` | 1 | 0 | 0 | 1 | 1 | 6 | 618,264 | 6 pages, 640 / 1200 q72 |
| 015_POZO AZUL | `pozo-azul` | 1 | 0 | 1 | 0 | 1 | 6 | 420,698 | 6 pages, 640 / 1200 q72 |
| 016_Ecoluz, ILUMINACION | `ecoluz-iluminacion` | 3 | 3 | 3 | 0 | 0 | 0 | 0 | 6 pages, 640 / 1200 q72 |
| 017_HUG | `hug` | 12 | 0 | 10 | 1 | 11 | 6 | 821,516 | 6 pages, 640 / 1200 q72 |
| 18_ALMA PRANA 2026 | `alma-prana-2026` | 3 | 0 | 2 | 1 | 3 | 3 | 150,523 | 6 pages, 640 / 1200 q72 |
| 019_ SIMON CALERA | `simon-calera` | 17 | 0 | 17 | 0 | 17 | 0 | 654,118 | 6 pages, 640 / 1200 q72 |
| **Total (18)** | | **575** | **105** | **410** | **15** | **408** | **150** | **23,519,708** | |

Served total for the 18 folders: **23,519,708 bytes (22.4 MB)**, under the 25 MB line (D-069). Kept downloads: 551 MB (Honey Valley's 55 phone photos over 3 MB deleted after rendering), under the 600 MB cap; no single file over 120 MB existed. Redaction over the 19 deep indexes: 244 files by name / folder, 8 by content; 208 of 1444 inventory files; 460 links replaced by a safe folder link. **R7 self-check passed** over 1689 inventory entries and 754 deep-index files.

What was dropped or skipped: **served budget** — HOY (206 files) at 4 pages, 512 px thumbs and 1000 px q68 pages; HONEY VALLEY at 4 pages and 512 px thumbs; SODIME, PLAY SET and CARTAGENA COPETRAN at 4 pages; everything else at 6 pages, 640 / 1200 q72 (at 6 pages for all the total was 30.5 MB). **Never downloaded** (D-059 + this pass's R2 folders): everything under `04_COTIZACION DEL ESPACIO`, `06 CONTRATOS`, `08 DOCUMENTACION IMPORTANTE`, `09 CONSIGNACIONES`, `PAGOS`, `COTIZACION*`, `COTIZACIONES DE PROVEEDORES`, `FACTURAS`, `CONTRATOS`; every file whose name matches the pattern, which includes the many site photos named `WhatsApp Image …` (a policy question for Justin, section H). **Not in the allow-list**: `informes`, `INFORMES`, `CERTIFICADOS Y GARANTIAS`, `MATERIALES`, `MAPAMUNDI`, `FUENTE`, `CUADROS`, `fotos actuales`, `SODIME RENOVACION MEDELLIN`, `01 ILUMINACION HOTEL CALI`. **No renderer**: psd, dwg, skp, 3dm, zip, url, txt; 23 HEIC files of SODIME were rendered (pillow-heif). **Render errors** (12): 11 videos where ffmpeg produced no frame (HOY 4, SODIME 6, SPORTI 1), 1 xlsx LibreOffice conversion (CARTAGENA `05 CRONOGRAMA DE OBRA`); the files keep their rows without a preview. **Explicit redactions added**: `CO 22302/22303/22304-0 SUM ALUZINA E1..E3.pdf` (Ecoluz) are supplier quotations by content -> previews and excerpt dropped (R3); `Wilson Arismendi, gerente general de Copetran APARTAMENTO CARTAGENA 80 MTS.pdf/.ai` -> displayed as `Primera propuesta APARTAMENTO CARTAGENA 80 MTS (nombre del cliente omitido)`, previews dropped, link to the folder.

### ar-16 re-check of the 15 "empty" folders

| Folder | Children now | Result |
| --- | ---: | --- |
| 2026/06_YOLIMA CLIENTA | 5 | has files — deep-indexed (2026) |
| 2026/08_HONEY VALLEY LUMINARIA | 82 | has files — deep-indexed (2026) |
| 2026/09_LINA TABARES | 7 | has files — deep-indexed (2026) |
| 2026/017_HUG | 12 | has files — deep-indexed (2026) |
| 2025/01 DISENO GRAFICO  SER INTERIOR | 0 | still empty |
| 2025/07 IMAGENES EL SILENCIO DE LOS PAJAROS | 2 | has files — inventory refreshed (depth 1) |
| 2025/08 DISENO INTERIOR juan | 0 | still empty |
| 2025/016 APARTAMENTO VALENTIN RAMOZ | 9 | has files — inventory refreshed (depth 1) |
| 2024/ACABADOS Y FORMAS | 1 | has files — inventory refreshed (depth 1) |
| 2024/ESPACIO COLIN MEDELLIN | 11 | has files — inventory refreshed (depth 1) |
| 2021/0_93 FINCA ANTIOQUIA ILUMINACION | 16 | has files — inventory refreshed (depth 1) |
| 2020/0_72 LONDON CITY BARBER SHOP | 0 | still empty |
| 2020/0_83 REVERDESER | 5 | has files — inventory refreshed (depth 1) |
| 2019-2023/FABI SOPETRAN | 1 | has files — inventory refreshed (depth 1) |
| 2019-2023/NEW YORK HOUSE | 71 | has files — inventory refreshed (depth 1) |

### Seed footprint (`localStorage['aluzina.data']`, built app, fresh profile)

| | Before (joe-gallina only) | After (19 deep indexes + company) |
| --- | ---: | ---: |
| `localStorage['aluzina.data'].length` | 2,584,061 | 3,659,382 |
| `JSON.stringify(...)`.length | 2,858,749 | 4,044,168 |
| assets rows / chars | 1462 / 1,381,158 | 2096 / 2,068,995 |
| relations rows / chars | 1807 / 565,138 | 2913 / 890,885 |

Under the 4.5 MB line with about 0.45 MB of headroom: **ar-07 (2020-2025 deep indexes) will not fit at this row shape**; ar-19 (a lazy / split asset store) goes first (section H). The eager glob also moved the deep indexes into the main bundle: `index-*.js` 2.9 MB (was 1.5 MB); ar-19 fixes both.

## B. ar-09 — tag editing, stage and cover as real writes (Opus 5)

The last Placeholder of the archive is gone: `archive.tagFile` is a real write, and file stages, project tags and the project cover are editable in the product.

- **New library molecule `components/molecule/TagEditor/`** (`TagEditor.tsx`, `.css`, `.meta.ts`, `.example.tsx`, tokens only, P-07). Props `{ value, onChange, suggestions, label, placeholder, addLabel, removeLabel, disabled?, max?, hint?, countLabel?, className? }`. Chips are `Badge`s with their own 44 px x button; the field is a real combobox (`aria-expanded / aria-controls / aria-autocomplete=list / aria-activedescendant`) over a `role="listbox"` of 44 px rows filtered as you type (8 shown). Keyboard: ArrowDown / ArrowUp walk the options, Enter adds the highlighted one or what is typed, comma and semicolon add, Backspace on an empty field removes the last chip, Escape closes the list. Duplicates and empty strings are rejected; values are trimmed, `#`-stripped, whitespace-collapsed and lower-cased (`normalizeTag`); `parseTags` takes an array or a comma / semicolon string (the actions bus path). The count line is `aria-live="polite"`. The list opens only while typing or on ArrowDown, never on a bare focus, so it never covers Save.
- **S-13 preview drawer** gains a "Tags and stage" block: the `TagEditor` (suggestions = the live union of every file asset's tags + the `tags` registry names + `DELIVERY_STAGE_IDS`, max 12) with **Save tags** / **Undo changes**, a **Delivery stage** `Select` over `DELIVERY_STAGES` that writes on change, and **Set as cover** (a `Badge` "Project cover" when it already is one; a `Placeholder` explaining the missing render when a coverable file has no `thumbnailUrl`). A `confidencial` or redacted file is never offered as a cover and the action refuses it (D-066).
- **S-13 hero** gains a **Tags** row: the `TagEditor` writing `projects.tags`, read-only `Badge`s for a role without the permission. **S-13 toolbar**: the `Placeholder` "Tag file" is replaced by "Open a file to edit its tags, its stage and the project cover."
- **S-12 cards** say "N tagged" beside the file count; the Tag filter's live union means a tag saved on S-13 appears there without a reload (D-023, verified in two tabs).
- Every write is `data.update(entity, id, patch, { basedOn: row.updated_at })`: a stale edit is last-write-wins plus the D-024 conflict toast (`core.data.conflict`).
- The `Drawer`'s `onClose` on S-13 is a `useCallback`: `useFocusTrap`'s effect depends on it, so an inline arrow re-ran the trap on every render and pulled focus back to the close button after each edit. Verified in this pass: every other `Drawer` / `Modal` caller (ops, brand, spaces, dev, qa, tools, docs, founder) passes an inline arrow; left alone here, filed as ar-20.

### Actions (P-05), all four behind `archive.curate` (section E)

| id | label | permission | params | note |
| --- | --- | --- | --- | --- |
| `archive.tagFile` | Tag a file | `archive.curate` | asset: id, tags: string | was a Placeholder; `tags` accepts an array or a comma / semicolon string |
| `archive.setStage` | Move a file to a stage | `archive.curate` | asset: id, stage: string | new; validates against `DELIVERY_STAGE_IDS` |
| `archive.setCover` | Set the project cover | `archive.curate` | asset: id | new; refuses a confidential file or one without a render |
| `archive.setProjectTags` | Tag the project | `archive.curate` | project: id, tags: string | new; refuses another project's id |

S-13 declares 19 actions (was 16); all register for every role, so a person without the permission gets `'no permission: archive.curate is needed to …'` rather than `not-live`. The remaining D-047 Placeholders: `archive.importFolder`, `archive.exportSet`, `archive.set.openSpaces` (S-12) and "Set as cover" without a render.

Module-pass verification (Opus 5, as founder before the permission existed): tsc + build green; Playwright at 1280 and 390 on JOE GALLINA INTERIOR (179 files) — project tag `portafolio ar09` saved, file tag `prueba ar09` saved, stage `technical` -> `delivery`, cover set; all four writes persisted after a reload and the hero cover became that file's thumbnail; 0 console errors, 0 px overflow at 390, no target under 44 px; keyboard-only `TagEditor` run (type `conf` -> ArrowDown -> Enter -> Backspace -> Escape); bus: `archive.tagFile {tags:'plano, PLANO , bus ar09'}` -> `'03 LAYOUT.pdf: plano, bus ar09'`, `archive.setStage {stage:'nope'}` -> `'no such stage: nope'`; realtime in two tabs (tab B's S-12 Tag `Select` gained the option without a reload); Spanish + dark at 1280 read back ("ETIQUETAS Y ETAPA", "Guardar etiquetas", "Etapa de entrega", "Usar como portada"). Screenshots `docs/screenshots/S-13/{en-1280-tags,en-390-tags}.jpg`.

Known gaps: the seed tags every archived file (`archive` + type + stage), so "N tagged" reads "179 tagged" on Joe Gallina — honest, not yet interesting; `TagEditor` has no "create the registry row" side effect and no tone picker; Spaces K-03 / K-01 still edit post tags as a comma-separated `Input` (kanban).

## C. ar-11 — icon system (Fable 5.1 set and mapping, Opus 5 build)

Navigating the OS should be legible at a glance: one drawn icon per thing the system has, replacing the Unicode nav glyphs in the shells, the space tree and the hub cards, without any module changing.

- **`Icon` atom** (`components/atom/Icon/`): **71 names**, one inline SVG each on a 24 x 24 grid, stroke 1.75, round caps and joins, `currentColor`, no fills except tiny dots. `size` sm / md / lg / xl from `--icon-*`, `tone` default / muted / accent, `label` (`role="img"` + `aria-label`) or `aria-hidden` when it sits next to text. Exports `ICON_NAMES`, `isIconName`. `.meta.ts` + `.example.tsx` (the icon sheet on D-02 `/#/dev/components`).
- **Mapping** (`iconMap.ts`, D-064): `ROUTE_ICONS` (every nav route by page code), `GLYPH_ICONS` (45 Unicode glyphs from the route manifest and the seeded spaces), `SPACE_KIND_ICONS` (8 kinds), and `resolveIcon(code, glyph)`: page code first, glyph next, and the caller renders the glyph text last, so nothing renders blank and a new glyph never breaks a page. No module's `nav.glyph` and no seeded space changed.
- **Applied**: DesktopShell sidebar, bottom nav and the More drawer, PhoneShell bottom nav (`app/shells.tsx`, new `NavIcon`); SpaceTree rows (kind icon) and its expand / collapse chevron; SurfaceCard (icon next to the code, and large in the "No preview yet" tile instead of the monogram); every hub card (`HubPage.tsx`, `icon={resolveIcon(code)}`). Icons are decorative (every one sits next to a text label and is `aria-hidden`; `label` only for an icon that stands alone, P-03); names say what the thing is (`approvals`, `deliveries`), not what it looks like; the four portal homes get distinct icons (A-01 gauge, O-01 building, S-01 compass, G-01 diamond, C-01 home).
- **Tokens**: new `icon` group in `design/tokens.ts` (`--icon-sm` 1rem / md 1.25rem / lg 1.5rem / xl 2rem, rem so they follow `--scale`), emitted by `npm run tokens` through the one-line `vars('icon', tokens.icon)` added to `apps/hub/scripts/gen-tokens.mjs`.
- **Docs**: `docs/design/icons.md` (principles, grid, sizes, resolution order, the glyph table, how to add one), `docs/pages/HUB-01.md`, `docs/pages/K-01.md`.
- Verified (Opus 5): tokens + typecheck + build green; Playwright on HUB-01 (`?as=dev`), S-01, K-01, C-01 at 390 and 1280, light and dark: 0 console errors; 17 / 17 sidebar rows, 5 / 5 bottom-nav items, 16 / 16 tree rows and 29 / 29 hub cards carry an icon; sidebar width 256 px before and after; no target under 44 px; no overflow. Screenshots `docs/screenshots/HUB-01/{en-1280-icons,en-1280-icons-dark}.jpg`, `S-01/en-390-icons.jpg`, `K-01/en-1280-icons.jpg`.
- Left for ar-21: the Unicode glyphs modules print inside their own bodies (the K-01 space heading, post-kind marks, `Button icon="☰"`, the theme toggle `☾ / ☼`). Hub thumbnails stay the deploy-time `npm run thumbs` step; the icon tile is the fallback until CI runs it.

## D. ar-15 — company documents: Dropbox "00 INFORMACION RELEVANTE ALUZINA 2023" (Sonnet 5)

The 12 files of link D are in the hub as company documents on G-08 (Brand documents), below the portfolio / brochure cards.

- `docs/archive/company/index.json`: one entry per file with `owner` (`aluzina` | `third-party`), `visibility` (`public` | `internal`), tags, and, for the 5 public files, a served thumbnail, up to 6 page renders, page count, a short text excerpt and the dominant colours.
- `apps/hub/public/archive/company/{thumbs,pages}/`: 5 thumbnails + 19 page renders, **1,199,734 bytes** (1.14 MB), under the 6 MB budget; produced with `render-previews.py` (`download` for the 4 files <= 46 MB, `stream` for the 127.5 MB catalogue — rendered from a temp file, never kept — `render`, `serve`).
- `apps/hub/src/data/seed/company.ts` (order 75): 12 `assets` rows (`kind: 'file'`, tag `empresa`), 8 tag-registry rows (`empresa`, `catálogo`, `presentación`, `precios`, `referencia`, `investigación`, `propio` / `terceros`, `público` / `interno`), 2 `applies-to` relations to playbook service `03`, one Spanish `posts` note (`post-company-docs-2023`) filed in `sp-brand-memory`.
- `apps/hub/src/modules/brand/{DocumentsPage.tsx,specs.ts,strings.ts,brand.css}`: a "Company documents (Dropbox 2023)" section — a `Thumb` grid with owner / visibility `Badge`s, each tile opening a `Drawer` with a `DocumentViewer`; two new actions `brand.openCompanyDocument` / `brand.closeCompanyDocument` (`brand.manage`).
- `docs/pages/G-08.md`, `docs/knowledge/brand.md` (new section + change-log line), `docs/screenshots/G-08/{en-390-company,en-1280-company}.jpg`.

Counts: 12 files — 5 Aluzina / public (rendered): `CATALOGO ^ALUZINA^.pdf` (64 pp., first 6 rendered, streamed), `BOMBILLA ALUZINOGENA .pdf` (3 pp.), `INTEROR DESIGN PRESENTATION   .ai` (9 pp., 6 rendered), `MENSAJES DE IMPORTANCIA DE INTERIORISMO.ai` (3 pp.), `PRESENTACION DE ALUZINA y EXPERIENCIA LUZ DIRECTORA Y MARCAS Y.ai` (1 p.); 4 Aluzina / internal (indexed only): `ALUZINA PRICE NEW YORK.pdf`, `LISTA DE PRECIOS COLOMBIA.pdf`, `lista de precios.pdf`, `INTERIOR DESIGN STUDIOS MEDELLIN.pdf`; 3 third-party (indexed only): `BROCHURE DE OTRA EMPRESA COLOMBIANA DE INTERIORISMO.pdf`, `Catalog LU7.pdf`, `FICHAS TECNICAS LAZARO ROSA VIOLAN.pdf`. No excerpt mentions a price, currency symbol or `COP` / `USD` (checked programmatically). D-068 records the rules; the `applies-to` relations stay minimal (only the two interior-design decks link to service `03`).

Verified (Sonnet 5): typecheck + build green; Playwright as `brand` on `/#/brand/documents` at 390 and 1280 — 12 tiles, 0 console errors, 0 horizontal overflow, the Drawer's served page image returns HTTP 200; Spanish at 1280 ("Documentos de la empresa (Dropbox 2023)").

## E. Shared code: `archive.curate` and `SEED_VERSION` 9 (Fable 5.1)

- **Permission** `archive.curate` (D-067) appended to `PERMISSIONS` in `apps/hub/src/auth/permissions.ts` — tag archived files, set their delivery stage, pick a project cover, tag archived projects — and granted to `studio` and `brand` (`founder` has `*`). ar-09 had used `assets.manage` (files) and `projects.write` (cover, project tags), which left the studio, whose archive it is, unable to tag; widening those two would have handed the studio the brand's asset library and project creation. `modules/archive/{ProjectPortalPage.tsx,specs.ts}` check and declare `archive.curate` for `tagFile` / `setStage` / `setCover` / `setProjectTags`; the refusal strings follow. `docs/knowledge/roles-and-portals.md` (Map + change log), `docs/pages/S-13.md`, `docs/reference/surfaces.md`, `apps/hub/src/modules/README.md`.
- **`SEED_VERSION` 9** (`seed/index.ts`, comment naming this pass): existing browsers re-seed and see the 18 projects' files and the company documents. Origin was at 8.
- **Versions** 0.12.0 -> 0.13.0 (root and hub `package.json`, `plan.json`).
- `scripts/screenshots.mjs`: viewport heights for 1920 (1080) and 2560 (1440); before, any width but 390 / 1280 / 3840 fell back to 900 px.

## F. ar-18 QA at 2560 / 3840 and dark (Fable 5.1) — `docs/qa/0004-archive-4k-dark.md`

S-12 and S-13 as studio at 2560 and 3840 light and 1280 dark, HUB-01 as dev at 3840; measured in the DOM and read back at full size (`docs/screenshots/S-12/{en-2560,en-3840,en-1280-dark}.jpg`, `S-13/{same}`, `HUB-01/en-3840.jpg`). `--scale` bands apply (1.125 / 1.5 / 2 -> root 18 / 24 / 32 px; h1 45 / 60 / 80 px); 0 console errors, 0 failed requests, 0 px overflow in all 9 cells; smallest target 50 / 66 / 88 px; S-12 keeps 4 columns with cards 368 / 490 / 760 px (rem-sized, not stretched); the S-13 rail wraps by pipeline group; dark contrast about 7.7:1 on muted text; the hub's four-column card grid with the surface icons reads from ten feet at 3840. **No archive-module defect**; the one observation is library-wide: the shared `Badge` / `StatTile` label size 0.75rem is 24 px at 3840 (12 px-equivalent), below a 16 px ten-foot bar — filed as a design-system card, not patched in the archive. `checkedAt` on both specs now lists 360, 390, 768, 1280, 1920, 2560, 3840. The Spanish review with the founder (the other half of ar-18) stays a founder session.

## G. Verification of the integrated tree

- `npm run tokens && npm run typecheck && npm run build` green (the chunk-size warning only; `index-*.js` 2.9 MB, see A); `dist/archive/` 30.8 MB (joe-gallina 6.1 + 2026 folders 23.5 + company 1.2).
- Playwright against `npm run preview` at 390 and 1280: studio S-12, S-13 (`prj-ar-hoy`, 206 files), K-01 `/studio/spaces`; brand G-08; dev HUB-01 -> **10 / 10 pass**, 0 console errors, 0 failed requests, 0 px overflow. As **studio** on S-13: the drawer renders the `TagEditor` and Save, a saved tag persists in `aluzina.data`, the stage `Select` is present, the bus answers `archive.tagFile` -> `'…HOY.pdf: bus 0021'` and `archive.setCover` -> `'HOY cover: …'`; the page render loads (HTTP 200). HUB-01: `SEED_VERSION` 9 in the store, 3,659,382 chars.
- **Privacy re-check (D-059)**: `build-index.mjs` re-run from the crawl inputs into a scratch folder and `render-previews.py serve` replayed with each folder's committed settings: the root index and all **19** deep indexes are byte-identical to the committed files apart from `indexedAt`, every served JPEG is identical, `privacyCheck.ok: true` over 1689 inventory entries and 754 deep-index files, 0 problems.
- The four `_pending` drafts are merged above and deleted.

## H. Deferred / next (plan.json step 14)

- **ar-19** (Fable 5.1, next): lazy / split asset store — the page rows and deep-index files out of the seed, loaded per project from the JSON — before ar-07; the store is at 3.66 MB of the 4.5 MB localStorage line and the bundle carries the indexes.
- **ar-07** (Sonnet 5, backlog, depends on ar-19): deep indexes for 2020-2025, one batch per year folder.
- **ar-20** (Opus 5, next): `Drawer` / `Modal` `onClose` focus-trap re-run across callers (a stable `onClose` or a ref inside `useFocusTrap`).
- **ar-21** (Opus 5, backlog): the remaining Unicode glyphs inside module bodies -> `Icon` (space heading, post kinds, `☰`, theme toggle).
- **ar-22** (Sonnet 5, next): HOY 2026 — 180 of 206 files land in stage Other (`stageFor` has no keywords for `IMAGENES HOY`, `MANUAL DE MARCA`, `INFORMACION DISEÑO INTERIOR`, `DETALLES TECNICOS DE ILUMINACION`); folder-template phrases into `stageFor`.
- Founder questions: may `WhatsApp Image …` site photos under design folders be previewed (they are most of the 2026 photo record; D-059 R1 hides them today)? Which company documents are current (0019 H11)? The 2019-2023 folders' inventories were refreshed but not deep-indexed.
- Kanban cards: `TagEditor` adoption in Spaces K-03 / K-01; the `Badge` / `StatTile` 0.75rem size at 4K; `docs/archive/README.md` prose for the R2 / R3 additions (the header table of `build-index.mjs` has them); ar-08, ar-10, ar-12, ar-13, ar-14, ar-17 unchanged.
