version: 0.6.1
date: 2026-09-21
prompt: 0004 follow-up
intent: Fix the five 44px-target / 16px-font defects QA found in the Work views matrix (docs/qa/0001-work-views-matrix.md) without changing visuals beyond enlarging hit areas.
decision: none (mechanical a11y fixes, no new component contracts)
rejected: resizing the native checkbox `<input>` itself to 44px (Chromium ties a native checkbox's rendered appearance 1:1 to its layout box, so padding/box-sizing tricks don't create a bigger invisible hit area without also enlarging the visible box — verified with a standalone Playwright test); instead the wrapping `<label>` (`.check`), already reaching 44px via an implicit grid-column collapse, was made an explicit flex box.
files: apps/hub/src/components/organism/WorkHeader/WorkHeader.css, apps/hub/src/components/organism/WorkTimeline/WorkTimeline.css, apps/hub/src/components/organism/WorkList/WorkList.css, apps/hub/src/components/molecule/PageHeader/PageHeader.css, apps/hub/src/app/shells.css, docs/qa/0001-work-views-matrix.md, docs/changelog/0010-qa-fixes-targets.md, docs/kanban.md
codes: W-01, W-02, HUB shell
model: Sonnet 5

# 0010 - Target-size and font-size fixes from the Work views QA pass

Five mechanical accessibility defects, all found by the QA responsive/Spanish matrix (docs/qa/0001-work-views-matrix.md) on `/ops/work` and `/ops/work/prj-laureles`: four target-size (P-03, <44px) and one font-size (P-01, <16px at 1920+) violation. No component contracts or visuals changed beyond enlarging tap/click targets; see docs/qa/0001-work-views-matrix.md's new **Fixes** section for the full before/after measurements.

1. **View tabs (P-03).** `.work-header .tabs__tab` shaved 4px off the `Tabs` molecule's `min-height: var(--target)`; removed the override so the switcher clears 44px at every scale.
2. **Timeline bars (P-03).** `.work-tl__bar` was inset 4px inside its 48px row (40px hit area); it now fills the full row height, with `.work-tl__fill`'s inset grown to keep the visible pill the same 28px tall.
3. **Row-select checkboxes (P-03).** The native `<input class="check__box">` can't be grown without also growing the visible widget (browsers size a native checkbox's appearance to its own layout box, ignoring padding). The correct target is the wrapping `<label class="check">`, which was already 44px via an implicit CSS Grid collapse; that's now an explicit `display: flex` box with `min-width`/`min-height: var(--target)`, so it no longer depends on the hidden label text collapsing a grid track.
4. **Shell role badge font (P-01).** `.dshell__role` inherited the `Badge` atom's 0.75rem, landing at 13.5px at 1920 (`--scale: 1.125`); given its own `font-size: 0.9375rem`, which clears 16px at 1920+.
5. **"Work" breadcrumb link (P-03).** Not the sidebar nav (already compliant) but `.page-header__crumbs a`, the back-link rendered in W-02's breadcrumb: it had `min-height` but no `min-width`, so the short label "Work" sized to text + padding landed at 42px. Added `min-width: var(--target)`.

## Verification

Playwright (Chromium 1194) over `npm run preview --port 4180`, re-measuring all five elements at 390 / 1280 / 1920 on `/ops/work?as=ops` (List and Timeline views) and `/ops/work/prj-laureles?as=ops`: all five now meet their thresholds at every width checked (see docs/qa/0001-work-views-matrix.md Fixes section for the full numbers). No new horizontal overflow, no console errors. `npm run build` green before push.
