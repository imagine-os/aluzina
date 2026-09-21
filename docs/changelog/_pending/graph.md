# Pending changelog - K-04 graph views (pass 0013)

- worker: module worker 8 (Spaces graph)
- model: **Opus 5** (all code, docs and the visual checks in this draft)
- prompt: `docs/prompts/0012-graph-gallery-views.md` (Justin, Slack #all-aluzina, 2026-09-21 04:36 UTC, ts 1789965378.637029)
- codes: `K-04`

## What changed

K-04 was one picture (the dependency-free SVG force graph). It is now five, switched by `Tabs` and remembered in `localStorage` under `aluzina.graphView`:

| view | technique | gallery demo it is rebuilt on | dependency |
| --- | --- | --- | --- |
| **3D objects** (default) | ground grid, depth bands per node kind, a 220-step relaxation (link springs, body repulsion, band pull), a three.js primitive body per kind, the node's picture and label as sprites, curved line edges, spherical camera | `demos/three-objects-3d` (Justin's favourite) | three.js (lazy chunk) |
| **Lanes skill tree** | one swimlane per area or entity kind (six biggest, the rest packed into "Other entities"), one column per hop from the focus, cells wrapped into sub-columns, `linkHorizontal` curves | `demos/lanes-skilltree` | none |
| **Radial tree** | focus at the centre, one ring per hop, each node placed at the mean angle of its parents, rings widened so tiles never touch | `demos/radial-tree-d3` | none |
| **Objects map** | image tiles packed into one framed, labelled cluster per lane, arced edges | `demos/d3-object-map` | none |
| **Force 2D** | unchanged `RelationGraph` (D-026), kept as the fallback | - | none |

**Nodes carry system imagery, not dots** (`graphImages.ts`): people and roles show the demo user's initials (Avatar rule), a node that opens a hub page shows the deploy-time thumbnail `./thumbs/<code>.jpg?v=<__BUILD_ID__>` with the hub's bilingual fallback tile (deliverables via `templateDocKind`, tools via `replacedByModule`, code or route path, validated against the registered routes), spaces show their `glyph`, posts a glyph per kind, catalog entries the glyph of the space about them. In 3D the same pictures are canvas textures on sprites with the label underneath.

Data model untouched: every view reads what `buildGraph` already returns, `?focus=` / `?depth=` behave as before.

## Files

Added (new organism folder, listed at `/#/dev/components`):

- `apps/hub/src/components/organism/GraphViews/types.ts` - `GraphViewId`, `ViewNode`, `ViewEdge`, `NodeImage`, `GraphViewLabels`, `GraphViewProps`, `GraphViewHandle`.
- `apps/hub/src/components/organism/GraphViews/layouts.ts` - `hopsFrom`, `neighbourMap`, `laneOrder` (with lane merging), `lanesLayout`, `radialLayout`, `objectsMapLayout`, `bandLayout3d`, `boundsOf`.
- `apps/hub/src/components/organism/GraphViews/env.ts` - `isWebGLAvailable` / `useWebGLAvailable`, `usePrefersReducedMotion`, `useDocumentHidden`, `useGraphPalette` (reads the design tokens and re-reads them when `data-theme` changes).
- `apps/hub/src/components/organism/GraphViews/NodeLayer.tsx` - the one interaction overlay (roving tabindex, 44 px targets, hover **and** focus card, touch select-then-open).
- `apps/hub/src/components/organism/GraphViews/NodeTile.tsx` - the SVG tile that draws a node's picture and label.
- `apps/hub/src/components/organism/GraphViews/SvgGraphView.tsx` - shared viewport (viewBox zoom / pan, imperative handle, clamped panning, fit floor).
- `apps/hub/src/components/organism/GraphViews/LanesView.tsx`, `RadialView.tsx`, `ObjectsMapView.tsx`, `Objects3DView.tsx`.
- `apps/hub/src/components/organism/GraphViews/GraphViews.tsx` (barrel + `React.lazy` for the 3D view), `GraphViews.css`, `GraphViews.meta.ts`, `GraphViews.example.tsx`.
- `apps/hub/src/modules/spaces/graphImages.ts` - `useViewNodes` / `useNodeDecor`.

