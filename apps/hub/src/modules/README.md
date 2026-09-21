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

Modules today: `hub` (HUB-01), `dev` (D-02 components, D-03 specs), `founder` (A-xx), `ops` (O-xx), `studio` (S-xx), `brand` (G-xx). `client` (C-xx) is planned.

## Page codes and paths

| Module | Prefix | Path prefix | Surface | Dashboard | Guard permission (dashboard) |
| --- | --- | --- | --- | --- | --- |
| founder | `A-xx` | `/founder/...` | `founder` | `A-01` `/founder` | `projects.approve` |
| ops | `O-xx` | `/ops/...` | `ops` | `O-01` `/ops` | `schedule.manage` |
| studio | `S-xx` | `/studio/...` | `studio` | `S-01` `/studio` | `design.develop` |
| brand | `G-xx` | `/brand/...` | `brand` | `G-01` `/brand` | `brand.manage` |
| client | `C-xx` | `/client/...` | `client` | `C-01` (planned) | `own.projects.read` |
| dev | `D-xx` | `/dev/...` | `dev` | `D-02` `/dev/components` | `dev.tools` |

Codes are two digits, `01` is the dashboard, then `02..` in the order you build. Taken so far: A-01..A-07, O-01..O-10, S-01..S-09, G-01..G-07 (D-018). Use them in `spec.code`, `docs/pages/<CODE>.md`, `docs/screenshots/<CODE>/`, changelog `codes:` lines and commit bodies.

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

`overview, approvals, projects, sales, schedule, suppliers, money, documents, design, references, brand, competitions, communication, alerts, reports, settings, developer, docs` (labels are `core.nav.<key>`). The DesktopShell sidebar shows the routes of the current surface grouped in this order; under 768 px the first four become the bottom nav and the rest live in the "More" drawer.

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
- **Data**: only through `useTable / useRow / useData`. Entities and fields: `src/data/schema/*.ts`; seeds: `src/data/seed/*.ts`. Writes go by id; lists re-render from `subscribe` events. Do not add entities or seed files in this pass: request them.
- **Components** (P-07): only from `src/components/`; every one is listed with props and a live example at `/#/dev/components`. Pages never hand-roll a table, button, input, modal, card or tooltip. Missing something? Wrap the closest thing in `Placeholder` and request the component.
- **Placeholder** (P-09): any control that does not work yet is `<Placeholder what={t('...')}><Button>…</Button></Placeholder>`: around a `Button` / `<button>` / `<a>` the Placeholder is a span wrapper and the control stays the one tab stop (D-019); around plain content it is itself the button. A route that is not built yet renders `PageStub`. Never leave a control that silently does nothing.
- **Actions** (P-05): every button, menu item and form submit has an entry in `spec.actions` (`<module>.<verb>`, intent phrase, permission, params). Add / remove them in the same commit as the button.
- **Quality bar** (P-01, P-03): works at 360 / 390 / 768 / 1280 / 1920 (record what you verified in `checkedAt`); keyboard order, visible focus (global ring), 44 px targets, nothing hover-only or drag-only; light and dark.

## Docs you write (same turn as the code)

- `docs/pages/<CODE>.md` from `docs/pages/_TEMPLATE.md`, one per page.
- `docs/changelog/_pending/<module>.md`: your changelog draft (files, codes, decisions you propose, requests for shared code). The integrator merges it into the next numbered changelog.
- Screenshots: `docs/screenshots/<CODE>/en-390.jpg`, `en-1280.jpg` (+ `es-390.jpg` for the dashboard) via `npm run screenshots -- --code=<CODE> --route=/ops/quotes --shots=en-390,en-1280` against a local `npm run preview` (open the page as your role: `?as=ops` before the hash).

## Never

- Never run `git` in a parallel module pass (the integrator commits). Never edit files outside your module folder and your docs files. Never edit numbered docs (`decisions.md`, `changelog/NNNN-*.md`, `prompts/`), `kanban.md` or `surfaces.md`: list the changes they need in your `_pending` draft.
