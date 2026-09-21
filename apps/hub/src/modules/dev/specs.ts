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
    { id: 'dev.filterSurface', label: 'Filter by surface', intent: 'show only {surface} pages', permission: 'dev.tools', params: { surface: 'enum:all|hub|founder|ops|studio|brand|client|dev|design|docs|manual|public' } },
  ],
  checkedAt: [390, 1280],
});

export const multiuserSpec = defineSpec({
  code: 'D-04',
  name: 'Multiuser',
  purpose: 'QA aid for the realtime seam (D-023): how to open two tabs as two demo users, who is present right now (presence channel) and the last 20 activity rows written by the provider, with a reset of the demo data.',
  surface: 'dev',
  navGroup: 'developer',
  layout: ['PageHeader', 'Card: how to test (steps, open-as buttons, channel names, reset)', 'Card: presence (PresenceBar + DataTable)', 'Card: last 20 activity rows (DataTable)'],
  dataTables: ['activity', 'tasks'],
  roles: ['dev', 'founder'],
  logic: ['Presence comes from usePresence() (BroadcastChannel aluzina-presence, 5 s heartbeat, 15 s expiry).', 'Activity is the provider log: one row per changed field per update, capped at 500 rows.', 'Reset drops aluzina.data and re-seeds; every tab receives the reset through the data channel.'],
  components: ['PageHeader', 'Card', 'KeyValue', 'Button', 'PresenceBar', 'DataTable', 'Badge'],
  actions: [
    { id: 'dev.openAs', label: 'Open a tab as a role', intent: 'open a new tab as {role}', permission: 'dev.tools', params: { role: 'enum:founder|ops|studio|brand' } },
    { id: 'dev.resetData', label: 'Reset demo data', intent: 'reset the demo data to the seeds', permission: 'dev.tools' },
  ],
  checkedAt: [390, 1280],
});
