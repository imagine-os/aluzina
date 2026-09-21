version: 0.4.0
date: 2026-09-21
prompt: 0003
intent: Foundation for the per-role portals so four module workers can build Founder, Operations, Studio and Brand in parallel without touching shared files: role and permission model, session with role switching, guarded routes, module registry with shells, mock data layer with realistic seeds, component library with live examples, spec tooling, hub Portals section, portal stubs.
decision: D-014, D-015, D-016, D-017
rejected: one Vite app per portal (four builds, four token copies, no shared session); role checks by comparing role names (locks pages to today's roster); committed thumbnails for the portal cards (D-011 already generates them); drag-and-drop Kanban (drag-only breaks P-03; explicit move buttons instead); a custom dropdown for the role switcher (a native select works with keyboard, touch, d-pad and voice for free)
files: apps/hub/src/auth/{roles,permissions,demoUsers}.ts, apps/hub/src/auth/{SessionProvider,RequireRole}.tsx (+ .css), apps/hub/src/dev/DevModeProvider.tsx (removed; dev mode lives in the session), apps/hub/src/specs/PageSpec.ts (Surface, navGroup, dataTables, shell, permission, nav, defineSpec validation, specCompleteness), apps/hub/src/app/{registry,manifest,navGroups}.ts, apps/hub/src/app/{App,shells,RoutesContext}.tsx, apps/hub/src/app/shells.css, apps/hub/src/data/{provider,MockProvider}.ts, apps/hub/src/data/DataContext.tsx, apps/hub/src/data/schema/{base,projects,operations,studio,brand,index}.ts, apps/hub/src/data/seed/{types,index,projects,operations,studio,brand}.ts, apps/hub/src/design/{cx,library,useFocusTrap}.ts, apps/hub/src/i18n/{core,format}.ts, apps/hub/src/components/atom/{Button,Badge,StatusPill,Input,Select,Textarea,Checkbox,Avatar,Skeleton}/*, apps/hub/src/components/molecule/{Card,StatTile,EmptyState,PageHeader,Tabs,SearchField,FilterBar,KeyValue}/*, apps/hub/src/components/organism/{DataTable,Kanban,Timeline,Calendar,Drawer,Modal,ApprovalQueue,RoleSwitcher}/*, apps/hub/src/components/template/PageStub/*, apps/hub/src/components/{atom/Placeholder,atom/Toast,atom/ToggleButton,molecule/SurfaceCard,organism/HubHeader}/*.example.tsx, apps/hub/src/components/molecule/SurfaceCard/{SurfaceCard.tsx,SurfaceCard.css,SurfaceCard.meta.ts} (onActivate, stub status), apps/hub/src/components/organism/HubHeader/{HubHeader.tsx,HubHeader.css,HubHeader.meta.ts}, apps/hub/src/modules/hub/{HubPage.tsx,HubPage.css,index.ts,specs.ts,strings.ts}, apps/hub/src/modules/{founder,ops,studio,brand}/{index.ts,specs.ts,strings.ts,*Home.tsx}, apps/hub/src/modules/dev/{index.ts,specs.ts,strings.ts,ComponentsPage.tsx,SpecsPage.tsx,dev.css}, apps/hub/src/modules/README.md, scripts/thumbnails.mjs (A-01, O-01, S-01, G-01, D-02, D-03 with `?as=`), package.json + apps/hub/package.json (0.4.0), docs/decisions.md (D-014..D-017), docs/build-plan.md (9a / 9b / 9c), docs/kanban.md, docs/reference/surfaces.md, docs/pages/{HUB-01,D-02,D-03}.md, docs/knowledge/roles-and-portals.md, docs/platform-principles.md (today lines), docs/README.md, docs/prompts/0003-role-portals.md, docs/changelog/0006-portal-foundation.md
codes: HUB-01, D-02, D-03, A-01, O-01, S-01, G-01
model: Fable 5.1

# 0006 - Portal foundation (build plan 9a)

## A. Auth and session (D-015)

`src/auth/roles.ts` (six role ids with code prefix, home path, surface), `permissions.ts` (41 permission strings, per-role grants, `hasPermission` with `*` and `<area>.*`, `rolesWith`), `demoUsers.ts` (Alejandra Guerra, Miguel, Sarai, Angélica, "Familia Restrepo" client, Dev; default `u-dev`), `SessionProvider` (`aluzina.session`; `switchUser`, `viewAs` gated by `session.viewAs`, `can`, dev mode moved here from the removed `DevModeProvider`; `?as=<role>` honoured on first load; `data-role` on `<html>`), `RequireRole` (real bilingual denied page with one "Switch to <role>" button per role that holds the permission plus "Back to hub"), `useCan`, `useDevMode` (same shape as before).

## B. Registry, shells, specs (D-014)

`RouteDef` gains `shell`, `permission`, `nav { labelKey, order, glyph }`; `PageSpec` gains `navGroup`, `dataTables` (replaces `data`); `defineSpec` validates required fields, code format and action ids at load; `specCompleteness()` scores nine checks. The registry dedupes paths (built beats stub) and exposes `navRoutesFor(surface)`; `RoutesProvider` hands routes to shells and dev pages without import cycles. `DesktopShell`: sticky top bar (brand, portal name, role badge, EN/ES, theme, dev mode, back to hub, avatar button that opens the user drawer with the `RoleSwitcher`), sidebar grouped by `navGroups.ts` order, under 768 px a hamburger drawer and a bottom nav (first four routes + "More"), skip link, `data-surface`; `PhoneShell` (30 rem frame, bottom nav) ready for the client app; `bare` for the hub. `App.tsx` wraps every route in `RequireRole` -> `Shell` -> element, then `DevTools`. The manifest carries `shell` and `permission`.

## C. Data (D-016)

`DataProvider` interface, `MockProvider` (localStorage `aluzina.data`, `SEED_VERSION` 1, synchronous emit after each write, `reset`), `applyQuery`, `useData / useTable / useRow`. Schema in four files (`projects`: Project, Task, Meeting, Alert; `operations`: Supplier, Quote, Delivery, Payment, Document; `studio`: Reference, Material, Schedule, RenderPack, ConsistencyCheck; `brand`: Competition, Presentation, BrandAsset, Revision). Seeds: 6 projects (Casa Laureles, HOY Wellness Center, Noam Residential, Honey Valley Lighting, Café Provenza, Oficinas Ruta N), 12 tasks with dependencies, 6 meetings, 8 suppliers, 8 quotes in 4 comparison groups, 5 deliveries, 7 payments (who owes what), 7 documents, 6 references, 8 materials, 5 schedules, 3 render packs, 3 consistency checks, 20 competition slots (three named projects, every date `null`), 4 presentations, 7 brand assets, 4 revisions, 6 alerts. Amounts in COP, Spanish names, fixed timestamps.

## D. Component library (D-017)

24 new components, each `<Name>.tsx + .css + .meta.ts + .example.tsx`: atoms Button, Badge, StatusPill (shared status vocabulary -> tone, labels `core.status.*`), Input, Select, Textarea, Checkbox, Avatar, Skeleton; molecules Card, StatTile, EmptyState, PageHeader, Tabs, SearchField, FilterBar, KeyValue; organisms DataTable (sortable, keyboard rows, row actions, stacked cards under 768), Kanban (move buttons, no drag), Timeline (month axis, today marker, dependency indicator), Calendar (month list view), Drawer, Modal (shared `useFocusTrap`: Tab cycle, Escape, focus return), ApprovalQueue, RoleSwitcher; template PageStub. Examples added for the five existing components. `src/design/library.ts` globs metas and examples; `SurfaceCard` gained `onActivate` (button variant) and a `stub` status; `HubHeader` now hosts the `RoleSwitcher`. `src/i18n/format.ts`: `formatCop`, `formatDate`, `formatDateTime`, `daysUntil`.

## E. Pages

- HUB-01: new **Portals** section (A-01, O-01, S-01, G-01 as stub cards that enter as the demo user, C-01 planned), surfaces grid without the old Customer / Staff cards, Dev tools card live at `#/dev/components` (D-02), role switcher in the header, actions `hub.enterAs` and `hub.switchRole`.
- D-02 `/#/dev/components`: 31 components with live example, props, a11y, usages, path; search + tier tabs.
- D-03 `/#/dev/specs`: stat tiles, filter bar, sortable table of every route with completeness, drawer with the full spec and actions.
- A-01 / O-01 / S-01 / G-01: `PageStub` dashboards (sections from the founder's roster) so the routes, guards, sidebars and thumbnails exist before the modules land.

## F. Tooling and docs

`scripts/thumbnails.mjs` captures the six new codes through `?as=<role>`; `src/modules/README.md` is the module contract for the parallel workers; surfaces.md records routes, the `?as=` contract, storage keys, actions and the provider methods; roles-and-portals.md carries the permission refinement.

## Verified

### Deploy and live site

- Pages workflow run [35548185005](https://github.com/imagine-os/aluzina/actions/runs/35548185005) on a5d0c37: `build` (incl. `npm run thumbs`) and `deploy` success.
- https://imagine-os.github.io/aluzina/ -> HTTP 200, `window.__aluzina.version` 0.4.0, 7 routes; the Portals section shows 5 cards with 4 real thumbnails; `thumbs/manifest.json` generated 2026-09-21T00:36:43Z with 15 items, all real captures (A-01, O-01, S-01, G-01, D-02, D-03 included, no placeholder tiles).
- Live: entering as Miguel lands on `#/ops` ("Operations dashboard"), `?as=dev#/dev/components` renders 31 components, no page errors.
- Live screenshots: `docs/screenshots/{HUB-01,A-01,O-01,S-01,G-01,D-02,D-03}/en-390.jpg`, `en-1280.jpg` with `routes.json` (14 captures; ES and 3840 captures of the new pages are a follow-up for the 9c pass).

### Local smoke (Playwright Chromium, dist served by `vite preview`)

390 and 1280: hub renders 5 portal cards (2 placeholders); entering each portal switches the session user, lands on the right path with the right `data-stub`, sidebar and bottom nav render; brand user on `/founder` gets the denied page and the "Switch to Founder" button lands on A-01; `?as=dev#/dev/components` renders 31 cards with 31 examples; Tabs ArrowRight moves selection; `/#/dev/specs` lists 7 rows, ArrowDown + Enter opens the drawer with focus inside, Escape closes and returns focus to the row; phone menu drawer and user menu work (switching to Sarai via the user menu lands on S-01); ES + dark render; no horizontal overflow at 390; no console errors or warnings. 3840: body 32 px, sidebar 576 px. Remaining sub-44 px hits are the 24 px checkbox box (its 44 px label row is the target) and the focusable tab panel (a region, not a control). Screenshots: coordinating session scratchpad `shots/foundation/`; live captures land in `docs/screenshots/` after the deploy.
