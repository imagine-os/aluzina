# Surfaces: routes, scripts, actions, MCP / CLI / API

Every surface a machine (script, agent, voice controller, MCP client) can drive, recorded every pass (P-10). Update this file in the same turn as any change to a route, npm script, action, provider method or API. Last full pass: 2026-09-21 (changelog 0009).

## 1. What exists today

### 1.1 Route manifest (in the running app)

`apps/hub/src/app/manifest.ts` publishes `window.__aluzina = { routes, version }` on load. Each entry: `{ path, code, surface, status: 'built' | 'stub', shell: 'desktop' | 'phone' | 'bare', permission?, spec }` where `spec` is the full `PageSpec` (`apps/hub/src/specs/PageSpec.ts`: code, name, purpose, surface, navGroup?, layout, dataTables, roles, logic, components, actions, checkedAt, notes). Routing is HashRouter, so every page is `/#/<path>`. Routes come from `src/modules/*/index.ts` through the registry (D-014); `permission` is what `RequireRole` checks (D-015).

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
| `/dev/components` | D-02 | dev | built | desktop | `dev.tools` | `dev.searchComponents`, `dev.filterTier` |
| `/dev/specs` | D-03 | dev | built | desktop | `dev.tools` | `dev.openSpec`, `dev.filterSurface` |
| `/dev/multiuser` | D-04 | dev | built | desktop | `dev.tools` | `dev.openAs`, `dev.resetData` |

75 routes, 680 declared action entries: hub 7, founder 144 (26 portal + 62 work + 56 spaces), ops 158 (40 + 62 + 56), studio 160 (42 + 62 + 56), brand 149 (31 + 62 + 56), dev 62 (6 over 3 pages + 56 spaces) (changelog 0009). The `work.*` set is 31 distinct ids declared on eight routes; the `spaces.*` set is 37 distinct ids declared on 30 routes (56 entries per surface). Every action id is `<module>.<verb>` with an intent phrase and, for the portals, a permission; the full list is `window.__aluzina.routes[].spec.actions` and the drawer on `/#/dev/specs`.

Consumers: `scripts/screenshots.mjs` (writes the manifest into `docs/screenshots/<CODE>/routes.json`), `/#/dev/specs` (D-03, same data through `RoutesContext`), `scripts/thumbnails.mjs` targets; future QA and WebMCP generation.

#### 1.1a Session by URL: `?as=<role>`

`SessionProvider` reads `as` from `location.search` (before the hash: `/?as=ops#/ops`) or from a query inside the hash (`/#/ops?as=ops`) **on first load only** and becomes that role's demo user (`founder | ops | studio | brand | client | dev`), clearing any `viewAs`. Unknown values are ignored. Used by `scripts/thumbnails.mjs` (portal and dev thumbnails), by QA scripts and for deep links; a later navigation that only changes the hash does not re-read it (reload to re-apply). The chosen user persists in `aluzina.session` like any switch.

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
| `aluzina.session` | JSON `{ userId, viewAs: role \| null, devMode }` | `SessionProvider` (`switchUser`, `viewAs`, `toggleDevMode`; actions `hub.enterAs`, `hub.switchRole`, `hub.toggleDevMode`); `userId` is a demo user id (`u-alejandra`, `u-miguel`, `u-sarai`, `u-angelica`, `u-client`, `u-dev`), default `u-dev` |
| `aluzina.devMode` | `on` \| `off` | mirror of `session.devMode` for the pre-paint script and older tooling |
| `aluzina.data` | JSON `{ seedVersion, tables }` | `MockProvider` (D-016): every entity table (29 since 0009: + `spaces`, `posts`, `filings`, `relations`, `tags`, `clients`, `deliverables`, `tools`); removed and re-seeded by `reset()` or when `SEED_VERSION` changes (4 since 0009) |
| `aluzina.views.<userId>` | JSON `{ views: SavedView[], last: { [scope]: ViewState } }` | Work views (D-025): named saved views and the last `{ view, filters, sort, groupBy }` per scope (`all` or a project id), per demo user |
| `aluzina.tabUser` (sessionStorage) | demo user id | `SessionProvider`: the `?as=` user of this tab, wins over `aluzina.session.userId` on reload so two tabs stay two people (D-04) |
| `aluzina.presence` | JSON `{ [tabId]: { tabId, userId, route, at } }` | `PresenceProvider` fallback when `BroadcastChannel` is unavailable (D-023) |

Cross-tab channels (D-023): `BroadcastChannel('aluzina-data')` carries `{ change: { entity, kind, id }, tabId, rows?: { [entity]: Row[] } }` after every `MockProvider` write; `BroadcastChannel('aluzina-presence')` carries `{ tabId, userId, route, at, bye? }` every 5 s (expiry 15 s). Pages never touch them; Supabase Realtime / Presence replace them behind `subscribe` and `usePresence()`.

