# scripts

Root-level tooling. None of these run inside `npm run build` except `tenant-validate.mjs`, `desk-check.mjs` and
`copy-static.mjs` (the root `build` script chains hub build -> `tenant:validate` -> `desk:check` -> `copy-static`); the
rest are separate `npm run` scripts, run by CI (`thumbs`) or by hand.

| Script | `npm run` | What it does |
| --- | --- | --- |
| `tenant-validate.mjs` | `tenant:validate` (in `build`) | Checks the root `tenant.json` (manifestVersion 1) against the checkout: modules, sub-project paths, content mounts, docs counters, version, namespace literals, and more (tp-03). Plain Node, no browser. |
| `desk-check.mjs` | `desk:check` (in `build`) | Lays out every desk model (a synthetic desk with every object kind, W-04, and every module desk listed in the script's entry) at seven stage widths with the real `layoutDesk()` and fails on any overlap (object / object, object outside its sub-mat, sub-mat / sub-mat, a person's station on a sub-mat, mat / mat) or an object off the grid. Bundles the TS sources in memory with esbuild (installed with Vite); no browser. `--verbose` prints one line per model and width. |
| `copy-static.mjs` | `copy:static` (in `build`) | Copies `apps/business-os/` into `dist/business-os/` and writes `dist/.nojekyll`. |
| `thumbnails.mjs` | `thumbs` | Deploy-time thumbnails: serves `dist/` locally and screenshots every hub-linked card with Playwright Chromium into `dist/thumbs/<code>.jpg` + `manifest.json`. Card list read from `apps/hub/src/tenant/hubCards.data.ts` (tp-07). Runs in `pages.yml` after the build; never commit its output. |
| `screenshots.mjs` | `screenshots` | QA / docs screenshots of one hub page into `docs/screenshots/<CODE>/<lang>-<width>.jpg` + `routes.json`. Demo user per `--as=<role>` read from `apps/hub/src/tenant/auth/demoUsers.ts` (tp-07). |
| `import-asana.mjs` | `import:asana` | Turns the de-identified Asana CSV exports in `docs/source/asana/<date>/` into checked-in seed files under `apps/hub/src/tenant/seed/asana/`. |
| `archive/crawl-dropbox.mjs` | `archive:crawl` | Intake step 1: headless Chromium walks a public Dropbox shared-folder viewer, writes its entries as JSON. |
| `archive/build-index.mjs` | `archive:index` | Intake step 2: crawler output -> redacted `docs/archive/index.json` + per-project indexes. Node, no dependencies. |
| `archive/render-previews.py` | `archive:previews` | Intake step 3: downloads allow-listed files, renders thumbnails / page images into `apps/hub/public/archive/`. Python, third-party deps (`archive/requirements.txt`). |
| `archive/index-collection.py` | `archive:collection` | Indexes a downloaded local tree (the two collections) into `docs/archive/collections/`. Python, third-party deps (`archive/requirements.txt`). |

Both `thumbnails.mjs` and `screenshots.mjs` import tenant `.ts` sources directly under
`node --experimental-strip-types` (the same technique as `apps/hub/scripts/gen-tokens.mjs`); pass
`--list` to either for a dependency-free check of what they resolved (no browser, no `dist/` write).

## Env vars (`tenant.json` `deploy.envVars.scripts`)

| Var | Used by | Default in this container |
| --- | --- | --- |
| `PW_EXECUTABLE` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE` | `thumbnails.mjs`, `screenshots.mjs` | `/opt/pw-browsers/chromium` |
| `HTTPS_PROXY` (`https_proxy`) | `thumbnails.mjs` (external captures only), `screenshots.mjs` (non-`localhost` bases), `crawl-dropbox.mjs` | container's outbound proxy |
| `FFMPEG` | `archive/render-previews.py` | `/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux` |
| `SOFFICE` | `archive/render-previews.py` | `/usr/bin/soffice` |

Chromium, LibreOffice and ffmpeg are preinstalled in this container at the paths above; never run
`playwright install` here.

See also: `docs/tenant/README.md` (the tenant packaging this folder is part of, tp-07 / tp-08),
`archive/README.md` (the archive pipeline specifically).