Changed:

- `apps/hub/src/modules/spaces/GraphPage.tsx` - rewritten around the view switcher, the node cap, the fallbacks and the ten registered actions.
- `apps/hub/src/modules/spaces/specs.ts` - K-04 layout / logic / components / `checkedAt` [390, 1280, 1920, 2560] and four new actions.
- `apps/hub/src/modules/spaces/strings.ts` - the `spaces.graph.*` block (EN + ES).
- `apps/hub/src/modules/spaces/spaces.css` - `.spaces-graph-note`.
- `apps/hub/package.json` + `package-lock.json` - the three.js dependency.
- `docs/pages/K-04.md`, `docs/prompts/0012-graph-gallery-views.md` (new), this draft.

`RelationGraph/` was not touched.

## Dependencies added

| package | version | licence | size | why |
| --- | --- | --- | --- | --- |
| `three` | 0.186.0 (pinned, no caret) | MIT | 549.65 kB raw / **139.28 kB gzip** in the lazy `Objects3DView` chunk (33 MB in `node_modules`, tree-shaken at build) | the 3D objects view, the same version the gallery pins |
| `@types/three` | 0.186.0 (pinned, devDependency) | MIT | build-time only | three ships no types |

No other runtime dependency: the three 2D views, the layouts and the overlay are plain TypeScript, and no addon (`OrbitControls`, `GLTFLoader`) is imported - the camera controller and the object bodies are ours, so nothing is fetched at runtime. Measured with `npx vite build --outDir <scratch>` (a measurement only; the integrator runs the real build).

## Licence and attribution

The gallery repo (`imagine-os/graph-gallery`, commit `53e0b87b8ebd4daa7fe7d6a2ea58b900198e535f`) carries **no LICENSE file**, so **no gallery code was copied**: every technique was reimplemented against our data, tokens and components. The libraries the gallery surveys are named with their licences in `types.ts` and in each view's header comment (three.js MIT, D3 ISC, Apache ECharts Apache-2.0), and each view's doc comment names the demo it is rebuilt on with the live URL. The gallery's shared assets (simple-icons CC0, devicon MIT, lucide ISC, its own thumbs / avatars / models CC0) are **not** vendored - our pictures come from our own system.

## Real vs Placeholder

Everything on the page is real over the seeded rows; no `Placeholder`. Page-thumbnail nodes show the hub's "no preview yet" tile with their page code until a deploy has run `npm run thumbs` (same behaviour as the hub cards, not a placeholder control).

## Requests for shared code (integration pass)

1. **`useWebGLAvailable` / `usePrefersReducedMotion` / `useDocumentHidden`** live in `GraphViews/env.ts` today. They are app-wide concerns (the canvas D-07, the simulator D-08 and any future map will want them): please move them to `src/design/` or `src/app/` and re-export.
2. **A `Tooltip` atom.** The hover/focus card is drawn inside the organism because the library has none (P-07 says pages never hand-roll a tooltip). One atom with the "shows on hover **and** focus, never hover-only" contract would replace it.
3. **Thumbnail codes as data.** `graphImages.ts` guesses which nodes have a page by parsing `deliverables.templateDocKind` and `tools.replacedByModule`. A `pageCode` field on those entities (or a shared `pageCodeFor(type, id)` helper next to the manifest) would make it explicit; also worth adding K-04 itself and the other `K-0x` routes to `scripts/thumbnails.mjs` so graph nodes pointing at Spaces pages get a real picture.
4. **`core.thumb.none`** is the hub's fallback string; K-04 uses its own `spaces.graph.noPreview` because the organism takes its strings from the page. If a shared `core.graph.*` block is ever added, these keys can move.
5. Nav / kanban: no new route, no new permission, no new entity.

