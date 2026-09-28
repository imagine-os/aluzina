# scripts/archive

The project-archive intake pipeline (prompt 0017, changelog 0019, D-055..D-059, D-068..D-071,
D-083..D-086): crawl -> index -> render -> collection, run with the `npm run archive:*` scripts.

| Script | Step | What it does |
| --- | --- | --- |
| `crawl-dropbox.mjs` | 1 crawl | Headless Chromium walks a public Dropbox shared-folder viewer and writes its entries as JSON. Read-only, gentle pacing, resumable. |
| `build-index.mjs` | 2 index | Turns crawler output into `docs/archive/index.json` + `docs/archive/projects/<slug>/index.json`, applying the redaction rules R1..R7 (Node, no dependencies). |
| `render-previews.py` | 3 render | Downloads allow-listed files and renders thumbnails / page images into `apps/hub/public/archive/<slug>/{thumbs,pages}` (PyMuPDF, Pillow, LibreOffice, ffmpeg). |
| `index-collection.py` | collections | Indexes a downloaded local tree (the two collections, not a project folder) into `docs/archive/collections/<slug>/{index,sets}.json` + `sheets/`. |

Python deps: `pip install -r scripts/archive/requirements.txt` (`render-previews.py` and
`index-collection.py`; `index-collection.py`'s `pillow-heif` HEIC support is optional).
Tool paths default to the session container: Chromium at `/opt/pw-browsers/chromium`
(env `PW_EXECUTABLE`), LibreOffice at `/usr/bin/soffice` (env `SOFFICE`), ffmpeg under
`/opt/pw-browsers/` (env `FFMPEG`); never run `playwright install` here.

## Tenant package

This folder is part of the `archive` sub-project in `tenant.json` `subProjects[]` (kind `pipeline`,
status `done`; paths also cover `docs/archive`, `apps/hub/public/archive`; codes S-12, S-13, G-09, A-09,
P-06). Full entry: `docs/tenant/sub-projects.md`; the served data's own readme: `docs/archive/README.md`.
