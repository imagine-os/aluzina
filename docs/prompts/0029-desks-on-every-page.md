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

Posted in Slack after deploy; appended in a follow-up commit.
