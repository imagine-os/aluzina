version: 0.24.4 (from 0.24.3: the desk's paper objects and the lead dossier fan redesigned; no route, action, entity, seed or `SEED_VERSION` change)
date: 2026-09-30
prompt: 0032
intent: style(desk): make the documents and templates laid out on the mats (and a lead's fanned dossier) prettier: ink on warm paper, one band of colour per service, a real silhouette per kind, a type hierarchy on every face, placed by hand; still crisp at 300 % and readable from a mat's fit, no clipping, no new layers.
decision: D-117 (paper and the five service colours are tokens; desk objects never use raw colours)
rejected: image textures or clip-art (procedural only); a veil element on the fan's plane to dim the mat (a mat-sized translucent layer that the software compositor mis-sorted against the cards: a grey stripe across the fan; the mat's materials step down instead); positioned spans inside a solid's top face (tab, plate, stencil as `position: absolute`: each became a compositor layer where it overlapped a neighbour's side, K-04 561 -> 675 layers; now flow layout, negative margins for the tab); per-card font-size clamps at zoom (the zoom rasterises; sizes are em of the face); network brand colours as new tokens (muted mixes of existing tokens instead)
files: apps/hub/src/desk/paper.ts (new: bands, turns, `faceBox`, `drawnBox`, `fitTitle`), apps/hub/src/desk/{DeskObject.tsx (the paper faces),DeskStage.tsx (sub-mat kind glyph),dossier.tsx (uniform arc, `cardVars`, library Button / Select strip),leadDesk.tsx (fanned mats dim, fit to the new geometry),PageDesk.tsx (`service` from `serviceCode`, paper fonts shared),types.ts (`DeskItem.service`, paper geometry, box t 20),depth.ts (comment),strings.ts (5 face strings),desk.css}, apps/hub/src/modules/desk/model.ts (`service` on services, checklists, deliverables, kits), apps/hub/src/design/tokens.ts + apps/hub/src/tenant/brand/tokens.values.ts + apps/hub/src/styles/tokens.css (paper + 5 service tokens), apps/hub/src/modules/design/TokensPage.tsx (the new rows), scripts/desk-check.mjs (turned faces stay in their squares), docs/{design/desk-system.md,decisions.md,pages/W-04.md,pages/A-08.md,README.md,kanban.md,build-plan.md,plan/plan.json}, tenant.json, package.json, apps/hub/package.json, docs/screenshots/W-04/{en-1280,en-1280-lead,en-1280-crisp-300,en-3840}.jpg, docs/screenshots/A-08/en-1280-dossier-fan.jpg
codes: W-04, A-08, A-03 (and every page desk: A-xx, O-xx, S-xx, G-xx, K-xx, W-01..W-03)
model: Opus 5.5 (build), Fable 5.1 (brief)

# 0045 - Desk paper objects redesigned, cleaner fans

Before, every paper object was a pale grey rectangle with a few grey lines: flat, low contrast, all alike. Now each is ink on warm paper with a thin band of colour, a silhouette you can tell at a glance and a heading you can read.

## Paper and colour (tokens, D-117)

- `--color-paper`: `#FBF8F1` light, `#EEE8DC` dark (paper stays light on the dark desk; the desk and mats darken instead), with the existing SVG grain; a 1 device-px ink edge on its bottom and right (`--desk-edge-ink`), a grounded shadow (a tight contact shadow and a soft one that grows with the thickness).
- A band on top (about 6 % of the face) carries a tiny caps code: "03 · Stage 11", "G-01 · Mandatory rule", "Quote", "Form".

| Service | Ladder word | Token | Light | Dark | Derived from |
| --- | --- | --- | --- | --- | --- |
| 01 Creative Digital Consultation | Clarity | `--color-service-clarity` | `#8FA5E6` | `#8499DB` | periwinkle `#C2D1F7`, deepened |
| 02 In-Person Consultation | Direction | `--color-service-direction` | `#4FD3BC` | `#45C2AD` | aqua `#82FEE7`, deepened |
| 03 Comprehensive Interior Design | Definition | `--color-service-definition` | `#A9CF47` | `#9DC040` | lime `#DDFF79`, deepened |
| E Execution / Construction | Materialization | `--color-service-materialization` | `#BC9C68` | `#AF9060` | gold `#98876D` toward its highlight |
| 04 Interior Styling | Soul | `--color-service-soul` | `#B09BD6` | `#A28DCB` | periwinkle warmed toward violet |

Objects that are not a service take their band from the row's status tone (page desks: the pill's tone mixed 58 % into paper) or a graphite step per kind (sheet 20 %, checklist 27 %, card 30 %, form 34 %, box 36 %, document 40 % ink); rule cards keep the iridescent rule, team and KPI cards the metal. Every band carries ink text.

## Per kind

