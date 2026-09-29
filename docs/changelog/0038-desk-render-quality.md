version: 0.22.1 (from 0.22.0: rendering and input quality of the desk engine, the six polish defects of QA 0008; no route, entity, action, seed or `SEED_VERSION` change)
date: 2026-09-29
prompt: 0031
intent: Make every desk (W-04 and the 53 page desks) render clean and smooth: crisp text at every zoom, nothing clipped where 3D objects overlap, 60 fps pan and zoom on the biggest desks; and close the polish defects of QA 0008.
decision: D-107 (one depth table for the whole desk; no clipping or containment inside the 3D context; only solid bodies join the 3D context; text rasterised at its final size)
rejected: `z-index` inside the 3D context (ignored by 3D sorting); `content-visibility: auto` for off-screen mats (clips inside `preserve-3d`); WebGL (loses native buttons, focus and the accessibility tree); a canvas snapshot of the text during gestures (a visible swap); one shadow layer for all mats (a desk-sized transparent layer that re-rasterised on every zoom: A-08 zoom p95 33 ms, back to 17 ms with the shadows on the mats)
files: apps/hub/src/desk/depth.ts (new), apps/hub/src/desk/abilityLabels.ts (new), apps/hub/src/desk/{DeskObject.tsx,DeskStage.tsx,useDesk.ts,PageDesk.tsx,fields.ts,strings.ts,desk.css}, apps/hub/src/modules/desk/DeskPage.tsx (the pulse's Z from the table), docs/design/desk-system.md ("Rendering"), docs/decisions.md (D-107), docs/pages/W-04.md, docs/qa/0009-desk-render.md (new), docs/README.md, tenant.json (counters, version), package.json + apps/hub/package.json (version)
codes: W-04, A-01..A-09, O-01..O-13, S-01..S-13, G-01..G-09, K-01..K-06, W-01..W-03 (every desk: engine change)
model: Opus 5.5 (build and measurements), Fable 5.1 (brief)

# 0038 - Desk render quality: one depth order, crisp text, 60 fps gestures

Numbering: prompt 0030 and changelog 0037 were taken by the parallel hoy-hub pass (device objects) while this pass ran, so Justin's render / dossier prompt is 0031 and this pass is 0038 (rebased on `508da71`, device kinds kept and moved onto the new layers).

## What was clipping, and why

| Seen | Cause | Fix |
| --- | --- | --- |
| The followed project's status halo and the light tiles' glow veiled the neighbouring faces and the sub-mat label | the halo was a `::before` 0.5 px above the object in the same plane as its neighbours; light glows were box-shadows on the text-bearing face, painted over the next tile in DOM order | a glow layer (Z 2.5) under the sub-mat's objects plane (Z 3): halos, light glows and the lit tile's rings live there, faces carry an inset edge only |
| The current phase's light rings were cut by the next mat | the rings were the mat's own box-shadow; the next mat, same plane, painted over them | the rings are an element of their own at Z 0.5, before every mat (Z 1) |
| Faces and side faces flattened; focus rings and the folder tab clipped at some zooms | `overflow: hidden` + `contain: layout paint` on every face, side face, the station's desk top and the nameplate (both force `transform-style: flat` and clip) | removed from everything inside the 3D context; text is clipped by the 2D `.dp` spans inside a face; the stage frame is the only clip (script: 0 offenders on every desk) |
| Slivers near the stage edge at high zoom | documents' and folders' left / right faces: edge-on at the 22° tilt, extra compositor layers that the compositor mis-clipped under perspective | only boxes (18 px tall) keep left / right faces; documents, folders and devices keep the front face |
| A flicker line under the seated figures | chair, figure, props and nameplate stood exactly on the desk-top plane (a coplanar edge) and carried `filter: drop-shadow` in the 3D context | they stand 0.5 px above the desk top; no filters in the 3D context |
| The "+N more" pile read as a striped block | a slab with striped sides | three real sheets at three heights (Z 1.7 / 3.4 / 5), each nudged so its edge shows |
| The tooltip was cut by the full-screen frame and could sit under the toolbar | it lived inside the stage box | a portal on `body` (or on the fullscreen element), fixed position, flipped under its anchor near the top of the window |
| A focus ring could fall under the next object's shadow | coplanar objects paint in DOM order | a focused / selected flat object paints above its neighbours (`z-index` on the flat plane); a solid lifts 0.75 px |

## The depth table (`src/desk/depth.ts`, `--z-*` on `.desk-zoom`)

desk 0 · the current mat's light 0.5 · mat (felt, stitching, label, its own drop shadow) 1 · sub-mat 2 · glows 2.5 · objects plane 3 (label, hit areas, the one shadow per object, thin faces) · solid bodies at 3 + t (document 6, folder 8, box 18, token 4, pile 5, phone / tablet / screen 4) · focus / selected lift + 0.75 · station desk top mat + 22, stands + 0.5 above it · fanned dossier 28 (reserved for D-108) · pulse 40. DOM order is depth order, so at a zoom where two planes are closer than the compositor can tell apart the picture does not change.

## Layers: only solids join the 3D context

In Chrome every element of a 3D rendering context is a compositor layer of its own. The object buttons (hit areas), their shadows and the thin faces now sit in one flat objects plane per sub-mat, and the solid bodies render separately (`DeskBody`, `aria-hidden`, pointer-inert) on the sub-mat's bodies layer, their ring driven by the hovered / focused / selected state (`useDesk().hot`). Tab order, labels and hit areas are unchanged. Layers (CDP LayerTree, 1280 x 900): K-04 1 148 -> 567, W-04 following Casa Laureles 831 -> 460.

## Text

- CSS `zoom` at rest (text laid out at its final size); a scaled transform during gestures; at the end the zoom, the scale back to 1, the device-pixel snap and the end of `will-change` are written together in one frame (no visible jump).
- At rest the world's translation is rounded to whole device pixels; during gestures it is not (smooth).
- The flat view drops the perspective (and the camera transform) once the 520 ms tilt transition has run, so nothing is resampled; tilting brings it back at once.
- `-webkit-font-smoothing: auto` on light, `antialiased` + `-moz-osx-font-smoothing: grayscale` on dark; `text-rendering: optimizeLegibility`.
- No `filter` on text-bearing layers (the drawer's and the legend's previews use a box-shadow now); glows only on the glow layer.
- Thin lines never fall under one device pixel: `--hair` = 1 px / (zoom x devicePixelRatio) in world px; the felt grid, the stitching, sub-mat rules, light-tile and pile edges use `max(<design width>, var(--hair))`, and the felt grid's ink scales with its width (`--hair-ink`), so a zoomed-out desk keeps its tone instead of turning into a heavy grid.

## Smoothness

- Event coalescing: wheel, drag and pinch update the camera per event and write the DOM once per frame (`requestApply`).
- No layout reads in move handlers: the stage rectangle is read once per gesture and dropped on scroll / resize.
- `will-change: transform` and `pointer-events: none` on the world only while it moves (no hover restyles under a gliding desk); a press that interrupts a glide or a fly-to commits first, so the world never stays inert.
- One shadow per object; the minimap is its own compositor layer (`will-change`, `contain: layout paint`, outside the 3D context); the objects keep their memo (the stage's `moreLabel` is stable now, so a zoom commit or a trail step no longer re-renders every object). `content-visibility` is not used.
- Reduced motion: no inertia, instant camera moves (unchanged).

Frame times: Playwright, headless Chromium 1194 (software compositor, no GPU), 1280 x 900, DPR 1, stage at 60 % (K-04, A-08) / M (W-04); 120 wheel events over 2 s (ctrl + wheel for zoom, plain wheel for pan) or 120 pointer moves for a drag; `requestAnimationFrame` deltas; median of 6 runs per cell, p50 / p95 in ms.

| Desk | Gesture | Before (0.22.0) | After (0.22.1) |
| --- | --- | --- | --- |
| K-04, 183 objects | zoom | 16.7 / 50.0 | 16.7 / 33.4 |
| K-04 | pan | 16.7 / 16.8 | 16.7 / 16.8 |
| K-04 | drag | 16.7 / 33.4 | 16.7 / 33.3 |
| W-04, 168 objects, Casa Laureles followed, trail playing | zoom | 16.7 / 50.1 | 16.7 / 41.7 |
| W-04 (same) | pan | 33.3 / 50.0 | 16.7 / 16.7 |
| W-04 (same) | drag | 41.7 / 50.1 | 16.7 / 16.8 |
| A-08, 46 objects | zoom / pan / drag | 16.7 / 16.8 · 16.7 / 16.8 · 16.7 / 16.7 | 16.7 / 16.8 · 16.7 / 16.7 · 16.7 / 16.8 |

Steady pan and drag hold 60 fps on every desk. The zoom p95 that remains is the commit frame (the re-layout at the new CSS zoom that makes text crisp) plus the first frames of a zoom-in, where the compositor re-rasterises tiles the scale has uncovered; on a GPU machine these are shorter.

## QA 0008 polish defects (Sonnet pass, `docs/qa/0008-desk-system-smoke.md`)

1. **Spanish abilities** (D1): the drawer names each ability in the page language: a `desk.ability.<actionId>` string when the desk defines one, else the Spanish table in `src/desk/abilityLabels.ts` (all 172 actions that appear as abilities on a page desk), else the spec label; the refusal line is fully Spanish ("Hace falta pregunta y respuesta: complétalo en la página de abajo") and names the params by their labels; the button's title in Spanish says what it runs. 63 field / param labels added to the drawer's table (project type, about (kind / record), from / to, photo, logo, company, question, answer, owner, ...), and values of `projectType`, `projectStatus`, `source`, `channel`, `aboutType`, `direction` are labelled (Residencial, Construida, Formulario público, Instagram...).
2. **Legend** (D2): each kind's name is a heading line and its description a line of its own.
3. **Sub-mat labels** (D3): a long name takes two lines of the label strip instead of an ellipsis ("Templates & procedures", "Approved with adjustments"); mat and sub-mat labels show the engine's tooltip (full name, then "Sub-mat of <mat> · N objects") on hover and on focus.
4. **Tooltip on focus** (D4): any focus that does not follow a pointer press within 800 ms (Tab, a scripted `focus()`, focus restored by the drawer) flies the object into view and shows its tooltip; checked with a real Tab press on 32 matrix cells (QA 0009).
5. **Counts** (D5): the page desk's summary counts what is on the canvas and says what the stacks stand for ("44 objects on 3 mats (+ 175 more in stacks)"; K-01 "111 objects on 4 mats (+ 595 more in stacks)"); mat labels likewise ("40 objects + 12 in stacks").
6. **Toolbar rows** (item 6): at 2560 and 3840 the camera group (Reset included) and the view group stay on one row for K-01, O-12, A-08 and W-04 in EN and ES (the title's flex basis is 9 rem, so its summary wraps inside it before a group leaves the row). Under 768 px page desks still start as the collapsed bar; W-04 starts open.

## Verification

`npm run build` green (tsc strict, Vite, `tenant:validate`, `desk:check`). Scripted (`docs/qa/0009-desk-render.md`): W-04, A-08, O-12, K-04 x zoom 25 / 50 / 100 / 200 / 400 % x DPR 1 / 2 x light / dark x EN / ES = 32 cells, 160 zoom states: world on whole device pixels at rest, 0 elements with overflow / contain / filter in the 3D context, 0 clipped sub-mat names, no horizontal scroll, the tooltip portal on a real Tab press, 0 page errors. Screenshots looked at: W-04 tilted at 24 % (fit), 100 %, 300 % and 320 % (DPR 2), W-04 flat at 300 %, W-04 following Casa Laureles, A-08 (fit, stack at 200 / 404 %), O-12, K-04 (fit, 150 %), the ES drawer, the ES legend, W-04 dark DPR 2.
