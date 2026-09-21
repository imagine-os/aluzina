import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Kanban',
  tier: 'organism',
  purpose: 'Board of columns and cards; cards move with explicit left / right buttons (no drag), columns scroll horizontally.',
  props: { columns: '{ id, title, tone? }[]', cards: '{ id, columnId, title, subtitle?, meta? }[]', label: 'string – board name', onMove: '(cardId, toColumnId) => void?', onActivate: '(card) => void?' },
  a11y: ['role=group with aria-label; each column a section named by its heading', 'move buttons carry "Move {title} to {column}" labels and disable at the ends', 'no drag-only interaction (P-03); phone columns snap at 85vw'],
  usages: ['portal boards (tasks, revisions, quotes)', 'dev components page'],
});
