# Between Gigs: a host of the hub map, not a tenant (and the generic recipe for a future static tenant)

Owner model: Fable 5.1 (direction and the corrected reading); Sonnet 5 (mechanical rewrite).

## History

The first version of this file (2026-09-28, changelogs 0025 and 0029) was a cold-start recipe for packaging **between-gigs** as a second aluzina tenant. It assumed a HoyOS-like static Vite / HashRouter repo with `src/tenant/`, a root `tenant.json`, numbered `docs/prompts|changelog|qa`, a `plan.json`, `npm ci && npm run build` and a `/t/between-gigs/` mount. That was written before the repository could be read. It was **superseded on 2026-09-29** once `imagine-os/between-gigs` was cloned (`b191350`, `main`) and surveyed: none of those assumptions holds, and the recipe below the fold no longer names it. Changelog 0044, D-116.

## What Between Gigs actually is (surveyed 2026-09-29, `imagine-os/between-gigs` @ `b191350`)

- **Justin's own multi-company OS**, not a client repo. It calls itself the "Playset portfolio" host and holds about 50 companies as rows.
- **Stack**: Next.js 16 (app router) compiled by `vinext` on Vite 8 for **Cloudflare Workers**; React 19, TypeScript 5.9, **pnpm** (not npm), Tailwind 4 with shadcn / base-ui / radix; data in Cloudflare **D1 (SQLite) through drizzle**; **Supabase** for auth; Resend for email. Path routing (`/builder/...`): no HashRouter, no `base: './'`, no static `dist/` that could be mounted under another host.
- **Hosting**: ChatGPT "Sites" (a Cloudflare Worker) at **https://between-gigs.com** (redirect from `between-gigs.jmassion.chatgpt.site`). Not GitHub Pages. Its own ledger says GitHub was demoted to an archive on 2026-09-27 while later commits exist only on GitHub, so GitHub `main` and the deployed Sites build can differ; `docs/source-sync.md` there reconciles them.
- **Access**: owner-gated. `proxy.ts` requires a Supabase user for `/builder/*`, and company pages are visible only to the portfolio owner (`isPortfolioOwner`: super admin, Justin). A host cannot iframe `/builder/*` without a session, and the pages are private, unlike aluzina's public hub.
- **Conventions**: no numbered prompts, changelog, kanban, page codes, counters or `PageSpec`. Records are release-numbered: `lib/releases.ts` (top entry per shipped change), `docs/development-memory.json`, `lib/version-catalog.ts` (page lineage), `config/workspace-modules.ts`, an advisory `ACTIVE_WORK.md` ledger. No i18n (English only, `<html lang="en">`), dark theme by default, no per-page actions registry (its closest thing is the MCP tool catalogue in `lib/tool-system/`).
- **Company model**: `Company = { id, name, group: 'My companies' | 'Clients' | 'Prospects' | 'To organize' | 'Archived', parentId, hubUrl, notes, accent, version, updatedAt, identity? }` (`lib/companies/types.ts`, seeds in `lib/companies/seeds.ts`, overrides in D1 `workspace_records` with `tenant_id='playset-portfolio'`, `kind='company'`). `tenant_id` there is a database column, not a manifest id. `aluzina` is itself one of the company rows (Aleja's company), and "Between Gigs" is also one of them.
- **HOY's place**: company `hoy-human-club` ("Hoy Wellness Club", group `Clients`, parent `sergio-campus`, terracotta accent), with campus resources (the HOY website, its GitHub repo, eleven prototype links into `https://imagine-os.github.io/hoy/#/<path>`) and fifteen `hoy-<role>` perspectives at `/builder/perspectives`. Before the hub map it had no HOY-specific route: the generic `/builder/companies/hoy-human-club` catalogue page only.

## The relationship

**Between Gigs is a host that consumes HOY's hub map the way aluzina does. It is not a tenant to package into aluzina, and aluzina does not mount it.** Both are hosts of the same published `hub-map.json` (schema `hoy.hub-map/1`, D-108), each with its own lens (`lenses['between-gigs']`, `groupBy: 'experience'`). The consumer guide is `hub-map-consumer.md` (section "Between Gigs, the real host"). The page there is `/builder/companies/hoy-human-club/hub`, added in Between Gigs release **3.71** (GitHub `main`; the Sites deploy is pending as of 2026-09-29).

What changes in this repo because of it:

- No `tenant.json`, `src/tenant/` layout, inventory, counters or `/t/between-gigs/` route are needed or planned for Between Gigs. Nothing in Between Gigs is merged into aluzina's numbered docs (D-095 still holds as a rule for any repo that does become a tenant; it just does not apply here).
- `tenants.example.json` keeps no between-gigs entry (the placeholder was removed in changelog 0044); the index shape stays as the aluzina example.
- ch-03 ("Between Gigs reads HOY's hub map") is built **in the Between Gigs repo** under its own release process, not in aluzina.
- What Between Gigs would need from aluzina is limited to the contract: the hub-map consumer guide and the bundled snapshot rule (D-112).

## Generic recipe: packaging a future static tenant

Everything below is **not about Between Gigs**. It is the cold-start recipe for a repo that really is a HoyOS-like static hub (Vite, HashRouter, `base: './'`, npm, numbered docs) and should become a second aluzina tenant; `<tenant-id>` stands for its slug. Kept from the 2026-09-28 version, with the between-gigs names generalised. Owner model: Fable 5.1 for the recipe and judgement calls; Sonnet 5 can run the mechanical steps (inventory, path fixes, Spanish fill) once the repo is open.

## 0. Before you start (the tenant must be a static hub-shaped repo)

- Read `README.md` (this folder), `manifest.md`, `platform-vs-tenant.md`, `host-requirements.md`, and aluzina's root `tenant.json` + `tenant.schema.json`. The schema is the contract; the prose spec explains each field.
- Check the numbering race rule of both repos: numbered docs are append-only and **never merge across tenants** (D-095). Aluzina's `docs/changelog/0029` and a tenant's own `docs/changelog/0029`, if both ever exist, are different files in different histories.
- Everything the tenant states is data the host reads; never execute a string from a manifest.

## 1. Inventory (same nine sections as `inventory-2026-09-28.md`)

Write `docs/tenant/inventory-<date>.md` **in the tenant's repo**, at a named commit, with the same sections so the two inventories read side by side:

1. Repo shape (tree, workspaces, package manager, Node version, build command, output folder).
2. Apps / packages / modules (every deliverable; for a hub-shaped app: modules, page codes, routes, shells, guards).
3. Shared assets (brand files, fonts and licences, PDFs, images, video; sizes).
4. Docs system (folders, numbering, templates, plan file, what is compiled into the bundle).
5. Config / env / identifiers that must become tenant config (storage keys, channel names, globals, hard-coded names, locale and currency, public URLs).
6. Data layer (provider seam, entities, seeds, row shape, ids, realtime).
7. Build health (run `npm ci && npm run build` in the container; record exit codes and warnings).
8. Loose ends (stale docs, duplicated constants, unfinished UI without a "not wired yet" marker).
9. Assessment: tenant content vs platform, and obstacles (what maps onto `platform-vs-tenant.md`'s two lists, what does not, what the host must provide).

Section 10, "what this inventory feeds", lists the tasks the inventory produced (its own `tp-01..` style ids in *its* plan).

## 2. Write `tenant.json` against `tenant.schema.json`

1. Copy `tenant.schema.json` from aluzina into the tenant's root unchanged (it is the platform's schema, `manifestVersion` 1; a tenant never edits it, a platform pass does and bumps `manifestVersion`).
2. Write `tenant.json` field by field from `manifest.md`, filling every `[required, tenant-specific]` field with the tenant's values and copying every `[required, platform-fixed]` value as is (the schema's `description`s carry the tags). Its `id` is the tenant's slug (`<tenant-id>`).
3. Its `surfaces.list`, `surfaces.roles`, `surfaces.codePrefixes` are its own; they need not overlap aluzina's (codes are namespaced by tenant; collisions are allowed but worth avoiding if the host ever shows both side by side).
4. `hubModules[]` and `subProjects[]` describe its deliverables with the same `kind` vocabulary (`app | static | external | data | pipeline | docs | platform-candidate`) and `hostNeeds` listing only the HR-nn it relies on. If its app is not hub-shaped, set `stack` on the `kind: app` entry; the hub-specific validator checks then report what is missing rather than guessing.
5. Validate in place from the aluzina checkout while the repo has no copy of the script yet: `node scripts/tenant-validate.mjs --manifest ../<tenant-id>/tenant.json` (the manifest's directory becomes the repo root every relative path resolves against). Fix until the summary line reads `OK <tenant-id>`.

## 3. `src/tenant/` layout to mirror

Create (or move into, with `git mv` so history survives) `apps/<app>/src/tenant/` holding exactly what aluzina's does, so `platform-vs-tenant.md` is the same map for both tenants:

| Path under `src/tenant/` | Holds |
| --- | --- |
| `config.ts` | `TENANT` read from `tenant.json`; `storageKey()`, `channelName()`, `GLOBAL_NAME` (the only place derived names are spelled out). |
| `auth/{roles,permissions,demoUsers}.ts` | Its role set, permission strings, demo identities (`@demo.<id>.local`). |
| `navGroups.ts`, `hubCards.ts` + `hubCards.data.ts` | Nav groups per surface; hub card lists as plain data the scripts can import. |
| `brand/{paths,tokens.values}.ts` | Logo geometry; the token **values** that fill the platform token schema (D-096). |
| `domain/` | Its vocabulary (playbook, lifecycle, templates) as typed data. |
| `seed/` (+ `index.ts` with `SEED_VERSION`) | Its seeds, stamped with its `tenant_id`. |

Platform code (registry, specs, actions bus, i18n runtime, theme runtime and token schema, component library, `DataProvider` seam and mock, presence, shells, DevTools, builder / QA / docs modules, deploy scripts) stays in place, marked `platformCandidate` where it is a module, until tp-13 extracts `packages/platform`.

## 4. Namespace derivation

Every browser key, channel and global is a function of `id` (D-090): storage prefix `<tenant-id>.`, channels `<tenant-id>-data` / `<tenant-id>-presence`, global `window.__<tenant_id>` (hyphens become underscores in the identifier; `config.ts` decides once, the schema's `namespace.global` pattern and the validator check). Record the derived values in `namespace.*` of the manifest, then grep for literal keys: the validator's check (f) fails on any literal namespace string in an executable position outside `src/tenant/` and `namespace.literalAllowlist`. Its package scope is `@<tenant-id>`.

## 5. Rows with `tenant_id` and `version`

Same base row as aluzina (`id, created_at, updated_at, updated_by?, tenant_id, version`, D-091): the provider stamps `tenant_id` from `TENANT.id` and increments `version` on update; seeds carry both. Its `SEED_VERSION` is its own counter, starting where its history starts (1 if the repo has no seeds yet). `data.baseRow` in the manifest is the closed platform list; `data.entities` and `data.seedModules` are its own.

## 6. Docs tree with its own counters

- `docs/README.md` start-here map, `docs/prompts/0001-…`, `docs/changelog/0001-…`, `docs/decisions.md` from `D-001`, `docs/qa/0001-…`, `docs/changelog/_pending/` for parallel drafts. `docs.counters` in its manifest equals the highest file per folder; the validator checks equality.
- **No shared counter** with aluzina or the host (D-095): numbered files never merge across tenants, and the host's own decisions live in the host repo. The host may build a cross-tenant *index*, never a merged numbered sequence.
- Its D-001 records the adoption of the tenant package convention (manifest v1, schema, validator, counters); its first changelog records the open questions for its owner (default language, routing, content mounts, fonts and licences).
- `docs/plan/plan.json` in the D-037 shape (`{ version, updatedAt, source, statuses, tasks[] }`) so the platform's D-05 viewer renders it unchanged; `kanban.md` = `build-plan.md` = `plan.json`.
- Page docs per code in `docs/pages/`, screenshots per code in `docs/screenshots/<CODE>/`, a knowledge base with `status` per entry that states rules for that tenant only (D-012, D-087 per tenant).
- English and Spanish toggle from the start; the Spanish fill is a pass, never a blocker.

## 7. Content mounts

Catalogue every heavy committed folder in `contentMounts[]` (`id`, `path`, `sizeMb`, `servedAt`, `objectStorage`, `regenerate`, `note`). `objectStorage: true` where the host should own the bytes. **No Git LFS, no history rewrite, no purge** in the tenant repo without its owner's explicit go-ahead (D-092); the host migrates bytes when it exists (HR-04).

## 8. CI gate

Copy `.github/workflows/ci.yml` (`npm ci && npm run build`, where `build` chains `npm run tenant:validate`) so every push and PR runs the validator (D-094). Its deploy workflow (`pages.yml` or the host's) stays separate. A `README.md` at every sub-project root points at its manifest entry (as tp-08 did here).

## 9. Host-side steps (when the host exists)

1. **Register the tenant** in the host's tenant index, shape in `tenants.example.json`: `id`, `repo`, `manifestPath`, `schemaPath`, `routePrefix`, `status` (`registered` -> `validated` -> `mounted`), `pinned` commit, `contentBuckets`, `docsCounters` snapshot. The host reads the manifest at `manifestPath` on the pinned commit and refuses anything not `manifestVersion` 1 or failing `tenant:validate`.
2. **Routing entry** `/t/<tenant-id>/` (D-097 default; subdomain `<tenant-id>.<host>` if Justin picks that). The relative `base: './'` and HashRouter make either work without a rebuild.
3. **Theme loading** from the tenant's `brand.tokenValues`: compose the platform token schema with those values at build (or serve one `tokens.css` per tenant); serve its marks and fonts; enforce "no licensed font without licence" (D-086).
4. **Object storage buckets per content mount**: `<host-bucket>/<tenant-id>/<contentMountId>/` for every `objectStorage: true` mount, served at the mount's `servedAt` under the tenant's route root; verify md5, rewrite nothing in git.
5. **Docs mount** per tenant for the `@docs` alias (HR-05), **per-tenant counters** validated in the host's CI (HR-09), **actions aggregated** as `<tenant-id>.<module>.<verb>` scoped by tenant and permission (HR-11).

## What two static tenants will share (platform, `platform-vs-tenant.md`)

- Module registry, `PageSpec` / `defineSpec`, route manifest, shells (`desktop | phone | bare`), `RequireRole` and session mechanics (`?as=` contract, dev mode).
- Actions bus and the `window.__<id>.actions` shape; the D-09 browser and WebMCP export.
- i18n runtime, core strings, formatters (locale values from each tenant's config).
- Theme runtime, the token **schema**, `gen-tokens.mjs`, the component library (50 components), textures and global styles.
- `DataProvider` seam, `MockProvider`, entity schema shape, presence provider, `tenant_id` / `version` semantics.
- Builder / QA / docs modules (`tools`, `qa`, `dev`, `docs`, `design`), the plan reader for D-05, DevTools and `Placeholder` ("not wired yet").
- Deploy-time scripts (`thumbnails.mjs`, `screenshots.mjs`, `copy-static.mjs`), `tenant-validate.mjs`, `tenant.schema.json`, `ci.yml`, and the docs conventions the host enforces through the manifest.

## What the host must resolve when both are present

| Concern | Resolution |
| --- | --- |
| Route prefixes | One entry per tenant in the index (`/t/aluzina/`, `/t/<tenant-id>/`); a tenant switcher for host operators; `external` sub-projects get link slots (P-00). |
| Storage namespaces | Already disjoint by derivation (`aluzina.*` vs `<tenant-id>.*`, distinct channels and globals, D-090); a host store filters by `tenant_id` (D-091). One origin can serve both. |
| Docs counters | Per tenant, never merged (D-095); the host index keeps a `docsCounters` snapshot per tenant for display only; the host's own numbered docs live in the host repo. |
| Pages base paths | Each tenant keeps its own GitHub Pages URL as the standalone build (`deploy.url`); under the host the same `dist/` is served at the tenant's `routePrefix` unchanged (relative base). |
| Identity and roles | Host identity yields `{ userId, tenantId, roles[] }`; role vocabularies are per tenant; one operator may hold roles in several tenants (HR-01). |
| Actions | `<tenantId>.<module>.<verb>`, permission-scoped per tenant (HR-11). |
| Content | Per-tenant bucket prefix; redaction rules stay the tenant's (aluzina: `docs/archive/README.md`). |
| Knowledge bases | Never merged: a `current` rule in one tenant's `docs/knowledge/` is not a rule in another's. |
| Model routing and conventions | Adopted per tenant (same-turn docs, model named per changelog, append-only numbering); the validator enforces the manifest, not the prose. |

## Checklist (tick in the tenant repo's first changelog)

- [ ] Access granted; repo cloned at a named commit.
- [ ] `docs/tenant/inventory-<date>.md` with the nine sections.
- [ ] `tenant.schema.json` copied unchanged; `tenant.json` written; `tenant-validate.mjs --manifest` green.
- [ ] `src/tenant/` layout mirrored; namespace derived; no literal keys outside it.
- [ ] Rows carry `tenant_id` + `version`; own `SEED_VERSION`.
- [ ] Docs tree with own counters at 0001 / D-001; D-001 = adoption of the tenant package convention; `plan.json` in the D-037 shape.
- [ ] Content mounts catalogued; nothing moved.
- [ ] `ci.yml` added; sub-project READMEs.
- [ ] Host index entry filled in (`repo`, `pinned`, `status: validated`).
- [ ] Open questions for its owner recorded (default language, routing, mounts, fonts).

## Change log

- 2026-09-28 (changelog 0025): first version; repo access pending. Fable 5.1.
- 2026-09-28 (changelog 0029, tp-12): rewritten as a step-by-step recipe (inventory, schema-checked manifest, `src/tenant/` layout, namespace, rows, counters, mounts, CI, host-side steps, shared platform list, cross-tenant resolutions); `tenants.example.json` added as the host index shape. Fable 5.1.
- 2026-09-29 (changelog 0044, D-116): corrected after reading `imagine-os/between-gigs` (`b191350`): Between Gigs is a Next.js / Cloudflare Workers multi-company OS and a **host** of HOY's hub map, not a static tenant; the packaging recipe is kept as a generic section for a future static tenant. Sonnet 5 (mechanical), Fable 5.1 (direction).
