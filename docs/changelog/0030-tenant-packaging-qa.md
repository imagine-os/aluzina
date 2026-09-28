version: 0.18.1 (from 0.18.0: QA pass + docs only, no app behaviour change; `SEED_VERSION` stays 13)
date: 2026-09-28
prompt: 0023
intent: Tenant packaging QA (tp-11 of step 15, the last item before host-time tp-13): confirm CI green on the last two commits, build green, capture the 7-width + ES + dark screenshot matrix for HUB-01 / D-05 / D-09 / D-10 and one moved-code consumer (S-01), run the functional smoke (plan viewer, actions registry, role guard, storage namespace, row shape) and the docs-agreement audit, and close out step 15's definition of done.
decision: none — no code defect found this pass, so nothing needed a decision; two non-issues were checked and recorded as non-issues rather than fixed (the static `actions.declared` count vs the runtime per-route total; HUB-01's `h1` reading "Aluzina Business OS" in Spanish too, because `identity.name` is the same string in both languages)
rejected: fixing or filing anything against the `pages.yml` run for `19c012c` reading "in progress" on the first check (it was simply still running — re-checked after it had time to finish and it read success, same shape as the prior run); re-deriving `actions.declared` (430) to match the runtime per-route total (1061) or vice versa (changelog 0029 already documents these as two different, both-intentional counts — a source-text scan of `id: '<module>.<verb>'` literals vs the flattened per-route action list; changing either changes what a different, working check already relies on)
files: docs/screenshots/{HUB-01,D-05,D-09,D-10,S-01}/*.jpg (34 new + 26 re-captured at unchanged widths, 12 MB added), docs/screenshots/{HUB-01,D-05,D-09,D-10,S-01}/routes.json, docs/qa/0007-tenant-packaging-smoke.md (new), tenant.json (version, docs.counters), package.json + apps/hub/package.json (version), docs/plan/plan.json (version, tp-11 done / 0030, updatedAt), docs/kanban.md (tp-11 -> Done), docs/build-plan.md (step 15 row), docs/tenant/README.md (pass table, status line, change log), docs/README.md (`qa/` row), README.md (status line), docs/changelog/0030-tenant-packaging-qa.md (new)
codes: HUB-01, D-05, D-09, D-10, S-01 (no UI change on any of them — QA capture and smoke only)
model: Sonnet 5 (tp-11); Fable 5.1 plan

# 0030 - Tenant packaging QA pass (tp-11): build, screenshots, functional smoke, docs agreement

## Step 0: CI on GitHub

`ci.yml` and `pages.yml` both **succeeded** on `ee89009` (changelog 0028) and `19c012c` (changelog 0029), checked via the GitHub REST check-runs / actions-runs APIs. `19c012c`'s `pages.yml` run read `in_progress` on the first check (it had been running about 3 of its usual ~4 minutes); a second check after it had time to finish read `success`, on the same steps as the prior run (checkout, build, `tenant:validate`, Chromium install, `npm run thumbs`, Pages configure / upload / deploy). No CI failure to fix.

## Build

`npm run build` (0.18.0 at capture time): exit 0, Vite build 7.89s, `tenant:validate` OK (`schema 800 nodes, 17 modules / 88 codes, 430 actions (409 distinct), 9 sub-projects (22 paths), 5 content mounts, 37 path fields, seed v13, 37 entities, ... routing path, 350 files scanned`), `copy-static` 96 files.

## Screenshots

7 widths (360-3840) EN light + 390/1920 ES + 390/1920 dark for HUB-01 `/`, D-05 `/dev/plan`, D-09 `/dev/actions`, D-10 `/design/tokens`, and S-01 `/studio` (`--as=studio`, demo user `u-sarai`, the moved-code consumer named in the QA brief) — 35 EN-light matrix cells plus 20 ES/dark cells, all against `npm run preview` of this checkout. 34 new files, 26 re-captured at names that already existed from earlier passes, 12 MB added (under the ~15 MB budget). Full matrix, per-cell checks and functional smoke in `docs/qa/0007-tenant-packaging-smoke.md`.

## Results (full detail in QA 0007)

- **35/35 EN-light matrix cells pass**: 0 horizontal overflow, 0 console errors (after excluding the sandbox's TLS-proxy `ERR_CERT_AUTHORITY_INVALID`, the same class of exclusion `docs/qa/0006` made for the Google Fonts proxy), 0 failed requests, every sampled interactive target >= 44 px. Smallest legible body font at 3840 is **18 px** (D-09, S-01).
- **Focus ring**: visible (`outline-style: solid`, 3 px) tabbing into HUB-01. **Dark theme**: `data-theme="dark"` set on `<html>` when seeded. **ES strings**: D-05 / D-09 / D-10 / S-01 headings all translated; HUB-01's stays "Aluzina Business OS" in both languages because the tenant's own name is identical in `identity.name.en` / `.es` — not a missing translation.
- **Functional smoke, all matching `plan.json` / the manifest**: D-05's List view filtered to Step 15 shows all 13 `tp-01..tp-13` rows with status exactly `plan.json`'s (`tp-01..tp-10` + `tp-12` DONE, `tp-11` NEXT, `tp-13` BACKLOG); D-09's live `actions.declared` yields 409 distinct ids (matches `tenant.json actions.distinct`); running a live placeholder action (`brand.downloadCollectionSet` on the mounted G-09 page) returns the Placeholder "not wired yet" shape, and the same id with no page mounted returns the bus's own `{ ok: false, error: 'not-live' }`; the client demo user is refused `#/founder` with the role-guard screen; `localStorage` after load holds only `aluzina.*` keys; every one of `aluzina.data`'s 2484 rows across 37 tables carries `tenant_id` and `version`.
- **Docs agreement**: `plan.json` = `kanban.md` = `build-plan.md` = `tenant/README.md` on every `tp-` status; `tenant.json docs.counters` matched the checkout (validator check (b)) before this pass's own new files, and moves to `changelog: 30` / `qa: 7` in this commit; `docs/README.md`'s `tenant/` row names every file in `docs/tenant/`.
- **No code defects found.** Nothing met the "fix in this pass" bar (there was nothing to fix); two apparent oddities were checked and are non-issues (recorded in QA 0007 so they aren't re-flagged later).

## Version

0.18.0 -> 0.18.1: QA pass and its docs only, no app behaviour change, `SEED_VERSION` unchanged at 13.

## Step 15: closed except tp-13

Every task in step 15 (`tp-01..tp-12`) is now **Done**; `tp-13` (host-time: extract `packages/platform`, real `DataProvider` with `tenant_id` filtering, object storage for the content mounts) stays in **Backlog** until the host exists and credentials are available (D-089, D-092) — the packaging itself is complete for aluzina as one tenant.

## Open follow-ups (not in this pass)

- tp-13: host-time, blocked on the host + credentials, unchanged.
- between-gigs itself: still blocked on GitHub repo access (Justin), unchanged since changelog 0029.
Final Slack reply synced into prompt 0023 (this commit).
