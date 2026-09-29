# The desk system

The desk is how the Hub shows a page's things as physical objects on a zoomable desk (D-103, platform since D-106). The engine lives in `apps/hub/src/desk/`; W-04 (the Method desk) is its first client and every page of the four portals carries a desk above it.

## Concepts

- **Desk** (`DeskModel`): a page code, an ordered list of **mats**, the objects, optional people, a grouping line for the legend, and the mats-per-row rule.
- **Mat** (`DeskMatDef` -> `Mat`): a felt mat, 9 chess squares wide (1 square = 64 world px), as long as its content. On page desks one mat = one table (entity); on W-04 one mat = one client-journey phase.
- **Sub-mat** (`SubMat`, id `<mat>:<group>`): a lighter felt group inside a mat, 3 / 4 / 5 / 9 squares wide so small groups share a shelf. On page desks one sub-mat = one value of the table's grouping field (a status); on W-04 one group (services, statuses, forms...).
- **Object** (`DeskItem` -> `PlacedItem`): a footprint of `w` x `h` squares (1x1, 2x1, and since changelog 0037 the multi-row device footprints 1x2, 2x2, 3x2, 1x3, 2x3), a kind with thickness (`GEOMETRY`), and a face that shows its real content (em-sized, so the drawer and the legend reuse it). Kinds: sheet, form, checklist, document, folder, box, token, card, light (W-04's followed project), stack (the "+N more" pile), and the device kinds phone, tablet, screen, page, pages (below). Options: `pill` (status on the face), `plain` (title-only tile past the face budget), `font` (face size), `ref` (the row it is), `openAt` (the page it opens), `face` (an image face, below).
- **Person** (`DeskPerson`): a seated role figure at a small desk on a mat's near edge (W-04, D-104). Looks (`DeskPerson.tsx` `LOOKS`, colours in `desk.css`): the four aluzina portal roles (founder, studio, ops, brand) and, since changelog 0037, nine client-hub roles (customer, teacher, frontdesk, coordinator, finance, admin, superadmin, public, maintenance), each a distinct hair / neckline / accent combination (new pieces: ponytail, crop, cap; tee, hoodie; lanyard badge) and palette. A person that is not an aluzina playbook role carries `caption` (the nameplate's role line, e.g. a hub map role label) and a minimal `role` with `roleId: null`.
- Layout: `layoutDesk(model, perRow, people)` packs each sub-mat first-fit over a 2D grid, shelf-packs sub-mats inside the mat and rows the mats; deterministic, grid-aligned, no overlaps (checked by `scripts/desk-check.mjs` in every build, below).

## Object kinds and footprints

| Kind | Footprint (w x h squares) | Thickness | Face (world px) | What it is |
| --- | --- | --- | --- | --- |
| sheet, form, checklist | 1 x 1 | 1 | 46 x 60 | a page: a record with a few fields, a form, a checklist |
| document | 1 x 1 | 6 | 46 x 58 | pages bound together; may carry an image face (its first page) |
| folder | 2 x 1 | 8 | 114 x 50 | holds other things |
| box | 1 x 1 | 18 | 52 x 52 | goods, a kit |
| token | 1 x 1 | 4 | 44 x 44 | a status or tag (stacked discs) |
| card | 1 x 1 | 2 | 56 x 40 | a person, company, rule, meeting |
| light | 1 x 1 | 2 | 58 x 58 | a live record of W-04's followed project |
| **profile** | 2 x 1 | 2 | 118 x 54 | a lead: photo, logo, name, company, status, budget, networks; opens its dossier (D-114, 0041) |
| stack | 1 x 1 | 5 | 46 x 56 | the "+N more" pile of a capped sub-mat |
| **phone** | 1 x 2 | 4 | 44 x 96 + caption strip | one app screen (390 x 844): rounded bezel, speaker slit, the screen |
| **tablet** | 2 x 2 | 4 | 78 x 104 (3:4) + caption strip | one screen at 768 x 1024 |
| **screen** | 3 x 2 | 4 | 176 x 114 (16:10 panel + chin) on a flat stand | one desktop page (1280 x 800); the caption is printed on the chin |
| **page** | 1 x 3 | 1 | 54 x 162 + caption strip | one tall website page, paper-thin, a curled corner and a long shadow |
| **pages** | 2 x 3 | 1 | 104 x 156 + caption strip | a fanned stack of tall pages (up to four leaves behind the top one, a few px apart); `more` = the page count on its badge |

