import { defineSpec } from '../../specs/PageSpec';

export const homeSpec = defineSpec({
  code: 'S-01',
  name: 'Studio dashboard',
  purpose: "Sarai's home: design proposals per project, references, mood boards and material palettes, plans, furniture and material schedules, render and supplier packs, measurements, the consistency check before work reaches the founder (docs/knowledge/team.md#sarai---interior-design).",
  surface: 'studio',
  navGroup: 'overview',
  layout: ['PageHeader', 'Stub: one Placeholder card per planned section (proposals, references, palettes, plans, schedules, renders, checks)'],
  dataTables: ['projects', 'references', 'materials', 'schedules', 'renderPacks', 'consistencyChecks', 'tasks'],
  roles: ['studio', 'founder'],
  logic: ['Stub (build plan 9b): every section is a Placeholder until the studio module lands.'],
  components: ['PageStub', 'PageHeader', 'Placeholder', 'Card'],
  actions: [{ id: 'studio.open', label: 'Open studio dashboard', intent: 'open the studio dashboard', permission: 'design.develop' }],
  checkedAt: [390, 1280],
});
