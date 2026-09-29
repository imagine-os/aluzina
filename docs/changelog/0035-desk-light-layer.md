version: 0.21.0 (from 0.20.1: W-04 follows one project as light across the desk, every Open on W-04 navigates, 6 new declared `desk.*` actions per surface; no route, entity, seed or `SEED_VERSION` change)
date: 2026-09-29
prompt: 0028
intent: Make "it is all light: a message, a payment, a status change are one kind of event moving through phases" visible on the Method desk, bring money and communication onto it, and remove the desk's two Open placeholders.
decision: D-105 (the Method desk is also the spatial view of one project: rows placed by an entity -> phase rule table, events shown as light travelling between mats, real navigation on every Open)
rejected: a separate "project map" page (one spatial model, not two), storing a layout per person, animating without a play control, supplier quotes on the Brief mat (they are the template's Quotation phase), the money strip as a world-space panel on the desk (unreadable at the whole-desk fit), `created_at` as the only event time (every seed row shares one timestamp)
files: apps/hub/src/modules/desk/{deskFlow.ts,useProjectFlow.ts} (new), apps/hub/src/modules/desk/{DeskPage.tsx,DeskObject.tsx,model.ts,desk.css,specs.ts,strings.ts}, docs/pages/W-04.md, docs/screenshots/W-04/{en-390,en-1280,en-3840,es-1280,en-1280-dark}.jpg (recaptured) + {en-1280-project,en-1280-project-mat,en-1280-trail}.jpg (new) + routes.json, docs/prompts/0028-desk-light-layer.md (new), docs/changelog/0035-desk-light-layer.md (new), docs/decisions.md (D-105), docs/reference/surfaces.md (W-04 row, `desk.*` row, entry count, change log), docs/plan/plan.json (dk-03, version), docs/build-plan.md (row 17), docs/kanban.md (dk-03 Done), docs/README.md (latest counters), tenant.json (version 0.21.0, `docs.counters` 28 / 35 / 105, `actions` 445 / 424), package.json + apps/hub/package.json (version)
codes: W-04
model: Opus 5.5 (build), Fable 5.1 (choice of work and brief)

# 0035 - Desk light layer (W-04): follow a project as light, wire every Open

## Every Open is wired

- The object drawer's **Open** navigates to the page the object names (A-08 leads, A-03 pipeline, S-10 checklist, S-11 revision matrix, O-12 purchasing, O-13 site reports, A-02 approvals, M-03..M-08 manual, W-03 new project). The route is found by exact path, then by pattern (`matchPath`, so `/studio/checklist/:projectId` resolves). When the current role lacks the route's permission, the session first switches to the demo user of the route's surface (or the first role that holds the permission) with the D-07 toast, "Opening O-12 as Miguel" (D-015).
- The person drawer's **Open portal** does the same for the role's portal (`#/founder`, `#/ops`, `#/studio`, `#/brand`).
- Both `Placeholder` wrappers are gone; the Open buttons carry a tooltip naming the target. `desk.openItem` and `desk.openPersonPortal` now answer `opened <code> (#<path>)`, e.g. `opened O-12 (#/ops/purchases)`, `opened O-01 (#/ops)`. W-04 has no placeholder left.

## Follow a project (the light layer)

A second toolbar row: a project `Select` ("Follow a project…" / "Seguir un proyecto…"; active projects first, then prospects, then past, each by `updated_at`), Clear, and the trail controls. With a project followed:

1. **Status light.** The token of the project's `pipelineStatus` (the desk's pipeline token set) gets a breathing halo of light; the mat of its phase wears the brand light as concentric rings (blue, aqua, mint, lime) with a glow; mats of earlier phases take a faint mint "done" tint and a mint number; later ones stay neutral.
2. **The project's records as light.** Every row of the project becomes a small luminous tile (1 chess square, 2 px thin, gradient top edge, glowing outline, a tone stripe for its status) on a new sub-mat labelled with the project's short name, on the mat where that kind of record belongs; messages get their own "<name> · messages" sub-mat. Faces show real fields: purchase = reference, supplier, status, price; payment = concept, amount, status, paid or due date; message = first line, channel, sender, date; quote = item, supplier, amount, status; and so on. At most 6 tiles per kind (the last says "+N more") and 40 per project. Clicking a tile flies to it and opens the drawer: its face, kind, project, mat, the managing page, why this mat, and every field of the row (labelled in EN / ES, amounts in `formatCop`, dates in `formatDate`, people and suppliers by name), with an Open to that page.
3. **Money and communication rail.** Along the near edge of the stage (the desk's front rail, outside the mats): the followed project, quoted, approved, paid, outstanding, and communication.
4. **Event trail.** Previous / Play-Pause / Next and a caption line under the toolbar ("Event 7 of 21 · Aug 29, 2026 · 08 Delivery: Site report, 55 %: …"). Playing moves a dot of light in a straight line from the object of one event to the next (CSS transform transition, 700 ms per hop, a 650 ms stop) and lights the tile it arrives at. Space (stage focused) plays / pauses, `[` / `]` step; everything works with the buttons alone.
5. **Realtime.** Every entity is a live `useTable` (D-023), so a write anywhere (another tab, another person) re-renders the tiles, the rail and the trail without reload.

## Placement (`modules/desk/deskFlow.ts` `FLOW_RULES`, data, one rationale each)

| Entity | Mat | Rationale |
| --- | --- | --- |
| `leads` | Lead | The inquiry that became the project |
| `engagements` | Brief | The contracted service and its checklist start at the brief (activation, G-01) |
| `meetings` | current phase (Diagnosis while the project is a lead) | A meeting is about where the project is now |
| `documents` | by kind: contract / brief -> Brief, quote / plan / spec -> Development, project PDF -> Validation, invoice / report -> Delivery; else Brief | The document belongs to the step that produces it |
| `quotes` | Development | Supplier quotes are the template's Quotation phase (`phase-cotizacion`), which sits on Development |
| `changeOrders` | Development | A change after approval goes back to design development (G-13, G-14) |
| `revisionItems`, `revisions` | Validation | The single revision matrix and the brand revisions are what the client validates (G-05) |
| `purchases`, `payments`, `deliveries` | Delivery | Money and goods follow production (E stage 5, G-07) |
| `siteReports` | Delivery | The record of each site visit (E stage 7, G-08) |
| `messages` | current phase, messages sub-mat | Messages happen where the project is now |
| `alerts` | current phase | An alert is about now (alerts pointing at the project or at one of its rows) |

Mock projects: Casa Laureles 22 tiles (10 messages capped at 6, 26 events), Noam Residential 21 tiles (21 events, the most money and goods), HOY Wellness Center 14, Oficinas Ruta N 6, Café Provenza 4, Honey Valley 1.

## Money formulas (COP, `formatCop`)

- **Quoted** = for each `comparisonGroup` of the project's quotes, the `selected` quote's `amountCop`, else the lowest `amountCop` among quotes not `rejected`; summed over groups.
- **Approved** = Σ `priceCop` of purchases past Quoted (any status but `quoted`) + Σ `extraCostCop` of change orders `approved` or `executed`.
- **Paid** = Σ `paidCop` of the project's payments, shown with the split in (client to studio) / out (studio to supplier).
- **Outstanding** = Σ (`amountCop` − `paidCop`) of payments whose status is not `paid`, with the same split.
- **Communication** = messages in the project channel (split client / team by `clientUserId`), meetings, and the intake channel of the project's lead. The `messages` entity has no channel field: every message is the project's official channel (03 stage 01), so the "by channel" count is project channel, meetings and lead channel.

Noam: quoted COP 48,000,000, approved 67,200,000, paid 16,000,000 (out), outstanding 16,000,000 (out). Casa Laureles: quoted 16,900,000, approved 0, paid 0, outstanding 18,500,000 (in), 10 messages (client 4, team 6).

## Trail

One event per row placed on the desk at the entity's own date (lead and document and quote `created_at`, engagement `startedAt`, meeting `startsAt`, change order `approvedAt`, revision item `decidedAt`, brand revision and alert `dueDate`, purchase and site report `date`, payment `paidDate` else `dueDate`, delivery `confirmedDate` else `expectedDate`, message `at`), plus one per `activity` line (the provider's change log) on the project ("Status → Approved") or on one of its rows ("Purchase Cortinas lino…: status → Approved"). Sorted by time, then by entity order. Captions are bilingual one-liners: "Payment of COP 16,000,000 made to Ebanistería Robledo", "Message in the project channel from Sarai: …", "Quote from Luminarias del Valle: COP 18,400,000 (Shortlisted)". Under `prefers-reduced-motion` the pulse jumps and the caption still updates.

