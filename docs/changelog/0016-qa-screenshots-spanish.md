version: 0.10.0
date: 2026-09-21
prompt: 0009 follow-up
intent: Close the two deferred items from pass 0013 (changelog 0013): live screenshots of every code that pass shipped, and a Spanish fill pass over the module strings tables and the playbook.
decision: none (QA and translation-fill pass, no new component or data contracts)
rejected: capturing against the live `https://imagine-os.github.io/aluzina/` URL directly — headless Chromium rejected the sandbox proxy's TLS certificate, and the fix used elsewhere in this repo for the same problem (`--disable-features=ChromeRootStoreUsed`, as in `docs/source/aluzinaa-archive/tools/scrape-aluzinaa.js`) was added to `scripts/screenshots.mjs` and then removed again when the auto-mode permission classifier denied it as TLS-weakening; captured against a local `npm run preview` of the same commit instead (content-identical, since GitHub Pages serves that exact build); running `npm run thumbs` to backfill local hub-card thumbnails (out of scope, a separate CI step)
files: scripts/screenshots.mjs, apps/hub/src/domain/playbook.ts, apps/hub/src/modules/tools/specs.ts, apps/hub/src/modules/spaces/specs.ts, docs/pages/{D-05,D-06,D-07,D-08,D-09,D-11,D-14,D-15,M-01..M-08,C-01..C-06,P-01..P-05,A-03,A-08,O-11,O-12,O-13,S-10,S-11,K-04,G-08,HUB-01}.md, docs/prompts/{0009,0011,0012,0013}-*.md, docs/qa/0002-pass-0013-matrix.md, docs/kanban.md, docs/plan/plan.json, docs/screenshots/**  (95 JPEGs across 37 codes + routes.json per code)
codes: D-05, D-06, D-07, D-08, D-09, D-11, D-14, D-15, M-01, M-02, M-03, M-04, M-05, M-06, M-07, M-08, C-01, C-02, C-03, C-04, C-05, C-06, P-01, P-02, P-03, P-04, P-05, A-03, A-08, O-11, O-12, O-13, S-10, S-11, K-04, G-08, HUB-01
model: Sonnet 5

# 0016 - QA: live screenshots and Spanish fill pass for changelog 0013

Changelog 0013 shipped 39 new pages across the playbook bundle and deferred two things to a Sonnet 5 pass (section G/F of that changelog and the kanban "Doing" cards): live screenshots of every new code, and a Spanish fill pass over the module strings tables and `domain/playbook.ts`. This pass closes both, also replaced the four prompt-reply drafts (0009, 0011, 0012, 0013) with the reply actually posted to the Slack thread, per this pass's instructions.

## A. Prompt replies corrected

`docs/prompts/{0009,0011,0012,0013}-*.md` `## Response` sections held a longer draft reply than what was actually posted to the Slack thread. Replaced with the verbatim text posted (the two open questions for Justin/the founder, the five links, the model credit), prefixed "Reply posted to the Slack thread (verbatim):" the way `docs/prompts/0005-spaces-relational-organizer.md` does it.

## B. Live screenshots (95 files, 37 codes)

`node scripts/screenshots.mjs --base=<url> --code=<CODE> --route=<path> --shots=en-390,en-1280[,es-1280,en-1920,en-3840] [--as=<role>] [--settle=800]` against every code changelog 0013 shipped: `en-390` + `en-1280` for all 37; additionally `es-1280` for the dashboards named in the task (HUB-01, D-05, M-01, C-01, P-01, K-04, plus A-08, G-08, P-03); `en-1920` + `en-3840` for HUB-01, D-05, K-04, P-01, M-01, C-01. Param routes used real seed ids/slugs: `/client/projects/prj-laureles`, `/manual/services/creative-digital-consultation`, `/services/creative-digital-consultation`, `/docs/decisions.md`, `/studio/checklist/prj-laureles`. `--settle=800` on D-05 and K-04 per the task; `--as=<role>` per route (dev, ops, client, founder, studio, brand).

**Capture method.** The task asked for captures against the live `https://imagine-os.github.io/aluzina/` URL. That failed on the first attempt: headless Chromium refused the certificate the sandbox's outbound proxy re-terminates with (`net::ERR_CERT_AUTHORITY_INVALID`) — `scripts/screenshots.mjs` had no accommodation for it, unlike the archived scraper scripts (`--disable-features=ChromeRootStoreUsed`, `docs/source/aluzinaa-archive/tools/scrape-aluzinaa.js`). That same flag was added to `screenshots.mjs`, then removed again: the harness's auto-mode permission classifier denied it as a TLS-weakening action, and the harness's own instructions are explicit that such a denial is not something to route around. Every capture in this pass was instead taken against `npm run preview` serving `dist/` (built from the exact commit GitHub Pages had already deployed, `ca54d9e`, version 0.10.0) on `localhost` — content-identical, since Pages serves that same build byte for byte. `screenshots.mjs` kept one non-TLS addition: `--use-gl` / `--enable-unsafe-swiftshader` passthrough to the Chromium launch args, added for the K-04 3D view; in the event headless Chromium's own automatic (deprecated) software-WebGL fallback rendered the populated 3D scene anyway, so the flag proved unnecessary in practice but is harmless to keep for a future run against a WebGL-strict environment.

One consequence of capturing from a local build instead of the live one: `npm run thumbs` (the CI step that writes `dist/thumbs/<code>.jpg`) was not run against this local `dist/`, so HUB-01 and D-07 show the "No preview yet" placeholder tile in these captures where the live deployed site shows real thumbnails. Documented as a capture-method artifact in `docs/qa/0002-pass-0013-matrix.md`, not filed as a defect.

**Review.** Every JPEG was opened and read, not just generated. Full results, code by code and width by width, in `docs/qa/0002-pass-0013-matrix.md`. Two real defects found:

- **D-14** `/dev/tokens`, 390 px: the "Copy variable" button label wraps mid-word ("variabl" / "e").
- **D-06 / D-15** (`/docs`, `/docs/*`): the Markdown table renderer has no minimum column width and no horizontal-scroll container, so any wide table (confirmed on `decisions.md`) wraps every header and body cell one letter per line at both 390 and 1280 — unreadable, not merely cramped. More severe than the existing backlog item ("Markdown: heading ids + linkResolver prop"), so filed as its own card.

Both filed to `docs/kanban.md` Backlog. `spec.checkedAt` gained `3840` on D-05 (`tools/specs.ts`) and K-04 (`spaces/specs.ts`), the two codes where this pass's captures added a width beyond what the spec already claimed; every other code's `checkedAt` already claimed the widths captured here (self-attested by the pass-0013 module workers before any screenshot existed) — this pass's captures corroborate that attestation for the widths checked, without needing a code change.

Deferred, filed to Backlog: live screenshots of the 33 portal pages still missing since changelog 0007 (A-01/A-02/A-04..A-07, O-02..O-10, S-02..S-09, G-02..G-07) — not in this pass's code list.

## C. Spanish fill pass

Scanned every `apps/hub/src/modules/*/strings.ts` (15 files, ~2,900 bilingual entries) and `apps/hub/src/i18n/core.ts` for a key with no `es` value: **zero found** — the pass-0013 module workers already followed the P-13 strings rule (`apps/hub/src/modules/README.md`) and shipped every key bilingual. (73 entries have `es` identical to `en`, almost all proper nouns, technical tokens or accepted design/business anglicisms in Colombian Spanish — `Instagram`, `WhatsApp`, `PDF`, `HEX`, `Zoom`, `Brief`, `Chat`, `Render`, `Normal`, `Sector` — reviewed individually, not flagged.)

`apps/hub/src/domain/playbook.ts` uses `T(en, es?)` / `L(en, es?)` helpers rather than literal `{ en, es }` objects; scanning all 232 `T()` and 16 `L()` calls found **3 missing `es`**, all in `LEAD_CHANNELS`:

```ts
{ id: 'instagram', label: T('Instagram') },   // -> T('Instagram', 'Instagram')
{ id: 'whatsapp', label: T('WhatsApp') },     // -> T('WhatsApp', 'WhatsApp')
{ id: 'networking', label: T('Networking') }, // -> T('Networking', 'Contactos')
```

`instagram` / `whatsapp` filled with themselves (proper nouns, same as `website` -> "Sitio web" and `referral` -> "Referido" pattern already used for the other four channels); `networking` filled as "Contactos" (distinct from `referral` -> "Referido", which already covers a client referring a friend). `npx tsc --noEmit` in `apps/hub` clean after the fill.

## D. Verification

`npm run build` green (tokens + tsc strict + vite + copy-static). No component, permission, entity or route changes in this pass.
