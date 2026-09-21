import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'WorkList',
  tier: 'organism',
  purpose: 'Asana-style task list: collapsible groups (section, assignee, status, due, project), rows with inline title, assignee, due date, status and priority editors, tags, subtask / dependency / comment indicators, multi-select with a bulk bar, inline "Add task" per group.',
  props: {
    label: 'string',
    groups: 'WorkGroup[] – from groupTasks()',
    ctx: 'WorkContext { sections, projects, people, commentCounts, today }',
    sort: 'SortBy',
    canEdit: '(task) => boolean – read-only rows show pills instead of editors',
    canAdd: 'boolean?',
    onOpen: '(task) => void',
    onPatch: '(task, patch) => void | Promise<unknown>',
    onToggleComplete: '(task) => void',
    onAdd: '(group, title) => void?',
    showProject: 'boolean? – project name on rows',
  },
  a11y: ['rows are focusable with an aria-label naming task, status, assignee and due date; ArrowUp / ArrowDown move, Enter opens, Space toggles complete, Shift+Space selects, Shift+arrows extend, Escape clears', 'group headers are buttons with aria-expanded; the bulk bar is a toolbar', 'inline editors are library Select / Input (native, 44 px); the selection checkbox keeps its label for screen readers', 'under 768 px rows become cards: editors appear when a row has focus or is selected; the assignee stays visible', 'nothing hover-only: the open and edit buttons are always rendered (P-03)'],
  usages: ['W-01 Work (List view)', 'W-02 project work'],
});
