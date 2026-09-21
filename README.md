# Aluzina

Monorepo for **Aluzina**, an interior design studio in Medellín (neurointeriorism and emotional lighting; public site [aluzinaa.com](https://aluzinaa.com), built by the owner in Lovable). This repo holds the **Aluzina Business OS**: the hub, the Claude Design prototype once it lands, the surfaces that grow out of it, and every document about them.

**Live:** https://imagine-os.github.io/aluzina/ (GitHub Pages, deployed from `main` by `.github/workflows/pages.yml`; Pages source must be **GitHub Actions**). The hub at `/#/` opens every surface.

**Status:** 0.10.0 (2026-09-21, changelog 0013): the whole Hub bundle is live at https://imagine-os.github.io/aluzina/ — the four role portals (founder A-xx incl. A-08 leads, operations O-xx incl. O-11..O-13 execution control, studio S-xx incl. S-10 checklist / S-11 revision matrix, brand G-xx incl. G-08 documents), the Work views (W-01 / W-02), Spaces with the graph in five views (K-01..K-06), the **public site inside the OS** with the intake flow (`#/services`, `#/start`, `#/portfolio`, P-01..P-05), the **client app** on a phone shell (`?as=client#/client`, C-01..C-06), the **operations manual** rendered from the founder's playbook (`?as=ops#/manual`, M-01..M-08), the **in-app docs** (`#/docs`, D-06 / D-15), the **design system** (`#/design`, D-10 / D-12 / D-13, changelog 0014), and the builder tools (plan viewer D-05, canvas D-07, demo simulator D-08, actions registry D-09, tokens D-14, testing hub D-11, components D-02, specs D-03, multiuser D-04); plus the **Business OS prototype** at https://imagine-os.github.io/aluzina/business-os/ (BOS-01..BOS-06). Data is a mock provider in localStorage (37 entities); next: screenshots and Spanish fill (Sonnet 5), then the client proposal view, file storage, realtime provider (`docs/kanban.md`).

## Layout

| Path | What |
| --- | --- |
| `apps/hub/` | The hub (HUB-01): Vite 5 + React 18 + TypeScript strict, HashRouter, CSS tokens. Builds into repo-root `dist/`, the root of the Pages site. |
| `apps/hub/public/brand/` | Static assets the site serves as-is (Vite `publicDir`): the portfolio and brochure PDFs (`./brand/aluzina-{portfolio,brochure}.pdf`, D-049) and the brand SVG marks (0014). Page renders of the PDFs live in `docs/brand/`, not here. |
| `apps/business-os/` | The **ALUZINA Business OS prototype** (Claude Design export, static `.dc.html` bundle, D-007) with its vendored runtime (`vendor/`, D-008) and URL-safe entry points (D-010). Copied into `dist/business-os/` by the root build. |
| `docs/` | Everything documented. Start at [`docs/README.md`](docs/README.md). |
| `scripts/` | Repo-level tooling (`copy-static.mjs`, `screenshots.mjs`, `thumbnails.mjs`: deploy-time hub thumbnails, D-011). |
| `.github/workflows/pages.yml` | Build + deploy `dist/` to GitHub Pages on push to `main`. |

npm workspaces (`apps/*`). Root `npm run build` assembles `dist/`: the hub build (site root) then `scripts/copy-static.mjs` (prototype -> `dist/business-os/`, plus `.nojekyll`).

## Run

```
npm install
npm run dev          # hub at http://localhost:5173/#/
npm run build        # hub: tokens + tsc --noEmit + vite build -> dist/; then copy-static -> dist/business-os/ (green before every push)
npm run preview      # serve dist/ on :4173
npm run thumbs       # after build: Playwright screenshots of every hub-linked page -> dist/thumbs/ (CI step; never committed)
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
