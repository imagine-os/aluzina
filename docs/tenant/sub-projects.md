# Sub-project catalogue (`tenant.json` `subProjects[]`)

Everything in this repository that is a deliverable of its own, so the multitenant host can bring each one to life with the right tool (D-093). The JSON form is in `manifest.md`; this file is the prose behind each entry. Status is the kanban's at `7628f96` (`inventory-2026-09-28.md`). `hostNeeds` point at `host-requirements.md`.

## Catalogue

| Id | Kind | Paths | Entry | Build / serve | Codes | Status | Depends on | Host needs | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `hub` | app | `apps/hub` | `apps/hub/index.html` | `npm run build` -> `dist/` | HUB-01 (+ all module codes) | live | docs-and-plan, archive, brand-kit, design-system | HR-01, 02, 03, 05, 06, 07, 08, 11 | Fable 5.1 shared, Opus 5 modules |
| `business-os` | static | `apps/business-os` | `apps/business-os/index.html` | `npm run copy:static` -> `dist/business-os/` | BOS-01..06 | doing (step 2 audit) | – | HR-04, 07 | Fable 5.1 audit, Sonnet 5 |
| `public-site` | external | `docs/source/aluzinaa-archive`, `docs/knowledge/public-sites.md` | `https://aluzinaa.com` | none (Lovable) | P-00 | linked | – | HR-07 | Justin (Lovable); Opus 5 for R7 |
| `archive` | pipeline | `scripts/archive`, `docs/archive`, `apps/hub/public/archive` | `scripts/archive/build-index.mjs` | `npm run archive:{crawl,index,previews,collection}` -> `dist/archive/` | S-12, S-13, G-09, A-09, P-06 | done (14; ar-25.. open) | – | HR-04, 02 | Fable 5.1 index/seed, Sonnet 5 crawls |
| `brand-kit` | data | `docs/source/brand-kit`, `docs/source/brand`, `docs/brand`, `apps/hub/public/brand`, `apps/hub/src/tenant/brand` | `docs/brand/README.md` | `python3 docs/brand/tools/render-pdf-pages.py` -> `dist/brand/` | G-08, D-12 | done | – | HR-04, 06 | Fable 5.1 |
| `knowledge-base` | docs | `docs/knowledge` | `docs/knowledge/README.md` | none; read in-app on D-06 / D-15 | – | done (grows every turn) | – | HR-05 | Fable 5.1 |
| `asana-import` | pipeline | `scripts/import-asana.mjs`, `docs/source/asana`, `apps/hub/src/tenant/seed/asana` | `scripts/import-asana.mjs` | `npm run import:asana` -> checked-in seeds | K-06, W-03 | done (K-06 importer UI open) | hub | HR-02 | Fable 5.1 seam, Sonnet 5 mapper |
| `design-system` | platform-candidate | `apps/hub/src/design`, `apps/hub/src/components`, `apps/hub/scripts/gen-tokens.mjs`, `apps/hub/src/styles`, `docs/design` | `docs/design/brand-system.md` | `npm run tokens` -> `src/styles/tokens.css` | D-02, D-10, D-12, D-13, D-14 | done | brand-kit | HR-06 | Fable 5.1 |
| `docs-and-plan` | docs | `docs` (plan, prompts, changelog, decisions, pages, qa, reference) | `docs/README.md` | none; D-05 renders `plan.json`, D-06 / D-15 the Markdown | D-05, D-06, D-15 | live | – | HR-05, 09 | Fable 5.1 |

## `hub` (app)

- **What:** the single Vite 5 + React 18 + TypeScript SPA that is the Business OS: hub landing HUB-01, four staff portals (founder A-xx, ops O-xx, studio S-xx, brand G-xx), client app C-xx on the phone shell, public pages P-01..P-06, ops manual M-xx, Spaces K-xx, Work W-xx, archive S-12 / S-13, in-app docs D-06 / D-15, design D-10 / D-12 / D-13, dev and QA tools D-02..D-09, D-11, D-14. 17 modules, 73 `RouteDef`s, 124 published routes, ~57.5k LOC.
- **Entry / build:** `apps/hub/index.html` -> `src/main.tsx` -> `src/app/App.tsx`. Root `npm run build` = `npm run tokens` -> `tsc --noEmit` -> `vite build` (into repo-root `dist/`, `base: './'`, HashRouter) -> `scripts/copy-static.mjs`.
- **Compiled-in tenant data:** `docs/**` through the `@docs` alias (`plan.json`, archive and brand JSON, all Markdown for the docs viewer); the build fails without the tenant's `docs/` (HR-05).
- **hostNeeds:** identity (HR-01) to replace `SessionProvider`'s demo users; a tenant-scoped store behind `DataProvider` (HR-02); realtime + presence behind `subscribe` / `usePresence()` (HR-03); docs mount (HR-05); per-tenant theme values (HR-06); tenant routing (HR-07); deploy-time thumbnails (HR-08); actions aggregation (HR-11).
- **Owner:** Fable 5.1 for shared code (`app/`, `auth/`, `data/`, `design/`, `i18n/`, `actions/`), Opus 5 for modules, Sonnet 5 for screenshots and Spanish fill. Contract: `apps/hub/src/modules/README.md`.