Mirrored onto `<html>` as `lang`, `data-theme`, `data-dev`, `data-role` (effective role) (theme / lang / dev also applied pre-paint by the inline script in `apps/hub/index.html`).

### 1.3 Actions declared (P-05)

| id | page | intent | permission | params |
| --- | --- | --- | --- | --- |
| `hub.enterAs` | HUB-01 | open the {role} portal as its demo user | – | `role: enum:founder\|ops\|studio\|brand` |
| `hub.switchRole` | HUB-01 | view the system as {role} | – | `role: enum:founder\|ops\|studio\|brand\|client\|dev` |
| `hub.openSurface` | HUB-01 | open the {surface} | – | `surface: enum:business-os\|website\|docs\|manual\|dev` |
| `hub.openPrototypePage` | HUB-01 | open the prototype page {page} | – | `page: enum:home\|cyber-bridge\|cyber-bridge-deck\|image-generation-plan\|lod-ladder` |
| `hub.setLang` | HUB-01 | switch the language to {lang} | – | `lang: enum:en\|es` |
| `hub.toggleTheme` | HUB-01 | switch between light and dark | – | – |
| `hub.toggleDevMode` | HUB-01 | turn developer mode on or off | `dev.tools` | – |
| `founder.*` (26 entries) | A-01..A-07 | approve / request changes / comment on a project, move a project phase, set creative direction, mark a document final or sent, sign off a presentation, shortlist a quote, approve a material, mark a task done, new lead / quote / partnership / note (Placeholders) | `projects.approve`, `projects.write`, `quotes.review`, `proposals.write`, `clients.write`, `products.write`, `projects.read` | project / document / quote / task ids |
| `ops.*` (38 entries, 35 ids) | O-01..O-10 | acknowledge / resolve / reopen an alert, confirm / receive / delay a delivery, move a task, pause / activate a supplier, select / shortlist a quote, mark a payment paid or part paid, advance a document, new task / meeting / supplier / alert, request quote, format / export / send report (Placeholders) | `schedule.manage`, `tasks.manage`, `suppliers.manage`, `quotes.request`, `quotes.compare`, `deliveries.manage`, `payments.manage`, `documents.manage`, `alerts.manage`, `reports.write` | ids, dates, amounts |
| `studio.*` (42 entries) | S-01..S-09 | send a project to check, move a reference to a board, request sample / approve / reject a material, new version / mark final a plan, review / finalise a schedule, move a render pack, tick a check item, save notes, pass / report issues, new proposal / palette / pack / check and capture controls (Placeholders) | `design.develop`, `references.manage`, `materials.manage`, `plans.write`, `schedules.write`, `renders.brief`, `projects.check`, `measurements.write` | ids, text |
| `brand.*` (31 entries) | G-01..G-07 | edit a competition slot (name, organiser, category, submission date, project, folder, result) and advance its status, advance a presentation / revision / image set, mark an asset superseded or current, import list / open folder / request deck / upload / share / connect storage (Placeholders) | `brand.manage`, `competitions.manage`, `presentations.write`, `images.write`, `revisions.manage`, `assets.manage` | ids, text, date |
| `dev.searchComponents` | D-02 | find the component {query} | `dev.tools` | `query: string` |
| `dev.filterTier` | D-02 | show only {tier} components | `dev.tools` | `tier: enum:all\|atom\|molecule\|organism\|template` |
| `dev.openSpec` | D-03 | show the spec of page {code} | `dev.tools` | `code: string` |
| `dev.filterSurface` | D-03 | show only {surface} pages | `dev.tools` | `surface: enum:all\|hub\|founder\|ops\|studio\|brand\|client\|dev\|docs\|manual\|public` |
| `dev.openAs` | D-04 | open a new tab as {role} | `dev.tools` | `role: enum:founder\|ops\|studio\|brand` |
| `dev.resetData` | D-04 | reset the demo data to the seeds | `dev.tools` | – |
| `ops.openWork` | O-02, O-03 | open the schedule / tasks in the Work views | `schedule.manage` / `tasks.manage` | – |
| `spaces.*` (37 ids, 30 routes) | K-01..K-06 | select a space, expand / collapse, search, show archived, browse tree, create space / post, open post, filter by kind / tag / author, sort, edit description, archive, go to my role space; edit / save / pin / set status of a post, file in / remove from a space, set tags, add / remove a relation, open a related entity, comment, open link; focus the graph, set depth, toggle a kind, zoom in / out / fit, open a node; catalog tab, open template (Placeholder) / hub page / project; upload Slack export (Placeholder) | `spaces.read` (navigation, filters, comments), `spaces.write` (every write), `spaces.admin` (archive, upload) | space / post / relation / entity ids, enums (`kind`, `status`, `depth`, `tab`, `direction`), strings (`docs/pages/K-01.md`..`K-06.md`) |
| `work.*` (31 ids, 8 routes) | W-01, W-02 | switch view, search, filter, sort, group, save / apply / delete a view, add / open / rename / assign a task, set dates / status / priority / tags / description, complete, move, select, bulk update, add / remove dependency, add / tick subtask, comment, zoom, go to today, change month, collapse group, open project | `projects.read` (read and view state, comments) or `tasks.own.write` (every write; `tasks.manage` covers it) | task / person / section / project ids, enums (`view`, `status`, `priority`, `zoom`, `by`), dates, strings (`docs/pages/W-01.md`) |

