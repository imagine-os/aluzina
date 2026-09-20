version: 0.3.0
date: 2026-09-20
prompt: 0002
intent: Hub cards show a thumbnail of the page they open, regenerated on every deploy so they never drift from the live pages; a domain knowledge base with explicit change tracking holds the team roster, the 2027 competitions programme and the role -> portal map.
decision: D-011, D-012, D-013
rejected: hand-committed thumbnails (drift, merge noise, 300 KB of binaries per pass); thumbnails inside `npm run build` (would slow every local build and need Chromium everywhere); keeping the roster only in Claude's channel memory (not canonical, not versioned, invisible to other agents)
files: scripts/thumbnails.mjs, package.json (`thumbs` script, 0.3.0), apps/hub/package.json (0.3.0), .github/workflows/pages.yml (install Chromium + `npm run thumbs` after build), apps/hub/vite.config.ts (`__BUILD_ID__`), apps/hub/src/vite-env.d.ts, apps/hub/src/components/molecule/SurfaceCard/{SurfaceCard.tsx,SurfaceCard.css,SurfaceCard.meta.ts}, apps/hub/src/i18n/core.ts (`core.thumb.*`), apps/hub/src/modules/hub/{HubPage.tsx,specs.ts}, docs/knowledge/{README,team,competitions,roles-and-portals}.md, docs/build-plan.md, docs/kanban.md, docs/decisions.md, docs/reference/surfaces.md, docs/pages/HUB-01.md, docs/README.md, docs/prompts/0002-hub-thumbnails-and-team-knowledge.md, docs/changelog/0005-hub-thumbnails-and-knowledge-base.md, docs/screenshots/HUB-01/{en-1280,en-390}.jpg
codes: HUB-01
model: Fable 5.1

# 0005 - Hub thumbnails at deploy time; knowledge base

## A. Thumbnails (D-011)

`scripts/thumbnails.mjs` runs **after** `npm run build` as its own CI step (`npm run thumbs`), never as part of the build:

1. Serves `dist/` on `127.0.0.1:4180` with Node's `http` module (dot-files included, like Pages with `.nojekyll`; no extra dependency).
2. Launches Playwright Chromium (`PW_EXECUTABLE` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE` override; `/opt/pw-browsers/chromium` when present, else Playwright's own install, which CI gets from `npx playwright install --with-deps chromium`).
3. For every hub-linked surface (BOS-01..06 from `dist/`, P-00 aluzinaa.com and D-06 the GitHub docs page as best-effort externals, HUB-01 last so its own thumb shows the fresh thumbs): `goto` with `domcontentloaded`, wait for a page-specific selector (`#dc-root` filled with text for the Claude Design pages, `.surface-card__thumb` for the hub), 2 s settle, screenshot at 1280 x 800 (device scale 1), downsize to 640 x 400 JPEG q80 through a canvas. mp4 / webm requests are aborted and `networkidle` is never awaited (the Home page and the deck autoplay video loops). Each capture runs under a 45 s timeout; a failure writes the bilingual placeholder tile and logs the error instead of failing the deploy.
4. Writes `dist/thumbs/<code>.jpg` and `dist/thumbs/manifest.json` (`{ generatedAt, capture, thumb, items: [{ code, path, generatedAt, source, error? }] }`; `source` is the captured URL or `placeholder`).

Local captures use a browser without a proxy (Playwright's launch-level proxy routes `127.0.0.1` through it, which is what hung the first local run); the external captures get a second browser with `HTTPS_PROXY` when the environment sets one. Local run: 9 thumbnails in 30 s.

`SurfaceCard` gained an `image` slot: `<img loading="lazy" decoding="async" width=640 height=400>` inside a fixed 16 / 10 box, alt "Preview of {title}" via `useT()`, `object-fit: cover` anchored top; `onError` swaps in the bilingual "No preview yet / Sin vista previa aún" tile, which planned cards always show (`data-thumb="image" | "placeholder"` for QA). Cards read `./thumbs/<code>.jpg?v=<buildId>`; `__BUILD_ID__` (base-36 build timestamp) busts the Pages cache on every deploy. `spec.checkedAt` now records the full matrix 360..3840 (local smoke).

## B. Knowledge base (D-012, D-013)

`docs/knowledge/` with the entry convention (`status: current | superseded | draft`, `since`, `source`, `supersedes`; superseded entries kept with a pointer; per-file `## Change log`). Files: `team.md` (four roles as the founder wrote them), `competitions.md` (20 entries in 2027, three projects, list still unknown), `roles-and-portals.md` (Founder `A-xx`, Operations `O-xx`, Studio `S-xx`, Brand `G-xx`, Client `C-xx`, Dev `D-xx` with the permission strings each implies; all planned). Build plan gains step 9 (per-role portals: Fable 5.1 owns roles / permissions, Opus 5 builds the portals). No auth code yet: the hub has no `src/auth/`, so the roles land as a documented next step.

## Verified

- Pages deploy: workflow run [35545531282](https://github.com/imagine-os/aluzina/actions/runs/35545531282) on 98e1b1e, `build` (incl. `npx playwright install --with-deps chromium` + `npm run thumbs`) and `deploy` success, ~2.5 min end to end.
- https://imagine-os.github.io/aluzina/thumbs/manifest.json -> HTTP 200, `generatedAt` 2026-09-20T23:45:34Z, 9 items, all real captures (`source` = the captured URL, no `placeholder`); `thumbs/HUB-01.jpg` 200 (34 KB), `thumbs/BOS-01.jpg` 200 (45 KB), `thumbs/P-00.jpg` 200 (34 KB); https://imagine-os.github.io/aluzina/ -> 200.
- Live screenshots with thumbnails: `docs/screenshots/HUB-01/en-1280.jpg`, `en-390.jpg` (+ `routes.json`), replacing the changelog 0002 captures at those widths.
