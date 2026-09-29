version: 0.22.0 (from 0.21.0: the desk engine moves to the platform layer `apps/hub/src/desk/` and the DesktopShell mounts a page desk above every portal page; 11 shared `desk.*` actions appended to each of the 83 portal routes, 4 new ids on W-04; no route, entity, seed or `SEED_VERSION` change)
date: 2026-09-29
prompt: 0029
intent: Give every page of the four portals a desk of its own on top of the page (the old page stays below), make the objects' kinds and abilities clear, make mouse, trackpad and touch navigation feel right, and let the desk go full screen or change size.
decision: D-106 (the desk is a platform layer mounted by the DesktopShell on every portal route; the default desk is derived from `spec.dataTables` by rule tables; modules override by page code; wheel pans and pinch / ctrl-wheel zooms by default with a persisted per-person switch; the height persists per page)
rejected: hand-building a desk per page (50+ pages, drifts from the data); replacing the pages with desks (Justin: "in order to not lose old stuff ... lower on the page"); wheel-zoom as the default (fights two-finger trackpad scrolling, the most common input on the team's laptops); one global height setting (a dashboard and a list page want different heights); a new Tooltip / Popover library component this pass (the desk's tooltip and panels live in the engine; requested for the library); virtualising with IntersectionObserver (the caps already keep every desk under 200 faces)
files: apps/hub/src/desk/{types.ts,layout.ts,people.ts,fields.ts,entities.ts,strings.ts,actions.ts,useDesk.ts,DeskStage.tsx,PageDesk.tsx,index.ts} (new), apps/hub/src/desk/{DeskObject.tsx,DeskPerson.tsx,desk.css} (moved from modules/desk, extended), apps/hub/src/modules/desk/{DeskPage.tsx,model.ts,deskFlow.ts,deskPeople.ts,specs.ts,strings.ts,index.ts} (now a client of the engine), apps/hub/src/modules/desk/playbookDesk.ts (new), apps/hub/src/app/{shells.tsx,registry.ts}, apps/hub/src/specs/PageSpec.ts (`RouteDef.desk`, `RouteDeskOverride`, `DeskBuildContext`), apps/hub/src/components/organism/Drawer/Drawer.tsx (portals into the fullscreen element when there is one), apps/hub/src/design/env.ts (`useMediaQuery`), scripts/tenant-validate.mjs (`actions.platformDeclarations`), tenant.json + tenant.schema.json, apps/hub/src/modules/README.md ("Page desks"), docs/design/desk-system.md (new), docs/pages/W-04.md, docs/screenshots/W-04/{en-390,en-1280,en-3840,es-1280,en-1280-dark}.jpg (recaptured) + {en-1280-fullscreen,en-1280-legend}.jpg (new), docs/screenshots/{A-08,O-12,S-01,W-01}/en-1280-desk.jpg (new), docs/prompts/0029-desks-on-every-page.md, docs/changelog/0036-desk-system.md, docs/decisions.md (D-106), docs/reference/surfaces.md, docs/plan/plan.json (dk-04), docs/build-plan.md (row 17), docs/kanban.md (dk-04), docs/README.md, package.json + apps/hub/package.json (version)
codes: W-04, A-01, A-02, A-03, A-04, A-05, A-06, A-07, A-08, A-09, G-01, G-02, G-03, G-04, G-05, G-06, G-07, G-08, G-09, K-01, K-02, K-03, K-04, K-05, K-06, O-01, O-02, O-03, O-04, O-05, O-06, O-07, O-08, O-09, O-10, O-11, O-12, O-13, S-01, S-02, S-03, S-04, S-05, S-06, S-07, S-08, S-09, S-10, S-11, S-12, S-13, W-01, W-02, W-03
model: Opus 5.5 (build), Fable 5.1 (architecture and brief)

# 0036 - The desk system: a desk on every portal page

## What moved to `apps/hub/src/desk/` (platform, not a module)

- `types.ts`: the model (desk -> mats -> sub-mats -> objects, people, light tiles), the square grid and `GEOMETRY` per object kind, new kind `stack` (the "+N more" pile), `DeskItem.pill` (a status pill on the face), `plain` (a title-only tile past the face budget), `font` (a per-object face size), `DeskModel` (`code`, `mats`, `groups`, `items`, `people`, `grouping`, `perRow`).
- `layout.ts`: `layoutDesk(model, perRow, people)`, generalised from W-04's journey-only version (mats and sub-mat order come from the model), and `findItem`.
- `useDesk.ts`: the camera (world point + zoom + tilt, the exact screen <-> tilted-plane projection, fly-to, fit), every input, fullscreen, height, wheel preference, legend / settings state, the tooltip, the minimap viewport, and the toolbar's registered actions.
- `DeskStage.tsx`: the frame (toolbar, stage, tooltip, minimap, legend, settings, height handle, compact bar); `DeskObject.tsx` (all faces of 0033, the light tiles of 0035, the stack, the pill, plain tiles; `DeskFace` for the drawer and the legend); `DeskPerson.tsx` + `people.ts` (the stations of 0034); `desk.css` (materials, textures, frame).
- `fields.ts` (drawer field and value labels, moved from `deskFlow.ts`), `entities.ts` (the rule tables below), `strings.ts` (`deskStrings`, merged by the registry next to `core.*`), `actions.ts` (`DESK_ACTIONS` = `deskActionsFor(permission)`, `hasPageDesk`, `withDeskActions`), `PageDesk.tsx` (the generic desk).
- `modules/desk` (W-04) is now the first client: `playbookDesk.ts` builds its model (journey mats, playbook objects, people), `DeskPage.tsx` keeps the light layer, the money rail, the trail, the drawers and its own actions, and renders `DeskStage`. The module exports `desk: { 'W-04': { self: true, build } }`, so the shell mounts no second desk on W-04.

