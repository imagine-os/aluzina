# docs/

**Start here** (agents and developers): this map, then `platform-principles.md` (binding P-01..P-15), `project-brief.md`, `build-plan.md`, `kanban.md` (state of work), `decisions.md` (why). Conventions follow imagine-os/petrock and imagine-os/hoy: numbered files are **append-only** and never renumbered; documentation is written in the **same turn** as the work.

| Path | What goes there |
| --- | --- |
| `platform-principles.md` | Binding principles P-01..P-15 adapted for Aluzina, each with today's state and queued work, plus the paste-in checklist. |
| `project-brief.md` | Client, what exists (Lovable site, Claude Design prototype), scope, bilingual requirement, reference repos, org rules. |
| `build-plan.md` | Development plan: steps bound by dependencies (not dates), model per task, definition of done. |
| `decisions.md` | Decision log, one row per `D-nnn`. Append-only; reversals add a row and mark the old one superseded. |
| `kanban.md` | `## Backlog` / `## Doing` / `## Done`, one `- ` card per line. |
| `prompts/NNNN-slug.md` | Prompt log: header (source, date, requester), `## Prompt (verbatim)`, then the exact heading `## Response`. Slack mention tokens stripped. |
| `changelog/NNNN-slug.md` | Change sets: header lines `version:`, `date:`, `prompt:`, `intent:`, `decision:`, `rejected:`, `files:`, `codes:`, `model:`, then body. |
| `pages/<CODE>.md` | One doc per page from `pages/_TEMPLATE.md`. |
| `screenshots/<CODE>/<lang>-<width>.jpg` + `routes.json` | Playwright captures (`npm run screenshots`) and the route manifest at capture time. |
| `reference/surfaces.md` | Every machine-drivable surface: route manifest, npm scripts, actions, planned WebMCP / CLI / API. Updated every pass. |

Numbering: prompts and changelogs share a counter per folder (`0001`, `0002`, ...). A changelog's `prompt:` line points at the prompt that caused it.

Page codes (shared vocabulary between specs, docs, screenshots and commits): `HUB-01` hub, `BOS-xx` Business OS prototype pages (assigned when the export is audited), `P-xx` public site, `C-xx` customer app, `A-xx` staff / admin, `M-xx` ops manual, `D-xx` dev tools and docs.

Planned folders (added when their step starts): `reference/business-os-audit.md` (step 2), `design/` (tokens draft from the export), `data/`, `rules/`, `ops-manual/`, `qa/`.
