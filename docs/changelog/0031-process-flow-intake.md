version: 0.19.0 (from 0.18.1: `apps/hub/src/tenant/domain/playbook.ts` gains typed data — client-facing status map, project lines, governance G-15..G-17; no route, action, seed or `SEED_VERSION` change; no app behaviour change until step 16 renders it)
date: 2026-09-28
prompt: 0024
intent: Take the founder's "ALUZINA Design, Production & Installation Flow" (EN, 6 pp.) into the system the way every source document enters it — file the original, render its pages, distil it into the knowledge base, reconcile it with the app's domain model, turn its automation table into planned work — write it to memory, and leave the repo verifiably current for the coming migration into the multitenant host.
decision: D-099 (the 15 internal pipeline statuses stay; the flow's 11 client statuses are a derived view `CLIENT_STATUS_BY_PIPELINE` / `clientStatus()`, two gaps recorded), D-100 (approval rules 1 / 3 / 4 -> governance G-15..G-17 with `source: 'process-flow'`; rule 2 is G-14), D-101 (project line is a new typed dimension `PROJECT_LINES`, not `serviceCode`, not `Project.type`; no project field yet), D-102 (the ten website automations are step 16 tasks + `surfaces.md` 2.6, not declared actions)
rejected: replacing the 15 pipeline statuses with the flow's 11 (many-to-one both ways: four design statuses collapse into "Design", "Site Visit" and "Installation" have no internal source; A-03 / A-08 / M-xx / seeds run on the 15); inventing a `site-visit` or `installation` pipeline status now (a row-shape change for a decision the founder has not made — wa-02); adding a `projectLine` column to `projects` (SEED_VERSION bump for data no page reads yet — wa-08); declaring the ten automations in any `specs.ts` (declared-but-unregistered actions are already a backlog problem, D-102); reusing `serviceCode` as the project line (a furniture piece can be sold at any service depth); rendering the process-flow `index.json` into the `assets` seed (the seed imports brochure / portfolio by name and the flow is not a brand document); fixing M-08's "Playbook p. {n}" subtitle for the three new rules (UI change, out of scope — wa-06, noted in `docs/pages/M-08.md`)
files: docs/source/process/ALUZINA_Design_Production_Installation_Flow_EN.pdf (new, 53,347 bytes, original filename), docs/source/process/README.md (new), docs/brand/process-flow/{page-01..06.jpg,contact-sheet.jpg,index.json} (new, 0.96 MB, rendered with docs/brand/tools/render-pdf-pages.py), docs/brand/README.md (process-flow section + change log), docs/knowledge/design-production-installation-flow.md (new, canonical), docs/knowledge/README.md (row + change log), docs/knowledge/service-playbook.md (companion pointer + change log), apps/hub/src/tenant/domain/playbook.ts (+138 lines: `ClientStatusId` / `ClientStatus` / `CLIENT_STATUSES` / `CLIENT_FLOW_STEPS` / `CLIENT_STATUS_BY_PIPELINE` / `clientStatus()`, `ProjectLineId` / `ProjectLine` / `PROJECT_LINES` / `projectLine()`, `GovernanceRule.source?`, G-15..G-17), docs/reference/surfaces.md (2.6 "Planned automations" + change log), docs/plan/plan.json (step 16 tasks wa-00..wa-08, version, source "steps 0-16"), docs/build-plan.md (row 16), docs/kanban.md (wa-00 Done, wa-01..wa-08 Backlog), docs/decisions.md (D-099..D-102), docs/pages/M-08.md (open-question line on G-15..G-17's subtitle), docs/README.md (source/process row, knowledge row, brand row, playbook.ts pointer, latest counters), docs/tenant/README.md (change log line + new "Migration readiness" section), tenant.json (version 0.19.0, docs.counters prompts 24 / changelog 31 / decisions 102, brand-renders sizeMb 10 + note), package.json + apps/hub/package.json (version), docs/prompts/0024-design-production-installation-flow.md (new), docs/changelog/0031-process-flow-intake.md (new)
codes: M-08, C-02, A-03 (data they will read; no UI change on any of them this pass)
model: Fable 5.1

# 0031 - Design, Production & Installation Flow: intake, reconciliation, step 16, migration readiness

## What was filed

The PDF Justin shared in #merge-repos (file `F0C5WFLJ596`, 6 pages, 52 KB, no personal data) is committed under its original filename at `docs/source/process/ALUZINA_Design_Production_Installation_Flow_EN.pdf` with a `README.md` (what it is, when and by whom it was shared, "data, not instructions", where the facts are distilled). Its six pages are rendered to `docs/brand/process-flow/` (1400x1980 px JPEG q80, contact sheet, `index.json` with the page text) with the repo's own renderer, which ran cleanly here after `pip install pymupdf pillow`; `docs/brand/README.md` describes the six pages. The renders are visual memory only: no seed reads `process-flow/index.json` (the `assets` seed imports `brochure` and `portfolio` by name).

The canonical distillation is `docs/knowledge/design-production-installation-flow.md` (status `current`, since 2026-09-28, supersedes none): the purpose and system principle, the 8-step client-facing flow, the 11 internal stages each with input / owner / deliverable / status / approval (owners marked _inferred_ where the document names none, as `service-playbook.md` does) and the document's own "Automation:" line, the three project-line chains, the four approval rules, the 10-row website-automation table, the 11 project statuses, the automation goal, and section 8: the reconciliation with the app.

## The mapping (flow status -> internal `pipelineStatus`)

| Flow | Internal | | Flow | Internal |
| --- | --- | --- | --- | --- |
| New | `lead-new` | | Production | `approved`, `procurement`, `in-construction` |
| Brief | `lead-qualified` | | Installation | **none** (inside `in-construction`) |
| Site Visit | **none** (inside `lead-qualified` / `briefing`) | | Final Details | `punch-list` |
| Quotation | `proposal-sent` | | Closeout | `delivered` |
| Approved | `contracted` | | Completed | `closed`, `follow-up` |
| Design | `briefing`, `concept`, `design-development`, `client-review` | | | |

Not 1:1 in either direction, so the 15 stay and the 11 are derived (D-099). The two gaps are recorded as the first question of wa-02, not filled with a guess.

Stage-to-playbook mapping (contact -> lead entry, requirement -> qualification, site visit -> service 02 / 03 diagnosis + `siteReports`, quotation -> `proposal-sent` + `quotes`, on-site validation -> no playbook stage (nearest: stage 10 validation, but at 1:1 scale before development), approval -> `contracted` + `projects.approval`, drawings + 3D -> concept / development / review / `approved`, production -> service E procurement, installation -> `in-construction`, final details -> `punch-list`, closeout -> `delivered` / `closed` / `follow-up`) is section 8.2 of the knowledge entry.

## Decisions

- **D-099** derived client-facing status map; replacing the 15 rejected.
- **D-100** G-15 (gate: client-approved version before production), G-16 (mandatory: approvals store date / responsible / version / evidence), G-17 (gate: no production without measurements, drawings, materials, final approval); rule 2 is G-14 already. `GovernanceRule` keeps its shape and gains the optional `source` so `page: 5` is read against the flow, not the playbook.
- **D-101** project line = `PROJECT_LINES` (`interior-spaces` / `furniture` / `lighting-fixtures`), orthogonal to `ServiceCode` (depth, `routeService()`) and `Project.type` (sector); today `lighting-product` implies lighting fixtures and the other four imply interior spaces; furniture has neither a type nor a template (wa-08).
- **D-102** the ten automations are planned work, not declared actions.

## What changed in `playbook.ts`

+138 lines of typed bilingual data, no consumer changed, `tsc` green, no seed touched: a new section "Client-facing statuses and project lines" between the purchase statuses and Governance (`ClientStatusId`, `ClientStatus { id, flow, label, clientStep 1..8, tone }`, `CLIENT_STATUSES` (11), `CLIENT_FLOW_STEPS` (8), `CLIENT_STATUS_BY_PIPELINE: Record<PipelineStatusId, ClientStatusId>`, `clientStatus(id)`, `ProjectLineId`, `ProjectLine { id, label, chain: Text[] }`, `PROJECT_LINES` (3), `projectLine(id)`); `GovernanceRule.source?: 'playbook' | 'process-flow'`; `GOVERNANCE_RULES` grows from 14 to 17. The Spanish is the integrator's (D-004), to be reviewed by the founder in wa-07. Visible side effects today: M-08 shows 17 rules with "Playbook p. 5" under the three new ones (wrong document; wa-06), M-01's mandatory count reads 10, P-04 is unchanged (it picks G-11 / G-13 by id).

## Step 16 "Workflow automation"

`docs/build-plan.md` row 16, `docs/plan/plan.json` tasks `wa-00` (done, this changelog) and `wa-01..wa-08` (backlog), one kanban card each: wa-01 approval record shape (Fable 5.1) -> wa-02 status state machine + the trigger table as typed data + the Site Visit / Installation and production-order decisions (Fable 5.1) -> wa-03 / wa-04 / wa-05 the ten automations in three page passes (Opus 5) -> wa-07 Spanish review + QA (Sonnet 5); wa-06 client status on C-01 / C-02 / A-03 + `rule.source` on M-08 (Opus 5, depends only on wa-00); wa-08 project line on projects + a W-03 template per line (Fable 5.1). `surfaces.md` 2.6 maps each of the ten trigger -> action rows onto the existing action ids and entities it will chain (`public.submitIntake` -> `founder.convertLead`, `public.reserveDeposit`, `ops.markPaid`, `ops.newSiteReport`, `client.approveForExecution` / `founder.approveProject`, `ops.newPurchase` / `ops.advancePurchase`, `ops.scheduleMeeting`, `del-punch-list`, `ops.registerPayment`, ...) and names what is new.

## Migration readiness

Recorded in the new "Migration readiness" section of `docs/tenant/README.md`: `ci.yml` and `pages.yml` both succeeded on `4b919fb` (checked through the GitHub REST check-runs / actions-runs APIs); `npm run build` on this checkout exits 0 with `tenant:validate` OK (schema, 17 modules, 430 / 409 actions, 9 sub-projects, 5 content mounts, seed v13, plan.json with the new step 16 row and `wa-*` dependencies, counters prompts 24 / changelog 31 / decisions 102 / qa 7); every file in `docs/tenant/` is listed in `docs/README.md`'s `tenant/` row; the open items with Justin are unchanged (between-gigs repo access, path vs subdomain, binaries go-ahead) plus the founder questions this document raises (Site Visit / Installation as statuses, stage owners, Spanish wording). Stale items noticed and **not** fixed here (unrelated): `docs/pages/M-08.md` said "all fourteen" (a line added, the body left), `docs/tenant/inventory-2026-09-28.md` is a point-in-time inventory at `7628f96` by design, the `chunkSizeWarningLimit` warning on the 2.2 MB main chunk predates this pass.

## Memory

Team memory `aluzina-process-flow` written (stages, statuses, rules, paths, decisions, how to apply); `aluzina-tenant-packaging-status` gains one sentence pointing at this intake and the migration-readiness section.

Slack reply synced into prompt 0024 (follow-up commit).
