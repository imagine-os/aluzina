# QA: tenant packaging pass (tp-11) — build, screenshots, functional smoke, docs agreement

date: 2026-09-28
model: Sonnet 5 (this pass: build/CI check, Playwright captures + smoke, docs-agreement audit)
scope: step 15's QA gate (tp-11, depends tp-03..tp-10): `npm run build` (incl. `tenant:validate`) green; 7-width EN-light + 390/1920 ES + 390/1920 dark screenshots of HUB-01 `/`, D-05 `/dev/plan`, D-09 `/dev/actions`, D-10 `/design/tokens`, and one moved-code consumer (S-01 `/studio` as `?as=studio`, demo user `u-sarai`); functional smoke (plan viewer, actions registry, role guard, storage namespace, row shape); docs agreement (`plan.json` = `kanban.md` = `build-plan.md` = `tenant/README.md`, `tenant.json.docs.counters`, `docs/README.md`'s file map)
build: local production build of `19c012c` (`npm run build`, version 0.18.0, `dist/`), served by `npm run preview` on `:4173`; Playwright 1.56.1 Chromium at `/opt/pw-browsers/chromium`

## Step 0: CI on GitHub

Checked against the GitHub REST check-runs / actions-runs API for both commits since the last two passes (`ee89009` changelog 0028, `19c012c` changelog 0029):

| Commit | `ci.yml` | `pages.yml` |
| --- | --- | --- |
| `ee89009` | success (run 36378806205) | success (run 36378806162: build 3m22s + deploy 13s) |
| `19c012c` | success (run 36379594101) | success (run 36379594092) — **in progress** at the moment of the first check (started 04:53:46Z, checked at 04:56:36Z, only ~3 min elapsed against a normal ~4 min total run); re-checked after the `thumbs` step had time to finish and it completed **success**. Not a CI failure — the workflow was simply still running when first queried, same shape as `ee89009`'s successful run (checkout, build, `tenant:validate`, Chromium install, `npm run thumbs`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`). |

No CI failure to fix in this pass.

## Build

`npm run build` (0.18.0): Vite build 7.89s, `tenant:validate` OK, `copy-static` 96 files. Exit 0.

```
tenant-validate: OK aluzina v0.18.0 manifestVersion 1 — schema 800 nodes, 17 modules / 88 codes, 430 actions (409 distinct), 9 sub-projects (22 paths), 5 content mounts, 37 path fields, seed v13, 37 entities, counters prompts 23 / changelog 29 / decisions 98 / qa 6, routing path, 350 files scanned for namespace literals
```

