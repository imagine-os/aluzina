# QA: Work views (W-01, W-02) — responsive + Spanish matrix

date: 2026-09-21
model: Sonnet 5
scope: /ops/work (List, Board, Timeline, Calendar) and /ops/work/prj-laureles; widths 360/390/768/1280/1920/2560/3840; light + dark; EN + ES
build commit: a050e9b4c6f4aed090a0bc33fb614c4a54c0ced3

## Summary

224 cells checked (2 routes × 4 views × 7 widths × 2 themes × 2 langs, aggregated below to 56 route×view×width rows).
- **56 pass, 168 fail** at the cell level (aggregated: **19 of 56** route×view×width rows fully pass, **37 fail**).
- Every failure is a **target-size (P-03, 44×44px) or font-size (P-01, ≥16px @ 1920+) violation**, consistent across light/dark and EN/ES. Zero horizontal overflow, zero console errors/warnings, zero missing-translation markers, zero literal "undefined" across all 224 cells.
- Keyboard flow on List @ 1280: **all 5 steps pass**.
- Spanish fill on the five surfaces (List/Board/Timeline/Calendar of /ops/work + /ops/work/prj-laureles): **0 English-leak strings found**.

## Matrix (route × view × width)

| Route | View | Width | Result | Reason |
| --- | --- | --- | --- | --- |
| /ops/work | List | 360 | FAIL | view tabs 40px tall (<44px, P-03); row-select checkboxes ~24-27px (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | List | 390 | FAIL | view tabs 40px tall (<44px, P-03); row-select checkboxes ~24-27px (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | List | 768 | FAIL | view tabs 40px tall (<44px, P-03); row-select checkboxes ~24-27px (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | List | 1280 | FAIL | view tabs 40px tall (<44px, P-03); row-select checkboxes ~24-27px (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | List | 1920 | FAIL | role badge text 13.5×1.125=15.2px (<16px, P-01); row-select checkboxes 27px (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | List | 2560 | FAIL | row-select checkboxes 36px (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | List | 3840 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work | Board | 360 | FAIL | view tabs 40px tall (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Board | 390 | FAIL | view tabs 40px tall (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Board | 768 | FAIL | view tabs 40px tall (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Board | 1280 | FAIL | view tabs 40px tall (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Board | 1920 | FAIL | role badge text 13.5×1.125=15.2px (<16px, P-01) (consistent light/dark, EN/ES) |
| /ops/work | Board | 2560 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work | Board | 3840 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work | Timeline | 360 | FAIL | view tabs 40px tall (<44px, P-03); timeline task bars 40px tall, 40-60 elements (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Timeline | 390 | FAIL | view tabs 40px tall (<44px, P-03); timeline task bars 40px tall, 40-60 elements (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Timeline | 768 | FAIL | view tabs 40px tall (<44px, P-03); timeline task bars 40px tall, 40-60 elements (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Timeline | 1280 | FAIL | view tabs 40px tall (<44px, P-03); timeline task bars 40px tall, 40-60 elements (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Timeline | 1920 | FAIL | role badge text 13.5×1.125=15.2px (<16px, P-01) (consistent light/dark, EN/ES) |
| /ops/work | Timeline | 2560 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work | Timeline | 3840 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work | Calendar | 360 | FAIL | view tabs 40px tall (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Calendar | 390 | FAIL | view tabs 40px tall (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Calendar | 768 | FAIL | view tabs 40px tall (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Calendar | 1280 | FAIL | view tabs 40px tall (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work | Calendar | 1920 | FAIL | role badge text 13.5×1.125=15.2px (<16px, P-01) (consistent light/dark, EN/ES) |
| /ops/work | Calendar | 2560 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work | Calendar | 3840 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work/prj-laureles | List | 360 | FAIL | view tabs 40px tall (<44px, P-03); row-select checkboxes ~24-27px (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | List | 390 | FAIL | view tabs 40px tall (<44px, P-03); row-select checkboxes ~24-27px (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | List | 768 | FAIL | view tabs 40px tall (<44px, P-03); row-select checkboxes ~24-27px (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | List | 1280 | FAIL | view tabs 40px tall (<44px, P-03); row-select checkboxes ~24-27px (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | List | 1920 | FAIL | role badge text 13.5×1.125=15.2px (<16px, P-01); row-select checkboxes 27px (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | List | 2560 | FAIL | row-select checkboxes 36px (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | List | 3840 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work/prj-laureles | Board | 360 | FAIL | view tabs 40px tall (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Board | 390 | FAIL | view tabs 40px tall (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Board | 768 | FAIL | view tabs 40px tall (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Board | 1280 | FAIL | view tabs 40px tall (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Board | 1920 | FAIL | role badge text 13.5×1.125=15.2px (<16px, P-01) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Board | 2560 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work/prj-laureles | Board | 3840 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work/prj-laureles | Timeline | 360 | FAIL | view tabs 40px tall (<44px, P-03); timeline task bars 40px tall, 40-60 elements (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Timeline | 390 | FAIL | view tabs 40px tall (<44px, P-03); timeline task bars 40px tall, 40-60 elements (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Timeline | 768 | FAIL | view tabs 40px tall (<44px, P-03); timeline task bars 40px tall, 40-60 elements (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Timeline | 1280 | FAIL | view tabs 40px tall (<44px, P-03); timeline task bars 40px tall, 40-60 elements (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Timeline | 1920 | FAIL | role badge text 13.5×1.125=15.2px (<16px, P-01) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Timeline | 2560 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work/prj-laureles | Timeline | 3840 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work/prj-laureles | Calendar | 360 | FAIL | view tabs 40px tall (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Calendar | 390 | FAIL | view tabs 40px tall (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Calendar | 768 | FAIL | view tabs 40px tall (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Calendar | 1280 | FAIL | view tabs 40px tall (<44px, P-03); sidebar "Work" nav link 42px wide (<44px, P-03) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Calendar | 1920 | FAIL | role badge text 13.5×1.125=15.2px (<16px, P-01) (consistent light/dark, EN/ES) |
| /ops/work/prj-laureles | Calendar | 2560 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |
| /ops/work/prj-laureles | Calendar | 3840 | PASS | consistent light/dark, EN/ES; no overflow, no console errors, no missing translations |

## Keyboard test (/ops/work List @ 1280)

| Step | Result | Detail |
| --- | --- | --- |
| Tab to a task row | PASS | reached row `tsk-provenza-concepto` after 9 tabs |
| Enter opens drawer | PASS | drawer/dialog present |
| Esc closes drawer, focus returns | PASS | drawerClosed=true, focusReturned=true |
| ArrowDown moves to next row | PASS | focused row now `tsk-laureles-levantamiento` |
| Space toggles complete, then back | PASS | before=true → afterSpace=false → afterSpace2=true |

## Spanish fill

Extracted visible text in ES mode on: /ops/work List, Board, Timeline, Calendar, and /ops/work/prj-laureles. Checked for translation-marker patterns (`word.word.word`), the literal string "undefined", and common English leak words (the, and, task, due, status, board, list, timeline, add, save, filter, sort, group) appearing outside proper nouns.

**Result: no gaps found.** All five surfaces render fully in Spanish (Lista, Tablero, Cronograma, Calendario, etc.) with no stray English strings, no untranslated keys, and no "undefined" text.

## Defect list (prioritized, max 15 — 5 found)

1. **View tabs are 40px tall, below the 44px minimum target (P-03).**
   - Repro: any view, any width ≤1280, light or dark, EN or ES — e.g. `/ops/work` List @ 390.
   - Detail: `.tabs__tab` (List/Board/Timeline/Calendar switcher, `Tabs` molecule) renders at height 40px at the base `--scale` (1). It only clears 44px once `--scale` reaches 1.125 (≥1920px), so every phone/tablet/laptop viewport fails this control's tap target.
   - Suggested fix: raise `.tabs__tab` `min-height` to `2.75rem` (44px) at the base scale, independent of the type-scale bands.

2. **Timeline task bars are 40px tall (P-03), the Timeline's primary interactive control.**
   - Repro: Timeline view, any width ≤1280 — e.g. `/ops/work` Timeline @ 1280 (ops role's default view). 40–60 bars per page fall under 44px.
   - Detail: `.work-tl__bar` buttons (drag/keyboard-openable per W-01 "Enter opens") are rem-sized like the tabs and only clear 44px at `--scale` ≥1.125.
   - Suggested fix: raise the bar's minimum height to 44px at the base scale (pad the bar or its hit area vertically; the visual bar can stay slimmer with a taller invisible hit box).

3. **List-view row-select checkboxes never reach 44px, even on a 4K desktop monitor at 2560.**
   - Repro: List view, any width from 360 up to 2560 — e.g. `/ops/work` List @ 1920 (27×27px) and @ 2560 (36×36px).
   - Detail: `.check__box` (the per-row bulk-select `Checkbox` atom, ~60 instances on a full task list) is sized well under the native browser default and doesn't reach 44px until `--scale` hits 2 (3840px only).
   - Suggested fix: keep the visible box small but wrap it in a ≥44×44px padded hit area (as done for other icon-only controls), rather than relying on `--scale` alone.

4. **Shell "role" badge text drops under 16px exactly at 1920px (P-01).**
   - Repro: any Work view/route @ 1920 only — e.g. `/ops/work` Board @ 1920, text "Administration and Operations" / "Administración y Operaciones" at 15.2px.
   - Detail: `.dshell__role` badge font is 13.5px at scale 1; at scale 1.125 (1920) it lands at 15.2px, just under the 16px floor. It clears 16px again by 2560 (scale 1.5 → 20.25px). Shell-level chrome (not Work-specific) but present on every Work route.
   - Suggested fix: bump the badge's base `font-size` token so it clears 16px at the 1920 band, e.g. round up to `0.9375rem` (15px→16.9px at 1.125).

5. **W-02 sidebar "Work" nav link is 42px wide, 2px short of 44px (P-03), minor.**
   - Repro: `/ops/work/prj-laureles` (any view) at width ≤1280 — e.g. Board @ 360.
   - Detail: the desktop-shell nav item link for "Work" measures 42×44 (width only, just under target) on the project-scoped route; not observed on `/ops/work` itself in the same probe, likely a layout-width interaction with the breadcrumb/back button added on W-02.
   - Suggested fix: add ~2px of horizontal padding to the nav link, or set `min-width: 2.75rem` on nav items.

## Screenshots

224 JPGs (quality 60) saved to `/tmp/claude-0/-workspace/5e6d7114-ad62-5bd4-ae3e-f891f6e1a62a/scratchpad/qa/work/<route>-<view>-<width>-<theme>-<lang>.jpg`.

## Fixes

model: Fable 5.1. Re-measured with Playwright (Chromium 1194) over `npm run preview` at 390 / 1280 / 1920 on `/ops/work` (List and Timeline views, `?as=ops`) and `/ops/work/prj-laureles?as=ops`. Widths below are `getBoundingClientRect()` in real px.

1. **View tabs 40px tall (P-03).** `.work-header .tabs__tab` overrode the `Tabs` molecule's `min-height: var(--target)` down to `calc(var(--target) - 0.25rem)` (40px). Fix: drop the override, `min-height: var(--target)`. Verified: 390px→44px, 1280px→44px, 1920px→49.5px (was 40/40/45).
2. **Timeline bars 40px tall (P-03).** `.work-tl__bar` height was `calc(var(--tl-row) - 0.5rem)` (40px) inset `top: 0.25rem` inside a 48px row. Fix: bar now fills the full row (`top: 0; height: var(--tl-row)`); `.work-tl__fill` inset grown from `0.375rem` to `0.625rem` so the visible pill stays the same 28px tall (only the invisible hit area grew). Verified: 390px→48px, 1280px→48px, 1920px→54px (was 40/40/45); visible pill height unchanged.
3. **Row-select checkboxes never 44px (P-03).** The native `input.check__box` itself cannot be grown without also growing its visible appearance (Chromium ties a native checkbox's rendered size 1:1 to its layout box — verified by test: `padding` on the input is not respected, `getBoundingClientRect()` stays at the `width`/`height` value regardless of padding/box-sizing). The real target per WCAG 2.5.8 is the associated `<label>`, which `.work-row__select .check` already sized to 44px via an implicit CSS Grid column-collapse; made it explicit and robust (`display: flex; align-items: center; justify-content: center; min-width: var(--target); min-height: var(--target)`) so it no longer depends on the hidden label text collapsing a `1fr` track. Verified: label hit area 44×44 at 390/1280, 49.5×49.5 at 1920 (unchanged numerically, now explicit); visible box still 24px (27px at 1920) — unchanged, as intended. DataTable has no checkboxes; WorkList row `min-height: var(--target)` untouched, no row growth.
4. **Role badge font under 16px at 1920 (P-01).** `.dshell__role` (a `Badge`) inherited `.badge`'s `font-size: 0.75rem`, which is 12px at base scale and only 13.5px at 1920 (`--scale: 1.125`), not the 16px floor. Fix: `.dshell__role { font-size: 0.9375rem; }`. Verified: 1920px computed font-size 16.875px (was 13.5px); base-scale sizes (390/1280) are 15px, which is fine since P-01 only requires ≥16px at 1920+.
5. **"Work" breadcrumb link 42px wide on W-02 (P-03).** Traced to `.page-header__crumbs a` (not the sidebar `.shell-nav__link`, which was already ≥44px in both height and width) — the breadcrumb back-link to Work has `min-height: var(--target)` but no `min-width`, so a short label like "Work" sized to its text + `padding-inline: var(--space-1)` landed at 42.3px. Fix: added `min-width: var(--target)` and `justify-content: center`. Verified on `/ops/work/prj-laureles`: 44px at 390/1280, 49.5px at 1920 (was 42.3px at all three).

No new horizontal overflow (`scrollWidth === clientWidth`) and no console errors at any of the nine width×route combinations checked (390/1280/1920 × Work list, Work timeline, project route).
