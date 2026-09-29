version: 0.20.1 (from 0.20.0: W-04 gains a seated role figure at a desk on every mat, 2 new declared `desk.*` actions per surface; no route, entity, seed or `SEED_VERSION` change)
date: 2026-09-29
prompt: 0027
intent: Put "nice character models, professional characters at a desk for each mat" on the Method desk: one person per journey phase, standing for the role that owns it, clean and consistent with the desk's objects.
decision: D-104 (people on the desk are procedural vector figures representing playbook roles, not real staff; one per phase; the phase -> role mapping is data with a basis and an `inferred` flag)
rejected: downloaded 3D character models (glTF + three.js: a dependency and binaries, D-103), photos or likenesses of real people, faces with features (reads as a caricature of the real team), one figure per object (146 people would bury the objects), a top-down view of the person (reads as hair and shoulders, not as a person at a desk), an upright (90°) figure plane (foreshortened to 37 % in the tilted camera and invisible flat)
files: apps/hub/src/modules/desk/{deskPeople.ts,DeskPerson.tsx} (new), apps/hub/src/modules/desk/{model.ts,DeskPage.tsx,desk.css,specs.ts,strings.ts}, docs/pages/W-04.md, docs/screenshots/W-04/{en-390,en-1280,en-3840,es-1280,en-1280-dark,en-1280-lead,en-1280-drawer}.jpg (recaptured) + {en-1280-people,en-1280-person-drawer}.jpg (new) + routes.json, docs/prompts/0027-desk-people.md (new), docs/changelog/0034-desk-people.md (new), docs/decisions.md (D-104), docs/reference/surfaces.md (W-04 row, `desk.*` row, entry count, change log), docs/plan/plan.json (dk-02, version), docs/build-plan.md (row 17), docs/kanban.md (dk-02 Done), docs/README.md (latest counters), tenant.json (version 0.20.1, `docs.counters` 27 / 34 / 104, `actions` 439 / 418), package.json + apps/hub/package.json (version)
codes: W-04
model: Opus 5 (build), Fable 5.1 (brief)

# 0034 - Desk people (W-04): a seated role figure at a desk on every mat

## What changed

Every one of the ten journey mats gets a **station** on its near edge, below the sub-mats: a small desk, a chair and a seated professional, 5 x 3 chess squares (320 x 192 world px) centred on the mat. The mat grows by those rows (`layoutDesk(items, perRow, people)` adds them after the sub-mat shelves), so a station never shares a square with an object. The person stands for the **role that owns the phase**; a tent nameplate on the desk shows the demo user's first name and the playbook role (bilingual via `pick`).

## The mapping (`modules/desk/deskPeople.ts`)

The playbook does not assign stages to roles ("who does it" is its recommended next build, `docs/knowledge/service-playbook.md`), so each row carries a **basis**: `template` (the project template's phase `ownerRole`, checked against `TEMPLATES` at load; a mismatch demotes the row to inferred), `responsibility` (the role's own line in `ROLE_RESPONSIBILITIES`, p. 17), or `closest` (nobody is named; the closest role, `inferred: true`, to confirm with the founder).

