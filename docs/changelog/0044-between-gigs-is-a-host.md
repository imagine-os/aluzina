version: 0.24.3 (from 0.24.2: docs only; no route, action, entity, seed, string or `SEED_VERSION` change)
date: 2026-09-29
prompt: none (coordinator correction after surveying imagine-os/between-gigs @ b191350; context: prompt 0030 named Between Gigs as one of HOY's three homes)
intent: docs(tenant): Between Gigs is a host, not a tenant, corrected recipe and consumer guide. `docs/tenant/between-gigs.md` and `hub-map-consumer.md` described Between Gigs as a HoyOS-like static Vite / HashRouter repo to be packaged as an aluzina tenant with numbered docs and a `/t/between-gigs/` mount. The repository, once read, is Justin's own Next.js 16 / Cloudflare Workers multi-company OS.
decision: rewrite `between-gigs.md` (History note that the 2026-09-28 recipe was superseded on 2026-09-29; what Between Gigs actually is: stack, hosting, owner-gated access, company model, HOY as company `hoy-human-club` under `sergio-campus`, `aluzina` as a company row; the relationship: a host that consumes the hub map like aluzina, not a tenant), keep the packaging steps as a clearly labelled generic recipe for a future static tenant with `<tenant-id>` in place of the between-gigs names (D-095 references intact); add section 5 "Between Gigs, the real host" to `hub-map-consumer.md` (client-side fetch with CORS `*`, bundled snapshot, iframe `sandbox="allow-scripts allow-same-origin"`, dark so `-dark` thumbs, no i18n so `lang` is page-local, owner-gated page, `sampleRoute ?? route`, `/builder/companies/hoy-human-club/hub`, records in its own release process); correct the same wording in `docs/design/client-hub-desk.md`, `docs/pages/W-05.md`, `docs/pages/D-16.md`, `docs/tenant/README.md`, `docs/tenant/platform-vs-tenant.md`, `docs/build-plan.md`, ch-03 in kanban and plan.json; remove the between-gigs placeholder from `docs/tenant/tenants.example.json`; D-116.
rejected: packaging Between Gigs under `/t/between-gigs/` (it has no static bundle, server-side auth and its own release ledger; adapting it would rewrite a live product for a mount it does not need); deleting the recipe (it still applies to a real static tenant); leaving the placeholder tenant entry (promises a mount that will not exist); editing numbered history (changelogs 0025 / 0029 / 0040 / 0042, prompt 0023 / 0030, QA 0007 / 0010 stay as written; this entry and D-116 supersede their Between Gigs wording).
files: docs/tenant/{between-gigs.md,hub-map-consumer.md,README.md,platform-vs-tenant.md,tenants.example.json}, docs/design/client-hub-desk.md, docs/pages/{W-05.md,D-16.md}, docs/{build-plan.md,decisions.md,kanban.md,README.md}, docs/plan/plan.json, docs/changelog/0044-between-gigs-is-a-host.md, tenant.json, package.json, apps/hub/package.json
codes: W-05, D-16 (wording only)
model: Sonnet 5 (mechanical), Fable 5.1 (direction)

# 0044 - docs(tenant): Between Gigs is a host, not a tenant

## What changed

1. **`docs/tenant/between-gigs.md`** now opens with a History note, then what Between Gigs is (surveyed at `b191350`): Next.js 16 app router compiled by vinext on Cloudflare Workers, pnpm, Tailwind 4 + shadcn, D1 / drizzle, Supabase auth, https://between-gigs.com through ChatGPT Sites, owner-gated `/builder/*`, about 50 companies as rows (`hoy-human-club` under `sergio-campus`; `aluzina` is itself a company row), release-numbered records (`lib/releases.ts`, `docs/development-memory.json`, `lib/version-catalog.ts`), no numbered prompts or changelog, no i18n, dark default. The relationship is stated once: a host of the hub map like aluzina, not a tenant. The old packaging steps stay as "Generic recipe: packaging a future static tenant", names generalised.
2. **`docs/tenant/hub-map-consumer.md`** gains section 5, "Between Gigs, the real host" (a table of how each consumer rule lands there); the checklist is section 6.
3. **Wording fixed** in the desk design doc, W-05 and D-16 page docs, tenant README, platform-vs-tenant, build-plan step 15 / 18, kanban ch-03 and plan.json (ch-03, tp-12 owner). `tenants.example.json` keeps only the aluzina entry.
4. **Kept as written** (numbered, append-only): changelogs 0025 / 0029 / 0040 / 0042, prompts 0023 / 0030, QA 0007 / 0010, D-095 and D-108..D-115. Their Between Gigs wording reads through D-116.
5. **Code strings**: `apps/hub/src/modules/clienthub/strings.ts` and `modules/hub/strings.ts` only name Between Gigs as a lens ("By experience, as one gig", "seen by its three hosts"); none claims it is a static tenant. No code touched.

## Checks

`npm run build` green (see the commit).
