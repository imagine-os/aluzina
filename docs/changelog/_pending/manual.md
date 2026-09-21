# Draft for changelog 0013: `manual` module — the operations manual (Opus 5)

Merged into `docs/changelog/0013-*.md` by the integrator.

- prompt: 0009 (the founder's Service Delivery Playbook v1.0)
- model: **Opus 5** (module build; foundation by Fable 5.1)
- codes: **M-01** overview, **M-02** general commercial process, **M-03** service 01, **M-04** service 02, **M-05** service 03, **M-06** service E, **M-07** service 04, **M-08** governance / statuses / roles / assets / KPIs
- surface: `manual` (new), shell `desktop`, permission `manual.read` (every role), nav group `manual`

## Files

- `apps/hub/src/modules/manual/index.ts` — 8 routes (`/manual`, `/manual/commercial`, `/manual/services/<slug>` x 5, `/manual/governance`), nav 0 / 10 / 20..24 / 30.
- `apps/hub/src/modules/manual/specs.ts` — `overviewSpec`, `commercialSpec`, `serviceSpec(code)` (one spec per service page), `governanceSpec`.
- `apps/hub/src/modules/manual/strings.ts` — `manual.*`, EN + ES complete.
- `apps/hub/src/modules/manual/parts.tsx` — `PrintButton` (real `window.print()` + the `manual.print` action), `Checklist` (read-only), `SectionHeading`, `focusSection`.
- `apps/hub/src/modules/manual/ManualOverviewPage.tsx`, `ManualCommercialPage.tsx`, `ManualServicePage.tsx`, `ManualGovernancePage.tsx`, `manual.css` (tokens only, incl. the print stylesheet).
- `docs/pages/M-01.md` … `M-08.md`.

## What is real

- **Every word of the manual comes from `src/domain/playbook.ts`** through `pick(text, lang)` — `SERVICES` (phases, grouped items, notes, delivery contents, exclusions, next steps), `CLIENT_JOURNEY`, `SERVICE_LADDER_LOGIC`, `GOVERNANCE_RULES`, `LEAD_CHANNELS`, `LEAD_RECORD_FIELDS`, `COMMERCIAL_FIELDS`, `QUALIFICATION_QUESTIONS`, `routeService()`, `PIPELINE_STATUSES`, `VALIDATION_STATUSES`, `PURCHASE_STATUSES`, `ROLE_RESPONSIBILITIES`, `OPERATIONAL_ASSETS`, `KPIS`, `FINAL_PRINCIPLE`. No copy of the playbook exists in the module; the string tables hold UI chrome only.
- **Print / PDF** on all eight pages: a real `window.print()` plus a print stylesheet that drops the in-page chrome (phase index, links, widget) and keeps cards and checklist items from breaking across pages.
- **Route a client** (M-02) runs the real `routeService()` on every change and shows the suggested service, the follow-on service and the reason. It writes nothing.
- **M-08 derives where each rule is enforced from the live route manifest**: page codes named in `enforcedBy` plus every built menu page whose `spec.dataTables` declares an entity the rule names. Nothing is hard-coded, so a page that disappears stops being claimed.
- Operational assets show the template status of the matching `deliverables` row (5 of the 11 match today).
- Every action is declared in `spec.actions` and registered while mounted (`manual.openService`, `manual.openSection`, `manual.jumpToPhase`, `manual.print`, `manual.routeClient`, `manual.createLead`, `manual.openEnforcingPage`, `manual.openKpiDashboard`).

## Placeholders (P-09)

- **Create lead** (M-02) — points at the founder / ops leads page **A-08** (another worker, this pass). The `manual.createLead` action is registered but fails with `not wired yet: create the lead on the leads page (A-08)` rather than pretending to work.
- **Open KPI dashboard** (M-08) — no KPI dashboard exists; `manual.openKpiDashboard` fails the same way.
- **"No page enforces this yet"** (M-08) — one per governance rule for which no built page declares a matching entity (5 today).

## Requests for shared code (integration pass)

1. **`core.portal.manual` belongs in `src/i18n/core.ts`.** The module defines it as a stop-gap (module strings override core in `registry.ts`). Value used: `{ en: 'Manual', es: 'Manual' }`.
2. **Shell bug: the top bar overflows when the portal name is long.** `.dshell__portal` does not shrink, so at 768 px a 166 px label pushes `.dshell__user` 12 px past the viewport (measured: "Operations manual" 166 px vs "Operations portal" 153 px). The manual's portal string was shortened to "Manual" to dodge it, but **the Spanish labels of the existing portals are longer than the English ones and will hit the same wall** — please give `.dshell__portal` `min-width: 0; overflow: hidden; text-overflow: ellipsis` (or hide it under 900 px).
3. **`Checklist` for the component library** — a read-only / interactive checklist (box glyph + text, grouped sub-headings, optional `checked` and `onToggle`). Four pages here and the studio engagement pages need the same thing; `parts.tsx` holds a local read-only version meanwhile.
4. **`Stepper` for the component library** — numbered horizontal steps that wrap, with an optional current step. M-01 renders the client journey; the intake flow (P-01) and the client app (C-01) want the same.
5. **A print rule in the shells**: `@media print` in `shells.css` should hide the sidebar, top bar and bottom nav. Modules can only hide their own chrome, so a printed page still carries the shell today.
6. **`GovernanceRule.pageCode?: string[]`** in `src/domain/playbook.ts`: the derivation from `enforcedBy` is a good heuristic but a rule should be able to name its enforcing pages.
7. **`deliverables.playbookAssetId`** (or a relation): M-08 matches operational assets to deliverables through a five-entry name lookup in the page; a column would make it data.
8. **Nav group split**: all eight manual pages sit in the `manual` group. If the sidebar gets crowded, a `manual-services` group would separate the five services from the four reference pages.

## Decisions proposed

- **D-0xx (manual is a rendering, never a copy).** No page in `modules/manual/` may hold playbook prose; the founder corrects `docs/knowledge/service-playbook.md` + `src/domain/playbook.ts` and every surface updates at once.
- **D-0xx (a declared action that is not wired fails loudly).** A `Placeholder` control's action is still registered, and its handler throws `not wired yet: <where it will live>`; `runAction` then returns `{ ok: false, error }` instead of a silent success. Better for D-09, voice and WebMCP than an unregistered id (`not-live`, which reads as "wrong page").
- **D-0xx (in-page sections are addressable).** Cross-page section links use `?s=<section>`; the page scrolls that section into view and focuses its heading. No `#anchor` under a HashRouter.

## Verified

- `npx tsc --noEmit` clean (no `npm run build` — the integrator builds).
- Playwright (Chromium, `?as=ops` / `?as=founder`) at **360 / 390 / 768 / 1280 / 1920 / 2560 / 3840**, light and dark, EN and ES: no horizontal page overflow on any of the eight pages, no console errors. `spec.checkedAt` records all seven widths.
- Actions exercised through `window.__aluzina.actions.run`: `manual.openService` (navigates), `manual.openSection` (`/manual/governance?s=statuses`), `manual.jumpToPhase` (`03-11`, `E-5`), `manual.routeClient` (`{ code: '03', then: 'E', reason: … }`), `manual.openEnforcingPage` (`G-04` -> O-11 change orders), `manual.print`, and the two placeholder actions failing with their reason.
- Print media emulated: the phase index and every `.manual-noprint` control are hidden; the 126 checklist items of service 03 still render.

## Known issues / not built

- No screenshots this pass (a preview build collides with the integrator's build). `docs/screenshots/M-01..M-08/` queued.
- The checklists are read-only here; ticking items belongs to the studio engagement page (`engagements.checks`), which is not linked from the manual yet because that route did not exist while this module was written.
- The playbook's Spanish is complete for most entries but falls back to English where the integrator was unsure (D-004); that shows in the manual as English text inside a Spanish page.
- M-08 lists 5 rules with no enforcing page; several of those (G-06, G-12) are enforced by a status transition rather than by a page, which the UI cannot express yet.
