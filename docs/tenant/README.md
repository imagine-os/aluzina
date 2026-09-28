# Tenant packaging: aluzina as one tenant of a multitenant host

Status: **pass 2 (tp-02 + tp-04) done, changelog 0026; pass 1 (tp-01) changelog 0025; prompt 0023, D-088..D-097.** `tenant.json` exists at the repo root and `apps/hub/src/tenant/config.ts` is the namespace source. Owner model: Fable 5.1 (architecture and plan). Start here, then read the files in the order of the table.

## What a tenant package is

The multitenant system Justin described will hold several client repos (this one, `between-gigs`, others) as **tenants** and will bring "all the individual deliverables and sub projects to life" with its own tools. For that to work without a human reading each repo, every tenant repo must be **self-describing**: one root manifest, `tenant.json` (`manifestVersion: 1`, D-088), from which the host discovers everything it needs to mount the tenant:

1. **Identity and locale**: `id` (`aluzina`, the namespace root), display name, default and supported languages, currency and locale formatting.
2. **Brand**: token *values* (colours, metal ramps, fonts, textures), marks, PDFs, the token values file the platform schema is filled with.
3. **Surfaces, roles, page codes**: the `Surface` union, the role set and permission strings, the page-code prefixes the platform regex accepts, the nav groups.
4. **Hub modules**: the 17 modules of `apps/hub/src/modules/`, their codes and guards (124 published routes).
5. **Sub-projects**: every deliverable that is not "the hub app" (the Claude Design prototype, the public site, the archive pipeline, the brand kit, the knowledge base, the Asana import, the design system, the docs and plan), each with kind, path, entry, build command, codes, status, `dependsOn` and `hostNeeds` (D-093). Catalogue: `sub-projects.md`.
6. **Data layer**: the `DataProvider` seam, the 37 entities, `SEED_VERSION`, the seed modules, and the two columns the host needs on every row (`tenant_id`, `version`, D-091).
7. **Content mounts**: the heavy committed binaries and which of them the host should own in object storage (D-092).
8. **Storage namespace**: every browser key, channel and global, derived from `id` (D-090).
9. **Deploy assumptions**: relative base, HashRouter, `dist/` layout, thumbnails at deploy, GitHub Pages.
10. **Docs conventions and counters**: prompts / changelogs / decisions / QA numbering, `_pending` merge rule, page docs, screenshots.
11. **Actions registry**: the WebMCP surface (`window.__aluzina.actions`, D-09), so the host can aggregate actions across tenants.
12. **`hostRequirements`**: the explicit list of what the host must provide (HR-01..HR-12 in `host-requirements.md`).

The manifest is **data the tools read**, not a promise the code keeps by convention: `scripts/tenant-validate.mjs` (tp-03) checks it against the repository on every build and in CI, so a stale manifest fails the build the same way a malformed `plan.json` does today.

## The layers

```
tenant.json  (manifestVersion 1)                       <- the host reads this first
|
+-- apps/hub/src/tenant/          tenant-owned code (config, brand values, auth constants, nav, cards, domain, seeds)   [tp-02, tp-05]
+-- apps/hub/src/<everything else> platform code, stays in place, documented as platform (platform-vs-tenant.md)          [extraction deferred, tp-13]
+-- apps/business-os/             sub-project: static prototype (BOS-01..06)
+-- scripts/archive/* + docs/archive + apps/hub/public/archive    sub-project: archive pipeline + data + served renders
+-- docs/**                       sub-project: knowledge, brand renders, plan, prompts, changelogs, decisions (compiled in via `@docs`)
+-- .github/workflows/{pages.yml, ci.yml}   deploy (today) and the build gate (tp-03)
```

## How the host consumes it

1. Read `tenant.json`; refuse anything not `manifestVersion: 1` or failing `tenant:validate`.
2. Mount the hub build (`npm ci && npm run build` -> `dist/`) under the tenant's route root (`/t/aluzina/` or a subdomain; the host decides, open question in changelog 0025) and set the tenant id on the platform config so storage keys, channels and the global are derived from it (D-090).
3. Mount each `subProjects[]` entry per its `kind`: `app` (build and serve), `static` (copy and serve), `external` (link), `data` / `pipeline` (register the scripts and their inputs), `docs` (mount the folder for the in-app viewer), `platform-candidate` (note for extraction).
4. Provide the `hostRequirements` (auth, tenant-scoped store, realtime, object storage, docs mount, theme loading, routing, thumbnails, per-tenant counters, CI, actions aggregation, annotations store).
5. Serve `contentMounts[]` from object storage where `objectStorage: true`, otherwise from the checkout.

## Files in this folder

