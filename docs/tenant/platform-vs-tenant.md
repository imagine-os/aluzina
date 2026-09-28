# Platform vs tenant: the split inside `apps/hub/src` (D-089)

Decision: the split is made **by directory, not by package**. Tenant-owned code moves into `apps/hub/src/tenant/` (tp-05); platform code stays where it is and is documented here as platform. Extracting the platform half into a `packages/platform` workspace is **deferred until the multitenant host exists** (tp-13): doing it now would churn ~200 files and every import path for a consumer that does not exist yet, and the by-directory split already gives the host an unambiguous map. The lists below are the inventory's section 9 (`inventory-2026-09-28.md`), used verbatim as the move map.

## Tenant-owned (moves to `src/tenant/` in tp-05, or is catalogued as content)

| Today | After tp-05 | What it is |
| --- | --- | --- |
| (new) | `src/tenant/config.ts` | `TENANT = { id: 'aluzina', ... }` read from `tenant.json`; `storageKey(name)`, `channelName(name)`, `globalName()` (tp-02, D-090). |
| `src/auth/roles.ts` (`ROLES`, `ROLE_META`, portal roles) | `src/tenant/auth/roles.ts` | The tenant's role set. `SessionProvider.tsx`, `RequireRole.tsx` stay in `src/auth/` as platform and import the constants. |
| `src/auth/permissions.ts` | `src/tenant/auth/permissions.ts` | ~70 permission strings, `founder: ['*']`. |
| `src/auth/demoUsers.ts` | `src/tenant/auth/demoUsers.ts` | The demo identities (real team + invented), `@demo.aluzina.local`. |
| `src/app/navGroups.ts` | `src/tenant/navGroups.ts` | 23 nav groups per surface. |
| `PRODUCT_SURFACES`, `TOOL_SURFACES`, `PORTALS`, `PROTOTYPE_PAGES`, `REPO_URL`, `WEBSITE_URL` inside `src/modules/hub/HubPage.tsx` | `src/tenant/hubCards.ts` | Hub card lists as data; `HubPage.tsx` renders them; `scripts/thumbnails.mjs` reads them (tp-07). |
| `src/brand/paths.ts` | `src/tenant/brand/paths.ts` | Logo geometry from the brand manual. |
| brand values inside `src/design/tokens.ts` | `src/tenant/brand/tokens.values.ts` | Colours, metal ramps, fonts, textures (tp-06, D-096). `src/design/tokens.ts` keeps the schema and re-exports the filled object. |
| `src/domain/` (`playbook.ts`, `archive.ts`, `collections.ts`, `templates/aluzina-workflow.ts`, `index.ts`) | `src/tenant/domain/` | The founder's playbook, lifecycle vocabulary, project template. |
| `src/data/seed/**` (16 modules + `asana/`) | `src/tenant/seed/` | All seeds, incl. Asana-derived. `seed/index.ts` (runner, `SEED_VERSION`) stays platform-shaped but lives with the seeds; `data/seed/index.ts` becomes a one-line re-export so `MockProvider` does not change. |
| locale and currency settings in `src/i18n/format.ts` (`formatCop`, `es-CO`) | values in `src/tenant/config.ts`; `format.ts` stays platform | `format.ts` reads `TENANT.currency` / locales. |
| module `strings.ts` | stay in their modules | Strings are per module by contract (`modules/README.md`); a module is tenant content by construction. |
| `src/data/schema/*` field-level choices (COP, 15 pipeline statuses) | stay in `schema/` | The entity shapes are platform-shaped; their enumerations come from `tenant/domain`. Not moved. |
| `index.html` title / meta / favicon / font link | stay; values come from `tenant.json` in tp-02 (Vite `define` or an HTML transform) | |
| `apps/hub/public/{archive,brand}`, `apps/business-os/`, `docs/**`, root `README.md`, `.github/workflows/pages.yml`, `scripts/import-asana.mjs`, `scripts/archive/*` | stay; catalogued in `subProjects[]` / `contentMounts[]` / `deploy` | Content and tenant pipelines, not code to relocate. |

Module page content (`founder`, `ops`, `studio`, `brand`, `client`, `public`, `sets`, `manual`, `archive`, `work`, `spaces`) is tenant-owned but stays under `src/modules/` because the module contract *is* the tenant extension point.

## Platform (stays in place, documented as platform; extraction deferred to tp-13)

