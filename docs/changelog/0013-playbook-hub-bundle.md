version: 0.10.0
date: 2026-09-21
prompt: 0009, 0011, 0012, 0013
intent: The founder's Service Delivery Playbook becomes the product and the Hub ships the whole bundle: the public site with the intake flow (P-01..P-05), the client app (C-01..C-06), the operations manual (M-01..M-08), the in-app docs (D-06 / D-15), the builder tools (D-05 plan viewer, D-07 canvas, D-08 simulator, D-09 actions, D-14 tokens, D-11 testing hub), the CRM and execution control pages (A-08, A-03 rework, O-11..O-13), the studio checklist and revision matrix (S-10, S-11), the graph in five views with system imagery (K-04), and the portfolio and brochure as served documents, page renders and relational rows (G-08, P-05, `assets`); twelve parallel workers on the 01b7fe3 foundation, integrated here on top of the brand design system (changelogs 0014 and 0015).
decision: D-033, D-034, D-035, D-036, D-037, D-044, D-045, D-046, D-047, D-048, D-049, D-053
rejected: a `phase` -> `pipelineStatus` migration of the Work views in this pass (both coexist, D-048); a `leadStatus` enum (the four lead statuses head the one pipeline); a dependency for the 2D graph views (own layouts; three.js only for the lazy 3D view, D-053); copying gallery code (the repo has no licence; techniques reimplemented); inventing dates for the plan timeline (dependency swimlane instead); a `brandDocuments` entity (documents are `assets` rows, D-044); serving the 8.6 MB of page renders (they stay in `docs/brand/`, D-049); a `Placeholder` per row in the D-11 screenshots column (one control above the table, 92 fewer tab stops); an `accentSoftText` token (the dark `accentSoft` contrast defect was already fixed by the 0014 tokens: `#E7D7B5` on `#2C2620` = 10.5:1); renumbering the other session's D-10 / D-12 pages (ours became D-14 / D-15)
files: apps/hub/src/domain/{playbook,index}.ts, apps/hub/src/data/schema/{services,assets,spaces,projects,index}.ts, apps/hub/src/data/seed/{services,assets,projects,index}.ts, apps/hub/src/actions/*, apps/hub/src/plan/index.ts, apps/hub/src/auth/permissions.ts, apps/hub/src/app/{navGroups,manifest}.ts, apps/hub/src/app/shells.css, apps/hub/src/i18n/core.ts, apps/hub/src/design/{clipboard,env}.ts (new), apps/hub/src/components/atom/{Button,Select,Textarea,StatusPill}/*, apps/hub/src/components/organism/{DataTable,Kanban}/*, apps/hub/src/components/organism/GraphViews/* (new organism, 13 files), apps/hub/src/modules/{tools,qa,manual,docs,client,public}/* (six new modules), apps/hub/src/modules/{founder,ops,studio,brand,spaces,hub}/* (extended), apps/hub/src/modules/README.md, apps/hub/public/brand/aluzina-{portfolio,brochure}.pdf, apps/hub/package.json + package.json + package-lock.json (0.10.0, three 0.186.0), scripts/thumbnails.mjs, docs/prompts/{0009,0011,0012,0013}-*.md, docs/changelog/0013-playbook-hub-bundle.md (replaces docs/changelog/_pending/{foundation-0013,tools,qa,manual,docs,client,public,crm,studio,graph,brand-assets,brand-docs,brand-data}.md), docs/decisions.md (D-044..D-049, D-053), docs/kanban.md, docs/build-plan.md, docs/plan/plan.json, docs/reference/surfaces.md, docs/README.md, README.md, docs/pages/{HUB-01,A-03,A-08,O-11,O-12,O-13,S-10,S-11,G-08,K-04,C-01..C-06,P-01..P-05,M-01..M-08,D-05..D-09,D-11,D-14,D-15}.md, docs/knowledge/{service-playbook,brand,clients,deliverables,roles-and-portals,README}.md, docs/source/playbook/*, docs/source/brand/*, docs/brand/** (56 page renders, 2 contact sheets, 2 index.json, README, renderer)
codes: HUB-01, P-01, P-02, P-03, P-04, P-05, C-01, C-02, C-03, C-04, C-05, C-06, M-01, M-02, M-03, M-04, M-05, M-06, M-07, M-08, D-05, D-06, D-07, D-08, D-09, D-11, D-14, D-15, A-03, A-08, O-01, O-11, O-12, O-13, S-01, S-10, S-11, G-01, G-08, K-02, K-04
model: Fable 5.1 (foundation, relational data, integration); Opus 5 (tools, qa, manual, docs, client, public, crm, studio, graph, brand documents); Sonnet 5 (screenshots and Spanish fill follow)

# 0013 - The playbook into the product and the Hub bundle (build plan step 13, steps 4 and 5)

Justin shared the founder's *Service Delivery Playbook v1.0* (prompt 0009) and asked for it to become the product and for the Hub to ship its whole bundle; the same night he asked for the graph views of his graph gallery (prompt 0012), for the portfolio and brochure to be viewable and downloadable in the hub (prompt 0011) and for them to be "saved by project and relational in the proper way in the database" (prompt 0013). The foundation (01b7fe3, Fable 5.1) typed the playbook, added the entities, permissions, nav groups, the actions bus and `plan.json`; twelve workers built in parallel without touching shared files; this pass integrates them on top of the brand design system that landed on `main` meanwhile (changelogs 0014 and 0015, other session).

**Numbers**: 113 routes (75 before) on 11 surfaces, 876 declared action entries (680 before; 9 of them the design module's, 0014 / 0015), 37 entities, `SEED_VERSION` 6, six new modules, one new organism (`GraphViews`), two new shared utilities (`design/clipboard.ts`, `design/env.ts`), 56 page renders as visual memory.

**Numbering agreed with the parallel session** (#aluzina-brand-kit, changelog 0014 / 0015, decisions D-038..D-043 and D-050..D-052, prompts 0010 and 0014, codes D-10 / D-12 / D-13, module `design`): this pass is changelog 0013, prompts 0011 / 0012 / 0013, decisions D-044..D-049 plus **D-053** for the graph views (D-038 was reserved for it but `main` already carried the D-032 correction under D-038), page codes **D-14** (dev tokens, `/dev/tokens`, drafted as D-10) and **D-15** (document view, `/docs/*`, drafted as D-12), version **0.10.0** (0.8.0 was reserved for this pass, but 0014 shipped as 0.8.0 and 0015 as 0.9.0 first; this integration was rebased onto both).

## A. Foundation (`feat(foundation)`, Fable 5.1, D-033..D-037)

- `apps/hub/src/domain/playbook.ts`: the playbook as typed data (`SERVICES` 01 / 02 / 03 / E / 04 with every phase and item, `CLIENT_JOURNEY`, `PIPELINE_STATUSES` (15), `VALIDATION_STATUSES`, `PURCHASE_STATUSES`, `GOVERNANCE_RULES` G-01..G-14, `LEAD_CHANNELS`, `QUALIFICATION_QUESTIONS`, `routeService()`, `ROLE_RESPONSIBILITIES`, `OPERATIONAL_ASSETS`, `KPIS`); texts `{ en, es? }` rendered with `pick(text, lang)`. Transcription: `docs/knowledge/service-playbook.md`.
- Entities `leads`, `engagements`, `revisionItems`, `changeOrders`, `purchases`, `siteReports`, `messages`; `projects.serviceCode / pipelineStatus`. Permissions `leads.*`, `engagements.*`, `revisionMatrix.write`, `changeOrders.manage`, `purchases.manage`, `siteReports.write`, `messages.write`, `manual.read`, `docs.read`, `own.revisions.write`. Nav groups `intake`, `execution`, `quality`, `manual`.
- Actions bus (`src/actions`, D-036): `registerAction / runAction / listLiveActions / declaredActions`, hooks `useRegisterAction(s)`, published as `window.__aluzina.actions = { run, list, declared }`.
- `docs/plan/plan.json` (D-037) imported through the `@docs` alias; route-derived hub cards (P-01, C-01, M-01, D-05..D-11 go live when a built route with the code registers).

## B. Data: brand documents as relational rows (`feat(data)`, Fable 5.1, D-044..D-046, D-049)

- `assets` (`kind: document | page | image | logo | texture`, `url` served path or null, `repoPath`, `parentId` page -> document, `palette[]`, `fonts[]`, `textExcerpt`, `status` + `supersedesId`) seeded from `docs/brand/<doc>/index.json`: 2 documents (`ast-portfolio`, `ast-brochure`), 56 pages (`ast-<doc>-pNN`).
- The 13 portfolio projects as closed `projects` rows (`prj-pf-<slug>`, `pipelineStatus: closed`), 6 `clients`, the Spaces area `sp-portfolio` (14 spaces, 15 posts, 28 filings) and 126 `relations` (`part-of`, **`depicts`** (new kind), `for-client`, `produced-by`, `references`, `applies-to` -> `services:<code>`). `services` is a relation-target registry next to `roles` / `users` (`modules/spaces/entities.ts`); `assets` opens G-08 `?doc=<slug>&page=N`.
- Verified by a Vite SSR seed run: 0 unresolved relation endpoints, 0 duplicate ids, 37 entities, `SEED_VERSION` 6.

## C. Shared library fixes (`feat(components)`, Fable 5.1) and what was already fixed upstream

| Request (draft) | Done |
| --- | --- |
| `StatTile` interactive tile collapsing to 55 px (client, A-01) | already fixed by 0014 (`.stat--interactive { width: 100% }`); the client module's scoped workaround removed |
| dark `accentSoft` text contrast 1.70:1 (qa) | already fixed by the 0014 tokens (10.5:1 dark, 8.1:1 light); no new token |
| `.dshell__portal` pushing the user menu off-screen at 768 (manual) | `min-width: 0; overflow: hidden; text-overflow: ellipsis` |
| `core.portal.manual` / `core.portal.docs` stop-gaps (manual, docs) | moved into `src/i18n/core.ts` (+ `core.portal.public`); module copies deleted |
| `Select` / `Textarea` required marker (public) | both render ` *` like `Input`; metas updated |
| `Button` `download` (brand-docs) | `download?: string` on the `href` branch (`rel=noreferrer`); G-08 and P-05 use the library Button, the anchor-with-btn-classes workaround is gone |
| shared `copyText` / `downloadText` (qa, brand-docs) | `src/design/clipboard.ts` (`copyText`, `downloadUrl`, `downloadText`); qa, brand and public import it; `modules/qa/copy.ts` deleted |
| `DataTable` scroll container keyboard-scrollable (qa) | `.table-wrap` gets `tabIndex={0}`, `role="region"`, `aria-label={caption}` |
| print rule in the shells (manual) | `@media print` in `shells.css` hides top bar, sidebar, bottom nav and controls of both shells |
| `Kanban` meta: no `<select>` in the scroller (crm) | a11y note added |
| `useWebGLAvailable` / `usePrefersReducedMotion` / `useDocumentHidden` shared (graph) | `src/design/env.ts`; `GraphViews/env.ts` re-exports them |
| smoke defects found here | `.btn` gets `max-width: 100%` and `.btn__label` wraps (long labels on D-04 and M-06 overflowed 390 by 10-20 px); the presence bar hides under 480 px in the desktop top bar (D-08's iframes add two people and the bar pushed the user menu off-screen) |

## D. Modules

### D.1 Public site `P-01..P-05` (Opus 5; surface `public`, bare shell, no permission, D-035, D-047)

| Code | Path | What is real |
| --- | --- | --- |
| P-01 | `/services` | the services ladder from `SERVICES`, the client journey, links into the intake |
| P-02 | `/services/:slug` | one service: outcome, ideal for, phases as disclosures, delivery contents, exclusions, next step; slugs, never codes |
| P-03 | `/start` | the intake ("purchase flow"): ten qualification steps with inline validation, draft in `sessionStorage` (`aluzina.public.intake`), writes a `leads` row (`status: lead-new`, `source: public-intake`, `suggestedService` from `routeService()`), shows the reference |
| P-04 | `/method` | the studio method: ladder logic, governance in plain words, roles, final principle |
| P-05 | `/portfolio` | the portfolio and the brochure from `assets` rows: viewer, download, open in tab, palette swatches, typefaces |

**Placeholders**: footer Instagram / WhatsApp (no handle or number confirmed); "Reserve with a deposit" on the P-03 confirmation for paths 01 / 02 / 04 (`public.reserveDeposit` registers and answers "not wired yet: online deposits arrive with the payments integration (D-035)"). Verified 360..3840 EN + ES, light + dark; every focusable >= 44 px.

### D.2 Client app `C-01..C-06` (Opus 5; `PhoneShell`, `own.projects.read`)

Home (journey, progress from `engagements.checks`), project detail (phases, finalised documents only), approvals + revision matrix (a comment is a `revisionItems` row; the **G-06 gate** enables "Approve for execution" only when no item is still `revision` and writes `projects.approval = client-approved`), messages (create with `readBy`, auto read receipts, cross-tab), payments (`direction: in` only, COP totals), strategic brief (writes `engagements.brief` keyed `checkKey('01-2', i)`, merging the studio's keys). Scope: `projects.clientUserId = session user`, nothing filters by role. **Placeholder**: "Pay online" (`client.payOnline` registered, answers not wired yet). 11 `client.*` actions. Verified 360 / 390 / 768 / 1280 / 1920.

### D.3 Operations manual `M-01..M-08` (Opus 5; surface `manual`, `manual.read`)

Every word comes from `domain/playbook.ts` (no copy in the module): overview with the client journey, the commercial process with a live `routeService()` widget, one page per service with its checklist read-only, governance / statuses / roles / assets / KPIs where the enforcing pages are **derived from the route manifest** (`enforcedBy` + pages whose `dataTables` name the rule's entity). Print / PDF on every page (`window.print()`, print stylesheet; the shell chrome now drops through `shells.css`). Sections addressable by `?s=<section>`. **Placeholders**: "Create lead" (points at A-08) and "Open KPI dashboard" (none exists), both registered and failing loudly (D-047); 5 governance rules still show "no page enforces this yet". Verified 360..3840 EN + ES, light + dark.

### D.4 In-app docs `D-06`, `D-15` (Opus 5; surface `docs`, `docs.read`)

`import.meta.glob('@docs/**/*.md', { query: '?raw' })` (lazy chunk per document; 114+ documents), `SpaceTree` navigation with folder counts, search over paths always and full text once "Load every document" ran, relative links rewritten to `#/docs/<path>` and kept in-app, `plan.json` rendered as a sortable `DataTable`, "Open on GitHub". `#/docs/<path>` (D-15) is a first-class address. No Placeholder. Verified 360..3840.

