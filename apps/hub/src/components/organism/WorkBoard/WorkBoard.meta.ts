import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'WorkBoard',
  tier: 'organism',
  purpose: 'Asana-style board: one column per group (sections, or statuses / assignees when grouped so), rich cards (assignee, due with overdue tone, priority, tags, dependency and comment counts), WIP counts, inline "Add task" per column, moves through a "Move to…" select and prev / next buttons.',
  props: {
    label: 'string',
    groups: 'WorkGroup[]',
    ctx: 'WorkContext',
    sort: 'SortBy',
    canEdit: '(task) => boolean',
    canAdd: 'boolean?',
    onOpen: '(task) => void',
    onMove: '(task, toGroup) => void',
    onAdd: '(group, title) => void?',
  },
  a11y: ['role=group with aria-label; each column a section named by its heading, count badge labelled "n tasks"', 'the card body is one button that opens the task; moving is a native select plus labelled prev / next buttons (no drag, P-03)', 'columns snap at 85vw on phones and grow to 24rem at 1920+', 'blocked and done cards are marked with a border tone and the status text on the card, never colour alone'],
  usages: ['W-01 Work (Board view)', 'W-02 project work'],
});
