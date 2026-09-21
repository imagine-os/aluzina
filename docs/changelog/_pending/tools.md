# Draft for changelog 0013: builder tools module (Opus 5)

Merged into `docs/changelog/0013-*.md` by the integrator with the other module drafts.

- model: Opus 5 (page code, specs, strings, CSS and docs); plan data and the actions bus came from the foundation pass (Fable 5.1).
- codes: D-05 (plan viewer), D-07 (canvas), D-08 (demo simulator) — three new `built` routes on the `dev` surface, nav group `developer`, orders 20 / 21 / 22, permission `dev.tools`.

## Files

New module `apps/hub/src/modules/tools/`:

- `index.ts` — three `RouteDef`s: `/dev/plan` (D-05), `/dev/canvas` (D-07), `/dev/simulator` (D-08).
- `specs.ts` — `planSpec`, `canvasSpec`, `simulatorSpec` (20 actions in total, `checkedAt` 360 / 390 / 768 / 1280 / 1920).
- `strings.ts` — 122 `tools.*` keys, EN + ES complete.
- `PlanPage.tsx`, `CanvasPage.tsx`, `SimulatorPage.tsx`, `tools.css` (tokens only).

Docs: `docs/pages/D-05.md`, `docs/pages/D-07.md`, `docs/pages/D-08.md`, this draft.

No shared file was touched.

## What is real

