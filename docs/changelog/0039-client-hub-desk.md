version: 0.23.0 (from 0.22.1: new module `clienthub`, page W-05 on 5 routes, 11 new `clienthub.*` action ids; `Drawer` gains `size="lg"`; no entity, seed or `SEED_VERSION` change)
date: 2026-09-29
prompt: 0030
intent: Lay HOY's whole hub (website, member and teacher apps, staff and admin desktops, docs, dev tools) physically on ALUZINA mats by role, with the role figures seated, fitting ALUZINA's way as one of its clients, and read from a hub map the client publishes so every host can look into it its own way.
decision: D-108 (the hub map is the contract between hosts), D-109 (device kinds with image faces in the platform engine), D-110 (one mat per client role), D-111 (a lens = the same map, a different grouping and framing), D-112 (bundled snapshot fallback)
rejected: reading the client's repo or route registry directly (couples ALUZINA to HOY's code and build; the map is the published contract); iframes as faces (87 live apps on one desk); one mat per experience in the studio's lens (the prompt asks for "the designated users like we did for aluzina": people own mats); a hand-placed layout (the engine packs from the model, `desk:check` proves no overlaps); fetching with `no-store` (every visit a network round trip; the default cache plus 10 minutes in memory is fresh enough for a map regenerated per deploy).
files: apps/hub/src/modules/clienthub/{index.ts,specs.ts,strings.ts,hubMap.types.ts,hubMap.load.ts,registry.ts,lenses.ts,ClientHubPage.tsx,clienthub.css,hoy.hub-map.snapshot.json} (new), apps/hub/src/components/organism/Drawer/{Drawer.tsx,Drawer.css,Drawer.meta.ts} (`size="lg"`), apps/hub/src/desk/{types.ts (FACE_BUDGET, caption sizes),PageDesk.tsx,DeskObject.tsx,desk.css,useDesk.ts (home view exact)}, apps/hub/src/tenant/hubCards.data.ts, apps/hub/src/modules/hub/{specs.ts,strings.ts}, scripts/{desk-check.mjs,screenshots.mjs (`--mount`)}, tenant.json, package.json, apps/hub/package.json, docs/pages/W-05.md, docs/design/client-hub-desk.md, docs/tenant/hub-map-consumer.md, docs/reference/surfaces.md, docs/decisions.md, docs/kanban.md, docs/plan/plan.json, docs/build-plan.md, docs/README.md, apps/hub/src/modules/README.md, docs/screenshots/W-05/*
codes: W-05, HUB-01
model: Opus 5.5 (build), Fable 5.1 (architecture and plan)

# 0039 - W-05 client hub desk: the HOY hub on ALUZINA mats by role

## What the tester sees

`/#/founder/clients/hoy/hub` (and on ops / studio / brand / dev; sidebar Projects > "HOY hub", right after the Method desk; HUB-01 card "Clients · HOY hub desk"). Eight felt mats, outside-in: Customer (37 phones in four sub-mats: Book, Pay, Account, Sign in), Web · Public (a fanned stack of the whole site, then its 10 pages as tall pages), Teacher (the teacher app), Front desk (check-in, inbox, point of sale on screens), Coordinator (CRM), Finance, Admin (the dashboard in two halves and the operations manual as documents), Super admin (docs, knowledgebase, dev tools; the 9 testing tools with the Tools switch). Every mat seats its role's figure (the map's look and props, the role label on the nameplate, the demo first name: Juliana, Andrés, Camilo, Valentina, Laura, Mateo, Sofía). Every object's face is HOY's real capture, in Spanish or English by the "Screens in" switch and dark in the dark theme. On a 4K screen the desk opens at 188 %: every visible object at least 200 px tall, captions readable from across the room.

Selecting a screen opens the drawer: the large face, code, role, experience, device, route, status, roles allowed, what it is for, the actions it declares, Previous / Next along its sub-mat, **Open live** (the real HOY page in an iframe at its device size, signed in as that role through the map's embed pattern, removed on Close) and **Open in HoyOS ↗**. Selecting a figure shows the role and opens its home live.

## How it is built

- `hubMap.types.ts`: the contract verbatim (schema `hoy.hub-map/1`).
- `hubMap.load.ts`: `useHubMap(clientId)`: the bundled snapshot (a lazy chunk) renders first, the live map (default HTTP cache, 10 minutes in memory, stale-while-revalidate) replaces it; a failure keeps the snapshot, the toolbar pill says which one is shown and why.
- `registry.ts`: `CLIENT_HUBS.hoy` -> project `prj-hoy`, client `cl-hoy`, map URL, snapshot. **The snapshot to swap:** `apps/hub/src/modules/clienthub/hoy.hub-map.snapshot.json` (today a copy of HOY's generated `public/hub-map.json`, HOY 0.11.0, 87 pages).
- `lenses.ts`: `buildLens(map, lens, ctx)` -> `DeskModel` + entry per object + mat -> role; three builders (aluzina by role, between-gigs by what the gig ships, standalone as HOY's own hub); the switch between them is wired with D-16 in the next pass (`clienthub.setLens` answers "not wired yet" until then, D-047).
- `ClientHubPage.tsx`: `useDesk({ homeZoom })` + `DeskStage`, the header strip, the drawer, the live frame, 11 `clienthub.*` actions + `desk.focusMat / focusObject / openObject` registered (the camera verbs by `useDesk`).
- Engine follow-ups of 0037 found by this page: caption sizes up (phone 8.2, page 8.2, tablet / pages 9, screen chin 9.5 world px), the code never breaks inside a caption, the drawer caption capped at 15 px, `FACE_BUDGET` moved to `types.ts` (re-exported by `PageDesk`), the home view sets the floor zoom exactly (the tilt-aware fit shrank it) with the desk's corner at the stage's corner.
- `Drawer` gains `size="lg"` (56rem side panel) for the live desktop frame.

## Checks

`npm run build` green (tsc strict, Vite, `tenant:validate` 471 / 442 actions, `desk:check`: 8 models x 7 widths, 4767 placements, no overlaps). Measured on the production build (home view, EN): smallest visible object 47.7 x 79.9 px at 390, 49.0 x 84.8 at 1280, 116 x 201 at 3840; no horizontal page scroll at 390. `clienthub.open`, `clienthub.openLive` (embed URL `https://imagine-os.github.io/hoy/#/admin?as=admin&lang=en&theme=light&dev=0&live=0`), drawer Previous / Next and Close checked by script. Screenshots: `docs/screenshots/W-05/` (`en-1280`, `es-1280`, `en-3840`, `es-390`; the full matrix with the lens pass), captured with `screenshots.mjs --mount` serving HOY's files from its checkout (Chromium in the sandbox cannot reach github.io).

## Not wired yet

- The point-of-view switch (Tabs) and D-16 hub lenses: next pass.
