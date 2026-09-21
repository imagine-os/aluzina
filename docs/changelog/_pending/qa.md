# Draft for changelog 0013: module `qa` (Opus 5)

Merged into `docs/changelog/0013-*.md` by the integrator.

- model: Opus 5 (every file in this draft)
- codes: **D-09** actions registry `/dev/actions`, **D-14** design tokens `/dev/tokens`, **D-11** testing hub `/dev/testing` — all surface `dev`, shell `desktop`, permission `dev.tools`, nav orders 30 / 31 / 32, nav groups `developer` (D-09, D-14) and `quality` (D-11).

## Files

New, all inside `apps/hub/src/modules/qa/`:

- `index.ts` — three built routes, no shared file touched (the registry globs the folder).
- `specs.ts` — `actionsSpec` (D-09), `tokensSpec` (D-14), `testingSpec` (D-11); 16 actions declared in total.
- `strings.ts` — 155 keys under `qa.*`, EN and ES complete.
- `ActionsPage.tsx` — D-09; exports `paramSchema()` and `toolJson()` (the `ParamType` -> JSON Schema mapping, reusable by a real WebMCP generator).
- `TokensPage.tsx` — D-14; exports `contrast()` (WCAG 2.1 ratio from two hex values).
- `TestingPage.tsx` — D-11; exports `MATRIX` (the seven widths).
- `copy.ts` — `copyText()` (clipboard with a graceful false) and `downloadText()` (Blob download), shared by D-09 and D-14.
- `qa.css` — tokens only, no literal colours, all sizes in rem.

Docs: `docs/pages/D-09.md`, `docs/pages/D-14.md`, `docs/pages/D-11.md` (from `_TEMPLATE.md`), this draft.

Nothing outside the module folder and these docs was edited. No git was run.

## What is real

- **D-09** joins `declaredActions(useRoutes())` with `useLiveActions()`; 780 declared rows / 285 distinct ids at the time of writing, 7 live while the page is open (its own). Run really calls `runAction(id, params)` through a form generated from `ActionDef.params`; the result or error is shown in the drawer. "Copy as WebMCP tool JSON" and "Export all as JSON" both work (`{ generatedAt, count, actions, tools }`). Exercised end to end in Chromium: opened `qa.openAction`, filled `action = qa.exportActions`, pressed Run, got the readable result back.
- **D-14** reads `src/design/tokens.ts` and derives variable names with the generator's own kebab rule, so it cannot drift from `tokens.css`. Contrast is computed, not asserted. The scale-band preview and the measured root font size are live.
- **D-11** is the matrix over the live route manifest with `specCompleteness()` scores; "Open at 390 / 1280 / 1920" really opens a sized window with `?as=<role>` chosen from the route's spec; the simulator link is a real link when `/dev/simulator` is registered and a `Placeholder` when it is not (it checks the route list rather than assuming).

## What is a Placeholder (P-09)

| Page | Control | Why |
| --- | --- | --- |
| D-14 | "Edit token" (page header) | tokens are edited in `src/design/tokens.ts` and regenerated; a running page has no write path to the repo |
| D-11 | "Load screenshot manifest" (filter bar) | screenshot availability lives in `docs/screenshots/<CODE>/`, which the app cannot read at runtime |
| D-11 | "File a bug" (feedback card) | the `feedback` entity does not exist |
| D-11 | "Open in the demo simulator" (drawer) | only while D-08 `/dev/simulator` is not registered |

`qa.editToken` and `qa.fileBug` are registered on the bus and answer with the not-wired toast, so voice and WebMCP get a readable refusal instead of silence.

**Deliberate deviation, please review:** the brief asked for the D-11 screenshot column to be a `Placeholder` per row. That would add one extra tab stop per route (93 today) for a column that says the same thing in every row. Instead the cells render `—` with a title, the note under the table explains it, and one `Placeholder` above the table carries the future control. Same information, 92 fewer tab stops.

## Requests for shared code (integration pass)

