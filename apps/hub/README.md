# apps/hub

The **ALUZINA Business OS**: a Vite 5 + React 18 + TypeScript SPA. Five portals (founder, ops, studio,
brand, client), public pages, an operations manual, in-app docs and dev / QA tools — 17 modules, 124
published routes. `apps/hub/src/modules/README.md` is the module contract (how to add a page, codes,
shells, data, components, docs a module writes); read it before touching a module.

## Tenant package

This is the `hub` sub-project in `tenant.json` `subProjects[]` (kind `app`, status `live`; code HUB-01 +
every module code). Entry: `index.html`; build: `npm run build` (root) -> repo-root `dist/`. Tenant-owned
code (auth, seeds, domain, brand values, hub cards) lives under `src/tenant/`, read from the root
`tenant.json`; everything else here is platform code, documented as such in
`docs/tenant/platform-vs-tenant.md`. The host must provide identity, a tenant-scoped store, realtime,
a docs mount, per-tenant theme values, tenant routing, deploy-time thumbnails and actions aggregation
(HR-01, 02, 03, 05, 06, 07, 08, 11). Full entry: `docs/tenant/sub-projects.md`.
