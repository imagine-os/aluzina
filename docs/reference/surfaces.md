# Surfaces: routes, scripts, actions, MCP / CLI / API

Every surface a machine (script, agent, voice controller, MCP client) can drive, recorded every pass (P-10). Update this file in the same turn as any change to a route, npm script, action, provider method or API. Last full pass: 2026-09-21 (changelog 0013 integration, after 0014 and 0015).

## 1. What exists today

### 1.1 Route manifest (in the running app)

`apps/hub/src/app/manifest.ts` publishes `window.__aluzina = { routes, version, actions }` on load (`actions`: section 2.1, live since 0013). Each entry: `{ path, code, surface, status: 'built' | 'stub', shell: 'desktop' | 'phone' | 'bare', permission?, spec }` where `spec` is the full `PageSpec` (`apps/hub/src/specs/PageSpec.ts`: code, name, purpose, surface, navGroup?, layout, dataTables, roles, logic, components, actions, checkedAt, notes). Routing is HashRouter, so every page is `/#/<path>`. Routes come from `src/modules/*/index.ts` through the registry (D-014); `permission` is what `RequireRole` checks (D-015).

| path | code | surface | status | shell | permission | actions (page) |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | HUB-01 | hub | built | bare | – | `hub.enterAs`, `hub.switchRole`, `hub.openSurface`, `hub.openPrototypePage`, `hub.setLang`, `hub.toggleTheme`, `hub.toggleDevMode` |
| `/founder` | A-01 | founder | built | desktop | `projects.approve` | 5 (Founder dashboard) |
| `/founder/approvals` | A-02 | founder | built | desktop | `projects.approve` | 4 (Approvals) |
| `/founder/pipeline` | A-03 | founder | built | desktop | `projects.read` | 4 (Pipeline) |
| `/founder/proposals` | A-04 | founder | built | desktop | `quotes.review` | 5 (Quotes and proposals) |
| `/founder/products` | A-05 | founder | built | desktop | `products.write` | 2 (Products and partnerships) |
| `/founder/clients` | A-06 | founder | built | desktop | `projects.read` | 3 (Clients and negotiations) |
| `/founder/team` | A-07 | founder | built | desktop | `projects.read` | 3 (Team overview) |
| `/ops` | O-01 | ops | built | desktop | `schedule.manage` | 4 (Operations dashboard) |
| `/ops/schedule` | O-02 | ops | built | desktop | `schedule.manage` | 3 (Project schedule) |
| `/ops/tasks` | O-03 | ops | built | desktop | `tasks.manage` | 4 (Pending tasks) |
| `/ops/suppliers` | O-04 | ops | built | desktop | `suppliers.manage` | 4 (Suppliers and follow-ups) |
| `/ops/quotes` | O-05 | ops | built | desktop | `quotes.compare` | 4 (Quotes and comparisons) |
| `/ops/deliveries` | O-06 | ops | built | desktop | `deliveries.manage` | 3 (Deliveries and dates) |
| `/ops/payments` | O-07 | ops | built | desktop | `payments.manage` | 3 (Payments and accounts) |
| `/ops/documents` | O-08 | ops | built | desktop | `documents.manage` | 4 (Administrative documents) |
| `/ops/alerts` | O-09 | ops | built | desktop | `alerts.manage` | 5 (Alerts before urgent) |
| `/ops/reports` | O-10 | ops | built | desktop | `reports.write` | 4 (Reports) |
| `/studio` | S-01 | studio | built | desktop | `design.develop` | 5 (Studio dashboard) |
| `/studio/projects` | S-02 | studio | built | desktop | `design.develop` | 4 (Projects and proposals) |
| `/studio/references` | S-03 | studio | built | desktop | `references.manage` | 5 (References and mood boards) |
| `/studio/materials` | S-04 | studio | built | desktop | `materials.manage` | 5 (Material palettes) |
| `/studio/plans` | S-05 | studio | built | desktop | `plans.write` | 4 (Plans and design documentation) |
| `/studio/schedules` | S-06 | studio | built | desktop | `schedules.write` | 5 (Furniture, material and element schedules) |
| `/studio/packs` | S-07 | studio | built | desktop | `renders.brief` | 4 (Render and supplier packs) |
| `/studio/checks` | S-08 | studio | built | desktop | `projects.check` | 6 (Consistency check) |
| `/studio/measurements` | S-09 | studio | built | desktop | `measurements.write` | 4 (Measurements and requirements) |
| `/brand` | G-01 | brand | built | desktop | `brand.manage` | 1 (Brand dashboard) |
| `/brand/competitions` | G-02 | brand | built | desktop | `competitions.manage` | 6 (Competitions 2027) |
| `/brand/presentations` | G-03 | brand | built | desktop | `presentations.write` | 4 (Sales presentations) |
| `/brand/identity` | G-04 | brand | built | desktop | `brand.manage` | 6 (Brand identity and assets) |
| `/brand/images` | G-05 | brand | built | desktop | `images.write` | 5 (Images for clients) |
| `/brand/revisions` | G-06 | brand | built | desktop | `revisions.manage` | 3 (Graphic revisions queue) |
| `/brand/assets` | G-07 | brand | built | desktop | `assets.manage` | 6 (Asset library organization) |
| `/founder/work`, `/ops/work`, `/studio/work`, `/brand/work` | W-01 | founder / ops / studio / brand | built | desktop | `projects.read` / `tasks.manage` / `tasks.own.write` / `tasks.own.write` | 31 `work.*` per route (Work) |
| `/<surface>/work/:projectId` (same four surfaces) | W-02 | founder / ops / studio / brand | built | desktop | as W-01 | 31 `work.*` per route (Project work) |
| `/founder/spaces`, `/ops/spaces`, `/studio/spaces`, `/brand/spaces`, `/dev/spaces` | K-01 | founder / ops / studio / brand / dev | built | desktop | `spaces.read` | 15 `spaces.*` per route (Spaces home) |
| `/<surface>/spaces/:spaceId` (same five surfaces) | K-02 | as K-01 | built | desktop | `spaces.read` | 15 (Space view) |
| `/<surface>/spaces/post/:postId` | K-03 | as K-01 | built | desktop | `spaces.read` | 13 (Post) |
| `/<surface>/spaces/graph` | K-04 | as K-01 | built | desktop | `spaces.read` | 6 (Graph; `?focus=<type>:<id>&depth=1\|2\|3\|all` in the hash query) |
| `/<surface>/spaces/catalog` | K-05 | as K-01 | built | desktop | `spaces.read` | 5 (Catalog; `?tab=deliverables\|clients\|tools\|roles`) |
| `/<surface>/spaces/import` | K-06 | as K-01 | built | desktop | `spaces.read` | 2 (Import from Slack) |
| `/design` | D-12 | design | built | desktop | `design.read` | `design.downloadManual`, `design.copyToken`, `design.previewMetal` (Brand guidelines) |
| `/design/tokens` | D-10 | design | built | desktop | `design.read` | `design.searchTokens`, `design.copyToken` (Design tokens) |
| `/design/effects` | D-13 | design | built | desktop | `design.read` | `design.setShimmerIntensity`, `design.toggleMotion`, `design.setTextureSize`, `design.toggleSheen` (Textures and effects) |
| `/dev/components` | D-02 | dev | built | desktop | `dev.tools` | `dev.searchComponents`, `dev.filterTier` |
| `/dev/specs` | D-03 | dev | built | desktop | `dev.tools` | `dev.openSpec`, `dev.filterSurface` |
| `/dev/multiuser` | D-04 | dev | built | desktop | `dev.tools` | `dev.openAs`, `dev.resetData` |
| `/dev/plan` | D-05 | dev | built | desktop | `dev.tools` | 7 `tools.*` (Plan viewer) |
| `/dev/canvas` | D-07 | dev | built | desktop | `dev.tools` | 6 `tools.*` (Canvas) |
| `/dev/simulator` | D-08 | dev | built | desktop | `dev.tools` | 7 `tools.*` (Demo simulator) |
| `/dev/actions` | D-09 | dev | built | desktop | `dev.tools` | 7 `qa.*` (Actions registry: declared vs live, run, WebMCP JSON) |
| `/dev/tokens` | D-14 | dev | built | desktop | `dev.tools` | 4 `qa.*` (Design tokens with contrast) |
| `/dev/testing` | D-11 | dev | built | desktop | `dev.tools` | 5 `qa.*` (Testing hub) |
| `/docs` | D-06 | docs | built | desktop | `docs.read` | 4 `docs.*` (Documentation) |
| `/docs/*` | D-15 | docs | built | desktop | `docs.read` | 4 `docs.*` (Document: `#/docs/<path>`) |
| `/manual` | M-01 | manual | built | desktop | `manual.read` | 3 `manual.*` (Overview) |
| `/manual/commercial` | M-02 | manual | built | desktop | `manual.read` | 5 (Commercial process; `?s=<section>`) |
| `/manual/services/<slug>` (x 5) | M-03..M-07 | manual | built | desktop | `manual.read` | 3 each (one page per service) |
| `/manual/governance` | M-08 | manual | built | desktop | `manual.read` | 4 (Governance, statuses, roles, assets, KPIs) |
| `/client` | C-01 | client | built | phone | `own.projects.read` | 4 `client.*` (Client home) |
| `/client/projects/:projectId` | C-02 | client | built | phone | `own.projects.read` | 2 (Project) |
| `/client/approvals` | C-03 | client | built | phone | `own.projects.read` | 4 (Approvals and revision matrix) |
| `/client/messages` | C-04 | client | built | phone | `own.projects.read` | 3 (Messages) |
| `/client/payments` | C-05 | client | built | phone | `own.payments.read` | 1 (Payments) |
| `/client/brief` | C-06 | client | built | phone | `own.projects.read` | 2 (Strategic brief) |
| `/services` | P-01 | public | built | bare | – | 4 `public.*` (Services) |
| `/services/:slug` | P-02 | public | built | bare | – | 4 (Service; slugs, `?service=` accepts code or slug) |
| `/start` | P-03 | public | built | bare | – | 7 (Intake; writes `leads`) |
| `/method` | P-04 | public | built | bare | – | 3 (Method) |
| `/portfolio` | P-05 | public | built | bare | – | 5 (Portfolio and brochure; `?doc=portfolio\|brochure`) |
| `/founder/leads` | A-08 | founder | built | desktop | `leads.manage` | 10 (Leads) |
| `/ops/change-orders` | O-11 | ops | built | desktop | `changeOrders.manage` | 5 (Change orders) |
| `/ops/purchases` | O-12 | ops | built | desktop | `purchases.manage` | 4 (Purchasing control) |
| `/ops/site-reports` | O-13 | ops | built | desktop | `siteReports.write` | 4 (Site reports) |
| `/studio/checklist`, `/studio/checklist/:projectId` | S-10 | studio | built | desktop | `engagements.write` | 8 (Service checklist) |
| `/studio/revisions` | S-11 | studio | built | desktop | `revisionMatrix.write` | 7 (Revision matrix) |
| `/studio/archive`, `/founder/archive`, `/brand/archive` | S-12 | studio, founder, brand | built | desktop | `projects.read` | 12 (Project archive browser: `archive.filterLifecycle`, `filterYear`, `filterType`, `filterTag`, `search`, `setView`, `openProject`, `toggleInSet`, `copySet`, `clearSet`, `exportSet`, `importFolder`; 0019) |
| `/studio/archive/:projectId`, `/founder/archive/:projectId`, `/brand/archive/:projectId` | S-13 | studio, founder, brand | built | desktop | `projects.read` | 16 (Project portal: `archive.openFile`, `closeFile`, `nextFile`, `prevFile`, `previewPage`, `filterStage`, `filterFileType`, `searchFiles`, `setFilesView`, `setGrouping`, `openSource`, `downloadFile`, `copyFileLink`, `openFolderSource`, `tagFile`, `addToSet`; 0019) |
| `/brand/documents` | G-08 | brand | built | desktop | `brand.manage` | 5 (Brand documents; `?doc=<slug>&page=N`) |

