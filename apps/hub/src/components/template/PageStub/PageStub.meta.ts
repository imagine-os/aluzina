import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'PageStub',
  tier: 'template',
  purpose: 'Body of a route with status "stub": PageHeader plus one Placeholder card per planned section, so nothing on screen pretends to work (P-09).',
  props: { code: 'string – page code', title: 'string (translated)', description: 'string (translated)', sections: 'string[] (translated) – planned sections' },
  a11y: ['inherits PageHeader (h1) and Placeholder (button, tooltip on focus, toast on activation)'],
  usages: ['founder / ops / studio / brand stub dashboards'],
});
