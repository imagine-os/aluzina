import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Skeleton',
  tier: 'atom',
  purpose: 'Loading shimmer for text lines, blocks or circles while useTable() is loading.',
  props: { lines: 'number? (default 1)', width: 'string?', height: 'string?', circle: 'boolean?' },
  a11y: ['role=status with a translated "Loading" label', 'bars aria-hidden', 'animation off under prefers-reduced-motion'],
  usages: ['DataTable (loading)', 'dev components page'],
});
