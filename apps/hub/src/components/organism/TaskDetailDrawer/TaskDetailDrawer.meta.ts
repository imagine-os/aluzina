import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'TaskDetailDrawer',
  tier: 'organism',
  purpose: 'Task detail in a Drawer: title, description, section, assignee, start / due dates, status, priority, tags, dependencies with cycle prevention, subtasks checklist, comments thread (comments entity), activity trail (activity entity) and Mark complete; every write goes through the DataProvider with basedOn.',
  props: { taskId: 'string | null – null closes', onClose: '() => void', canEdit: '(task) => boolean – read-only mode otherwise', ctx: '{ sections, projects, people, today }', allTasks: 'Task[] – dependency candidates (same project)' },
  a11y: ['inherits Drawer: role=dialog, focus trap, Escape closes, focus returns to the opener', 'every field is a labelled library Input / Select / Textarea / Checkbox; read-only users see disabled controls and a notice', 'dependencies that would create a cycle are disabled options and toast when attempted', 'activity lines read "name changed field · when" plus from -> to in words, never only colour'],
  usages: ['W-01 Work', 'W-02 project work', 'O-03 (link "Open in Work")'],
});