Declared only: no actions bus runs them yet (section 2.1). Per-action rows for the portals live in each page doc (`docs/pages/<CODE>.md`, section Actions) and in the manifest. Permissions per role: `apps/hub/src/auth/permissions.ts` (`docs/knowledge/roles-and-portals.md`); `suppliers.read` added for studio and ops (0007); `spaces.read / write / admin` and `marketing.*` added, role `marketing` (0009, D-028).

### 1.4 npm scripts (the CLI today)

| script | what | flags |
| --- | --- | --- |
| `npm run dev` | Vite dev server for the hub, `http://localhost:5173/#/` | |
| `npm run build` | `npm run build -w @aluzina/hub` (= `tokens` + `tsc --noEmit` + `vite build` -> repo-root `dist/`) `&& node scripts/copy-static.mjs`; must be green before every push | |
| `npm run thumbs` | `node scripts/thumbnails.mjs`: serves `dist/` on `127.0.0.1:4180` (Node `http`), screenshots every hub-linked surface (incl. portal dashboards A-01 / O-01 / S-01 / G-01 and dev pages D-02 / D-03 through `?as=<role>`, section 1.1a) with Playwright Chromium (1280 x 800 -> 640 x 400 JPEG q80) into `dist/thumbs/<code>.jpg` and writes `dist/thumbs/manifest.json`; CI step after `npm run build`, never part of the build (D-011). Blocks mp4 / webm, never waits for `networkidle`, 45 s per page (the hub's own wait for its lazy thumbnails is bounded to 8 s), failures write the placeholder tile and are recorded in the manifest (`source: "placeholder"`, `error`). Externals (P-00, D-06) are best effort. | `-- --dist=dist --port=4180 --only=HUB-01,BOS-01 --skip-external`; env `PW_EXECUTABLE` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE` (default `/opt/pw-browsers/chromium` when present), `HTTPS_PROXY` used only for the external captures |
| `npm run copy:static` | `node scripts/copy-static.mjs`: copies `apps/business-os/` (minus READMEs) into `dist/business-os/`, writes `dist/.nojekyll`; needs `dist/index.html` first | |
| `npm run preview` | serve `dist/` on :4173 | |
| `npm run typecheck` | `tsc --noEmit` in the hub | |
| `npm run tokens` | `apps/hub/src/design/tokens.ts` -> `apps/hub/src/styles/tokens.css` (`node --experimental-strip-types scripts/gen-tokens.mjs`) | |
| `npm run screenshots` | `node scripts/screenshots.mjs`: Playwright captures into `docs/screenshots/<CODE>/<lang>-<width>.jpg` + `routes.json` | `-- --base=<url> --out=docs/screenshots --code=HUB-01 --route=/ --shots=en-390,en-1280,en-3840,es-390`; `--as=<role>` seeds `aluzina.session` with that role's demo user before load (portal pages); `--settle=<ms>` waits after the selector (Work views: 800); `--static=business-os/` captures a static page instead of a hub route (BOS codes; `--wait=<selector>` defaults to `#dc-root`; `es-*` shots click the page's EN/ES toggle when `--lang-toggle=<selector>` is given, e.g. `--lang-toggle='text="EN"'`; values may contain `=`); env `PW_EXECUTABLE` (default `/opt/pw-browsers/chromium` when present), `HTTPS_PROXY` honoured for non-localhost bases; `playwright` pinned to 1.56.1 (Chromium 1194) |

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

`code` is the page code the card carries; `path` is relative to the site root; `source` is the URL that was captured (local `127.0.0.1` URLs mean "from this build") or `placeholder` when the tile was written instead; `error` is present only for placeholders. Codes today: `BOS-01..06`, `A-01`, `O-01`, `S-01`, `G-01`, `D-02`, `D-03`, `P-00`, `D-06`, `HUB-01`. The hub reads `./thumbs/<code>.jpg?v=<buildId>` directly (`SurfaceCard` `image` prop) and does not depend on the manifest; a missing file renders the bilingual tile (`data-thumb="placeholder"`).

