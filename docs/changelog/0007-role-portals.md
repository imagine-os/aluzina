version: 0.5.0
date: 2026-09-21
prompt: 0003
intent: The four role portals are built: Founder A-01..A-07, Operations O-01..O-10, Studio S-01..S-09, Brand G-01..G-07, one module each, replacing the 0006 stubs; the shared defects every module reported are fixed once in the library (Placeholder wrapper mode, tooltip clamp, StatTile numbers); two cheap shared requests are done (studio reads suppliers, tasks.startDate); the rest is deferred with owners.
decision: D-018, D-019, D-020
rejected: renumbering O-10 into the O-01..O-09 range (reports is its own roster line; the range is extended instead); a per-module CSS override for the Placeholder tooltip (fixed in the atom, the ops / studio workarounds removed); new entities in this pass (clients, goals, partnerships, products, comments, scheduleItems, measurements, followUps, comparisonGroups, images: deferred, D-020); drag-and-drop anywhere (all boards move with buttons)
files: apps/hub/src/modules/founder/* (13 files), apps/hub/src/modules/ops/* (15), apps/hub/src/modules/studio/* (14), apps/hub/src/modules/brand/* (12), apps/hub/src/components/atom/Placeholder/{Placeholder.tsx,Placeholder.css,Placeholder.meta.ts,Placeholder.example.tsx}, apps/hub/src/components/molecule/StatTile/{StatTile.css,StatTile.meta.ts}, apps/hub/src/components/organism/Timeline/{Timeline.css,Timeline.meta.ts}, apps/hub/src/app/App.tsx (router future flags), apps/hub/src/auth/permissions.ts (suppliers.read), apps/hub/src/data/schema/projects.ts (tasks.startDate), apps/hub/src/data/seed/{projects,index}.ts (SEED_VERSION 2), scripts/thumbnails.mjs (bounded image wait), apps/hub/src/modules/README.md, package.json + apps/hub/package.json (0.5.0), docs/pages/{A-01..A-07,O-01..O-10,S-01..S-09,G-01..G-07}.md, docs/decisions.md (D-018..D-020), docs/build-plan.md, docs/kanban.md, docs/reference/surfaces.md, docs/knowledge/roles-and-portals.md, docs/README.md, docs/prompts/0003-role-portals.md, docs/changelog/0007-role-portals.md (replaces docs/changelog/_pending/{founder,ops,studio,brand}.md)
codes: A-01, A-02, A-03, A-04, A-05, A-06, A-07, O-01, O-02, O-03, O-04, O-05, O-06, O-07, O-08, O-09, O-10, S-01, S-02, S-03, S-04, S-05, S-06, S-07, S-08, S-09, G-01, G-02, G-03, G-04, G-05, G-06, G-07, HUB-01
model: Opus 5 (the four portal modules, build plan 9b, one worker each in parallel); Fable 5.1 (foundation 0006, integration 9c: library fixes, schema, docs, QA, deploy)

# 0007 - Role portals (build plan 9b + 9c)

Four module workers built one portal each against the 0006 foundation without touching shared files; this pass integrates them. 36 routes are now registered (1 hub, 33 portal pages, 2 dev pages), all `built`, 148 actions declared. Every line of the founder's roster (`docs/knowledge/team.md`) has a page.

## A. Founder portal `A-01..A-07` (Alejandra Guerra, `?as=founder`)

| Code | Path | Page | Guard |
| --- | --- | --- | --- |
| A-01 | `/founder` | Dashboard: approvals waiting, this week, pipeline tiles, alerts (read-only, Miguel's) | `projects.approve` |
| A-02 | `/founder/approvals` | Approvals queue: approve / request changes / comment | `projects.approve` |
| A-03 | `/founder/pipeline` | Pipeline Kanban by phase, project drawer (creative direction set) | `projects.read` |
| A-04 | `/founder/proposals` | Quotes and proposals: client quotes, graphic proposals, project PDFs (three tabs) | `quotes.review` |
| A-05 | `/founder/products` | Products and partnerships (Honey Valley materials, packs, strategic meetings) | `products.write` |
| A-06 | `/founder/clients` | Clients and negotiations (derived from projects, drawer per client) | `projects.read` |
| A-07 | `/founder/team` | Team overview: tasks by role, alerts, vision and growth (Placeholder) | `projects.read` |

Real writes: approve -> `projects.approval = approved` and every alert on that project resolved; request changes -> `changes-requested` + a high-priority task for the lead designer; comment -> a task carrying the note (no comments entity yet); Kanban move -> `projects.phase`; creative direction -> `set`; documents / presentations / quotes status; materials approve; founder tasks done. Placeholders: new lead, new client quote, new partnership, collection roadmap, log a client note, vision and growth. Strings: 220 `founder.*` keys, EN + ES complete. 26 actions.

## B. Operations portal `O-01..O-10` (Miguel, `?as=ops`)

| Code | Path | Page | Guard |
| --- | --- | --- | --- |
| O-01 | `/ops` | Dashboard: alerts, deliveries, next meetings, tasks, payments tiles | `schedule.manage` |
| O-02 | `/ops/schedule` | Project schedule: Timeline of tasks with dependencies + month Calendar | `schedule.manage` |
| O-03 | `/ops/tasks` | Pending tasks board (move writes status) | `tasks.manage` |
| O-04 | `/ops/suppliers` | Suppliers and follow-ups (directory + per-supplier drawer) | `suppliers.manage` |
| O-05 | `/ops/quotes` | Quotes and comparisons per comparison group (best price / fastest / spread, one winner) | `quotes.compare` |
| O-06 | `/ops/deliveries` | Deliveries and dates (confirm, received, delayed) | `deliveries.manage` |
| O-07 | `/ops/payments` | Payments and accounts: in vs out, overdue, outstanding per row, mark / part paid | `payments.manage` |
| O-08 | `/ops/documents` | Administrative documents (status flow) | `documents.manage` |
| O-09 | `/ops/alerts` | Alerts before urgent: open / acknowledged / resolved with lead-time badge | `alerts.manage` |
| O-10 | `/ops/reports` | Reports: live figures (layout / export / send are Placeholders) | `reports.write` |

Real writes: alerts acknowledge / resolve / reopen; deliveries confirm (modal with date) / received / delayed; tasks status; suppliers pause / activate; quotes select (winner `selected`, rest of the group `rejected`) / shortlist; payments mark paid / part payment; documents draft -> final -> sent -> signed. Overdue is computed from `dueDate`, never trusted from the stored status. Placeholders: new task, schedule a meeting, add supplier, save follow-up note, request quote, upload / open document, new alert, format / export / send report. Strings: 250 `ops.*` keys, EN + ES complete. 38 action entries (35 distinct ids). The range grows to O-10 (D-018): reports is its own roster line.

## C. Studio portal `S-01..S-09` (Sarai, `?as=studio`)

| Code | Path | Page | Guard |
| --- | --- | --- | --- |
| S-01 | `/studio` | Dashboard: development monitoring per project, checks, packs, tasks (read) | `design.develop` |
| S-02 | `/studio/projects` | Projects and proposals: phase, creative direction (read), approval, send to check | `design.develop` |
| S-03 | `/studio/references` | References and mood boards by board (move between boards) | `references.manage` |
| S-04 | `/studio/materials` | Material palettes: request sample / approve / reject | `materials.manage` |
| S-05 | `/studio/plans` | Plans and design documentation: new version, mark final | `plans.write` |
| S-06 | `/studio/schedules` | Furniture, material and element schedules: review / final | `schedules.write` |
| S-07 | `/studio/packs` | Render and supplier packs board | `renders.brief` |
| S-08 | `/studio/checks` | Consistency check: tick items, notes, pass (-> project `awaiting-founder`) / issues (-> `in-check`) | `projects.check` |
| S-09 | `/studio/measurements` | Measurements and requirements (counts real, capture controls Placeholders) | `measurements.write` |

The studio hand-off is one write: passing a check moves the project to the founder's queue. Placeholders: new proposal, request creative direction, ask ops to reschedule, add reference / mood board / image, new palette, upload drawing / open file, new schedule / open item list, new pack / attach contents, new check / add item, all S-09 capture controls. Strings: 214 `studio.*` keys, EN + ES complete. 42 actions.

## D. Brand portal `G-01..G-07` (Angélica, `?as=brand`)

| Code | Path | Page | Guard |
| --- | --- | --- | --- |
| G-01 | `/brand` | Dashboard: competitions tile ("0 with a date, 20 unknown"), deadlines, queues, alerts (read) | `brand.manage` |
| G-02 | `/brand/competitions` | Competitions 2027: 20 slots as list + calendar, per-slot editor (nulls stay unknown), status flow | `competitions.manage` |
| G-03 | `/brand/presentations` | Sales presentations: requested -> drafting -> review -> final | `presentations.write` |
| G-04 | `/brand/identity` | Brand identity and assets by kind, superseded marked "do not use" | `brand.manage` |
| G-05 | `/brand/images` | Images for clients (revisions of kind image) | `images.write` |
| G-06 | `/brand/revisions` | Graphic revisions board | `revisions.manage` |
| G-07 | `/brand/assets` | Asset library organization: folder map derived from paths | `assets.manage` |

Real writes: every competition field from the G-02 drawer (blanks written back as `null`) and its status flow; presentations, brand assets, revisions status. Placeholders: import competition list, open folder, request deck, upload version, open manual, share with client, image thumbnails, new folder, connect storage, upload / rename / move. Strings: 205 `brand.*` keys, EN + ES complete. 31 actions.

## E. Library and shared fixes (Fable 5.1)

- **`Placeholder` wrapper mode (D-019).** Every module wrapped a `Button` in `Placeholder`, which rendered `button > button` (React `validateDOMNesting`, a second nameless tab stop). `Placeholder` now detects a control child (library `Button`, `<button>`, `<a>`) or a `bare` prop and renders a `<span class="placeholder placeholder--bare">` that clones the child with the toast handler and `aria-describedby`; plain content still gets the real button. Zero nested buttons across 36 routes.
- **Tooltip clamp.** `.placeholder__tip` was `visibility: hidden` but laid out and centred, widening `scrollWidth` 40-90 px at >= 1280 on eleven pages. It is now `display: none` until hover / focus / focus-within and anchored to the trigger's end edge; `scrollWidth === clientWidth` on every route at 390 and 1280. The scoped workarounds in `ops.css` and `studio.css` are removed.
- **`StatTile` numbers.** `overflow-wrap: anywhere` split `COP 60,500,000`; the value is now `nowrap`, sized with a container query (`clamp(1.25rem, 11cqi, 2rem)`), ellipsis as last resort. The `ops.css` override is removed.
- **`Timeline` bars** that are buttons fill the 44 px track and are at least 44 px wide (the smoke test found 28 px bars on O-02).
- **Router future flags** (`v7_startTransition`, `v7_relativeSplatPath`) set on `HashRouter`: no more first-load warnings.
- **`suppliers.read`** permission, granted to `studio` and `ops` (the studio's S-04 names suppliers). **`tasks.startDate`** (nullable) in the schema and all 12 seeded tasks; O-02 uses it when present and derives otherwise; founder task creation writes `null`. `SEED_VERSION` 2 re-seeds existing browsers.
- **`scripts/thumbnails.mjs`**: the hub's "wait for every image" is bounded to 8 s (lazy images below the fold never start loading and hung the capture at 45 s).

## F. Deferred shared requests (D-020)

Entities `clients`, `goals`, `partnerships`, `products`, `comments` / annotations (founder); `followUps`, `payments.supplierId`, `comparisonGroups`, alert generation from due dates, report templates (ops); `scheduleItems`, `measurements`, `materials.imageUrl` + `references.imageUrl` seeds, more `plan` / `spec` document seeds, `tasks.own.write` (studio); `images` entity / storage + `imageUrl` on revisions and brand assets, a shared "request" flow into Angélica's queue, competition seed rows when the 2027 list arrives (brand). Also: code-split the bundle per module (590 kB single chunk today, Vite warning). All in `docs/kanban.md` with owners.

## Verified

- `npx tsc --noEmit` clean; `npm run build` green (44 kB CSS, 590 kB JS).
- Local `npm run thumbs --only=A-01,O-01,S-01,G-01,D-02,D-03,HUB-01`: seven real captures through `?as=<role>`, no placeholder tiles.
- Playwright smoke over `vite preview` (Chromium, per-page 30 s timeouts): hub -> enter as each of the four roles lands on its dashboard with sidebars of 7 / 10 / 9 / 7 entries; all 35 non-hub routes at 390 and 1280 render their `h1`, `scrollWidth === clientWidth`, no console errors or warnings, no nested buttons; ES toggle on each dashboard shows the Spanish title with zero missing-key markers. Manifest: 36 routes, 0 stubs, 0 routes without actions.
- Pages workflow run [35550298235](https://github.com/imagine-os/aluzina/actions/runs/35550298235) on ae28fca: `build` (incl. `npm run thumbs`) and `deploy` success.
- Live (Playwright over the proxy): https://imagine-os.github.io/aluzina/ HTTP 200, `__aluzina.version` 0.5.0, 36 routes, 0 stubs; Portals section with 4 real thumbnails; `thumbs/manifest.json` generated 2026-09-21T01:16:34Z, 15 items, no errors, A-01 / O-01 / S-01 / G-01 real captures; `?as=founder#/founder`, `?as=ops#/ops`, `?as=studio#/studio`, `?as=brand#/brand` render live with sidebars of 7 / 10 / 9 / 7 entries, `scrollWidth === clientWidth`, no console errors.
- Live screenshots: 70 captures from the deployed site, `docs/screenshots/<CODE>/en-390.jpg` + `en-1280.jpg` for all 33 portal pages plus `es-1280.jpg` for A-01 / O-01 / S-01 / G-01, each folder with `routes.json` (bounded script, 0 failures).
