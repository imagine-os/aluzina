import { defineSpec } from '../../specs/PageSpec';

export const homeSpec = defineSpec({
  code: 'O-01',
  name: 'Operations dashboard',
  purpose: "Miguel's home: the overall schedule, pending tasks, meetings, supplier follow-ups, quotes and comparisons, deliveries, payments and who owes what, alerts before a situation becomes urgent (docs/knowledge/team.md#miguel---administration-and-operations).",
  surface: 'ops',
  navGroup: 'overview',
  layout: ['PageHeader', 'Stub: one Placeholder card per planned section (schedule, tasks, meetings, suppliers, quotes, deliveries, payments, alerts)'],
  dataTables: ['tasks', 'meetings', 'suppliers', 'quotes', 'deliveries', 'payments', 'documents', 'alerts'],
  roles: ['ops', 'founder'],
  logic: ['Stub (build plan 9b): every section is a Placeholder until the ops module lands.'],
  components: ['PageStub', 'PageHeader', 'Placeholder', 'Card'],
  actions: [{ id: 'ops.open', label: 'Open operations dashboard', intent: 'open the operations dashboard', permission: 'schedule.manage' }],
  checkedAt: [390, 1280],
});
