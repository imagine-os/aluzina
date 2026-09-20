# Build plan

Order of operations bound by **dependencies, not dates**. Each step names the model that does the work: **Fable 5.1** for architecture, shared code and judgment; **Opus 5** for building modules and pages; **Sonnet 5** for mechanical passes (screenshots, Spanish fill, QA matrices). Expect repeated passes and polish; use parallel agents where steps are independent. The PM viewer (kanban / list / timeline with dependencies) is itself a planned hub tool (step 4, placeholder in the Dev tools card today); until it exists this file and `kanban.md` are the plan.

| Step | Work | Depends on | Model | Codes |
| --- | --- | --- | --- | --- |
| **0** | **Scaffold + Pages** (this pass): monorepo layout, HUB-01, tokens, i18n, Placeholder, dev mode, actions manifest, Pages workflow, docs tree, live screenshots. | – | Fable 5.1 | HUB-01 |
| **1** | **Ingest the Claude Design export** into `apps/business-os/`: unzip source (no `node_modules` / `dist`), package as `@aluzina/business-os`, build into `dist/business-os/` with relative base, mount under the hub (flip the card to live), record its stack and structure in `docs/reference/business-os-export.md`. | 0; the zip transferred (D-006) | Fable 5.1 (ingest, mount), Opus 5 (build fixes) | BOS |
| **2** | **Audit the export against the principles**: en / es toggle present and strings through a `useT()`-style layer, responsive matrix 360..3840, inputs (focus, targets, hover-only, drag-only), placeholders on every stub, actions registry per page, tokens vs hand-rolled styles. Output: `docs/reference/business-os-audit.md` with findings per page and a fix list. | 1 | Fable 5.1 (judgment), Sonnet 5 (matrix screenshots) | BOS-xx assigned |
| **3** | **Module split + PageSpecs + page docs + screenshots**: move the export's screens into modules with `defineSpec`, `strings`, metas for its components, `docs/pages/<CODE>.md`, screenshots per width. Add `qa:responsive` and a strings-coverage check. | 2 | Opus 5 (modules), Sonnet 5 (screenshots, QA matrix), Fable 5.1 (shared code) | BOS-xx |
| **4** | **Hub tools**: role switcher (view as any role, demo users), dev-mode spec inspector (tables, rules, components), demo simulator (phone + desktop), canvas laying out every page with zoom, plan viewer (kanban / list / timeline with dependencies) reading `docs/`, `/#/dev/actions`, `/#/dev/components`, `/#/dev/tokens`. | 3 (needs pages to show) | Fable 5.1 (SessionProvider, shells), Opus 5 (tools) | D-01..D-23 |
| **5** | **Surfaces**: customer app (C-xx), staff / admin dashboard (A-xx), in-app docs (D-06 / D-07), ops manual (M-xx), client proposal view of the full stack; public site stays aluzinaa.com (P-00) with a P-xx module only if Justin wants it in the OS. | 3, 4 | Opus 5 (pages), Fable 5.1 (shared shells, permissions) | C / A / M / D / P |
| **6** | **Spanish fill pass**: complete the `es` side of every strings table (export + surfaces), review tone with the owner's site as the reference voice. Never a blocker for earlier steps. | 3 (strings layer exists); repeats after 5 | Sonnet 5 | all |
| **7** | **Data provider seam**: `DataProvider` interface, `MockProvider` (localStorage) with `id / created_at / updated_at` base columns and `subscribe`, `CompanyOsProvider` stub (reference only, D-183-style hold), Supabase adapter later; `feedback` table + FeedbackButton (P-08); actions bus + WebMCP generation from the manifest. | 3 (knows the entities) | Fable 5.1 | – |
| **8** | **Multiplayer / realtime**: presence, `version` column and conflict UI, offline queue, realtime subscriptions through the provider. Plan doc first (`docs/reference/realtime-plan.md`). | 7 | Fable 5.1 (plan), Opus 5 (build) | – |

Parallelism: 4 and 5 can run as parallel agents per module once 3 lands; 6 runs alongside 5; 7 can start its interface during 3.

## Definition of done (every step)

Build green and pushed to `main`; `spec.checkedAt` recorded; screenshots in `docs/screenshots/<CODE>/`; page doc; changelog entry with `model:`; kanban moved; decisions logged; prompt log when a prompt was received; `docs/reference/surfaces.md` current; the P-01..P-15 checklist in `platform-principles.md` ticked.
