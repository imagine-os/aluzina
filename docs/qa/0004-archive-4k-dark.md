# QA: project archive S-12 / S-13 at 2560 / 3840 and dark, HUB-01 icons at TV size (ar-18, changelog 0021)

date: 2026-09-21
model: Fable 5.1 (integration pass; captures, measurements and the legibility judgement)
scope: S-12 `/studio/archive` and S-13 `/studio/archive/prj-ar-joe-gallina-interior` as `studio` at 2560 and 3840 light and at 1280 dark; HUB-01 `/` as `dev` at 3840 (the icon system of ar-11 on cards and in the "No preview yet" tile); plus the step-2 integration smoke at 390 / 1280
build: local production build of this commit (`npm run build`, version 0.13.0) served by `npm run preview` on :4173; Playwright 1.56.1 Chromium; `aluzina.session` seeded with the demo user (`scripts/screenshots.mjs --as=<role>`, which gained a 2560 x 1440 viewport height in this pass)
data: the real seed (`SEED_VERSION` 9): 205 projects, 2026 `kind: 'file'` assets (1392 + 575 of the 18 deep-indexed 2026 folders + 12 company documents + the rest), store `localStorage['aluzina.data']` 3,659,382 chars

## Ten-foot rule applied

A page passes at 2560 / 3840 when (a) the `--scale` band applies (root font grows with the width, so everything drawn in rem grows), (b) the smallest body text is at least 16 px-equivalent at 1920 (i.e. >= 16 px at scale 1.125 -> 18 px root), (c) no interactive target is under 44 px, (d) card grids gain columns or keep their card width in rem instead of stretching, and (e) nothing overflows horizontally. Measured in the DOM (computed styles and bounding boxes), then the captures were read back at full size.

## Scale bands and type (measured)

| Width | `--scale` | root / body | h1 (S-12) | smallest HTML text on the page | meta line (`.arc-card__meta`) | badges / stat labels |
| --- | --- | --- | --- | --- | --- | --- |
| 1280 (dark) | 1 | 16 px | 40 px | 12 px (`Badge`, `StatTile` label) | 14 px | 12 px |
| 1920 | 1.125 | 18 px | 45 px | 13.5 px | 15.75 px | 13.5 px |
| 2560 | 1.5 | 24 px | 60 px | 18 px | 21 px | 18 px |
| 3840 | 2 | 32 px | 80 px (HUB-01: 96 px) | 24 px | 28 px | 24 px |

The `FileIcon` SVGs carry a 6.5 px "PDF" / "AI" glyph label inside the icon mark; it is part of the drawing (`role="img"` with the type as the label), not UI text, and is excluded above.

## Matrix (role x page x width x theme)

Checks per cell: `h1` present, 0 console errors / page errors, 0 failed requests (HTTP >= 400, favicon excluded), horizontal overflow 0 px, smallest interactive target in `main` (px), grid columns and card width where a grid exists.

| Role | Page | Width | Theme | Errors | Failed | Overflow | Smallest target | Grid | Result |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| studio | S-12 | 1920 | light | 0 | 0 | 0 px | 50 px | 4 cols, cards 368 px | pass |
| studio | S-12 | 2560 | light | 0 | 0 | 0 px | 66 px | 4 cols, cards 490 px | pass |
| studio | S-12 | 3840 | light | 0 | 0 | 0 px | 88 px | 4 cols, cards 760 px (= 380 px at scale 1) | pass |
| studio | S-12 | 1280 | dark | 0 | 0 | 0 px | 44 px | 3 cols, cards 309 px | pass |
| studio | S-13 | 1920 | light | 0 | 0 | 0 px | 50 px | rail 218 px tall (2 rows of groups) | pass |
| studio | S-13 | 2560 | light | 0 | 0 | 0 px | 66 px | rail 288 px (Design + Sale, then Build + Close) | pass |
| studio | S-13 | 3840 | light | 0 | 0 | 0 px | 88 px | rail 381 px (Design + Sale + Build, then Close) | pass |
| studio | S-13 | 1280 | dark | 0 | 0 | 0 px | 44 px | rail 296 px | pass |
| dev | HUB-01 | 3840 | light | 0 | 0 | 0 px | 584 px (the card) | 4 cols, cards 584 px in a 2420 px measure | pass |

