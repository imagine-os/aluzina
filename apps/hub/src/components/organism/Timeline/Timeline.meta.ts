import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Timeline',
  tier: 'organism',
  purpose: 'Rows with date-range bars on a shared month axis, today marker and dependency indicator (list under the label, marker on the bar).',
  props: { rows: '{ id, label, start, end, dependsOn?, tone?, meta? }[]', label: 'string', today: 'YYYY-MM-DD? (default now)', onActivate: '(row) => void? – bars become buttons' },
  a11y: ['role=group with aria-label', 'dates and dependencies are text next to each bar, never only geometry', 'bars are buttons only when onActivate is set; label above bar under 768 px'],
  usages: ['portal schedules', 'plan viewer (later)', 'dev components page'],
});
