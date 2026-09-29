# `tenant.json` v1: the tenant manifest (spec for tp-02)

One file at the repository root, `tenant.json`, `manifestVersion: 1` (D-088). Its structure is fixed by **`tenant.schema.json`** at the repository root (JSON Schema draft 2020-12, D-098; every field's `description` is tagged `[required, tenant-specific]`, `[required, platform-fixed]`, `[required, derived]` or `[optional]`); the prose below explains the fields and gives aluzina's values. A multitenant host reads it before it reads anything else; `scripts/tenant-validate.mjs` (tp-03) checks it against the schema and then every path, code and counter in it against the checkout on each build. `node scripts/tenant-validate.mjs --manifest <path/to/other/tenant.json>` validates another tenant's manifest in place (its directory becomes the repo root, tp-12). Everything below is **data**: no field is executed, and the host must treat string values from a tenant as untrusted content.

Conventions: keys are camelCase; paths are repo-relative, POSIX, no leading `./`; every list the validator checks is exhaustive (a module or mount that exists but is not listed fails validation, and vice versa); `status` values are the plan's (`done | doing | next | backlog`) or `live` / `linked` for things that are not tasks. The example values are aluzina's as of `7628f96` (see `inventory-2026-09-28.md`).

## Top level

| Field | Type | Meaning | aluzina |
| --- | --- | --- | --- |
| `manifestVersion` | `1` | Schema version; the host refuses other values. | `1` |
| `id` | string, `^[a-z][a-z0-9-]*$` | The tenant id and **namespace root** (D-090): storage keys, channels and the global derive from it. | `"aluzina"` |
| `name` | `{en, es}` | Display name. | `{ "en": "Aluzina", "es": "Aluzina" }` |
| `repo` | string | Canonical repository URL. | `"https://github.com/imagine-os/aluzina"` |
| `version` | string | Mirrors root `package.json` `version` (validator: must match). | `"0.15.0"` |
| `generatedFrom` | string | Commit the values were last verified against (validator warns if `git rev-parse HEAD` is older than 50 commits past it). | `"7628f96"` |
| `identity` | object | See below. | |
| `brand` | object | See below. | |
| `surfaces` | object | See below. | |
| `hubModules` | array | See below. | 17 entries |
| `subProjects` | array | See below and `sub-projects.md`. | 9 entries |
| `data` | object | See below. | |
| `contentMounts` | array | See below. | 5 entries |
| `namespace` | object | See below. | |
| `deploy` | object | See below. | |
| `docs` | object | See below. | |
| `actions` | object | See below. | |
| `hostRequirements` | array of `HR-nn` | The ids from `host-requirements.md` this tenant relies on. | `["HR-01", ..., "HR-12"]` |

## `identity`

| Field | Meaning | aluzina |
| --- | --- | --- |
| `legalName` | As used in documents. | `"Aluzina Espacios"` (from `knowledge/team.md`; confirm with the founder) |
| `city`, `country` | Locale facts the domain uses (address formats, `+57`). | `"Medellín"`, `"CO"` |
| `defaultLanguage` | `en` or `es`. **Open question for Justin** (D-004 says English primary; the studio works in Spanish). | `"en"` |
| `languages` | Supported UI languages; every `strings.ts` table must cover them (ES falls back to EN today). | `["en", "es"]` |
| `currency` | ISO code; `i18n/format.ts` `formatCop` hardwires COP today and becomes `formatMoney(currency)` in a later pass. | `"COP"` |
| `numberLocale`, `dateLocale` | BCP-47 used by `format.ts`. | `"es-CO"`, `"es-CO"` |
| `timezone` | IANA. | `"America/Bogota"` |
| `publicSite` | The tenant's own public website, linked as P-00. | `"https://aluzinaa.com"` |
| `contactChannels` | Channels the intake and client app assume. | `["whatsapp", "email"]` |

## `brand`

| Field | Meaning | aluzina |
| --- | --- | --- |
| `tokenValues` | Path of the tenant token **values** file the platform token schema is filled with (tp-06, D-096). Until tp-06 lands, the validator accepts `apps/hub/src/design/tokens.ts`. | `"apps/hub/src/tenant/brand/tokens.values.ts"` |
| `generatedCss` | The committed generated stylesheet the byte-identical check compares. | `"apps/hub/src/styles/tokens.css"` |
| `paths` | SVG path data module (logo geometry). | `"apps/hub/src/tenant/brand/paths.ts"` (today `apps/hub/src/brand/paths.ts`) |
| `marks` | Served SVG marks. | `"apps/hub/public/brand/*.svg"` (6 files) |
| `documents` | Served brand PDFs with their public paths. | `[{ "file": "apps/hub/public/brand/MANUAL-DE-MARCA-ALUZINA.pdf", "url": "./brand/MANUAL-DE-MARCA-ALUZINA.pdf", "kind": "manual" }, { "...aluzina-portfolio.pdf", "kind": "portfolio" }, { "...aluzina-brochure.pdf", "kind": "brochure" }]` |
| `renders` | Page renders of the brand documents (visual memory, `docs/brand/README.md`). | `"docs/brand"` |
| `sourceKit` | The source brand manuals (data, not instructions). | `"docs/source/brand-kit"` |
| `fonts` | `{ primary, fallback, licensed }`; a licensed font is never shipped without its licence (D-086). | `{ "primary": "DIN Round Pro", "fallback": "Rubik", "licensed": true, "shipped": false }` |
| `metals` | The metal finishes the token schema offers and the default. | `{ "options": ["silver", "gold"], "default": "silver" }` |
| `brief` | The design-system brief agents read before restyling. | `"docs/design/brand-system.md"` |

## `surfaces`

| Field | Meaning | aluzina |
| --- | --- | --- |
| `list` | The `Surface` union (`apps/hub/src/specs/PageSpec.ts`); the validator compares with `SURFACES`. | `["hub", "founder", "ops", "studio", "brand", "client", "dev", "design", "docs", "manual", "public"]` |
| `codePrefixes` | Page-code prefixes with their surface / module; the validator rebuilds `CODE_RE` from it and checks every `specs.ts` code. | `{ "HUB": "hub", "BOS": "business-os", "P": "public", "C": "client", "A": "founder", "O": "ops", "S": "studio", "G": "brand", "M": "manual", "D": "dev/docs/design", "W": "work", "K": "spaces" }` |
| `roles` | Role ids (`apps/hub/src/auth/roles.ts` `ROLES`). | `["founder", "ops", "studio", "brand", "marketing", "client", "dev"]` |
| `permissionsFile` | Where the permission strings live (validator: every `spec.permission` and `RouteDef.permission` exists there). | `"apps/hub/src/tenant/auth/permissions.ts"` (today `apps/hub/src/auth/permissions.ts`) |
| `demoUsersFile` | Demo identities the role switcher and `screenshots.mjs` use (tp-07 reads this instead of `USER_BY_ROLE`). | `"apps/hub/src/tenant/auth/demoUsers.ts"` |
| `navGroupsFile` | Nav groups per surface. | `"apps/hub/src/tenant/navGroups.ts"` |
| `hubCardsFile` | The hub card lists (`PRODUCT_SURFACES`, `TOOL_SURFACES`, `PORTALS`, `PROTOTYPE_PAGES` today inside `modules/hub/HubPage.tsx`; tp-05 moves them to data, tp-07 reads them for thumbnails). | `"apps/hub/src/tenant/hubCards.ts"` |
| `roleSwitchParam` | The URL contract for view-as. | `"as"` |
| `nextFreeCodes` | Mirrors `docs/README.md` "Next free" (validator: none of these exists in any `specs.ts`). | `["A-10", "O-14", "S-14", "G-10", "P-07", "C-07", "M-09", "D-16", "K-07", "W-04"]` |

## `hubModules[]`

One entry per folder in `apps/hub/src/modules/` (validator: set equality). Fields: `name`, `path`, `codes[]`, `surfaces[]`, `guard` (permission of the dashboard route or `null`), `shell` (`desktop | phone | bare`), `owner` (model that builds it). aluzina, from `inventory-2026-09-28.md` section 2.1:

```json
[
  { "name": "hub",     "path": "apps/hub/src/modules/hub",     "codes": ["HUB-01"], "surfaces": ["hub"], "guard": null, "shell": "bare", "owner": "Fable 5.1" },
  { "name": "founder", "path": "apps/hub/src/modules/founder", "codes": ["A-01","A-02","A-03","A-04","A-05","A-06","A-07","A-08","A-09"], "surfaces": ["founder"], "guard": "projects.approve", "shell": "desktop", "owner": "Opus 5" },
  { "name": "ops",     "path": "apps/hub/src/modules/ops",     "codes": ["O-01","O-02","O-03","O-04","O-05","O-06","O-07","O-08","O-09","O-10","O-11","O-12","O-13"], "surfaces": ["ops"], "guard": "schedule.manage", "shell": "desktop", "owner": "Opus 5" },
  { "name": "studio",  "path": "apps/hub/src/modules/studio",  "codes": ["S-01","S-02","S-03","S-04","S-05","S-06","S-07","S-08","S-09","S-10","S-11"], "surfaces": ["studio"], "guard": "design.develop", "shell": "desktop", "owner": "Opus 5" },
  { "name": "brand",   "path": "apps/hub/src/modules/brand",   "codes": ["G-01","G-02","G-03","G-04","G-05","G-06","G-07","G-08","G-09"], "surfaces": ["brand"], "guard": "brand.manage", "shell": "desktop", "owner": "Opus 5" },
  { "name": "archive", "path": "apps/hub/src/modules/archive", "codes": ["S-12","S-13"], "surfaces": ["studio","founder","brand"], "guard": "projects.read", "shell": "desktop", "owner": "Opus 5" },
  { "name": "work",    "path": "apps/hub/src/modules/work",    "codes": ["W-01","W-02","W-03"], "surfaces": ["founder","ops","studio","brand"], "guard": null, "shell": "desktop", "owner": "Opus 5" },
  { "name": "spaces",  "path": "apps/hub/src/modules/spaces",  "codes": ["K-01","K-02","K-03","K-04","K-05","K-06"], "surfaces": ["founder","ops","studio","brand","dev"], "guard": "spaces.read", "shell": "desktop", "owner": "Opus 5" },
  { "name": "client",  "path": "apps/hub/src/modules/client",  "codes": ["C-01","C-02","C-03","C-04","C-05","C-06"], "surfaces": ["client"], "guard": "own.projects.read", "shell": "phone", "owner": "Opus 5" },
  { "name": "public",  "path": "apps/hub/src/modules/public",  "codes": ["P-01","P-02","P-03","P-04","P-05"], "surfaces": ["public"], "guard": null, "shell": "bare", "owner": "Opus 5" },
  { "name": "sets",    "path": "apps/hub/src/modules/sets",    "codes": ["P-06"], "surfaces": ["public"], "guard": null, "shell": "bare", "owner": "Opus 5" },
  { "name": "manual",  "path": "apps/hub/src/modules/manual",  "codes": ["M-01","M-02","M-03","M-04","M-05","M-06","M-07","M-08"], "surfaces": ["manual"], "guard": "manual.read", "shell": "desktop", "owner": "Opus 5" },
  { "name": "docs",    "path": "apps/hub/src/modules/docs",    "codes": ["D-06","D-15"], "surfaces": ["docs"], "guard": "docs.read", "shell": "desktop", "owner": "Fable 5.1", "platformCandidate": true },
  { "name": "design",  "path": "apps/hub/src/modules/design",  "codes": ["D-10","D-12","D-13"], "surfaces": ["design"], "guard": "design.read", "shell": "desktop", "owner": "Opus 5", "platformCandidate": true },
  { "name": "dev",     "path": "apps/hub/src/modules/dev",     "codes": ["D-02","D-03","D-04"], "surfaces": ["dev"], "guard": "dev.tools", "shell": "desktop", "owner": "Fable 5.1", "platformCandidate": true },
  { "name": "tools",   "path": "apps/hub/src/modules/tools",   "codes": ["D-05","D-07","D-08"], "surfaces": ["dev"], "guard": "dev.tools", "shell": "desktop", "owner": "Fable 5.1", "platformCandidate": true },
  { "name": "qa",      "path": "apps/hub/src/modules/qa",      "codes": ["D-09","D-11","D-14"], "surfaces": ["dev"], "guard": "dev.tools", "shell": "desktop", "owner": "Fable 5.1", "platformCandidate": true }
]
```

`platformCandidate: true` marks the builder / QA / docs modules the host may later lift into `packages/platform` (D-089). The validator checks `codes[]` against the `defineSpec` calls in `<path>/specs.ts` (set equality per module) and that the union of all `codes[]` plus `BOS-01..06` and `P-00` equals the taken codes in `docs/README.md`.

## `subProjects[]`

One entry per deliverable; full prose in `sub-projects.md`. Fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | slug | Stable id. |
| `kind` | `app \| static \| external \| data \| pipeline \| docs \| platform-candidate` | How the host mounts it. |
| `paths[]` | repo paths | Everything that belongs to it (validator: each exists; `external` may have none). |
| `entry` | string or null | The file or URL a host opens first. |
| `build` | string or null | The npm script(s) that produce or refresh it. |
| `serve` | string or null | Where it appears in `dist/` or online. |
| `codes[]` | page codes | Codes it owns (may be empty). |
| `status` | plan status or `live \| linked` | From `kanban.md` at the time of writing. |
| `dependsOn[]` | sub-project ids | Build / data dependencies. |
| `hostNeeds[]` | `HR-nn` | What the host must provide to bring it to life. |
| `owner` | model | Who builds it. |
| `readme` | path | Its README (tp-08 adds the missing ones). |

aluzina:

```json
[
  { "id": "hub", "kind": "app", "paths": ["apps/hub"], "entry": "apps/hub/index.html", "build": "npm run build", "serve": "dist/", "codes": ["HUB-01"], "status": "live", "dependsOn": ["docs-and-plan", "archive", "brand-kit", "design-system"], "hostNeeds": ["HR-01","HR-02","HR-03","HR-05","HR-06","HR-07","HR-08","HR-11"], "owner": "Fable 5.1 (shared), Opus 5 (modules)", "readme": "apps/hub/src/modules/README.md" },
  { "id": "business-os", "kind": "static", "paths": ["apps/business-os"], "entry": "apps/business-os/index.html", "build": "npm run copy:static", "serve": "dist/business-os/", "codes": ["BOS-01","BOS-02","BOS-03","BOS-04","BOS-05","BOS-06"], "status": "doing", "dependsOn": [], "hostNeeds": ["HR-04","HR-07"], "owner": "Fable 5.1 (audit), Sonnet 5", "readme": "apps/business-os/README.md" },
  { "id": "public-site", "kind": "external", "paths": ["docs/source/aluzinaa-archive", "docs/knowledge/public-sites.md"], "entry": "https://aluzinaa.com", "build": null, "serve": "https://aluzinaa.com", "codes": ["P-00"], "status": "linked", "dependsOn": [], "hostNeeds": ["HR-07"], "owner": "Justin (Lovable), Opus 5 (R7 later)", "readme": "docs/source/aluzinaa-archive/README.md" },
  { "id": "archive", "kind": "pipeline", "paths": ["scripts/archive", "docs/archive", "apps/hub/public/archive"], "entry": "scripts/archive/build-index.mjs", "build": "npm run archive:crawl && npm run archive:index && npm run archive:previews && npm run archive:collection", "serve": "dist/archive/", "codes": ["S-12","S-13","G-09","A-09","P-06"], "status": "done", "dependsOn": [], "hostNeeds": ["HR-04","HR-02"], "owner": "Fable 5.1 (index, seed), Sonnet 5 (crawls, renders)", "readme": "docs/archive/README.md" },
  { "id": "brand-kit", "kind": "data", "paths": ["docs/source/brand-kit", "docs/source/brand", "docs/brand", "apps/hub/public/brand", "apps/hub/src/brand"], "entry": "docs/brand/README.md", "build": "python3 docs/brand/tools/render-pdf-pages.py", "serve": "dist/brand/", "codes": ["G-08","D-12"], "status": "done", "dependsOn": [], "hostNeeds": ["HR-04","HR-06"], "owner": "Fable 5.1", "readme": "docs/brand/README.md" },
  { "id": "knowledge-base", "kind": "docs", "paths": ["docs/knowledge"], "entry": "docs/knowledge/README.md", "build": null, "serve": "in-app D-06 / D-15", "codes": [], "status": "done", "dependsOn": [], "hostNeeds": ["HR-05"], "owner": "Fable 5.1", "readme": "docs/knowledge/README.md" },
  { "id": "asana-import", "kind": "pipeline", "paths": ["scripts/import-asana.mjs", "docs/source/asana", "apps/hub/src/data/seed/asana"], "entry": "scripts/import-asana.mjs", "build": "npm run import:asana", "serve": null, "codes": ["K-06","W-03"], "status": "done", "dependsOn": ["hub"], "hostNeeds": ["HR-02"], "owner": "Fable 5.1 (seam), Sonnet 5 (mapper)", "readme": "docs/source/asana/2026-09-21/README.md" },
  { "id": "design-system", "kind": "platform-candidate", "paths": ["apps/hub/src/design", "apps/hub/src/components", "apps/hub/scripts/gen-tokens.mjs", "apps/hub/src/styles", "docs/design"], "entry": "docs/design/brand-system.md", "build": "npm run tokens", "serve": "in-app D-02 / D-10 / D-12 / D-13 / D-14", "codes": ["D-02","D-10","D-12","D-13","D-14"], "status": "done", "dependsOn": ["brand-kit"], "hostNeeds": ["HR-06"], "owner": "Fable 5.1", "readme": "docs/design/brand-system.md" },
  { "id": "docs-and-plan", "kind": "docs", "paths": ["docs"], "entry": "docs/README.md", "build": null, "serve": "in-app D-05 / D-06 / D-15", "codes": ["D-05","D-06","D-15"], "status": "live", "dependsOn": [], "hostNeeds": ["HR-05","HR-09"], "owner": "Fable 5.1", "readme": "docs/README.md" }
]
```

## `data`

| Field | Meaning | aluzina |
| --- | --- | --- |
| `providerInterface` | The seam a host provider implements (unchanged by tp-04). | `"apps/hub/src/data/provider.ts"` |
| `providers` | Implementations present. | `[{ "name": "mock", "file": "apps/hub/src/data/MockProvider.ts", "storage": "localStorage" }]` |
| `schemaDir` | Entity schema files. | `"apps/hub/src/data/schema"` |
| `entities` | The 37 `EntityMap` keys (validator: equal to the export). | `["projects", "sections", "tasks", ... "assets"]` |
| `baseRow` | Columns every row carries. After tp-04: `tenant_id` (stamped by the provider from `TENANT.id`) and `version` (incremented on update). | `["id", "created_at", "updated_at", "updated_by", "tenant_id", "version"]` |
| `seedVersion` | Mirrors `SEED_VERSION` in `apps/hub/src/data/seed/index.ts` (validator: equal). | `12` today, `13` after tp-04 |
| `seedDir`, `seedModules` | Seed modules globbed by `seed/index.ts`. | `"apps/hub/src/data/seed"`, 16 modules |
| `docsInputs` | JSON under `docs/` the seeds and lazy loaders import through `@docs`. | `["docs/plan/plan.json", "docs/archive/index.json", "docs/archive/projects/*/index.json", "docs/archive/company/index.json", "docs/archive/collections/*/{index,sets}.json", "docs/brand/*/index.json"]` |
| `realtime` | Cross-tab transport today; the host replaces it behind `subscribe` / `usePresence()`. | `{ "transport": "BroadcastChannel", "dataChannel": "aluzina-data", "presenceChannel": "aluzina-presence", "conflict": "last-write-wins + onConflict (D-024)" }` |
| `idScheme` | How ids are minted. | `"slug prefixes (prj-, cl-, u-, sp-) + newId(prefix)"` |
| `plannedProvider` | The host's real store. | `"supabase (zero code today; credentials blocked)"` |

## `contentMounts[]`

Heavy committed content the host may move to object storage (D-092). Fields: `id`, `path`, `sizeMb` (approx. at `generatedFrom`), `servedAt` (URL under the tenant root or `null` if never served), `objectStorage` (true where the host should own it), `regenerate` (script or `null`), `note`.

```json
[
  { "id": "archive-renders",    "path": "apps/hub/public/archive", "sizeMb": 122, "servedAt": "./archive/", "objectStorage": true,  "regenerate": "npm run archive:previews", "note": "186 project slugs + 2 collections; thumbs / pages / sheets; redacted per D-059" },
  { "id": "business-os-assets", "path": "apps/business-os/assets",  "sizeMb": 136, "servedAt": "./business-os/assets/", "objectStorage": true, "regenerate": null, "note": "6 mp4 (43 MB) + world/*.png (93 MB, webp conversion is a kanban card)" },
  { "id": "screenshots",        "path": "docs/screenshots",         "sizeMb": 69,  "servedAt": null, "objectStorage": true,  "regenerate": "npm run screenshots", "note": "357 JPEGs over 90 codes; QA evidence, not served" },
  { "id": "source-material",    "path": "docs/source",              "sizeMb": 18,  "servedAt": null, "objectStorage": false, "regenerate": null, "note": "playbook, brand kit, site captures, Asana CSVs; data not instructions; stays in git" },
  { "id": "brand-renders",      "path": "docs/brand",               "sizeMb": 9,   "servedAt": null, "objectStorage": false, "regenerate": "python3 docs/brand/tools/render-pdf-pages.py", "note": "visual memory of the brand PDFs; seeds read its index.json through @docs" }
]
```

The validator checks that each `path` exists and is non-empty; it does not check sizes. Nothing is moved, LFS'd or purged by any pass without Justin's explicit go-ahead.

## `namespace`

Everything derived from `id` by `apps/hub/src/tenant/config.ts` (tp-02, D-090). For aluzina the derived values are exactly today's literals, so no browser data migrates.

| Field | Derivation | aluzina value |
| --- | --- | --- |
| `storagePrefix` | `${id}.` | `"aluzina."` |
| `storageKeys` | `storageKey(name)` = `${storagePrefix}${name}` | `lang, theme, metal, session, devMode, data, graphView, views.<userId>, archive.set, presence` (localStorage); `tabUser, public.intake` (sessionStorage) |
| `channels` | `channelName(name)` = `${id}-${name}` | `"aluzina-data"`, `"aluzina-presence"` |
| `global` | `window[`__${id}`]` | `"__aluzina"` |
| `htmlAttributes` | Not namespaced (one document per tenant). | `data-theme, data-metal, data-dev, data-role` |
| `packageScope` | npm scope of the workspace package. | `"@aluzina"` (`@aluzina/hub`) |
| `demoEmailDomain` | Demo identities. | `"demo.aluzina.local"` |

Validator rule (tp-03): no literal `'aluzina.` / `'aluzina-data'` / `'aluzina-presence'` / `__aluzina` outside `apps/hub/src/tenant/` and `tenant.json`; allowed exceptions are listed in `tenant.json` `namespace.literalAllowlist` (today: the `aluzina-brand-kit` Slack channel name in `modules/spaces/ImportPage.tsx` and two component examples, which are data, not keys).

## `deploy`

| Field | aluzina |
| --- | --- |
| `target` | `"github-pages"` |
| `url` | `"https://imagine-os.github.io/aluzina/"` |
| `workflow` | `".github/workflows/pages.yml"` |
| `ciWorkflow` | `".github/workflows/ci.yml"` (tp-03) |
| `base` | `"./"` (relative; sub-path agnostic) |
| `router` | `"hash"` |
| `outDir` | `"dist"` |
| `staticCopies` | `[{ "from": "apps/business-os", "to": "dist/business-os", "script": "scripts/copy-static.mjs" }]` |
| `deployTimeArtifacts` | `[{ "path": "dist/thumbs/<code>.jpg + manifest.json", "script": "npm run thumbs", "needs": "playwright chromium" }]` |
| `nodeVersion` | `"22"` |
| `envVars` | `[]` for the app; scripts: `PW_EXECUTABLE, PLAYWRIGHT_CHROMIUM_EXECUTABLE, HTTPS_PROXY, FFMPEG, SOFFICE` |
| `buildDefines` | `["__APP_VERSION__", "__BUILD_ID__"]` |
| `docsAlias` | `{ "alias": "@docs", "path": "docs" }` (the build needs the tenant's docs folder, HR-05) |

## `docs`

| Field | Meaning | aluzina |
| --- | --- | --- |
| `root` | Start-here map. | `"docs/README.md"` |
| `counters` | Per-folder counters the validator compares with the highest numbered file (append-only; a manifest value lower than the files fails). | `{ "prompts": 23, "changelog": 25, "decisions": 96, "qa": 6 }` |
| `pendingDir` | Parallel-worker drafts merged by the integrator. | `"docs/changelog/_pending"` |
| `plan` | Machine-readable plan the D-05 viewer renders. | `"docs/plan/plan.json"` |
| `kanban`, `buildPlan`, `decisions` | The three human views that must agree with `plan`. | `"docs/kanban.md"`, `"docs/build-plan.md"`, `"docs/decisions.md"` |
| `pagesDir`, `pageTemplate` | One doc per page code. | `"docs/pages"`, `"docs/pages/_TEMPLATE.md"` |
| `screenshotsDir` | Per-code captures + `routes.json`. | `"docs/screenshots"` |
| `knowledge` | Domain KB with `status` per entry (D-012, D-087). | `"docs/knowledge"` |
| `surfaces` | Machine-drivable surfaces reference. | `"docs/reference/surfaces.md"` |
| `tenantDocs` | This folder. | `"docs/tenant"` |
| `conventions` | Short list the host displays to agents. | `["numbered files append-only", "docs same turn as code", "model named in every changelog", "commit to main, no PRs", "no Slack posts from agents"]` |

## `actions`

| Field | aluzina |
| --- | --- |
| `bus` | `"apps/hub/src/actions/bus.ts"` |
| `global` | `"window.__aluzina.actions"` (derived, see `namespace.global`) |
| `idPattern` | `"^[a-z][a-zA-Z0-9]*\\.[a-z][a-zA-Z0-9]*$"` (`<module>.<verb>`) |
| `declared` | `430` declarations, `409` distinct ids (counted at `7628f96`; the validator recounts) |
| `browser` | `"D-09 /#/dev/actions"` |
| `exportFormat` | `"webmcp-json (D-09 export)"` |
| `mcpServer` | `null` (planned, `surfaces.md` 2.x) |

## Full example (abridged where a section is spelled out above)

```json
{
  "manifestVersion": 1,
  "id": "aluzina",
  "name": { "en": "Aluzina", "es": "Aluzina" },
  "repo": "https://github.com/imagine-os/aluzina",
  "version": "0.15.0",
  "generatedFrom": "7628f96",
  "identity": { "city": "Medellín", "country": "CO", "defaultLanguage": "en", "languages": ["en", "es"], "currency": "COP", "numberLocale": "es-CO", "dateLocale": "es-CO", "timezone": "America/Bogota", "publicSite": "https://aluzinaa.com", "contactChannels": ["whatsapp", "email"] },
  "brand": { "tokenValues": "apps/hub/src/tenant/brand/tokens.values.ts", "generatedCss": "apps/hub/src/styles/tokens.css", "paths": "apps/hub/src/tenant/brand/paths.ts", "marks": "apps/hub/public/brand/*.svg", "renders": "docs/brand", "sourceKit": "docs/source/brand-kit", "fonts": { "primary": "DIN Round Pro", "fallback": "Rubik", "licensed": true, "shipped": false }, "metals": { "options": ["silver", "gold"], "default": "silver" }, "brief": "docs/design/brand-system.md" },
  "surfaces": { "list": ["hub", "founder", "ops", "studio", "brand", "client", "dev", "design", "docs", "manual", "public"], "codePrefixes": { "HUB": "hub", "BOS": "business-os", "P": "public", "C": "client", "A": "founder", "O": "ops", "S": "studio", "G": "brand", "M": "manual", "D": "dev/docs/design", "W": "work", "K": "spaces" }, "roles": ["founder", "ops", "studio", "brand", "marketing", "client", "dev"], "roleSwitchParam": "as", "nextFreeCodes": ["A-10", "O-14", "S-14", "G-10", "P-07", "C-07", "M-09", "D-16", "K-07", "W-04"] },
  "hubModules": [ "...17 entries as above..." ],
  "subProjects": [ "...9 entries as above..." ],
  "data": { "providerInterface": "apps/hub/src/data/provider.ts", "seedVersion": 12, "baseRow": ["id", "created_at", "updated_at", "updated_by", "tenant_id", "version"], "realtime": { "transport": "BroadcastChannel", "dataChannel": "aluzina-data", "presenceChannel": "aluzina-presence" } },
  "contentMounts": [ "...5 entries as above..." ],
  "namespace": { "storagePrefix": "aluzina.", "channels": ["aluzina-data", "aluzina-presence"], "global": "__aluzina", "packageScope": "@aluzina", "literalAllowlist": ["apps/hub/src/modules/spaces/ImportPage.tsx", "apps/hub/src/components/organism/GraphViews/GraphViews.example.tsx", "apps/hub/src/components/organism/SpaceTree/SpaceTree.example.tsx"] },
  "deploy": { "target": "github-pages", "url": "https://imagine-os.github.io/aluzina/", "workflow": ".github/workflows/pages.yml", "ciWorkflow": ".github/workflows/ci.yml", "base": "./", "router": "hash", "outDir": "dist", "nodeVersion": "22", "docsAlias": { "alias": "@docs", "path": "docs" } },
  "docs": { "root": "docs/README.md", "counters": { "prompts": 23, "changelog": 25, "decisions": 96, "qa": 6 }, "plan": "docs/plan/plan.json", "kanban": "docs/kanban.md", "buildPlan": "docs/build-plan.md", "decisions": "docs/decisions.md", "tenantDocs": "docs/tenant" },
  "actions": { "bus": "apps/hub/src/actions/bus.ts", "global": "window.__aluzina.actions", "idPattern": "^[a-z][a-zA-Z0-9]*\\.[a-z][a-zA-Z0-9]*$", "browser": "D-09 /#/dev/actions", "mcpServer": null },
  "hostRequirements": ["HR-01", "HR-02", "HR-03", "HR-04", "HR-05", "HR-06", "HR-07", "HR-08", "HR-09", "HR-10", "HR-11", "HR-12"]
}
```

## What `tenant-validate.mjs` checks (contract for tp-03)

1. `manifestVersion === 1`; `version === package.json.version`.
2. `hubModules[].name` equals the folder set of `apps/hub/src/modules/` (minus `README.md`); each module's `codes[]` equals the codes in its `specs.ts` (`code: 'X-nn'` literals).
3. Every `subProjects[].paths[]` and `contentMounts[].path` exists and is non-empty (except `kind: external`).
4. `surfaces.list` equals `SURFACES` in `PageSpec.ts`; `surfaces.roles` equals `ROLES` in `roles.ts`; `surfaces.nextFreeCodes` appear in no `specs.ts`.
5. `data.seedVersion === SEED_VERSION`; `data.entities` equals the `EntityMap` keys.
6. `docs.counters.*` equal the highest numbered file in each folder (prompts, changelog, qa) and the last `D-nnn` row in `decisions.md`; if `_pending/` exists it is reported, not failed.
7. No literal `'aluzina.` / `'aluzina-data'` / `'aluzina-presence'` / `__aluzina` in `apps/hub/src/**` outside `src/tenant/` and the `literalAllowlist`.
8. `docs/plan/plan.json` parses, every `dependsOn` id exists, every `step` is in `build-plan.md` (`| **15** |` etc.).
9. Exit 1 with one line per failure; exit 0 with a one-line summary otherwise. Runs as `npm run tenant:validate`, wired into root `build` after the hub build and before `copy-static`, and so in `ci.yml`.

Implemented in `scripts/tenant-validate.mjs` (tp-03, changelog 0027). Beyond the nine points it checks that every single-path field (`brand.*`, `surfaces.*File`, `data.*Dir`, `namespace.config`, `deploy.*Workflow`, `docs.*`, `actions.bus`, `brand.documents[].file`, `data.providers[].file`, `subProjects[].readme` / non-URL `entry`) exists, `subProjects[].dependsOn` ids, `data.seedModules` against the seed folder, `routing.strategy` in `routing.supports`, and required top-level keys; `generatedFrom` more than 50 commits behind HEAD is a warning. Point 7 is enforced as "no namespace literal in an executable string position": comments, `*.md`, `strings.ts`, files under `namespace.tenantDir`, `namespace.literalAllowlist`, and `specs.ts` prose fields (`logic`, `label`, `intent`, `description`, `purpose`, `notes`, `layout`, `name`, or a `const *_LOGIC = [...]` array) are allowed; the global used as an identifier (`window.__<id>`) fails too. Generated manual codes: a `specs.ts` with a spec factory `export function xSpec(code ...)` also contributes the page codes used as object keys (`SERVICE_CODES_BY_PAGE = { 'M-03': ... }`). `actions.declared` / `actions.distinct`: since tp-12 (changelog 0029) the validator recounts them on every run from the `id: '<module>.<verb>'` literals in every `hubModules[].path/specs.ts` (430 total, 409 distinct on `main`) and fails on a mismatch; since changelog 0036 (D-106) it also counts the files listed in `actions.platformDeclarations` (optional; `apps/hub/src/desk/actions.ts`, the page desks' shared `desk.*` list the registry appends to routes). Also since tp-12: check (j), the structural walk against `tenant.schema.json` (subset: `type`, `required`, `enum`, `const`, `properties`, `items`, `additionalProperties`, `pattern`, local `$ref`; any other keyword in the schema is reported), run before the checks above; and the `--manifest <path>` flag.

## Change log

- 2026-09-28 (changelog 0025): first version of the spec. Fable 5.1.
- 2026-09-28 (changelog 0026): `tenant.json` landed (tp-02). Three values differ from the examples above because the manifest states the checkout as it is: the brand / auth / nav / hub-card paths are today's (`apps/hub/src/design/tokens.ts`, `apps/hub/src/auth/*`, `apps/hub/src/app/navGroups.ts`, `apps/hub/src/modules/hub/HubPage.tsx`; tp-05 moves them and updates the manifest in the same commit), `deploy.ciWorkflow` is `null` until tp-03, and `data.seedModules` has the 12 modules the glob finds (not 16). New top-level `routing` block (`strategy: path`, `pathPrefix: /t/aluzina/`, `supports: [path, subdomain]`, D-097) and `namespace.config` / `namespace.storageKeys` fields. The `manual` module gets M-03..M-07 from `serviceSpec(code)`, not `code:` literals; the validator (tp-03) must read them from `manual/index.ts` or accept the manifest's list. Fable 5.1.
- 2026-09-28 (changelog 0027): tp-05 / tp-06 moved the tenant files, so the manifest paths are now the spec's (`src/tenant/auth/*`, `src/tenant/navGroups.ts`, `src/tenant/hubCards.ts`, `src/tenant/brand/{paths,tokens.values}.ts`, `src/tenant/seed`); new fields `brand.tokenSchema`, `surfaces.rolesFile`, `data.domainDir`, `namespace.tenantDir`; `deploy.ciWorkflow` is `.github/workflows/ci.yml`; `docs.counters` are checked for equality. tp-03 validator implemented (see the contract above). Opus 5.
- 2026-09-28 (changelog 0029): `tenant.schema.json` is the structural contract (D-098); the validator checks against it, recounts `actions.declared` / `distinct`, and takes `--manifest <path>`. `subProjects[].stack` declared (optional) for a `kind: app` whose stack is not the hub. Fable 5.1.
- 2026-09-29 (changelog 0036): `actions.platformDeclarations` (optional, schema + validator): platform files whose `id:` declarations are counted with the modules' (the desk system's `DESK_ACTIONS`); storage keys `desk.wheel`, `desk.height.<code>`. Opus 5.5.
