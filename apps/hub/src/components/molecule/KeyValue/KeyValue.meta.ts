import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'KeyValue',
  tier: 'molecule',
  purpose: 'Definition list for detail views: uppercase label over value, 1 to 3 columns from 768 px.',
  props: { items: '{ key: string, value: ReactNode }[]', columns: '1 | 2 | 3 (default 2)' },
  a11y: ['semantic <dl>/<dt>/<dd>', 'null values render an em dash'],
  usages: ['dev specs page', 'detail drawers in portals'],
});
