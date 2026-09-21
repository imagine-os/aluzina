# Draft for changelog 0013: studio module (Opus 5)

Merged into `docs/changelog/0013-*.md` by the integrator. Worker scope: `apps/hub/src/modules/studio/` only.

- model: Opus 5 (both pages, specs, strings, docs)
- prompt: 0009 (Service Delivery Playbook), pass 0013 module worker "studio"
- codes: **S-10** Service checklist (`/studio/checklist`, `/studio/checklist/:projectId`), **S-11** Revision matrix (`/studio/revisions`); S-01 studio dashboard extended with one service-delivery row.

## Files

- added `apps/hub/src/modules/studio/ServiceChecklistPage.tsx` (S-10)
- added `apps/hub/src/modules/studio/RevisionMatrixPage.tsx` (S-11)
- changed `apps/hub/src/modules/studio/specs.ts` (`checklistSpec`, `revisionsSpec`; `homeSpec` gained two actions, two dataTables and a layout / logic line)
- changed `apps/hub/src/modules/studio/index.ts` (three routes: `/studio/checklist` nav order 45, `/studio/checklist/:projectId` unlisted, `/studio/revisions` nav order 46; both in nav group `design`)
- changed `apps/hub/src/modules/studio/strings.ts` (`studio.checklist.*`, `studio.revisions.*`, `studio.home.delivery*`, nav keys, five shared `studio.col.*` keys; EN + ES complete)
- changed `apps/hub/src/modules/studio/StudioHome.tsx` (service-delivery row with two `StatTile`s linking to S-10 / S-11, and the two actions registered)
- changed `apps/hub/src/modules/studio/studio.css` (`studio-stats--top/--flush`, `studio-phase__title/__number`, `studio-note--quiet`, `studio-form`, `studio-fieldset`, `studio-legend`; tokens only)
- added `docs/pages/S-10.md`, `docs/pages/S-11.md`

## What is real vs Placeholder

Real on S-10: project select and deep link, every checklist `Checkbox` (writes `engagements.checks[checkKey(phaseId, index)]`), "Mark phase complete" (ticks the whole phase; on the last phase also `status: 'delivered'` + `completedAt`, G-09), "Advance to next phase" (`currentPhaseId` + `status: 'in-progress'`, disabled on the last phase), the "Open in …" stage links (10 → S-11, 12 / 13 → S-04, 15 → S-06, 16 → S-07, 17 → S-05), the brief `Drawer`, and "Send to procurement" (`projects.pipelineStatus = 'procurement'`, enabled only while `approval === 'client-approved'` and the project has not passed procurement — G-06 / G-12). **No Placeholder on S-10.** The gate button sits disabled in the demo because no seeded project is `client-approved`; that status comes from the client app (C-03).

