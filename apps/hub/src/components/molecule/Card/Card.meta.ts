import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Card',
  tier: 'molecule',
  purpose: 'Surface with optional header (title, subtitle, actions), body and footer; can be one big button via onActivate.',
  props: { title: 'ReactNode?', subtitle: 'ReactNode?', actions: 'ReactNode?', footer: 'ReactNode?', raised: 'boolean?', onActivate: '() => void? – whole card is a button', 'aria-label': 'string? – with onActivate', padding: "'none' | 'sm' | 'md'", children: 'ReactNode?' },
  a11y: ['section by default; a real <button> when onActivate is set', 'title is an h3: place under a page h1/h2', 'actions stay separate buttons (never nested in the button variant)'],
  usages: ['StatTile', 'PageStub', 'Kanban (cards)', 'dev components page'],
});
