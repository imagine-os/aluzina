version: 0.2.0
date: 2026-09-20
prompt: 0001
intent: Ingest the Claude Design export into apps/business-os, vendor its runtime, give it URL-safe entry points and serve it live under the hub at /business-os/.
decision: D-007, D-008, D-009, D-010 (D-003, D-006 closed)
rejected: porting the export to React / Vite now (no build step exists; audit first, D-007); renaming the .dc.html files (the runtime keys components off the filename, D-010); keeping uploads/ (140 MB of byte-identical duplicates, D-009); loading React / Babel / fonts from unpkg and Google at page load (external SPOF, D-008); copying the OS page into index.html (two sources of truth)
files: apps/business-os/** (export minus uploads/; support.js patched; vendor/; index.html + 5 forwarders; README.md), docs/source/claude-design-export/{plan.md, selav-mis-datos-2026-09-02. (2).pdf}, scripts/copy-static.mjs, package.json (build, copy:static, 0.2.0), apps/hub/package.json (0.2.0), apps/hub/src/modules/hub/{HubPage.tsx, HubPage.css, specs.ts, strings.ts}, README.md, docs/README.md, docs/project-brief.md, docs/decisions.md, docs/kanban.md, docs/prompts/0001-load-claude-design-export.md, docs/pages/BOS-01.md, docs/pages/BOS.md, docs/reference/business-os-export.md, docs/reference/surfaces.md, docs/changelog/0003-business-os-ingest.md
codes: BOS-01, BOS-02, BOS-03, BOS-04, BOS-05, BOS-06, HUB-01
model: Fable 5.1

# 0003 - Business OS prototype ingested and live

## What changed

- **Export in the repo** (`apps/business-os/`, 137 MB): every file of `ALUZINA Business OS prototype.zip` except `uploads/` (file list verified). Byte-identical except the two metadata edits below. `uploads/plan.md` and the SELAV PDF moved to `docs/source/claude-design-export/`.
- **Vendored runtime (D-008)**: `vendor/react.production.min.js`, `react-dom.production.min.js`, `babel.min.js` downloaded from the exact unpkg URLs `support.js` pins; SHA-384 matches the SRI strings. Google Fonts CSS for both URL variants fetched with a woff2 UA, `url()`s rewritten to 18 local woff2 files. `support.js` patched in one marked hunk (CDN constants -> `./vendor/`); in each of the six pages the `<helmet>` font `<link>` points at `./vendor/fonts/` and the two Google `preconnect`s are removed (the browser fetches helmet stylesheets while parsing, so a runtime-only rewrite could not stop the request). Templates, scripts, custom elements and media untouched.
- **URL-safe entry points (D-010)**: `index.html` and five page forwarders that keep `?query` and `#hash`.
- **Build**: `npm run build` = hub build + `scripts/copy-static.mjs` (copy to `dist/business-os/`, write `dist/.nojekyll`). Version 0.2.0.
- **Hub (HUB-01)**: the Business OS card is live (BOS-01 -> `./business-os/`); new "Prototype pages" group with five live SurfaceCards (BOS-02..06); new action `hub.openPrototypePage` (`page: enum`); all new strings EN + ES.
- **Docs**: `reference/business-os-export.md` (digest, runtime, patch, audit list), `pages/BOS-01.md`, `pages/BOS.md`, D-007..D-010, kanban (step 1 done, step 2 doing), surfaces (static routes + `?embed=1&screen=` contract), prompt 0001 replies 3-5, brief (second Drive link was the correct file), READMEs.

## Verified

`npm run build` green; local Playwright against `dist/`: `/business-os/` forwards and renders the OS app (`#dc-root` populated), `?embed=1&screen=qc` renders the QC screen bare, zero requests to unpkg.com / fonts.googleapis.com / fonts.gstatic.com on all six pages, the EN/ES toggle flips the copy ("Cockpit" -> "Cabina"); Home, Cyber Bridge, Deck, Plan and LOD render. Export-inherent console noise recorded in `docs/reference/business-os-export.md` section 4. Live verification and screenshots follow in changelog 0004.

## Pushed in chunks

Code + docs + small assets first, then `assets/world` PNGs in two commits and the mp4s in one, each under ~60 MB (GitHub HTTP 413 guard). No history rewrite.

## Not done / follow-ups

- Step 2 audit (P-01..P-15) of the export; `assets/world/*.png` media budget; no `PageSpec` / actions for BOS pages yet; `Canvas.dc.html` is empty and unlinked.
