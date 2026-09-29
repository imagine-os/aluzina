# QA: desk render quality (dk-05) — pages x zooms x DPR x theme x language, frame times before / after

date: 2026-09-29
model: Opus 5.5 (scripts, captures, reading them)
scope: changelog 0038 (prompt 0031, D-107, version 0.22.1): the desk engine's depth order, text rasterisation, gestures and the QA 0008 polish defects. Codes W-04 (Method desk), A-08 (Leads), O-12 (Purchasing control), K-04 (Spaces graph, the biggest page desk: 183 objects).
build: local production build of this pass (`npm ci && npm run build`), served statically on `127.0.0.1`; Playwright 1.56.1, Chromium 1194 headless (software compositor, no GPU), 1280 x 900, stage at 60 % (M on W-04).
method: per cell a fresh context (`deviceScaleFactor`, `colorScheme`, `aluzina.lang` / `aluzina.theme`), then `desk.zoom` to 25 / 50 / 100 / 200 / 400 % (1 s settle each) and, per zoom: (a) the world's transform is a pure translation on whole device pixels (`|tx x dpr - round| < 0.02`, scale 1) and the world is at rest; (b) no element that joins the 3D context (preserve-3d, or transformed with a preserve-3d parent) has `overflow` other than visible, any `contain`, or a `filter`; (c) no sub-mat name clipped (`scrollHeight > clientHeight`); (d) no horizontal page scroll. Then `desk.fit`, focus the stage and press Tab (real key presses) until an object is focused: the tooltip must be a portal on `body`. Page errors counted (proxy certificate noise excluded). DPR 2 captures at 100 % and 400 % saved and looked at.

## Matrix (PASS = a, b, c, d at all five zooms + tooltip on Tab + 0 errors)

| Code | DPR 1 light EN | DPR 1 light ES | DPR 1 dark EN | DPR 1 dark ES | DPR 2 light EN | DPR 2 light ES | DPR 2 dark EN | DPR 2 dark ES |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| W-04 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| A-08 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| O-12 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| K-04 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

32 / 32 cells, 160 zoom states. Notes: a first run with a 450 ms settle caught W-04 still moving at three zooms in four cells (the 220 ms zoom flight takes longer at DPR 2 on the software compositor); with a 1 s settle every cell passes, and a direct check found no stuck state. While reading the code for it, a real one was fixed: a press that interrupted an inertia glide left the world marked as moving (and, with this pass, inert to the pointer); a press now commits first.

Layout checks from 0008 re-run on the build: 0 elements with overflow / contain / filter in the 3D context on W-04, A-08, O-12, K-04, S-01, K-01; 0 clipped sub-mat names (two-line labels); toolbars at 1920 / 2560 / 3840 on one row for K-01, O-12, A-08, W-04 in EN and ES; under 768 px page desks are the collapsed bar, W-04 open.

## Frame times (ms, `requestAnimationFrame` deltas, median of 6 runs; p50 / p95)

120 wheel events over 2 s at the stage centre (ctrl + wheel = zoom in then out; plain wheel = pan both axes), or 120 mouse moves with the button down (drag). W-04 follows Casa Laureles (22 light tiles) with the trail playing.

| Desk | Gesture | Before 0.22.0 | After 0.22.1 |
| --- | --- | --- | --- |
| K-04 (183 objects) | zoom | 16.7 / 50.0 | 16.7 / 33.4 |
| K-04 | pan | 16.7 / 16.8 | 16.7 / 16.8 |
| K-04 | drag | 16.7 / 33.4 | 16.7 / 33.3 |
| W-04 (168 objects, followed, trail playing) | zoom | 16.7 / 50.1 | 16.7 / 41.7 |
| W-04 | pan | 33.3 / 50.0 | 16.7 / 16.7 |
| W-04 | drag | 41.7 / 50.1 | 16.7 / 16.8 |
| A-08 (46 objects) | zoom | 16.7 / 16.8 | 16.7 / 16.8 |
| A-08 | pan | 16.7 / 16.8 | 16.7 / 16.7 |
| A-08 | drag | 16.7 / 16.7 | 16.7 / 16.8 |

Compositor layers (CDP LayerTree): K-04 1 148 -> 567; W-04 followed 831 -> 460.

## Captures looked at (scratchpad, not committed)

W-04 tilted at fit (24 %), 100 %, 300 %, 320 % DPR 2 (folders, checklists, rule card: crisp; front faces show the paper edge), W-04 flat 300 % (pixel-sharp), W-04 following Casa Laureles (current mat's rings whole on all four sides, halo under the coin, done mats tinted), A-08 fit, the "+ 7 more" pile at 200 % and 404 % DPR 2 (three sheets, no z-fight), O-12 fit, K-04 fit and 150 % (folders with their front face), the ES drawer (Spanish abilities), the ES legend (name line, description line), S-01 sub-mat label tooltip, W-04 dark DPR 2 at 120 % and 400 % (coins crisp).

## Not covered

- A GPU machine (the numbers are the software compositor's; a laptop GPU gives more headroom on the zoom commit frame).
- Safari / Firefox 3D sorting (Chromium only in this container).
- Device objects (phone, tablet, screen, page, pages; changelog 0037) are not on any desk yet; their solids render on the bodies layer like the others (checked by code, not on screen).