119 routes, 960 declared action entries (changelog 0019: +6 routes of the `archive` module, S-12 with 12 and S-13 with 16 `archive.*` ids declared on each of the three surfaces = 84 entries, 28 distinct ids; `hub.openSurface` gains `archive`; 113 routes, 876 entries after 0013 integration; 78 / 689 after 0015, 75 / 680 in 0009): hub 1 route, founder 16, ops 21, studio 20, brand 16, client 6, public 5, manual 8, docs 2, design 3 (9 entries, 8 `design.*` ids incl. `design.downloadManual`, 0015), dev 15. New in 0013: `tools.*` (20 ids, D-05 / D-07 / D-08), `qa.*` (16, D-09 / D-14 / D-11), `manual.*` (8 over 8 routes), `docs.*` (4 on 2 routes), `client.*` (11), `public.*` (P-01..P-05 incl. the shared `public.openWebsite` / `public.openHub`), `founder.*` +10 on A-08 and A-03 rewritten to 6, `ops.*` +13 (O-11 5, O-12 4, O-13 4) + O-01, `studio.*` +17 (S-10 8, S-11 7, S-01 2), `brand.*` +7 (G-08 5, G-01 2), `spaces.*` +4 on K-04 (10 per graph route, 5 routes). The `work.*` set is 31 distinct ids on eight routes; the `spaces.*` set is 41 distinct ids on 30 routes. Every action id is `<module>.<verb>` with an intent phrase and, for guarded pages, a permission; the full list is `window.__aluzina.routes[].spec.actions`, the drawer on `/#/dev/specs` and the registry on `/#/dev/actions` (D-09).

