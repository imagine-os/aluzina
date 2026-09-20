# Aluzina

Monorepo for **Aluzina**, an interior design studio in Medellín (neurointeriorism and emotional lighting; public site [aluzinaa.com](https://aluzinaa.com), built by the owner in Lovable). This repo holds the **Aluzina Business OS**: the hub, the Claude Design prototype once it lands, the surfaces that grow out of it, and every document about them.

**Live:** https://imagine-os.github.io/aluzina/ (GitHub Pages, deployed from `main` by `.github/workflows/pages.yml`; Pages source must be **GitHub Actions**). The hub at `/#/` opens every surface.

**Status:** 0.2.0 (2026-09-20, changelog 0003): hub (HUB-01) plus the **Business OS prototype** live at https://imagine-os.github.io/aluzina/business-os/ (Claude Design export served as a static bundle with a vendored runtime, BOS-01..BOS-06). Next: audit against the platform principles (build plan step 2).

## Layout

| Path | What |
| --- | --- |
| `apps/hub/` | The hub (HUB-01): Vite 5 + React 18 + TypeScript strict, HashRouter, CSS tokens. Builds into repo-root `dist/`, the root of the Pages site. |
| `apps/business-os/` | The **ALUZINA Business OS prototype** (Claude Design export, static `.dc.html` bundle, D-007) with its vendored runtime (`vendor/`, D-008) and URL-safe entry points (D-010). Copied into `dist/business-os/` by the root build. |
| `docs/` | Everything documented. Start at [`docs/README.md`](docs/README.md). |
| `scripts/` | Repo-level tooling (`copy-static.mjs`, `screenshots.mjs`). |
| `.github/workflows/pages.yml` | Build + deploy `dist/` to GitHub Pages on push to `main`. |

npm workspaces (`apps/*`). Root `npm run build` assembles `dist/`: the hub build (site root) then `scripts/copy-static.mjs` (prototype -> `dist/business-os/`, plus `.nojekyll`).

## Run

```
npm install
npm run dev          # hub at http://localhost:5173/#/
npm run build        # hub: tokens + tsc --noEmit + vite build -> dist/; then copy-static -> dist/business-os/ (green before every push)
npm run preview      # serve dist/ on :4173
npm run typecheck
npm run tokens       # apps/hub/src/design/tokens.ts -> src/styles/tokens.css
npm run copy:static  # only the prototype copy
npm run screenshots -- --base=https://imagine-os.github.io/aluzina/   # Playwright captures into docs/screenshots/HUB-01/
```

Node 22 (`.nvmrc`). Chromium for screenshots is preinstalled at `/opt/pw-browsers` in our containers; never run `playwright install`.

## Hub (HUB-01)

English / Spanish toggle (English primary, Spanish falls back to English, `aluzina.lang`), light / dark (`aluzina.theme`), developer mode (`aluzina.devMode`; shows the page-code SpecChip, the declared actions panel on Ctrl+., and always-visible placeholder markers). Surfaces that are not live yet are wrapped in the `Placeholder` atom and say so. The route manifest is published at `window.__aluzina` (see `docs/reference/surfaces.md`).

## For agents

Read [`docs/README.md`](docs/README.md), then [`docs/platform-principles.md`](docs/platform-principles.md) (binding), [`docs/build-plan.md`](docs/build-plan.md), [`docs/kanban.md`](docs/kanban.md), [`docs/decisions.md`](docs/decisions.md). Git only: commit and push to `main`, no PRs, no Slack posts from agents, no GitHub Contents-API tools. Documentation lands in the same turn as the work.
