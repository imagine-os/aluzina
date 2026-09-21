import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Calendar',
  tier: 'organism',
  purpose: 'Month list view: previous / today / next controls and one block per day with events (meetings, deadlines, deliveries).',
  props: { month: 'YYYY-MM', onMonthChange: '(month) => void', events: '{ id, date, title, meta?, tone? }[]', label: 'string', onSelect: '(event) => void?', today: 'YYYY-MM-DD?' },
  a11y: ['month heading announced with aria-live', 'nav buttons are labelled Buttons', 'events are buttons only when onSelect is set', 'list layout: no grid to squint at on phones or from ten feet'],
  usages: ['portal schedules and competition calendars', 'dev components page'],
});
