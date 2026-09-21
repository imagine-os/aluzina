import { defineSpec, type ActionDef, type PageSpec, type Surface } from '../../specs/PageSpec';

const WIDTHS = [360, 390, 768, 1280, 1920, 2560];

/** Every button, select and submit of the Work views (P-05). Voice speaks these intents. */
export const WORK_ACTIONS: ActionDef[] = [
  { id: 'work.setView', label: 'Switch view', intent: 'show the work as a {view}', permission: 'projects.read', params: { view: 'enum:list|board|timeline|calendar' } },
  { id: 'work.search', label: 'Search tasks', intent: 'find tasks matching {query}', permission: 'projects.read', params: { query: 'string' } },
  { id: 'work.filter', label: 'Filter tasks', intent: 'show only tasks where {field} is {value}', permission: 'projects.read', params: { field: 'enum:assignee|status|priority|due|tag|project|showDone', value: 'string' } },
  { id: 'work.sort', label: 'Sort tasks', intent: 'sort the tasks by {by}', permission: 'projects.read', params: { by: 'enum:order|dueDate|priority|title|assignee|updated' } },
  { id: 'work.groupBy', label: 'Group tasks', intent: 'group the tasks by {by}', permission: 'projects.read', params: { by: 'enum:section|assignee|status|due|project' } },
  { id: 'work.saveView', label: 'Save view', intent: 'save the current view as {name}', permission: 'projects.read', params: { name: 'string' } },
  { id: 'work.applyView', label: 'Apply saved view', intent: 'open my saved view {name}', permission: 'projects.read', params: { name: 'string' } },
  { id: 'work.deleteView', label: 'Delete saved view', intent: 'delete my saved view {name}', permission: 'projects.read', params: { name: 'string' } },
  { id: 'work.addTask', label: 'Add task', intent: 'add a task called {title} to {section}', permission: 'tasks.own.write', params: { title: 'string', section: 'id' } },
  { id: 'work.openTask', label: 'Open task', intent: 'open the task {task}', permission: 'projects.read', params: { task: 'id' } },
  { id: 'work.editTitle', label: 'Rename task', intent: 'rename the task {task} to {title}', permission: 'tasks.own.write', params: { task: 'id', title: 'string' } },
  { id: 'work.assign', label: 'Assign task', intent: 'assign the task {task} to {person}', permission: 'tasks.own.write', params: { task: 'id', person: 'id' } },
  { id: 'work.setDates', label: 'Set dates', intent: 'set the task {task} to start {start} and be due {due}', permission: 'tasks.own.write', params: { task: 'id', start: 'date', due: 'date' } },
  { id: 'work.setStatus', label: 'Set status', intent: 'set the task {task} to {status}', permission: 'tasks.own.write', params: { task: 'id', status: 'enum:todo|doing|blocked|done' } },
  { id: 'work.setPriority', label: 'Set priority', intent: 'make the task {task} {priority} priority', permission: 'tasks.own.write', params: { task: 'id', priority: 'enum:low|normal|high|urgent' } },
  { id: 'work.complete', label: 'Mark complete', intent: 'mark the task {task} complete', permission: 'tasks.own.write', params: { task: 'id' } },
  { id: 'work.moveTask', label: 'Move task', intent: 'move the task {task} to {group}', permission: 'tasks.own.write', params: { task: 'id', group: 'id' } },
  { id: 'work.selectTasks', label: 'Select tasks', intent: 'select the tasks {tasks}', permission: 'projects.read', params: { tasks: 'string' } },
  { id: 'work.bulkUpdate', label: 'Update selected tasks', intent: 'set {field} to {value} on the selected tasks', permission: 'tasks.own.write', params: { field: 'enum:assigneeId|status|dueDate|sectionId', value: 'string' } },
  { id: 'work.setTags', label: 'Set tags', intent: 'tag the task {task} with {tags}', permission: 'tasks.own.write', params: { task: 'id', tags: 'string' } },
  { id: 'work.setDescription', label: 'Edit description', intent: 'describe the task {task}: {text}', permission: 'tasks.own.write', params: { task: 'id', text: 'string' } },
  { id: 'work.addDependency', label: 'Add dependency', intent: 'make the task {task} depend on {dependsOn}', permission: 'tasks.own.write', params: { task: 'id', dependsOn: 'id' } },
  { id: 'work.removeDependency', label: 'Remove dependency', intent: 'remove the dependency of {task} on {dependsOn}', permission: 'tasks.own.write', params: { task: 'id', dependsOn: 'id' } },
  { id: 'work.addSubtask', label: 'Add subtask', intent: 'add the subtask {label} to {task}', permission: 'tasks.own.write', params: { task: 'id', label: 'string' } },
  { id: 'work.toggleSubtask', label: 'Tick subtask', intent: 'tick the subtask {label} of {task}', permission: 'tasks.own.write', params: { task: 'id', label: 'string' } },
  { id: 'work.comment', label: 'Comment', intent: 'comment on the task {task}: {text}', permission: 'projects.read', params: { task: 'id', text: 'string' } },
  { id: 'work.setZoom', label: 'Timeline zoom', intent: 'zoom the timeline to {zoom}', permission: 'projects.read', params: { zoom: 'enum:day|week|month' } },
  { id: 'work.goToday', label: 'Go to today', intent: 'scroll the timeline to today', permission: 'projects.read' },
  { id: 'work.changeMonth', label: 'Change month', intent: 'show the calendar for {month}', permission: 'projects.read', params: { month: 'string' } },
  { id: 'work.toggleGroup', label: 'Collapse or expand group', intent: 'collapse the section {group}', permission: 'projects.read', params: { group: 'id' } },
  { id: 'work.openProject', label: 'Open project work', intent: 'open the work of the project {project}', permission: 'projects.read', params: { project: 'id' } },
];

