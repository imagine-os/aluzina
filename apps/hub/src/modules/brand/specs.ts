import { defineSpec } from '../../specs/PageSpec';

export const homeSpec = defineSpec({
  code: 'G-01',
  name: 'Brand dashboard',
  purpose: "Angélica's home: the 2027 competitions calendar by submission date, sales presentations, brand identity rules, client image sets, the graphic revisions queue and the asset library (docs/knowledge/team.md#angelica---graphic-design-and-communication).",
  surface: 'brand',
  navGroup: 'overview',
  layout: ['PageHeader', 'Stub: one Placeholder card per planned section (competitions, presentations, identity, images, revisions, assets)'],
  dataTables: ['competitions', 'presentations', 'brandAssets', 'revisions', 'alerts'],
  roles: ['brand', 'founder'],
  logic: ['Stub (build plan 9b): every section is a Placeholder until the brand module lands.'],
  components: ['PageStub', 'PageHeader', 'Placeholder', 'Card'],
  actions: [{ id: 'brand.open', label: 'Open brand dashboard', intent: 'open the brand dashboard', permission: 'brand.manage' }],
  checkedAt: [390, 1280],
});
