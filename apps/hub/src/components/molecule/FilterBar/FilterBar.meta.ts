import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'FilterBar',
  tier: 'molecule',
  purpose: 'Toolbar above lists: filters (SearchField, Select, Checkbox) on the left, summary and Clear on the right.',
  props: { children: 'ReactNode – filter controls', onClear: '() => void? – shows Clear filters', summary: 'ReactNode? – e.g. "12 of 40"' },
  a11y: ['role=group with aria-label', 'wraps at phone width, no horizontal scroll', 'Clear is a Button'],
  usages: ['dev components page', 'dev specs page', 'portal list pages'],
});