## A desk on every portal page

`DesktopShell` renders `<PageDesk route={route} />` above the page element for routes of surfaces founder / ops / studio / brand (Work W-01..W-03, Spaces K-01..K-06 and the archive S-12 / S-13 mounted there included), and the page itself inside `#desk-after` unchanged below it. 83 routes, 53 page codes (listed in `codes:`). Dev / design / docs / manual / client / public get no desk this pass.

### Entity -> object kind (`ENTITY_RULES.kind`)

folder: projects, renderPacks, spaces, engagements · document: documents, presentations, brandAssets, deliverables, posts, siteReports, assets · sheet: quotes, payments, purchases, changeOrders, revisionItems, revisions, schedules, messages, sections · card: leads, clients, suppliers, meetings, materials, references, competitions, tools, alerts · checklist: tasks, consistencyChecks · box: deliveries · token: tags. Never a mat (`meta`): activity, comments, filings, relations.

### Grouping field -> sub-mats (`ENTITY_RULES.group`, the first of status / pipelineStatus / stage / kind / type unless a reason says otherwise)

status: tasks, suppliers, quotes, deliveries, payments, documents, materials, schedules, renderPacks, consistencyChecks, competitions, presentations, brandAssets, revisions, alerts, deliverables, tools, leads, engagements, revisionItems, changeOrders, purchases · pipelineStatus: projects · kind: meetings, spaces, clients, assets, posts (almost every post is published; kind tells decisions from procedures) · board: references (no status; the mood board is the grouping) · none: sections, tags, siteReports, messages. Values follow their working order (the schema unions, the playbook sets), then by count; labels come from `core.status.*`, the playbook status sets, then `desk.value.*`.

### Mats, objects, faces

