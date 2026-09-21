import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'SurfaceCard',
  tier: 'molecule',
  purpose: 'Hub card for one surface: thumbnail of the page it opens, the surface icon + code, status, title, description; a link when live, a Placeholder when planned.',
  props: { code: 'string', title: 'string', description: 'string', status: "'live' | 'stub' | 'planned'", statusLabel: 'string', href: 'string?', external: 'boolean?', onActivate: '() => void? – card becomes a button (portal cards)', ctaLabel: 'string?', image: 'string? – thumbnail URL (./thumbs/<code>.jpg, generated at deploy time, D-011); absent or failed -> bilingual "No preview yet" tile', icon: 'IconName? – surface icon (resolveIcon(code), docs/design/icons.md): sm next to the code, xl inside the empty tile' },
  a11y: ['whole card is one focusable element (link or button)', 'status conveyed by text, not colour alone', 'external links open in a new tab with rel=noreferrer', 'the icon is decorative (aria-hidden): the code, title and description carry the meaning', 'thumbnail has alt "Preview of <title>" via useT(), loading=lazy, fixed 16/10 ratio so nothing shifts; the placeholder tile is aria-hidden (the card text already says it)'],
  usages: ['HubPage (surfaces, prototype pages, portals)'],
});
