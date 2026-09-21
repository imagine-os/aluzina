import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'WorkCalendar',
  tier: 'organism',
  purpose: 'Tasks by due date on the library Calendar: one event per dated task with assignee and status, tone from overdue / blocked / done; selecting an event opens the task.',
  props: { label: 'string', tasks: 'Task[]', ctx: 'WorkContext', month: 'YYYY-MM', onMonthChange: '(month) => void', onOpen: '(task) => void' },
  a11y: ['inherits Calendar: month heading with aria-live, labelled prev / today / next buttons, events are buttons', 'tone always paired with the status text in the event meta'],
  usages: ['W-01 Work (Calendar view)', 'W-02 project work'],
});
