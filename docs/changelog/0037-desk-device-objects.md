version: 0.22.0 (unchanged: platform engine only; no route, action, entity, seed or `SEED_VERSION` change)
date: 2026-09-29
prompt: 0030
intent: Give the desk system the objects a client's hub is made of (phones, tablets, screens, tall web pages, fanned stacks of pages) with real screen captures as their faces, multi-row footprints, and figures for a client's roles, so the next pass can lay hoy's whole hub on aluzina mats.
decision: recorded with the client hub desk pass that uses it (device kinds with image faces in the platform engine)
rejected: drawing screens as SVG miniatures (they would drift from the real pages; the client already publishes captures); an `<iframe>` per object (ninety live apps on one desk: memory, and no desk left to pan); a separate device renderer outside the desk (two engines, two input models); a second packer for tall objects (one 2D first fit keeps every desk deterministic).
files: apps/hub/src/desk/{types.ts,layout.ts,DeskObject.tsx,DeskPerson.tsx,people.ts,useDesk.ts,DeskStage.tsx,strings.ts,desk.css,checkModels.ts (new)}, scripts/desk-check.mjs (new), package.json (`desk:check`, inside `build`), scripts/README.md, docs/design/desk-system.md, docs/prompts/0030-hoy-hub-on-the-desk.md (new), docs/plan/plan.json, docs/kanban.md, docs/README.md, tenant.json (docs counters)
codes: W-04 (engine client, unchanged)
model: Opus 5 (build), Fable 5.1 (architecture and plan)

# 0037 - Desk device objects: image faces, multi-row footprints, client role looks

## New object kinds

`ItemKind` gains five device kinds (`DEVICE_KINDS`), and `GEOMETRY` gains `h` (every existing kind is `h: 1`) and an optional caption size `cap`:

| Kind | Footprint | Face | Drawn as |
| --- | --- | --- | --- |
| `phone` | 1 x 2 | 44 x 96 | rounded dark bezel, speaker slit, the screen; caption strip under it |
| `tablet` | 2 x 2 | 78 x 104 (3:4) | bezel and screen; caption strip |
| `screen` | 3 x 2 | 176 x 114 (16:10 + chin) | a monitor lifted 4 px on a flat foot-and-neck stand; the caption on its chin |
| `page` | 1 x 3 | 54 x 162 | a paper-thin tall web page, curled corner, long shadow; caption strip |
| `pages` | 2 x 3 | 104 x 156 | a fanned stack: up to four leaves offset 3 px each behind the top page; a badge with the page count (`more`) |

## Multi-row footprints

`pack()` (now exported) is a 2D first fit: each object takes `w` x `h` squares at the first row-major cell where its whole footprint is free. `subCols()` keeps the 3 / 4 / 5 / 9 rule for 1-row groups (so W-04 and every page desk lay out exactly as before) and sizes device groups by their row width (one row when it fits in 5 columns, else the whole mat), never narrower than the widest object. `PlacedItem.ch` = `h * SQ`.

## Image faces

`DeskItem.face = { src, alt?, fit? }`: the device's screen (or a document's first page) is an `<img loading="lazy" decoding="async">` drawn over the text face; it fades in on load and is removed on error, so a capture that is not published yet (or a tester offline) leaves the drawn device with its code, title and lines, never a broken image. `fit: 'top'` shows a tall page from its header. `plain` objects (past `FACE_BUDGET`) request no image. The caption strip (code + title, two lines, em-sized from `GEOMETRY.cap`) sits on the felt under the device, or on the screen's chin, and scales with the zoom; `DeskFace` draws the same device, image and caption at drawer / legend size, with the image's `alt`.

## Figures for a client's roles

`DeskPerson.tsx` `LOOKS` adds nine looks for a client hub's roles (hoy's): customer (ponytail, tee), teacher (bun, tee, mala), frontdesk (curly, shirt, lanyard badge), coordinator (long, cardigan, badge), finance (short, blazer, tie), admin (long, shirt, necklace), superadmin (crop, hoodie), public (curly, hoodie), maintenance (work cap, tee, badge); new building blocks ponytail / crop / cap hair, tee / hoodie necklines and the badge accent, same stylised construction, no features. Every combination differs from the four aluzina looks and from each other; each has its own palette in `desk.css`. `DeskPerson.caption` (optional) is the nameplate's role line for people who are not aluzina playbook roles; they carry a minimal `role` with `roleId: null`. W-04's people are unchanged.

## Camera

`useDesk({ homeZoom })`: the lowest zoom a desk opens at per stage size; when the whole-desk fit is smaller, the home view (first view, Reset, refits while untouched) shows the desk's top-left corner at that zoom. Fit and `desk.fit` still fit everything. `readableZ` frames an object by its own face height (tall pages whole). W-04 and the page desks pass no `homeZoom`: unchanged.

## Layout check in the build

`scripts/desk-check.mjs` (`npm run desk:check`, now inside `npm run build`): bundles the engine in memory with esbuild, lays out a synthetic desk with every kind (devices mixed with papers, groups of 1 to 13, mats with and without people) and W-04 at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840, and fails on any overlap or off-grid object. Today: 2 models x 7 widths, 2338 placements, no overlaps.

## Checks

`npm run build` green (tsc strict, Vite, `tenant:validate`, `desk:check`). The objects are first rendered by the client hub desk (next pass); the screenshots and the 44 px / 10-foot checks of the device objects are recorded there.
