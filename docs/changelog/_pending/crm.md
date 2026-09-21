# Draft for changelog 0013: CRM and execution control (Opus 5)

Merged into `docs/changelog/0013-*.md` by the integrator. Worker scope: `apps/hub/src/modules/founder/` and `apps/hub/src/modules/ops/` only.

- model: **Opus 5** (all four pages, the A-03 rework, specs, strings, docs)
- prompt: 0009 (Service Delivery Playbook), pass 0013 module worker "CRM and execution control"; build-plan roadmap R2 starts here
- codes: **A-08** Leads (`/founder/leads`), **O-11** Change orders (`/ops/change-orders`), **O-12** Purchasing control (`/ops/purchases`), **O-13** Site reports (`/ops/site-reports`); **A-03** Pipeline reworked onto the 15-status architecture; **O-01** gained one execution-control card row.

## Files

### founder
- added `apps/hub/src/modules/founder/LeadsPage.tsx` (A-08)
- changed `apps/hub/src/modules/founder/PipelinePage.tsx` (A-03 rewritten: leads + projects, five status bands, Board / List tabs, the G-06 gate, the legacy phase Select)
- changed `apps/hub/src/modules/founder/pipelineData.ts` (added `PIPELINE_BANDS`, `DEFAULT_COLLAPSED`, `pipelineIndex`, `prevPipelineStatus`, `GATE_APPROVALS`, `GATED_STATUSES`, `checkProjectMove`, `checkLeadMove`, `PipelineEntry` + `leadEntry` / `projectEntry`, `todayIso`, `projectTypeOf`; the old `PHASES` / `PROJECT_TYPES` / `phaseTone` are untouched)
- changed `apps/hub/src/modules/founder/specs.ts` (new `leadsSpec`; `pipelineSpec` rewritten; `founderSpecs` now lists `leadsSpec`)
- changed `apps/hub/src/modules/founder/index.ts` (route `/founder/leads`, permission `leads.manage`, nav group `sales`, order 15, glyph `◦`)
- changed `apps/hub/src/modules/founder/strings.ts` (`founder.leads.*`, new `founder.pipeline.*` keys, `founder.nav.leads`, `founder.common.notes`, `founder.type.other`; EN + ES complete)
- changed `apps/hub/src/modules/founder/founder.css` (`.founder-page > * { min-width: 0 }`, `.founder-badges`, `.founder-section`, `.founder-form`, `.founder-form__legend`, `.founder-grid`, `.founder-bands`, `.founder-band`, `.founder-band__head`, `.founder-move*`; tokens only)

### ops
- added `apps/hub/src/modules/ops/ChangeOrdersPage.tsx` (O-11)
- added `apps/hub/src/modules/ops/PurchasesPage.tsx` (O-12)
- added `apps/hub/src/modules/ops/SiteReportsPage.tsx` (O-13)
- changed `apps/hub/src/modules/ops/specs.ts` (new `changeOrdersSpec`, `purchasesSpec`, `siteReportsSpec`; `homeSpec` gained a layout line, three `dataTables` and a logic line)
- changed `apps/hub/src/modules/ops/index.ts` (three routes in nav group `execution`: `/ops/change-orders` order 60 `⇄`, `/ops/purchases` order 61 `▧`, `/ops/site-reports` order 62 `◉`)
- changed `apps/hub/src/modules/ops/strings.ts` (`ops.changeOrders.*`, `ops.purchases.*`, `ops.siteReports.*`, three nav keys, `ops.common.date`, `ops.common.copHint`, `ops.home.execution*` and three `ops.home.tile.*`; EN + ES complete)
- changed `apps/hub/src/modules/ops/OpsHome.tsx` (one "Execution control" `Card` with three `StatTile`s linking to O-11 / O-12 / O-13; the rest untouched)
- changed `apps/hub/src/modules/ops/ops.css` (`.ops-form`, `.ops-grid`, `.ops-report`; tokens only)

### docs
- added `docs/pages/A-08.md`, `docs/pages/O-11.md`, `docs/pages/O-12.md`, `docs/pages/O-13.md`
- changed `docs/pages/A-03.md` (Purpose, a History section, Layout, Data, Rules, Logic, Actions, Real-vs-placeholder, responsive and open questions; the pass-0008 state is kept in History)
- added this draft

