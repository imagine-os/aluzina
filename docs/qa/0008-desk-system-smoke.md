# QA: the desk system (tp/dk-04) — smoke at 360-3840, ES and dark captures, defect list

date: 2026-09-29
model: Sonnet 5.5 (this pass: matrix from the Opus captures plus a scripted re-measure, ES / dark captures, string and contrast checks)
scope: changelog 0036 (prompt 0029, D-106, version 0.22.0): the page desk mounted above every portal page and the W-04 desk on the same engine. Codes W-04, A-01, A-08, O-12, S-01, G-01, W-01, K-01 at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840, EN light; ES light and EN dark at 390 and 1280 for A-08, O-12, S-01, K-01.
build: local production build of `1169d5e` (`npm ci && npm run build`, version 0.22.0), served by `vite preview` on `:4190`; Playwright 1.56.1 Chromium at `/opt/pw-browsers/chromium`; portal role by `?as=founder|ops|studio|brand` before the hash.
method: (1) the Opus pass's 56 captures (`scratchpad/w04-system/qa/`, EN light) were opened one by one where marked "seen"; (2) every cell was re-measured on the production build by script (a fresh page per cell): horizontal scroll (`scrollWidth - clientWidth`), every toolbar `button` / `select` inside the frame's rectangle (1 px tolerance), buttons at least 44 x 44 px, no mat (`[data-desk-mat]`) entirely outside the stage, mat and sub-mat labels clipped (`scrollWidth > clientWidth`), collapsed bar versus stage below 768, page errors (the sandbox proxy's certificate errors excluded, as in 0006 / 0007).

## Result

- Layout matrix: **56 / 56 cells PASS** on all four checks (0 horizontal scroll, 0 toolbar controls outside the frame, 0 buttons under 44 px, 0 mats out of the stage, 0 page errors). No cell failed.
- Under 768 px (360 / 390) every page desk (A-01, A-08, O-12, S-01, G-01, W-01, K-01) is the collapsed bar with "Show desk" and no stage; W-04 starts open (by design). From 768 px the stage is shown; the minimap appears from 1280 (stages narrower than 480 px have none, as designed).
- New captures: **16** (4 codes x ES light 390 / 1280 and EN dark 390 / 1280), 1.3 MB in all. Phones were captured with the desk opened ("Show desk" clicked) so the desk is visible.
- Defects found (none in layout; strings and small polish): D1..D6 below. No code was changed in this pass.

## Matrix (EN light; PASS = no horizontal scroll, toolbar inside the frame, collapsed / open correct, no clipped mat)

| Code | 360 | 390 | 768 | 1280 | 1920 | 2560 | 3840 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W-04 Method desk (founder) | PASS open (by design), 10 mats (seen); 2 sub-mat labels ellipsised | PASS open (by design), 10 mats; 2 sub-mat labels ellipsised | PASS open (by design), 10 mats (seen); 2 sub-mat labels ellipsised | PASS open, 10 mats; 2 sub-mat labels ellipsised | PASS open, 10 mats; 2 sub-mat labels ellipsised | PASS open, 10 mats; 2 sub-mat labels ellipsised | PASS open, 10 mats (seen); 2 sub-mat labels ellipsised |
| A-01 Founder dashboard | PASS collapsed | PASS collapsed | PASS 6 mats / 86 obj | PASS 6 mats / 86 obj (seen) | PASS 6 mats / 86 obj | PASS 6 mats / 86 obj | PASS 6 mats / 86 obj |
| A-08 Leads | PASS collapsed | PASS collapsed | PASS 3 mats / 46 obj | PASS 3 mats / 46 obj | PASS 3 mats / 46 obj | PASS 3 mats / 46 obj | PASS 3 mats / 46 obj |
| O-12 Purchasing control (ops) | PASS collapsed | PASS collapsed | PASS 3 mats / 46 obj (seen) | PASS 3 mats / 46 obj | PASS 3 mats / 46 obj | PASS 3 mats / 46 obj | PASS 3 mats / 46 obj (seen) |
| S-01 Studio dashboard | PASS collapsed | PASS collapsed | PASS 6 mats / 82 obj; 1 sub-mat label ellipsised | PASS 6 mats / 82 obj; 1 sub-mat label ellipsised | PASS 6 mats / 82 obj; 1 sub-mat label ellipsised | PASS 6 mats / 82 obj (seen); 1 sub-mat label ellipsised | PASS 6 mats / 82 obj; 1 sub-mat label ellipsised |
| G-01 Brand dashboard | PASS collapsed | PASS collapsed | PASS 5 mats / 36 obj | PASS 5 mats / 36 obj | PASS 5 mats / 36 obj | PASS 5 mats / 36 obj | PASS 5 mats / 36 obj |
| W-01 Work (ops) | PASS collapsed | PASS collapsed | PASS 3 mats / 76 obj | PASS 3 mats / 76 obj (seen) | PASS 3 mats / 76 obj | PASS 3 mats / 76 obj | PASS 3 mats / 76 obj |
| K-01 Spaces | PASS collapsed | PASS collapsed | PASS 4 mats / 118 obj | PASS 4 mats / 118 obj | PASS 4 mats / 118 obj (seen) | PASS 4 mats / 118 obj | PASS 4 mats / 118 obj (seen) |

"seen" = the Opus capture was opened and read; the other cells rest on the scripted measure alone. The Opus phone captures (360 / 390) of the page desks show the desk opened, not the default collapsed bar, so the collapsed state of those cells is from the script only. Stage height at 1280 x 900 is 360 px on page desks (S = 40 %) and 540 px on W-04 (M = 60 %), 432 / 576 / 864 px at 1920 / 2560 / 3840 (page desks), as changelog 0036 says. At 3840 the toolbar is one row on all eight codes (fresh capture); the Opus 3840 captures of K-01 and O-12 show "Reset" on a second line, which does not reproduce on the current build (one toolbar row in the script at 1920, 2560 and 3840 for all eight codes).

## New captures (`docs/screenshots/<CODE>/`)

| Code | es-390-desk | es-1280-desk | en-390-dark-desk | en-1280-dark-desk |
| --- | --- | --- | --- | --- |
| A-08 (`/founder/leads`, founder) | PASS, desk opened, all controls in the frame; "Mesa" title, "Ajustar / Inclinada / Ir a un tapete… / Restablecer / Leyenda / P M G" translated | PASS, 3 mats (Leads, Proyectos, Servicios contratados) | PASS, desk opened, dark wood and mats legible | PASS, minimap and handle visible on dark |
| O-12 (`/ops/purchases`, ops) | PASS | PASS, mats Compras / Proyectos / Proveedores | PASS | PASS |
| S-01 (`/studio`, studio) | PASS | PASS, 6 mats, "Matriz de revisión", "Revisiones de coherencia" | PASS | PASS |
| K-01 (`/studio/spaces`, studio) | PASS | PASS, "Espacios / Publicaciones / Archivos / Etiquetas" | PASS | PASS |

On phones (390) the Full screen button shows only its icon (the label is visually hidden under the width where the toolbar wraps, by `desk.css`); it keeps an accessible name. On dark the desk wood turns near black and the mats stay distinguishable from it; the minimap keeps its aqua frame.

## Checks on Spanish and dark

- Toolbar (ES, A-08 / O-12 / S-01 / K-01 at 1280): zoom "Alejar / Acercar", "Ajustar", "Inclinada", "Ir a un tapete…", "Restablecer", "Leyenda", "Mesa pequeña / mediana / grande (40 / 60 / 85 % de la altura de la pantalla)", "Pantalla completa", "Ajustes": all Spanish. Hint line, legend heading ("Qué hay en esta mesa"), the three legend sections ("Objetos (3 tipos)", "Tapetes y subtapetes", "Cómo moverse"), the drawer's captions ("Tipo", "Tipo de registro", "Tapete", "Subtapete", "Se gestiona en", "Habilidades", "Campos (20)"), "Ver en la página" and the tooltip ("Tarjeta · Lead · Lead calificado") are Spanish.
- Tooltip contrast in dark (hover on an object of A-08): the engine inverts the tooltip, background `rgb(242, 242, 242)`, title and meta `rgb(14, 14, 14)`, 14 px, opacity 1: a ratio of about 17:1 (light theme: `rgb(17, 17, 17)` with `rgb(250, 250, 250)`, about 18:1). PASS. The tooltip sits on top of the first mat when the object is near the top edge (clamped to 8 px), it does not clip.

## Defects (recorded, not fixed)

- **D1 (ES strings, drawer)**: the abilities list carries the specs' English labels ("Open lead", "Record the qualification", "Suggest a service", "Advance the lead", "Convert to project"; on K-01 "Open space", "New post", "Edit description", "Archive space"), known and listed in `docs/design/desk-system.md` ("specs carry no `labelKey` yet"). The refusal lines mix languages with raw parameter names ("Requiere question, answer: usa la página de abajo", "Requiere owner: ..."). Field captions that fall back to the column name stay English on A-08 (PROJECT TYPE, and its raw values `residential`, `built`) and on K-01 (ABOUT TYPE, ABOUT ID); descriptions of seeded spaces are English data.
- **D2 (ES legend layout)**: in the legend each kind's name and its sentence run together on one line ("Carpeta Una carpeta que guarda otras cosas...", "Pila Una pila: ..."), with only bold to tell them apart; the same in EN ("Folder A folder holding..."). Reads as a typo; a line break or a dash would do.
- **D3 (labels ellipsised)**: sub-mat labels are cut at 192 px: "Templates & procedures" on W-04 (2 sub-mats), "Approved with adjustments" on S-01 (1). Deliberate ellipsis, but the full text is not available on hover for a label (only objects have the tooltip).
- **D4 (tooltip on focus, not confirmed)**: hover shows the tooltip in every theme and language; a programmatic `focus()` on the first object button did not show it in this run (the keyboard Tab path of changelog 0036 was not re-tested here). To re-check with a real Tab press.
- **D5 (subtitle count vs canvas)**: "219 objects on 3 mats" (A-08), "706 objects on 4 mats" (K-01), "484 objects on 6 mats" (A-01) count the records; the canvas holds at most 12 objects per sub-mat and 40 per mat plus stacks (46 / 118 / 86 object buttons here). The "+ N more" stacks explain it, but the number in the title reads as the objects on the desk.
- **D6 (page below the desk, not the desk)**: K-01 in Spanish keeps the breadcrumb tail "All Roles" in English (`Portal del estudio / Espacios / All Roles`). Old-page string, listed for the string pass.

## Docs agreement

- 53 page docs got a `## Desk (since 0036)` section (A-01..A-09, O-01..O-13, S-01..S-13, G-01..G-09, K-01..K-06, W-01..W-03; W-04 already carried its own). The entity list of each is the page's `dataTables` from its `specs.ts` without the log and join tables the desk never makes a mat of (`activity`, `comments`, `filings`, `relations`); O-13's first entity (`siteReports`) has no grouping field, so its line says so.
- `docs/README.md` and `tenant.json` `docs.counters.qa` move to 8; `npm run tenant:validate` re-confirms them.
