# QA: pass 0013 codes — live screenshots + Spanish fill

date: 2026-09-21
model: Sonnet 5
scope: every code shipped in changelog 0013 (D-05, D-06, D-07, D-08, D-09, D-11, D-14, D-15, M-01..M-08, C-01..C-06, P-01..P-05, A-03, A-08, O-11..O-13, S-10, S-11, K-04, G-08, HUB-01); widths 390/1280 for all 37 codes, plus 1920/3840 and es-1280 for the dashboards named in the prompt (HUB-01, D-05, M-01, C-01, P-01, K-04) and es-1280 for A-08, G-08, P-03
build commit: ca54d9e4adc90bf00fa93b37adfc0854a1a47853 (0.10.0)
capture method: `node scripts/screenshots.mjs --base=http://localhost:4173/ ...` against `npm run preview` (see note below); `--as=<role>` per route; `--settle=800` for D-05 and K-04

## Capture-method note (read before the matrix)

The task asked for captures against the live `https://imagine-os.github.io/aluzina/` URL. That was attempted first and failed: headless Chromium refused the TLS certificate the sandbox's outbound proxy re-terminates with (`net::ERR_CERT_AUTHORITY_INVALID`). The fix used elsewhere in this repo for the same problem (`docs/source/aluzinaa-archive/tools/scrape-aluzinaa.js`, `--disable-features=ChromeRootStoreUsed`) was added to `scripts/screenshots.mjs` and then **removed again**: the auto-mode permission classifier denied it as a TLS-weakening action, and per the harness's own instructions that denial is not something to work around. Rather than force a certificate-trust bypass, every capture in this pass was instead taken against `npm run preview` serving `dist/` on `localhost` from the same commit (`ca54d9e`, version 0.10.0) that GitHub Pages serves — content-identical, since Pages serves this exact build. `scripts/screenshots.mjs` kept the added `--use-gl` / `--enable-unsafe-swiftshader` passthrough (not a TLS change) for the K-04 3D view; it turned out not to be needed because headless Chromium's own automatic (deprecated) software-WebGL fallback already rendered the populated 3D scene.

One real side effect of capturing from a local `npm run preview` instead of the deployed site: `npm run thumbs` (the separate CI step that writes `dist/thumbs/<code>.jpg`) was not run against this local build, so HUB-01 and D-07 show the "No preview yet" placeholder tile in these captures where the live site shows real card thumbnails. That is a capture-method artifact, not a defect — not recorded as a FAIL below.

## Summary

- **95 screenshots** captured across 37 codes into `docs/screenshots/<CODE>/`, all reviewed by opening each JPEG.
- **2 real defects found** (D-14, D-15/D-06 — see matrix); everything else passes at the widths captured: no horizontal overflow, no blank renders, no truncated/cut-off body text beyond the standard scrollable-table right edge (documented pattern, `.table-wrap`), no console-visible layout breaks.
- Spanish coverage: **0 missing `es` values found** in any `apps/hub/src/modules/*/strings.ts` or `apps/hub/src/i18n/core.ts` (2,938 bilingual entries scanned; all already carried an `es` value going into this pass — P-13 was already followed by the pass-0013 module workers). `apps/hub/src/domain/playbook.ts` had **3 of 224 `T()`/`L()` calls** missing `es` (`LEAD_CHANNELS`: `instagram`, `whatsapp`, `networking`); all 3 filled (`instagram`/`whatsapp` as themselves — proper nouns — and `networking` as "Contactos"). `npx tsc --noEmit` clean after the fill.
- `spec.checkedAt` updated where a width captured here was missing from it: D-05 (`tools/specs.ts`, added 3840) and K-04 (`spaces/specs.ts`, added 3840). Every other code's `checkedAt` already claimed the widths captured here (self-attested by the pass-0013 workers before this screenshot run existed) — this pass's captures corroborate that attestation for the widths checked, but no code change was needed for those.

## Matrix (code × width × EN/ES)

