# Module contract (`apps/hub/src/modules/<name>/`)

A portal is a **module** of the single hub app (D-014): one Vite build, HashRouter, one folder per module. `src/app/registry.ts` globs `src/modules/*/index.ts`; a module exists by existing. **Nobody edits `registry.ts`, `App.tsx`, `shells.tsx`, `navGroups.ts`, `manifest.ts`, `src/auth/*`, `src/data/*`, `src/components/*`, `src/i18n/core.ts` or another module's files to add a page.** If you need something shared (a nav group, a permission, a component, an entity), write it down in your changelog draft as a request for the integration pass and use `Placeholder` in the meantime.

## Folder layout

```
src/modules/<name>/
  index.ts        exports { routes: RouteDef[], strings: StringTable }   (required)
  specs.ts        defineSpec({...}) per page                             (required: no route without a spec)
  strings.ts      '<name>.<key>': { en, es? }                             (required)
  <Page>.tsx      one component per page (+ <Page>.css, tokens only)
```

Modules today: `hub` (HUB-01), `dev` (D-02 components, D-03 specs, D-04 multiuser), `founder` (A-xx), `ops` (O-xx), `studio` (S-xx), `brand` (G-xx), `work` (W-01 / W-02, mounts the same page on the four portal surfaces, D-021), `spaces` (K-01..K-06, mounts on the four portals and on dev, D-026), `design` (D-12 brand guidelines, D-10 tokens, D-13 textures and effects on its own `design` surface, `design.read` for every role, changelog 0014, D-041). Pass 0013 (planned, one worker each, `docs/plan/plan.json` step 13): `client` (C-01.., `PhoneShell`), `public` (P-01.. services + intake, surface `public`, `bare` shell, no permission, D-035), `manual` (M-01.., surface `manual`), `docs` (D-06, surface `docs`), `qa` (D-11 testing hub, surface `dev`), plus the dev tools D-05 plan viewer / D-07 canvas / D-08 simulator / D-09 actions / D-10 tokens (surface `dev`; a new folder such as `tools/` or `plan/` is fine, the registry globs any `modules/*/index.ts`, so two workers never edit one `index.ts`) and the CRM pipeline + studio checklists pages inside `founder` / `studio`.

## Page codes and paths

| Module | Prefix | Path prefix | Surface | Dashboard | Guard permission (dashboard) |
| --- | --- | --- | --- | --- | --- |
| founder | `A-xx` | `/founder/...` | `founder` | `A-01` `/founder` | `projects.approve` |
| ops | `O-xx` | `/ops/...` | `ops` | `O-01` `/ops` | `schedule.manage` |
| studio | `S-xx` | `/studio/...` | `studio` | `S-01` `/studio` | `design.develop` |
| brand | `G-xx` | `/brand/...` | `brand` | `G-01` `/brand` | `brand.manage` |
| client | `C-xx` | `/client/...` | `client` | `C-01` `/client` (pass 0013) | `own.projects.read` |
| public | `P-xx` | `/services`, `/services/:slug`, `/start` | `public` | `P-01` `/services` (pass 0013) | none (bare shell) |
| manual | `M-xx` | `/manual/...` | `manual` | `M-01` `/manual` (pass 0013) | `manual.read` |
| docs | `D-06` | `/docs/...` | `docs` | `D-06` `/docs` (pass 0013) | `docs.read` |
| dev | `D-xx` | `/dev/...` | `dev` | `D-02` `/dev/components` | `dev.tools` |

