# Second tenant slot: between-gigs

The multitenant host is meant to hold more than aluzina. The first other candidate Justin named is **between-gigs**. Its repository is **not reachable from this channel's GitHub access yet** (2026-09-28), so nothing here describes its code; this file records what a second tenant package must provide and the host policy that keeps two tenants apart. tp-12 turns it into a checklist applied to the actual repo when access lands.

## What a second tenant package must provide

1. **A root `tenant.json` with `manifestVersion: 1`** following `manifest.md` field by field. Its `id` is its namespace root (`between-gigs`), its `surfaces.list`, `surfaces.roles`, `surfaces.codePrefixes` are its own (they need not overlap aluzina's), its `hubModules[]` and `subProjects[]` describe its deliverables with the same `kind` vocabulary (`app | static | external | data | pipeline | docs | platform-candidate`), and its `hostRequirements[]` lists only the HR-nn it relies on.
2. **Its own docs folder and counters** (D-095): `docs/prompts`, `docs/changelog`, `docs/decisions.md`, `docs/qa` starting at its own `0001` / `D-001`; numbered files append-only; `docs.counters` in its manifest; a `docs/README.md` start-here map; `docs/plan/plan.json` in the same shape (`{ version, updatedAt, source, statuses, tasks[] }`, D-037) so the platform's D-05 viewer renders it unchanged.
3. **Its own namespace**, derived from `id` by the platform's `tenant/config.ts` pattern: storage prefix `between-gigs.`, channels `between-gigs-data` / `between-gigs-presence`, global `window.__between_gigs` (hyphens become underscores in the global name; the derivation function decides once and the validator checks). No literal namespace strings outside its `src/tenant/`.
4. **A `src/tenant/` folder** (or the equivalent for its stack) holding config, brand values, auth constants, nav, hub cards, domain, seeds, so the platform-vs-tenant map is the same shape as aluzina's (`platform-vs-tenant.md`).
5. **Brand values, not a brand schema**: it fills the platform token schema with its own `tokens.values.ts`, marks, fonts (with licences), and its generated `tokens.css` passes the byte-identical check against its own values (D-096).
6. **`tenant_id` on every row** with the same base-row shape (`id, created_at, updated_at, updated_by?, tenant_id, version`, D-091), seeds stamped with its id, its own `SEED_VERSION` counter.
7. **`npm run build` green including `tenant:validate`** and a `ci.yml` that runs it on every push and PR (D-094). If its stack is not the hub's, the validator's checks that apply to any stack (manifest paths exist, counters match, no literal namespace) still run; the hub-specific checks (modules, specs, `SURFACES`) are skipped for `kind: app` entries whose `stack` is not `hub`.
8. **Content mounts catalogued**, with `objectStorage: true` where the host should own the bytes; no LFS or history rewrite in the tenant repo without the owner's go-ahead (D-092).
9. **A sub-project README per root** pointing at its manifest entry (as tp-08 does for aluzina).

## Host policy for two or more tenants

| Concern | Policy |
| --- | --- |
| Docs and counters | Per-tenant docs folders with per-tenant counters. **No shared counter** across tenants (D-095): aluzina's changelog 0026 and between-gigs' changelog 0026 are different files in different repos; the host's own history lives in the host repo. The host may build a cross-tenant index, never a merged numbered sequence. |
| Storage | Tenant-keyed: every browser key, channel and global derives from the tenant id (D-090), so two tenants served from one origin never collide; a host store filters by `tenant_id` (D-091). |
| Routing | Tenant-keyed: `/t/<id>/` path or `<id>.<host>` subdomain; **the host decides** (open question for Justin, changelog 0025). Both work with the hub's relative base and HashRouter without a rebuild. |
| Platform components | Shared: registry, specs, actions bus, i18n runtime, theme runtime and token schema, component library, `DataProvider` seam and mock, presence, shells, DevTools, builder / QA / docs modules, deploy scripts (`platform-vs-tenant.md`). Extracted into `packages/platform` when the host exists (tp-13, D-089); until then each tenant carries its copy and the manifest marks it `platformCandidate`. |
| Identity and roles | Host identity (HR-01) yields `{ userId, tenantId, roles[] }`; role vocabularies are per tenant; a host operator may hold roles in several tenants. |
| Actions | Aggregated as `<tenantId>.<module>.<verb>` (HR-11), permission-scoped per tenant. |
| Content | Per-tenant bucket / prefix for `objectStorage: true` mounts (HR-04); redaction rules stay the tenant's (`docs/archive/README.md` for aluzina). |
| Knowledge bases | Never merged: a `current` rule in one tenant's `docs/knowledge/` is not a rule in another's (D-012, D-087 per tenant). |
| Model routing and docs conventions | Adopted per tenant (same turn docs, model named per changelog, append-only numbering); the host validator enforces the manifest, not the prose. |

## Checklist to apply when access lands (tp-12)

- [ ] Clone `between-gigs`, read its README and package layout; write `docs/tenant/inventory-<date>.md` in *its* repo (same sections as aluzina's `inventory-2026-09-28.md`).
- [ ] Decide its `id`, `surfaces`, `roles`, `codePrefixes`; check for prefix collisions only if the host ever shows both tenants' codes side by side (they are namespaced by tenant, so collisions are allowed but worth avoiding).
- [ ] Write its `tenant.json` from `manifest.md`; run aluzina's `scripts/tenant-validate.mjs` against it (the script takes a repo root argument, tp-03 must keep that).
- [ ] Create its `docs/` counters at 0001 / D-001; record the decision to adopt the tenant package convention as its D-001.
- [ ] Derive its namespace; grep for literal keys.
- [ ] Add `ci.yml`.
- [ ] Record open questions for its owner (default language, routing, content mounts) in its first changelog.

## Change log

- 2026-09-28 (changelog 0025): first version; repo access pending. Fable 5.1.