### D.5 Builder tools `D-05`, `D-07`, `D-08` (Opus 5; surface `dev`, `dev.tools`)

- **D-05 plan viewer**: `plan.json` as stat tiles, filters, Kanban, table and a **dependency swimlane** (one lane per step, one column per `planDepth`, SVG arrows) with a drawer per task; 59+ tasks. Move a task = Placeholder answering where the edit belongs (the repo owns the plan, D-037).
- **D-07 canvas**: every route as a card with its deploy-time thumbnail, grouped by surface, zoom that reflows instead of scrolling sideways (`width: calc(100% / zoom)` + `transform: scale`), open switches the demo user when the role lacks the permission.
- **D-08 demo simulator**: the real app in a 390 x 844 phone frame and a 1280 x 800 desktop frame, scaled to their columns, with route / role / language / theme controls, sync toggle and presets (same-origin frames share storage, so they appear in the presence bar).

20 `tools.*` actions. Verified 360..2560.

### D.6 QA tools `D-09`, `D-14`, `D-11` (Opus 5; surface `dev`)

- **D-09 actions registry**: declared (`declaredActions(routes)`) vs live (`useLiveActions()`), a generated form per `ActionDef.params`, Run through `runAction`, "Copy as WebMCP tool JSON" and "Export all" (`paramSchema()` / `toolJson()` are the canonical `ParamType` -> JSON Schema mapping). This page **is** the WebMCP surface today (surfaces.md 1.7).
- **D-14 design tokens** (`/dev/tokens`): reads `tokens.ts` with the generator's own kebab rule, computes WCAG contrast for every text / surface pair, shows the `--scale` bands live. Placeholder: "Edit token" (repo write). Overlaps with the design module's D-10 (`/design/tokens`, 0014): D-10 is the brand presentation of the tokens, D-14 the QA view; merging them is a backlog card.
- **D-11 testing hub**: the seven-width matrix over the manifest with `specCompleteness()` scores, "Open at 390 / 1280 / 1920" as the right role, simulator link when D-08 is registered. A tick means "recorded in `spec.checkedAt`", never "measured". Placeholders: "Load screenshot manifest", "File a bug" (no `feedback` entity).