**Footprint rule.** `GEOMETRY[kind]` gives `w` and `h`; `pack()` places each object at the first free cell (row-major) where its whole `w` x `h` footprint is free, so a 1x3 page and three 1x1 sheets share rows without touching. `subCols()` keeps the paper rule (3 / 4 / 5 / 9 columns by area) for groups of 1-row objects; a group with a multi-row object is one row wide when its widths sum to 5 or less, the whole mat (9) otherwise, and never narrower than its widest object. `PlacedItem.cw` / `ch` = `w * SQ` / `h * SQ`. Device kinds are `DEVICE_KINDS`.

**Image faces.** `DeskItem.face = { src, alt?, fit? }` draws an image as the device's screen (or a document's first page): `<img loading="lazy" decoding="async">`, `object-fit: cover` anchored at the top, or `fit: 'top'` (full width from the top, the rest of the paper below) for tall pages so the header shows. The image is drawn over the text face and fades in when it has loaded; while it loads, and forever when it fails (offline, not published yet), the drawn device outline with its code, title and lines stays: never a broken image. Past `FACE_BUDGET` (`plain`) no image is requested. The caption strip under the device (on the felt; on a screen's chin) prints code and title in em from the kind's `cap` size, so it scales with the zoom and with `DeskFace` (the drawer's and the legend's large preview, where the image carries its `alt`). On the desk the image's `alt` is empty: the object's button already names it.

**Home zoom.** `useDesk({ homeZoom })` sets the lowest zoom a desk opens at per stage size: when fitting the whole desk would be smaller, the first view, Reset and the refits while untouched show the desk's top-left corner at that zoom (faces readable from across the room, hit areas at least 44 px); Fit and `desk.fit` still fit everything. `readableZ` (open / double-click zoom) uses the object's own face height, so a tall page is framed whole.

## Rule tables (page desks, `src/desk/entities.ts`)

`ENTITY_RULES` has one row per entity of `src/data/schema`: `one` / `many` (bilingual labels, the words of `spaces.type.*` where they exist), `kind`, `group` (the grouping field), `order` (its values in working order), `title`, `amount`, `date`, `lines`, `noun` (how actions name one row), `why` (the reason, read off the schema), `meta` (logs and join tables that are never a mat), `titleOf` (computed titles).

- Kind: folders hold things (projects, spaces, engagements, render packs); documents are documents (documents, posts, assets, deliverables, presentations, brand assets, site reports); money and short records are sheets (quotes, payments, purchases, change orders, revision items, revisions, schedules, messages, sections); people, companies, appointments and samples are cards (leads, clients, suppliers, meetings, materials, references, competitions, tools, alerts); work is a checklist (tasks, consistency checks); goods are boxes (deliveries); tags are tokens.
- Grouping: the first of `status`, `pipelineStatus`, `stage`, `kind`, `type`, except `posts` (kind: nearly every post is published), `assets` (kind), `references` (`board`: no status), and none for sections, tags, site reports, messages.
- Mats: `buildPageDesk()` takes the tables of `spec.dataTables` that have rows after scoping, the page's own first table first and then the largest, at most `MAX_MATS` = 6; rows sorted by `updated_at`, at most `CAP_PER_SUB` = 12 per sub-mat and `CAP_PER_MAT` = 40 per mat, the rest as a stack; `FACE_BUDGET` = 200 full faces per desk, plain tiles after.
- Scoping: `:projectId` (projects by id, every table with `projectId`), `:spaceId` (the space and its children), `:postId`.
- Abilities: `abilitiesFor(spec.actions, entity)` = the page's actions with an `id` param named after the entity's noun (or the entity), or whose verb names the noun and that take an id. The drawer fills the id, offers a Select per enum param, and says what an action still needs instead of running it half-filled.

## How a module overrides its desk

Export `desk` from the module's `index.ts`, keyed by page code; the registry copies it onto the matching routes (`RouteDef.desk`):

```ts
export const desk: Record<string, RouteDeskOverride> = {
  'W-04': { self: true, build: () => playbookDeskModel() }, // the page is itself a desk: the shell mounts none
  // 'O-12': { build: ({ route, params, rows }) => myModel(rows) }, // the shell's page desk renders this model
};
```

A page that is its own desk (W-04) calls `useDesk({ code, model, defaultSize, compactOpenByDefault, onOpenItem, ... })` and renders `<DeskStage desk={desk} ... />` with its own slots (extra toolbar rows, a caption above the stage, a rail below, overlays in the world, per-object glow / lit).

## Input model

| Input | Does |
| --- | --- |
| Two-finger scroll (trackpad), plain wheel | Pans both axes. A vertical scroll passes to the page when the whole desk is in view or the camera is at the desk's edge (not in full screen). |
| Pinch (ctrl + wheel), ctrl / cmd + wheel | Zooms about the cursor (one mouse notch = one step). |
| "Scroll wheel zooms" (Settings, per person) | Plain wheel zooms, shift + wheel pans. |
| Drag on the desk (mouse, touch, pen) | Pans; short inertia (110 ms time constant, off under reduced motion). Threshold 6 px mouse, 10 px touch / pen: a tap still activates. |
| Space + drag, middle button | Pans from anywhere, objects included, without activating them. |
| Two fingers | Pinch zoom about the midpoint, the midpoint pans; no rotation. |
| Double-click / double-tap | On an object: zoom to it. On the empty desk: 1.8x about the point. A single click / tap opens the object after 240 ms. |
| Minimap | Click or drag to move there (pointer only). |
| Keyboard | `+` / `-` zoom, arrows pan, `0` reset, `F` fit; Tab walks mat labels, sub-mat labels and objects (focus flies the object into view and shows its tooltip); Enter opens; Esc closes the drawer and leaves full screen. |
| Height handle | Drag; or focus and up / down (shift = 10), Page up / down, Home / End. |

## Frame

Toolbar (`role="toolbar"`, two groups that wrap as wholes): zoom − / % / +, Fit, Tilt, the mat Select, Reset | Legend, S / M / L, Full screen, Settings (Scroll wheel zooms), Hide desk on phones.

One row wherever it fits (changelog 0043): `useToolbarFit` (`src/desk/useToolbarFit.ts`) watches the toolbar with a ResizeObserver (not a media query, so it follows the page column, a D-16 side-by-side column and full screen), measures the controls' natural one-row width with everything inline, and picks the smallest fold that fits on one row. The secondary controls carry `data-desk-fold`.

| Fold | When | Inline | In More (`OverflowMenu`, native `<details>`) |
| --- | --- | --- | --- |
| 0 | every control fits on one row (1920 and up in a page column; 2560 / 3840) | everything | nothing |
| 1 | only the folded row fits (1280 in EN and ES: 975 / 1 173 px needed, 637 / 747 px after, in a 960 px column) | zoom − / % / +, Fit, the mat Select, Full screen, Hide desk, More | Tilt ("Tilted" / "Flat", `aria-pressed`), Reset, Legend (`aria-pressed`), Size S / M / L (`aria-pressed`, keeps the menu open), Settings |
| 2 | fold 1 still too wide | as fold 1, Full screen as its icon (the label stays as the accessible name and `title`, as on phones) | as fold 1 |
| 0 (stacked) | not even fold 2 fits on one row (phones 360 / 390, 768 beside the sidebar, narrow D-16 columns) | everything, the groups stack as before | nothing |

More is a 44 px ghost Button ("More" / "Más", named "More desk controls" / "Más controles de la mesa"); Enter / Space opens it, Tab walks its rows, Escape or focus / a pointer leaving it closes it and focus returns to it; activating a row closes it (except S / M / L). The page desk's title keeps its 9rem flex basis on the row. A new language, full screen, the mat count or the compact mode re-measures unfolded inside the layout phase (no flash); Tilt keeps one width for both labels, so a toggle never re-measures. The `desk.*` actions are unchanged (they call the controller, not the buttons).

Stage box (height = the size), tooltip, minimap, legend panel, handle, hint. Full screen: Fullscreen API on the frame, fixed overlay where missing; the Drawer portals into the fullscreen element. Sizes: S / M / L = 40 / 60 / 85 % of the viewport height, stored per page code; default M on W-04, S on page desks. Under 768 px page desks collapse to a bar with Show desk (W-04 starts open).

## Accessibility

Every object, mat label, sub-mat label and station is a native `<button>` with an `aria-label` that says kind, name, record and status; the stage is a focusable region (`aria-roledescription`, described by the hint); the zoom percentage is `aria-live`; toggles carry `aria-pressed`, the handle is a `separator` with `aria-valuenow`; nothing is hover-only (the tooltip repeats the label and also shows on focus), drag-only (buttons, keys and actions cover every move) or wheel-only. Focus rings on faces are divided by the zoom so they stay 3 px on screen. Reduced motion makes camera moves, inertia and the trail instant.

## Actions

`DESK_ACTIONS` (`src/desk/actions.ts`): `desk.zoom`, `desk.fit`, `desk.reset`, `desk.toggleTilt`, `desk.focusMat {mat}`, `desk.focusObject {object}`, `desk.openObject {object}`, `desk.fullscreen`, `desk.setHeight {size:enum:s|m|l}`, `desk.toggleWheelZoom`, `desk.legend`; appended by the registry to every route with a page desk (with its guard), registered while the desk is mounted (camera verbs by `useDesk`, object verbs by `PageDesk`). W-04 declares its own set in `modules/desk/specs.ts`.

## Layout check

`npm run desk:check` (`scripts/desk-check.mjs`, inside `npm run build`) bundles the engine with esbuild, lays out every registered model (a synthetic desk with every kind, W-04, and each module desk listed in the script's entry) at seven stage widths (360, 390, 768, 1280, 1920, 2560, 3840) with the real `layoutDesk()`, and fails the build on any overlap (object / object, object outside its sub-mat, sub-mat / sub-mat or outside its mat, a person's station on a sub-mat, mat / mat) or an object off the half-square grid. A module that builds its own desk adds its model to the script's entry.

## Rendering (D-107, changelog 0038)

One depth order for the whole desk, in `src/desk/depth.ts` (`DEPTH`, applied as `--z-*` custom properties on `.desk-zoom`; `desk.css` reads nothing else for translateZ). World px above the desk plane:

| Layer | Z | What |
| --- | --- | --- |
| slab | 0 | the wooden desk (world layer) |
| matGlow | 0.5 | the followed project's light rings round the current mat, before every mat (a mat's own drop shadow stays on the mat: it never reaches a neighbour across the one-square gap) |
| mat | 1 | felt, stitching, mat label, its drop shadow (one layer per mat) |
| sub | 2 | linen, chess squares (one layer per sub-mat) |
| glow | 2.5 | the status token's halo, light tiles' light and the lit tile's rings (under every face) |
| objects | 3 | the objects plane, flat, one layer per sub-mat: the sub-mat label, every object's hit area and single shadow, the thin faces (sheet, form, checklist, card, light, plain tiles) |
| objects + t | 4 .. 21 | solid bodies on the sub-mat's bodies layer: document (t 6) and folder (8) top + front face, box (18) top + front / left / right, token (4) two discs + face, the "+N more" pile (5) three offset sheets |
| lift | + 0.75 | a focused or selected solid lifts; a focused or selected flat object paints above its neighbours (`z-index` on the flat plane) |
| stationTop / standGap | mat + 22 / + 0.5 | a person's desk top; chair, figure, props and nameplate stand 0.5 above it, never on it |
| fan | 28 | a fanned lead dossier's overlay plane (D-114) |
| pulse | 40 | the trail's pulse of light |

