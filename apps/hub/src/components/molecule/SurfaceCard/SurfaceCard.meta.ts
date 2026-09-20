import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'SurfaceCard',
  tier: 'molecule',
  purpose: 'Hub card for one surface: a link when live, a Placeholder when planned.',
  props: { code: 'string', title: 'string', description: 'string', status: "'live' | 'planned'", statusLabel: 'string', href: 'string?', external: 'boolean?', ctaLabel: 'string?' },
  a11y: ['whole card is one focusable element (link or button)', 'status conveyed by text, not colour alone', 'external links open in a new tab with rel=noreferrer'],
  usages: ['HubPage'],
});