- **Sheet**: its top-right corner folds over: the face is cut along the fold (a paint clip on the flat objects plane), the fold is the lighter back of the paper with a crease and a soft edge; the focus ring rides on the paper's edge.
- **Form**: 5 to 7 field rows (the label and a rule to write on; blanks when the form has fewer fields) and a signature line with "Signature · n fields" at the foot.
- **Checklist**: title, 3 to 6 real items with square tick boxes (1 device px), "n items" at the foot; whole rows only (the row count is computed, never clipped mid-row).
- **Document**: a cover tinted by its band (title, a short band-coloured rule, subtitle, the brand monogram, "n pages") on three page edges offset bottom-right (the shadow's offset copies, each with its own ink edge); the front side shows the page stripes.
- **Folder**: manila, a real tab above the face in the band colour carrying the code, papers showing at the top edge, a label plate with the name and the ladder word, 2 or 3 preview lines beside it, the count at the foot.
- **Box**: kraft lid with its rim, the lid's skirt and a seam on every side face, the code stencilled on the lid, a label plate with the kit's name under a band; thickness 18 -> 20.
- **Card**: stiff, rounded corners, a coloured rule down its left edge; a rule's text reads as a sentence, a short title as a caps heading.
- **Token**: unchanged apart from the paper edge rules. **Light tiles** keep their glow and adopt the band (the record's tone), the caps title and the paper face.
- **Type**: titles in the heading face (bold caps, 0.05 em tracking) sized by `fitTitle` (the largest size, measured on a canvas in the face's own font, at which the longest word fits and the title fits its line budget), a body-face preview (0.8 em), a caps footer (0.56 em). 1 em = 4 world px on paper faces, so the markup scales for the drawer and the legend.
- **Placement**: a deterministic turn of at most ±1.5° from the object's id on paper kinds (not devices, tokens, lights or profile cards); every face leaves at least 4.8 px to the next square turned. `desk:check` now also fails a turned face (with its tab or page edges) that leaves its squares: 0 on every model at seven widths.
- **Sub-mat labels** get a small glyph of the kind they mostly hold (the `Icon` atom).
- **Legend and drawer** draw the same face with its shadow and edges.

## Fans (lead dossiers, A-08 / A-03)

- A uniform arc: cards turn about a point 760 world px under the middle card, evenly spaced (at most 96 px apart, 7.5° a card), shrunk evenly until the turned end cards fit the mat; the placement is custom properties (`--x --y --z --r --s`) the stylesheet composes into one transform, so a change of mode, focus or hover interpolates.
- The focused card rises 16 px and comes fully upright and to the front; a hovered or keyboard-focused card lifts 6 px and comes upright.
- While a fan is open its mat dims a little (the mat's felt, linen, paper, manila and kraft step down; no veil layer, no filter).
- Card fronts follow the paper rules: a band per kind with the kind in caps (Contact periwinkle, Company gold, Qualification lime, Commercial aqua, Notes graphite; social cards the network's colour muted: Instagram rose, LinkedIn / Facebook blue, TikTok teal, WhatsApp green, Website silver), the edge rules and grounded shadows, caps titles.
- The control strip is the library's `Button` (primary / secondary / ghost) and `Select` on a surface strip, at half size inside the world.

## Layers (CDP LayerTree, headless Chromium 1194, 1280 x 900, DPR 1)

| Desk | Before (0.24.3) | After (0.24.4) |
| --- | --- | --- |
| K-04, fitted | 561 | 561 |
| W-04, fitted | 420 | 417 |
| A-08 | 200 | 198 |
| A-08, a dossier fanned | 215 | 220 (+2 %: the strip's two primary buttons and one mat state) |
| O-12 | 178 | 177 |

Found on the way: a clipping or positioned span inside a solid's top face (document, folder, box on the bodies layer) becomes a compositor layer of its own wherever it overlaps a neighbour's side or a fan (the first build of this pass: K-04 675, A-08 fanned 256). The band's code no longer clips itself (the face clips it), the tab and the plates are in the flow, and titles on solids do not clamp their own lines (fitTitle sizes them to the budget); the drawer and the legend keep the clamp.

## Verification

`npm run build` green (strict tsc, `tokens`, Vite, `tenant:validate`, `desk:check` with the turn check). Looked at, before and after side by side: W-04 at the Lead, Development and Delivery mat fits (71 %), 300 % on the forms, the Development checklists, the service folders and the delivery kits, the Legend, 3840; A-08 with a dossier fanned (93 %) and at 300 %; O-12 fitted and at 150 %; K-04 fitted; light and dark (W-04 Lead, the folders at 300 %, the A-08 fan). Before / after shots (same names): the pass's scratchpad `w04-pretty/{before,after}/`; committed: `docs/screenshots/W-04/{en-1280,en-1280-lead,en-1280-crisp-300,en-3840}.jpg`, `docs/screenshots/A-08/en-1280-dossier-fan.jpg`.

Known limits: at a mat's fit on 1280 (71 %, size M) a sheet's 5-6 px caps title is about 4 px on screen: the folder and document titles read, the checklist titles read from 100 %; the faces cannot grow without a larger square. Screenshots were taken with the system fallback face (the sandbox cannot load Rubik); fitTitle measures whatever face is live.