| Phase | Role (portal role, demo person) | Basis | Inferred | Props |
| --- | --- | --- | --- | --- |
| 01 Lead | Creative Director (founder, Alejandra) | closest: client relations, every lead gets an owner (G-01) | yes | laptop (standing), phone |
| 02 Diagnosis | Interior Designer / Junior (studio, Sarai) | closest: visit and survey become references and plans | yes | clipboard, tape measure |
| 03 Brief | Administrative Assistant (ops, Miguel) | template: `phase-cierre` "Client close · first design payment" owner `ops` | no | contract and pen, calculator |
| 04 Analysis | Interior Designer / Junior (studio, Sarai) | closest: references, palettes, plans | yes | rolled plans, scale ruler |
| 05 Concept | Creative Director (founder, Alejandra) | template: `phase-diseno` DESIGN owner `founder` | no | sketchbook, pencil cup (standing) |
| 06 Development | Interior Designer / Junior (studio, Sarai) | responsibility: "design development" (the template's Planning and Quotation on this mat are `ops`) | no | sample box (standing), swatch fan |
| 07 Validation | Graphic / Brand Designer (brand, Angélica) | closest: presentations and revisions; final approval stays with the Creative Director | yes | presentation board on an easel (standing), approval stamp |
| 08 Delivery | Administrative Assistant (ops, Miguel) | template: `phase-produccion` PRODUCTION owner `ops` | no | hard hat (standing), site tablet |
| 09 Closure | Graphic / Brand Designer (brand, Angélica) | closest: delivery documents with the brand identity | yes | bound delivery book, keys |
| 10 Follow-up | Creative Director (founder, Alejandra) | closest: client relations after delivery | yes | mug (standing), rating card |

Six rows are inferred, four are sourced. Project Manager and External suppliers (no portal role yet) own no phase on the desk; the neutral look exists for them if a row ever maps to them.

## The figures (`modules/desk/DeskPerson.tsx`, `desk.css`)

- **Style**: layered inline SVG, stylised: a plain head shape with no features, a hair shape, neck, torso, arms reaching to the desk and hands on its edge; a thin ink outline. Each portal role has one look, so the same role looks the same on every mat: founder long dark hair, camel blazer over an ink top, silver necklace; studio hair in a bun, periwinkle cardigan over a white top; ops short hair, navy jacket, white shirt, aqua tie; brand curly bob, lime sweater, turtleneck. Four skin tones (deep, medium, tan, light) are `color-mix` of the brand's warm neutrals; every colour is a token or a mix of tokens.
- **Construction** (CSS 3D, like the objects): a flat rug of lighter felt (a mat on the mat), the desk as a lifted birch top (`translateZ(22px)`, the desk's wood-grain and paper-grain textures) with front / left / right faces, and the upright things as **pop-up planes** standing on their bottom edge and leaning back 26°: the chair back, the person (on the desk's back edge, so the desk hides them from the waist down), one standing prop, and the tent nameplate (40°). In the 22° camera the planes face the viewer almost square; flat (top-down) they keep 90 % of their height (the nameplate 77 %). 9 3D layers per station (rug, chair, person, desk top, 3 desk faces, standing prop, nameplate), 90 in all; flat props are drawn on the desk top face. One soft shadow under the desk. No animation.
- **Nameplate**: first name 20 world px bold, role 10.5 px (two lines max); the first names are recognisable at the whole-desk fit on 1280 (24 %); name and role read at any mat fit (81 % on the Validation mat).

## Interaction and actions

- Each station is a `<button>` (320 x 192 world px: 80 x 42 px on screen at the 1280 whole-desk fit, larger from any mat fit) after its mat's objects in the Tab order; keyboard focus flies it into view; the focus / selection ring is on the rug in brand aqua, width divided by the zoom.
- Activating it flies to the station at a zoom where the nameplate reads (beside the drawer) and opens the Drawer: a large flat portrait (chair, figure, standing prop, desk with nameplate), playbook role, portal role, demo person, phase, basis (inferred ones say "to confirm with the founder"), why here, responsibilities (`ROLE_RESPONSIBILITIES` note), and the phases this role owns on the desk (inferred ones marked).
- **Open portal** in the drawer footer is a `Button` wrapped in `Placeholder`: "Not wired yet – opening this portal: Studio portal (#/studio)" (the role's `ROLE_META` home).
- New actions on every W-04 surface, both registered while mounted: `desk.focusPerson {phase:string}` (phase id, 1-10 or label; flies and opens the drawer, answers e.g. "showing the Administrative Assistant (Miguel) at the Delivery mat") and `desk.openPersonPortal {phase:string}` (D-047: answers `not wired yet: Studio portal (#/studio)`). `desk.focusPhase` and the phase Select are unchanged.
- The subtitle now reads "146 objects and 10 people on 10 mats, one mat and one owner per phase…"; the mat labels and the phase Select keep counting objects only.

## Placeholder

Open portal (per person) joins the object drawer's Open. Both answer "not wired yet" and name their target.

## Verification

`npm run build` green (tsc strict, Vite, `tenant:validate` with 439 / 418 actions). Scripted at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 EN light, 390 / 1280 ES light, EN dark, ES dark: no horizontal scroll, 146 objects, 10 mats, 10 people, 0 object overlaps, 0 station / sub-mat overlaps in layout, 0 overlaps between the projected pop-up planes and any sub-mat on screen (tilted), no page errors. Tab order (label, objects, person), Enter opens the drawer, the Open portal toast, `desk.focusPerson` / `desk.openPersonPortal` / `desk.focusPhase` / `desk.focusItem` exercised with `prefers-reduced-motion: reduce`. Screenshots: `docs/screenshots/W-04/en-390.jpg`, `en-1280.jpg`, `en-3840.jpg`, `es-1280.jpg`, `en-1280-dark.jpg`, `en-1280-lead.jpg`, `en-1280-drawer.jpg` (recaptured with the people), new `en-1280-people.jpg` (the Validation mat fitted) and `en-1280-person-drawer.jpg` (the Concept owner's drawer).
