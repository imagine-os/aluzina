# Surfaces: routes, scripts, actions, MCP / CLI / API

Every surface a machine (script, agent, voice controller, MCP client) can drive, recorded every pass (P-10). Update this file in the same turn as any change to a route, npm script, action, provider method or API. Last full pass: 2026-09-21 (changelog 0006).

## 1. What exists today

### 1.1 Route manifest (in the running app)

`apps/hub/src/app/manifest.ts` publishes `window.__aluzina = { routes, version }` on load. Each entry: `{ path, code, surface, status: 'built' | 'stub', shell: 'desktop' | 'phone' | 'bare', permission?, spec }` where `spec` is the full `PageSpec` (`apps/hub/src/specs/PageSpec.ts`: code, name, purpose, surface, navGroup?, layout, dataTables, roles, logic, components, actions, checkedAt, notes). Routing is HashRouter, so every page is `/#/<path>`. Routes come from `src/modules/*/index.ts` through the registry (D-014); `permission` is what `RequireRole` checks (D-015).

| path | code | surface | status | shell | permission | actions |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | HUB-01 | hub | built | bare | – | `hub.enterAs`, `hub.switchRole`, `hub.openSurface`, `hub.openPrototypePage`, `hub.setLang`, `hub.toggleTheme`, `hub.toggleDevMode` |
| `/founder` | A-01 | founder | stub | desktop | `projects.approve` | `founder.open` |
| `/ops` | O-01 | ops | stub | desktop | `schedule.manage` | `ops.open` |
| `/studio` | S-01 | studio | stub | desktop | `design.develop` | `studio.open` |
| `/brand` | G-01 | brand | stub | desktop | `brand.manage` | `brand.open` |
| `/dev/components` | D-02 | dev | built | desktop | `dev.tools` | `dev.searchComponents`, `dev.filterTier` |
| `/dev/specs` | D-03 | dev | built | desktop | `dev.tools` | `dev.openSpec`, `dev.filterSurface` |

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
| `aluzina.data` | JSON `{ seedVersion, tables }` | `MockProvider` (D-016): every entity table; removed and re-seeded by `reset()` or when `SEED_VERSION` changes |

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
| `founder.open` | A-01 | open the founder dashboard | `projects.approve` | – |
| `ops.open` | O-01 | open the operations dashboard | `schedule.manage` | – |
| `studio.open` | S-01 | open the studio dashboard | `design.develop` | – |
| `brand.open` | G-01 | open the brand dashboard | `brand.manage` | – |
| `dev.searchComponents` | D-02 | find the component {query} | `dev.tools` | `query: string` |
| `dev.filterTier` | D-02 | show only {tier} components | `dev.tools` | `tier: enum:all\|atom\|molecule\|organism\|template` |
| `dev.openSpec` | D-03 | show the spec of page {code} | `dev.tools` | `code: string` |
| `dev.filterSurface` | D-03 | show only {surface} pages | `dev.tools` | `surface: enum:all\|hub\|founder\|ops\|studio\|brand\|client\|dev\|docs\|manual\|public` |

Declared only: no actions bus runs them yet (section 2.1). Permissions per role: `apps/hub/src/auth/permissions.ts` (`docs/knowledge/roles-and-portals.md`).

### 1.4 npm scripts (the CLI today)