## Proposed decision

> **D-0xx | 2026-09-21 | The graph views adopt the imagine-os graph gallery, and three.js is accepted for the 3D view.** K-04 offers five views over the same graph data - 3D objects (default), Lanes skill tree, Radial tree, Objects map and the dependency-free Force 2D fallback - rebuilt on the techniques of `imagine-os/graph-gallery` (no code copied; the repo has no licence file). `three` 0.186.0 (MIT, 139 kB gzip) is a runtime dependency, loaded only by the lazy 3D chunk: this **partially supersedes D-026's "the graph uses our own deterministic force layout (no dependency)"** clause - the 2D views and the fallback stay dependency-free and deterministic, and a device without WebGL or with reduced motion gets the 2D graph automatically. Nodes carry system imagery (initials, deploy-time page thumbnails, space / post / catalog glyphs), never bare dots. | Justin asked for these views by name and for pictures from the actual system; the 3D view is not reachable without a WebGL engine, and writing one would cost far more than a pinned, lazy-loaded MIT dependency, while every 2D path stays free of it. | 0012 | proposed

## Verified widths and checks

- Live at `?as=founder#/founder/spaces/graph`, focus `spaces:sp-role-owner`, depth 2 (35 nodes / 48 links): **390, 1280, 1920, 2560, 3840**; light and dark at 1280.
- Zero console errors and zero page errors in all five views at every width; `scrollWidth === clientWidth` everywhere; the canvas / SVG fills its container exactly (3840 -> 3134 x 1473 CSS px).
- Hit targets: 44 px at 390 / 1280, 50 px at 1920, 66 px at 2560, 88 px at 3840.
- Keyboard, all four gallery views: Tab reaches the graph, ArrowRight moves to a neighbour, the card shows on focus, Home returns to the focus node, Enter opens `/founder/spaces/sp-role-owner`.
- `npx tsc --noEmit` clean. The build was not run (the integrator builds); chunk sizes come from a scratch `vite build`.

## Known issues / follow-ups

- **Label collisions.** In dense cells the tile labels still overlap (worst in the 3D view and in the biggest map cluster). A collision pass (hide labels below a zoom threshold, or stagger them) is the obvious next polish.
- **Fit is a floor, not a promise.** Below 38 % labels stop being readable, so "Fit" stops there and starts on the focus node instead; very large graphs need panning or "Show all" off.
- **3D framing.** The camera frames the whole ground disc, so a lopsided graph sits off-centre. Framing the focus neighbourhood instead of the bounds would look better.
- **Node cap at 140** is a guess, not a measurement; 35 nodes is all the seed gives. Worth re-checking once a Slack import lands (K-06).
- Screenshots for `docs/screenshots/K-04/` were not regenerated (the integrator's screenshot step runs against a build; the 3D tab needs `--use-gl=swiftshader --enable-unsafe-swiftshader` in the runner, otherwise it captures the Force 2D fallback).

## Kanban / plan lines for the integrator

- `kb-graph-gallery-views` - **done** (Opus 5): K-04 rebuilt on the graph gallery, five views, system imagery, three.js lazy chunk. Codes K-04. Depends on: pass 0013 foundation.
- `kb-graph-label-collisions` - **next**: label collision pass for the graph views (hide / stagger labels by zoom), Opus 5. Depends on `kb-graph-gallery-views`.
- `kb-graph-thumb-codes` - **next**: make the page code behind a deliverable / tool explicit data and add the `K-0x` routes to `scripts/thumbnails.mjs`, Sonnet 5. Depends on `kb-graph-gallery-views`.
- `kb-tooltip-atom` - **backlog**: add a `Tooltip` atom (hover **and** focus) and move the graph card onto it, Opus 5.
- `kb-webgl-hooks-shared` - **backlog**: move `useWebGLAvailable` / `usePrefersReducedMotion` / `useDocumentHidden` out of `GraphViews/env.ts` into shared code, Sonnet 5.