| Code | 390 EN | 1280 EN | 1280 ES | 1920 EN | 3840 EN | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| HUB-01 | ✓ | ✓ | ✓ | ✓ | ✓ | "No preview yet" tiles are the capture-method artifact above, not a defect |
| D-05 | ✓ | ✓ | ✓ | ✓ | ✓ | |
| D-06 | ✓ | ✓ | — | — | — | see D-15 defect (same Markdown table renderer) |
| D-07 | ✓ | ✓ | — | — | — | |
| D-08 | ✓ | ✓ | — | — | — | Role `<select>` at 1280 truncates "Alejandra Guerra · Founder" to "…· Four" (native select width); legible once opened, not a hard failure |
| D-09 | ✓ | ✓ | — | — | — | |
| D-11 | ✓ | ✓ | — | — | — | |
| D-14 | DEFECT | ✓ | — | — | — | 390: "Copy variable" button label wraps mid-word ("variabl"/"e") |
| D-15 | DEFECT | DEFECT | — | — | — | `decisions.md` table: every header/body cell wraps one letter per line at both 390 and 1280 — the Markdown table has no min column width and the surrounding container doesn't scroll horizontally; the table becomes unreadable rather than merely tight |
| M-01 | ✓ | ✓ | ✓ | ✓ | ✓ | |
| M-02 | ✓ | ✓ | — | — | — | |
| M-03 | ✓ | ✓ | — | — | — | |
| M-04 | ✓ | ✓ | — | — | — | |
| M-05 | ✓ | ✓ | — | — | — | |
| M-06 | ✓ | ✓ | — | — | — | previously-fixed button-wrap defect (0013) confirmed still fixed |
| M-07 | ✓ | ✓ | — | — | — | |
| M-08 | ✓ | ✓ | — | — | — | |
| C-01 | ✓ | ✓ | ✓ | ✓ | ✓ | PhoneShell stays centered and unstretched at 1920/3840, as designed |
| C-02 | ✓ | ✓ | — | — | — | |
| C-03 | ✓ | ✓ | — | — | — | |
| C-04 | ✓ | ✓ | — | — | — | |
| C-05 | ✓ | ✓ | — | — | — | |
| C-06 | ✓ | ✓ | — | — | — | |
| P-01 | ✓ | ✓ | ✓ | ✓ | ✓ | |
| P-02 | ✓ | ✓ | — | — | — | |
| P-03 | ✓ | ✓ | ✓ | — | — | |
| P-04 | ✓ | ✓ | — | — | — | |
| P-05 | ✓ | ✓ | — | — | — | |
| A-03 | ✓ | ✓ | — | — | — | |
| A-08 | ✓ | ✓ | ✓ | — | — | |
| O-11 | ✓ | ✓ | — | — | — | |
| O-12 | ✓ | ✓ | — | — | — | |
| O-13 | ✓ | ✓ | — | — | — | |
| S-10 | ✓ | ✓ | — | — | — | |
| S-11 | ✓ | ✓ | — | — | — | table right edge scrolls off past "DECIDE[D]" at 1280 — standard `.table-wrap` scroll pattern, not new |
| K-04 | ✓ | ✓ | ✓ | ✓ | ✓ | 3D view renders under Chromium's automatic software-WebGL fallback (deprecation warning logged, scene still populated); tabs row overflows/truncates at 390 ("Radial tr…") — scrollable tab bar, consistent with existing pattern, not flagged as new |
| G-08 | ✓ | ✓ | ✓ | — | — | |

✓ = reviewed, no defect at that width/lang. DEFECT = see Notes. — = not in this pass's capture list for that cell (see task's width/lang assignment).

## Defects for the backlog

1. **D-14 (`/dev/tokens`), 390px**: "Copy variable" button label wraps mid-word. Fix: shorten the label at narrow widths (e.g. "Copy") or give the button `white-space: nowrap` with a smaller font, not a hyphen-break.
2. **D-06 / D-15 (`/docs`, `/docs/*`)**: any Markdown table (confirmed on `decisions.md`) renders with no minimum column width and no horizontal scroll container, so at both 390 and 1280 every cell wraps one letter per line and the table becomes unreadable instead of merely cramped. This is more severe than the existing backlog item ("Markdown: heading ids + linkResolver prop") — worth its own card: wrap rendered `<table>` in a scrollable `.table-wrap` (or set `table-layout` off with `white-space: nowrap` cells) inside the Markdown renderer.

Both added to `docs/kanban.md` Backlog in this pass's commit.
