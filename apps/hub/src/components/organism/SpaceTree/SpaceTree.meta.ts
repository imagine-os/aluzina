import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'SpaceTree',
  tier: 'organism',
  purpose: 'Unlimited-depth tree of spaces (K-01 / K-02): collapsible nodes marked by the icon of the space kind (SPACE_KIND_ICONS; the seeded Unicode glyph is the fallback for an unknown kind), a post count and a selected state; controlled expansion so the page can search-expand or restore it.',
  props: {
    nodes: 'SpaceTreeNode[] – { id, name, glyph, kind, archived?, count?, children }; kind picks the Icon, glyph is the fallback',
    selectedId: 'string | null',
    onSelect: '(id) => void',
    expanded: 'Record<string, boolean> – controlled',
    onToggle: '(id, open) => void',
    label: 'string – accessible name of the tree',
  },
  a11y: ['role=tree / treeitem with aria-level, aria-expanded, aria-selected, aria-setsize', 'roving tabindex: one tab stop; ArrowUp / ArrowDown move, ArrowRight expands or enters, ArrowLeft collapses or goes to the parent, Home / End, Enter / Space select, a letter jumps to the next match, * expands the level', 'rows are 44 px; the chevron is a pointer shortcut (tabIndex -1) with an aria-label', 'selection uses background + weight, never colour alone; kind tones are on the icon only, and the name is always shown, so the icon is never the only signal (P-03)'],
  usages: ['K-01 Spaces home (left column and the narrow-width drawer)', 'K-02 Space view'],
});
