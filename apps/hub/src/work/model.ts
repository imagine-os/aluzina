import type { Tone } from '../components/atom/Badge/Badge';
import type { Priority, Project, Section, Task, TaskStatus } from '../data/schema';
import { daysUntil } from '../i18n/format';

/** The four Asana-style views (D-021). */
export type WorkView = 'list' | 'board' | 'timeline' | 'calendar';
export const WORK_VIEWS: readonly WorkView[] = ['list', 'board', 'timeline', 'calendar'];

export type GroupBy = 'section' | 'assignee' | 'status' | 'due' | 'project';
export const GROUP_BYS: readonly GroupBy[] = ['section', 'assignee', 'status', 'due', 'project'];

export type SortBy = 'order' | 'dueDate' | 'priority' | 'title' | 'assignee' | 'updated';
export const SORT_BYS: readonly SortBy[] = ['order', 'dueDate', 'priority', 'title', 'assignee', 'updated'];

export type DueWindow = '' | 'overdue' | 'today' | 'week' | 'month' | 'none';
export const DUE_WINDOWS: readonly DueWindow[] = ['overdue', 'today', 'week', 'month', 'none'];

export type TimelineZoom = 'day' | 'week' | 'month';

export const STATUSES: readonly TaskStatus[] = ['todo', 'doing', 'blocked', 'done'];
export const PRIORITIES: readonly Priority[] = ['low', 'normal', 'high', 'urgent'];
const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
const STATUS_RANK: Record<TaskStatus, number> = { doing: 0, blocked: 1, todo: 2, done: 3 };

export const PRIORITY_TONES: Record<Priority, Tone> = { low: 'neutral', normal: 'info', high: 'warning', urgent: 'danger' };
export const STATUS_COLUMN_TONES: Record<TaskStatus, Tone> = { todo: 'neutral', doing: 'accent', blocked: 'warning', done: 'success' };

export interface WorkFilters {
  q: string;
  assignee: string;
  status: '' | TaskStatus;
  priority: '' | Priority;
  due: DueWindow;
  tag: string;
  project: string;
  /** Deliverable type the task produces (`deliverables` catalog id); `'none'` = tasks with no deliverable (D-055). */
  deliverable: string;
  showDone: boolean;
}

export const EMPTY_FILTERS: WorkFilters = { q: '', assignee: '', status: '', priority: '', due: '', tag: '', project: '', deliverable: '', showDone: true };

export function activeFilterCount(f: WorkFilters): number {
  return [f.assignee, f.status, f.priority, f.due, f.tag, f.project, f.deliverable].filter(Boolean).length + (f.showDone ? 0 : 1);
}

export interface WorkPerson {
  id: string;
  name: string;
  initials?: string;
}

/** Deliverable type a task produces, as the views need it (`deliverables` catalog, D-055). */
export interface WorkDeliverable {
  id: string;
  name: string;
}

/** Everything a view needs besides the tasks themselves. */
export interface WorkContext {
  sections: Section[];
  projects: Project[];
  people: WorkPerson[];
  /** The deliverable catalog, for the badges and the drawer's Select (D-055). */
  deliverables: WorkDeliverable[];
  /** Comment count per task id. */
  commentCounts: Record<string, number>;
  /** `YYYY-MM-DD`. */
  today: string;
}

export interface WorkGroup {
  id: string;
  key: GroupBy;
  label: string;
  tasks: Task[];
  /** When grouped by section: the section id (null = "no section"). */
  sectionId?: string | null;
  /** When grouped by status: the status. */
  status?: TaskStatus;
  /** When grouped by assignee: the person id. */
  assigneeId?: string;
  tone?: Tone;
}

/** Labels the grouping needs, already translated by the caller (components stay free of i18n keys here). */
export interface GroupLabels {
  noSection: string;
  noProject: string;
  unassigned: string;
  status: (s: TaskStatus) => string;
  due: (w: Exclude<DueWindow, ''> | 'later') => string;
}

export function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function isOverdue(task: Task, today: string): boolean {
  return task.status !== 'done' && task.dueDate !== null && task.dueDate < today;
}

/** Tone for a due date: past is danger, within 3 days warning, done neutral. */
export function dueToneOf(task: Task, today: string): Tone {
  if (task.status === 'done' || !task.dueDate) return 'neutral';
  if (task.dueDate < today) return 'danger';
  const n = daysUntil(task.dueDate, new Date(`${today}T12:00:00`));
  return n <= 3 ? 'warning' : 'neutral';
}

export function dueWindowOf(task: Task, today: string): Exclude<DueWindow, ''> | 'later' {
  if (!task.dueDate) return 'none';
  if (task.dueDate < today) return 'overdue';
  if (task.dueDate === today) return 'today';
  const n = daysUntil(task.dueDate, new Date(`${today}T12:00:00`));
  if (n <= 7) return 'week';
  if (n <= 31) return 'month';
  return 'later';
}