One mat per table of `spec.dataTables` with rows (the page's own first table first, then the largest; at most 6). Rows scoped by the URL: `:projectId` (projects by id, every table with `projectId`), `:spaceId` (the space and its children), `:postId`. At most 12 objects per sub-mat and 40 per mat; the rest is a **stack** ("+ N more", opens the page below). Faces: the title field (`name` / `title` / `subject` / `item`, else the first string field; computed titles for engagements, site reports, messages, competitions), a status pill in the StatusPill tone, the amount (`formatCop`), a date (`formatDate`) and one or two short fields; row faces use a larger face font than the playbook's forms. Past 200 faces a desk renders plain tiles (title and pill); no desk reaches it today.

## Clarity: tooltip, drawer, abilities, legend

- Every object has a tooltip on hover and on keyboard focus (name; kind · record · status), drawn by the engine in the stage (not a native `title`, which never shows on focus).
- The page desk's drawer: the face large, `KeyValue` (kind, kind of record, mat, sub-mat, managed on), **Abilities**, then every field of the row (labelled EN / ES). Abilities = every action of the page's `spec.actions` whose params include an id named for this entity (`lead`, `purchase`, ...) or whose verb names it and that takes an id; the row's id fills it, an enum param gets a `Select`, an action that needs free text or another id says so and points to the page instead of running half-filled; permissions disable with the reason. **Open** navigates to the page's own detail route for the row (`/founder/work/:projectId` from W-01, `/<surface>/spaces/:spaceId`, `/<surface>/archive/:projectId`), else "Show on the page" scrolls to the page below.
- **Legend** (toolbar): the object kinds on this desk, each with a real sample face and one line, the grouping rule ("Sub-mats are grouped by status"), and how to move around.
- Mat labels and sub-mat labels are buttons that fit themselves into view.

## Input model (P-03)

- Trackpad: two-finger scroll pans on both axes in the OS's direction; pinch (ctrl + wheel) zooms about the cursor. When the whole desk is in view, or the camera is at the desk's edge, a vertical scroll goes on to the page, so a page desk never traps the page's scroll (not in full screen).
- Mouse: ctrl / cmd + wheel zooms; plain wheel pans; the **Scroll wheel zooms** switch (Settings, `storageKey('desk.wheel')`) makes the plain wheel zoom and shift + wheel pan. Drag pans with a short inertia (time constant 110 ms, at most 420 ms, off under reduced motion); Space + drag or the middle button pans from anywhere, objects included; double-click an object zooms to it (a single click opens it after 240 ms), double-click the empty desk zooms 1.8x about the point.
- Touch and pen: one finger pans (drag threshold 10 px, taps still activate), two fingers pinch about the midpoint (no rotation), double-tap zooms to the object under the finger or one step in; `touch-action: none` only on the stage, the minimap and the handle.
- Keyboard as before: `+` / `-` / `0` / `F` / arrows; Tab walks mat labels, sub-mat labels and objects; Enter opens at once; Esc closes the drawer and leaves full screen.
- Minimap in the stage's bottom-right corner (from 480 px wide stages): the desk and its mats small, the viewport as a trapezoid (the tilt), click or drag to move there; pointer only, the mat Select is the keyboard path.
- W-04: Space plays the trail on release (so Space + drag pans), `[` / `]` step.

## Fullscreen and size

Full screen puts the whole frame (toolbar, light toolbar, stage, rail) into the Fullscreen API (webkit prefix handled); where it is missing or refused (iPhone Safari, iframes) the frame becomes a fixed overlay over the window; Esc exits both. The Drawer now portals into the fullscreen element, so drawers work in full screen. Size: S / M / L (40 / 60 / 85 % of the viewport height) and the handle at the stage's bottom edge (drag; or focus and use up / down, shift for 10, Home / End; a `separator` with `aria-valuenow` in vh), stored per page code (`storageKey('desk.height.<code>')`). Default M on W-04, S on page desks (at 1280 x 900 the page below starts at 684 px). Under 768 px a page desk is a compact bar ("Desk · 46 objects on 3 mats" + Show desk), open by default on W-04; open desks show Hide desk.

## Actions

Shared `DESK_ACTIONS` (declared once in `src/desk/actions.ts`, appended by the registry to every route that carries a page desk, with that route's guard, registered while the desk is mounted): `desk.zoom {zoom:number}`, `desk.fit`, `desk.reset`, `desk.toggleTilt`, `desk.focusMat {mat}`, `desk.focusObject {object:id}`, `desk.openObject {object:id}`, `desk.fullscreen`, `desk.setHeight {size:enum:s|m|l}`, `desk.toggleWheelZoom`, `desk.legend`. W-04 declares 4 of them in its own spec (`desk.fullscreen`, `desk.setHeight`, `desk.toggleWheelZoom`, `desk.legend`, registered by the engine like zoom / fit / reset / tilt); its object verbs stay `desk.focusPhase / focusItem / openItem`. Manifest: 129 routes, 2 069 declared entries (1 136 + 20 on W-04 + 83 x 11), 431 distinct ids; D-09 lists them and shows them live. `tenant.json` `actions` 460 / 431 with `platformDeclarations: ["apps/hub/src/desk/actions.ts"]` (the validator now counts platform declarations too).

## Performance

Biggest page desk: K-04 (Spaces graph, 6 mats, 997 rows) renders 183 objects (caps + stacks), first object 742 ms after navigation at 1280 on the production build (app boot included; other pages 600-1100 ms, W-04 146 objects 823 ms). No plain tiles are needed today (budget 200).

## What the generic desk cannot know yet

- Which tables a page only writes (the spec lists read and write tables together): the rule skips logs and join tables and empty tables only.
- Action labels in the abilities are the specs' English labels (the WebMCP vocabulary); specs carry no `labelKey` yet.
- Names behind ids in faces and fields (supplier, person, project) are shown as ids on page desks; W-04's light tiles resolve them.
- Deep links to one row on most pages (no `?row=`): Open lands on the detail route when the page has one, else on the page below.
- Toasts do not show inside native full screen (the toaster is outside the frame).

## Verification

`npm run build` green (tsc strict, Vite, `tenant:validate`). Scripted on W-04, A-01, A-08, O-12, S-01, G-01, W-01, K-01 at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 (EN light; phones checked collapsed and opened): no horizontal scroll, 0 overlapping objects, sub-mats, stations or mats, no toolbar control outside the frame, no page errors; ES / dark on W-04 at 1280 by screenshot. Inputs by script: wheel at fit scrolls the page, ctrl + wheel zooms 30 -> 55 %, wheel pans both axes, drag + inertia, double-click an object zooms to it without opening, click opens after the wait, touch tap opens, Tab to an object shows its tooltip and Enter opens, the wheel switch and the height persist, the handle's arrow keys resize (60 -> 65 vh), all 11 desk actions live on A-08, D-09 lists `desk.focusMat`. Screenshots: `docs/screenshots/W-04/{en-390,en-1280,en-3840,es-1280,en-1280-dark,en-1280-fullscreen,en-1280-legend}.jpg`, `docs/screenshots/{A-08,O-12,S-01,W-01}/en-1280-desk.jpg`.

## Rejected alternatives

- A hand-built desk per page: 53 codes on 83 routes, every one would drift from its data; rule tables plus a per-code override keep them derived (D-103).
- Replacing the pages with desks: Justin asked to keep the old pages below for now.
- Wheel zooms by default: fights two-finger trackpad scrolling; pinch and ctrl + wheel already zoom, and mouse users get the switch.
- One global height: different pages want different heights; the preference is per page code.
- A library Tooltip / Popover component in this pass: requested; the engine's tooltip and panels are platform code in `src/desk/`, not hand-rolled page UI.
