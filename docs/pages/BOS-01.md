# BOS-01 - ALUZINA Business OS (prototype)

- route: `/business-os/` (forwards to `/business-os/ALUZINA%20Business%20OS.dc.html`); deep link `?embed=1&screen=<id>`
- surface: business-os
- status: built (static Claude Design bundle, D-007)
- spec: none yet; the page is not a hub module. `docs/reference/business-os-export.md` is the spec until step 3 gives it a `PageSpec`.
- model: Claude Design (original); Fable 5.1 (ingest, vendoring, entry points)

## Purpose

The owner-facing prototype of the Aluzina operations system as designed in Claude Design: a workspace shell with a rail, cockpit, assembly-line stations, work views (board, table, calendar, timeline, graph), deliverables, editorial QC, media library, design system, canvases, docs and changelog, portfolio, render studio. It is the seed for the customer and staff surfaces (build plan steps 2-5) and is served unchanged so the audit compares like with like.

## Screenshots

`docs/screenshots/BOS-01/en-390.jpg`, `en-1280.jpg`, `en-3840.jpg`, `es-1280.jpg` (live site, light theme), plus `routes.json`.

## Layout (top to bottom)

1. Header: workspace name, breadcrumb, search, `EN` / `ES` toggle, theme, user.
2. Icon rail (left) with the screens; nested sidebar per screen (`showRail`).
3. Main: the current `state.screen` (default `home`, the Cockpit: readiness, stations, today's work, media, docs).
4. Overlays: command palette, shortcuts sheet, embedded previews (`?embed=1&screen=`).

## Data

Seed data inline in the page script (Spanish-flavoured brand, stations, tasks, media, docs). No storage, no persistence across reloads.

## Rules

None recorded yet; `docs/source/claude-design-export/plan.md` (Docs 1-7) is the business intent behind the screens.

## Logic

- Navigation is React state (`this.set('screen', id)`); no hash routing.
- Language: `state.lang` toggled by the header button; strings come from a `T = { en, es }` dictionary plus inline `es ? … : …` branches. Not persisted; independent of the hub's `aluzina.lang`.
- Theme: `[data-theme]` on the root, `?theme=dark` honoured by the runtime.
- Runtime: `support.js` parses the `<x-dc>` template, loads React / ReactDOM / Babel from `./vendor/` (D-008), evaluates the page script, mounts at `#dc-root`. Fonts from `./vendor/fonts/instrument-plex-a.css`.
- Language toggle is a `<div onClick>` labelled `EN` / `ES` (title = language name): works with mouse and touch, not focusable (P-03 audit item).

## Actions (P-05)

Not declared yet (the prototype has no `PageSpec`). Observable actions to register in step 3: `bos.openScreen(screen)`, `bos.setLang(lang)`, `bos.toggleTheme`, `bos.openPalette`, `bos.switchWorkspace(id)`, plus the per-screen actions (board card move, QC verdicts, media upload).

## Components

None from the hub library; the export has its own inline components (rail, cards, tables, board, calendar, timeline, graph, palette) and custom elements (`image-slot`, `doc-page`, `deck-stage`). Inventory for the library migration is part of step 2.

## Real vs mock / placeholder

Everything is mock: inline seed data, no backend, uploads and saves are visual only. Nothing is wrapped in `Placeholder` yet (P-09 audit item).

## Responsive and input check (P-01, P-03)

Captured at 390 / 1280 / 3840 on the live site; not yet audited against the matrix or the input rules. Known: desktop-first layout, Babel-in-browser startup cost, ~2.5 MB PNGs in `assets/world/`.

## Strings (P-13)

Inline `{ en, es }` dictionary inside the page, EN and ES both present for the OS app; no strings table, no `<html lang>`.

## Open questions

- Port to the Vite hub as modules (step 3) vs keep as a static bundle (D-007 today).
- Default language (D-004).
- Which of the 15 screens map to the customer app vs the staff dashboard.
