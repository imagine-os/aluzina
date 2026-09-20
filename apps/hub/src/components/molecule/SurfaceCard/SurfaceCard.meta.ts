import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'SurfaceCard',
  tier: 'molecule',
  purpose: 'Hub card for one surface: thumbnail of the page it opens, code, status, title, description; a link when live, a Placeholder when planned.',
  props: { code: 'string', title: 'string', description: 'string', status: "'live' | 'planned'", statusLabel: 'string', href: 'string?', external: 'boolean?', ctaLabel: 'string?', image: 'string? – thumbnail URL (./thumbs/<code>.jpg, generated at deploy time, D-011); absent or failed -> bilingual "No preview yet" tile' },
  a11y: ['whole card is one focusable element (link or button)', 'status conveyed by text, not colour alone', 'external links open in a new tab with rel=noreferrer', 'thumbnail has alt "Preview of <title>" via useT(), loading=lazy, fixed 16/10 ratio so nothing shifts; the placeholder tile is aria-hidden (the card text already says it)'],
  usages: ['HubPage'],
});