16 `qa.*` actions. Verified 360..3840 EN + ES.

### D.7 CRM and execution control `A-08`, `A-03`, `O-11..O-13` (Opus 5; roadmap R2 starts)

- **A-08 leads** (`leads.manage`): create (`source: manual`), the ten qualification answers, "Suggest service" (`routeService()` with the reason), owner, status walk over the four lead statuses, five stat tiles incl. lead -> contract rate, **Convert to project** (creates `projects` + `engagements` on the service's first phase, writes `leads.projectId`; idempotent under concurrent calls). No Placeholder.
- **A-03 pipeline** reworked onto the 15 statuses: five bands (lead / sale / design / build / close), Board / List, prev / next on the card, "Move to…" in the drawer (a `<select>` inside the Kanban scroller made Chromium scroll the document sideways at 390, hence the note in `Kanban.meta.ts`), **G-06 / G-12 gate enforced in the write** (no `procurement` / `in-construction` before `approved`), the legacy `phase` Select labelled legacy (D-048). No Placeholder left.
- **O-11 change orders**: create / approve / reject / execute with **G-14 in the write**; totals of extra cost and days. **O-12 purchasing control**: create, advance over `PURCHASE_STATUSES`, status tiles as filters, committed vs budget per project (`priceCop` is the whole purchase, never x quantity). **O-13 site reports**: list, progress, overdue resolutions, create; Placeholder "Add photo" (no file storage; `ops.addSitePhoto` registered, answers not wired yet). O-01 gained an execution-control row.

23 new action entries. Verified 360..3840 as founder / ops.

### D.8 Studio `S-10`, `S-11` (Opus 5)

- **S-10 service checklist** (`/studio/checklist`, `/studio/checklist/:projectId`): every checklist item writes `engagements.checks[checkKey(phaseId, i)]`, "Mark phase complete", "Advance to next phase" (last phase -> `delivered` + `completedAt`, G-09), stage links into S-04 / S-05 / S-06 / S-07 / S-11, brief drawer, "Send to procurement" behind the G-06 / G-12 gate (enabled only after C-03 wrote `client-approved`). No Placeholder.
- **S-11 revision matrix**: filters, add item (source derived from the writer's role, G-03), edit comment, three validation statuses + "Resolve as adjustment" (write `decidedAt`), **CSV export** (UTF-8 BOM, CRLF, RFC 4180). Placeholder: "Send to client" (`studio.sendMatrixToClient`, now registered and failing loudly per D-047). S-01 gained a service-delivery row.

17 new `studio.*` ids. Verified 360..3840 EN + ES, light + dark.

### D.9 Graph views `K-04` (Opus 5, prompt 0012, D-053)

K-04 was one SVG force graph; it is now five views switched by `Tabs` and remembered in `localStorage` `aluzina.graphView`: **3D objects** (default; three.js 0.186.0 lazy chunk, 139 kB gzip; ground grid, depth bands per kind, primitive body per kind, pictures and labels as sprites, spherical camera), **Lanes skill tree**, **Radial tree**, **Objects map** (own layouts, no dependency), **Force 2D** (the 0009 `RelationGraph`, the automatic fallback without WebGL or with reduced motion). Nodes carry **system imagery**: demo-user initials, deploy-time page thumbnails (`./thumbs/<code>.jpg`), space / post / catalog glyphs. One interaction overlay (`NodeLayer`: roving tabindex, 44 px targets, card on hover **and** focus, touch select-then-open). `GraphViews` organism (13 files) listed at `/#/dev/components`. No gallery code copied (the repo has no licence file); libraries and licences named in `types.ts`. Verified 390 / 1280 / 1920 / 2560 / 3840, light + dark, keyboard walk in all four gallery views.

### D.10 Brand documents `G-08`, `P-05`, hub card, the assets intake (Opus 5 pages and intake, Fable 5.1 data)

- Intake (prompt 0011): the two PDFs byte-exact from Slack under their original names in `docs/source/brand/`, served copies `apps/hub/public/brand/aluzina-{portfolio,brochure}.pdf` (`./brand/…`, Vite `publicDir`), **56 page renders** (<= 1400 px, q80) + contact sheets + `index.json` per document in `docs/brand/` (8.6 MB, renderer `docs/brand/tools/render-pdf-pages.py`), `docs/knowledge/brand.md` part B (voice, credentials 8 years / 50+ projects / 16.743 m², services as marketed, 13 shown + 20 named projects with stable slugs, the shared blue -> lime gradient and DIN Round Pro, contact channels, six mismatches against the playbook, unknowns), `clients.md` appended. Findings for the founder: the two PDFs are **two brand eras** (*Universo de Diseño* vs *Interiorismo · Iluminación*); both print Instagram `@aluzinaa`; the portfolio prints `aluzina.co`.
- **G-08** `/brand/documents` (`brand.manage`): both documents from `assets` rows with pages-as-records count, palette swatches, fonts, viewer (`<object>` -> `<iframe>` -> sentence with the download link), download, open in tab, shareable `?doc=<slug>&page=N` link (copies to the clipboard), **Related** projects (`depicts` / `references`) and services (`applies-to`). Placeholder: "Replace document" (`brand.replaceDocument`, registered and failing loudly per D-047). Hub card **G-08 Portfolio & brochure** switches to the brand demo user when the role lacks `brand.manage` (`enterUnless`). G-01 gained a client-documents row (still the static list; follow-up).

## E. Verification

- `npm run build` green after the rebase onto `main` (tokens + tsc strict + vite + copy-static; `npm ci` from the merged lockfile).
- Playwright smoke (Chromium, `--use-gl=swiftshader --enable-unsafe-swiftshader`) over `dist/` served on 127.0.0.1: **every one of the 113 routes** (`:projectId` = `prj-laureles`, `:spaceId` = `sp-portfolio`, `:postId` = `post-brand-voice`, `:slug` = `creative-digital-consultation`, `/docs/*` = `decisions.md`), each as a role holding its permission via `?as=`, at **390 and 1280**, light theme: **226 checks**, no page errors, no console errors beyond the sandbox font TLS error, `scrollWidth <= clientWidth`. First run: 3 overflows at 390 (D-04 and M-06 long button labels, D-08 presence bar in the top bar), fixed in the library (section C) and re-run clean. The 404s for `fonts/DINRoundPro-*.woff2` are the 0014 licensed font files that are deliberately not committed (D-040); the browser falls back to Rubik.
- Thumbnails: 21 new targets in `scripts/thumbnails.mjs` (section 1.4b of surfaces.md); the K-04 capture stays inside the 45 s bound (SwiftShader renders the 3D view; without WebGL the page falls back to the 2D graph).
- Module-level checks (dev server, before integration) are in each module's section above: all seven widths on public, manual, docs, qa, crm, studio, brand documents; 360..1920 client; 360..2560 tools; 390..3840 graph.

## F. Placeholders across the pass (P-09)

`public.reserveDeposit` (P-03), footer Instagram / WhatsApp (public), `client.payOnline` (C-05), `manual.createLead` (M-02), `manual.openKpiDashboard` (M-08), `tools.movePlanTask` (D-05), `qa.editToken` (D-14), `qa.fileBug` + "Load screenshot manifest" (D-11), `ops.addSitePhoto` (O-13), `studio.sendMatrixToClient` (S-11), `brand.replaceDocument` (G-08). All are `Placeholder` controls (tooltip, toast, dev-mode badge) and, per **D-047**, registered on the bus so `runAction` answers `{ ok: false, error: 'not wired yet: …' }` instead of `not-live`.

## G. Deferred requests (backlog, with owners)

| Request | From | Owner |
| --- | --- | --- |
| `DocumentViewer` organism taking an `Asset` row (`<object>` -> `<iframe>` -> sentence, download, page fallback) | brand-assets, brand-docs, brand-data | Opus 5 |
| `Stepper` / `FormStep` (P-03, C-01, M-01), `Accordion` (C-02, S-10), `ProgressBar` / `Meter` (C-01, C-02, O-12, O-13, S-10), `Checklist` (M-xx, S-08, S-10), `MessageBubble` / `Thread` (C-04), `Swatch` (D-14, G-08), `Tooltip` atom (graph card), `ParamForm` (D-09), `DeviceFrame` + `ZoomStage` + `DependencyLane` (D-05 / D-07 / D-08) | client, public, manual, studio, crm, qa, graph, tools | Opus 5 |
| `feedback` entity + FeedbackButton (P-08) so D-11 "File a bug" becomes real | qa | Fable 5.1 |
| file-storage seam on the `DataProvider` (`put(file) -> url`): site photos, replace document, floor plans in the intake | crm, brand-docs, public | Fable 5.1 |
| `useGovernance()` / `canEnter(project, status)` in `src/domain` so S-10, A-03, O-11 share one rule implementation; `GovernanceRule.pageCode[]` | studio, manual | Fable 5.1 |
| Work views migrate from `phase` to `pipelineStatus`; then remove `phase` and `founder.moveProject` (D-048) | crm | Fable 5.1 |
| `leads` row-level policy for anonymous visitors (insert one `public-intake` row, select nothing) + rate limiting before `/start` goes on a public domain | public | Fable 5.1 |
| `documents.clientVisible`, `own.brief.write` permission, unread badge on the client bottom nav, client sign-off on change orders (`clientApprovedAt`), `purchases.quoteId` | client, crm | Fable 5.1 |
| `Markdown`: heading ids + `linkResolver` prop; `docs:index` build step; `SpaceTree` rename to `Tree` | docs | Opus 5 |
| `postMessage` seam (`aluzina.setLang / setTheme / navigate`) so D-08 drives its frames without reloads | tools | Opus 5 |
| K-05 catalog tab for `assets`; G-01 documents row from `assets`; the brochure's 17 brochure-only names as projects (founder decides) | brand-data | Opus 5 |
| graph: label collision pass, focus-neighbourhood framing, node cap measured against a Slack import; `pageCode` as data on deliverables / tools; K-0x thumbnails | graph | Opus 5, Sonnet 5 |
| shadow tokens (`--shadow-sm / md / lg`, 0014 added a `shadow` group: verify the six hard-coded elevations use it); `specCompleteness` `checkedAt` threshold to seven widths; `qa.runAction` cannot run itself | qa | Sonnet 5 |
| D-14 dev tokens vs D-10 design tokens: one page or a clear split | integration | Fable 5.1 |
| Spanish review of `domain/playbook.ts` (falls back to English where unsure) | foundation | Sonnet 5 + founder |
| screenshots for every new code into `docs/screenshots/<CODE>/` after the deploy; Spanish fill over the new tables | all | Sonnet 5 |

## H. Questions for Justin and the founder (kanban "Awaiting")

1. Which brand era is current: the portfolio's *Universo de Diseño* (gold serif, three pillars incl. Arte and a product line) or the brochure's *Interiorismo · Iluminación*? The playbook names none of the brochure's trades (Mobiliario, Iluminación); is the product line Honey Valley?
2. Does the public site join the OS as the P-xx module now live at `/#/services`, or stay Lovable-hosted (P-00) with the OS behind it?
