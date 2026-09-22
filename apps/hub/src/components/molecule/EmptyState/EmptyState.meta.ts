import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'EmptyState',
  tier: 'molecule',
  purpose: 'Centered glyph + title + description + actions for empty lists, access denied and not found.',
  props: { title: 'string', description: 'string?', glyph: 'string? – an icon name, a mapped Unicode glyph or text (resolved by glyphNode at size xl, D-064)', children: 'ReactNode? – action buttons' },
  a11y: ['role=status', 'glyph aria-hidden', 'actions are library Buttons'],
  usages: ['RequireRole (unauthorized)', 'DataTable (no rows)', 'Kanban (empty column)', 'Calendar'],
});