| Path | What it is |
| --- | --- |
| `src/app/registry.ts`, `src/app/App.tsx`, `src/app/RoutesContext.tsx`, `src/app/shells.tsx` + `.css`, `src/app/manifest.ts` | Module registry (`import.meta.glob`), provider stack, shells (`desktop`, `phone`, `bare`), `window.__<id>` manifest. |
| `src/specs/PageSpec.ts` | `defineSpec`, `RouteDef`, `Surface`, `CODE_RE`, `specCompleteness()`. `SURFACES` and the prefix list become derived from `tenant.json` in a later pass; today they are constants the validator compares. |
| `src/actions/bus.ts` (+ hook) | Actions bus: `registerAction`, `runAction`, `listLiveActions`, `declaredActions`. |
| `src/auth/SessionProvider.tsx`, `src/auth/RequireRole.tsx` + `.css` | Session, dev mode, view-as, `?as=` contract, permission guard (mechanics; constants come from `tenant/auth`). |
| `src/i18n/I18nProvider.tsx`, `src/i18n/types.ts`, `src/i18n/core.ts`, `src/i18n/format.ts` | i18n runtime, `StringTable`, core strings, formatters (locale values from tenant config). |
| `src/design/ThemeProvider.tsx`, `src/design/tokens.ts` (schema after tp-06), `src/design/library.ts`, `src/design/meta.ts`, `src/design/{clipboard,env,cx,useFocusTrap}.ts`, `apps/hub/scripts/gen-tokens.mjs`, `src/styles/{global,textures,fonts}.css` | Theme runtime, token schema and generator, library-as-data, utilities. (`textures.css` carries 1 brand hex; moves to values in tp-06.) |
| `src/components/**` (50 components, 208 files) | The component library. Brand-specific atoms (`BrandMark`, `Shimmer`) read paths and colours from `tenant/brand`. |
| `src/data/provider.ts`, `src/data/MockProvider.ts`, `src/data/DataContext.tsx`, `src/data/schema/**`, `src/data/archiveFiles.ts`, `src/data/archiveRows.ts` | `DataProvider` seam, mock provider, hooks, entity schema, lazy archive loaders. tp-04 adds `tenant_id` / `version` here. |
| `src/presence/PresenceProvider.tsx` | Presence over the derived channel name. |
| `src/dev/DevTools.tsx`, `components/.../Placeholder` | Dev-mode chrome, "not wired yet" placeholders. |
| `src/work/**` | Shared task model and hooks. |
| `src/plan/**` | `plan.json` reader for D-05. |
| `src/modules/{tools,qa,dev,docs,design}` | Builder / QA / docs pages: generic over any tenant's specs, actions, tokens, docs (`platformCandidate: true` in `hubModules[]`). |
| `scripts/thumbnails.mjs`, `scripts/screenshots.mjs`, `scripts/copy-static.mjs` | Deploy-time thumbnails, QA captures, static copy. tp-07 makes the first two read tenant data instead of hand-kept lists. |
| `scripts/tenant-validate.mjs` (tp-03), `.github/workflows/ci.yml` (tp-03) | The manifest validator and build gate. |
| Docs conventions (numbering, templates, `surfaces.md` shape, knowledge-entry header, `_pending` merge) | Process the host adopts per tenant (HR-09). |

## The tp-05 move plan

1. `git mv` only (history preserved): `src/auth/{roles,permissions,demoUsers}.ts` -> `src/tenant/auth/`; `src/app/navGroups.ts` -> `src/tenant/navGroups.ts`; `src/brand/paths.ts` -> `src/tenant/brand/paths.ts`; `src/domain/` -> `src/tenant/domain/`; `src/data/seed/` -> `src/tenant/seed/`.
2. Leave **re-export shims** at every old path for one pass (`export * from '../tenant/auth/roles'`) so module imports (`../../auth`, `../../domain`, `../../data`) keep compiling; the module contract forbids modules from touching shared files, so shims avoid a cross-module edit storm. Remove the shims in tp-11 after the QA pass, or keep them if the churn is not worth it (decide then).
3. Extract hub card lists from `HubPage.tsx` into `src/tenant/hubCards.ts` (data + types); `HubPage.tsx` imports them.
4. `tsc --noEmit` green, `npm run build` green, `tenant:validate` green (paths in `tenant.json` updated in the same commit), screenshots of HUB-01 / D-05 / D-09 unchanged (tp-11).
5. Update `apps/hub/src/modules/README.md` ("Never" list: `src/tenant/*` joins the shared files nobody edits from a module) and `docs/README.md` in the same turn.

## What is deferred, and the trigger to do it

| Deferred | Why not now | Trigger |
| --- | --- | --- |
| `packages/platform` npm workspace (tp-13) | ~200 files and every import path change for zero consumers; the by-directory split gives the same map. | The host repo exists and wants to import the platform from two tenants. |
| Deriving `SURFACES` / `CODE_RE` / `ROLES` from `tenant.json` at build time | Type unions need codegen or `as const` imports; the validator's equality check gives the same guarantee today. | A second tenant with a different surface set (between-gigs). |
| Replacing `@docs` compile-time imports with fetched docs | Changes the docs viewer, plan reader and five seed modules; a host may prefer per-tenant mounts anyway (HR-05). | The host decides between mounts and fetch. |
| Real provider with `tenant_id` filtering | Supabase credentials are blocked; the column lands in tp-04 so seeds and the mock already carry it. | Credentials. |
| `window.__aluzina` renamed to a host global | Screenshots script and D-03 / D-09 read it; derived name keeps the value for aluzina (D-090). | The host defines its own global. |

## Change log

- 2026-09-28 (changelog 0025): first version, lists taken from the inventory's section 9. Fable 5.1.