Consumers: `scripts/screenshots.mjs` (writes the manifest into `docs/screenshots/<CODE>/routes.json`), `/#/dev/specs` (D-03, same data through `RoutesContext`), `scripts/thumbnails.mjs` targets; future QA and WebMCP generation.

#### 1.1a Session by URL: `?as=<role>`

`SessionProvider` reads `as` from `location.search` (before the hash: `/?as=ops#/ops`) or from a query inside the hash (`/#/ops?as=ops`) **on first load only** and becomes that role's demo user (`founder | ops | studio | brand | client | dev`), clearing any `viewAs`. Unknown values are ignored. Used by `scripts/thumbnails.mjs` (portal and dev thumbnails), by QA scripts and for deep links; a later navigation that only changes the hash does not re-read it (reload to re-apply). The chosen user persists in `aluzina.session` like any switch.

### 1.1a-bis Static assets served by the hub (not in `window.__aluzina`)

| path | what | source | since |
| --- | --- | --- | --- |
| `/brand/MANUAL-DE-MARCA-ALUZINA.pdf` | The current brand manual PDF (silver edition, 496 KB), the target of D-12's download button and `design.downloadManual`; replaced in place when a new edition lands (dated copies in `docs/source/brand-kit/`) | `apps/hub/public/brand/` (Vite `public/`, copied verbatim into `dist/`; relative link `./brand/…` works under `base: './'`) | 0015, D-051 |
| `/brand/*.svg` | Standalone marks for docs and OG images (`wordmark-iridescent`, `wordmark-gold`, `monogram-*`, `elements`) | `apps/hub/public/brand/` | 0014 |
| `/fonts/DINRoundPro-*.woff2` | Licensed faces, declared by `fonts.css`, dropped in by hand (D-040); absent in the repo | `apps/hub/public/fonts/` | 0014 |

### 1.1b Static routes: Business OS prototype (not in `window.__aluzina`, D-007)

Served from `dist/business-os/` (copy of `apps/business-os/`). Forwarders keep `?query` and `#hash`.

