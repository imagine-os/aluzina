# The desk system

The desk is how the Hub shows a page's things as physical objects on a zoomable desk (D-103, platform since D-106). The engine lives in `apps/hub/src/desk/`; W-04 (the Method desk) is its first client and every page of the four portals carries a desk above it.

## Concepts

- **Desk** (`DeskModel`): a page code, an ordered list of **mats**, the objects, optional people, a grouping line for the legend, and the mats-per-row rule.
- **Mat** (`DeskMatDef` -> `Mat`): a felt mat, 9 chess squares wide (1 square = 64 world px), as long as its content. On page desks one mat = one table (entity); on W-04 one mat = one client-journey phase.
- **Sub-mat** (`SubMat`, id `<mat>:<group>`): a lighter felt group inside a mat, 3 / 4 / 5 / 9 squares wide so small groups share a shelf. On page desks one sub-mat = one value of the table's grouping field (a status); on W-04 one group (services, statuses, forms...).
- **Object** (`DeskItem` -> `PlacedItem`): 1x1 or 2x1 squares, a kind with thickness (`GEOMETRY`), and a face that shows its real content (em-sized, so the drawer and the legend reuse it). Kinds: sheet, form, checklist, document, folder, box, token, card, light (W-04's followed project), stack (the "+N more" pile). Options: `pill` (status on the face), `plain` (title-only tile past the face budget), `font` (face size), `ref` (the row it is), `openAt` (the page it opens).
- **Person** (`DeskPerson`): a seated role figure at a small desk on a mat's near edge (W-04, D-104).
- Layout: `layoutDesk(model, perRow, people)` packs each sub-mat first-fit, shelf-packs sub-mats inside the mat and rows the mats; deterministic, grid-aligned, no overlaps (checked by script).

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

Toolbar (`role="toolbar"`, two groups that wrap as wholes): zoom − / % / +, Fit, Tilt, the mat Select, Reset | Legend, S / M / L, Full screen, Settings (Scroll wheel zooms), Hide desk on phones. Stage box (height = the size), tooltip, minimap, legend panel, handle, hint. Full screen: Fullscreen API on the frame, fixed overlay where missing; the Drawer portals into the fullscreen element. Sizes: S / M / L = 40 / 60 / 85 % of the viewport height, stored per page code; default M on W-04, S on page desks. Under 768 px page desks collapse to a bar with Show desk (W-04 starts open).

## Accessibility

Every object, mat label, sub-mat label and station is a native `<button>` with an `aria-label` that says kind, name, record and status; the stage is a focusable region (`aria-roledescription`, described by the hint); the zoom percentage is `aria-live`; toggles carry `aria-pressed`, the handle is a `separator` with `aria-valuenow`; nothing is hover-only (the tooltip repeats the label and also shows on focus), drag-only (buttons, keys and actions cover every move) or wheel-only. Focus rings on faces are divided by the zoom so they stay 3 px on screen. Reduced motion makes camera moves, inertia and the trail instant.

## Actions

`DESK_ACTIONS` (`src/desk/actions.ts`): `desk.zoom`, `desk.fit`, `desk.reset`, `desk.toggleTilt`, `desk.focusMat {mat}`, `desk.focusObject {object}`, `desk.openObject {object}`, `desk.fullscreen`, `desk.setHeight {size:enum:s|m|l}`, `desk.toggleWheelZoom`, `desk.legend`; appended by the registry to every route with a page desk (with its guard), registered while the desk is mounted (camera verbs by `useDesk`, object verbs by `PageDesk`). W-04 declares its own set in `modules/desk/specs.ts`.

## Performance

Gestures move one transform through a ref + requestAnimationFrame; the zoom commits as CSS `zoom` layout (crisp text). Objects are memoised; the layout recomputes only when the model or the mats-per-row change. Caps and stacks keep a page desk under ~240 objects; the face budget turns the rest into plain tiles. Measured (changelog 0036): the biggest page desk, K-04 (997 rows on 6 mats), renders 183 objects, first object 742 ms after navigation on the production build at 1280 (app boot included).
