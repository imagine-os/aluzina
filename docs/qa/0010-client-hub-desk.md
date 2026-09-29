# QA: client hub desk polish (W-05, D-16) — width x lens x language, targets, keyboard, live frame

date: 2026-09-29
model: Opus 5.5 (fixes, scripts, captures, reading them); review brief Fable 5.1
scope: changelog 0042 (prompt 0030, D-115, version 0.24.1): the seven review findings on the W-05 and D-16 captures of changelogs 0039 / 0040, plus HOY 0.11.1's page groups (`page.group`) as the ALUZINA lens's sub-mats and the refreshed bundled snapshot.
build: local production build of this pass (`npm run build`: tsc strict, Vite, `tenant:validate`, `desk:check` 8 models x 7 widths, 4 809 placements, no overlaps), served with `npm run preview` on `localhost:4173`; Playwright 1.56.1, Chromium headless, DPR 1, light, as the founder demo user (D-16 as dev).
network: `imagine-os.github.io/hoy/` answered from the hoy checkout (read-only) by a Playwright route, the same as `screenshots.mjs --mount`: the built site `../hoy/dist/` (HOY 0.11.1, so the live iframe loads the real app) and the captures `../hoy/docs/screenshots/`. Nothing under `/workspace/hoy` was built or changed.

## Findings and fixes

| # | Finding (review of the 0039 / 0040 captures) | Fix | Checked |
| --- | --- | --- | --- |
| 1 | Subtitle lens-blind ("87 pages on 1 mats, each role seated at its mat" on the standalone lens) | `clienthub.subtitle.<lens>`: ALUZINA "…on 8 mats, each client role seated at its mat", Between Gigs "…on 5 mats, one gig with its surfaces and tools", On its own "…on one mat, as HOY's own hub"; mats, the compact summary, D-16 counts and mat counts pluralised ("one mat" / "un tapete", "1 screen" / "1 pantalla") | matrix column Subtitle: 42 / 42 ok |
| 2 | Standalone lens drew every experience as a desktop screen | one object per experience as its map device: C-01 and S-03 phones, W-01 a fanned `pages` stack (10) with the entry page's `390-full` capture, K-03 / K-02 documents, the rest screens; HUB-01 stays the first screen | `en-1280-standalone.jpg`, `es-1280-standalone.jpg`, `en-3840-standalone.jpg`; aria labels "Phone: C-01 Customer app", "Stack of web pages: W-01 Website", "Phone: S-03 Teacher app" |
| 3 | Toolbar wraps at 1280 on the ALUZINA lens | none in W-05: W-04's toolbar wraps the same way at 1280 (same shared `DeskStage`: camera group 556 px + view group 411 px + gap = 975 px EN, 1 173 px ES, in a 960 px column); one row from 1920 on every lens; a single row at 1280 needs a shared toolbar change (follow-up) | toolbar rows 2 at 1280 on W-04 and W-05 (aluzina, between-gigs), 1 on standalone (no mat select) |
| 4 | Between Gigs: figures and the gig card | figures per mat (the band's primary role by pages owned): Website -> Public, Apps -> Customer (Juliana), Back office -> Admin (Mateo), Build -> Super admin (Sofía), Tools -> Super admin (Sofía). The card (215 px, desk at 740 px of 900) is now a compact strip beside the framing (`Card` padding sm: name, "Gig · v0.11.1 · 13 experiences · 87 pages · 9 tools", Open HoyOS ↗; 94 px), tagline under the framing | desk top at 1280: 620 px EN / 698 px ES (was 740) |
| 5 | 390: header strip, tabs, faces and toolbar fill the first screen | narrow strip (container query 36rem): wordmark + version + "Project prj-hoy" on one line, Reload map a named 44 px icon, three lens tabs on one row (tab padding 8 px); tighter strip and framing gaps below 768; Between Gigs on phones: tagline dropped, Open a named icon | desk top at 390 x 844: 701 px EN / 756 px ES on the ALUZINA lens (was 805); no control hidden, all >= 44 px |
| 6 | Spanish reads machine-made | `lensCopy` (host wording merged over the map per language): "hoy en el estudio ALUZINA", "un tapete por cada rol del cliente", "hoy como gig", "El hub de pruebas de hoy", "Cada superficie agrupada por banda y cada herramienta de prueba, tal como se ven en /#/."; module strings: "Por su cuenta", "Copia local", "con ese rol", "Carga aquí la página real… sin tocar la tuya", "uno al lado del otro", "solo cambia cómo se arma el modelo"; lens builders: "A cargo de …" (was "Es dueña de …" for every role), "más páginas de …", "más pantallas: Reservar", "Afuera: socios, visitantes y profesores", "Construcción: documentación y desarrollo". HOY's role labels untouched | `es-1280.jpg`, `es-1280-between-gigs.jpg`, `es-390.jpg`, `D-16/es-1280.jpg` read |
| 7 | Open live: embed URL and sizing | by code: `embedUrl` substitutes `{baseUrl}`, `{route}`, `{role}` (URI-encoded), `{lang}`, `{theme}` into the map's pattern verbatim; `DEVICE_SIZE` phone 390 x 844, tablet 768 x 1024, desktop / sheet 1280 x 800, page 390 x 1100 (the page scrolls inside the frame); scale = min(1, drawer width / device width). By script (below) and capture `en-1280-open-live.jpg` (C-01 live as Juliana) | 6 / 6 frames |
| + | HOY 0.11.1 publishes `page.group` | `HubGroup` / `HubPage.group?` in the contract; the ALUZINA lens splits an experience with several groups by them (label and order from the map): Customer app Book 10 / Pay 9 / Account 13 / Sign in 5, Admin dashboard Admin 9 / Content 7 / Tables 1 (was two halves); pages without a group fall back to the local split; snapshot replaced by HOY's `public/hub-map.json` 0.11.1 | Tab walk and sub-mat labels below; `desk:check` green |

## Matrix: width x lens x language (W-05 home view)

PASS = the subtitle names the lens's mats and reading, no horizontal page scroll, every visible control outside the zoomed desk at least 44 x 44 px. "Desk in first screen" is informational (the desk frame's top within the viewport minus 60 px; the phone bottom bar covers the last ~75 px at 390).

