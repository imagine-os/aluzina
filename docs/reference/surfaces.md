# Surfaces: routes, scripts, actions, MCP / CLI / API

Every surface a machine (script, agent, voice controller, MCP client) can drive, recorded every pass (P-10). Update this file in the same turn as any change to a route, npm script, action, provider method or API. Last full pass: 2026-09-20 (changelog 0003).

## 1. What exists today

### 1.1 Route manifest (in the running app)

`apps/hub/src/app/manifest.ts` publishes `window.__aluzina = { routes, version }` on load. Each entry: `{ path, code, surface, status: 'built' | 'stub', spec }` where `spec` is the full `PageSpec` (`apps/hub/src/specs/PageSpec.ts`: code, name, purpose, surface, layout, data, roles, logic, components, actions, checkedAt, notes). Routing is HashRouter, so every page is `/#/<path>`.

| path | code | surface | status | actions |
| --- | --- | --- | --- | --- |
| `/` | HUB-01 | hub | built | `hub.openSurface`, `hub.openPrototypePage`, `hub.setLang`, `hub.toggleTheme`, `hub.toggleDevMode` |

Consumers: `scripts/screenshots.mjs` (writes the manifest into `docs/screenshots/<CODE>/routes.json`); future QA, spec pages and WebMCP generation.

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
| `aluzina.devMode` | `on` \| `off` | `DevModeProvider` (action `hub.toggleDevMode`) |

Mirrored onto `<html>` as `lang`, `data-theme`, `data-dev` (also applied pre-paint by the inline script in `apps/hub/index.html`).

### 1.3 Actions declared (P-05)

| id | page | intent | permission | params |
| --- | --- | --- | --- | --- |
| `hub.openSurface` | HUB-01 | open the {surface} | – | `surface: enum:business-os\|website\|customer\|staff\|docs\|manual\|dev` |
| `hub.openPrototypePage` | HUB-01 | open the prototype page {page} | – | `page: enum:home\|cyber-bridge\|cyber-bridge-deck\|image-generation-plan\|lod-ladder` |
| `hub.setLang` | HUB-01 | switch the language to {lang} | – | `lang: enum:en\|es` |
| `hub.toggleTheme` | HUB-01 | switch between light and dark | – | – |
| `hub.toggleDevMode` | HUB-01 | turn developer mode on or off | `dev.tools` | – |

Declared only: no actions bus runs them yet (section 2.1).

### 1.4 npm scripts (the CLI today)

| script | what | flags |
| --- | --- | --- |
| `npm run dev` | Vite dev server for the hub, `http://localhost:5173/#/` | |
| `npm run build` | `npm run build -w @aluzina/hub` (= `tokens` + `tsc --noEmit` + `vite build` -> repo-root `dist/`) `&& node scripts/copy-static.mjs`; must be green before every push | |
| `npm run copy:static` | `node scripts/copy-static.mjs`: copies `apps/business-os/` (minus READMEs) into `dist/business-os/`, writes `dist/.nojekyll`; needs `dist/index.html` first | |
| `npm run preview` | serve `dist/` on :4173 | |
| `npm run typecheck` | `tsc --noEmit` in the hub | |
| `npm run tokens` | `apps/hub/src/design/tokens.ts` -> `apps/hub/src/styles/tokens.css` (`node --experimental-strip-types scripts/gen-tokens.mjs`) | |
| `npm run screenshots` | `node scripts/screenshots.mjs`: Playwright captures into `docs/screenshots/<CODE>/<lang>-<width>.jpg` + `routes.json` | `-- --base=<url> --out=docs/screenshots --code=HUB-01 --route=/ --shots=en-390,en-1280,en-3840,es-390`; `--static=business-os/` captures a static page instead of a hub route (BOS codes; `--wait=<selector>` defaults to `#dc-root`; `es-*` shots click the page's EN/ES toggle when `--lang-toggle=<selector>` is given, e.g. `--lang-toggle='text="EN"'`; values may contain `=`); env `PW_EXECUTABLE` (default `/opt/pw-browsers/chromium` when present), `HTTPS_PROXY` honoured for non-localhost bases; `playwright` pinned to 1.56.1 (Chromium 1194) |

### 1.5 Data provider

**None yet.** Step 7 adds `DataProvider` (`list / get / insert / update / remove / subscribe`), `MockProvider`, a `CompanyOsProvider` stub (reference only) and later Supabase.

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

Through the data provider seam (step 7 / 8).

## 3. Change log of this file

- 2026-09-20 (prompt 0001): initial version.
- 2026-09-20 (changelog 0002): `npm run screenshots` flags (`PW_EXECUTABLE`, proxy), playwright pin.
- 2026-09-20 (changelog 0004): screenshot flags `--wait`, exact-text `--lang-toggle` example.
- 2026-09-20 (changelog 0003): static Business OS routes (1.1b) with the `?embed=1&screen=` contract, `hub.openPrototypePage`, `npm run copy:static`, build step, screenshot `--static` / `--lang-toggle` flags.