Codes are two digits, `01` is the dashboard, then `02..` in the order you build. Taken so far: A-01..A-07, O-01..O-10, S-01..S-09, G-01..G-07 (D-018), W-01..W-02, K-01..K-06, D-02..D-04; reserved by the hub cards for pass 0013: P-01 services + intake, C-01 client app, M-01 manual, D-05 plan viewer, D-06 docs, D-07 canvas, D-08 demo simulator, D-09 actions, D-10 tokens, D-11 testing hub (the hub card goes live when a built route with that code registers). D-12 brand guidelines and D-13 textures and effects are taken by the `design` module (D-10 tokens is that module's page). Next free: A-08, O-11, S-10, G-08, C-02, P-02, M-02, D-14. Nav order: dashboards are `0`, Work is `5`, Spaces is `6` (its Graph / Catalog / Import are `61..63`), module pages start at `10`; the first four by order form the phone bottom nav. Use them in `spec.code`, `docs/pages/<CODE>.md`, `docs/screenshots/<CODE>/`, changelog `codes:` lines and commit bodies.

## Adding a page

```ts
// specs.ts
import { defineSpec } from '../../specs/PageSpec';
export const quotesSpec = defineSpec({
  code: 'O-03',
  name: 'Quotes and comparisons',
  purpose: 'Miguel requests supplier quotes and compares them side by side per comparison group.',
  surface: 'ops',
  navGroup: 'suppliers',                 // key from src/app/navGroups.ts
  layout: ['PageHeader', 'FilterBar (search, status)', 'DataTable of quotes grouped by comparisonGroup', 'Drawer: quote detail'],
  dataTables: ['quotes', 'suppliers', 'projects'],   // entity names from src/data/schema
  roles: ['ops', 'founder'],
  logic: ['Selecting a quote sets status=selected and the others in the group to rejected.'],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'DataTable', 'StatusPill', 'Drawer', 'Button'],
  actions: [
    { id: 'ops.requestQuote', label: 'Request quote', intent: 'request a quote from {supplier} for {item}', permission: 'quotes.request', params: { supplier: 'id', item: 'string' } },
    { id: 'ops.selectQuote', label: 'Select quote', intent: 'select the quote {quote}', permission: 'quotes.compare', params: { quote: 'id' } },
  ],
  checkedAt: [390, 1280],               // widths you actually verified
});

// index.ts
import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { QuotesPage } from './QuotesPage';
import { quotesSpec } from './specs';
export { strings } from './strings';
export const routes: RouteDef[] = [
  // ...dashboard route...
  {
    path: '/ops/quotes',
    code: quotesSpec.code,
    surface: 'ops',
    status: 'built',                    // 'stub' while it is a PageStub
    permission: 'quotes.compare',       // RequireRole checks this; omit only for public pages
    shell: 'desktop',                   // 'phone' for the client app, 'bare' for the hub
    spec: quotesSpec,
    element: createElement(QuotesPage),
    nav: { labelKey: 'ops.nav.quotes', order: 30, glyph: '◇' },   // omit for detail pages not in the menu
  },
];
```

`defineSpec` throws on a missing field or a bad code, so the build's smoke test catches half-written specs. `specCompleteness()` (shown on `/#/dev/specs`) wants: purpose > 20 chars, layout, roles, logic, components, at least one action, `checkedAt` with 3+ widths, `navGroup` when `nav` is set, `status: 'built'`.

## Nav groups (`spec.navGroup`)

`overview, approvals, projects, spaces, sales, intake, schedule, suppliers, execution, money, documents, design, references, brand, competitions, communication, alerts, reports, quality, settings, manual, developer, docs` (labels are `core.nav.<key>`; `intake` = leads and intake, `execution` = execution and site (purchases, change orders, site reports), `quality` = QA / testing hub, `manual` = ops manual; added in 0013). The DesktopShell sidebar shows the routes of the current surface grouped in this order; under 768 px the first four become the bottom nav and the rest live in the "More" drawer.

## Inside a page

```tsx
import { useT } from '../../i18n/I18nProvider';           // const { t, lang } = useT(); t('ops.quotes.title'); every visible string
import { formatCop, formatDate, daysUntil } from '../../i18n/format';
import { useSession, useCan } from '../../auth/SessionProvider';  // const can = useCan(); if (can('quotes.compare')) ...
import { useTable, useRow, useData } from '../../data/DataContext';
//   const { rows, loading } = useTable('quotes', { where: { projectId }, orderBy: 'amountCop' });
//   const data = useData(); await data.update('quotes', id, { status: 'selected' });
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
```

- **Strings** (P-13): `'<module>.<key>': { en, es }`; Spanish where you know it, English fallback otherwise. No hard-coded English in JSX.
- **Permissions**: check with `can('<area>.<verb>')` (list in `src/auth/permissions.ts`); never compare `role`.
- **Data**: only through `useTable / useRow / useData`. Entities and fields: `src/data/schema/*.ts` (0013 adds `services.ts`: `leads`, `engagements`, `revisionItems`, `changeOrders`, `purchases`, `siteReports`, `messages`; `projects.serviceCode / pipelineStatus`); seeds: `src/data/seed/*.ts`. The service model (services, phases, checklist items, pipeline / validation / purchase statuses, governance rules, lead channels, qualification questions, `routeService()`, KPIs) is `src/domain/playbook.ts` (`import { SERVICES, PIPELINE_STATUSES, pick } from '../../domain'`; texts are `{ en, es? }`, render with `pick(text, lang)`). Permissions added in 0013: `leads.manage / read`, `engagements.write / read`, `revisionMatrix.write`, `changeOrders.manage`, `purchases.manage`, `siteReports.write`, `messages.write`, `manual.read`, `docs.read`, `own.revisions.write`. Writes go by id; lists re-render from `subscribe` events, including writes made in another tab (D-023). Pass `{ basedOn: row.updated_at }` to `update` when the edit started from a row the person was looking at (D-024). Task pages should link to the Work views (`/<surface>/work`, `/<surface>/work/:projectId`) instead of building their own task UI (D-021); standing information (procedures, decisions, briefs) is a post in Spaces (`/<surface>/spaces/post/:postId`) filed in the spaces it applies to, and cross-entity links are `relations` rows, not ad hoc fields (D-026); `useWork()` in `src/work/` is the shared task model. Do not add entities or seed files in this pass: request them.
- **Components** (P-07): only from `src/components/`; every one is listed with props and a live example at `/#/dev/components`. Pages never hand-roll a table, button, input, modal, card or tooltip. Missing something? Wrap the closest thing in `Placeholder` and request the component.
- **Placeholder** (P-09): any control that does not work yet is `<Placeholder what={t('...')}><Button>…</Button></Placeholder>`: around a `Button` / `<button>` / `<a>` the Placeholder is a span wrapper and the control stays the one tab stop (D-019); around plain content it is itself the button. A route that is not built yet renders `PageStub`. Never leave a control that silently does nothing.
- **Actions** (P-05, D-036): every button, menu item and form submit has an entry in `spec.actions` (`<module>.<verb>`, intent phrase, permission, params). Add / remove them in the same commit as the button. **Register each one while mounted** so voice, WebMCP and D-09 can run it: `import { useRegisterAction } from '../../actions'; useRegisterAction('ops.selectQuote', ({ quote }) => select(String(quote)));` (or `useRegisterActions({ ... })` for several). Handlers take ids and values, never positions, and return something readable; skip registration with `false` when the person lacks the permission. `runAction(id, params)` and `window.__aluzina.actions.run` are how the outside drives the page.
- **Plan data** (D-037): `import { PLAN, planOrder, planBlockers } from '../../plan'` reads `docs/plan/plan.json` through the `@docs` alias (`@docs/*` -> `docs/*`, vite + tsconfig); other repo docs can be imported the same way (`?raw` for Markdown).
- **Quality bar** (P-01, P-03): works at 360 / 390 / 768 / 1280 / 1920 (record what you verified in `checkedAt`); keyboard order, visible focus (global ring), 44 px targets, nothing hover-only or drag-only; light and dark.

## Docs you write (same turn as the code)

- `docs/pages/<CODE>.md` from `docs/pages/_TEMPLATE.md`, one per page.
- `docs/changelog/_pending/<module>.md`: your changelog draft (files, codes, decisions you propose, requests for shared code). The integrator merges it into the next numbered changelog.
- Screenshots: `docs/screenshots/<CODE>/en-390.jpg`, `en-1280.jpg` (+ `es-390.jpg` for the dashboard) via `npm run screenshots -- --code=<CODE> --route=/ops/quotes --shots=en-390,en-1280` against a local `npm run preview` (open the page as your role: `?as=ops` before the hash).

## Never

- Never run `git` in a parallel module pass (the integrator commits). Never edit files outside your module folder and your docs files. Never edit numbered docs (`decisions.md`, `changelog/NNNN-*.md`, `prompts/`), `kanban.md` or `surfaces.md`: list the changes they need in your `_pending` draft.

## Pass 0013 brief for module workers

The foundation of pass 0013 (shared code every module needs) is summarised in the coordinating session's `scratchpad/foundation-brief-0013.md`; this file is the contract. New in 0013: the entities and permissions above, nav groups `intake / execution / quality / manual`, the actions bus, `@docs`, the hub cards that go live by page code (P-01, C-01, M-01, D-05..D-11), `StatusPill` tones and `core.status.*` strings for every playbook status.