| File | What it holds |
| --- | --- |
| `README.md` | This overview and the pass plan. |
| `inventory-2026-09-28.md` | Point-in-time inventory of the repo at `7628f96` (shape, apps, shared assets, docs system, identifiers, data layer, build health, loose ends, tenant-vs-platform assessment, obstacles). |
| `manifest.md` | The `tenant.json` v1 schema field by field with aluzina's values. **The spec tp-02 implements.** |
| `sub-projects.md` | The sub-project catalogue: table plus one section per sub-project (kind, paths, entry, build, codes, status, dependsOn, hostNeeds, owner model). |
| `platform-vs-tenant.md` | The split map (two path lists), the tp-05 move plan into `src/tenant/`, what is deferred and why. |
| `host-requirements.md` | HR-01..HR-12 on the multitenant host, each with "what aluzina provides today / what the host must add". |
| `between-gigs.md` | The second tenant slot: what a second package must provide, and the host policy for per-tenant docs counters, namespaces and routing. |

## Pass plan (step 15 in `../build-plan.md`, tasks `tp-01..tp-13` in `../plan/plan.json`, cards in `../kanban.md`)

| Task | Work | Depends on | Model | Status |
| --- | --- | --- | --- | --- |
| tp-01 | Inventory + tenant packaging plan + `docs/tenant/*` + decisions D-088..D-096 | – | Fable 5.1 | **done** (0025) |
| tp-02 | `tenant.json` manifest v1 + `src/tenant/config.ts` + namespace derivation (keys, channels, global) | tp-01 | Fable 5.1 | **done** (0026) |
| tp-03 | `scripts/tenant-validate.mjs` + `npm run tenant:validate` in `build` + `.github/workflows/ci.yml` | tp-02 | Opus 5 | next |
| tp-04 | `tenant_id` + `version` on the base row, MockProvider stamps them, `SEED_VERSION` 13 | tp-02 | Fable 5.1 | **done** (0026) |
| tp-05 | Move tenant-owned code into `src/tenant/` with `git mv`, tsc green | tp-02 | Opus 5 | next |
| tp-06 | Tokens schema / values split, `gen-tokens` output byte-identical | tp-05 | Opus 5 | backlog |
| tp-07 | `thumbnails.mjs` / `screenshots.mjs` read hubCards + demoUsers (no hand duplicates) | tp-05 | Sonnet 5 | backlog |
| tp-08 | One `README.md` per sub-project root pointing at its manifest entry | tp-02 | Sonnet 5 | backlog |
| tp-09 | Stale docs fixes (root README status, `_TEMPLATE` surfaces, playwright note, docs map) | tp-01 | Sonnet 5 | backlog |
| tp-10 | `surfaces.md` tenant section (manifest, validate script, CI) | tp-03 | Sonnet 5 | backlog |
| tp-11 | QA pass: build green, 7-width screenshots of HUB-01 / D-05 / D-09 unchanged, EN / ES spot check, docs agree | tp-03..tp-10 | Sonnet 5 | backlog |
| tp-12 | Second tenant slot: between-gigs package checklist, ready when access lands | tp-02 | Fable 5.1 | backlog |
| tp-13 | Host-time: extract `packages/platform`; real provider with `tenant_id`; object storage for content mounts | tp-05, tp-06, credentials | Fable 5.1 | backlog |

Definition of done for every pass: `npm run build` green (which will include `tenant:validate` from tp-03), docs agree (`plan.json` = `kanban.md` = `build-plan.md`), changelog with `model:`, decisions logged, `surfaces.md` current.

## Rules that hold during the packaging

- **No app behaviour changes for aluzina.** Storage keys, channel names and the global keep their exact values (D-090); `tokens.css` stays byte-identical (D-096); `SEED_VERSION` moves only when the row shape changes (D-091).
- **No history rewrite, no Git LFS, no binary purge** without Justin's explicit go-ahead (D-092). The binaries are catalogued, not moved.
- **No workspace extraction yet.** `packages/platform` waits for the host to exist (D-089).
- Docs land in the same turn as the code, numbered files stay append-only, every reply names the model (repo conventions, `../README.md`).

## Change log of this folder

- 2026-09-28 (changelog 0025, prompt 0023): folder created with the seven files above; step 15 and tp-01..tp-13 added to the plan; D-088..D-096 logged. Fable 5.1.
- 2026-09-28 (changelog 0026, prompt 0023): tp-02 and tp-04 done: root `tenant.json`, `apps/hub/src/tenant/config.ts`, every key / channel / global derived, `tenant_id` + `version` on rows, `SEED_VERSION` 13, `routing: path` (D-097). Fable 5.1.
