# Kanban

One card per line. Steps refer to `build-plan.md`. Model per card in parentheses.

## Backlog

- Step 1: ingest the Claude Design export into `apps/business-os/`, build into `dist/business-os/`, flip the hub card to live (Fable 5.1 / Opus 5) — waiting on the zip transfer (D-006)
- Step 2: audit the export against P-01..P-15: en/es toggle, responsive matrix, inputs, placeholders, actions registry; write `docs/reference/business-os-audit.md` (Fable 5.1, Sonnet 5)
- Step 3: module split, PageSpecs, component metas, page docs, screenshots per width; `qa:responsive` + strings-coverage check (Opus 5, Sonnet 5)
- Step 4: hub tools: role switcher + demo users, spec inspector, demo simulator, canvas, plan viewer (kanban / list / timeline with dependencies), `/#/dev/actions`, `/#/dev/components`, `/#/dev/tokens` (Fable 5.1, Opus 5)
- Step 5: surfaces: customer app C-xx, staff / admin A-xx, in-app docs D-06/D-07, ops manual M-xx, client proposal view (Opus 5)
- Step 6: Spanish fill pass over every strings table (Sonnet 5)
- Step 7: DataProvider seam (Mock, CompanyOs stub, Supabase later), base columns + subscribe, feedback table + FeedbackButton, actions bus + WebMCP generation (Fable 5.1)
- Step 8: realtime plan doc, presence, version column, offline queue (Fable 5.1, Opus 5)
- Awaiting Justin: transfer path for `ALUZINA Business OS prototype.zip` (288 MB) (D-006)
- Awaiting Justin: default language en vs es for the hub and the OS (D-004)
- Awaiting Justin: does the public site join the OS as a P-xx module, or stay Lovable-hosted (linked)?

## Doing

- Step 0: watch the first Pages deploy; confirm https://imagine-os.github.io/aluzina/ returns 200; capture live screenshots into `docs/screenshots/HUB-01/` (Fable 5.1)

## Done

- Step 0: monorepo layout (`apps/hub`, `apps/business-os` README, `docs/`, root workspaces) (Fable 5.1)
- Step 0: HUB-01 hub: EN/ES toggle, light/dark, dev mode, SpecChip + actions panel (Ctrl+.), Placeholder atom, tokens -> tokens.css with `--scale` bands, `window.__aluzina` manifest (Fable 5.1)
- Step 0: Pages workflow (`.github/workflows/pages.yml`), build green locally (Fable 5.1)
- Step 0: docs tree: README, principles, brief, build plan, decisions D-001..D-006, kanban, prompt 0001, changelog 0001, page template + HUB-01, surfaces (Fable 5.1)
