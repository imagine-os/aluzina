# Draft for changelog 0013: brand documents as relational data (Fable 5.1)

Merged into `docs/changelog/0013-*.md` by the integrator.

- prompt: `docs/prompts/0013-brand-documents-relational.md` (Justin Massion, Slack #all-aluzina 2026-09-21 05:05:18 UTC, ts 1789967118.190729: "Make sure that it's properly saved by project and relational in the proper way in the database").
- intent: the portfolio and brochure (prompt 0011) are first-class rows related to projects, clients and services, not static files only; `docs/brand/<doc>/index.json` stays the source of truth.
- model: Fable 5.1 (shared code: schema, seeds, entity registry, G-08 / P-05 data reads, docs).

## Shared code

| File | New / changed | What |
| --- | --- | --- |
| `apps/hub/src/data/schema/assets.ts` | new | `Asset` (`kind: document \| page \| image \| logo \| texture`, `title`, `titleEs`, `slug`, `url` (served path or null), `repoPath`, `mimeType`, `bytes`, `pageCount`, `pageNumber`, `parentId`, `sourceFileId`, `sourceName`, `publishedAt`, `language`, `palette[]`, `fonts[]`, `textExcerpt`, `tags[]`, `status: current \| superseded \| draft`, `supersedesId`), `ASSET_KINDS`. |
| `apps/hub/src/data/schema/index.ts` | changed | `assets` in `EntityMap` and `ENTITIES` (37 entities). |
| `apps/hub/src/data/schema/spaces.ts` | changed | `RelationKind` + `RELATION_KINDS` gain `depicts` (an asset page shows a project; `references` stays for mentions). Doc comment: registries are `roles` / `users` / `services`. |
| `apps/hub/src/data/seed/index.ts` | changed | `SEED_VERSION` 5 -> 6. |
| `apps/hub/src/data/seed/assets.ts` | new | Imports `@docs/brand/portfolio/index.json` and `@docs/brand/brochure/index.json` (typed with a local `BrandIndex` interface, no `.d.ts` needed: `resolveJsonModule` + cast) and derives at seed time: 2 `assets` documents (`ast-portfolio`, `ast-brochure`), 56 `assets` pages (`ast-<doc>-pNN`), 13 `projects` (`prj-pf-<slug>`, `pipelineStatus: closed`, `phase: delivered`, `approval: client-approved`, `budgetCop: 0`, `startDate` placeholder `2024-01-01`), 6 `clients` (`cl-brewhouse`, `cl-club-union`, `cl-sodime`, `cl-terminal-norte`, `cl-coassist`, `cl-gahia`), 14 `spaces` (`sp-portfolio` area + `sp-pf-<slug>` project spaces, `aboutType: projects`), 15 `posts` (`post-pf-<slug>` page-by-page notes, `post-brochure-clients`, `post-portfolio-products`), 28 `filings`, 1 tag (`tag-portfolio`), 126 `relations`: 56 `part-of` (page -> document), 25 `depicts` (portfolio page -> project), 6 `for-client`, 13 `produced-by` (-> `roles:founder`), 21 `references` (notes -> document / pages; brochure p. 2 -> the three shared projects), 5 `applies-to` (brochure pp. 4, 6 and portfolio p. 2 -> `services:03` / `services:E`). Exports `ASSET_IDS`, `PORTFOLIO_SPACE_ID`, `pageAssetId()`, `portfolioProjectId()`, `portfolioSpaceId()`, `PORTFOLIO_INDEX`, `BROCHURE_INDEX`. Order 60. |
| `apps/hub/src/modules/spaces/entities.ts` | changed | `RELATABLE_TYPES` + `assets` (label `title` / `titleEs`; route G-08 `/brand/documents?doc=<slug>`, a page opens its document with `&page=N`) and `services` (registry over `SERVICES`, id = code, label `code · name`, route `/manual/services/<slug>`). |
| `apps/hub/src/modules/spaces/strings.ts` | changed | `spaces.relation.depicts`, `spaces.type.assets`, `spaces.type.services` (EN + ES). |

Verified with a Vite SSR script (`runSeeds` over empty tables): 37 entities, `SEED_VERSION` 6, the counts above, **0 unresolved relation endpoints** (entity tables + `roles` / `users` / `services` registries), 0 duplicate ids, every filing, space parent, `aboutId`, page `parentId` and `clients.projectIds` resolves. `npx tsc --noEmit` clean for the whole tree.

## Pages reading the data (G-08, P-05)

| File | What changed |
| --- | --- |
| `apps/hub/src/modules/brand/documents.ts` | `BrandDoc` gains `assetId`, `title`, `titleEs`, `palette`, `fonts`; `id` is the asset `slug` (string). New `docFromAsset`, `docsFromAssets(rows, loading)` (static `BRAND_DOCUMENTS` only while loading / when empty), `docIn`, `downloadNameFor`, `fontNames`. Old exports kept for G-01. |
| `apps/hub/src/modules/brand/DocumentsPage.tsx` | Reads `useTable('assets', { where: { kind: 'document', status: 'current' } })`, plus `assets` pages, `relations` (`fromType: 'assets'`) and `projects`. Cards: title, full title, file name, pages / MB, "N pages as records", palette swatches (hex in `title` and in the group's `aria-label`), fonts, the four controls, and a **Related** section: projects the pages `depicts` / `references` (`Button` links to `#/brand/work/:projectId`) and services the pages `applies-to` (`#/manual/services/:slug`). `?page=N` opens the PDF at that page (`#page=N`), which is what the entity registry links for a page row. Actions unchanged (`brand.viewDocument`, `brand.downloadDocument`, `brand.openDocumentTab`, `brand.shareDocumentLink` live; `brand.replaceDocument` Placeholder). |
| `apps/hub/src/modules/brand/strings.ts` | `brand.documents.pagesInData`, `.palette`, `.fonts`, `.related`, `.relatedProjects`, `.relatedServices`, `.relatedNone`, `.relatedLoading`, `.dataBody` (EN + ES). |
| `apps/hub/src/modules/brand/brand.css` | `.brand-doc__palette(-swatch)`, `.brand-doc__related(-title, -row)`; related links wrap (no horizontal overflow at 360). |
| `apps/hub/src/modules/brand/specs.ts` | `documentsSpec.dataTables: ['assets', 'relations', 'projects']`, layout / logic / notes updated. |
| `apps/hub/src/modules/brand/BrandHome.tsx` | Type-only: `openDocument(doc: string)`; G-01 still lists the static `BRAND_DOCUMENTS` (follow-up below). |
| `apps/hub/src/modules/public/documents.ts` | Same shape as brand: `PublicDoc` + `docFromAsset`, `docsFromAssets`, `docIn`, `fontNames`. |
| `apps/hub/src/modules/public/PortfolioPage.tsx` | Reads `useTable('assets', { where: { kind: 'document', status: 'current' } })`; cards show pages / MB, palette swatches and typefaces from the row; controls and actions unchanged. |
| `apps/hub/src/modules/public/strings.ts`, `public.css`, `specs.ts` | `public.portfolio.palette` / `.fonts`; `.pub-doc__meta`, `.pub-doc__palette(-swatch)`; `portfolioSpec.dataTables: ['assets']`. |
| `docs/pages/G-08.md`, `docs/pages/P-05.md` | Data and layout sections updated. |

Verified in Chromium against the dev server (1280 and 360): G-08 renders both rows (`data-asset="ast-portfolio"` / `ast-brochure`), 7 swatches each, fonts, 13 + 1 related links on the portfolio and 3 + 2 on the brochure, `?doc=brochure&page=4` -> `<object data="./brand/aluzina-brochure.pdf#page=4">`, `brand.viewDocument` via the bus -> `{ ok: true }`, no target under 44 px, no horizontal overflow at 1280 or 360 after the wrap fix; P-05 renders both rows with swatches and typefaces; `sp-portfolio` renders in K-02 with its project children; a portfolio note's relation to `ast-portfolio` resolves through the registry as "Aluzina portfolio (Universo de Diseño)". `localStorage.aluzina.data.seedVersion` = 6, 58 assets.

## Docs

- `docs/prompts/0013-brand-documents-relational.md` (new, verbatim).
- `docs/knowledge/brand.md`: section "Portfolio projects as records" (ids, mapping table, every placeholder named as `_unknown_`) + change log line.
- `docs/knowledge/clients.md`: update paragraph in the marketing section + change log line. `docs/knowledge/README.md`: change log line.
- `apps/hub/src/modules/README.md`: entities line (`assets.ts`, 37 entities, `SEED_VERSION` 6) and the relations line (kinds incl. `depicts`, registries `roles` / `users` / `services`, `assets` route).
- `docs/reference/surfaces.md` section 1.5 only: "Brand documents as data" paragraph, entity count 37, `SEED_VERSION` 6.
- Memory note `/tmp/claude/memory/team/channel/justin-graph-view-preferences.md`: prompt reference 0010 -> 0012.

## Decisions to propose (integrator numbers them D-044+)

1. **`assets` is the entity for files the studio publishes or keeps as brand memory, and a document's pages are rows too**: `kind: document | page | image | logo | texture`, `url` for what the app serves, `repoPath` for what only the repo holds (page renders), `parentId` page -> document (also written as `part-of`), `palette` / `fonts` / `textExcerpt` read from the file, `status` + `supersedesId` for versions. Rationale: a page is the unit that shows a project or argues for a service, so it must be relatable; a versioned row is what file storage will later fill.
2. **Portfolio projects are `projects` rows** (`prj-pf-<slug>`, `pipelineStatus: closed`, `phase: delivered`, `approval: client-approved`), with `clients` rows only when the page names one, a project space under the `sp-portfolio` area and one note per project. Placeholders are explicit and documented (`startDate` `2024-01-01`, `location` `Ubicación no publicada`, `client` `unknown`, `budgetCop: 0`); the brochure's twenty names stay a note until the founder confirms them. Rationale: Justin asked for "by project"; a closed project is still a project, and the Work views, relations and graph then work unchanged.
3. **`docs/brand/<doc>/index.json` is the seed source** for `assets`, the portfolio projects, spaces, posts and relations (imported through `@docs`, like `plan.json`, D-037): re-rendering a PDF updates the data; nothing about the documents is typed twice. `docs/brand/README.md` stays the human view.
4. **`services` is a relation target registry** (`modules/spaces/entities.ts`, id = playbook service code, next to `roles` / `users`), so posts, pages and anything else can `applies-to` a service without a `services` table.
5. **Relation kind `depicts`** (page -> project it shows) is added to `RelationKind`; `references` is kept for mentions in text. The Post page's kind selector enumerates `RELATION_KINDS`, so it appears there automatically.

## Requests / follow-ups

- **K-05 catalog tab for `assets`** (not trivial: `Tab` union, columns, strings; requested rather than done). Until then assets are reachable through relations, the graph and G-08.
- **G-01 brand dashboard** still lists the static `BRAND_DOCUMENTS`; switch its "Client documents" row to `useTable('assets', …)` when the brand module is next touched (G-08 and P-05 already read data).
- **`docs/reference/surfaces.md`**: section 1.2 (`aluzina.data` row) should say 37 entities and `SEED_VERSION` 6, and section 3 needs the change-log line for this pass; both outside the 1.5 scope this worker had.
- **Kanban line**: `Done - brand documents as relational data (pass 0013, Fable 5.1): assets entity (2 documents + 56 pages), 13 portfolio projects, 6 clients, Spaces > Portfolio, 126 relations, services registry, depicts kind; G-08 / P-05 read from data.`
- **`DocumentViewer` organism** (already requested twice) should take the `Asset` row directly.
- **Page renders are not served**: `assets.page.url` is `null`; if the viewer should show `docs/brand/<doc>/page-NN.jpg` as a fallback, the renders (8.6 MB) must move under `apps/hub/public/` or be served another way. Decision for Justin.
- Serving the **brochure's 17 brochure-only names** as projects, and whether "Apartamento Parma Noham Ebresum" is `cl-noam`, wait on the founder.

## Verification

`npx tsc --noEmit` clean (whole tree). Seed verification script and browser checks described above (scratchpad). `npm run build` not run (integrator). No git.