## `business-os` (static)

- **What:** the ALUZINA Business OS prototype exported from Claude Design (D-007): seven `.dc.html` pages evaluated at runtime by `support.js` with React 18.3.1 + `@babel/standalone` 7.29 vendored in `vendor/` (D-008), custom elements `deck-stage.js`, `doc-page.js`, `image-slot.js`, URL-safe forwarders `index.html`, `home.html`, ... (D-010). 98 files, 141 MB (`assets/` 136 MB).
- **Entry / build:** `apps/business-os/index.html` (forwards to `ALUZINA Business OS.dc.html`). No build; `scripts/copy-static.mjs` copies it to `dist/business-os/` (96 files). Embedded by the hub cards BOS-01..06 with `?embed=1&screen=`.
- **Status:** step 2 audit against P-01..P-15 is still "Doing" (`docs/reference/business-os-audit.md` planned); step 3 (module split) backlog. Digest: `docs/reference/business-os-export.md`; page doc `docs/pages/BOS.md`.
- **hostNeeds:** object storage for `assets/` (HR-04); a static mount under the tenant root that tolerates space-containing filenames (HR-07). It has its own inline i18n and no actions registry; it can only be iframed or linked until step 3.
- **Owner:** Fable 5.1 (audit judgment), Sonnet 5 (matrix), Opus 5 (step 3 split).

## `public-site` (external)

- **What:** `https://aluzinaa.com` (and `direccion.aluzinaa.com`), built by the founder in Lovable; linked from the hub as P-00 (`HubPage.WEBSITE_URL`). Captured as data in `docs/source/aluzinaa-archive/` (D-031; 18 page texts, tokens, 27 screenshots) and distilled in `docs/knowledge/public-sites.md`.
- **Build:** none in this repo. Roadmap R7 (public website builder) would replace it with a P-xx module; Justin's decision pending (kanban).
- **hostNeeds:** a link slot per tenant (HR-07). If R7 lands, the site becomes part of `hub`.
- **Owner:** Justin (Lovable sync question open); Opus 5 for R7.

## `archive` (pipeline + data + served renders)

- **What:** the project archive as data (D-055..D-059, D-068..D-071, D-083..D-086): `scripts/archive/crawl-dropbox.mjs` (depth-1 listing of the Dropbox share links), `build-index.mjs` (redaction rules R1..R7 -> `docs/archive/index.json` + `projects/<slug>/index.json` x186), `render-previews.py` (PyMuPDF / Pillow / LibreOffice / ffmpeg -> `apps/hub/public/archive/<slug>/{thumbs,pages}`), `index-collection.py` (the two collections -> `docs/archive/collections/<slug>/{index,sets}.json` + `sheets/`). Seeds read the JSON through `@docs` (`seed/archive.ts`, `seed/company.ts`, `seed/collections.ts`); the files themselves load lazily (`data/archiveFiles.ts`).
- **Build:** `npm run archive:crawl | archive:index | archive:previews | archive:collection`. Python scripts have no requirements file (housekeeping). Tool paths default to the session container (`/opt/pw-browsers/...`, `/usr/bin/soffice`).
- **Codes:** S-12 browser, S-13 project portal, G-09 collections, A-09 archive review, P-06 client example set.
- **Status:** done as step 14 passes 1-3 (changelogs 0019, 0021, 0022, 0023); open cards ar-25.. in the kanban.
- **hostNeeds:** object storage for the 122 MB of renders (HR-04, `contentMounts.archive-renders`); the tenant store for patch rows (HR-02); the Dropbox API connector later replaces the headless crawl (credentials blocked).
- **Owner:** Fable 5.1 (index, seed, serve), Sonnet 5 (crawls, renders).

## `brand-kit` (data)

