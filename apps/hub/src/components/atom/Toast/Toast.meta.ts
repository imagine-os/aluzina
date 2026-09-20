import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Toast',
  tier: 'atom',
  purpose: 'Transient status message; `toast(msg)` from anywhere, `<Toaster/>` mounted once.',
  props: { message: 'string (via toast())' },
  a11y: ['role=status + aria-live=polite so screen readers announce it', 'never the only feedback for a destructive action'],
  usages: ['Placeholder', 'App'],
});
