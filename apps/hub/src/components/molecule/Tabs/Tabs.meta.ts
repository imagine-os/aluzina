import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Tabs',
  tier: 'molecule',
  purpose: 'ARIA tab list with optional counts and a linked panel; arrow keys, Home and End move between tabs.',
  props: { tabs: '{ id, label, count? }[]', value: 'string', onChange: '(id) => void', label: 'string – tablist name', children: 'ReactNode? – panel for the current tab' },
  a11y: ['role=tablist / tab / tabpanel with aria-selected and aria-controls', 'roving tabindex; arrow keys wrap', 'tabs are 44 px tall, list scrolls horizontally on phones instead of wrapping'],
  usages: ['dev components page', 'dev specs page'],
});
