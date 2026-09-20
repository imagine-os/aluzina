# Business OS export: what it is, how it runs, what we changed

Digest of `ALUZINA Business OS prototype.zip` (Claude Design export, 288,159,182 bytes, Drive id `1IzePAlouqQ2qBm2yXtzZ6FOL8glALs3h`, ingested 2026-09-20, prompt 0001, changelog 0003). Full inventory at ingest time is summarised here; the files live in `apps/business-os/` and are served at `/business-os/`.

## 1. Shape

- **Static Claude Design (`.dc.html`) bundle, no build step, no package.json.** Each page is an `<x-dc>` HTML template plus an inline `<script type="text/x-dc" data-dc-script>` that `support.js` (the generated dc-runtime, 68 KB) evaluates at load. Template DSL: `<sc-if>`, `<sc-for>`, `{{ }}`, `<helmet>`, `<x-import from="./deck-stage.js">`.
- Runtime loads React 18.3.1, ReactDOM 18.3.1 and @babel/standalone 7.29.0 as UMD scripts (SRI-pinned) and the pages link Google Fonts (Instrument Sans, Instrument Serif, IBM Plex Mono). Custom elements: `deck-stage.js`, `doc-page.js`, `image-slot.js` (reads `.image-slots.state.json`, 16 base64 webp slots).
- Pages: `ALUZINA Business OS.dc.html` (the app, 359 KB), `ALUZINA Home.dc.html` (marketing, videos), `Cyber Bridge.dc.html`, `Cyber Bridge Deck.dc.html` (1920x1080 deck), `Image Generation Plan.dc.html` (printable doc), `LOD Ladder.dc.html`, `Canvas.dc.html` (empty `<x-dc>`, not linked).
- Media: `assets/` 136 MB (6 mp4 = 43 MB, 6 webp renders, `world/` 31 PNG menu and station shots at ~2.5 MB each). `uploads/` (140 MB) held byte-identical duplicates of the same media plus `plan.md` and a 19-page SELAV diagnostic PDF; nothing in the HTML/JS references `uploads/` (grep-verified), so it was dropped and the two documents moved to `docs/source/claude-design-export/` (D-009).
- All paths relative (`./support.js`, `assets/...`, `.image-slots.state.json`); no absolute `/` paths; safe under the `/aluzina/business-os/` sub-path.

## 2. The OS app (BOS-01)

One React component (`class Component extends DCLogic`) with `state.screen`. Screens: home (Cockpit), stations (Assembly line), work (board, table, calendar, timeline, graph), deliverables, qc (Editorial QC), media, ds (Design system), canvas, docs (Docs & changelog), portfolio, pcanvas, wshub (workspaces), wscanvas, render (Render studio), shortcuts. Props (`data-props`): `defaultScreen` enum, `showReadiness`, `showRail`. **No URL routing**: navigation is `this.set('screen', ...)`; the only deep link is the self-embed query `?embed=1&screen=<id>` (`SELF = location.pathname.split('/').pop()`). Light / dark via `[data-theme]`; `?theme=dark` honoured by the runtime.

**i18n**: built in for the OS app only. `T = { en: {...}, es: {...} }` plus ~100 inline `es ? '…' : '…'` branches, toggled by the `EN` / `ES` header button (`state.lang`). Not persisted, no `<html lang>`. Home / Bridge / Deck / Plan / LOD are English-only (Spanish-flavoured seed data). Audit target for step 2 (P-13).

## 3. What we changed (and did not)

Design content is untouched: `deck-stage.js`, `doc-page.js`, `image-slot.js`, `.image-slots.state.json`, `.thumbnail`, `assets/`, `screenshots/` and every template and script inside the `.dc.html` pages are byte-identical to the export. Two metadata-level changes (D-008):

1. **`support.js` patch**, one hunk marked `[aluzina]`: the `src/cdn.ts` constants `REACT_URL`, `REACT_DOM_URL`, `BABEL_URL` point at `./vendor/*.js`; the SRI hashes are unchanged and still enforced (same-origin scripts with `integrity` + `crossorigin=anonymous`). Bytes verified equal to the unpkg originals (SHA-384 match, see `apps/business-os/vendor/README.md`). A fresh export overwrites `support.js`; re-apply the hunk (anchor: `// src/cdn.ts`).
2. **`<helmet>` font links in the six pages** (`ALUZINA Business OS`, `ALUZINA Home`, `Cyber Bridge`, `Cyber Bridge Deck`, `Image Generation Plan`, `LOD Ladder`): the Google Fonts css2 `<link rel="stylesheet">` now points at `./vendor/fonts/instrument-plex-a.css` (OS, Home) or `-b.css` (the four concept pages), and the two `preconnect` links to `fonts.googleapis.com` / `fonts.gstatic.com` are removed (3 lines -> 1 line per page, nothing else). This had to be in the page rather than the runtime because the browser fetches a `<link rel="stylesheet">` inside `<x-dc><helmet>` while parsing the raw document, before `support.js` processes helmets. Result verified: zero requests to unpkg.com, fonts.googleapis.com or fonts.gstatic.com from any page.
2. **URL-safe entry points (D-010)**: `index.html`, `home.html`, `cyber-bridge.html`, `cyber-bridge-deck.html`, `image-generation-plan.html`, `lod-ladder.html` are tiny forwarders (`location.replace` + `<noscript>` meta refresh) to the original space-containing filenames, preserving `?query` and `#hash`. The originals stay the canonical pages so the runtime's self-embed (`SELF`) and sibling fetch (`encodeURIComponent(name) + '.dc.html'`) keep working.
3. **Vendored runtime** in `apps/business-os/vendor/` (3.3 MB JS, 288 KB fonts).
4. **Build**: `scripts/copy-static.mjs` copies the folder into `dist/business-os/` (minus the two READMEs) and writes `dist/.nojekyll` so the dot-files are served.

## 4. Known issues for the audit (step 2)

Export-inherent console noise (present in the original, not introduced here): the browser parses the raw `<x-dc>` template before the runtime hides it, so `<line x1="{{ e2.x1 }}">` logs four "Expected length" errors on the OS page and `<img src="{{ main.shot }}">`-style bindings on Cyber Bridge (3) and Image Generation Plan (2) produce 404s for literal `{{ ... }}` URLs; the Home page's `loop-1.mp4` first range request is aborted by the media element (normal). The OS page's language toggle is a `<div onClick>` (not focusable, P-03).

- Runtime evaluates page scripts with Babel in the browser (3.1 MB babel.min.js): first paint on a phone is slow; a port to the Vite hub (step 3) removes it.
- No hash routing (P-06 addressability): screens are not URL-addressable except via `?embed=1&screen=`.
- Fonts / strings: Home and concept pages are English-only; the OS app's Spanish is inline, not a strings table (P-13).
- `assets/world/*.png` at ~2.5 MB each (93 MB total) need webp / downscaling for mobile budgets (P-01).
- Responsive matrix, inputs (hover-only, drag-only, 44 px) and placeholders not yet audited (P-01, P-03, P-09).
- `Canvas.dc.html` is empty; `screenshots/allspaces*.png` are design references, not used by pages.
