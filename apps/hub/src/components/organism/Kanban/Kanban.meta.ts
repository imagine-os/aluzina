import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Kanban',
  tier: 'organism',
  purpose: 'Board of columns and cards; cards move with explicit left / right buttons (no drag), columns scroll horizontally.',
  props: { columns: '{ id, title, tone? }[]', cards: '{ id, columnId, title, subtitle?, meta? }[]', label: 'string – board name', onMove: '(cardId, toColumnId) => void?', onActivate: '(card) => void?' },
  a11y: ['role=group with aria-label; each column a section named by its heading', 'move buttons carry "Move {title} to {column}" labels and disable at the ends', 'no drag-only interaction (P-03); phone columns snap at 85vw', 'no <select> inside the scroller: a native select inside a card meta makes the whole document scroll sideways in Chromium at phone widths (seen on A-03, 0013); put selects in the drawer and keep prev / next buttons on the card'],
  usages: ['portal boards (tasks, revisions, quotes)', 'dev components page'],
});