Real on S-11: project / stage / status / source filters, the add-item form (signed `founder` / `client` / `studio` by the writer's role), the comment edit, the three validation status buttons and the "Resolve as adjustment" shortcut (both write `decidedAt`), and "Export matrix" (real CSV download: UTF-8 BOM, CRLF, RFC 4180 quoting, filtered rows). `Placeholder`: **"Send to client"** only — messaging the client belongs to the `messages` integration.

## Requests for shared code (integration pass)

1. **`Accordion` (organism or molecule).** S-10 hand-assembles a disclosure out of `Card` + a `Button` with `aria-expanded` / `aria-controls`. A library `Accordion` (single / multi open, controlled, 44 px header, keyboard) would replace ~25 lines here and is wanted by the docs and manual modules too.
2. **`ProgressBar` / `Progress` atom.** Both pages express progress as text (`2 / 5`, `n of m items ticked`). A token-driven bar with an accessible text fallback (never colour alone) belongs in the library.
3. **`Checklist` molecule.** "List of `Checkbox`es with a progress line and a complete-all control" now exists twice (S-08 `consistencyChecks`, S-10 `engagements.checks`). Worth extracting once the second shape settles.
4. **A rule / governance hook, e.g. `useGovernance()` in `src/domain`.** S-10 re-implements G-06 / G-12 inline (`approval === 'client-approved'`, `pipelineStatus` ordering) and the founder / ops modules need the same check for `in-construction` and for G-14 on change orders. Proposal: `canEnter(project, pipelineStatusId) -> { ok, ruleId, reason }` built on `GOVERNANCE_RULES` + `PIPELINE_STATUS_IDS`, so one page cannot disagree with another.
5. **A CSV helper, `src/data/csv.ts`.** `downloadCsv(name, headers, rows)` — S-11 has the only implementation today; the plan viewer, QA and ops exports will want the same BOM / CRLF / quoting rules.
6. **`StatTile` long-value handling.** A multi-word value is clipped by `.stat__value` (seen with `66 of 119 items ticked`); either wrap or expose a `size` prop. Worked around by using short `n / m` values.
7. **`KeyValue` + long `StatusPill`.** A three-column `KeyValue` overflows at 768 px when a cell holds a pill whose label cannot shrink (`Design development`). Worked around with `columns={2}`; the library fix is `min-width: 0` / wrapping inside `.kv__item`'s implicit track.

## Decisions proposed

- **D-S10-a**: one spec, two routes for S-10 — `/studio/checklist` and `/studio/checklist/:projectId` share `checklistSpec`, following work (W-02) and spaces. The selected project lives in the URL, not in component state (P-06).
- **D-S10-b**: the checklist renders the playbook, never a copy of it. Phases, items and notes come from `SERVICES` in `src/domain/playbook.ts`; the only stored state is `engagements.checks / currentPhaseId / status / completedAt`.
- **D-S10-c**: when a project has several engagements (Noam: 03 delivered, E running), the open one is shown. No engagement switcher in this pass — flagged as an open question rather than an invented action id.
- **D-S11-a**: `revisionItems.stage` stays a free label; the stage `Select` merely proposes the playbook phases (`<number>. <title>`) plus labels already in use, so the matrix gains structure without a schema change.
- **D-S11-b**: the source of a new row is derived from the writer's role (founder → founder, client → client, everyone else → studio) instead of being a field the writer picks — G-03 wants the record, not a claim.
- **D-S11-c**: `studio.sendMatrixToClient` is declared in the spec but deliberately **not** registered on the actions bus while it is a `Placeholder`, so D-09 shows "declared, not live" rather than a runnable no-op. Worth making this the house rule for Placeholder actions.
- **New action id added beyond the brief**: `studio.togglePhase` (expand / collapse a phase). P-05 says every button has an entry, and the accordion toggle is a button; `studio.openChecklist` / `studio.openRevisions` were likewise added to `homeSpec` for the two new dashboard tiles.

## Verification

- `cd apps/hub && npx tsc --noEmit` clean (no errors in the studio folder; no build run — the integrator builds).
- Vite dev server + Playwright (Chromium at `/opt/pw-browsers`), `?as=studio`: S-10, S-11 and S-01 at **360 / 390 / 768 / 1280 / 1920 / 2560 / 3840**, light and dark, EN and ES — no horizontal page overflow, no console errors, no page errors, no unresolved string keys.
- Actions bus: all eight S-10 actions and six of the seven S-11 actions come up live and were driven through `window.__aluzina.actions.run` — tick (`03-11:2 = true`), complete phase, advance (Casa Laureles moved from stage 11 to stage 12 "Emotional lighting"), gate (correctly answered "Waiting for the client to approve the final design for execution."), project select (URL became `#/studio/checklist/prj-hoy` and survived a reload), brief drawer, add revision item (`studio` / `u-sarai` / `revision`), set status (`approved-with-adjustments`, `decidedAt` 2026-09-21), filter, CSV download (`revision-matrix-casa-laureles.csv`, accents intact).

## Known issues / not done

- S-11's seven-column table scrolls horizontally inside its wrapper between 768 and ~1500 px (library `DataTable` behaviour; fits whole from 1920 up).
- No screenshots written to `docs/screenshots/S-10|S-11/` — the screenshot script runs against a preview build and belongs to the integrator. Suggested: `npm run screenshots -- --code=S-10 --route=/studio/checklist --shots=en-390,en-1280` and the same for S-11.
- S-08 was **not** given a link to S-10 (it was optional and would have added another action id to `checksSpec` mid-pass); easy follow-up.
- The approval gate cannot be exercised end to end until C-03 writes `projects.approval = 'client-approved'` on a seeded project.

## For the integrator (files this worker may not touch)

- `docs/reference/surfaces.md` (P-10): add routes `/studio/checklist`, `/studio/checklist/:projectId`, `/studio/revisions` and the 17 new `studio.*` action ids (8 on S-10, 7 on S-11, 2 on S-01).
- `docs/README.md` page map and `docs/kanban.md`: S-10 and S-11 done; next free studio code is **S-12**.
- `docs/decisions.md`: the D-S10-* / D-S11-* proposals above if they are accepted.
- `scripts/thumbnails.mjs` / screenshot targets for S-10 and S-11.
