version: 0.2.0
date: 2026-09-20
prompt: 0001
intent: Verify the Business OS prototype live on GitHub Pages and record screenshots of BOS-01 (390 / 1280 / 3840 EN, 1280 ES) and BOS-02 (1280).
decision: D-007, D-008, D-010
rejected: capturing from the local preview (the point is the deployed artifact: dot-files served, vendor paths, forwarders under the sub-path)
files: scripts/screenshots.mjs (arg parser keeps `=` inside values), docs/screenshots/BOS-01/{en-390,en-1280,en-3840,es-1280}.jpg, docs/screenshots/BOS-01/routes.json, docs/screenshots/BOS-02/en-1280.jpg, docs/screenshots/BOS-02/routes.json, docs/changelog/0004-business-os-live-screenshots.md, docs/kanban.md, docs/pages/BOS-01.md, docs/pages/BOS.md
codes: BOS-01, BOS-02
model: Fable 5.1

# 0004 - Business OS prototype live, screenshots

## Verified live

- Pages deploy: workflow run [35543723076](https://github.com/imagine-os/aluzina/actions/runs/35543723076) on 07ffa48, `build` and `deploy` success (runs for be99e19, 5751c24, 7cc8486 were cancelled by the `pages` concurrency group as each later push arrived, as intended).
- https://imagine-os.github.io/aluzina/business-os/ -> HTTP 200 (index.html forwarder, 901 B); `ALUZINA%20Business%20OS.dc.html` 200 (358 KB); `vendor/babel.min.js` 200 (3.1 MB); `.image-slots.state.json` 200 (695 KB); the forwarder lands on `ALUZINA%20Business%20OS.dc.html`, `#dc-root` renders the Cockpit, the EN/ES toggle flips the copy; zero requests to unpkg.com / fonts.googleapis.com / fonts.gstatic.com; dot-files (`.image-slots.state.json`) served thanks to `.nojekyll`.
- https://imagine-os.github.io/aluzina/business-os/home.html -> renders ALUZINA Home with the videos.

## Screenshots

`npm run screenshots -- --base=https://imagine-os.github.io/aluzina/ --static=business-os/ --code=BOS-01 --shots=en-390,en-1280,en-3840,es-1280 --lang-toggle='text="EN"' (exact text; the toggle is a `<div onClick>`)` and `--static=business-os/home.html --code=BOS-02 --shots=en-1280`. Light theme.

## Notes

Export-inherent console noise as recorded in `docs/reference/business-os-export.md` section 4. The step 2 audit starts from these captures.
