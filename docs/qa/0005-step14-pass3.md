# 0005 - Step 14 pass 3 smoke: S-12 / S-13 / P-06 / A-09 / G-08 / K-05 (changelog 0022)

- date: 2026-09-21
- build: version 0.14.0, SEED_VERSION 11, `npm run build` of the integrated tree; `npm run preview` on :4173
- tool: Playwright, Chromium at `/opt/pw-browsers`, headless, light theme, fresh profile per cell (`?as=<role>`), English (P-06 in its default Spanish)
- model: Fable 5.1 (matrix and judgement)
- pass criteria: 0 console errors, 0 failed requests (no response >= 400, no `requestfailed`), 0 px horizontal page overflow, no interactive target under 44 px

## Matrix — 17 / 17 pass

| cell | width | h-overflow | console errors | failed requests | smallest target | what it showed |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| S-12 | 390 | 0 px | 0 | 0 | 44 px | 133 archive images, 186 project links |
| S-12 | 1280 | 0 px | 0 | 0 | 44 px | 133 archive images, 186 project links |
| S-13 2025 casa-rustica | 1280 | 0 px | 0 | 0 | 44 px | 9 archive images, 6 project links |
| S-13 2024 light-alchemy | 1280 | 0 px | 0 | 0 | 44 px | 13 archive images, 6 project links |
| S-13 2022 cabana-amaga | 1280 | 0 px | 0 | 0 | 44 px | 55 archive images, 6 project links |
| S-13 2021 modulos-biotectura | 1280 | 0 px | 0 | 0 | 44 px | 31 archive images, 6 project links |
| S-13 2020 ozaoz | 1280 | 0 px | 0 | 0 | 44 px | 21 archive images, 6 project links |
| S-13 2019-2023 thanal | 1280 | 0 px | 0 | 0 | 44 px | 14 archive images, 6 project links |
| S-13 root life-violeta-villa | 1280 | 0 px | 0 | 0 | 44 px | 8 archive images, 6 project links |
| S-13 2025 proyecto-talita (thumbs only) | 390 | 0 px | 0 | 0 | 44 px | 68 archive images, 6 project links |
| P-06 | 390 | 0 px | 0 | 0 | 44 px | 27 archive images |
| P-06 | 1280 | 0 px | 0 | 0 | 44 px | 27 archive images |
| P-06 | 3840 | 0 px | 0 | 0 | 88 px | 27 archive images |
| A-09 | 1280 | 0 px | 0 | 0 | 24 px | 133 archive images |
| A-09 | 3840 | 0 px | 0 | 0 | 48 px | 133 archive images |
| G-08 | 1280 | 0 px | 0 | 0 | 44 px | 5 archive images |
| K-05 assets | 1280 | 0 px | 0 | 0 | 44 px | 5 archive images |

Notes: the A-09 24 px items are the `check__box` inputs; their `<label>` (the clickable target the library styles) is 44 px tall (133-157 px wide). P-06 at 3840 reports 88 px because the page scales its controls at 4K. S-12 counts 186 distinct project links (the archived folders) and 133 covers.

## S-13 drawer per year (1280, studio) — clicking a file thumbnail

| year | folder | drawer | image shown | HTTP | viewer mode | served renders fetched |
| --- | --- | --- | --- | ---: | --- | ---: |
| 2020 | ozaoz-jinetes-del-horizonte | open | thumbs/…manual-de-identidad-corporativa-02.jpg | 200 | image | 40 / 40 |
| 2021 | modulos-biotectura-para-interiorismo | open | pages/propuesta-aluzina--modulo-page-01.jpg | 200 | pages | 58 / 58 |
| 2022 | cabana-amaga | open | thumbs/modelo-3d--photo-2021-08-27-21-31-02.jpg | 200 | image | 54 / 54 |
| 2024 | light-alchemy | open | thumbs/energy-containers.jpg | 200 | image | 25 / 25 |
| 2025 | casa-rustica-iluminacio | open | – (pages dropped for the 2025 budget; `doc-viewer--none`) | – | none | 8 / 8 |
| 2019-2023 | thanal | open | thumbs/referentes--143ef7….jpg | 200 | image | 27 / 27 |
| root | life-violeta-villa | open | thumbs/referentes-escenografia--download-1.jpg | 200 | image | 11 / 11 |

Every render referenced by those seven indexes answers 200 (223 files). `archive.openFile` through the action bus takes the asset (row) reference, not the raw file name, so the drawer was exercised by clicking.

## Route manifest of the build

`window.__aluzina.routes`: **123 routes**, **1 055 declared action entries**, **403 distinct action ids** (surfaces.md 1.1 / 1.3).

## Found, not fixed

- A PDF whose page renders were dropped by the year budget opens the drawer with nothing to page through (`doc-viewer--none`); a fallback that shows its thumbnail large with "Open at source" is on the kanban.
- The `.field` layout check after `position: relative` (W-03, A-09, O-12, S-13 at 390 / 1280): 0 px overflow, `.field__prefix` offset unchanged at 12 px, every hidden label inside its field.