| Width (viewport) | Lens | Lang | Subtitle | H-scroll | Controls < 44 px | Smallest visible object (px wide) | Toolbar rows | Desk top (px) | Desk in first screen | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 360 x 800 | aluzina | EN | ok | no | 0 | (below fold) | 4 | 732 | yes | PASS |
| 360 x 800 | aluzina | ES | ok | no | 0 | (below fold) | 5 | 964 | no, one scroll | PASS |
| 360 x 800 | between-gigs | EN | ok | no | 0 | (below fold) | 4 | 806 | no, one scroll | PASS |
| 360 x 800 | between-gigs | ES | ok | no | 0 | (below fold) | 5 | 1014 | no, one scroll | PASS |
| 360 x 800 | standalone | EN | ok | no | 0 | (below fold) | 4 | 732 | yes | PASS |
| 360 x 800 | standalone | ES | ok | no | 0 | (below fold) | 4 | 916 | no, one scroll | PASS |
| 390 x 844 | aluzina | EN | ok | no | 0 | 48 | 4 | 701 | yes | PASS |
| 390 x 844 | aluzina | ES | ok | no | 0 | 48 | 4 | 756 | yes | PASS |
| 390 x 844 | between-gigs | EN | ok | no | 0 | (below fold) | 4 | 776 | yes | PASS |
| 390 x 844 | between-gigs | ES | ok | no | 0 | (below fold) | 4 | 806 | no, one scroll | PASS |
| 390 x 844 | standalone | EN | ok | no | 0 | 50 | 3 | 653 | yes | PASS |
| 390 x 844 | standalone | ES | ok | no | 0 | 50 | 4 | 756 | yes | PASS |
| 768 x 1024 | aluzina | EN | ok | no | 0 | 47 | 3 | 794 | yes | PASS |
| 768 x 1024 | aluzina | ES | ok | no | 0 | 47 | 4 | 895 | yes | PASS |
| 768 x 1024 | between-gigs | EN | ok | no | 0 | 48 | 3 | 925 | yes | PASS |
| 768 x 1024 | between-gigs | ES | ok | no | 0 | (below fold) | 4 | 1049 | no, one scroll | PASS |
| 768 x 1024 | standalone | EN | ok | no | 0 | 48 | 2 | 767 | yes | PASS |
| 768 x 1024 | standalone | ES | ok | no | 0 | 48 | 4 | 921 | yes | PASS |
| 1280 x 900 | aluzina | EN | ok | no | 0 | 48 | 2 | 550 | yes | PASS |
| 1280 x 900 | aluzina | ES | ok | no | 0 | 48 | 2 | 626 | yes | PASS |
| 1280 x 900 | between-gigs | EN | ok | no | 0 | 49 | 2 | 620 | yes | PASS |
| 1280 x 900 | between-gigs | ES | ok | no | 0 | 49 | 2 | 698 | yes | PASS |
| 1280 x 900 | standalone | EN | ok | no | 0 | 48 | 1 | 498 | yes | PASS |
| 1280 x 900 | standalone | ES | ok | no | 0 | 48 | 1 | 600 | yes | PASS |
| 1920 x 1080 | aluzina | EN | ok | no | 0 | 65 | 1 | 560 | yes | PASS |
| 1920 x 1080 | aluzina | ES | ok | no | 0 | 65 | 1 | 587 | yes | PASS |
| 1920 x 1080 | between-gigs | EN | ok | no | 0 | 66 | 1 | 615 | yes | PASS |
| 1920 x 1080 | between-gigs | ES | ok | no | 0 | 66 | 1 | 615 | yes | PASS |
| 1920 x 1080 | standalone | EN | ok | no | 0 | 67 | 1 | 560 | yes | PASS |
| 1920 x 1080 | standalone | ES | ok | no | 0 | 67 | 1 | 616 | yes | PASS |
| 2560 x 1440 | aluzina | EN | ok | no | 0 | 87 | 1 | 747 | yes | PASS |
| 2560 x 1440 | aluzina | ES | ok | no | 0 | 87 | 1 | 783 | yes | PASS |
| 2560 x 1440 | between-gigs | EN | ok | no | 0 | 88 | 1 | 820 | yes | PASS |
| 2560 x 1440 | between-gigs | ES | ok | no | 0 | 88 | 1 | 820 | yes | PASS |
| 2560 x 1440 | standalone | EN | ok | no | 0 | 90 | 1 | 747 | yes | PASS |
| 2560 x 1440 | standalone | ES | ok | no | 0 | 90 | 1 | 821 | yes | PASS |
| 3840 x 2160 | aluzina | EN | ok | no | 0 | 119 | 1 | 891 | yes | PASS |
| 3840 x 2160 | aluzina | ES | ok | no | 0 | 119 | 1 | 1043 | yes | PASS |
| 3840 x 2160 | between-gigs | EN | ok | no | 0 | 115 | 1 | 989 | yes | PASS |
| 3840 x 2160 | between-gigs | ES | ok | no | 0 | 115 | 1 | 1093 | yes | PASS |
| 3840 x 2160 | standalone | EN | ok | no | 0 | 122 | 1 | 891 | yes | PASS |
| 3840 x 2160 | standalone | ES | ok | no | 0 | 122 | 1 | 1094 | yes | PASS |

