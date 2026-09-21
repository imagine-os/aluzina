version: 0.10.0
date: 2026-09-21
prompt: 0015
intent: Record how the founder runs projects and tasks in Asana from six CSV exports, keep de-identified copies as source material, and derive the data-model, importer and document-generation implications for the OS before anything is built on them.
decision: D-054
rejected: importing the tasks into the seed now (the HOY tree carries 2023 template residue and the founder has not confirmed which zones are HOY's); seeding vendor jobs as purchases before the margin and responsibility fields exist; storing assignee emails and the Lovable magic link (blanked / redacted)
files: docs/source/asana/2026-09-21/README.md, docs/source/asana/2026-09-21/PROYECTO_HOY.csv, docs/source/asana/2026-09-21/PROYECTOS_ALUZINA_SEPTIEMBRE-DICIEMBRE_2026.csv, docs/source/asana/2026-09-21/ALUZINA_WORKFLOW_FOR_EVERY_PROJECT.csv, docs/source/asana/2026-09-21/PRODUCCION_FOTOGRAFICA_DE_PRODUCTOS.csv, docs/source/asana/2026-09-21/LUMINARIAS_ALUZINA_2026.csv, docs/source/asana/2026-09-21/WORK_CHRONOGRAM_ALUZINA_ENGLISH.csv, docs/knowledge/asana-conventions.md, docs/knowledge/README.md, docs/knowledge/tools-in-use.md, docs/knowledge/clients.md, docs/knowledge/deliverables.md, docs/decisions.md, docs/kanban.md, docs/README.md, docs/plan/plan.json, docs/prompts/0015-asana-exports-intake.md, docs/changelog/0017-asana-exports-intake.md
codes: K-06, W-01, O-04, O-05, O-08, O-12, O-13, C-01, C-05, G-03
model: Fable 5.1 (analysis, doc text), Sonnet 5 (files, numbering, push)

# 0017 - Asana exports intake

Justin shared five Asana CSV exports in Slack #import-asana on 2026-09-21 17:05 UTC, and a sixth ("WORK FLOW IN ENGLISH") in a follow-up message at 17:07 UTC, so his client's founder's actual project- and task-management habits could be recorded before anything (the K-06 importer, document generators, the Work views) is built against them.

## A. What arrived

- `ALUZINA_WORKFLOW_FOR_EVERY_PROJECT.csv` — 349 tasks, 2023-07-19 .. 2023-11-05 (edited to 2026-07-28). The standard project workflow, in Spanish; a real 2023 residential project that became the de facto template by being duplicated.
- `WORK_CHRONOGRAM_ALUZINA_ENGLISH.csv` — 168 tasks, 2023-07-18 .. 2023-07-19 (edited to 2026-05-17). The English twin of the standard workflow, older and shorter; second message, 17:07 UTC.
- `PROYECTO_HOY.csv` — 212 tasks, all created 2026-05-29, one edit 2026-09-21. A current client project duplicated and merged from both templates above.
- `PROYECTOS_ALUZINA_SEPTIEMBRE-DICIEMBRE_2026.csv` — 18 tasks, created 2026-09-07. Portfolio board: one task per vendor job, sections per client or initiative.
- `PRODUCCION_FOTOGRAFICA_DE_PRODUCTOS.csv` — 10 tasks, created 2025-01-09. Product photo shoot checklist.
- `LUMINARIAS_ALUZINA_2026.csv` — 12 tasks, created 2026-02-23. Lighting product-line activities for 2026.

## B. What was recorded

- `docs/source/asana/2026-09-21/` — de-identified copies of all six CSVs (Assignee Email blanked, the Lovable project's `magic_link` token replaced with `REDACTED`, everything else verbatim) plus a `README.md` describing each file, its columns and the de-identification rule.
- `docs/knowledge/asana-conventions.md` (new) — the ten structural conventions seen across every export (sections as whatever the project needs, hand-numbered hierarchy up to five deep, native fields barely used, custom fields nearly empty, Notes as the real database, two language templates by duplication, external people as text not users, language drift explained by the second template, COP money format, attachments/comments outside the export); the standard Spanish workflow phase by phase; the English chronogram's own phase list; PROYECTO HOY reconciled against both templates (copied / taken from English / found in neither / dropped / renamed); the portfolio board's vendor-job note form and its twelve `ENCARGADO` entries; where Dropbox, Drive, Excel, Canva and WhatsApp sit in the same flow; the OS data-model implications (Zone and trade facets, a spec-item ladder, a vendor-job record, payment schedules, a bilingual project-template entity); the K-06 importer notes; and a table mapping eleven workflow moments to documents and existing/planned OS pages.
- `docs/knowledge/README.md`, `tools-in-use.md`, `clients.md`, `deliverables.md` — append-only extensions: a catalog row and change-log line for the new knowledge file; the Asana tools entry gets an "answered" update; `clients.md` gains a new section recording Sporti, Sodime and Bosques de la Concha as active Sep-Dec 2026 jobs (not reconciled with their `past` status above); `deliverables.md` gains a pointer to the document-generation table.
- `docs/decisions.md` — D-054: Asana exports are source material distilled in `asana-conventions.md`; the founder's two template projects are the reference for the Work views, K-06 and document generation.
- `docs/kanban.md` — six new Backlog cards (importer, template entity, vendor-job fields, document generators, two "awaiting founder / next intake" items) and a Done card for this pass.
- `docs/README.md` — a `source/asana/<date>/` row and an addition to the `knowledge/` row's summary.
- `docs/plan/plan.json` — one new backlog task `kb-asana-importer` (K-06, step 12, model Opus 5, `changelog: "0017"`); shape was clear (`tasks[]` with `id/title/step/status/model/codes/dependsOn/changelog`), so it was extended rather than skipped.
- `docs/prompts/0015-asana-exports-intake.md` — both Slack messages verbatim, the reply actually posted.

## C. Findings that change other files' assumptions

- **HOY identity still open.** PROYECTO HOY's tree reads as a residence (cinema, bar, guest room via the English chronogram's zone list) and carries 2023 vendor names (`federico`, `semco`) verbatim, which argues it has not been adapted to whichever client it is for yet. `clients.md` lists HOY Wellness Center as a **past** client; Justin calls HOY "a current project/client". Recorded as an open question, not resolved here.
- **The English chronogram reassigns HOY's apparent additions to template origin.** What a first reading of the Spanish-only workflow made look like HOY-specific additions (the `PRODUCTION` section name, `LAST PAYMENT OF THE DESIGN`, bathroom accessories, the four closing steps) turn out to be copied from the second, English-language template instead. Only the kickoff section and one merged task (`9. Muro lloron y jacuzzi`) are genuinely new in HOY.
- **Sporti and Sodime have active 2026 jobs**, while `clients.md` records both as past clients; Bosques de la Concha is a client not in `clients.md` at all. Appended as a new section there, nothing changed or removed.
- **Saray vs Sarai** spelling conflict between the Asana account (`Saray`) and `team.md` (`Sarai`) is unresolved; both spellings are kept, flagged for the founder.
- **`tools-in-use.md`'s Asana unknown is partly answered**: which projects, sections and custom fields exist is now known; which Asana plan and whether Asana stays remain `_unknown_`.

## D. Deferred

Six Backlog cards in `docs/kanban.md`: the K-06 CSV importer; a bilingual project-template entity; vendor-job purchase fields (`profitAluzina`, `aluzinaResponsibility`, payment rows); document generators (cotización Excel, RFQ packets, process-progress slide, acta de entrega); the HOY-identity / Sarai-Saray question for the founder; and the next intake (Dropbox tree, Canva document types) once drive-scraping access lands.

## E. Verification

- Row counts (logical CSV data rows, one per unique 16-digit `Task ID`, counted with Python's `csv` module against each source file before de-identification): HOY 212, Spanish workflow 349, portfolio 18, photo 10, luminarias 12, English chronogram 168. Every row in every file has exactly the header's column count and a unique numeric Task ID — no merged or malformed rows. A raw `wc -l` line count is **not** the same number for any of the first five files (it overcounts because several `Notes` cells hold multi-paragraph text with embedded line breaks); the counts used throughout this pass's documentation are the verified logical-row counts, not raw line counts.
- `grep -r "magic_link=mc_\|@gmail" docs/source/asana` returns nothing; a broader check for any `user@domain` email pattern across the six de-identified CSVs also returns nothing.
- `grep lovable.dev docs/source/asana/2026-09-21/*.csv` shows exactly one hit, in `PROYECTOS_ALUZINA_SEPTIEMBRE-DICIEMBRE_2026.csv`, correctly redacted to `?magic_link=REDACTED`.
- `npm run build`: result recorded in the pass report (green, or first error lines if not).