Nothing outside those folders was touched. No `git` was run.

## What is real vs Placeholder

**A-08 Leads — no Placeholder.** Real: creating a lead (`source: 'manual'`, `status: 'lead-new'`), the ten qualification answers and the notes, "Suggest service" (`routeService()` → `leads.suggestedService` with the reason shown), the requested-service decision, the owner assignment, the status walk over `LEAD_STATUS_IDS` (Select + prev / next), the five stat tiles including the computed lead → contract rate, the four filters and the search, and **Convert to project**, which creates a `projects` row, an `engagements` row on the service's first phase and writes `leads.projectId`, then offers "Open in Work".

**A-03 Pipeline — no Placeholder left** (the old "New lead" one is now a real link to A-08). Real: the five bands, the collapse toggle, the Board / List tabs, prev / next on the card, the "Move to…" Select in the drawer, the G-06 / G-12 gate, the creative direction, and the legacy phase Select.

**O-11 Change orders — no Placeholder.** Real: create, approve, reject and "Mark executed" with G-14 enforced in the write, plus the per-scope totals of extra cost and extra days.

**O-12 Purchasing — no Placeholder.** Real: create, Advance over `PURCHASE_STATUSES`, set any status from the drawer, six status tiles that double as filters, four filters, and the committed-vs-budget card per project.

**O-13 Site reports — one Placeholder.** Real: the report list, the project filter, the overdue-resolution flag, the progress reading and creating a report. `Placeholder`: **"Add photo"** — there is no file-storage seam. `ops.addSitePhoto` is registered so a call answers "not wired yet" rather than `not-live`. Editing an existing report is not offered (open question in the page doc).

All seed content (8 leads, 2 change orders, 6 purchases, 3 site reports) is mock data, not mock behaviour.

## Requests for shared code (for the integration pass)

1. **A `Meter` / `ProgressBar` atom.** O-13 renders `siteReports.progress` as a percentage plus a ten-block text bar inside a `StatTile` because the library has no meter. A `Meter` (value, max, label, tone, text fallback, `role="meter"`) would also serve the purchasing share badge on O-12 and any KPI from `KPIS`.
2. **A file-storage seam on the `DataProvider`.** `siteReports.photoUrls` is `string[]`, so photographs can only be links. G-08 is half-kept until an upload path exists (`put(file) -> url`, behind the same seam as Supabase Storage). This also blocks documents (O-09) and presentations.
3. **`leads.read` pages elsewhere.** `leads.read` is granted to brand and marketing, but A-08 is guarded by `leads.manage`, so those roles have no leads page at all. Either a read-only leads view on the brand / marketing surfaces, or drop `leads.read` from them.
4. **A client sign-off on a change order.** G-14 asks for *client* approval; today `changeOrders.status = 'approved'` records the studio's decision. The client app (C-01) needs an approve step writing the same row, or the schema needs a second field (`clientApprovedAt`).
5. **Quote → purchase traceability.** O-05 selects a `quotes` row and O-12 records the `purchases` row it becomes, with nothing joining them. A `relations` row (D-026) or a `purchases.quoteId` would close the loop from stage 2 to stage 5 of service E.
6. **`checkedAt` values above 1920.** Every page here was verified at 2560 and 3840 too, but `spec.checkedAt` lists the module's shared `WIDTHS` constant (360…1920). If the constant is meant to carry the whole matrix, that is a one-line change in each module's `specs.ts` — not made here, because it would change every existing page's spec.

## Decisions proposed

