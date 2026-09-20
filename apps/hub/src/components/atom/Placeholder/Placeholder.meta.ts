import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Placeholder',
  tier: 'atom',
  purpose: 'Marks UI that is not wired yet: tooltip on hover/focus, toast on activation, dev-mode outline + badge, data-placeholder.',
  props: { what: 'string (translated) – what the real control will do', className: 'string?', children: 'ReactNode' },
  a11y: ['real <button>, 44 px minimum', 'tooltip linked with aria-describedby and shown on focus, not only hover', 'activation announces via the Toast live region'],
  usages: ['SurfaceCard (planned surfaces)'],
});