### 1.5 Data provider (D-016)

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

Entities (`src/data/schema/index.ts`, all rows carry `id, created_at, updated_at` and optional `updated_by`): `projects, sections, tasks (sectionId, description, createdById, tags, subtasks, completedAt, order, startDate, dueDate, dependsOn), comments, activity, meetings, suppliers, quotes, deliveries, payments, documents, references, materials, schedules, renderPacks, consistencyChecks, competitions, presentations, brandAssets, revisions, alerts` (21). Seeds: `src/data/seed/*.ts` (globbed, `SEED_VERSION` 3 in `seed/index.ts`; `work.ts` adds the project-management rows). Deferred entities and fields: D-020 (rest). React hooks: `useData()`, `useTable(entity, query)`, `useRow(entity, id)` (`src/data/DataContext.tsx`); Work views: `useWork(projectId)` (`src/work/useWork.ts`), presence: `usePresence()` (`src/presence/PresenceProvider.tsx`). Planned: `version` column and merge UI (P-14, replaces D-024), `CompanyOsProvider` stub (reference only), Supabase adapter with Realtime and Presence behind the same seams.

### 1.6 HTTP API

**None.** Static site on GitHub Pages.

### 1.7 MCP / WebMCP

**None yet.** See section 2.

## 2. Planned

### 2.1 Actions manifest -> WebMCP tools (P-05)

Pages register `run(id, params)` handlers on an actions bus while mounted; `/#/dev/actions` lists every action with page, permission and whether a handler is live; WebMCP tools are generated one per action (`name = id`, `description = intent`, `inputSchema` from `params`), permission-checked through `can()`. Voice control speaks the same intents.

### 2.2 CLI

An `aluzina` CLI wrapping the scripts and, later, the actions bus (`aluzina screenshots`, `aluzina qa --codes=…`, `aluzina actions list`). The npm scripts are the CLI until then.

### 2.3 Business OS routes in the manifest

`dist/business-os/` is live (section 1.1b); its screens join `window.__aluzina` with `PageSpec`s and actions when it is modularised (step 3).

### 2.4 Realtime / presence (P-14), annotations (P-08)

Realtime and presence exist as the mock seam since 0008 (D-023): `subscribe` already fires for other tabs' writes and `usePresence()` lists who is here. Supabase Realtime (`postgres_changes` -> `subscribe` events) and Supabase Presence (-> `usePresence()`) replace the two BroadcastChannels without touching pages. Annotations: `feedback` becomes an entity (or reuses `comments` with `kind`), step 7 rest.

### 2.5 Component library as data (D-017)

`apps/hub/src/design/library.ts` exposes every component's meta and example; `/#/dev/components` renders it. A JSON export of the library (name, tier, props, a11y, usages) for the builder tool and agents is planned.

## 3. Change log of this file

- 2026-09-21 (changelog 0008): W-01 / W-02 on four surfaces and D-04 in the manifest (45 routes, 400 action entries, 1.1); `aluzina.views.<userId>`, `aluzina.tabUser`, `aluzina.presence` and the two BroadcastChannels (1.2); `work.*`, `dev.openAs`, `dev.resetData`, `ops.openWork` (1.3); `--as` / `--settle` screenshot flags (1.4); `update(…, { basedOn })`, `onConflict`, `setActor`, `sections` / `comments` / `activity`, `SEED_VERSION` 3, `useWork`, `usePresence` (1.5); realtime seam status (2.4).
- 2026-09-21 (changelog 0007): 33 portal routes in the manifest (A-01..A-07, O-01..O-10, S-01..S-09, G-01..G-07), 148 actions summarised per module (1.3), `suppliers.read`, `tasks.startDate` and `SEED_VERSION` 2 (1.5), bounded hub image wait in `npm run thumbs` (1.4).
- 2026-09-21 (changelog 0006): seven routes in the manifest with `shell` / `permission`; `?as=<role>` contract (1.1a); `aluzina.session` and `aluzina.data` keys (1.2); portal and dev actions (1.3); DataProvider methods and entities (1.5); thumbnail codes; library as data (2.5).
- 2026-09-20 (prompt 0001): initial version.
- 2026-09-20 (changelog 0002): `npm run screenshots` flags (`PW_EXECUTABLE`, proxy), playwright pin.
- 2026-09-20 (changelog 0004): screenshot flags `--wait`, exact-text `--lang-toggle` example.
- 2026-09-20 (changelog 0005): `npm run thumbs` (1.4) and the `thumbs/manifest.json` contract (1.4b).
- 2026-09-20 (changelog 0003): static Business OS routes (1.1b) with the `?embed=1&screen=` contract, `hub.openPrototypePage`, `npm run copy:static`, build step, screenshot `--static` / `--lang-toggle` flags.