1. **`ParamForm` component** (organism or molecule): D-09's generated form (`ParamType` -> `Input` / `Select` / `Checkbox`) is the same form a voice-confirmation dialog, an MCP call preview and a future admin console all need. `paramSchema()` and `toolJson()` in `ActionsPage.tsx` should move to `src/actions/` when the WebMCP generator is written — they are the canonical mapping today.
2. **`Swatch` component**: the colour swatch on D-14 is the only bespoke visual in this module. A `Swatch` atom (colour, label, value, copy) belongs in the library and would also serve the brand pages.
3. **Shadow tokens**: `tokens.ts` has no `shadow` group. Six elevations are hard-coded — Toast `0 0.5rem 1.5rem rgb(0 0 0 / .25)`, Modal `0 1rem 3rem rgb(0 0 0 / .3)`, Drawer `0 0 3rem rgb(0 0 0 / .3)`, HubHeader (accent glow), DevTools panel and menu. Proposed: `--shadow-sm / md / lg` plus one accent glow.
4. **`feedback` entity** (P-08, step 7): `{ id, pageCode, route, elementPath, kind: 'comment'|'request'|'bug', body, authorId, role, viewportWidth, theme, lang, screenshotUrl?, status, triage?, triageNote?, decisionRef?, created_at, updated_at }`. D-11 will list and filter it; the "File a bug" button becomes real the same day.
5. **Thumbnail / screenshot targets** for the three new codes: `scripts/thumbnails.mjs` and `npm run screenshots` need D-09 `/dev/actions`, D-14 `/dev/tokens`, D-11 `/dev/testing` (as `?as=dev`), plus a build-time manifest of `docs/screenshots/<CODE>/` so D-11's screenshots column can become real.
6. **`DataTable` scroll container a11y**: `.table-wrap` scrolls horizontally but has no `tabindex`/`role`, so a keyboard-only user cannot scroll a wide table (D-11's matrix is the widest in the app). Suggest `tabindex="0"`, `role="region"` and the caption as the accessible name, applied when the table overflows.
7. **`copy.ts`**: if another module needs the clipboard, promote `copyText` / `downloadText` to `src/design/` or a small `src/util/`.

## Decisions proposed

- **A tick in the QA matrix means "recorded in `spec.checkedAt`", never "measured".** D-11 says so in its subtitle. The alternative — inferring a check from a screenshot's existence — would make the matrix lie the first time a screenshot went stale.
- **Dark `accentSoft` needs a matching text colour.** D-14's contrast table found `accentText` (#141210) on `accentSoft` (#4a3a12) at **1.70:1** in dark mode: the light theme's pale wash was inverted to a dark wash without inverting its text colour, so any "soft accent" chip is unreadable in dark. Proposal: in dark, `accentText` for the soft wash should be the light `text` (#f5efe6, 8.1:1) — either a new `accentSoftText` token or a `color-mix` rule. `tokens.ts` is outside this module, so nothing was changed.
- **Light `accent` on `surface` is 3.19:1** — fine for headings and icons, not for 0.75rem badge text. Worth a rule in the design system rather than a token change.
- **Consider raising `specCompleteness`'s `checkedAt` threshold from 3 widths to the full 7** now that the matrix is visible. Today 92 of 93 routes score 9/9 while only 4 have all seven widths recorded, which flatters the number.
- **`qa.runAction` cannot run itself** — a small rule the bus does not enforce, applied at the caller.

## Verified widths

Playwright (Chromium 1194) against `npx vite --port 5182`, `?as=dev`, all three routes at **360, 390, 768, 1280, 1920, 2560, 3840**:

- `document.scrollWidth === clientWidth` at every width on every page (no page-level horizontal overflow).
- Root font size 16 / 16 / 16 / 16 / 18 / 24 / 32 px — the `--scale` bands behave.
- No console errors and no page errors (the only console line is `ERR_CERT_AUTHORITY_INVALID` for the Google Fonts request through the sandbox proxy — environmental, not the app).
- No missing-translation markers in EN or ES; all three pages re-rendered with `aluzina.lang = es` show Spanish throughout.
- Target audit: the only element under 44 px is the native `input.check__box` (24 / 27 / 36 px by band) on the two `Checkbox` filters; its `<label>` measures 44 x 44, which is the WCAG 2.5.8 target and the resolution already recorded in `docs/qa/0001-work-views-matrix.md` (fix 3).
- Interaction: row activation, the generated form and Run were exercised on D-09 at 1280.

`spec.checkedAt` on all three specs is therefore `[360, 390, 768, 1280, 1920, 2560, 3840]`.

## Known issues

- No screenshots committed for D-09 / D-14 / D-11: the module pass ran against `vite`, and `npm run screenshots` wants `npm run preview` (a build), which parallel workers must not run. The integrator should capture them after the merge build.
- D-11's matrix is wider than 1280 with all seven width columns plus EN/ES, spec, placeholders and screenshots: from 768 to roughly 1500 px it scrolls inside `.table-wrap`. Acceptable for a matrix, but see request 6 about making that container keyboard-scrollable.
- D-09 lists one row per (route, action), so an action mounted on four surfaces appears four times; the drawer shows the siblings under "Also declared on". Whether the WebMCP tool list should be per-id is an open question in `docs/pages/D-09.md`.
- `docs/reference/surfaces.md` needs three new routes and 16 new actions, and `docs/kanban.md` needs the D-09 / D-14 / D-11 cards moved; both are numbered / shared docs, so they are listed here rather than edited.
- `npm run build` was not run (the integrator builds). `npx tsc --noEmit` is clean for `src/modules/qa/`; the only error in the tree at the time of writing was `src/modules/founder/LeadsPage.tsx(41,10)` from another worker's in-flight folder.
