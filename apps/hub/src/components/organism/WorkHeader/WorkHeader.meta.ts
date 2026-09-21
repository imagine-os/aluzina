import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'WorkHeader',
  tier: 'organism',
  purpose: 'Toolbar of the Asana-style Work views: List | Board | Timeline | Calendar tabs with counts, search, filters panel (assignee, status, priority, due window, tag, project), sort, group-by, saved views per user and "Add task".',
  props: {
    label: 'string – accessible name',
    state: '{ view, filters, sort, groupBy } (ViewState)',
    onChange: '(partial ViewState) => void',
    counts: '{ list?, board?, timeline?, calendar? } – tab counts',
    people: '{ id, name }[]',
    projects: '{ id, name }[]',
    tags: 'string[]',
    showProjectFilter: 'boolean? (default true)',
    onAddTask: '() => void? – primary button',
    savedViews: 'SavedView[]?',
    onSaveView: '(name) => void? – shows the saved-views select and Save button',
    onApplyView: '(id) => void?',
    onDeleteView: '(id) => void?',
    aside: 'ReactNode? – PresenceBar slot',
  },
  a11y: ['view switcher is the Tabs molecule (roving tabindex, arrows, Home / End)', 'filters panel is a labelled group toggled by a button with aria-expanded / aria-controls', 'every control is a library Select, Input, Checkbox or Button >= 44 px; the save dialog is a Modal with focus trap', 'phone: tabs fill the width in a 4-column grid, tools stack'],
  usages: ['W-01 Work (every portal)', 'W-02 project work'],
});