Integration smoke at 390 and 1280 (light), same checks: studio S-12, S-13 (`prj-ar-hoy`, 206 files), K-01 `/studio/spaces`; brand G-08 `/brand/documents`; dev HUB-01 -> 10 / 10 cells pass, 0 errors, 0 failed requests, 0 px overflow. On S-13 as **studio** (the role that could not tag before `archive.curate`): the drawer over `ALUZINA_Equipo_Tecnico_Proyecto_Luminico_HOY.pdf` renders the `TagEditor` (1 combobox, Save tags button), a tag typed and saved persists in `aluzina.data` (`['archive','pdf','design-development','integracion 0021']`), the stage `Select` is present, the file is already the project cover so the "Project cover" badge shows instead of the button; through the bus `archive.tagFile` -> `'…HOY.pdf: bus 0021'` and `archive.setCover` -> `'HOY cover: …'`; the drawer's page render (`pages/…-page-01.jpg`, 707 px wide at HOY's 1000 px budget) loaded, HTTP 200.

## Captures read back at full size

`docs/screenshots/S-12/{en-2560,en-3840,en-1280-dark}.jpg`, `docs/screenshots/S-13/{en-2560,en-3840,en-1280-dark}.jpg`, `docs/screenshots/HUB-01/en-3840.jpg`.

- **S-12 at 3840**: header, four stat tiles and the filter row read from across a room; the tile numbers (3 / 23 / 179 / 205) are 66 px; four cards per row with 760 px covers (the 2026 projects now show real covers: Alma Prana, Andres y Andrea, Cartagena Copetran, Casa Dharma, Decero, HOY, Honey Valley), file counts and "N tagged" beside them; status pills 24 px caps. Nothing stretched: the cards are as wide in rem as at 1920.
- **S-12 at 2560**: the same composition at scale 1.5; card titles wrap to two lines where long (Casa Dharma San Pedro de los Milagros) without clipping.
- **S-13 at 3840 / 2560**: hero with the 890 px plan render, name, pills, the Tags block (chips 24 px caps with 88 px x targets, the `TagEditor` field, Save tags), the four action buttons; the delivery-order rail wraps by pipeline group (Design + Sale + Build on the first row at 3840, Close on the second; Design + Sale then Build + Close at 2560) with 64 px-equivalent stage buttons and their counts; the Files toolbar follows. The whitespace to the right of the rail's first row is the group wrap, not a stretched control.
- **Dark at 1280 (both pages)**: body `#0e0e0e`, muted text `rgb(166,166,166)` (about 7.7:1 on the body), amber Placeholder badge `rgb(227,192,112)`, cover renders on white tiles, chips on `#171717`; the header actions of S-12 wrap under the subtitle at 1280 x 900 in both themes (the subtitle is long), which is the `PageHeader`'s intended wrap.
- **HUB-01 at 3840**: the wordmark hero, "Aluzina Business OS" at 96 px, four portal cards per row; every "No preview yet" tile draws the surface icon (A-01 gauge, O-01 building, S-01 compass, G-01 diamond) at 2 x `--icon-xl` and every card carries the small icon next to its code; the hub keeps its 2420 px reading measure, so about 63 % of the width is used at 4K.

## Findings

1. **No archive-module defect at 2560 / 3840 or in dark.** Grid columns, rail wrap, card widths, targets and overflow all pass; nothing in `archive.css` or `SurfaceCard.css` needed a change.
2. **Library-level observation (kanban card, not fixed here)**: the smallest UI text is the shared `Badge` and `StatTile` label size, 0.75rem (12 px at scale 1, 13.5 px at 1920, 24 px at 3840). At 3840 that is 12 px-equivalent from ten feet, below the 16 px-equivalent bar this matrix applies. It is a design-system token decision (the size is used by every module), so it is filed rather than patched in the archive.
3. **`.arc-card__meta` at 0.875rem** (15.75 px at 1920) sits just under the bar at 1920 and at 28 px reads fine at 3840; kept consistent with the app-wide meta size rather than making the archive the one module that differs (same card as finding 2).
4. `scripts/screenshots.mjs` had no viewport height for 2560 (fell back to 900 px); it now maps 1920 -> 1080 and 2560 -> 1440.

## Result

S-12 and S-13 pass at 2560 and 3840 (light) and at 1280 (dark); `checkedAt` on both specs now lists 360, 390, 768, 1280, 1920, 2560, 3840. HUB-01 passes at 3840 with the icon system. The Spanish review with the founder, the other half of ar-18, remains a founder session (kanban).
