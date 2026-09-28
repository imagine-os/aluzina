# Tenant packaging: aluzina as one tenant of a multitenant host

Status: **QA (tp-11) done, changelog 0030 — step 15 complete except tp-13; pass 5a (tp-12) done, changelog 0029; pass 4 (tp-07..tp-10) changelog 0028; pass 3 (tp-03 + tp-05 + tp-06) changelog 0027; pass 2 (tp-02 + tp-04) changelog 0026; pass 1 (tp-01) changelog 0025; prompt 0023, D-088..D-098.** **Packaging complete for one tenant; tp-13 waits on the host and credentials.** `tenant.json` exists at the repo root with `tenant.schema.json` beside it (the structural contract, D-098), `apps/hub/src/tenant/` holds the tenant-owned code (config, auth constants, nav groups, hub cards, domain, seeds, brand paths, token values), and `npm run tenant:validate` checks the manifest in every build and in `.github/workflows/ci.yml`. Owner model: Fable 5.1 (architecture and plan). Start here, then read the files in the order of the table.

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

The manifest is **data the tools read**, not a promise the code keeps by convention: `scripts/tenant-validate.mjs` (tp-03) checks it against `tenant.schema.json` (tp-12, D-098) and against the repository on every build and in CI, so a stale manifest fails the build the same way a malformed `plan.json` does today.

## The layers

```
tenant.json  (manifestVersion 1)                       <- the host reads this first
tenant.schema.json                                     <- its structural contract (D-098); the validator walks the manifest against it
|
+-- apps/hub/src/tenant/          tenant-owned code (config, brand values, auth constants, nav, cards, domain, seeds)   [tp-02, tp-05]
+-- apps/hub/src/<everything else> platform code, stays in place, documented as platform (platform-vs-tenant.md)          [extraction deferred, tp-13]
+-- apps/business-os/             sub-project: static prototype (BOS-01..06)
+-- scripts/archive/* + docs/archive + apps/hub/public/archive    sub-project: archive pipeline + data + served renders
+-- docs/**                       sub-project: knowledge, brand renders, plan, prompts, changelogs, decisions (compiled in via `@docs`)
+-- .github/workflows/{pages.yml, ci.yml}   deploy (today) and the build gate (tp-03)
```

## How the host consumes it

1. Register the tenant in its index by repo + manifest path (`tenants.example.json`), read `tenant.json`; refuse anything not `manifestVersion: 1`, failing `tenant.schema.json`, or failing `tenant:validate`.
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
| `between-gigs.md` | **Packaging a second tenant**: the cold-start recipe (inventory, schema-checked manifest, `src/tenant/` layout, namespace, rows, own counters, mounts, CI, host-side steps), what the tenants share, what the host resolves when both are present; between-gigs access status. |
| `tenants.example.json` | The host's tenant index shape (D-098): aluzina filled in, between-gigs placeholder. |
| `../../tenant.schema.json` | (repo root) JSON Schema for manifest v1, every field tagged tenant-specific / platform-fixed / derived / optional. |

## Pass plan (step 15 in `../build-plan.md`, tasks `tp-01..tp-13` in `../plan/plan.json`, cards in `../kanban.md`)

| Task | Work | Depends on | Model | Status |
| --- | --- | --- | --- | --- |
| tp-01 | Inventory + tenant packaging plan + `docs/tenant/*` + decisions D-088..D-096 | – | Fable 5.1 | **done** (0025) |
| tp-02 | `tenant.json` manifest v1 + `src/tenant/config.ts` + namespace derivation (keys, channels, global) | tp-01 | Fable 5.1 | **done** (0026) |
| tp-03 | `scripts/tenant-validate.mjs` + `npm run tenant:validate` in `build` + `.github/workflows/ci.yml` | tp-02 | Opus 5 | **done** (0027) |
| tp-04 | `tenant_id` + `version` on the base row, MockProvider stamps them, `SEED_VERSION` 13 | tp-02 | Fable 5.1 | **done** (0026) |
| tp-05 | Move tenant-owned code into `src/tenant/` with `git mv`, tsc green | tp-02 | Opus 5 | **done** (0027) |
| tp-06 | Tokens schema / values split, `gen-tokens` output byte-identical | tp-05 | Opus 5 | **done** (0027) |
| tp-07 | `thumbnails.mjs` / `screenshots.mjs` read hubCards + demoUsers (no hand duplicates) | tp-05 | Sonnet 5 | **done** (0028) |
| tp-08 | One `README.md` per sub-project root pointing at its manifest entry | tp-02 | Sonnet 5 | **done** (0028) |
| tp-09 | Stale docs fixes (root README status, `_TEMPLATE` surfaces, playwright note, docs map) | tp-01 | Sonnet 5 | **done** (0028) |
| tp-10 | `surfaces.md` tenant section (manifest, validate script, CI) | tp-03 | Sonnet 5 | **done** (0028) |
| tp-11 | QA pass: build + `tenant:validate` green, CI checked green, 7-width EN-light + ES + dark screenshots of HUB-01 / D-05 / D-09 / D-10 / S-01, functional smoke, docs agree | tp-03..tp-10 | Sonnet 5 | **done** (0030) |
| tp-12 | Second tenant slot: `tenant.schema.json`, schema / actions checks + `--manifest` in the validator, between-gigs recipe, host tenant index shape | tp-02 | Fable 5.1 | **done** (0029); applying it to between-gigs waits for repo access |
| tp-13 | Host-time: extract `packages/platform`; real provider with `tenant_id`; object storage for content mounts | tp-05, tp-06, credentials | Fable 5.1 | backlog |