Outside the 3D context: toolbar, minimap (its own compositor layer), tooltip (a portal on `body`, or on the fullscreen element), legend, settings, drawer, height handle, money rail.

Rules:

- No two layers that can overlap share a Z, and DOM order is depth order, so when a low zoom squeezes two planes closer than the compositor can tell apart (it then paints in DOM order) the picture is the same.
- Nothing inside the 3D context carries `overflow`, `contain` or `filter` (they flatten `preserve-3d`, clip, or re-rasterise text); faces clip their text in the 2D `.dp` spans. The stage frame is the only clip. Checked by script (`nbad = 0` on every desk).
- Only solids join the 3D context. In Chrome every element of a 3D rendering context is a compositor layer of its own, so hit areas, shadows and thin faces are painted flat into one layer per sub-mat; documents and folders keep a front face only (their left / right faces are edge-on at 22°). K-04 went from 1 148 to ~570 layers, W-04 (following a project) from 831 to 460.
- Text is rasterised at its final size: the committed zoom is CSS `zoom` (layout), gestures preview with a scaled transform, and the commit swaps zoom, scale, the device-pixel snap and the end of `will-change` synchronously in one frame. At rest the world sits on whole device pixels. The flat view drops the perspective once the tilt transition has run, so nothing is resampled. `-webkit-font-smoothing` is `auto` on light, `antialiased` (+ `-moz-osx-font-smoothing: grayscale`) on dark.
- Thin lines never fall under one device pixel: `--hair` = 1 px / (zoom x devicePixelRatio) in world px; grid lines, stitching and edges use `max(<design width>, var(--hair))`, and the felt grid's ink scales down with its width (`--hair-ink`) so a zoomed-out desk keeps its tone.
- Glows are box-shadows on the glow layer, never on a text-bearing face; every object has one shadow (`desk-item__shadow`, which also draws the paper edge).
- Gestures: the camera maths runs per event, the DOM write once per frame (`requestApply`); the stage rectangle is read once per gesture (no layout reads in move handlers); `will-change: transform` and `pointer-events: none` on the world only while it moves; `content-visibility` is not used inside the 3D context (it clips). Reduced motion: no inertia, instant camera moves.
- Tooltips show on hover, on Tab and on a scripted `focus()` (any focus not caused by a pointer press within 800 ms); mat and sub-mat labels have one too (their full name). Sub-mat names take two lines of the label strip instead of an ellipsis.

