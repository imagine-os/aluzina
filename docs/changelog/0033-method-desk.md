version: 0.20.0 (from 0.19.0: new module `desk` with route W-04 on five surfaces, 7 declared actions, a HUB-01 card; no entity, seed or `SEED_VERSION` change)
date: 2026-09-28
prompt: 0026
intent: Give Justin "a very simple beautiful visual page" where every template and item of the method is a small physical object with a preview of what it is, laid out on mats (one per phase, with mats on top) on a giant desk that zooms and pans like a physical space, with thickness from basic 3D geometry and real textures — as a working prototype with a link.
decision: D-103 (the Method desk is a spatial view derived from the playbook and template data, never hand-placed; real-content previews; procedural textures, no binaries or dependencies; tilt is a toggle with flat as the accessibility fallback; committed zoom is layout, gestures are transforms)
rejected: downloaded texture images or shader assets (binaries and licences in the repo, no dark variant; feTurbulence noise does the felt, paper and wood); a WebGL / three.js scene (text as textures, no native focus or screen-reader path, heavier bundle); hand-authored mat layouts (drift from the data); transform-only zoom (Chrome kept the 3D layers rastered at their first scale, text blurred past 100 %: measured, then replaced by CSS `zoom` on commit); equal-height mats per row (tried first: empty felt dominated, mats now take their content's length); a lifted 1 px face for sheets / forms / checklists (tripled the 3D layer count for an invisible lift; they lie flat with a 1 px edge shadow); `contain: paint` on the 3D containers (it flattens `preserve-3d`; applied to the flat faces instead)
files: apps/hub/src/modules/desk/{index.ts,specs.ts,strings.ts,model.ts,DeskPage.tsx,DeskObject.tsx,desk.css} (new), apps/hub/src/tenant/hubCards.data.ts (`desk` product surface after `spaces`), apps/hub/src/modules/hub/{specs.ts,strings.ts,HubPage.tsx} (`SurfaceId` += `desk`, card strings, the card opens on the current role's surface like Spaces), apps/hub/src/components/atom/Icon/iconMap.ts (`W-04` -> `canvas`), scripts/thumbnails.mjs (W-04 target), docs/pages/W-04.md (new), docs/screenshots/W-04/{en-390,en-1280,en-3840,es-1280,en-1280-dark,en-1280-lead,en-1280-drawer}.jpg + routes.json (new), docs/prompts/0026-method-desk-zoomable-canvas.md (new), docs/changelog/0033-method-desk.md (new), docs/decisions.md (D-103), docs/reference/surfaces.md (route row, `desk.*` row, counts, `hub.openSurface` enum, change log), docs/plan/plan.json (step 17 task dk-01, version), docs/build-plan.md (row 17 "Spatial views"), docs/kanban.md (dk-01 Done), docs/README.md (latest counters, W-04 code, `desk` module, next free W-05), apps/hub/src/modules/README.md (taken codes, next free W-05, nav order 7, module list), tenant.json (version 0.20.0, `hubModules` += `desk`, `surfaces.nextFreeCodes` W-04 -> W-05, `docs.counters` 26 / 33 / 103, `actions` 437 / 416), package.json + apps/hub/package.json (version)
codes: W-04, HUB-01
model: Opus 5 (build), Fable 5.1 (architecture and brief)

# 0033 - Method desk (W-04): the method as physical objects on a zoomable desk

## What it is

A new module `desk` mounts W-04 **Method desk** at `/<surface>/desk` on founder, ops, studio and brand (the guard `work` uses per surface) and on dev (`dev.tools`); nav order 7 in the Projects group (Developer on dev), glyph ▦, icon `canvas`. The HUB-01 product-surfaces grid gains a "Method desk" card after Spaces that opens the desk on the current role's own surface.

## The model (`modules/desk/model.ts`)

- **Mats**: one per `CLIENT_JOURNEY` phase (10), 9 chess squares wide (1 square = 64 world px), laid out in journey order, 5 per row on landscape stages, 3 on squarish ones (tablets), 2 on tall phones; each mat is as long as its content.
- **Sub-mats**: the groups of a phase, in a fixed order — Services, Statuses, Forms, Templates & procedures, Deliverables, Money, Communication, Rules, Team, Measures — only when they have objects; 3 / 4 / 5 / 9 squares wide so small groups pair on one shelf; a label strip and a faint chess checker.
- **Objects**: 146, from the domain data, never hand-placed: 54 checklists (every service phase), 33 cards (17 governance rules, 6 roles, 10 KPIs), 24 tokens (15 pipeline, 3 validation, 6 purchase statuses), 10 folders (5 services on the Lead mat, 5 project-template phases), 9 sheets (operational assets, lead channels, final principle), 6 forms (lead record, commercial data, qualification, brief form, revision matrix, approval form), 5 documents (each service's deliverables) and 5 boxes (each service's delivery kit). Classification tables put each on a phase and group, with fallbacks. Layout: dense first-fit per sub-mat, shelf-packed sub-mats, no overlaps (checked by script at seven widths).
- **Previews**: the top face is the data drawn small — a form's real field labels with blank lines, a checklist's real items with tick boxes and group headings, a token's status name and playbook wording, a folder tab with the service code or template phase number and its first tasks, a document's numbered deliverables, a box's code and item count, a card's rule text or KPI with its unit. All sizes are em, so the drawer shows the same markup large.

## Geometry and materials

CSS 3D, no library: thick objects (document 6 px, folder 8 px, box 18 px) get a lifted top face and front / left / right faces (`backface-visibility: hidden`), tokens (4 px) are three stacked discs, thin objects (sheet, form, checklist 1 px, card 2 px) lie flat with a 1 px edge shadow; one soft shadow each. Materials are tokens and `color-mix` of tokens: pale oak desk slab (dark walnut in dark theme), charcoal felt mats with stitching, lighter felt sub-mats, warm paper, silver folders, kraft boxes, status-coloured coins (StatusPill tone tokens); the single accent is the brand iridescent gradient (folder tabs, box tape, rule cards). Textures are SVG `feTurbulence` noise as data URIs: paper grain, felt fibres, wood grain.

## Camera and inputs

Stage with `perspective` > camera tilted `rotateX(22deg)` (Tilt toggle -> flat top-down) > world. The camera is the world point at the stage centre plus the zoom; the screen <-> desk-plane maths inverts the tilt and perspective exactly, so wheel zoom stays under the cursor and drag keeps the grabbed point under the pointer when tilted, and Fit iterates on the projected corners. Gestures write the transform through a ref + `requestAnimationFrame` (no React render per frame, `will-change` only while moving); on commit the zoom becomes CSS `zoom` layout and the percentage / `--desk-zoom` state update, so text is crisp at every zoom. Inputs: wheel zoom (ctrl + wheel = trackpad pinch), shift + wheel pan, pointer drag pan (mouse, touch, pen), two-finger pinch, keys `+` `-` arrows `0` `F`, Tab through mat labels and objects with keyboard focus flying the object into view, toolbar Buttons (zoom − / % / +, Fit, Tilt, phase Select, Reset). Activating a mat fits it; activating an object flies to it and opens a Drawer (large preview, kind, phase, sub-mat, source, code, id, full contents). `prefers-reduced-motion` makes moves instant.

## Placeholder

The Drawer's **Open** is a `Placeholder` naming the page that will show the object (A-08, A-03, A-02, S-10, S-11, O-12, O-13, M-03..M-07, M-08, W-03). `desk.openItem` is registered and answers `not wired yet: <code> <page> (#<path>)` (D-047).

## Actions

`desk.zoom {zoom:number}`, `desk.fit`, `desk.reset`, `desk.toggleTilt`, `desk.focusPhase {phase}`, `desk.focusItem {item}`, `desk.openItem {item}` — declared per surface with that surface's guard, all registered while mounted, handlers take ids (also codes, phase numbers or title words) and return readable strings.

## Shared-code touches (integrator's)

`hubCards.data.ts` (+1 card), `modules/hub/*` (`SurfaceId`, strings, the own-surface href helper now serves Spaces and the desk), `iconMap.ts` (+`W-04`), `scripts/thumbnails.mjs` (+W-04 target, waits for `.desk-mat`).

## Verification

`npm run build` green (tsc strict, Vite, `tenant:validate`). Screenshots at 390 / 1280 / 3840 EN, 1280 ES, 1280 EN dark in `docs/screenshots/W-04/`; scripted checks at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 (no horizontal scroll, 146 objects, 10 mats, 0 overlaps), wheel / drag / keyboard / actions exercised, no page errors.