const COMPONENTS = ['PageHeader', 'WorkHeader', 'WorkList', 'WorkBoard', 'WorkTimeline', 'WorkCalendar', 'TaskDetailDrawer', 'PresenceBar', 'Select', 'Button', 'Badge', 'StatusPill', 'Avatar'];

const LOGIC = [
  'One page for every portal: the surface only changes the shell and the role default (founder: list grouped by project filtered to the "aprobación" tag; ops: timeline; studio: board grouped by status; brand: list filtered to Angélica).',
  'View, filters, sort and grouping are one ViewState; the last state per scope and named saved views persist per user in localStorage `aluzina.views.<userId>` (D-025).',
  'Edits write through the DataProvider with `basedOn = task.updated_at`; a newer stored row is applied last-write-wins and toasted with the other writer (D-024). Other tabs receive the change through BroadcastChannel and re-render (D-023).',
  'canEdit(task): `tasks.manage` edits everything; `tasks.own.write` edits tasks assigned to me or created by me; the rest is read-only with pills instead of editors.',
  'Board moves write the field of the target group (sectionId, status + completedAt, assigneeId, projectId, dueDate); "overdue" cannot receive tasks.',
  'The timeline shows tasks with a start or due date; due-only tasks are milestones; dependency arrows come from dependsOn; dates are edited in the drawer.',
];

export function workSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'W-01',
    name: 'Work',
    purpose: 'The Asana-style project management the team already uses, inside the OS: every task of the studio as a list, board, timeline or calendar, live for everyone, with the role default the person expects (prompt 0004).',
    surface,
    navGroup: 'projects',
    layout: ['PageHeader (project quick-open select)', 'WorkHeader: view tabs, search, filters, sort, group-by, saved views, presence, Add task', 'WorkList | WorkBoard | WorkTimeline | WorkCalendar', 'TaskDetailDrawer'],
    dataTables: ['tasks', 'sections', 'projects', 'comments', 'activity'],
    roles: ['founder', 'ops', 'studio', 'brand'],
    logic: LOGIC,
    components: COMPONENTS,
    actions: WORK_ACTIONS,
    checkedAt: WIDTHS,
  });
}

export function projectWorkSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'W-02',
    name: 'Project work',
    purpose: 'One project in the four Work views: its sections as list groups, board columns and timeline swimlanes, with the project name in the header and a way back to all work.',
    surface,
    layout: ['PageHeader (project name, client, counts; "All work")', 'WorkHeader', 'WorkList | WorkBoard | WorkTimeline | WorkCalendar', 'TaskDetailDrawer'],
    dataTables: ['tasks', 'sections', 'projects', 'comments', 'activity'],
    roles: ['founder', 'ops', 'studio', 'brand'],
    logic: [...LOGIC, 'The project id comes from the route (`/<surface>/work/:projectId`); sections and tasks are filtered to it and new tasks are created in it.'],
    components: COMPONENTS,
    actions: WORK_ACTIONS,
    checkedAt: WIDTHS,
  });
}
