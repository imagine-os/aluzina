import { defineSpec } from '../../specs/PageSpec';

export const homeSpec = defineSpec({
  code: 'A-01',
  name: 'Founder dashboard',
  purpose: "Alejandra Guerra's home: what waits for her approval, the sales pipeline, quotes and proposals to write, project PDFs, partnerships and product development (docs/knowledge/team.md#alejandra-guerra---founder).",
  surface: 'founder',
  navGroup: 'overview',
  layout: ['PageHeader', 'Stub: one Placeholder card per planned section (approvals, pipeline, quotes, PDFs, partnerships, products)'],
  dataTables: ['projects', 'consistencyChecks', 'quotes', 'documents', 'alerts'],
  roles: ['founder'],
  logic: ['Stub (build plan 9b): every section is a Placeholder until the founder module lands.'],
  components: ['PageStub', 'PageHeader', 'Placeholder', 'Card'],
  actions: [{ id: 'founder.open', label: 'Open founder dashboard', intent: 'open the founder dashboard', permission: 'projects.approve' }],
  checkedAt: [390, 1280],
});