| URL | code | resolves to | query contract |
| --- | --- | --- | --- |
| `/business-os/` | BOS-01 | `ALUZINA%20Business%20OS.dc.html` | `?embed=1&screen=<home\|stations\|work\|deliverables\|qc\|media\|ds\|canvas\|docs\|portfolio\|pcanvas\|wshub\|wscanvas\|render\|shortcuts>` renders one screen bare (the app's self-embed mode); `?theme=dark` |
| `/business-os/home.html` | BOS-02 | `ALUZINA%20Home.dc.html` | – |
| `/business-os/cyber-bridge.html` | BOS-03 | `Cyber%20Bridge.dc.html` | `#stations`, `#menu`, `#bible` anchors |
| `/business-os/cyber-bridge-deck.html` | BOS-04 | `Cyber%20Bridge%20Deck.dc.html` | – (keyboard: arrows) |
| `/business-os/image-generation-plan.html` | BOS-05 | `Image%20Generation%20Plan.dc.html` | – |
| `/business-os/lod-ladder.html` | BOS-06 | `LOD%20Ladder.dc.html` | – |

Runtime resources: `/business-os/vendor/*.js` (React, ReactDOM, Babel), `/business-os/vendor/fonts/*.css` + `files/*.woff2`; no request leaves the site (D-008). No hash routing inside the app: screens are React state (audit item, P-06).

### 1.2 Browser state (localStorage)

| key | values | set by |
| --- | --- | --- |
| `aluzina.lang` | `en` \| `es` | `I18nProvider.setLang` (action `hub.setLang`) |
| `aluzina.theme` | `light` \| `dark` | `ThemeProvider` (action `hub.toggleTheme`) |
| `aluzina.metal` | `silver` \| `gold` | D-12 metal preview (action `design.previewMetal`, D-039); applied on `<html data-metal>` by `modules/design/metal.ts` on boot and on change; absent = `tokens.metalDefault` (silver since 0015, D-050; gold is the previous edition, preview only) |
| `aluzina.session` | JSON `{ userId, viewAs: role \| null, devMode }` | `SessionProvider` (`switchUser`, `viewAs`, `toggleDevMode`; actions `hub.enterAs`, `hub.switchRole`, `hub.toggleDevMode`); `userId` is a demo user id (`u-alejandra`, `u-miguel`, `u-sarai`, `u-angelica`, `u-client`, `u-dev`), default `u-dev` |
| `aluzina.devMode` | `on` \| `off` | mirror of `session.devMode` for the pre-paint script and older tooling |
| `aluzina.data` | JSON `{ seedVersion, tables }` | `MockProvider` (D-016): every entity table (37 since 0013: 29 + `leads`, `engagements`, `revisionItems`, `changeOrders`, `purchases`, `siteReports`, `messages` + `assets`); removed and re-seeded by `reset()` or when `SEED_VERSION` changes (6 since 0013) |
| `aluzina.graphView` | `objects3d` \| `lanes` \| `radial` \| `map` \| `force2d` | K-04 view switcher (action `spaces.switchGraphView`, D-053); absent = 3D objects (2D fallback without WebGL or with reduced motion) |
| `aluzina.public.intake` (sessionStorage) | JSON of the intake draft (answers per step, current step) | P-03 `/start`: survives a reload, cleared when the `leads` row is written |
| `aluzina.views.<userId>` | JSON `{ views: SavedView[], last: { [scope]: ViewState } }` | Work views (D-025): named saved views and the last `{ view, filters, sort, groupBy }` per scope (`all` or a project id), per demo user |
| `aluzina.archive.set` | JSON `string[]` of project ids | The portfolio set of S-12 / S-13 (D-061): the projects ticked for a portfolio or a client example set; shared between the two pages through a window event, per browser, until Spaces collections replace it (ar-10) |
| `aluzina.tabUser` (sessionStorage) | demo user id | `SessionProvider`: the `?as=` user of this tab, wins over `aluzina.session.userId` on reload so two tabs stay two people (D-04) |
| `aluzina.presence` | JSON `{ [tabId]: { tabId, userId, route, at } }` | `PresenceProvider` fallback when `BroadcastChannel` is unavailable (D-023) |

Cross-tab channels (D-023): `BroadcastChannel('aluzina-data')` carries `{ change: { entity, kind, id }, tabId, rows?: { [entity]: Row[] } }` after every `MockProvider` write; `BroadcastChannel('aluzina-presence')` carries `{ tabId, userId, route, at, bye? }` every 5 s (expiry 15 s). Pages never touch them; Supabase Realtime / Presence replace them behind `subscribe` and `usePresence()`.

Mirrored onto `<html>` as `lang`, `data-theme`, `data-dev`, `data-role` (effective role), `data-metal` (preview, when set) (theme / lang / dev also applied pre-paint by the inline script in `apps/hub/index.html`).

### 1.3 Actions declared (P-05)

| id | page | intent | permission | params |
| --- | --- | --- | --- | --- |
| `hub.enterAs` | HUB-01 | open the {role} portal as its demo user | – | `role: enum:founder\|ops\|studio\|brand` |
| `hub.switchRole` | HUB-01 | view the system as {role} | – | `role: enum:founder\|ops\|studio\|brand\|client\|dev` |
| `hub.openSurface` | HUB-01 | open the {surface} | – | `surface: enum:website\|services\|brand-docs\|client\|manual\|docs\|archive\|spaces\|business-os\|design\|plan\|canvas\|simulator\|actions\|tokens\|testing\|components\|specs\|multiuser` (pass 0013 list; `design` added in 0014: the D-12 card; `archive` added in 0019: the S-12 card) |
| `hub.openPrototypePage` | HUB-01 | open the prototype page {page} | – | `page: enum:home\|cyber-bridge\|cyber-bridge-deck\|image-generation-plan\|lod-ladder` |
| `hub.setLang` | HUB-01 | switch the language to {lang} | – | `lang: enum:en\|es` |
| `hub.toggleTheme` | HUB-01 | switch between light and dark | – | – |
| `hub.toggleDevMode` | HUB-01 | turn developer mode on or off | `dev.tools` | – |
| `founder.*` (26 entries) | A-01..A-07 | approve / request changes / comment on a project, move a project phase, set creative direction, mark a document final or sent, sign off a presentation, shortlist a quote, approve a material, mark a task done, new lead / quote / partnership / note (Placeholders) | `projects.approve`, `projects.write`, `quotes.review`, `proposals.write`, `clients.write`, `products.write`, `projects.read` | project / document / quote / task ids |
| `ops.*` (38 entries, 35 ids) | O-01..O-10 | acknowledge / resolve / reopen an alert, confirm / receive / delay a delivery, move a task, pause / activate a supplier, select / shortlist a quote, mark a payment paid or part paid, advance a document, new task / meeting / supplier / alert, request quote, format / export / send report (Placeholders) | `schedule.manage`, `tasks.manage`, `suppliers.manage`, `quotes.request`, `quotes.compare`, `deliveries.manage`, `payments.manage`, `documents.manage`, `alerts.manage`, `reports.write` | ids, dates, amounts |
| `studio.*` (42 entries) | S-01..S-09 | send a project to check, move a reference to a board, request sample / approve / reject a material, new version / mark final a plan, review / finalise a schedule, move a render pack, tick a check item, save notes, pass / report issues, new proposal / palette / pack / check and capture controls (Placeholders) | `design.develop`, `references.manage`, `materials.manage`, `plans.write`, `schedules.write`, `renders.brief`, `projects.check`, `measurements.write` | ids, text |
| `brand.*` (31 entries) | G-01..G-07 | edit a competition slot (name, organiser, category, submission date, project, folder, result) and advance its status, advance a presentation / revision / image set, mark an asset superseded or current, import list / open folder / request deck / upload / share / connect storage (Placeholders) | `brand.manage`, `competitions.manage`, `presentations.write`, `images.write`, `revisions.manage`, `assets.manage` | ids, text, date |
| `design.downloadManual` | D-12 | download the brand manual PDF | `design.read` | – (live on the bus while D-12 is mounted, 0015) |
| `design.copyToken` | D-12, D-10 | copy the value of {token} / copy the variable {token} | `design.read` | `token: string` |
| `design.previewMetal` | D-12 | preview the brand in {metal} | `design.read` | `metal: enum:silver\|gold` (live on the bus while D-12 is mounted, 0015) |
| `design.searchTokens` | D-10 | find the token {query} | `design.read` | `query: string` |
| `design.setShimmerIntensity` | D-13 | set the shimmer intensity to {intensity} | `design.read` | `intensity: enum:0.2\|0.4\|0.6\|0.8\|1` |
| `design.toggleMotion` | D-13 | turn the shader motion on or off | `design.read` | – |
| `design.setTextureSize` | D-13 | set the texture tile size to {size} | `design.read` | `size: enum:1.5rem\|2.5rem\|4rem\|6rem` |
| `design.toggleSheen` | D-13 | turn the sheen sweep on or off on the sample band | `design.read` | – |
| `tools.*` (20 ids) | D-05, D-07, D-08 | switch / search / filter the plan (status, model, step), open a task, move a task (Placeholder: answers where the repo edit belongs); zoom / fit / filter / search the canvas, open a page; simulate route / role / language / theme, open a frame in a tab, toggle frame sync, apply a preset | `dev.tools` | task / route ids, enums (`view`, `status`, `model`, `step`, `surface`, `zoom`, `role`, `lang`, `theme`, `preset`) |
| `qa.*` (16 ids) | D-09, D-14, D-11 | search / filter / open an action, run it with params, copy its WebMCP tool JSON, export all; search / filter tokens by group, copy a token, edit token (Placeholder); filter the QA matrix by surface / status, open a page at 390 / 1280 / 1920 as the right role, load the screenshot manifest (Placeholder), file a bug (Placeholder) | `dev.tools` | action ids, `params` object, token names, enums (`group`, `surface`, `width`) |
| `manual.*` (8 ids) | M-01..M-08 | open a service, open a section (`?s=`), jump to a phase, print, route a client through the qualification questions (`routeService()`), create lead (Placeholder -> A-08), open the enforcing page of a rule, open the KPI dashboard (Placeholder) | `manual.read` | service codes / slugs, phase ids, section keys, answers |
| `docs.*` (4 ids) | D-06, D-15 | open a document (`#/docs/<path>`), search the docs, open on GitHub, collapse a folder | `docs.read` | `path: string`, `query: string`, `folder: string` |
| `client.*` (11 ids) | C-01..C-06 | open project / approvals / messages / payments / brief, add a revision comment (`revisionItems` row), decide an item, approve for execution (G-06 gate), send a message, mark read, save the brief, pay online (Placeholder, D-035) | `own.projects.read` (navigation), `own.revisions.write`, `own.proposals.approve`, `own.messages.write` / `messages.write`, `own.payments.read` | project / item / message ids, text |
| `public.*` (P-01..P-05) | public | open a service by slug, start the intake (`?service=` code or slug), next / back / answer a step, submit (writes `leads`), reserve a deposit (Placeholder), open the website, open the hub, view / download / open a document | – (public) | slugs, step keys, answers, `doc: enum:portfolio\|brochure` |
| `founder.*` (+10 on A-08, A-03 -> 6) | A-08, A-03 | new lead (real since 0013), qualify, suggest service (`routeService()`), set requested service, assign owner, set lead status, filter / search, convert lead to project (+ engagement), open in Work; move pipeline status (G-06 / G-12 gate in the write), toggle a band, open leads, move project (legacy `phase`), open project, set creative direction | `leads.manage`, `projects.write`, `projects.read` | lead / project / user ids, `status: enum:<15 pipeline ids>`, answers |
| `ops.*` (+13) | O-01, O-11, O-12, O-13 | create / approve / reject / execute a change order (G-14 in the write), create / advance / set status of a purchase (`PURCHASE_STATUSES`), filter, create a site report, add photo (Placeholder), open the execution pages | `changeOrders.manage`, `purchases.manage`, `siteReports.write`, `schedule.manage` | ids, amounts (COP), days, dates, progress 0-100 |
| `studio.*` (+17) | S-01, S-10, S-11 | select project, tick a checklist item (`engagements.checks`), complete / advance a phase, toggle a phase, open the brief, open a stage page, send to procurement (G-06 / G-12 gate); select project, filter, add / edit / decide a revision item, resolve as adjustment, export CSV, send to client (Placeholder) | `engagements.write`, `revisionMatrix.write`, `design.develop` | project / engagement / item ids, `checkKey` strings, `status: enum:approved\|approved-with-adjustments\|revision`, text |
| `archive.*` (28, 0019) | S-12, S-13 (each on studio / founder / brand) | filter by lifecycle / year / type / tag, search, cards or table, open a project, toggle / copy / clear / export the portfolio set (export and import folder answer "not wired yet", D-047); open / close / next / prev file, go to preview page, filter by stage / file type, search files, files view, group by stage or folder, open at source, download, copy link, open the folder at source, tag file (Placeholder, `assets.manage`), add to set | `projects.read`; `archive.tagFile` `assets.manage` | `life: enum:prospect\|active\|past\|all`, `year`, `type`, `tag`, `q`, `view: enum:cards\|table`, `project: id`, `asset: id`, `page: number`, `stage: enum:<DeliveryStage>`, `fileType: enum:<FileType>`, `mode: enum:stage\|folder` |
| `brand.*` (+7) | G-01, G-08 | view / download / open in tab / share link / replace (Placeholder) a document | `brand.manage` | `doc: enum:portfolio\|brochure`, `page: number` |
| `spaces.*` (+4 on K-04) | K-04 | switch graph view (`spaces.switchGraphView`), auto-rotate the 3D scene, reset the camera, show all nodes beyond the cap (plus the six 0009 graph actions: focus, depth, kind filter, zoom, fit, open) | `spaces.read` | `view: enum:objects3d\|lanes\|radial\|map\|force2d`, node ids |
| `dev.searchComponents` | D-02 | find the component {query} | `dev.tools` | `query: string` |
| `dev.filterTier` | D-02 | show only {tier} components | `dev.tools` | `tier: enum:all\|atom\|molecule\|organism\|template` |
| `dev.openSpec` | D-03 | show the spec of page {code} | `dev.tools` | `code: string` |
| `dev.filterSurface` | D-03 | show only {surface} pages | `dev.tools` | `surface: enum:all\|hub\|founder\|ops\|studio\|brand\|client\|dev\|design\|docs\|manual\|public` |
| `dev.openAs` | D-04 | open a new tab as {role} | `dev.tools` | `role: enum:founder\|ops\|studio\|brand` |
| `dev.resetData` | D-04 | reset the demo data to the seeds | `dev.tools` | – |
| `ops.openWork` | O-02, O-03 | open the schedule / tasks in the Work views | `schedule.manage` / `tasks.manage` | – |
| `spaces.*` (37 ids, 30 routes) | K-01..K-06 | select a space, expand / collapse, search, show archived, browse tree, create space / post, open post, filter by kind / tag / author, sort, edit description, archive, go to my role space; edit / save / pin / set status of a post, file in / remove from a space, set tags, add / remove a relation, open a related entity, comment, open link; focus the graph, set depth, toggle a kind, zoom in / out / fit, open a node; catalog tab, open template (Placeholder) / hub page / project; upload Slack export (Placeholder) | `spaces.read` (navigation, filters, comments), `spaces.write` (every write), `spaces.admin` (archive, upload) | space / post / relation / entity ids, enums (`kind`, `status`, `depth`, `tab`, `direction`), strings (`docs/pages/K-01.md`..`K-06.md`) |
| `work.*` (31 ids, 8 routes) | W-01, W-02 | switch view, search, filter, sort, group, save / apply / delete a view, add / open / rename / assign a task, set dates / status / priority / tags / description, complete, move, select, bulk update, add / remove dependency, add / tick subtask, comment, zoom, go to today, change month, collapse group, open project | `projects.read` (read and view state, comments) or `tasks.own.write` (every write; `tasks.manage` covers it) | task / person / section / project ids, enums (`view`, `status`, `priority`, `zoom`, `by`), dates, strings (`docs/pages/W-01.md`) |

Every page registers its declared actions while mounted (D-036); Placeholder controls register too and answer `not wired yet: …` (D-047), so `window.__aluzina.actions.run(id)` never silently succeeds on an unbuilt control. Per-action rows for the portals live in each page doc (`docs/pages/<CODE>.md`, section Actions) and in the manifest. Permissions per role: `apps/hub/src/auth/permissions.ts` (`docs/knowledge/roles-and-portals.md`); `suppliers.read` added for studio and ops (0007); `spaces.read / write / admin` and `marketing.*` added, role `marketing` (0009, D-028); `design.read` for every role (0014, D-041).

### 1.4 npm scripts (the CLI today)

| script | what | flags |
| --- | --- | --- |
| `npm run dev` | Vite dev server for the hub, `http://localhost:5173/#/` | |
| `npm run build` | `npm run build -w @aluzina/hub` (= `tokens` + `tsc --noEmit` + `vite build` -> repo-root `dist/`) `&& node scripts/copy-static.mjs`; must be green before every push | |
| `npm run thumbs` | `node scripts/thumbnails.mjs`: serves `dist/` on `127.0.0.1:4180` (Node `http`), screenshots every hub-linked surface (portal dashboards A-01 / O-01 / S-01 / G-01, K-01, design D-12, dev D-02 / D-03 and, since 0013, D-05 / D-07 / D-08 / D-09 / D-11 / D-14 / D-15 / D-06 as dev, M-01 as ops, C-01 as client, P-01 / P-05 public, G-08 as brand, A-08 as founder, O-11 as ops, S-10 / S-11 as studio, K-04 as founder, through `?as=<role>`, section 1.1a; Chromium runs with `--use-gl=swiftshader --enable-unsafe-swiftshader` so the K-04 3D view and the Shimmer render headless) with Playwright Chromium (1280 x 800 -> 640 x 400 JPEG q80) into `dist/thumbs/<code>.jpg` and writes `dist/thumbs/manifest.json`; CI step after `npm run build`, never part of the build (D-011). Blocks mp4 / webm, never waits for `networkidle`, 45 s per page (the hub's own wait for its lazy thumbnails is bounded to 8 s), failures write the placeholder tile and are recorded in the manifest (`source: "placeholder"`, `error`). Externals (P-00, D-06) are best effort. | `-- --dist=dist --port=4180 --only=HUB-01,BOS-01 --skip-external`; env `PW_EXECUTABLE` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE` (default `/opt/pw-browsers/chromium` when present), `HTTPS_PROXY` used only for the external captures |
| `npm run copy:static` | `node scripts/copy-static.mjs`: copies `apps/business-os/` (minus READMEs) into `dist/business-os/`, writes `dist/.nojekyll`; needs `dist/index.html` first | |
| `npm run archive:crawl` | `node scripts/archive/crawl-dropbox.mjs`: lists a public Dropbox shared folder with headless Chromium (read-only, gentle pacing, one retry after a login gate / 429, TLS verification never disabled; D-058). `--url=<share> --depth=N --out=<entries.json>` BFS from one folder; `--targets=<targets.json> --out=<raw.json>` one page per project folder, resumable. Documented invocation, never run in CI. | `--delay=1500 --retry-wait=30000 --label=A --shot=top.png`; env `PW_EXECUTABLE`, `HTTPS_PROXY` (passed to Chromium as `--proxy-server`) |
| `npm run archive:index` | `node scripts/archive/build-index.mjs`: crawler output -> `docs/archive/index.json` (inventory, one entry per project folder with `kind` / `year` / notes) + `docs/archive/projects/<slug>/index.json` (redacted deep index) + `docs/archive/README.md`, applying the D-059 redaction rules (R1..R5 in the script header) and printing counts and every rewritten folder segment. | `--inventory=<projects.json> --raw=<raw.json>[,<raw2.json>] --entries=<B.entries.json>,<C.entries.json> --deep=<slug>=<index.json> --deep-entries=<slug>=<entries.json> --out=docs/archive --max-pages=8` |
| `npm run archive:previews` | `python3 scripts/archive/render-previews.py <download\|render\|stream\|serve>`: `download` fetches only allow-listed design files (curl through the proxy, size-checked, budget and single-file limits); `render` writes thumbnails (640 px) and page renders (PyMuPDF for pdf / ai, Pillow for images, LibreOffice for Office files, ffmpeg for a video frame) + a raw `index.json`; `stream` renders one very large PDF at a time without keeping it; `serve` re-encodes the renders a **redacted** index still references into `apps/hub/public/archive/<slug>/{thumbs,pages}/` (thumbs 640 px q80, pages 1200 px q72, <= 8 pages) and prunes references whose source is missing. Needs `pymupdf`, `Pillow`; optional `soffice`, ffmpeg. | `serve --index=docs/archive/projects/<slug>/index.json --src=<thumbs dir> --dest=apps/hub/public/archive/<slug> --max-pages=8` |
| `npm run preview` | serve `dist/` on :4173 | |
| `npm run typecheck` | `tsc --noEmit` in the hub | |
| `npm run tokens` | `apps/hub/src/design/tokens.ts` -> `apps/hub/src/styles/tokens.css` (`node --experimental-strip-types scripts/gen-tokens.mjs`) | |
| `npm run screenshots` | `node scripts/screenshots.mjs`: Playwright captures into `docs/screenshots/<CODE>/<lang>-<width>.jpg` + `routes.json` | `-- --base=<url> --out=docs/screenshots --code=HUB-01 --route=/ --shots=en-390,en-1280,en-3840,es-390`; `--as=<role>` seeds `aluzina.session` with that role's demo user before load (portal pages); `--settle=<ms>` waits after the selector (Work views: 800); `--theme=dark` seeds `aluzina.theme=dark`, emulates `prefers-color-scheme: dark` and writes `<lang>-<width>-dark.jpg` (light is the default and keeps `<lang>-<width>.jpg`; run dark before light so `routes.json` ends with the light shot list; 0014); `--static=business-os/` captures a static page instead of a hub route (BOS codes; `--wait=<selector>` defaults to `#dc-root`; `es-*` shots click the page's EN/ES toggle when `--lang-toggle=<selector>` is given, e.g. `--lang-toggle='text="EN"'`; values may contain `=`); `--use-gl=<backend>` (e.g. `swiftshader`) plus `--enable-unsafe-swiftshader` pass through to the Chromium launch args for WebGL-heavy views (K-04 3D) under headless software rendering (0016; not needed once Chromium's own automatic software-WebGL fallback covers the view, but kept for a stricter environment); env `PW_EXECUTABLE` (default `/opt/pw-browsers/chromium` when present), `HTTPS_PROXY` honoured for non-localhost bases; `playwright` pinned to 1.56.1 (Chromium 1194) |

Archived scrapers (not npm scripts, docs-only, changelog 0011): `docs/source/aluzinaa-archive/tools/scrape-aluzinaa.js` and `crawl-direccion.js` re-capture aluzinaa.com and direccion.aluzinaa.com (text, rendered HTML, full-page PNGs at 390 / 768 / 1280 / 1920 / 3840) into `text/`, `html/`, `shots/` next to themselves; run with `node <script>` from a folder that has `playwright` installed and Chromium at `/opt/pw-browsers/chromium`. On this sandbox Chromium needs `--disable-features=ChromeRootStoreUsed` (already passed by `scrape-aluzinaa.js`) or the proxy CA imported into NSS to trust the outbound proxy.

### 1.4b Thumbnail manifest (`/thumbs/manifest.json`, D-011)

Static JSON written at deploy time next to the thumbnails; the contract a hub tool, QA script or agent can read to know what each card shows and how fresh it is:

```json
{
  "generatedAt": "2026-09-20T23:39:00.000Z",
  "capture": { "width": 1280, "height": 800 },
  "thumb": { "width": 640, "height": 400, "quality": 80 },
  "items": [
    { "code": "BOS-01", "path": "thumbs/BOS-01.jpg", "generatedAt": "...", "source": "http://127.0.0.1:4180/business-os/" },
    { "code": "P-00", "path": "thumbs/P-00.jpg", "generatedAt": "...", "source": "placeholder", "error": "P-00: capture exceeded 45s" }
  ]
}
```

`code` is the page code the card carries; `path` is relative to the site root; `source` is the URL that was captured (local `127.0.0.1` URLs mean "from this build") or `placeholder` when the tile was written instead; `error` is present only for placeholders. Codes today (34): `BOS-01..06`, `A-01`, `O-01`, `S-01`, `G-01`, `K-01`, `D-12`, `D-02`, `D-03`, `D-05`, `D-07`, `D-08`, `D-09`, `D-11`, `D-14`, `D-15`, `D-06` (the in-app docs since 0013, no longer the GitHub capture), `M-01`, `C-01`, `P-01`, `P-05`, `G-08`, `A-08`, `O-11`, `S-10`, `S-11`, `K-04`, `P-00` (external), `HUB-01`. The hub reads `./thumbs/<code>.jpg?v=<buildId>` directly (`SurfaceCard` `image` prop) and does not depend on the manifest; a missing file renders the bilingual tile (`data-thumb="placeholder"`).

### 1.5 Data provider (D-016)

Playbook entities (0013, D-034; vocabulary in `src/domain/playbook.ts`, D-033): `leads` (`status` = `lead-new | lead-qualified | proposal-sent | contracted`, `channel`, `requestedService` / `suggestedService`, `qualification[questionKey]`, `source: public-intake | manual | import`), `engagements` (`projectId`, `serviceCode`, `currentPhaseId`, `checks[\`${phaseId}:${itemIndex}\`]`, `brief`, `status: started | in-progress | delivered | closed`), `revisionItems` (`status: approved | approved-with-adjustments | revision`, `source: client | studio | founder`), `changeOrders` (`status: requested | approved | rejected | executed`), `purchases` (`status: quoted | approved | paid | ordered | received | installed`), `siteReports` (`progress` 0-100, `photoUrls[]`), `messages` (`projectId`, `authorId`, `body`, `at`, `readBy[]`). `projects` gain `serviceCode` (`01 | 02 | 03 | E | 04 | null`) and `pipelineStatus` (15 ids). `SEED_VERSION` 5.

Brand documents as data (0013, prompt 0013): `assets` (`kind: document | page | image | logo | texture`, `title` / `titleEs`, `slug`, `url` served path or null, `repoPath`, `mimeType`, `bytes`, `pageCount`, `pageNumber`, `parentId` page -> document, `sourceFileId` / `sourceName` Slack, `publishedAt`, `language`, `palette[]`, `fonts[]`, `textExcerpt`, `tags[]`, `status: current | superseded | draft`, `supersedesId`). Seeded from `docs/brand/<doc>/index.json` through the `@docs` alias (`seed/assets.ts`): 2 documents (`ast-portfolio`, `ast-brochure`), 56 pages (`ast-<doc>-pNN`), plus the 13 portfolio projects as `projects` rows (`prj-pf-<slug>`, `pipelineStatus: closed`), 6 `clients`, the Spaces area `sp-portfolio` (14 spaces, 15 posts, 28 filings) and 126 `relations` (`part-of`, `depicts` (new kind), `for-client`, `produced-by`, `references`, `applies-to` -> `services:<code>`, a new registry target next to `roles` / `users`). 37 entities, `SEED_VERSION` 6.

Spaces entities (0009, D-026): `spaces` (tree by `parentId`, `aboutType / aboutId`), `posts`, `filings` (post x space), `relations` (`fromType / fromId / toType / toId / kind`; `fromType` / `toType` are entity names or `roles` / `users`), `tags`, `clients`, `deliverables`, `tools`. Same `list / get / create / update / remove / subscribe` methods; the graph and backlinks are queries over `relations` (`where: { toType, toId }`).

`apps/hub/src/data/provider.ts`, mounted once by `DataContextProvider` in `App.tsx`; implementation today: `MockProvider` (`name: 'mock'`, localStorage `aluzina.data`). Every method is async so Supabase can replace it silently.

| method | signature | notes |
| --- | --- | --- |
| `list` | `list(entity, { where?, orderBy?, dir?, limit? })` | `where` is equality (arrays = "in"); returns copies |
| `get` | `get(entity, id)` | `null` when missing |
| `create` | `create(entity, data, id?)` | adds `id`, `created_at`, `updated_at`; emits `create` |
| `update` | `update(entity, id, patch, { basedOn? })` | bumps `updated_at`, stamps `updated_by`; writes `activity` rows (one per changed field, cap 500, not for `activity` / `comments`); emits `update` (+ `activity` create); throws when missing; when `basedOn` is older than the stored `updated_at` the write still applies and `onConflict` fires (D-024) |
| `remove` | `remove(entity, id)` | emits `remove` |
| `subscribe` | `subscribe(entity \| '*', cb) => unsubscribe` | `cb({ entity, kind: 'create' \| 'update' \| 'remove' \| 'reset', id })`; also fires for writes made in other tabs (BroadcastChannel, D-023): the realtime seam |
| `onConflict` | `onConflict(cb) => unsubscribe` | `cb({ entity, id, by, at })` when a `basedOn` write found a newer row (D-024) |
| `setActor` | `setActor(userId \| null)` | who is writing (`DataContext` sets it from the session): `updated_by`, `activity.actorId` |
| `reset` | `reset()` | drops local state, re-seeds, emits `reset` per entity |

Entities (`src/data/schema/index.ts`, all rows carry `id, created_at, updated_at` and optional `updated_by`): `projects, sections, tasks (sectionId, description, createdById, tags, subtasks, completedAt, order, startDate, dueDate, dependsOn), comments, activity, meetings, suppliers, quotes, deliveries, payments, documents, references, materials, schedules, renderPacks, consistencyChecks, competitions, presentations, brandAssets, revisions, alerts` (21), the Spaces and playbook entities above, and `assets` (37 in total). Seeds: `src/data/seed/*.ts` (globbed, `SEED_VERSION` 6 in `seed/index.ts`; `work.ts` adds the project-management rows, `assets.ts` the brand documents). Deferred entities and fields: D-020 (rest). React hooks: `useData()`, `useTable(entity, query)`, `useRow(entity, id)` (`src/data/DataContext.tsx`); Work views: `useWork(projectId)` (`src/work/useWork.ts`), presence: `usePresence()` (`src/presence/PresenceProvider.tsx`). Planned: `version` column and merge UI (P-14, replaces D-024), `CompanyOsProvider` stub (reference only), Supabase adapter with Realtime and Presence behind the same seams.

### 1.6 HTTP API

**None.** Static site on GitHub Pages.

### 1.7 MCP / WebMCP

**No MCP server yet.** The in-page seam is live: `window.__aluzina.actions = { run, list, declared }` (D-036): `run(id, params)` drives whatever page is mounted, `list()` is what is live now, `declared` the tool list (one entry per route x action: `{ id, code, path, label, intent, permission?, params? }`). **D-09 `/#/dev/actions` is the WebMCP surface today**: it joins declared vs live, generates the input form from `params`, runs actions, and exports each as a WebMCP tool JSON (`name = id`, `description = intent`, `inputSchema` from `paramSchema()`) or all of them at once; `paramSchema()` / `toolJson()` in `modules/qa/ActionsPage.tsx` are the canonical mapping until the generator moves to `src/actions/`.

## 2. Planned

### 2.1 Actions bus -> WebMCP tools (P-05, D-036)

**Bus exists (0013)**: `apps/hub/src/actions/bus.ts`: `registerAction(id, handler) => unsubscribe`, `runAction(id, params) => Promise<{ ok, result?, error? }>` (`error: 'not-live'` when no page has the action mounted), `listLiveActions()`, `isActionLive(id)`, `subscribeLiveActions(cb)`, `declaredActions(routes)`, `declaredActionIndex(routes)`; hooks `useRegisterAction(id, handler)`, `useRegisterActions({ id: handler })`, `useLiveActions()` (`src/actions/useRegisterAction.ts`). Published as `window.__aluzina.actions = { run, list, declared }`. Pages register their declared actions while mounted (module contract, D-047 for Placeholders); `/#/dev/actions` (D-09, built in 0013) lists declared vs live, runs them and exports tool JSON. **Planned**: WebMCP tools generated one per action (`name = id`, `description = intent`, `inputSchema` from `params`), permission-checked through `can()`; the voice controller speaks the same intents.

### 2.2 CLI

An `aluzina` CLI wrapping the scripts and, later, the actions bus (`aluzina screenshots`, `aluzina qa --codes=…`, `aluzina actions list`). The npm scripts are the CLI until then.

### 2.3 Business OS routes in the manifest

`dist/business-os/` is live (section 1.1b); its screens join `window.__aluzina` with `PageSpec`s and actions when it is modularised (step 3).

### 2.4 Realtime / presence (P-14), annotations (P-08)

Realtime and presence exist as the mock seam since 0008 (D-023): `subscribe` already fires for other tabs' writes and `usePresence()` lists who is here. Supabase Realtime (`postgres_changes` -> `subscribe` events) and Supabase Presence (-> `usePresence()`) replace the two BroadcastChannels without touching pages. Annotations: `feedback` becomes an entity (or reuses `comments` with `kind`), step 7 rest.

### 2.5 Component library as data (D-017)

`apps/hub/src/design/library.ts` exposes every component's meta and example; `/#/dev/components` renders it. A JSON export of the library (name, tier, props, a11y, usages) for the builder tool and agents is planned.

## 3. Change log of this file

- 2026-09-21 (changelog 0019): `archive` module routes S-12 / S-13 on studio, founder and brand (119 routes, 960 entries, 28 `archive.*` ids, 1.1 / 1.3); `aluzina.archive.set` (1.2); `hub.openSurface` enum += `archive` (1.3); `npm run archive:crawl` / `archive:index` / `archive:previews` (1.4); served renders under `./archive/<slug>/` (1.1a-bis); `assets.kind 'file'` + archive fields, `projects.tags / coverAssetId / year / sourceFolderUrl`, `SEED_VERSION` 7 (1.5).
- 2026-09-21 (changelog 0016): `npm run screenshots` gained `--use-gl` / `--enable-unsafe-swiftshader` Chromium-launch-arg passthrough for WebGL-heavy captures (1.4).
- 2026-09-21 (changelog 0013, integration): 35 new routes in the manifest (113 routes, 876 action entries, 1.1): tools D-05 / D-07 / D-08, qa D-09 / D-14 / D-11, docs D-06 / D-15, manual M-01..M-08, client C-01..C-06, public P-01..P-05, A-08, O-11..O-13, S-10 / S-11, G-08; `aluzina.data` 37 entities / `SEED_VERSION` 6, `aluzina.graphView`, `aluzina.public.intake` (1.2); action families `tools.* qa.* manual.* docs.* client.* public.*` and the new `founder.* ops.* studio.* brand.* spaces.*` ids, Placeholder actions registered (1.3); 21 thumbnail targets + SwiftShader (1.4, 1.4b); the bus and D-09 as the WebMCP surface (1.7, 2.1).
- 2026-09-21 (changelog 0015): `design.downloadManual` on D-12 (78 routes, 689 action entries; D-12 registers `design.downloadManual` and `design.previewMetal` on the actions bus, 1.1 / 1.3); static assets table 1.1a-bis with `public/brand/MANUAL-DE-MARCA-ALUZINA.pdf` (D-051); `aluzina.metal` default is silver (D-050), `previewMetal` enum reordered `silver|gold` (1.2 / 1.3).
- 2026-09-21 (changelog 0011): archived scraper scripts for the two public sites and how to re-run them (1.4).
- 2026-09-21 (changelog 0013, foundation): `window.__aluzina.actions` (1.1, 1.7, 2.1: the bus exists), 36 entities and `SEED_VERSION` 5 (1.2), playbook entities and `projects.serviceCode / pipelineStatus` (1.5); routes and actions of the pass 0013 modules land with the integration.
- 2026-09-21 (changelog 0014): the `design` surface with D-12 / D-10 / D-13 in the manifest (78 routes, 688 action entries, 1.1); `aluzina.metal` and `data-metal` (1.2); the seven `design.*` actions, `hub.openSurface` and `dev.filterSurface` enums gain `design`, `design.read` for every role (1.3); `--theme=dark` screenshot flag (1.4).
- 2026-09-21 (changelog 0008): W-01 / W-02 on four surfaces and D-04 in the manifest (45 routes, 400 action entries, 1.1); `aluzina.views.<userId>`, `aluzina.tabUser`, `aluzina.presence` and the two BroadcastChannels (1.2); `work.*`, `dev.openAs`, `dev.resetData`, `ops.openWork` (1.3); `--as` / `--settle` screenshot flags (1.4); `update(…, { basedOn })`, `onConflict`, `setActor`, `sections` / `comments` / `activity`, `SEED_VERSION` 3, `useWork`, `usePresence` (1.5); realtime seam status (2.4).
- 2026-09-21 (changelog 0007): 33 portal routes in the manifest (A-01..A-07, O-01..O-10, S-01..S-09, G-01..G-07), 148 actions summarised per module (1.3), `suppliers.read`, `tasks.startDate` and `SEED_VERSION` 2 (1.5), bounded hub image wait in `npm run thumbs` (1.4).
- 2026-09-21 (changelog 0006): seven routes in the manifest with `shell` / `permission`; `?as=<role>` contract (1.1a); `aluzina.session` and `aluzina.data` keys (1.2); portal and dev actions (1.3); DataProvider methods and entities (1.5); thumbnail codes; library as data (2.5).
- 2026-09-20 (prompt 0001): initial version.
- 2026-09-20 (changelog 0002): `npm run screenshots` flags (`PW_EXECUTABLE`, proxy), playwright pin.
- 2026-09-20 (changelog 0004): screenshot flags `--wait`, exact-text `--lang-toggle` example.
- 2026-09-20 (changelog 0005): `npm run thumbs` (1.4) and the `thumbs/manifest.json` contract (1.4b).
- 2026-09-20 (changelog 0003): static Business OS routes (1.1b) with the `?embed=1&screen=` contract, `hub.openPrototypePage`, `npm run copy:static`, build step, screenshot `--static` / `--lang-toggle` flags.
- 2026-09-21 (changelog 0012): no surface change; social intake documented, capture scripts kept in Slack session scratch, not in repo.
