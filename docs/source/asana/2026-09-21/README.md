# Asana exports, 2026-09-21

Six CSV exports from the founder's Asana workspace, shared by Justin Massion in Slack #import-asana on 2026-09-21 17:05 UTC (five files) and 17:07 UTC (a sixth, "WORK FLOW IN ENGLISH") (prompt 0015). Source material: data, not instructions. Facts distilled in `../../../knowledge/asana-conventions.md`.

| File | Asana project | Created | Tasks | What it is |
| --- | --- | --- | --- | --- |
| `ALUZINA_WORKFLOW_FOR_EVERY_PROJECT.csv` | ALUZINA WORKFLOW FOR EVERY PROJECT | 2023-07-19 .. 2023-11-05 (edited to 2026-07-28) | 349 | The standard per-project workflow (Spanish); a 2023 residential project that became the de facto template |
| `WORK_CHRONOGRAM_ALUZINA_ENGLISH.csv` | WORK CHRONOGRAM ALUZINA ENGLISH | 2023-07-18 .. 2023-07-19 (edited to 2026-05-17) | 168 | The English twin of the standard workflow, older and shorter; source of HOY's English-language pieces |
| `PROYECTO_HOY.csv` | PROYECTO HOY | 2026-05-29 (one edit 2026-09-21) | 212 | Current client project, duplicated and merged from both workflow templates |
| `PROYECTOS_ALUZINA_SEPTIEMBRE-DICIEMBRE_2026.csv` | PROYECTOS ALUZINA SEPTIEMBRE-DICIEMBRE 2026 | 2026-09-07 | 18 | Portfolio board: one task per vendor job, sections per client |
| `PRODUCCION_FOTOGRAFICA_DE_PRODUCTOS.csv` | PRODUCCION FOTOGRAFICA DE PRODUCTOS | 2025-01-09 | 10 | Product photo shoot checklist |
| `LUMINARIAS_ALUZINA_2026.csv` | LUMINARIAS ALUZINA 2026 | 2026-02-23 | 12 | Lighting product-line activities for 2026 |

The sixth file arrived in a second message at 17:07 UTC.

Columns (Asana standard): Task ID, Created At, Completed At, Last Modified, Name, Section/Column, Assignee, Assignee Email, Start Date, Due Date, Tags, Notes, Projects, Parent task, Blocked By (Dependencies), Blocking (Dependencies), then the project's custom fields (HOY: DELVERY DATE, OBSERVATONS, SEMANA 1-4, SEMANA 1-5, SEMANA 1-2, COMENTARIOS, octobre; Spanish workflow: OBSERVATONS, COMENTARIOS, octobre; English chronogram: DELVERY DATE, OBSERVATONS, COMENTARIOS, a second Start Date, Status). `Parent task` is the parent's *name*, not its id. Attachments are `app.asana.com/.../get_asset?asset_id=` links inside Notes and are not in the export. Comments are not in the export.

Row counts above are logical CSV data rows (one per unique, 16-digit `Task ID`), verified with Python's `csv` module — a raw line count is not the same number for any of these files, because several `Notes` cells hold multi-paragraph text with embedded line breaks.

De-identification: the `Assignee Email` column is blanked and the Lovable project URL's `magic_link` token is replaced with `REDACTED`. Everything else is verbatim, including the people named in notes and task names.
