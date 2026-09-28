version: 0.15.0 (docs only, no bump)
date: 2026-09-28
prompt: 0023
intent: Pass 1 of packaging imagine-os/aluzina as one self-describing tenant of Justin's future multitenant system: a point-in-time inventory of the repo at `7628f96`, the architecture (root `tenant.json` manifestVersion 1, platform-vs-tenant split by directory, namespace derived from the tenant id, `tenant_id` + `version` on rows, content mounts catalogued, sub-projects as data with `hostNeeds`, host requirements HR-01..HR-12, a CI build gate, the between-gigs second tenant slot), and the dependency-ordered pass plan tp-01..tp-13 as step 15 in the build plan, `plan.json` and the kanban. No app code changed.
decision: D-088 (self-describing tenant package, root `tenant.json` manifestVersion 1), D-089 (platform vs tenant split by directory into `src/tenant/`, workspace extraction deferred), D-090 (namespace derived from `TENANT.id`, values unchanged), D-091 (`tenant_id` + `version` on rows, SEED_VERSION 13), D-092 (binaries stay in git, catalogued as `contentMounts`, object storage is the host's, no LFS / history rewrite without Justin), D-093 (sub-project catalogue as data with `hostNeeds`), D-094 (`ci.yml` build gate on every push / PR incl. `tenant:validate`), D-095 (between-gigs = second tenant package, per-tenant docs counters, no shared counter), D-096 (tokens schema / values split with byte-identical CSS check)
rejected: extracting a `packages/platform` npm workspace now (~200 files and every import path churned for a host that does not exist yet; the by-directory split gives the same map, D-089); converting the committed binaries to Git LFS or rewriting history now (irreversible, breaks every clone and link; catalogued instead, D-092); opening pull requests for the passes (repo convention is commit and push to `main`; the new `ci.yml` gates pushes and PRs alike, D-094); renaming the `aluzina.*` keys, channels or `window.__aluzina` to a host-neutral name (would migrate every user's saved state and break the screenshot scripts; derived names keep the values, D-090); moving `docs/**` out of the bundle in this pass (changes the docs viewer, plan reader and five seeds before the host has chosen mounts vs fetch; recorded as HR-05)
files: docs/tenant/README.md (new), docs/tenant/inventory-2026-09-28.md (new), docs/tenant/manifest.md (new), docs/tenant/sub-projects.md (new), docs/tenant/platform-vs-tenant.md (new), docs/tenant/host-requirements.md (new), docs/tenant/between-gigs.md (new), docs/build-plan.md (step 15 row, parallelism note), docs/plan/plan.json (tasks tp-01..tp-13, updatedAt, source), docs/kanban.md (tp-01 Done; tp-02..tp-13 Backlog with tp-02 next; three housekeeping cards), docs/decisions.md (D-088..D-096), docs/prompts/0023-tenant-packaging.md (new), docs/changelog/0025-tenant-packaging-plan.md (new), docs/README.md (`tenant/` row, prompt 0023 / changelog 0025 mentions), docs/reference/surfaces.md (change-log pointer, no surface change)
codes: HUB-01 (the plan viewer D-05 and docs viewer D-06 / D-15 render the new files; no UI change)
model: Fable 5.1 (inventory, architecture, plan, decisions; the worker that wrote the files also ran on Fable 5.1)

# 0025 - Tenant packaging pass 1: inventory, architecture, plan (docs only)

## What

Justin asked in #merge-repos (prompt 0023) to "prepare and package up and organize the aluzina repo ... so it can be merged as one tenant with its various sub projects into a multitenant system", a system that "will have all kinds of tools for bringing all the individual deliverables and sub projects to life", in as many passes as needed. This pass produces the map and the plan; the code passes follow it.

1. **`docs/tenant/`** (new folder, seven files; `README.md` is the entry): the concept of a self-describing tenant package, the point-in-time inventory at `7628f96`, the `tenant.json` v1 spec field by field with aluzina's values (the contract tp-02 implements and tp-03 validates), the sub-project catalogue (nine entries with kind, paths, entry, build, codes, status, `dependsOn`, `hostNeeds`, owner), the platform-vs-tenant split map with the tp-05 move plan, host requirements HR-01..HR-12 each with "aluzina today / host must add", and the between-gigs second tenant slot with the host policy for counters, namespaces and routing.
2. **Step 15 "Tenant packaging"** in `build-plan.md` with tp-01..tp-13, the model per task and the DoD (build green + `tenant:validate` green + docs agree), mirrored as tasks in `plan/plan.json` (tp-01 done, tp-02 next, the rest backlog with `dependsOn`) and as cards in `kanban.md` (D-037: the three views agree).
3. **Decisions D-088..D-096** in `decisions.md`.
4. **Housekeeping found by the inventory** recorded as cards, not fixed here: root README status line stale (0.10.0 / 0013 vs 0.15.0 / 0024), `docs/pages/_TEMPLATE.md` surface list vs the code's `Surface` union, README "never run playwright install" vs `pages.yml` doing it (all tp-09); P-05 `DocFrame` duplicate; D-10 vs D-14 overlap; Python scripts without a requirements file. The 31 unregistered `work.*` actions already had a card.

## Why

A multitenant host can only "bring sub-projects to life" automatically if each tenant repo states what it contains as data the host's tools can read and validate: which surfaces and roles exist, which page codes are taken, which modules mount where, which deliverables are apps, static bundles, external links, data pipelines or docs, what each needs from the host, where the heavy content lives, and which browser keys the tenant owns. Today all of that is spread over constants in `apps/hub/src`, hand-kept lists in two scripts, and prose in `docs/`. The manifest makes it one file; the validator makes it true on every build; the directory split makes the tenant's own code findable without a package extraction the host cannot consume yet.

## Inventory headline

`inventory-2026-09-28.md`: one real workspace package (`apps/hub`, Vite 5 + React 18 + TS strict, 17 modules, 124 routes, ~57.5k LOC) plus a static Claude Design prototype (`apps/business-os`, runtime Babel, 141 MB), eight repo scripts, 860 docs files. `npm ci` and `npm run build` exit 0 (27 s; main chunk 2.2 MB). No lint, no tests, no env vars for the app; one deploy workflow. 377 MB working tree, 286 MB `.git`; five heavy committed folders (122 + 136 + 69 + 18 + 8.9 MB). Every `aluzina.*` key, the two BroadcastChannels and `window.__aluzina` are literals in 15 files. Rows have no `tenant_id` or `version`. `docs/**` is compiled into the bundle through `@docs`. Nine obstacles ranked in section 9; the biggest three are the compiled-in docs, the single hardcoded namespace, and the absence of a backend / tenant id.

## Pass plan

tp-01 (done, this changelog) -> tp-02 manifest + `src/tenant/config.ts` + namespace derivation (Fable 5.1) -> in parallel: tp-03 validator + `ci.yml` (Opus 5), tp-04 `tenant_id` + `version` (Fable 5.1), tp-05 moves into `src/tenant/` (Opus 5), tp-08 sub-project READMEs (Sonnet 5), tp-12 between-gigs checklist (Fable 5.1); after tp-05: tp-06 tokens split (Opus 5), tp-07 scripts read tenant data (Sonnet 5); after tp-03: tp-10 surfaces section (Sonnet 5); tp-09 stale docs (Sonnet 5) any time after tp-01; tp-11 QA closes the step (Sonnet 5); tp-13 waits for the host and credentials. Model routing per the workspace rule: Fable 5.1 judgment and shared code, Opus 5 building, Sonnet 5 mechanical passes.

## Open questions for Justin

1. **Default language** of the tenant (`identity.defaultLanguage`): D-004 made English primary; the studio works in Spanish. The manifest carries `en` until answered.
2. **Tenant routing in the host**: path (`/t/aluzina/`) or subdomain (`aluzina.<host>`). Both work with the relative base and HashRouter; the choice fixes `deploy.url` and the link slots.
3. **Go-ahead for the binaries**: moving the 122 MB archive renders, 136 MB prototype assets and 69 MB screenshots to object storage and / or Git LFS is irreversible in git; nothing moves without an explicit yes (D-092).
4. **between-gigs repo access** for this channel, so tp-12 can write its manifest and counters (D-095).

## Verification

Docs only. `npm run build` green before push (`plan.json` is imported through `@docs`, so the 13 new tasks were parsed by the app's build). Numbers taken after `git fetch origin main`: changelog 0025, prompt 0023, D-088..D-096; `docs/changelog/_pending/` absent.
