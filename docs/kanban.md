# Kanban

One card per line. Steps refer to `build-plan.md`. Model per card in parentheses.

## Backlog

- Step 3: module split, PageSpecs, component metas, page docs, screenshots per width; `qa:responsive` + strings-coverage check (Opus 5, Sonnet 5)
- Media budget: convert `apps/business-os/assets/world/*.png` (93 MB) to webp / downscale once the audit says which are kept (Sonnet 5)
- Step 4: hub tools: role switcher + demo users, spec inspector, demo simulator, canvas, plan viewer (kanban / list / timeline with dependencies), `/#/dev/actions`, `/#/dev/components`, `/#/dev/tokens` (Fable 5.1, Opus 5)
- Step 5: surfaces: customer app C-xx, staff / admin A-xx, in-app docs D-06/D-07, ops manual M-xx, client proposal view (Opus 5)
- Step 6: Spanish fill pass over every strings table (Sonnet 5)
- Step 7: DataProvider seam (Mock, CompanyOs stub, Supabase later), base columns + subscribe, feedback table + FeedbackButton, actions bus + WebMCP generation (Fable 5.1)
- Step 8: realtime plan doc, presence, version column, offline queue (Fable 5.1, Opus 5)
- Awaiting Justin: default language en vs es for the hub and the OS (D-004)
- Awaiting Justin: does the public site join the OS as a P-xx module, or stay Lovable-hosted (linked)?

## Doing

- Step 2: audit the export against P-01..P-15: en/es toggle, responsive matrix, inputs, placeholders, actions registry; write `docs/reference/business-os-audit.md` (Fable 5.1, Sonnet 5) — next

## Done

- Step 0: monorepo layout (`apps/hub`, `apps/business-os` README, `docs/`, root workspaces) (Fable 5.1)
- Step 0: HUB-01 hub: EN/ES toggle, light/dark, dev mode, SpecChip + actions panel (Ctrl+.), Placeholder atom, tokens -> tokens.css with `--scale` bands, `window.__aluzina` manifest (Fable 5.1)
- Step 0: Pages workflow (`.github/workflows/pages.yml`), build green locally (Fable 5.1)
- Step 0: docs tree: README, principles, brief, build plan, decisions D-001..D-006, kanban, prompt 0001, changelog 0001, page template + HUB-01, surfaces (Fable 5.1)
- Step 0: first Pages deploy green (run 35542778592), live at https://imagine-os.github.io/aluzina/ (HTTP 200); live screenshots 390 / 1280 / 3840 EN + 390 ES in `docs/screenshots/HUB-01/` (Fable 5.1)
- Step 1: prototype verified live at https://imagine-os.github.io/aluzina/business-os/ (run 35543723076; zero external requests; EN/ES toggle works); screenshots BOS-01 (390 / 1280 / 3840 EN, 1280 ES) and BOS-02 (1280) in `docs/screenshots/` (Fable 5.1)
- Step 1: Claude Design export ingested at `apps/business-os/` (uploads dropped, D-009), runtime + fonts vendored (D-008), URL-safe entry points (D-010), copied into `dist/business-os/` by the root build, hub card BOS-01 live + Prototype pages BOS-02..06 (Fable 5.1)
- Justin's second Drive link delivered the correct 288 MB zip (D-006 resolved)
