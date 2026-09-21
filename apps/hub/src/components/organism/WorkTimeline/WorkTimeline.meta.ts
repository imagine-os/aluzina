import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'WorkTimeline',
  tier: 'organism',
  purpose: 'Gantt of tasks grouped by section: bars from startDate to dueDate, milestone diamonds for due-only tasks, today line, Day | Week | Month zoom, dependency arrows from dependsOn, overdue / blocked / done tones, sticky task column and axis; list with mini bars under 768 px.',
  props: { label: 'string', groups: 'WorkGroup[]', ctx: 'WorkContext', sort: 'SortBy', zoom: "'day' | 'week' | 'month'", onZoom: '(zoom) => void', onOpen: '(task) => void – dates are edited in the drawer' },
  a11y: ['bars are buttons with a label naming the task and its dates; arrows / Home / End move between bars, Enter opens', 'zoom is a group of ToggleButtons (aria-pressed); "Go to today" scrolls the chart', 'the chart scrolls inside its own container (max-height), the page never scrolls sideways; task names and dates are text in the sticky left column, never only geometry', 'milestones and short bars keep a 44 px target around a smaller visible mark; tones always pair with the status shown in the drawer', 'no drag-only interaction (P-03): bar dates change in the TaskDetailDrawer'],
  usages: ['W-01 Work (Timeline view, default for operations)', 'W-02 project work'],
});