## Realtime check

Playwright, one browser context, two tabs: tab A on `/founder/desk` following Noam; tab B on O-12 `/ops/purchases` ran `ops.advancePurchase {purchase: pur-noam-textiles}` (Quoted -> Approved). Without reload, tab A's tile read "Approved", Approved went from COP 67,200,000 to 71,300,000 ("purchases 4 + change orders 1") and the trail from 21 to 22 events (the new activity line). Passed.

## Actions (all five desk routes, registered while mounted)

`desk.followProject {project:id}` (id, name or client words), `desk.clearProject`, `desk.playTrail`, `desk.pauseTrail`, `desk.stepTrail {dir:enum:prev|next}`, `desk.openRow {entity:string, id:id}` (reads the row, opens the page that manages the entity). `desk.openItem` / `desk.openPersonPortal` now navigate. 15 `desk.*` ids per route; 1 136 declared entries; `tenant.json` `actions` 445 / 424.

## Verification

`npm run build` green (tsc strict, Vite, `tenant:validate`). Scripted at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 EN light, 390 and 1280 in ES light, EN dark, ES dark; each with no project, Casa Laureles and Noam: no horizontal scroll, 146 objects, 21 / 22 light tiles, 0 overlapping objects or sub-mats inside any mat, 0 station / sub-mat overlaps, 0 mat overlaps, no page errors, rail amounts on one line from 1100 px (they break only between currency and number below). Actions, keys (Space, `[`, `]`), the drawer, Open with and without a session switch (studio -> "Opening O-12 as Miguel") all exercised. Screenshots: `docs/screenshots/W-04/en-390.jpg`, `en-1280.jpg`, `en-3840.jpg`, `es-1280.jpg`, `en-1280-dark.jpg` (recaptured), new `en-1280-project.jpg` (Noam followed, whole desk, Delivery lit, rail), `en-1280-project-mat.jpg` (Noam's Delivery tiles at 152 %), `en-1280-trail.jpg` (event 7 of 21 mid-play).

## Rejected alternatives

- A separate "project map" page: the desk already is the spatial model of the method; one model, not two.
- A stored per-person layout: the placement is derived from data (D-103), so it is the same for everyone and never drifts.
- Animating the trail on its own: a play control, step buttons and keys keep it the person's choice (P-03, reduced motion).
- Supplier quotes on the Brief mat (as first briefed): in this schema `quotes` are supplier prices compared side by side, not the client proposal; they belong with the template's Quotation phase on Development.
- The money strip as a panel in world space below the mats: at the whole-desk fit on 1280 (14-21 %) its figures were 6-12 px; as the stage's front rail (rem, outside the mats) it reads at every zoom and scales with `--scale` on TVs.
- `created_at` as the event time: every seed row shares `SEED_AT`, which would make the trail one instant; each entity's own date is used, `created_at` only when it has none.