All 42 cells PASS. The desk starts below the first screen on the long Spanish strings at 360 and on Between Gigs at 390 / 768 ES (one scroll; the strip and the framing wrap to more lines); 2560 / 3840 ES wrap the header strip to two rows because the four groups need more than the column (3 832 px of 3 136 at 3840).

## Keyboard and hit targets (script, 1280 EN, ALUZINA lens)

- Tab from the stage: `desk-mat__label` "Customer, 37 screens. Fit this mat" -> `desk-sub__label` "Customer app · Book: 10 objects. Fit this sub-mat" -> `desk-item` "Phone: C-01 Home dashboard (Customer · Customer app · Book). Open" -> C-02 -> C-02b -> C-03 -> C-08 -> C-08b: mats -> sub-mats -> objects, in reading order.
- Enter on the focused object opens its drawer ("C-08b · Cancel or reschedule sheet"); Esc closes it and focus returns to the object (`desk-item`).
- Controls outside the zoomed desk smaller than 44 x 44 px: 0 (every width, lens and language in the matrix).

## Live frame (script, 1280 unless noted)

| Object | Embed URL | Frame | Box in the drawer | Label |
| --- | --- | --- | --- | --- |
| phone C-01 | `https://imagine-os.github.io/hoy/#/app?as=customer&lang=en&theme=light&dev=0&live=0` | 390x844 | 390x844 | 390 × 844 at 100 % |
| desktop M-01 | `https://imagine-os.github.io/hoy/#/admin?as=admin&lang=en&theme=light&dev=0&live=0` | 1280x800 | 847x529 | 1280 × 800 at 66 % |
| page W-02 | `https://imagine-os.github.io/hoy/#/site/about?as=public&lang=en&theme=light&dev=0&live=0` | 390x1100 | 390x1100 | 390 × 1100 at 100 % |
| standalone teacher | `https://imagine-os.github.io/hoy/#/teach?as=teacher&lang=en&theme=light&dev=0&live=0` | 390x844 | 390x844 | 390 × 844 at 100 % |
| standalone site | `https://imagine-os.github.io/hoy/#/site?as=public&lang=en&theme=light&dev=0&live=0` | 390x1100 | 390x1100 | 390 × 1100 at 100 % |
| phone C-01 @390 | `https://imagine-os.github.io/hoy/#/app?as=customer&lang=en&theme=light&dev=0&live=0` | 390x844 | 342x740 | 390 × 844 at 88 % |

The capture `docs/screenshots/W-05/en-1280-open-live.jpg` (repo script: `--route='/founder/clients/hoy/hub?open=C-01' --click='.drawer__foot .btn--primary' --name=open-live` with the two mounts) shows HOY's real customer app signed in as Juliana at 390 x 844, 100 %, inside the drawer. Known gap: nine template routes (`/app/class/:id`, `/site/classes/:slug`, …) open live with the literal placeholder; the map has no sample ids yet.

## Screenshots

W-05: `en|es-390`, `-768`, `-1280`, `-1920`, `-3840`, `en-1280-dark`, `en|es-1280-between-gigs`, `en|es-1280-standalone`, `en-3840-standalone`, `en-1280-open-live`. D-16: `en|es-390`, `-768`, `-1280`, `-1920`, `-3840`. Looked at: W-05 `en-390`, `es-390`, `en-3840`, `es-3840`, `en-1280-standalone`, `es-1280`, `es-1280-between-gigs`, `en-1280-open-live`; D-16 `es-1280`.

## Follow-ups

- Shared desk toolbar on one row at 1280 (both W-04 and W-05): e.g. S / M / L as one select or the Legend inside settings below 1440 (Fable 5.1, shared code).
- Sample ids for template routes in HOY's map, so Open live on C-03, C-04, C-08, … shows a real record.
