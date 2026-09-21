# QA: project archive S-12 / S-13 smoke (changelog 0019)

date: 2026-09-21
model: Fable 5.1 (integration pass); module-pass verification by Opus 5 recorded in `docs/pages/S-12.md` / `S-13.md`
scope: the two `archive` module pages on the three surfaces that mount them (studio, founder, brand), the preview drawer over a served page render, the new HUB-01 card, dark theme
build: local production build of this commit (`npm run build`, version 0.11.0) served by `npm run preview` on :4173; Playwright 1.56.1 Chromium, `?as=<role>` seeds the demo user (surfaces.md 1.1a)
data: the real seed (`SEED_VERSION` 7): 205 projects (186 archived Dropbox folders + 13 portfolio + 6 live), 1392 `kind: 'file'` assets (341 tagged `confidencial`), 25 thumbnails and 86 page renders served from `apps/hub/public/archive/joe-gallina-interior/`

## Matrix (role x page x width)

Checks per cell: page renders (`h1` present), 0 console errors / page errors, 0 failed requests (HTTP >= 400, favicon excluded), horizontal overflow `scrollWidth - clientWidth` = 0 px.

| Role | Page | 390 | 1280 | Title seen |
| --- | --- | --- | --- | --- |
| studio | S-12 `/studio/archive` | pass (0 err, 0 px) | pass (0 err, 0 px) | Project archive |
| studio | S-13 `/studio/archive/prj-ar-joe-gallina-interior` | pass | pass | Joe Gallina Interior |
| founder | S-12 `/founder/archive` | pass | pass | Project archive |
| founder | S-13 `/founder/archive/prj-ar-joe-gallina-interior` | pass | pass | Joe Gallina Interior |
| brand | S-12 `/brand/archive` | pass | pass | Project archive |
| brand | S-13 `/brand/archive/prj-ar-joe-gallina-interior` | pass | pass | Joe Gallina Interior |

12 of 12 cells pass.

## Drawer over a served render

- `window.__aluzina.actions.run('archive.openFile', { asset: 'ast-ar-joe-gallina-interior-00-planos-altos-de-la-toja' })` -> `{ ok: true, result: '00 PLANOS ALTOS DE LA TOJA.pdf' }` (studio, 1280).
- The drawer's `DocumentViewer` renders `./archive/joe-gallina-interior/pages/diseno--03-planos--00-planos-altos-de-la-toja-page-01.jpg`: `img.complete = true`, `naturalWidth = 1200` (the served page width); every `/archive/joe-gallina-interior/{thumbs,pages}/…` request observed answered **HTTP 200** (five sampled: the plan thumbnail and the four presentation thumbnails on the hero and stage rail).
- Redacted files open to the `FileIcon` + "no preview" sentence and the folder link (D-059), never a broken image; an image whose render is missing falls back the same way (`DocumentViewer` `onError`, changelog 0019 A4).

## Hub card and theme

- HUB-01 as `dev`: `[data-surface="archive"]` renders with `data-surface-status="live"`, code S-12, title "Project archive".
- Dark theme (`aluzina.theme = dark`, reload): `html[data-theme="dark"]`, body background `rgb(14, 14, 14)` on S-12; no literal colours in `archive.css` (tokens only, module pass).

## Screenshots reviewed

`docs/screenshots/S-12/{en-390,en-1280,en-1920,es-1280}.jpg`, `docs/screenshots/S-13/{en-390,en-1280,en-1920,es-1280}.jpg`, `docs/screenshots/HUB-01/en-1280.jpg` (re-captured against this build). Read back at 1280: S-12 shows 205 projects / 1392 files, shelves 3 / 23 / 179 / 205, cards with `FileIcon` tiles where no cover exists; S-13 shows the plan render as cover, 179 files across 9 stages, the stage rail with counts (Procurement 109 = the supplier folders, all redacted). No overflow, no clipped text, no missing cover.

## Not covered here (queued)

2560 / 3840 widths and the dark-theme captures (ar-18), keyboard pass over the new data volume (the module pass verified tab order and the rail's arrow keys on the stub data), Spanish review with the founder (ar-18), performance of the seed at 2.4 MB of `localStorage` with 1392 file rows (watch when the 2026 deep indexes land, ar-06).
