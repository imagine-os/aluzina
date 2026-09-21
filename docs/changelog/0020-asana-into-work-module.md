version: 0.12.0
date: 2026-09-21
prompt: 0018
intent: The Asana material becomes the project-management system Justin described: tasks nest for real, link to the deliverable they produce and name who is on them; the founder's workflow becomes one bilingual template with a "create project from template" page (W-03); her PROYECTO HOY export is seeded onto the HOY project by a repository script, with the identity question kept open.
decision: D-062, D-063
rejected: a `project_templates` table (templates are typed data in `src/domain/templates`, like the playbook, D-033); a runtime CSV uploader on K-06 (the import is `npm run import:asana` emitting reviewable seeds, D-062); renumbering the founder's hand numbers in the template (`order` carries the order; two `16.` siblings are hers); storing zone-scoped tasks eleven times (generated at creation); cleaning `Terraza federico` / `Apartment , semco` out of the imported HOY titles (D-063); keeping the invented HOY tasks next to the imported tree (one project, one tree); inventing dates so the HOY timeline looks full; a new `Stepper` organism (W-03 uses the library `Tabs` + `Card`; the request stays on the kanban); capturing the live Pages URL (denied in earlier passes, captures are from a local `npm run preview`)
files: apps/hub/src/data/schema/projects.ts, apps/hub/src/data/seed/{index,projects,work,spaces}.ts, apps/hub/src/data/seed/asana.ts (new), apps/hub/src/data/seed/asana/{types,hoy,portfolio}.ts (new, two generated), apps/hub/src/domain/templates/{index,types,aluzina-workflow}.ts (new), apps/hub/src/work/{model,useWork,sample}.ts, apps/hub/src/components/organism/{WorkList,WorkBoard,WorkTimeline,WorkHeader,TaskDetailDrawer}/*, apps/hub/src/modules/work/{NewProjectPage.tsx (new),WorkPage.tsx,specs.ts,strings.ts,index.ts,work.css}, apps/hub/src/modules/spaces/{ImportPage.tsx,specs.ts,strings.ts}, apps/hub/src/modules/founder/useApprovals.ts, apps/hub/src/auth/permissions.ts, apps/hub/src/i18n/core.ts, scripts/import-asana.mjs (new), scripts/screenshots.mjs, package.json, docs/prompts/0018-asana-into-work-module.md, docs/changelog/0020-asana-into-work-module.md, docs/decisions.md (D-062, D-063), docs/pages/{W-03.md (new),W-01.md,W-02.md,K-06.md}, docs/screenshots/{W-01,W-02,W-03}/*, docs/knowledge/{deliverables,asana-conventions}.md, docs/reference/surfaces.md, docs/kanban.md, docs/plan/plan.json, docs/README.md
codes: W-01, W-02, W-03, K-06
model: Fable 5.1 (design of the data model, the template merge and the page), Opus 5 (implementation, import script, screenshots, docs)

# 0020 - Asana into the Work module: nesting, deliverables and a project template

Justin, in the thread of prompt 0015: the Asana material "is supposed to be for the project management system of the aluzina Os which relates to assigning tasks for new projects and things like that, as well as lincoln tasks to deliverables, who's working on them and so on". Three things were missing for that: tasks could not nest (only a flat checklist), nothing said which deliverable a task produces, and a new project started empty while the founder duplicates a 349-task Asana project by hand. This pass adds all three and puts her real PROYECTO HOY tree into the OS.

## A. Data model

`Task` (`src/data/schema/projects.ts`) gains four nullable fields (D-062):

| field | what it is |
| --- | --- |
| `parentTaskId` | the real tree; the existing `subtasks[]` checklist is untouched |
| `deliverableId` | the `deliverables` catalog row this task produces |
| `externalId` | `asana:1215258003746641` for an imported row, null for a row born here |
| `templateTaskId` | the `TemplateTask.id` a generated row came from |

All four default to null through `TASK_DEFAULTS` (`seed/projects.ts`), so every existing seed row and every `create('tasks', …)` path carries them; the two `data.create('tasks', …)` calls in `founder/useApprovals.ts` and the `work/sample.ts` example rows were extended. `SEED_VERSION` 7 -> 8 so existing browsers re-seed. `WorkContext` gains `deliverables` (id + name, read from the catalog by `useWork`) and `WorkFilters` gains `deliverable` (a catalog id, or `none`).

New helpers in `src/work/model.ts`, so no view re-implements the tree: `childCounts`, `topLevel`, `nestRows` (parent-first rows with depth, sorted at each level, collapsible), `ancestorTitles`, `deliverableOf`.

## B. The template and the import script

**`src/domain/templates/`** (typed data, no React, like `domain/playbook.ts`): `ProjectTemplate -> TemplatePhase -> TemplateTask`, `Zone`, `Trade`, plus `templateCounts()` (what the review step shows) and `expandTemplate()` (the rows to write, parents before children). `ZONES` is the founder's eleven spaces with English names from her English chronogram; `TRADES` is her sixteen.

`tpl-aluzina-workflow` merges her two living Asana templates: the Spanish **ALUZINA WORKFLOW FOR EVERY PROJECT** tree is the spine (DISEÑO, PLANEACIÓN, COTIZACIÓN, PRODUCCIÓN), **PROYECTO HOY**'s kickoff section `Cierre de cliente` is phase 0 (CONTRATO, FACTURACION, SUBIR FOTOGRAFIAS…), and **WORK CHRONOGRAM ALUZINA ENGLISH** supplies the `en` labels where a task matches. The file header names what is deliberately left behind (the 2023 `Untitled section` one-offs, INFORMACION DE CLIENTE, PAGOS DE CLIENTES amounts, the PISOS day-by-day curing tasks, the twelve-space botany list, the per-project luminaire shopping list, `10. DISENOS REQUERIDOS PARA SEMCO`, `Terraza federico`, `Apartment , semco`, the brand-specific purchase lines) and states that **`en` labels without an Asana source are the integrator's translations (D-004)**. Her hand numbering stays verbatim in the titles, including the two `16.` siblings of PRODUCCIÓN: `docs/knowledge/asana-conventions.md` records the number as an ordering hint and `tasks.order` carries the real order.

Template as measured by `templateCounts`: **5 phases, 159 template tasks, 3 zone-scoped subtrees, 16 distinct deliverable types (21 links), owners founder / studio / ops**. With all eleven zones it expands to **279 tasks**; with two zones, 171.

Deliverable links follow the mapping Fable specified: mood board -> Mood board, `3. 2D Acad Model` -> Site survey and measurements, `13. 2 2D planos` -> Technical drawings set, `13. Modelado 3D` and `14. MIGRAR` -> Render pack, `10. Esquema … iluminación` -> Lighting concept, `15. DISEÑO LUMÍNICO` -> Lighting plan, `13. 3` / `13. 4` -> Furniture and elements schedule, the two client meetings -> Concept presentation and `ENVIO DE PRESENTACION` -> Final presentation, CONTRATO -> Contract, COTIZACION 1 -> Budget and quote comparison, COTIZACION 2 -> **RFQ packet per trade (new)**, Cronograma -> Project schedule, `25. Client deliver` -> Handover package, `23.` / `26.` -> Punch list, FACTURACION -> **Invoice (new)**. The two new catalog rows are in the `deliverables` seed (27 rows) and in `knowledge/deliverables.md`.

**`scripts/import-asana.mjs`** (`npm run import:asana`, no new dependency; a small RFC 4180 parser handles the multi-paragraph notes and the eleven repeated `SEMANA` columns). It resolves Asana's name-based `Parent task` in file order — names repeat, most carry trailing spaces and one parent's name is a single space — by treating a contiguous run of rows naming the same parent as one candidate and advancing at each break. What it printed on this run:

```
import:asana  source 2026-09-21
  PROYECTO HOY        212 tasks in 4 sections; 170 nested, 19 linked to a deliverable, 15 assigned in Asana
  portfolio board     18 vendor jobs; 12 with ENCARGADO, 10 with VALOR, 14 payment lines
```

The HOY tree comes out 42 roots / 91 at depth 1 / 59 at depth 2 / 20 at depth 3, no orphans, every task in a section. Assignees: `Aleja Guerra lotero` -> `u-alejandra`, `Saray` -> `u-sarai`; unassigned rows take the section default (Cierre de cliente, COTIZACION and PRODUCTION -> `u-miguel`, DISEÑO -> `u-alejandra`) except `21. Arte` and `22. Detalles de casa`, which stay the founder's as in Asana. `portfolio.ts` parses the vendor-job note form into typed rows (`encargado`, `empresa`, `valorCop`, `profitCop`, `payments[]`, dates, `description`, `responsibility`, plus the whole note); it is data for the purchasing pass and nothing renders it yet. Three parsing details the source forced: the largest number in a `VALOR` value is the total (`17.500M2=3.500.000`, `520 Dolares- 1.820.000`), a payment line's date is stripped before its amount (`PRIMER PAGO: 03/09/2026 1.300.000`), and a bare line only continues a prose field, so `ENTREGADO Y DESARROLLADO` does not swallow `PROFIT ALUZINA:0`. Both generated files are checked in: they are seeds.

## C. W-03 and the Work views

**W-03 "New project from template"** at `/#/<founder|ops>/work/new`, `projects.write`, mounted only on those two surfaces, reached from a primary button on W-01. Five steps on the library `Tabs` + `Card`: template (with its counts), project and client, phases (all on by default), zones (checkbox list from `ZONES` plus add-your-own), review (sections / tasks / zones / deliverables tiles and a `KeyValue` of every choice). Create writes one `projects` row (`pipelineStatus: briefing`, `phase: concept`, `approval: draft`), one `sections` row per chosen phase and the tasks parents-first, each with `templateTaskId`, `deliverableId`, `ownerRole`, the team member for that role as assignee, `order` and `parentTaskId`, then opens W-02. Eight `work.*` actions are declared **and registered** (P-05, D-036), so the whole flow is drivable from `window.__aluzina.actions` — verified end to end, including adding a custom zone.

Work views (W-01 / W-02): **List** renders nested tasks indented under their parent with a 44 px twisty per parent (keyboard-operable, `aria-expanded`), a deliverable badge on any task that has one, and a `↳ n` child count; **Board** and **Timeline** show top-level tasks only, each naming its child count, and the view tabs count what each view shows (Board 42 for HOY, not 212); the **drawer** gains a `parent › child` breadcrumb, a Deliverable `Select` over the catalog, and a read-only "Imported from Asana · asana:…" line; **Filters** gain Deliverable (including "No deliverable"). Three small quality fixes came out of the real data: an empty Asana title renders as "(untitled task)" instead of an unlabelled button, a long deliverable name wraps inside its badge instead of pushing out of a 390 px card, and the Timeline's empty state now says "Nothing is scheduled yet" with the reason instead of "No tasks match".

K-06 gains an **Asana import** card: the script, the two generated seeds with their counts read from the files themselves, and the sources. Read-only, no upload. Its title and nav label are now "Import from Slack and Asana" / "Imports".

`scripts/screenshots.mjs` gained three generic options this pass needed: `--name=<suffix>` (several captures of one code), `--storage=<json>` (seed localStorage, e.g. the remembered Work view) and `--scroll=<px>`; `routes.json` now keeps the union of a code's shots.

## D. PROYECTO HOY, and what is deliberately not asserted

`seed/asana.ts` (order 2) turns the generated data into rows on the existing `prj-hoy`: **4 sections, 212 tasks, 170 nested, 19 linked to a deliverable**, every row tagged `asana` and carrying its `asana:<Task ID>`. The project's invented tasks and sections were removed in the same pass (6 sections and 14 tasks from `seed/projects.ts` / `seed/work.ts`, plus the two comments and two activity rows that pointed at them; the `TaskDetailDrawer` example now opens a Casa Laureles task): one project, one tree.

**Not asserted** (D-063): that PROYECTO HOY *is* HOY Wellness Center, or that ZONE 1..11 are HOY's spaces rather than residue of the 2023 project the Spanish template grew out of. The project summary carries the flag in both languages — "Tasks imported from Asana PROYECTO HOY (created 2026-05-29); still the template's zones and vendors, pending the founder's adaptation" — and her wording is left alone, `Terraza federico` and `Apartment , semco` included. The export has no dates at all, so this project's Timeline is empty and explains itself; that is what Asana holds today, not a defect.

## E. Docs

Prompt 0017 (verbatim), this changelog, D-062 and D-063, `docs/pages/W-03.md` (new, from the template) and updates to `W-01.md`, `W-02.md`, `K-06.md`; `docs/README.md` page codes (W-03 used, next free W-04); `docs/reference/surfaces.md` (the W-03 route, the new `work.*` actions, `npm run import:asana`, the three new screenshot options); `docs/kanban.md` (the importer and the template cards to Done, four follow-ups added); `docs/plan/plan.json` (`kb-asana-importer` done with changelog 0020, three new tasks); `docs/knowledge/deliverables.md` (RFQ packet per trade, Invoice) and `docs/knowledge/asana-conventions.md` (change-log line pointing at the template file and the script).

## F. Verification

- `npx tsc --noEmit` in `apps/hub`: clean. `npm run build` from the root: green (bundle unchanged in shape; the 590 kB warning is the pre-existing code-split card).
- Playwright smoke over the new and changed routes (`/founder/work`, `/ops/work`, `/studio/work`, `/ops/work/prj-hoy`, `/ops/work/prj-laureles`, `/founder/work/new`, `/ops/work/new`, `/ops/spaces/import`, `/ops/spaces/catalog`, `/dev/components`, `/dev/specs`, `/dev/actions`, `/founder`, `/ops`) at **390 and 1280 as the role holding the permission: 28 checks, 0 failing** — no page errors, no console errors, `scrollWidth <= clientWidth`.
- Keyboard-only run of W-03: 60 tab stops from the skip link through the step tabs and every field, all with a 3 px focus ring. Keyboard run of the List: the twisty takes focus and Enter collapses the subtree (212 rows -> 210 for `4. Definir zonas y areas`).
- W-03 driven entirely through `window.__aluzina.actions.run`: name, client, two phases, two zones plus a custom one, review, create -> `2 sections and 70 tasks`, lands on W-02.
- Every capture opened and read; three defects found and fixed in this pass (badge overflow at 390, twisty floating in a wrapped title, Board tab count).

## G. Deferred

- W-01 / W-02 declare 31 `work.*` actions and register none (the bus landed in 0013, after the views in 0008). The two this pass added (`work.newProject`, `work.setDeliverable`) are registered; `work.toggleSubtree` and the original 31 are not. Kanban card.
- The portfolio vendor jobs are parsed and checked in but not rendered: O-12 purchasing needs `profitAluzina`, `aluzinaResponsibility` and payment rows first.
- No template editor: `tpl-aluzina-workflow` is code. A second template, or editing one in the product, is a later pass.
- The `deliverables` catalog has English names only, so the badges read English inside the Spanish UI (true of K-05 already). Bilingual catalog rows are a separate pass.
- Spanish column headers of the List run together at 1280 ("HECHATAREA"): the `Hecha` header is wider than its 44 px column. Pre-existing, filed.
- `projects.write` for operations is an inference from "founder and ops" in the brief; to confirm with Justin.