| script | what | flags |
| --- | --- | --- |
| `npm run dev` | Vite dev server for the hub, `http://localhost:5173/#/` | |
| `npm run build` | `npm run build -w @aluzina/hub` (= `tokens` + `tsc --noEmit` + `vite build` -> repo-root `dist/`) `&& node scripts/copy-static.mjs`; must be green before every push | |
| `npm run thumbs` | `node scripts/thumbnails.mjs`: serves `dist/` on `127.0.0.1:4180` (Node `http`), screenshots every hub-linked surface (incl. portal dashboards A-01 / O-01 / S-01 / G-01 and dev pages D-02 / D-03 through `?as=<role>`, section 1.1a) with Playwright Chromium (1280 x 800 -> 640 x 400 JPEG q80) into `dist/thumbs/<code>.jpg` and writes `dist/thumbs/manifest.json`; CI step after `npm run build`, never part of the build (D-011). Blocks mp4 / webm, never waits for `networkidle`, 45 s per page, failures write the placeholder tile and are recorded in the manifest (`source: "placeholder"`, `error`). Externals (P-00, D-06) are best effort. | `-- --dist=dist --port=4180 --only=HUB-01,BOS-01 --skip-external`; env `PW_EXECUTABLE` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE` (default `/opt/pw-browsers/chromium` when present), `HTTPS_PROXY` used only for the external captures |
| `npm run copy:static` | `node scripts/copy-static.mjs`: copies `apps/business-os/` (minus READMEs) into `dist/business-os/`, writes `dist/.nojekyll`; needs `dist/index.html` first | |
| `npm run preview` | serve `dist/` on :4173 | |
| `npm run typecheck` | `tsc --noEmit` in the hub | |
| `npm run tokens` | `apps/hub/src/design/tokens.ts` -> `apps/hub/src/styles/tokens.css` (`node --experimental-strip-types scripts/gen-tokens.mjs`) | |
| `npm run screenshots` | `node scripts/screenshots.mjs`: Playwright captures into `docs/screenshots/<CODE>/<lang>-<width>.jpg` + `routes.json` | `-- --base=<url> --out=docs/screenshots --code=HUB-01 --route=/ --shots=en-390,en-1280,en-3840,es-390`; `--static=business-os/` captures a static page instead of a hub route (BOS codes; `--wait=<selector>` defaults to `#dc-root`; `es-*` shots click the page's EN/ES toggle when `--lang-toggle=<selector>` is given, e.g. `--lang-toggle='text="EN"'`; values may contain `=`); env `PW_EXECUTABLE` (default `/opt/pw-browsers/chromium` when present), `HTTPS_PROXY` honoured for non-localhost bases; `playwright` pinned to 1.56.1 (Chromium 1194) |

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

`apps/hub/src/data/provider.ts`, mounted once by `DataContextProvider` in `App.tsx`; implementation today: `MockProvider` (`name: 'mock'`, localStorage `aluzina.data`). Every method is async so Supabase can replace it silently.

| method | signature | notes |
| --- | --- | --- |
| `list` | `list(entity, { where?, orderBy?, dir?, limit? })` | `where` is equality (arrays = "in"); returns copies |
| `get` | `get(entity, id)` | `null` when missing |
| `create` | `create(entity, data, id?)` | adds `id`, `created_at`, `updated_at`; emits `create` |
| `update` | `update(entity, id, patch)` | bumps `updated_at`; emits `update`; throws when missing |
| `remove` | `remove(entity, id)` | emits `remove` |
| `subscribe` | `subscribe(entity \| '*', cb) => unsubscribe` | `cb({ entity, kind: 'create' \| 'update' \| 'remove' \| 'reset', id })` |
| `reset` | `reset()` | drops local state, re-seeds, emits `reset` per entity |

Entities (`src/data/schema/index.ts`, all rows carry `id, created_at, updated_at`): `projects, tasks, meetings, suppliers, quotes, deliveries, payments, documents, references, materials, schedules, renderPacks, consistencyChecks, competitions, presentations, brandAssets, revisions, alerts`. Seeds: `src/data/seed/*.ts` (globbed, `SEED_VERSION` in `seed/index.ts`). React hooks: `useData()`, `useTable(entity, query)`, `useRow(entity, id)` (`src/data/DataContext.tsx`). Planned: `version` column and conflict handling (P-14), `CompanyOsProvider` stub (reference only), Supabase adapter.

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

Through the data provider seam (section 1.5): `subscribe` is the realtime hook, `feedback` becomes an entity (step 7 rest / 8).

### 2.5 Component library as data (D-017)

`apps/hub/src/design/library.ts` exposes every component's meta and example; `/#/dev/components` renders it. A JSON export of the library (name, tier, props, a11y, usages) for the builder tool and agents is planned.

## 3. Change log of this file

- 2026-09-21 (changelog 0006): seven routes in the manifest with `shell` / `permission`; `?as=<role>` contract (1.1a); `aluzina.session` and `aluzina.data` keys (1.2); portal and dev actions (1.3); DataProvider methods and entities (1.5); thumbnail codes; library as data (2.5).
- 2026-09-20 (prompt 0001): initial version.
- 2026-09-20 (changelog 0002): `npm run screenshots` flags (`PW_EXECUTABLE`, proxy), playwright pin.
- 2026-09-20 (changelog 0004): screenshot flags `--wait`, exact-text `--lang-toggle` example.
- 2026-09-20 (changelog 0005): `npm run thumbs` (1.4) and the `thumbs/manifest.json` contract (1.4b).
- 2026-09-20 (changelog 0003): static Business OS routes (1.1b) with the `?embed=1&screen=` contract, `hub.openPrototypePage`, `npm run copy:static`, build step, screenshot `--static` / `--lang-toggle` flags.
