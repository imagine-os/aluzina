version: 0.10.0
date: 2026-09-21
prompt: 0016
intent: Show where the Asana intake is visible in the hub today (docs viewer D-15 / D-06, plan viewer D-05) with live captures; nothing built.
decision: none
rejected: capturing the live Pages URL (sandbox TLS, see changelog 0016)
files: docs/screenshots/D-15/asana-conventions/{en-390,en-1280,en-1920,es-1280,en-1280-table}.jpg, docs/screenshots/D-06/asana-tree-en-1280.jpg, docs/screenshots/D-05/asana-importer-card-en-1280.jpg, docs/prompts/0016-asana-in-the-hub-screenshots.md, docs/kanban.md
codes: D-05, D-06, D-15
model: Sonnet 5

# 0018 - Asana in the hub: screenshots

Justin asked, in the thread of prompt 0015, where he can see the Asana intake (commit 878ad17, `docs/knowledge/asana-conventions.md`, plan task `kb-asana-importer`) organized inside Aluzina OS today. Nothing to build yet — the answer is three captures of the pages that already carry it.

## A. Captures

Method: local production build of commit `4009a30` (`npm run build`, green), served with `npm run preview` on `http://localhost:4173`, captured with Chromium via `scripts/screenshots.mjs` (plus two small ad-hoc Playwright scripts, run against the same server, for the two shots the shared script has no flag for: expanding a `SpaceTree` folder, and scrolling to / filtering for one row). The live `https://imagine-os.github.io/aluzina/` URL was not captured — same sandbox TLS problem recorded in changelog 0016 (headless Chromium refuses the proxy's re-terminated certificate, and the harness denies the flag that would work around it). Content is identical, since Pages serves this same commit's build.

1. **D-15** document view, `docs/knowledge/asana-conventions.md`, role dev:
   - `en-390.jpg`, `en-1280.jpg`, `en-1920.jpg`, `es-1280.jpg` — top of the document, `--as=dev --settle=800`.
   - `en-1280-table.jpg` — same document, scrolled to the "Documents the data says the OS can generate" table (an ad-hoc script; `screenshots.mjs` has no scroll-to-selector flag).
   - Saved to `docs/screenshots/D-15/asana-conventions/`.
2. **D-06** docs tree/index, `/docs`, role dev, `en-1280.jpg`: the `knowledge/` folder starts collapsed in a fresh session, so an ad-hoc script clicked its `SpaceTree` treeitem before the shot to show `asana-conventions` listed under it. Saved to `docs/screenshots/D-06/asana-tree-en-1280.jpg`.
3. **D-05** plan viewer, `/dev/plan`, Board tab, role dev, `en-1280.jpg`: the backlog card for `kb-asana-importer` is not in the default viewport of a 78-task board, so an ad-hoc script typed `asana` into the plan's `SearchField` (3 of 78 match) and scrolled the Backlog column to the card before the shot. Saved to `docs/screenshots/D-05/asana-importer-card-en-1280.jpg`.

None of the existing `<lang>-<width>.jpg` files already in `docs/screenshots/D-05/`, `D-06/` or `D-15/` were touched.

## B. What the captures show

- **D-15 top (390/1280/1920/es-1280).** The document renders correctly: title, the `status/since/source` code block, the "Why this file exists" prose, all readable at every width. `es-1280.jpg` confirms the chrome translates (Documentación, Buscar, Volver al hub, DESARROLLO) while the document body stays in English exactly as written — the doc has no Spanish version, so this is expected, not a defect.
- **D-15 table (en-1280-table.jpg).** Confirms the changelog-0016 defect still stands on this document: the "Documents the data says the OS can generate" table has no minimum column width, so the header row wraps mid-word ("WORKFLO" / "W" for "MOMENT IN THE WORKFLOW") and several body cells wrap to one or two words per line, making the table hard to scan at 1280. Not fixed here (out of scope for this pass).
- **D-06 tree (asana-tree-en-1280.jpg).** With `knowledge/` expanded, `asana-conventions` is listed as a sibling of `brand`, `clients`, `competitions`, `deliverables`, etc. Also visible in this same shot: the README table on the right panel shows the identical letter-wrapping defect ("platfo" / "rm-" / "princi" / "ples.m" / "d"), so the D-06/D-15 table defect is not specific to `decisions.md` or `asana-conventions.md` — it hits any wide Markdown table rendered by this viewer.
- **D-05 card (asana-importer-card-en-1280.jpg).** With the plan search filtered to "asana", the Backlog column shows "Asana CSV importer behind K-06", Step 12, model badge `OPUS 5`, code badge `K-06`, "Nothing blocking" — matching `docs/plan/plan.json`'s `kb-asana-importer` task exactly.
- **Net answer for Justin.** The Asana intake is visible in two places today: as a docs page (D-15/D-06, the full write-up, searchable and linkable) and as one backlog card on the plan board (D-05, the importer that would turn the CSVs into real project rows). It is not yet rows in Work or Spaces — PROYECTO HOY and the other Asana projects don't exist as Aluzina entities until `kb-asana-importer` (K-06) is built, which is still backlog behind the two open questions from changelog 0017 (is HOY the Wellness Center, which zones are hers).

## C. Nothing changed in the app

No component, spec, string, route, permission or data-model change. `npm run build` green (tokens + tsc strict + vite + copy-static) before capturing, confirming the captures reflect a buildable commit.