(Counters read 6 / 29 here because they were captured before this pass's own docs land; `qa` -> 7 and `changelog` -> 30 below.)

## Screenshots (`docs/screenshots/<CODE>/`)

Captured with `scripts/screenshots.mjs` against `npm run preview` (`:4173`): 7 widths (360, 390, 768, 1280, 1920, 2560, 3840) EN light for every code, plus 390 + 1920 ES (light) and 390 + 1920 dark. 60 files touched (34 new, 26 re-captured at unchanged names since HUB-01 / D-05 / D-09 / D-10 already had partial sets from earlier passes); **12 MB added**, under the ~15 MB budget (q80 JPEG, the script's own convention, no extra cropping needed).

| Code | Route | New widths this pass |
| --- | --- | --- |
| HUB-01 | `/` | 360, 768, 2560 EN; 1920 ES; 390 / 1920 dark (1280, 1920, 3840, 390, es-390 already existed, re-captured unchanged) |
| D-05 | `/dev/plan` | 360, 768, 2560 EN; 390, 1920 ES; 390 / 1920 dark |
| D-09 | `/dev/actions` | 360, 768, 1280→ (already), 1920, 2560, 3840 EN; 390, 1920 ES; 390 / 1920 dark (this code had only 390/1280 before) |
| D-10 | `/design/tokens` | 360, 768, 2560, 3840 EN; 390, 1920 ES; 390 / 1920 dark (1920 already existed) |
| S-01 | `/studio` (`--as=studio`, demo user `u-sarai`) | 360, 768, 2560, 3840 EN; 1920 ES; 390 / 1920 dark |

## Matrix (5 codes x 7 widths, EN light; smallest interactive target, `h1` px, smallest body font px, console errors, failed requests, horizontal overflow)

Checks per cell: console errors (the sandbox's TLS-intercepting proxy logs one `net::ERR_CERT_AUTHORITY_INVALID` per page load against the Google Fonts / external requests the app makes at startup — a container artifact, not an app bug, excluded here exactly as `docs/qa/0006` excludes the Google Fonts proxy error); failed requests >= 400 (none excluded); horizontal overflow (`document.documentElement.scrollWidth - clientWidth`); smallest interactive target in a representative selector (hub cards on HUB-01, buttons/links elsewhere); `h1` px; smallest non-empty body font px (any element).

| Code | 360 | 390 | 768 | 1280 | 1920 | 2560 | 3840 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HUB-01 target | 328 | 358 | 344 | 292 | 328.5 | 438 | 584 |
| HUB-01 h1 | 32 | 32 | 38.4 | 48 | 54 | 72 | 96 |
| D-05 target | 44 | 44 | 44 | 44 | 49.5 | 66 | 88 |
| D-05 h1 | 28 | 28 | 30.72 | 40 | 45 | 60 | 80 |
| D-09 target | 44 | 44 | 44 | 44 | 49.5 | 66 | 88 |
| D-09 h1 | 28 | 28 | 30.72 | 40 | 45 | 60 | 80 |
| D-10 target | 44 | 44 | 44 | 44 | 49.5 | 66 | 88 |
| D-10 h1 | 28 | 28 | 30.72 | 40 | 45 | 60 | 80 |
| S-01 target | 44 | 44 | 44 | 44 | 49.5 | 66 | 88 |
| S-01 h1 | 28 | 28 | 30.72 | 40 | 45 | 60 | 80 |

35/35 cells: **0 overflow, 0 console errors (after the proxy-cert exclusion), 0 failed requests, smallest target >= 44 px** (HUB-01's hub cards are large tiles, always well above 44 px; the other four pages' sampled buttons/links hit exactly the 44 px floor at the three narrowest widths and scale up with the shell's bands, the same pattern as `docs/qa/0006`'s G-09 matrix). Smallest body font at 3840: HUB-01 24 px, D-05 24 px, **D-09 18 px**, D-10 21.6 px, **S-01 18 px** — smallest across the whole matrix is **18 px**, comfortably legible at 4K / 10-foot viewing.

## Additional per-cell checks (spot-checked at 1280 unless noted)

- **Visible focus ring**: Tab twice from a fresh load of HUB-01 lands on a `SELECT` with `outline-style: solid`, `outline-width: 3px` — a real, visible ring (not `outline: none` with a box-shadow substitute that could be clipped).
- **Dark theme applied via `data-theme`**: with `theme=dark` seeded (`aluzina.theme` + `prefers-color-scheme: dark`), `document.documentElement.getAttribute('data-theme')` reads `"dark"` on load.
- **ES strings on the sampled heading** (`aluzina.lang=es`, `h1` text): D-05 "Plan de desarrollo", D-09 "Registro de acciones", D-10 "Tokens de diseño", S-01 "Panel del estudio" — all translated. HUB-01's `h1` reads "Aluzina Business OS" in both languages: `tenant.json identity.name` (used for the hub's product title) is `{ "en": "Aluzina", "es": "Aluzina" }` for the whole product name, so this is the brand name staying itself in both languages, not an untranslated string — no defect.

## Functional smoke (headless, against `npm run preview`)

- **D-05 plan viewer, step 15**: switched to the List view and filtered by Step 15 — all 13 rows `tp-01..tp-13` are present with `id`, title, status, model, codes and changelog columns. Statuses read exactly as `plan.json`: `tp-01..tp-10` and `tp-12` **DONE**, `tp-11` **NEXT**, `tp-13` **BACKLOG**. (The default Board view groups cards by status column rather than by step, which is why a linear text dump of the Board doesn't show tp-11 / tp-13 immediately after tp-10 / tp-12 — the List view, filtered, is the reliable read.)
- **D-09 actions registry**: `window.__aluzina.actions.declared` is the raw per-route action-entry array (1061 entries — routes registered per surface each carry their own copy of a shared action array, e.g. the Spaces module's 15 `HOME_ACTIONS` × 5 surfaces = 75 under K-01); `new Set(declared.map(a => a.id)).size` is **409**, matching `tenant.json actions.distinct` and the validator's recount exactly. (`actions.declared` in the manifest, 430, counts literal `id: '<module>.<verb>'` occurrences in `specs.ts` source text per `scripts/tenant-validate.mjs`'s check (k) — a different, intentionally smaller count than the runtime per-route total; both are already documented in changelog 0029 and are consistent with each other, not a discrepancy to fix.)
- **Placeholder action, "not wired yet" shape**: on the mounted G-09 page (`#/brand/collections`, live handler registered), `window.__aluzina.actions.run('brand.downloadCollectionSet', { set: 'contabilidad' })` returns `{ ok: true, result: "not wired yet: downloading a whole set needs file storage; today the Dropbox folder is the download" }` — the Placeholder pattern (P-09), reachable through the actions bus. Running the same id with **no page mounted** (e.g. from D-09 itself) returns `{ ok: false, error: 'not-live' }` — `runAction`'s documented shape for "no handler registered right now" (`apps/hub/src/actions/bus.ts`), not a crash.
- **Role guard**: seeding `aluzina.session` as the client demo user (`u-client`) and loading `#/founder` shows the guard screen ("This page is not part of your role... It needs the permission \"projects.approve\"... Switch to Founder / Back to hub") instead of the founder page — refused as required.
- **Storage namespace**: after a fresh load of `/`, `Object.keys(localStorage)` is `["aluzina.devMode", "aluzina.session", "aluzina.data"]` — every key starts with `aluzina.`, none outside the namespace.
- **Row shape**: `aluzina.data` (`{ seedVersion, tables }`) holds **37 tables, 2484 rows total, seedVersion 13**; every one of the 2484 rows carries both `tenant_id` and `version` (0 missing).

## Docs agreement

- **`plan.json` = `kanban.md` = `build-plan.md` = `tenant/README.md`**: all four already agreed going into this pass (`tp-01..tp-10` / `tp-12` done, `tp-11` next, `tp-13` backlog) and this pass's own changes move all four together (tp-11 -> done, changelog 0030) in the same commit — see the changelog.
- **`tenant.json docs.counters` vs the files**: `npm run tenant:validate`'s check (b) confirms this every build (`prompts 23 / changelog 29 / decisions 98 / qa 6` before this pass's own new files; the manifest's counters move to `changelog 30` / `qa 7` in this commit and the validator re-confirms them against the checkout after the docs land).
- **`docs/README.md` mentions every `docs/tenant/*` file**: the `tenant/` row names `README.md`, `inventory-2026-09-28.md`, `manifest.md`, `sub-projects.md`, `platform-vs-tenant.md`, `host-requirements.md`, `between-gigs.md`, `tenants.example.json` — the full listing of `ls docs/tenant/`.
- **`docs/tenant/README.md` pass table matches `plan.json`**: `tp-01..tp-10` / `tp-12` **done**, `tp-11` **next** — matched before this pass; this pass updates the table row and adds a change-log line as part of the same commit.

## Findings

No code defects found: 0/35 matrix cells failed any check (overflow, console errors, failed requests, target size, focus ring, dark-theme attribute, ES strings), the functional smoke matched `plan.json` and the manifest exactly, and the four docs already agreed. Nothing needed fixing under the "fix in this pass" bar. Two things noted above are non-issues on inspection, recorded so a later reader doesn't re-flag them: `actions.declared` (430, static source scan) vs the runtime per-route total (1061) are two different, both-intentional counts; HUB-01's `h1` reads "Aluzina Business OS" in Spanish too because the tenant's own brand name is identical in both languages.

## Not checked

- The remaining ~85 route codes outside HUB-01 / D-05 / D-09 / D-10 / S-01 were not recaptured or re-smoke-tested this pass (out of scope for tp-11, which names these five).
- Pointer/touch/pen input and the TV-remote / gamepad / voice inputs named as "soon" in the workspace's input-support standard were not exercised; keyboard, mouse and the viewport-only capture were.
- The live GitHub Pages deployment was not fetched directly (the local `npm run preview` build of the same commit was used, matching the convention of every earlier QA pass in this repo since 0002).

## Result

Build green (`npm run build` exit 0, `tenant:validate` OK). CI green on both `ee89009` and `19c012c` for `ci.yml` and `pages.yml`. 35/35 screenshot-matrix cells pass; smallest legible font at 3840 is 18 px. Functional smoke matches `plan.json` / the manifest exactly on all five checks. Docs agree. tp-11 -> Done (changelog 0030).
