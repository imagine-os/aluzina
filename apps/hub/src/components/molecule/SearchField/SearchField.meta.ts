import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'SearchField',
  tier: 'molecule',
  purpose: 'Search input (type=search, hidden label, glyph prefix) with a clear button.',
  props: { value: 'string', onChange: '(value) => void', label: 'string? (default core.search.label)', placeholder: 'string?' },
  a11y: ['role=search wrapper', 'label present but visually hidden', 'clear button is a 44 px Button with aria-label'],
  usages: ['FilterBar', 'dev components page', 'dev specs page'],
});