- **D-0xx `phase` and `pipelineStatus` coexist until the Work views migrate.** `projects.pipelineStatus` (15 statuses) is the pipeline of record from pass 0013 on: A-03, A-08, S-10 and the gate all read and write it. `projects.phase` (7 phases) stays the Work views' grouping vocabulary and is written only from the A-03 drawer's legacy `Select` and by `founder.moveProject`. Nothing derives one from the other automatically, because the mapping is not one-to-one (`design-development` and `client-review` both sit in `development`, `punch-list` in `execution`). Proposal: keep both, keep the legacy control visible and labelled "legacy", and migrate the Work views to `pipelineStatus` in a later pass, at which point `phase` and `founder.moveProject` are removed together.
- **D-0xx a lead is converted, never promoted.** A `leads` row only ever holds the first four statuses. At `contracted` it becomes a `projects` row plus an `engagements` row and keeps `projectId` as the back-link; the lead is then hidden from the board (the project carries it). This keeps one card per inquiry and makes "lead → contract" a countable event. The conversion re-reads the stored lead before creating anything, so it is idempotent under concurrent calls.
- **D-0xx governance is enforced in the write, not only in the control.** G-06 / G-12 on A-03 and G-14 on O-11 re-read the stored row and refuse with a readable reason. The disabled control and the disabled `Select` option are the *explanation*; the write is the *rule*. This matters because the same functions are reachable from the actions bus (voice, WebMCP, D-09) where no button state exists.
- **D-0xx `purchases.priceCop` is the price of the whole purchase**, not a unit price — that is how the seed rows read ("Puestos de trabajo (60)", quantity 60, 84,000,000 COP). O-12 therefore sums `priceCop`, never `priceCop * quantity`. If a unit price is wanted the schema needs a second field; worth a line in the entity comment either way.
- **`founder.newLead` moved from A-03 to A-08** (same id, no rename): on A-03 it was a `Placeholder`, on A-08 it creates a real lead. A-03 gained `founder.openLeads` in its place, plus `founder.movePipelineStatus` and `founder.toggleGroup`. `founder.moveProject`, `founder.openProject` and `founder.setCreativeDirection` are unchanged and still work.

## For files this worker may not edit

- `docs/reference/surfaces.md` (P-10): add the four routes `/founder/leads`, `/ops/change-orders`, `/ops/purchases`, `/ops/site-reports` and their 23 actions (A-08 ×10, A-03 ×6, O-11 ×5, O-12 ×4, O-13 ×4 — A-03's six include two already listed).
- `docs/kanban.md`: R2 (CRM and execution control) has its first four pages; the leads → project → engagement hand-off is live end to end.
- `docs/README.md`: A-08, O-11, O-12, O-13 in the page index.

## Verified

- `cd apps/hub && npx tsc --noEmit` clean (run after every change; `npm run build` left to the integrator).
- Playwright against `vite --port 5186`, Chromium at `/opt/pw-browsers/chromium-1194`: A-08, A-03, O-11, O-12, O-13 and O-01 loaded as `?as=founder` / `?as=ops` at **360, 390, 768, 1280, 1920, 2560 and 3840** — no horizontal page scroll at any width and no console or page errors on any page. Spanish checked on A-08 with the drawer open: no untranslated `<key>` markers. No focusable control under 44 px on A-08.
- Every declared action was run through `window.__aluzina.actions.run` and returns a readable result; `declared` vs `list` shows nothing missing on O-11 (5), O-12 (4), O-13 (4), A-08 (10).
- Governance checked live: `movePipelineStatus(prj-laureles → procurement)` → "Blocked by G-06…"; a lead asked for `concept` → refused; `executeChangeOrder` on a `requested` order → "G-14: an unapproved change is not executed", then approve → execute works; `convertLead` twice → the second call returns "Only a contracted lead without a project can be converted" instead of creating a second project; `advancePurchase` on an installed purchase → "Already installed".

## Known issues

- **A `<select>` inside the Kanban's horizontal scroller makes the whole document scroll sideways in Chromium.** Reproduced at 390 px: with a `Select` in the card `meta`, `document.documentElement.scrollWidth` was 1086 against a 390 px viewport even though the select measured 280 px and no unclipped element overflowed; removing only the select fixed it. Worked around by keeping prev / next on the card and moving the "Move to…" Select into the drawer. Worth a note in the `Kanban` meta if anyone else puts a form control in a card.
- Band collapse state is per visit, not remembered per person.
- The lead conversion always names the studio demo user as lead designer.
- O-12's committed spend is compared to `projects.budgetCop` (the whole project budget), which overstates the headroom for a project whose budget also covers fees.
- The three site-report seeds have empty `photoUrls`, so every card shows "no photographs on record yet" — accurate, and the visible half of request 2.
- `docs/screenshots/{A-08,O-11,O-12,O-13}/` are not captured (the screenshot script runs against `npm run preview`, which is the integrator's build).
