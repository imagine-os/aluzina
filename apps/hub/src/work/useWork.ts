import { useCallback, useMemo } from 'react';
import { DEMO_USERS } from '../auth/demoUsers';
import { useSession } from '../auth/SessionProvider';
import { useData, useTable } from '../data/DataContext';
import type { Task, TaskStatus } from '../data/schema';
import { todayIso, type WorkContext, type WorkGroup, type WorkPerson } from './model';

const TEAM_ROLES = ['founder', 'ops', 'studio', 'brand'];

/** Status change with the completedAt bookkeeping. */
export function statusPatch(status: TaskStatus, today: string): Partial<Task> {
  return status === 'done' ? { status, completedAt: today } : { status, completedAt: null };
}

/**
 * Tasks, sections, projects and comment counts for the Work views (W-01 all projects, W-02 one project),
 * plus the writes every view shares. Permissions (D-015, D-020): `tasks.manage` edits everything;
 * `tasks.own.write` edits tasks assigned to me or created by me; everyone with the page reads all.
 */
export function useWork(projectId: string | null) {
  const data = useData();
  const { user, can } = useSession();
  const { rows: tasks, loading } = useTable('tasks', projectId ? { where: { projectId } } : undefined);
  const { rows: sections } = useTable('sections', projectId ? { where: { projectId }, orderBy: 'order' } : { orderBy: 'order' });
  const { rows: projects } = useTable('projects', { orderBy: 'name' });
  const { rows: comments } = useTable('comments', { where: { entity: 'tasks' } });
  const { rows: deliverableRows } = useTable('deliverables', { orderBy: 'name' });
  const today = todayIso();

  const people = useMemo<WorkPerson[]>(() => DEMO_USERS.filter((u) => TEAM_ROLES.includes(u.role)).map((u) => ({ id: u.id, name: u.name, initials: u.initials })), []);

  const deliverables = useMemo(() => deliverableRows.map((d) => ({ id: d.id, name: d.name })), [deliverableRows]);

  const ctx = useMemo<WorkContext>(() => {
    const commentCounts: Record<string, number> = {};
    for (const c of comments) commentCounts[c.entityId] = (commentCounts[c.entityId] ?? 0) + 1;
    return { sections, projects, people, deliverables, commentCounts, today };
  }, [sections, projects, people, deliverables, comments, today]);

  const manage = can('tasks.manage');
  const own = can('tasks.own.write');
  const canEdit = useCallback((task: Task) => manage || (own && (task.assigneeId === user.id || task.createdById === user.id)), [manage, own, user.id]);
  const canAdd = manage || own;

  const patch = useCallback((task: Task, p: Partial<Task>) => data.update('tasks', task.id, p, { basedOn: task.updated_at }), [data]);

  const toggleComplete = useCallback((task: Task) => patch(task, statusPatch(task.status === 'done' ? 'todo' : 'done', today)), [patch, today]);

  const addTask = useCallback(
    (input: { title: string; projectId?: string | null; sectionId?: string | null; status?: TaskStatus; assigneeId?: string; parentTaskId?: string | null }) => {
      const pid = input.projectId === undefined ? projectId : input.projectId;
      const siblings = tasks.filter((x) => x.sectionId === (input.sectionId ?? null));
      return data.create('tasks', {
        projectId: pid,
        sectionId: input.sectionId ?? null,
        title: input.title,
        description: '',
        ownerRole: user.role,
        assigneeId: input.assigneeId ?? user.id,
        createdById: user.id,
        status: input.status ?? 'todo',
        priority: 'normal',
        startDate: null,
        dueDate: null,
        dependsOn: [],
        tags: [],
        subtasks: [],
        completedAt: null,
        order: siblings.reduce((m, x) => Math.max(m, x.order), -1) + 1,
        parentTaskId: input.parentTaskId ?? null,
        deliverableId: null,
        externalId: null,
        templateTaskId: null,
      });
    },
    [data, projectId, tasks, user.id, user.role],
  );

  /** Board move: the target group decides which field changes. Returns false when the group cannot receive tasks. */
  const moveTo = useCallback(
    (task: Task, to: WorkGroup): Promise<unknown> | false => {
      switch (to.key) {
        case 'section':
          return patch(task, { sectionId: to.sectionId ?? null });
        case 'status':
          return to.status ? patch(task, statusPatch(to.status, today)) : false;
        case 'assignee':
          return to.assigneeId ? patch(task, { assigneeId: to.assigneeId }) : false;
        case 'project':
          return to.id === 'none' ? patch(task, { projectId: null, sectionId: null }) : patch(task, { projectId: to.id, sectionId: null });
        case 'due': {
          const shift = (days: number) => {
            const d = new Date(`${today}T12:00:00`);
            d.setDate(d.getDate() + days);
            return d.toISOString().slice(0, 10);
          };
          const due: Record<string, string | null | false> = { today, week: shift(7), month: shift(30), later: shift(45), none: null, overdue: false };
          const v = due[to.id];
          return v === false ? false : patch(task, { dueDate: v ?? null });
        }
        default:
          return false;
      }
    },
    [patch, today],
  );

  return { tasks, loading, ctx, people, canEdit, canAdd, patch, toggleComplete, addTask, moveTo, user, today };
}
