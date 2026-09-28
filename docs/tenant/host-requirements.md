# Host requirements (`tenant.json` `hostRequirements[]`)

What the multitenant host must provide to run aluzina as a tenant, numbered HR-01..HR-12 so `tenant.json` and the sub-project catalogue can point at them. Each row says what aluzina provides today (so the host knows the seam) and what the host must add. Derived from the obstacles in `inventory-2026-09-28.md` section 9.

## HR-01 Auth and identity

- **aluzina today:** identity is mocked. `apps/hub/src/auth/SessionProvider.tsx` holds a demo user from `auth/demoUsers.ts` (seven demo identities, `@demo.aluzina.local`), persists it under `aluzina.session`, exposes `switchUser` / `viewAs` (permission `session.viewAs`) and the `?as=<role>` URL contract (sessionStorage `aluzina.tabUser`). Permission guards are real (`RequireRole`, `hasPermission`, `useCan`; strings `<area>.<verb>` in `auth/permissions.ts`; `founder: ['*']`).
- **host must add:** a real identity provider that yields `{ userId, tenantId, roles[] }` into the same `SessionProvider` shape; per-tenant role sets (the tenant's `surfaces.roles`); a "view as" that stays available to dev / admin roles; a mapping from host users to the tenant's demo users for screenshots and QA.

## HR-02 Tenant-scoped data store

- **aluzina today:** `DataProvider` interface (`apps/hub/src/data/provider.ts`: `list / get / create / update / remove / subscribe / onConflict / setActor / reset`, all async) with one implementation, `MockProvider` (whole store in `localStorage['aluzina.data']` as `{ seedVersion, tables }`, 37 entities, `SEED_VERSION` 12). Base row `{ id, created_at, updated_at, updated_by? }`; after tp-04 also `tenant_id` and `version` (D-091). No backend, no HTTP API.
- **host must add:** a real provider (Supabase planned) that filters every query by `tenant_id`, enforces it on write, increments `version`, and honours `basedOn` for optimistic concurrency; a seeding path that runs the tenant's `seed/` modules once per tenant per `SEED_VERSION`; a file storage seam (`put(file) -> url`, backlog) for uploads.

## HR-03 Realtime and presence

- **aluzina today:** `BroadcastChannel('aluzina-data')` carries every write to other tabs with a `storage`-event fallback (D-023); `presence/PresenceProvider.tsx` heartbeats `{ tabId, userId, route, at }` on `BroadcastChannel('aluzina-presence')` every 5 s, expires at 15 s; `usePresence()` feeds `PresenceBar`. Conflicts: last-write-wins + `onConflict` toast (D-024). Channel names derive from the tenant id after tp-02 (D-090).
- **host must add:** Realtime + Presence transports per tenant behind `subscribe` and `usePresence()` (Supabase Realtime is the plan, `docs/reference/realtime-plan.md` is the planned doc); merge UI for `version` conflicts; an offline queue.

## HR-04 Object storage for content mounts

- **aluzina today:** all heavy content is committed: `apps/hub/public/archive` 122 MB (served at `./archive/`), `apps/business-os/assets` 136 MB (served at `./business-os/assets/`), `docs/screenshots` 69 MB, `docs/source` 18 MB, `docs/brand` 8.9 MB. Catalogued in `contentMounts[]` with `objectStorage: true` for the first three (D-092). Redaction rules R1..R7 exist because the Pages site is public (D-059).
- **host must add:** a per-tenant bucket / prefix that serves the `objectStorage: true` mounts at the tenant's `servedAt` paths, plus the migration tooling (upload, rewrite nothing in git, verify md5). Git LFS or a history rewrite in this repo happens only with Justin's explicit go-ahead.

## HR-05 Docs mount (or fetched docs)

- **aluzina today:** the hub compiles the tenant's `docs/` into the bundle through the Vite alias `@docs -> ../../docs` (`apps/hub/vite.config.ts`, mirrored in `tsconfig.json`): `docs/plan/plan.json` (plan reader), `docs/archive/**/*.json` and `docs/brand/*/index.json` (seeds, lazy loaders), every `docs/**/*.md?raw` (in-app docs viewer D-06 / D-15, lazy chunks). The build fails without them.
- **host must add:** either a per-tenant `docs/` mount at build time (the alias points at the tenant checkout) or a fetched-docs mode for the viewer and the plan reader; either way one docs tree per tenant, never merged.

## HR-06 Per-tenant theme loading

- **aluzina today:** `apps/hub/src/design/tokens.ts` mixes the token schema with aluzina's values (silver / gold metal ramps, pastels, DIN Round Pro -> Rubik, textures); `apps/hub/scripts/gen-tokens.mjs` writes the committed `src/styles/tokens.css`; `ThemeProvider` sets `data-theme` / `data-metal` on `<html>`; brand marks in `src/brand/paths.ts` and `public/brand/*.svg`. tp-06 splits schema from values (D-096) with a byte-identical CSS check.
- **host must add:** load `brand.tokenValues` per tenant into the platform schema at build (or serve one `tokens.css` per tenant) and serve the tenant's marks and fonts; enforce the "no licensed font without licence" rule (D-086).

## HR-07 Tenant routing

- **aluzina today:** GitHub Pages at `https://imagine-os.github.io/aluzina/`, Vite `base: './'` (relative, sub-path agnostic), HashRouter (`/#/...`), `dist/` at repo root with `.nojekyll`, the prototype copied to `dist/business-os/` with space-containing filenames and forwarders, thumbnails at `dist/thumbs/`. No server-side routing needed.
- **host must add:** a route root per tenant (`/t/<id>/` or `<id>.<host>`; **open question for Justin**), serving `dist/` under it unchanged; link slots for `external` sub-projects (P-00); a tenant switcher for host operators; a tenant index that registers each tenant by repo + manifest path with its `routePrefix` and `status` (shape: `tenants.example.json`, D-098). The relative base and HashRouter make both options work without a rebuild.

## HR-08 Deploy-time thumbnails

- **aluzina today:** `scripts/thumbnails.mjs` serves `dist/` on `127.0.0.1:4180` and screenshots every hub card with Playwright Chromium into `dist/thumbs/<code>.jpg` + `manifest.json` (D-011); runs in `pages.yml` after `npx playwright install --with-deps chromium`. The card list is hand-duplicated from `HubPage.tsx` (tp-07 fixes this by reading `tenant/hubCards.ts`).
- **host must add:** a Chromium-capable build stage that runs `npm run thumbs` per tenant against the tenant's build, or accepts committed thumbnails as a fallback.

## HR-09 Per-tenant docs counters and conventions

- **aluzina today:** `docs/prompts/NNNN-*.md` and `docs/changelog/NNNN-*.md` share one counter per folder (prompt 0023, changelog 0025 after this pass); `docs/decisions.md` rows `D-nnn` (D-096); `docs/qa/NNNN`; numbered files append-only, never renumbered; parallel workers draft in `docs/changelog/_pending/<module>.md`; every changelog names the model; `plan.json` = `kanban.md` = `build-plan.md`.
- **host must add:** per-tenant docs folders with **per-tenant counters, no shared counter** (D-095); a validator (`tenant-validate.mjs` checks `docs.counters` against the files) run in the host's CI for every tenant; a policy that the host's own decisions live in the host repo, never in a tenant's `decisions.md`.

## HR-10 CI gates

- **aluzina today:** one workflow, `.github/workflows/pages.yml`, builds and deploys on push to `main`; the only checks are `tsc --noEmit` inside the build and `defineSpec()` throwing on a malformed spec. No lint, no unit tests, no e2e. tp-03 adds `.github/workflows/ci.yml` (`npm ci && npm run build`, which includes `tenant:validate`) on every push and PR (D-094).
- **host must add:** run each tenant's `build` + `tenant:validate` as a required check before mounting a new version; optionally the 7-width screenshot matrix (360, 390, 768, 1280, 1920, 2560, 3840) as a visual gate.

## HR-11 WebMCP / actions aggregation

- **aluzina today:** every page declares `actions: [{ id '<module>.<verb>', label, intent, permission?, params? }]` in `specs.ts` (430 declarations, 409 distinct ids); live actions register on `src/actions/bus.ts` via `useRegisterAction(s)`; published as `window.__aluzina.actions = { run, list, declared }`; D-09 `/#/dev/actions` browses, runs and exports WebMCP JSON. No MCP server yet. 31 pre-0020 `work.*` actions are declared but not registered (kanban).
- **host must add:** aggregate `<tenantId>.<module>.<verb>` across tenants into one WebMCP / MCP surface, scoped by the caller's tenant and permission; read `actions.global` from the manifest to find the bus.

## HR-12 Annotations store

- **aluzina today:** **does not exist.** P-08 plans a `feedback` table + `FeedbackButton`; D-11 "File a bug" is a `Placeholder` ("not wired yet"). Testers cannot yet comment on the product itself.
- **host must add:** a tenant-scoped annotations store (comments, requests, bug reports with author, kind, route, page code, screenshot) and the triage flow (agents read from the store, fix or ask by author and kind, record the decision before changing anything); aluzina adds `FeedbackButton` against the `DataProvider` seam when the store exists.

## Summary table

| HR | Requirement | aluzina seam | Blocking pass |
| --- | --- | --- | --- |
| HR-01 | Auth and identity | `auth/SessionProvider.tsx`, `tenant/auth/*` | host |
| HR-02 | Tenant-scoped data store | `data/provider.ts`, `tenant_id` + `version` (tp-04) | tp-04, credentials |
| HR-03 | Realtime and presence | `subscribe`, `usePresence()`, derived channels (tp-02) | tp-02, host |
| HR-04 | Object storage | `contentMounts[]` | Justin's go-ahead |
| HR-05 | Docs mount | `@docs` alias | host decision |
| HR-06 | Per-tenant theme | `tenant/brand/tokens.values.ts` (tp-06) | tp-06 |
| HR-07 | Tenant routing | relative base + HashRouter | Justin's decision (path vs subdomain) |
| HR-08 | Deploy-time thumbnails | `scripts/thumbnails.mjs` (tp-07) | tp-07 |
| HR-09 | Per-tenant docs counters | `docs.counters`, validator (tp-03) | tp-03 |
| HR-10 | CI gates | `ci.yml` (tp-03) | tp-03 |
| HR-11 | Actions aggregation | `actions/bus.ts`, `window.__<id>.actions` | host |
| HR-12 | Annotations store | none (P-08) | host + P-08 |

## Change log

- 2026-09-28 (changelog 0025): HR-01..HR-12 first written. Fable 5.1.
- 2026-09-28 (changelog 0029): HR-07 names the host tenant index (`tenants.example.json`). Fable 5.1.