- **D-05** reads `docs/plan/plan.json` through `src/plan` (`PLAN`, `planOrder`, `planDepth`, `planBlockers`, `planDependents`): stat tiles, search, status / model / step filters, the Kanban board, the sortable DataTable, the dependency swimlane with SVG arrows, and a drawer with the task, its blockers, its dependents (as links) and the repo files that carry it. 59 tasks render.
- **D-07** reads the live route manifest from `RoutesContext`: 92 routes grouped into 7 surfaces at the time of writing (105 once the other module workers' routes registered), each a `SurfaceCard` with the `./thumbs/<code>.jpg?v=<build id>` thumbnail, code, Built / Stub, name and `#path · shell · permission`. Zoom (− / + / Fit / preset Select / Ctrl + wheel) is a `--canvas-zoom` scale on the grid; card activation navigates and switches the session to the demo user of the surface when the current role lacks the permission.
- **D-08** runs the real app in a 390 × 844 phone iframe and a 1280 × 800 desktop iframe, both scaled to their column with a `ResizeObserver`, with route / role / language / theme controls, per-frame "Open in new tab", a sync toggle and four presets.

## What is a Placeholder (P-09)

- D-05 "Move a task": the plan is edited in `docs/plan/plan.json` in the repo (D-037). The `tools.movePlanTask` action answers with where the edit belongs instead of changing anything.
- D-08 presets whose route is not registered yet (in this pass: `/client` and `/services` until the client and public modules land). They un-Placeholder automatically when the route registers.
- Nothing else on the three pages is unwired.

## Decisions I propose

1. **The plan timeline is a dependency order, not a date axis.** The `Timeline` organism needs `start` / `end` dates and the plan deliberately has none (D-037: tasks are bound by dependencies, not calendar days). Rather than invent dates — which would print fabricated "15 Jan – 20 Jan" text next to every bar — D-05 draws a swimlane: one lane per build-plan step, a task in the column of its `planDepth`, arrows as an SVG overlay, every dependency also written as text. Proposed as a decision so the next roadmap view does the same.
2. **Read-only plan in the product.** The product shows the plan; the repo owns it. Any future "edit the plan here" needs a writer for `docs/plan/plan.json` and a rule for keeping `build-plan.md` and `kanban.md` in step, which is a decision for Justin, not a button.
3. **The canvas never scrolls sideways.** Zoom is `width: calc(100% / zoom)` + `transform: scale(zoom)`, so zooming reflows the columns instead of creating a horizontal scrollbar. Proposed as the house pattern for any zoomable stage.
4. **The simulator is same-origin on purpose.** The frames share this tab's storage, so the demo needs no message protocol today; the cost is that the parent's language, theme and (on the next reload) demo user follow the simulator, and each frame appears in the presence bar. The page states this in a note. If we want live control without reloads, that is a `postMessage` protocol in the app — see the requests below.

## Requests for shared code (integration pass)

1. **`scripts/thumbnails.mjs` targets for the new codes** — `{ code: 'D-05', path: '?as=dev#/dev/plan', wait: '.dshell__main' }`, the same for `D-07` (`#/dev/canvas`) and `D-08` (`#/dev/simulator`). Until then the hub cards and the canvas show the bilingual "no preview yet" tile for them. (D-08 captures two iframes of the app; a longer `wait` may be needed.)
2. **`DeviceFrame` component (library, molecule or organism)** — real device size + scale-to-column via `ResizeObserver` + caption + "open in new tab"; extracted from `SimulatorPage`. Wanted sizes: phone 390 × 844, tablet 768 × 1024, desktop 1280 × 800, TV 1920 and 3840 for the 10-foot check.
3. **`ZoomStage` component (library, organism)** — the scrolling frame, the `--canvas-zoom` property, the − / + / fit / preset controls and the fit maths; extracted from `CanvasPage`. The QA hub and any future whiteboard want it.
4. **`DependencyLane` component, or a dateless mode on `Timeline`** — rows ordered by dependency with depth columns and the SVG arrow overlay; extracted from `PlanPage`. `Timeline.meta.ts` already lists "plan viewer (later)" as a usage, so either the meta's usage line or the component should change.
5. **A `postMessage` seam in the app** (`aluzina.setLang / setTheme / navigate`, accepted only from the same origin) so the simulator can drive the frames without reloading them, and so scripted demos become possible.
6. **`docs/reference/surfaces.md`**: add the three routes and the 20 actions below; note that `window.__aluzina.actions` now covers the plan viewer, the canvas and the simulator.
7. **`docs/kanban.md` / `docs/plan/plan.json`**: D-05, D-07 and D-08 are built — the step 4 / step 13 cards that carry those codes can move, and the plan viewer now renders whatever the file says about itself.

## Actions added (20)

`tools.switchPlanView`, `tools.searchPlan`, `tools.filterPlanStatus`, `tools.filterPlanModel`, `tools.filterPlanStep`, `tools.openPlanTask`, `tools.movePlanTask` (D-05); `tools.zoomCanvas`, `tools.fitCanvas`, `tools.filterCanvasSurface`, `tools.filterCanvasStatus`, `tools.searchCanvas`, `tools.openCanvasPage` (D-07); `tools.simulateRoute`, `tools.simulateRole`, `tools.simulateLang`, `tools.simulateTheme`, `tools.openSimulatedTab`, `tools.toggleFrameSync`, `tools.applyDemoPreset` (D-08).

Three of them are not in the module brief and were added because the control exists and P-05 says every control is declared: `tools.filterPlanStep` (the step Select), `tools.filterCanvasStatus` (the status Select) and `tools.applyDemoPreset` (the preset buttons). The brief's `tools.movePlanTask` is declared and registered, and answers rather than acts.

## Verification

- `npx tsc --noEmit` in `apps/hub`: no error in `src/modules/tools/` (the only error in the tree was another worker's half-written `founder/LeadsPage.tsx` import). No `npm run build` (the integrator builds).
- Playwright against `vite --port 5181`, opened with `?as=dev`: all three pages at **360, 390, 768, 1280, 1920 and 2560** — no page errors, no horizontal page overflow at any width; light and dark both checked on D-05.
- All 20 actions verified live via `window.__aluzina.actions.list()` on their page; `tools.switchPlanView`, `tools.filterPlanStatus`, `tools.openPlanTask`, `tools.movePlanTask`, `tools.zoomCanvas` and `tools.fitCanvas` run through `window.__aluzina.actions.run` and returned readable results.
- The only console errors were `ERR_CERT_AUTHORITY_INVALID` for Google Fonts, which is the sandbox proxy, not the app.

## Known issues / follow-ups

- 2560 and 3840 were checked for overflow only, not read at ten feet; `checkedAt` records 360 / 390 / 768 / 1280 / 1920 accordingly.
- No screenshots in `docs/screenshots/D-05|D-07|D-08/` this pass (they need a `npm run preview` build, which the integrator owns).
- The dependency swimlane is tall (one row per task, ~20 000 px of scroll for 59 tasks at 1920). A collapse-by-lane control, or a compact mode that packs several tasks per row when their depths differ, is the obvious next pass.
- D-07 "Fit" converges in one press for typical content but can need a second press when the reflow changes the column count a lot; that is inherent to reflowing zoom and is why Fit snaps *down* to a preset.
- The canvas opens a page by navigating away; a "preview in place" (a `DeviceFrame` inside the card) would keep the person on the canvas and is the natural merge of D-07 and D-08.
