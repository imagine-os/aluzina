version: 0.1.0
date: 2026-09-20
prompt: 0001
intent: Scaffold the Aluzina monorepo, ship a minimal live hub (HUB-01) on GitHub Pages and lay down the docs tree so the Claude Design export drops straight in.
decision: D-001, D-002, D-003, D-004, D-005, D-006
rejected: putting the app at the repo root (a single-app layout would have to be re-cut when the prototype lands, D-001); legacy branch Pages from `main` root (no build step, no `dist/`, D-002); unpacking the export directly into the hub package (would lose the audit boundary, D-003); Spanish-primary key shape (`{ es, en? }` as in Hoy) — kept English primary per house rules, default language left open (D-004)
files: README.md, .gitignore, .nvmrc, package.json, package-lock.json, .github/workflows/pages.yml, apps/hub/** (package.json, vite.config.ts, tsconfig*.json, index.html, scripts/gen-tokens.mjs, src/**), apps/business-os/README.md, scripts/screenshots.mjs, docs/README.md, docs/platform-principles.md, docs/project-brief.md, docs/build-plan.md, docs/decisions.md, docs/kanban.md, docs/prompts/0001-load-claude-design-export.md, docs/changelog/0001-repo-scaffold.md, docs/pages/_TEMPLATE.md, docs/pages/HUB-01.md, docs/reference/surfaces.md
codes: HUB-01
model: Fable 5.1

# 0001 - Repo scaffold, HUB-01 and Pages deploy

## What changed

- **Monorepo**: npm workspaces `apps/*`; root `npm run build` builds `apps/hub` into repo-root `dist/` (Vite `outDir: '../../dist'`, `emptyOutDir`). The root `package.json` carries a `//` note for appending the `apps/business-os` build (-> `dist/business-os/`) when the export lands.
- **`apps/hub` (HUB-01)**: Vite 5 + React 18 + TypeScript strict, HashRouter, `base: './'`, plain CSS. One page at `/#/`: title, one-line description, seven surface cards (Business OS prototype, Public website, Customer app, Staff / admin dashboard, Docs, Ops manual, Dev tools). aluzinaa.com and Docs are live links; the other five are wrapped in the `Placeholder` atom (tooltip on hover / focus, "not wired yet" toast, dashed outline + badge in dev mode, `data-placeholder`).
- **Header**: EN / ES toggle (`{ en, es? }` tables, `useT()`, es falls back to en, `aluzina.lang`), light / dark (`data-theme`, `aluzina.theme`), dev mode (`data-dev`, `aluzina.devMode`). All controls >= 44 px, one global `:focus-visible` ring >= 3 px, nothing hover-only. Every visible string goes through `useT()`; full Spanish for HUB-01 and the `core.*` strings.
- **Tokens**: `src/design/tokens.ts` is the single source; `scripts/gen-tokens.mjs` (run in `build`) writes `src/styles/tokens.css` with light / dark sets, `prefers-color-scheme` fallback and one `--scale` band per matrix width (360, 390, 768, 1280 = 1; 1920 = 1.125; 2560 = 1.5; 3840 = 2). `html { font-size: calc(16px * var(--scale)) }`, everything in rem, so body text is 16 px up to 1920 and 32 px on a 4K TV.
- **Specs / actions**: `src/specs/PageSpec.ts` (`defineSpec`, `ActionDef`, `RouteDef`). HUB-01 declares `hub.openSurface` (`surface: enum`), `hub.setLang` (`lang: enum:en|es`), `hub.toggleTheme`, `hub.toggleDevMode` (permission `dev.tools`). Manifest at `window.__aluzina = { routes: [{ path, code, surface, status, spec }], version }`.
- **Dev mode**: SpecChip (page code) bottom-right; Ctrl+. or the chip opens a panel listing the declared actions, permission, params and verified widths.
- **Library**: `Placeholder`, `Toast`, `ToggleButton` (atoms), `SurfaceCard` (molecule), `HubHeader` (organism), each with a `.meta.ts`.
- **Pages workflow**: Petrock's `pages.yml` verbatim (checkout@v5, setup-node@v5 node 22 + npm cache, `npm ci`, `npm run build`, configure-pages@v5 `enablement: true`, upload-pages-artifact@v3 `dist`, deploy-pages@v4) on push to `main` and `workflow_dispatch`.
- **Docs**: the tree in `docs/README.md`; principles P-01..P-15 adapted; brief with the business facts from aluzinaa.com (data only); build plan steps 0..8 with model per task; decisions D-001..D-006; kanban; prompt 0001 verbatim; this changelog; page template and HUB-01 page doc; `reference/surfaces.md`.
- **Brand cues** (from aluzinaa.com, as data): Playfair Display + Roboto, near-black neutral, warm amber accent (`#d97706` light / `#fbbf24` dark), warm off-white surfaces.

## Verified

`npm run build` green (tokens -> `tsc --noEmit` -> `vite build`, 58 modules, 177 kB JS / 10 kB CSS). Local Playwright smoke at 390 / 1920 / 3840: renders, toggles persist, placeholder tooltip on focus and toast on Enter, dev panel on Ctrl+., no horizontal scroll, no console errors. Live screenshots follow in changelog 0002 once Pages deploys.

## Not done / deviations

- The Claude Design export is not in the repo (D-006); `apps/business-os/` holds only a README.
- No role switcher, demo simulator, canvas or plan viewer yet (build plan step 4); they sit behind the Dev tools placeholder card.
- `spec.checkedAt` for HUB-01 is filled from the live screenshot pass (390, 1280, 3840), not the full matrix.