- **What:** the brand as data: source manuals `docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA-{silver,gold}-2026-09-21.pdf` (+ extraction diffs), marketing PDFs `docs/source/brand/`, page renders and `index.json` in `docs/brand/{portfolio,brochure}/` (visual memory, `docs/brand/README.md`), served copies `apps/hub/public/brand/` (3 PDFs, 6 SVG marks), vector paths `apps/hub/src/tenant/brand/paths.ts`, facts in `docs/knowledge/brand.md`. Token values live in `design/tokens.ts` until tp-06.
- **Build:** `python3 docs/brand/tools/render-pdf-pages.py` regenerates the renders; `seed/assets.ts` seeds one `assets` row per document from `docs/brand/*/index.json`.
- **Codes:** G-08 brand documents, D-12 brand guidelines.
- **hostNeeds:** object storage optional (HR-04, 9 MB stays in git); per-tenant theme loading consumes the token values (HR-06).
- **Owner:** Fable 5.1. Open: DIN Round Pro licence (never shipped without it, D-086), brand era (silver current, gold previous).

## `knowledge-base` (docs)

- **What:** `docs/knowledge/`: 14 entries + `market/` (team, roles and portals, competitions, tools in use, taxonomy, deliverables, clients, public sites, archive, service playbook, Asana conventions, brand, social channels) with `status: current | superseded | draft | reference`, `since`, `source`, per-file change log (D-012, D-087). Canonical memory for business facts.
- **Build:** none; rendered in-app on D-06 / D-15 through `@docs`.
- **hostNeeds:** a per-tenant docs mount (HR-05); a host that never mixes one tenant's `current` rules with another's.
- **Owner:** Fable 5.1; the founder answers the open questions listed in the kanban.

## `asana-import` (pipeline)

- **What:** `scripts/import-asana.mjs` (own RFC 4180 CSV parser) turns the de-identified exports in `docs/source/asana/<date>/` into checked-in seeds `apps/hub/src/tenant/seed/asana/{hoy,portfolio}.ts` (D-062 / D-063); conventions in `docs/knowledge/asana-conventions.md`; the two founder templates merged into `domain/templates/aluzina-workflow.ts` (W-03).
- **Build:** `npm run import:asana`. Codes K-06 (import page, read-only UI), W-03 (new project from template).
- **hostNeeds:** the tenant store (HR-02) once imports write rows instead of seeds; roadmap R9 integrations seam.
- **Owner:** Fable 5.1 (seam), Sonnet 5 (mapper).

## `design-system` (platform-candidate)

- **What:** tokens (`apps/hub/src/design/tokens.ts` -> `src/styles/tokens.css` via `apps/hub/scripts/gen-tokens.mjs`, P-07), `ThemeProvider` (theme + metal on `<html>`), the component library (`apps/hub/src/components/{atom,molecule,organism,template}/<Name>/{Name.tsx,Name.css,Name.meta.ts,Name.example.tsx}`, 50 components, `design/library.ts` as data, D-017), the icon system (`Icon` atom, `iconMap.ts`, `docs/design/icons.md`, D-064), the brief `docs/design/brand-system.md`.
- **Why platform-candidate:** the token *schema*, the runtime and the library are the same for every tenant; only the values (colours, metals, fonts, textures, marks) are aluzina's. tp-06 splits them (D-096); the host later lifts the platform half into `packages/platform` (D-089, tp-13).
- **Codes:** D-02 components, D-10 tokens, D-12 brand guidelines, D-13 effects, D-14 tokens with contrast.
- **hostNeeds:** per-tenant theme loading (HR-06).
- **Owner:** Fable 5.1.

## `docs-and-plan` (docs)

- **What:** the repository's memory: `docs/README.md` (map), `platform-principles.md`, `project-brief.md`, `build-plan.md`, `kanban.md`, `decisions.md`, `prompts/`, `changelog/`, `pages/`, `qa/`, `reference/`, `plan/plan.json` (D-037, rendered by D-05), and now `tenant/`. Numbered files are append-only; the three plan views must agree.
- **Build:** none; `plan.json` is imported by `apps/hub/src/plan/` at build time, so invalid JSON breaks the build (that is the check).
- **Codes:** D-05 plan viewer, D-06 / D-15 docs viewer.
- **hostNeeds:** per-tenant docs mount (HR-05); per-tenant counters, no shared counter across tenants (HR-09, D-095).
- **Owner:** Fable 5.1 (integration); every model writes its own changelog draft.

## Not sub-projects (and why)

- `scripts/{copy-static,thumbnails,screenshots}.mjs`: platform tooling (see `platform-vs-tenant.md`), listed under `deploy`.
- `.github/workflows/pages.yml`: deploy config, listed under `deploy`.
- Root `README.md`: tenant prose; tp-09 fixes its stale status line.

## Change log

- 2026-09-28 (changelog 0025): first catalogue, nine entries. Fable 5.1.
