# 0029 - Desks on every page: the desk system above every portal page, fullscreen and size, trackpad / touch input

- source: Slack #all-aluzina, 2026-09-29 05:06 UTC (thread reply)
- date: 2026-09-29
- requester: Justin Massion
- context: the repo at `622297a` (version 0.21.0, changelog 0035, prompt 0028, D-105), right after the desk light layer was posted in the thread. Built as changelog 0036 (D-106), version 0.22.0.

## Prompt (verbatim)

```
lets start arragning things from the left side bar as desks of their won. Really focus on ease of use and calrity on the componetns and abilities of the objects on the table and stuff.

For each page it should have the desk system at the top, and inorder to not loose old stuff thats there, that stuff can just be lower on the page for now.  make sure we can navigate with our mouse, trackpad touch reallly nicely. and make sure we can go full screen or at least adjust the size of the zoomable canvas
```

## Interpretation

Every page in a portal's left sidebar gets a desk of its own, on top of the page, with the existing page kept unchanged below it. The desk engine of W-04 becomes a platform layer (`apps/hub/src/desk/`) that the DesktopShell mounts on the four portals; each page's desk is derived from its `spec.dataTables` (one mat per table, sub-mats by status, rows as objects) by rule tables, and a module may override its desk by page code (W-04 does: it stays the full-page playbook desk). "Clarity on the components and abilities of the objects": every object has a tooltip (name, kind, record), its drawer lists its fields and its **abilities** (the page's own actions on that row as buttons), and a Legend explains the object kinds and the grouping. "Navigate with mouse, trackpad, touch really nicely": two-finger scroll pans and pinch zooms, a persisted switch makes a mouse wheel zoom, drag has inertia, double-click / double-tap zooms, touch pans and pinches, and a minimap moves the view. "Full screen or adjust the size": a Full screen button (Fullscreen API with a fixed-overlay fallback), S / M / L sizes and a draggable, keyboard-operable height handle, remembered per page.

## Response

Posted in Slack #all-aluzina 2026-09-29 ~06:05 UTC with three screenshots (docs/screenshots/A-08/en-1280-desk.jpg, the A-08 drawer with abilities, docs/screenshots/W-04/en-1280-fullscreen.jpg).

Every page in the four portals now has its own desk on top, with the old page unchanged below: https://imagine-os.github.io/aluzina/#/founder/leads is a good first one, then click around the sidebar (53 pages, all of founder, ops, studio, brand, Work and Spaces).

How a page desk is built: one mat per kind of record the page reads, sub-mats grouped by status, and every record as an object with its real fields on its face. Hover or focus an object for its name and kind. Select it for a drawer with its fields and an Abilities list: every action the page can do with that record, as buttons that run for real. The Legend button explains the object kinds.

Navigation: two-finger scroll pans, pinch or ctrl-scroll zooms, drag pans with a little glide, double-click zooms in, space-drag or middle button pans anywhere. Mouse users who prefer the wheel to zoom flip a switch in the desk settings (it's remembered). Touch: one finger pans, two pinch, double-tap zooms. A minimap sits in the corner.

Size: Full screen button (Esc exits), S / M / L height presets and a drag handle under the canvas, remembered per page. On phones the page desks collapse to a "Show desk" bar so the old page stays usable.

Two things I'd like your eye on: the wheel default (pan, not zoom) and whether S is the right starting height. Logged as prompt 0029, changelog 0036, decision D-106, version 0.22.0; a design doc for the desk system is at docs/design/desk-system.md.

_Fable 5.1 did the architecture and brief, Opus 5.5 built it, Sonnet 5 is doing the page-doc lines, QA matrix and Spanish / dark captures now._