export function filterTasks(tasks: Task[], f: WorkFilters, today: string): Task[] {
  const q = f.q.trim().toLowerCase();
  return tasks.filter((x) => {
    if (!f.showDone && x.status === 'done') return false;
    if (q && !`${x.title} ${x.description} ${x.tags.join(' ')}`.toLowerCase().includes(q)) return false;
    if (f.assignee && x.assigneeId !== f.assignee) return false;
    if (f.status && x.status !== f.status) return false;
    if (f.priority && x.priority !== f.priority) return false;
    if (f.tag && !x.tags.includes(f.tag)) return false;
    if (f.project && (f.project === 'none' ? x.projectId !== null : x.projectId !== f.project)) return false;
    if (f.deliverable && (f.deliverable === 'none' ? x.deliverableId !== null : x.deliverableId !== f.deliverable)) return false;
    if (f.due) {
      const w = dueWindowOf(x, today);
      if (f.due === 'week' && !(w === 'today' || w === 'week')) return false;
      else if (f.due === 'month' && !(w === 'today' || w === 'week' || w === 'month')) return false;
      else if ((f.due === 'overdue' || f.due === 'today' || f.due === 'none') && w !== f.due) return false;
    }
    return true;
  });
}

export function sortTasks(tasks: Task[], sort: SortBy, ctx: WorkContext): Task[] {
  const name = (id: string) => ctx.people.find((p) => p.id === id)?.name ?? '';
  const cmp: Record<SortBy, (a: Task, b: Task) => number> = {
    order: (a, b) => a.order - b.order || (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9'),
    dueDate: (a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'),
    priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9'),
    title: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
    assignee: (a, b) => name(a.assigneeId).localeCompare(name(b.assigneeId)) || a.order - b.order,
    updated: (a, b) => b.updated_at.localeCompare(a.updated_at),
  };
  return [...tasks].sort(cmp[sort]);
}

export function groupTasks(tasks: Task[], groupBy: GroupBy, ctx: WorkContext, labels: GroupLabels): WorkGroup[] {
  const groups: WorkGroup[] = [];
  const byKey = new Map<string, WorkGroup>();
  const push = (id: string, make: () => Omit<WorkGroup, 'id' | 'key' | 'tasks'>, task: Task) => {
    let g = byKey.get(id);
    if (!g) {
      g = { id, key: groupBy, tasks: [], ...make() };
      byKey.set(id, g);
      groups.push(g);
    }
    g.tasks.push(task);
  };

  if (groupBy === 'section') {
    // Every section of the projects in view appears, even when empty, so "Add task" has a home.
    const projectIds = new Set(tasks.map((x) => x.projectId));
    // Project order (by name, as ctx.projects comes sorted), studio-wide sections last, then section order.
    const rank = (pid: string | null) => (pid === null ? ctx.projects.length : Math.max(0, ctx.projects.findIndex((p) => p.id === pid)));
    const sections = ctx.sections.filter((s) => projectIds.has(s.projectId) || projectIds.size === 0).sort((a, b) => rank(a.projectId) - rank(b.projectId) || a.order - b.order);
    const multi = projectIds.size > 1;
    for (const s of sections) {
      const project = multi ? ctx.projects.find((p) => p.id === s.projectId)?.name ?? labels.noProject : null;
      byKey.set(s.id, { id: s.id, key: 'section', label: project ? `${project} · ${s.name}` : s.name, tasks: [], sectionId: s.id });
      groups.push(byKey.get(s.id)!);
    }
    for (const x of tasks) {
      const sec = x.sectionId && byKey.get(x.sectionId);
      if (sec) sec.tasks.push(x);
      else push('none', () => ({ label: labels.noSection, sectionId: null }), x);
    }
    return groups;
  }
  if (groupBy === 'status') {
    for (const s of STATUSES) {
      byKey.set(s, { id: s, key: 'status', label: labels.status(s), tasks: [], status: s, tone: STATUS_COLUMN_TONES[s] });
      groups.push(byKey.get(s)!);
    }
    for (const x of tasks) byKey.get(x.status)!.tasks.push(x);
    return groups;
  }
  if (groupBy === 'assignee') {
    for (const p of ctx.people) {
      byKey.set(p.id, { id: p.id, key: 'assignee', label: p.name, tasks: [], assigneeId: p.id });
      groups.push(byKey.get(p.id)!);
    }
    for (const x of tasks) {
      const g = byKey.get(x.assigneeId);
      if (g) g.tasks.push(x);
      else push('none', () => ({ label: labels.unassigned }), x);
    }
    return groups.filter((g) => g.tasks.length > 0);
  }
  if (groupBy === 'due') {
    const orderOf: (Exclude<DueWindow, ''> | 'later')[] = ['overdue', 'today', 'week', 'month', 'later', 'none'];
    for (const w of orderOf) {
      byKey.set(w, { id: w, key: 'due', label: labels.due(w), tasks: [], tone: w === 'overdue' ? 'danger' : w === 'today' ? 'warning' : 'neutral' });
      groups.push(byKey.get(w)!);
    }
    for (const x of tasks) byKey.get(dueWindowOf(x, ctx.today))!.tasks.push(x);
    return groups.filter((g) => g.tasks.length > 0);
  }
  // project
  for (const p of ctx.projects) {
    byKey.set(p.id, { id: p.id, key: 'project', label: p.name, tasks: [] });
    groups.push(byKey.get(p.id)!);
  }
  for (const x of tasks) {
    const g = x.projectId ? byKey.get(x.projectId) : undefined;
    if (g) g.tasks.push(x);
    else push('none', () => ({ label: labels.noProject }), x);
  }
  return groups.filter((g) => g.tasks.length > 0);
}

/** ---- Nesting (D-055): `parentTaskId` is the real tree; `subtasks` stays the lightweight checklist. ---- */

/** How many children each task has inside `tasks`. */
export function childCounts(tasks: Task[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of tasks) if (x.parentTaskId) out[x.parentTaskId] = (out[x.parentTaskId] ?? 0) + 1;
  return out;
}

/** The tasks of a set whose parent is not in the same set: what the Board and Timeline show. */
export function topLevel(tasks: Task[]): Task[] {
  const ids = new Set(tasks.map((x) => x.id));
  return tasks.filter((x) => !x.parentTaskId || !ids.has(x.parentTaskId));
}

export interface NestedRow {
  task: Task;
  /** 0 for a root of the set, +1 per generation. */
  depth: number;
  /** Children inside the same set. */
  children: number;
  /** True when this row has children and they are hidden. */
  collapsed: boolean;
}

/**
 * Parent-first rows for the List: roots (whose parent is filtered out or absent) sorted by `sort`, each
 * followed by its descendants, indented. `isCollapsed` hides a subtree without dropping the parent row.
 */
export function nestRows(tasks: Task[], sort: SortBy, ctx: WorkContext, isCollapsed: (id: string) => boolean = () => false): NestedRow[] {
  const ids = new Set(tasks.map((x) => x.id));
  const kids = new Map<string, Task[]>();
  for (const x of tasks) {
    if (!x.parentTaskId || !ids.has(x.parentTaskId)) continue;
    const list = kids.get(x.parentTaskId) ?? [];
    list.push(x);
    kids.set(x.parentTaskId, list);
  }
  const out: NestedRow[] = [];
  const walk = (list: Task[], depth: number) => {
    for (const task of sortTasks(list, sort, ctx)) {
      const children = kids.get(task.id) ?? [];
      const collapsed = children.length > 0 && isCollapsed(task.id);
      out.push({ task, depth, children: children.length, collapsed });
      if (children.length > 0 && !collapsed) walk(children, depth + 1);
    }
  };
  walk(topLevel(tasks), 0);
  return out;
}

/** Ancestor titles of a task, outermost first (the drawer breadcrumb "parent \u203a child"). */
export function ancestorTitles(task: Task, byId: Map<string, Task>): string[] {
  const out: string[] = [];
  let cur = task.parentTaskId ? byId.get(task.parentTaskId) : undefined;
  const seen = new Set([task.id]);
  while (cur && !seen.has(cur.id)) {
    out.unshift(cur.title);
    seen.add(cur.id);
    cur = cur.parentTaskId ? byId.get(cur.parentTaskId) : undefined;
  }
  return out;
}

/** The deliverable a task produces, or undefined. */
export function deliverableOf(task: Task, ctx: Pick<WorkContext, 'deliverables'>): WorkDeliverable | undefined {
  return task.deliverableId ? ctx.deliverables.find((d) => d.id === task.deliverableId) : undefined;
}

/** Tasks this one still waits for (dependencies not done). */
export function blockedBy(task: Task, byId: Map<string, Task>): Task[] {
  return task.dependsOn.map((id) => byId.get(id)).filter((d): d is Task => Boolean(d) && d!.status !== 'done');
}

/** Would adding `depId` to `taskId`'s dependencies create a cycle? (depId reaches taskId through dependsOn). */
export function wouldCycle(taskId: string, depId: string, byId: Map<string, Task>): boolean {
  if (taskId === depId) return true;
  const seen = new Set<string>();
  const stack = [depId];
  while (stack.length) {
    const id = stack.pop()!;
    if (id === taskId) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const d of byId.get(id)?.dependsOn ?? []) stack.push(d);
  }
  return false;
}

export function allTags(tasks: Task[]): string[] {
  return [...new Set(tasks.flatMap((x) => x.tags))].sort();
}

/** Subtask progress as `done / total`. */
export function subtaskProgress(task: Task): { done: number; total: number } {
  return { done: task.subtasks.filter((s) => s.done).length, total: task.subtasks.length };
}

/** Human "just now / 5 min ago" helper input: whole minutes between `iso` and now. */
export function minutesAgo(iso: string, now = Date.now()): number {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
}

export function statusRank(s: TaskStatus): number {
  return STATUS_RANK[s];
}
