# apps/business-os

The **ALUZINA Business OS prototype**: the Claude Design export, served as a static bundle (D-007) at `/business-os/` under the hub. Live: https://imagine-os.github.io/aluzina/business-os/

- Design content is byte-identical to the export (templates and scripts inside `*.dc.html`, `deck-stage.js`, `doc-page.js`, `image-slot.js`, `.image-slots.state.json`, `.thumbnail`, `assets/`, `screenshots/`). `uploads/` was dropped (duplicates, D-009); its `plan.md` and the SELAV PDF are in `docs/source/claude-design-export/`.
- `support.js` (the generated dc-runtime) carries one `[aluzina]` hunk that points React / ReactDOM / Babel at `vendor/`; each page's `<helmet>` font `<link>` points at `vendor/fonts/` with the Google `preconnect`s removed (D-008). Everything else is as exported.
- `index.html`, `home.html`, `cyber-bridge.html`, `cyber-bridge-deck.html`, `image-generation-plan.html`, `lod-ladder.html` forward to the original filenames (D-010).
- No package.json, no build: the root `npm run build` copies this folder into `dist/business-os/` (`scripts/copy-static.mjs`). Serve it locally with `npm run build && npm run preview` -> `http://localhost:4173/business-os/`.

Read `docs/reference/business-os-export.md` before changing anything here; page docs: `docs/pages/BOS-01.md`, `docs/pages/BOS.md`. Re-exporting from Claude Design: drop the new files in, re-apply the `support.js` patch, run the build.