Definition of done for every pass: `npm run build` green (which includes `tenant:validate` since tp-03), docs agree (`plan.json` = `kanban.md` = `build-plan.md`), changelog with `model:`, decisions logged, `surfaces.md` current.

## Rules that hold during the packaging

- **No app behaviour changes for aluzina.** Storage keys, channel names and the global keep their exact values (D-090); `tokens.css` stays byte-identical (D-096); `SEED_VERSION` moves only when the row shape changes (D-091).
- **No history rewrite, no Git LFS, no binary purge** without Justin's explicit go-ahead (D-092). The binaries are catalogued, not moved.
- **No workspace extraction yet.** `packages/platform` waits for the host to exist (D-089).
- Docs land in the same turn as the code, numbered files stay append-only, every reply names the model (repo conventions, `../README.md`).

## Migration readiness (kept current; last verified 2026-09-28, changelog 0031)

What a migration thread should check before mounting this tenant in the host, and where each item stood at the last verification. Update this section in the same turn as any change that moves one of these facts.

| Item | State at last verification |
| --- | --- |
| Last verified commit | the commit of changelog 0031 (this section's date); the commit before it, `4b919fb` (changelog 0030), had `ci.yml` and `pages.yml` both **success** (GitHub REST check-runs / actions-runs). |
| `npm run build` (includes `tenant:validate`) | exit 0 on the 0031 checkout: Vite build + `tenant:validate` OK (schema, 17 modules / 88 codes, 430 actions / 409 distinct, 9 sub-projects, 5 content mounts, seed v13, 37 entities, plan.json steps 0-16, counters prompts 24 / changelog 31 / decisions 102 / qa 7). |
| CI on the 0031 commit | see the run linked from the Slack reply / prompt 0024's Response; re-check with `GET /repos/imagine-os/aluzina/commits/<sha>/check-runs` before mounting. |
| Manifest | `tenant.json` manifestVersion 1, version 0.19.0, validated against `tenant.schema.json`; `docs.counters` mirror the highest numbered files. |
| Version | 0.19.0 (`package.json`, `apps/hub/package.json`, `tenant.json`, `docs/plan/plan.json` agree). `SEED_VERSION` 13. |
| `docs/tenant/` files | every file in this folder is listed in the table above and in `../README.md`'s `tenant/` row (`README.md`, `inventory-2026-09-28.md`, `manifest.md`, `sub-projects.md`, `platform-vs-tenant.md`, `host-requirements.md`, `between-gigs.md`, `tenants.example.json`). |
| Docs agreement | `plan.json` = `kanban.md` = `build-plan.md` on every `tp-*` and `wa-*` status (checked by hand this pass; the validator checks steps, dependsOn and statuses). |
| Domain data since 0030 | `playbook.ts` gained the client-facing status map, project lines and G-15..G-17 (changelog 0031, D-099..D-101) — data only, no route / action / seed / storage-key change, so nothing in the host contract (`hostRequirements`, `namespace`, `dataLayer`) moved. |
| Open items with Justin | unchanged from 0029 / 0030: between-gigs repo access (tp-12 application), path vs subdomain routing (D-097 defaults to path), go-ahead before any binary leaves git (D-092). New founder questions from the process flow (not blockers): Site Visit / Installation as internal statuses or derived (wa-02), stage owners, Spanish wording of the flow (wa-07). |
| Still host-time | tp-13 (extract `packages/platform`, real `DataProvider` with `tenant_id`, object storage for `contentMounts`) — blocked on the host + credentials. |

## Change log of this folder

- 2026-09-28 (changelog 0025, prompt 0023): folder created with the seven files above; step 15 and tp-01..tp-13 added to the plan; D-088..D-096 logged. Fable 5.1.
- 2026-09-28 (changelog 0026, prompt 0023): tp-02 and tp-04 done: root `tenant.json`, `apps/hub/src/tenant/config.ts`, every key / channel / global derived, `tenant_id` + `version` on rows, `SEED_VERSION` 13, `routing: path` (D-097). Fable 5.1.
- 2026-09-28 (changelog 0027, prompt 0023): tp-05, tp-06 and tp-03 done: tenant-owned code moved into `apps/hub/src/tenant/` with `git mv` (29 files, no shims), hub card lists into `tenant/hubCards.ts`, locale / currency read from `tenant.json`; token schema / values split with `tokens.css` byte-identical; `scripts/tenant-validate.mjs` in `npm run build` and `.github/workflows/ci.yml`; version 0.17.0. tp-07..tp-10 are next. Opus 5.
- 2026-09-28 (changelog 0028, prompt 0023): tp-07..tp-10 done: `scripts/thumbnails.mjs` / `screenshots.mjs` read `tenant/hubCards.data.ts` (a plain-data sibling of `hubCards.ts` that Node's type-stripping can import) and `tenant/auth/demoUsers.ts` instead of a hand-kept card list / role map, both scripts gain a `--list` flag, K-05 / K-06 added to the thumbnail list, the two module-local `WEBSITE_URL` constants read `TENANT.publicSite`; a `README.md` for every sub-project root that lacked one plus a "Tenant package" section on every one that already had a README, `scripts/README.md` and `scripts/archive/requirements.txt`; root README status / playwright note / a "Tenant package" paragraph, `_TEMPLATE.md` surfaces, nine knowledge entries and thirteen page docs with pre-move paths fixed, `actions.declared` / `distinct` recounted (430 / 409, unchanged); `surfaces.md` section 1.8 "Tenant package". Version 0.17.1. tp-11 (QA) and tp-12 (second tenant slot) are next. Sonnet 5.
- 2026-09-28 (changelog 0029, prompt 0023): tp-12 done: `tenant.schema.json` at the repo root (JSON Schema draft 2020-12 for manifest v1, fields tagged tenant-specific / platform-fixed / derived / optional; closed sets only `routing`, `namespace.storageKeys`, `deploy.docsAlias`); `scripts/tenant-validate.mjs` walks the manifest against it with a dependency-free subset walker, recounts `actions.declared` / `distinct` (430 / 409) and takes `--manifest <path>`; `between-gigs.md` rewritten as the recipe "Packaging a second tenant"; `tenants.example.json` host index shape; D-098; version 0.18.0. between-gigs itself is still unreachable from this channel's GitHub access. tp-11 (QA) is next. Fable 5.1.
- 2026-09-28 (changelog 0030, prompt 0023): tp-11 (QA) done, closing step 15 except tp-13: CI checked green on `ee89009` / `19c012c` (`ci.yml` + `pages.yml`); `npm run build` green; 7-width EN-light + 390/1920 ES + 390/1920 dark screenshots of HUB-01 / D-05 / D-09 / D-10 / S-01 (`?as=studio`), 35/35 matrix cells pass (0 overflow, 0 console errors, 0 failed requests, every sampled target >= 44 px, smallest legible font at 3840 is 18 px), visible focus ring, `data-theme` dark, ES headings translated; functional smoke matches `plan.json` / the manifest exactly (D-05's List view, D-09's 409 distinct live actions, the Placeholder "not wired yet" shape, the role guard, the `aluzina.*`-only storage namespace, every row carrying `tenant_id` + `version`); docs agreement confirmed; `docs/qa/0007`; no code defects found. Version 0.18.1. **Packaging is complete for one tenant (aluzina); tp-13 waits on the host and credentials.** Sonnet 5.
- 2026-09-28 (changelog 0031, prompt 0024): process-flow intake — no tenant-packaging code changed; `tenant.json` moves to version 0.19.0 with counters prompts 24 / changelog 31 / decisions 102 and the `brand-renders` mount grows to ~10 MB (`docs/brand/process-flow/`); this "Migration readiness" section added as the first thing a migration thread reads. Fable 5.1.
