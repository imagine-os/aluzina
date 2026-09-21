# Deliverables catalog

```
status: current (catalog of deliverable TYPES; template status per row)
since: 2026-09-21
source: Slack #aluzina 2026-09-21 02:51 UTC, Justin Massion (four Slack channels under "Deliverables": contract, final-presentation, furniture-selection, proposal; "there's a lot more to add, some of which you can identify yourself"); gaps filled by the integrator for an interior design + lighting + experience design studio (prompt 0005, D-029)
```

The catalog is **data**: `deliverables` rows in `apps/hub/src/data/seed/spaces.ts`, rendered on K-05 (Spaces > Catalog > Deliverables) and related from posts (`produced-by`). This file is the change-tracked narrative. Owners are role ids (`roles-and-portals.md`); phases are the project phases (`lead, concept, development, documentation, procurement, execution, delivered`). `status`: `defined` (named, no template), `template-ready` (a hub page produces it today), `automated` (generated from data; none yet). Typical days are the integrator's estimates, to be corrected by the founder.

## From Justin's list

| Deliverable | Phase | Owner | Template today | Status |
| --- | --- | --- | --- | --- |
| Proposal | lead | founder | A-04 (client quotes and proposals) | template-ready |
| Contract | lead | founder | O-08 documents (`Contrato de diseño Casa Laureles` is the signed example) | template-ready |
| Furniture selection | procurement | studio | none (S-06 schedules feed it) | defined |
| Final presentation | delivered | brand | G-03 presentations | template-ready |

## Gaps filled (proposed, confirm with the founder)

| Deliverable | Phase | Owner | Template today | Status | Typical days |
| --- | --- | --- | --- | --- | --- |
| Brief and intake form | lead | founder | none | defined | 2 |
| Site survey and measurements | concept | studio | S-09 | template-ready | 3 |
| Concept presentation | concept | studio | none (G-03 is sales, not concept) | defined | 10 |
| Mood board | concept | studio | S-03 | template-ready | 3 |
| Material palette | development | studio | S-04 | template-ready | 5 |
| Lighting concept | concept | studio | none | defined | 5 |
| Lighting plan | documentation | studio | none | defined | 8 |
| Furniture and elements schedule | development | studio | S-06 | template-ready | 5 |
| Technical drawings set | documentation | studio | S-05 | template-ready | 15 |
| Render pack | development | studio | S-07 | template-ready | 10 |
| Budget and quote comparison | procurement | ops | O-05 | template-ready | 7 |
| Project schedule | development | ops | W-01 timeline | template-ready | 2 |
| Client approval record | development | founder | A-02 approvals | template-ready | – |
| Purchase orders | procurement | ops | none | defined | 3 |
| Installation plan | execution | ops | none | defined | 3 |
| Punch list | execution | ops | none | defined | 2 |
| Handover package | delivered | ops | none | defined | 3 |
| Care and operations manual | delivered | studio | none | defined | 3 |
| Project PDF | development | founder | A-04 | template-ready | 2 |
| Competition submission kit | delivered | brand | G-02 | template-ready | 10 |
| Case study | delivered | marketing | none | defined | 4 |

Dependencies seeded as relations (`depends-on`): contract -> proposal; furniture selection -> furniture schedule; lighting plan -> lighting concept; purchase orders -> budget and quote comparison; handover package -> punch list; final presentation -> render pack.

## Added from the Asana workflow (2026-09-21, changelog 0020, D-062)

```
status: current
since: 2026-09-21
source: the founder's COTIZACION step 2 and the PROYECTO HOY kickoff section (asana-conventions.md); needed because the project template links tasks to deliverables
```

| Deliverable | Phase | Owner | Template today | Status | Days |
| --- | --- | --- | --- | --- | --- |
| RFQ packet per trade | procurement | ops | O-04 quotes | defined | 5 |
| Invoice | lead | ops | O-07 payments | defined | 1 |

**RFQ packet per trade** is `2. Contactar los proveedores de cada elemento de obra con las especificaciones de diseno` made explicit: the design specifications packaged once per trade, for her sixteen (demolition, plumber, electrician, ceiling, floor, cement and drywall, plating, dry wall, installation of elements, windows and doors, closings, wallpaper and paint, online buying, lighting installation, wood and furniture, metalwork), so every provider quotes the same scope. **Invoice** is `FACTURACION`, which the HOY kickoff section puts next to `CONTRATO`: the design-fee instalments and the monthly execution administration each need one. Both are seeded rows (27 in total) and both are linked from `tpl-aluzina-workflow`.

## Status architecture (pointer)

```
status: current
since: 2026-09-21
source: service-playbook.md (prompt 0009)
```

The founder's playbook defines the service phases and stages that produce these deliverables (01 Creative Digital Consultation, 02 In-Person Consultation, 03 Comprehensive Interior Design with 19 stages, E Execution, 04 Interior Styling) and a 15-status pipeline (`LEAD - NEW` … `FOLLOW-UP`, ids in `service-playbook.md`). The `phase` column here keeps the older seven phases until the catalog is re-keyed to the playbook stages; the final delivery lists per service (01 phase 8, 02 phase 8, 03 stage 19, E stage 10, 04 phase 8) are the authoritative deliverable sets per service.

## Unknown

- `_unknown_`: which deliverables the founder actually hands over per project type today, their real durations, and whether lighting deliverables are separate documents or part of the drawings set.
- `_unknown_`: document templates (InDesign / PDF) that exist outside the Hub; "Open template" on K-05 is a Placeholder until they are catalogued.

## Documents implied by the Asana exports (pointer)

```
status: current
since: 2026-09-21
source: asana-conventions.md (prompt 0015)
```

The table "Documents the data says the OS can generate" in `asana-conventions.md` maps eleven moments of the founder's Asana workflow to documents and to the pages above; candidate rows for this catalog: cotización Excel generator, RFQ packet per trade, vendor job sheet, acta de entrega y correcciones, NDA proveedor, process-progress slide.

## Change log

- 2026-09-21: created from Justin's four channels plus 21 proposed types; 25 rows seeded, K-05 renders them (prompt 0005, changelog 0009, D-029).
- 2026-09-21: pointer to the playbook's status architecture and per-service delivery lists (`service-playbook.md`, prompt 0009, changelog 0013).
- 2026-09-21: pointer to `asana-conventions.md`'s document-generation table added (prompt 0015, changelog 0017, D-054).
- 2026-09-21: two rows added from the Asana workflow, **RFQ packet per trade** and **Invoice** (27 seeded rows); 21 task-to-deliverable links now live in the project template `apps/hub/src/domain/templates/aluzina-workflow.ts` and 19 in the imported PROYECTO HOY tree, so `tasks.deliverableId` is the first real use of this catalog outside K-05 (prompt 0017, changelog 0020, D-062).
