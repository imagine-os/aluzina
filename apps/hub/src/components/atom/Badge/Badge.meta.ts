import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Badge',
  tier: 'atom',
  purpose: 'Small uppercase label with a tone (neutral / accent / success / warning / danger / info) and an optional status dot.',
  props: { tone: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'", dot: 'boolean? – leading dot', children: 'ReactNode' },
  a11y: ['text always present: tone is never the only signal', 'inline, no interaction'],
  usages: ['StatusPill', 'DesktopShell (role badge)', 'DataTable', 'Kanban'],
});
