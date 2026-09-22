# QA: G-09 "Campaigns & assets" against the real Dropbox indexes

date: 2026-09-21
model: Sonnet 5 (this pass: recapture, Playwright matrix, action and data checks)
scope: G-09 `/#/brand/collections` as `brand`, collection view and one set view each (a set with a contact sheet — `campaign-2021` / `imagenes-club-union` — and an internal set with redacted rows — `studio-assets` / `plantillas-cotizacion-y-cuenta-de-cobro`), plus the folder-level redacted set `contabilidad` and the empty set `servicios-aluzina`
build: local production build of this commit (`npm run build`, version 0.13.0), served by `npm run preview` on :4173; Playwright 1.56.1 Chromium
data: the real crawl — `docs/archive/collections/campaign-2021/index.json` (9 sets, 179 files, 4.5 GB indexed, 0 redacted) and `docs/archive/collections/studio-assets/index.json` (69 sets, 1389 files in the index's `files[]`, totals reporting 1517/8.37 GB with 32 redacted); renders served from `apps/hub/public/archive/{campaign-2021,studio-assets}/` (5.5 MB and 21 MB respectively, `du -sh`)

## Build

`npm run build` green (0.13.0, 6.27s, no TypeScript or bundler errors — only the pre-existing >500 kB chunk-size advisory on unrelated chunks).

**Bundle split verified**: `dist/index.html` loads exactly one script, `assets/index-Dq1vAd6P.js` (2.9 MB) — the main entry chunk. Neither collection's per-file rows are in it: a per-file marker unique to campaign-2021 (`_MG_8843`, a RAW file base name) has 0 occurrences in `index-Dq1vAd6P.js` and appears only in `assets/index-Bki0b_7I.js` (88 KB, contains `"campaign-2021"`, not referenced by `index.html` — a lazy chunk). The studio-assets index is its own lazy chunk `assets/index-DEwbGKiH.js` (736 KB, contains `"studio-assets"`, likewise not in `index.html`). The main chunk contains only the string `"imagenes-club-union"` and `"campaign-2021"`/`"studio-assets"` twice each — consistent with the seed's one `assets` row per set (cross-linking only), not the per-file data.

## Store and data

- `localStorage['aluzina.data'].length` after a fresh load of `/#/brand/collections`: **3,780,189** chars — under the 4,500,000 limit.
- `SEED_VERSION` (`aluzina.data.seedVersion`): **10** at capture time, as required then; renumbered to **12** in the integration pass after origin/main took 10 and 11 (the seed content is unchanged).
- `du -sh apps/hub/public/archive/campaign-2021 apps/hub/public/archive/studio-assets`: **5.5M** and **21M**.

## Matrix (collections view + 2 set views x width, plus dark/es cells)

Checks per cell: console errors (Google Fonts proxy error excluded), failed requests (>=400, none excluded), horizontal overflow (`scrollWidth - clientWidth`), smallest interactive target in `main`, `h1` px.

| Cell | Width | Theme/Lang | Errors | Failed | Overflow | Smallest target | h1 px | Result |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| collections | 360 | light/en | 0 | 0 | 0 px | 44 px | 28 | pass |
| collections | 390 | light/en | 0 | 0 | 0 px | 44 px | 28 | pass |
| collections | 768 | light/en | 0 | 0 | 0 px | 44 px | 30.72 | pass |
| collections | 1280 | light/en | 0 | 0 | 0 px | 44 px | 40 | pass |
| collections | 1920 | light/en | 0 | 0 | 0 px | 49.5 px | 45 | pass |
| collections | 2560 | light/en | 0 | 0 | 0 px | 66 px | 60 | pass |
| collections | 3840 | light/en | 0 | 0 | 0 px | 88 px | 80 | pass |
| collections | 1280 | **dark**/en | 0 | 0 | 0 px | 44 px | 40 | pass |
| collections | 1280 | light/**es** | 0 | 0 | 0 px | 44 px | 40 | pass |
| set (club-union, contact sheet) | 360 | light/en | 0 | 0 | 0 px | 44 px | 28 | pass |
| set (club-union) | 390 | light/en | 0 | 0 | 0 px | 44 px | 28 | pass |
| set (club-union) | 768 | light/en | 0 | 0 | 0 px | 44 px | 30.72 | pass |
| set (club-union) | 1280 | light/en | 0 | 0 | 0 px | 44 px | 40 | pass |
| set (club-union) | 1920 | light/en | 0 | 0 | 0 px | 49.5 px | 45 | pass |
| set (club-union) | 2560 | light/en | 0 | 0 | 0 px | 66 px | 60 | pass |
| set (club-union) | 3840 | light/en | 0 | 0 | 0 px | 88 px | 80 | pass |
| set (plantillas, internal + redacted rows) | 1280 | light/en | 0 | 0 | 0 px | 44 px | 40 | pass |

17/17 cells pass. `h1` is the page-level "Campaigns & assets" heading in every cell (the set title is an `h2`); it scales through the shell's bands exactly as at 1280 (40 px) / 2560 (60 px) / 3840 (80 px), matching 0004's HUB-wide bands.

## Functional checks

- **Keyboard path**, run end to end at 1280: Tab reaches the first set tile (`aria-label="Open the set Loose files (campaign root)"`, visible focus) -> **Enter** opens it (`?c=campaign-2021&set=root`, no page reload) -> Tab reaches a file tile (`Open 200 X 200.ai`) -> **Enter** opens the Drawer (title `200 X 200.ai`) -> **Escape** closes it -> **browser Back** returns to the set grid (`?c=campaign-2021`, `h1` unchanged). All five steps verified in the DOM, not just visually.
- **Six `brand.*` actions**, via `window.__aluzina.actions.run` against real data:
  - `brand.openCollection {collection:'studio-assets'}` -> `opened the collection "Studio assets"`
  - `brand.openSet {set:'contabilidad'}` -> `opened the set "Accounting 2017-2025 (redacted folder)" (123 files, 1 redacted)`
  - `brand.openSet {set:'iconos-2024'}` -> `opened the set "Icon set 2024" (18 files, 0 redacted)`
  - `brand.filterCollection {query:'icon'}` -> `filtering the files by "icon"`
  - `brand.openCollectionFile {file:'ALUZINA/ALUZINA.pdf'}` and, once that set is open, the bare name `{file:'ALUZINA.pdf'}` -> both `opened the preview of "ALUZINA.pdf" (4 page renders)`
  - `brand.closeCollectionFile` -> `closed the file preview`
  - `brand.downloadCollectionSet {set:'contabilidad'}` -> `not wired yet: downloading a whole set needs file storage; today the Dropbox folder is the download` (Placeholder still answers, D-047)
  - (Two ids from my first pass, `sa-icons` and a premature `contabilidad` call issued in the same tick as the collection switch, came back `unknown set "…"` — that is the *action* correctly reporting an id that does not exist / is not yet the active collection, not a defect; re-run with the real id and a tick to let the switch land succeeded as above.)
- **Redacted row, not clickable, with tooltip**: in `plantillas-cotizacion-y-cuenta-de-cobro` (4 of 27 files redacted), the redacted rows are plain `<li>` rows (no button), and `title="No preview: this file is internal or redacted, so nothing of it is served."` is present on them — confirmed via DOM query.
- **Folder-level redacted row** (`contabilidad`, whole folder redacted): the set view renders one row for the folder (`fileCount` in the DOM = 1 row for the redacted folder placeholder, back link and set title both present) — reads sanely, no broken image, no crash.
- **Empty set** (`servicios-aluzina`, `fileCount: 0`): set view renders with the back link and the set's own `EmptyState` copy; no preview grid, no row list.
- **Filter with no match**: typing `zzzznomatch` renders an `EmptyState` that quotes the query back (`main` text contains `zzzznomatch`).
- **Project chip -> S-13 -> back**: on `campaign-2021`, the "Club Unión - sala de masajes" chip is `<a href="#/brand/archive/prj-pf-club-union-sala-de-masajes">`; clicking it navigates to the project portal (`h1` becomes "Project archive" — the target project page itself resolves under S-13's own routing), and browser Back returns to `#/brand/collections?c=campaign-2021`.
- **Contact sheet**: `imagenes-club-union` (48 files) renders `<img src=".../sheets/imagenes-club-union.jpg">` plus "Open full size"; loaded with HTTP 200 (no failed request logged for it across any matrix cell).
- **Viewer (Drawer over a rendered document)**: opening `ALUZINA.pdf` (37 pages, capped at 4 page renders per `renderSettings.maxPages`) shows the `DocumentViewer` paging 1 of 4 with thumbnail strip, path, and the Spanish text excerpt — all page images resolved (HTTP 200, `apps/hub/public/archive/studio-assets/pages/aluzina-p0N.jpg`).

## Spanish read-back at 1280 (`aluzina.lang = es`)

"Campañas y assets" (h1), "Campaña 2021" / "Assets del estudio" (tabs), "CONJUNTOS" / "ARCHIVOS" / "CON VISTA PREVIA" / "INTERNOS" (stat labels), "Abrir en Dropbox" (Dropbox link). No untranslated English strings seen in the collection view or the club-union set view.

## Screenshots written (`docs/screenshots/G-09/`)

`en-390.jpg`, `en-1280.jpg`, `es-1280.jpg`, `en-1280-dark.jpg`, `en-3840.jpg` — collection view, real data (was the stub before this pass).
`en-390-set.jpg`, `en-1280-set.jpg` — set view of `campaign-2021` / `imagenes-club-union` (48 files, contact sheet, project chip).
`en-1280-set-internal.jpg` — set view of `studio-assets` / `plantillas-cotizacion-y-cuenta-de-cobro` (internal, 4 redacted rows).
`en-1280-viewer.jpg` — Drawer open on `ALUZINA.pdf`, a rendered document page (added this pass; captured with a small one-off Playwright script rather than `scripts/screenshots.mjs`, because the open file is component state, not part of the URL — see *Not checked*).

The stub-era filenames (`c21-social-posts` set, 2-set/3-file examples) are gone; every file above now reflects the real crawl. Nothing was deleted beyond that: the same 7 base shots from the original capture plan, plus the 2 new ones (`en-1280-set-internal`, `en-1280-viewer`) called for by this pass.

## Findings (not fixed — QA only)

1. **Data quality: garbled `caption` for `studio-assets`.** `docs/archive/collections/studio-assets/index.json`, top-level `caption` field, reads `"services , lighting , presentatios , projects , icones ,"` — a comma-joined fragment with a misspelling ("presentatios") and a French-looking word ("icones") rather than a real sentence (contrast `campaign-2021`'s caption, `"digital campain aluzina 2021"`, which at least reads as a phrase, itself with its own typo "campain"). Visible directly under the "Studio assets" tab in every capture and cell that opens that collection (e.g. `en-1280-set-internal.jpg`). This is indexing-pipeline output, not app code — flagging for whoever generates the index captions.
2. **Minor, not a defect**: at 390 px the collection-switcher-plus-stats block is tall enough that opening a set (`en-390-set.jpg`) shows the same above-the-fold content as the collection view (`en-390.jpg`) — the set's own heading and file grid are correct in the DOM (verified via full `main.textContent`, confirmed "Club Unión photo shoot" and the back link are present) but sit below a ~900 px mobile fold. Not a routing or rendering bug; just means the phone screenshot pair looks visually identical unless scrolled. Filed as an observation, not fixed.

No functional, console-error, failed-request, overflow or target-size defects found in the G-09 page code itself against the real data.

## Not checked

- The full 1389-row `studio-assets` set grid at every width (only the two named sets — `plantillas-cotizacion-y-cuenta-de-cobro` and `contabilidad` — and the two empty/redacted-folder cases were opened; the other 67 sets were not individually opened).
- `en-1280-viewer.jpg` was captured with a one-off script, not `scripts/screenshots.mjs` (see above) — `scripts/screenshots.mjs` has no `--click` option to reach Drawer-open state, and adding one was out of this pass's owned-files scope; `routes.json` was updated by hand to add `en-1280-viewer` to the `shots` list without touching the script.
- Tablet width (768) was checked in the collections-view and one set-view row of the matrix but not captured as a screenshot (matches the original capture plan, which never listed a 768 shot for G-09).
- The 2026-crawl `privacyCheck` block in each index (`ok: true`, 0 `problems`) was read but not independently re-audited file by file.
- Founder-role and non-`brand` role access to this page (permission `brand.manage`) was not re-verified this pass; unchanged from the original build.

## Result

G-09 passes at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840, light + dark at 1280, en + es at 1280, against the real `campaign-2021` and `studio-assets` indexes. `checkedAt` on `collectionsSpec` already listed all seven widths from the stub-data pass; unchanged. One data-quality issue filed (studio-assets caption), no code defects found.
