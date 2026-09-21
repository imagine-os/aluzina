import { defineSpec } from '../../specs/PageSpec';

export const componentsSpec = defineSpec({
  code: 'D-02',
  name: 'Component library',
  purpose: 'Every library component rendered from its meta with a live example, props, a11y notes and usages, so builders and Justin see the design system in the product (P-07).',
  surface: 'dev',
  navGroup: 'developer',
  layout: ['PageHeader', 'FilterBar (search + tier tabs)', 'One Card per component: live example stage, props KeyValue, a11y list, usages, folder path'],
  dataTables: [],
  roles: ['dev', 'founder'],
  logic: ['Reads src/design/library.ts (glob over *.meta.ts and *.example.tsx); a component without a meta does not exist here, a meta without an example shows a warning badge.', 'Search matches name, purpose and usages; tabs filter by tier.'],
  components: ['PageHeader', 'Tabs', 'SearchField', 'FilterBar', 'Card', 'KeyValue', 'Badge', 'EmptyState'],
  actions: [
    { id: 'dev.searchComponents', label: 'Search components', intent: 'find the component {query}', permission: 'dev.tools', params: { query: 'string' } },
    { id: 'dev.filterTier', label: 'Filter by tier', intent: 'show only {tier} components', permission: 'dev.tools', params: { tier: 'enum:all|atom|molecule|organism|template' } },
  ],
  checkedAt: [390, 1280],
});

export const specsSpec = defineSpec({
  code: 'D-03',
  name: 'Page specs',
  purpose: 'Every registered route with its status, roles, actions and spec completeness; opens a drawer with the full PageSpec and its actions (P-05).',
  surface: 'dev',
  navGroup: 'developer',
  layout: ['PageHeader', 'StatTiles (routes, built, stubs, actions)', 'FilterBar (search + surface select)', 'DataTable of routes', 'Drawer with the selected spec'],
  dataTables: [],
  roles: ['dev', 'founder'],
  logic: ['Reads the registered routes (RoutesContext) and specCompleteness(); the same data as window.__aluzina.routes.', 'Row activation opens the spec drawer; Escape closes it.'],
  components: ['PageHeader', 'StatTile', 'SearchField', 'Select', 'FilterBar', 'DataTable', 'StatusPill', 'Drawer', 'KeyValue', 'Badge'],
  actions: [
    { id: 'dev.openSpec', label: 'Open page spec', intent: 'show the spec of page {code}', permission: 'dev.tools', params: { code: 'string' } },
    { id: 'dev.filterSurface', label: 'Filter by surface', intent: 'show only {surface} pages', permission: 'dev.tools', params: { surface: 'enum:all|hub|founder|ops|studio|brand|client|dev|docs|manual|public' } },
  ],
  checkedAt: [390, 1280],
});