## Stacks and fans (D-114, changelog 0041)

- A lead on a page desk that shows `leads` (A-08, A-03) is a **profile** object (2 x 1): photo, logo when there is a company, name, company or city, status pill, budget, network icons. Selecting it opens its drawer and its **dossier**: cards for contact, company, each social profile, qualification, commercial, notes and messages (`src/desk/dossier.tsx`, 148 x 204 world px, text 7.2 px).
- The dossier lives on its own **overlay plane** (`DEPTH.fan` = 28, above every body and station top at 22; each open dossier 2 px higher, each card 0.2 px), not among the objects: it never interpenetrates a solid or clips, and the process stacks under it do not move.
- **Stack**: over the lead card at scale 0.42, 1.6 px offsets, the top card last in DOM order and highest in Z. **Fan**: an arc of radius 900 world px whose step (at most 8° a card) is chosen so the whole fan stays inside the lead's mat; the focused card rises 30 px and comes to the front. **Sort** by kind, date or network. **Flip**: only social cards turn over (`preserve-3d` on those cards only); the front is the mock profile with Visit (a real link, or a disabled button with its reason), the back the lead's notes with Turn back. `desk.fanOut` fits the mat and the fan together (`useDesk` `fitBox`), so the controls and the raised card stay in the stage. 360 ms transform transitions, none under reduced motion.
- Actions: `desk.fanOut`, `desk.stackUp`, `desk.sortStack`, `desk.flipCard` (`src/desk/leadDesk.tsx`, the route's guard). Keys: Enter on a focused social card flips it; Tab walks the bar (Fan / Stack, Sort, Flip, To work mat, Close) and the cards.

## Work mats (D-114, changelog 0041)

- Free mats after the process mats (`DeskMatDef.free = {cols: 9, rows: 4}`, rows grow; `DeskItem.at` places an object on a square, a taken square falls to the first free one in `layout.ts`, checked by `desk:check` on a synthetic work mat).
- They hold **references**, never copies: `lead:<id>` and `card:<lead>:<card>` drawn from the live rows, so a status change shows on the work mat too; the process card stays on its status sub-mat.
- Arrange by drag (mouse, finger, pen: `useDesk({ drag })`, 6 / 10 px threshold, snaps to squares on release, a taken square or a drop outside goes back with a toast), arrow keys on a focused object, the drawer's Move to… / Back to the process stack, or `desk.sendToWorkMat` / `desk.moveOnWorkMat` / `desk.removeFromWorkMat`; mats with `desk.addWorkMat` / `desk.renameWorkMat` / `desk.removeWorkMat` or the work-mat toolbar.
- Stored per person and page in the browser: `storageKey('desk.workmats.<code>')` = `{[userId]: {mats, entries}}` (`src/desk/workmats.ts`); W-04's Send to work mat writes A-08's key. Multiplayer later: mats carry ids, entries are keyed by mat + ref, and both are stamped `updated_at` on save, so a shared provider can replace the storage.

## Performance

Gestures move one transform through a ref + requestAnimationFrame; the zoom commits as CSS `zoom` layout (crisp text). Objects are memoised; the layout recomputes only when the model or the mats-per-row change. Caps and stacks keep a page desk under ~240 objects; the face budget turns the rest into plain tiles. Measured (changelog 0036): the biggest page desk, K-04 (997 rows on 6 mats), renders 183 objects, first object 742 ms after navigation on the production build at 1280 (app boot included).
