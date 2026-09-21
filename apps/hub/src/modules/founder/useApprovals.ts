import { useCallback, useMemo } from 'react';
import { useSession } from '../../auth/SessionProvider';
import { toast } from '../../components/atom/Toast/Toast';
import { useData, useTable } from '../../data/DataContext';
import type { ConsistencyCheck, Project } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';

/** Projects the founder still has to decide on (the studio handed them over). */
export const WAITING_APPROVALS = ['awaiting-founder', 'in-check'] as const;
/** Projects she already decided on, newest decision first. */
export const DECIDED_APPROVALS = ['changes-requested', 'approved', 'client-approved'] as const;

export interface ApprovalEntry {
  project: Project;
  check: ConsistencyCheck | null;
}

/**
 * The approval chain of A-02, reused by the A-01 dashboard card so a decision taken in either
 * place writes exactly the same rows (roles-and-portals.md, "Approval chain").
 */
export function useApprovals() {
  const { t } = useT();
  const data = useData();
  const { user } = useSession();
  const { rows: projects, loading } = useTable('projects', { orderBy: 'dueDate' });
  const { rows: checks } = useTable('consistencyChecks');
  const { rows: alerts } = useTable('alerts');

  const checkFor = useMemo(() => {
    const map = new Map<string, ConsistencyCheck>();
    for (const c of checks) map.set(c.projectId, c);
    return map;
  }, [checks]);

  const waiting = useMemo<ApprovalEntry[]>(
    () =>
      projects
        .filter((p) => (WAITING_APPROVALS as readonly string[]).includes(p.approval))
        .sort((a, b) => (a.approval === b.approval ? 0 : a.approval === 'awaiting-founder' ? -1 : 1))
        .map((project) => ({ project, check: checkFor.get(project.id) ?? null })),
    [projects, checkFor],
  );

  const decided = useMemo<ApprovalEntry[]>(
    () => projects.filter((p) => (DECIDED_APPROVALS as readonly string[]).includes(p.approval)).map((project) => ({ project, check: checkFor.get(project.id) ?? null })),
    [projects, checkFor],
  );

  const byId = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  /** Approve: the project is approved and the alerts that were chasing that decision are resolved. */
  const approve = useCallback(
    async (projectId: string) => {
      const project = byId.get(projectId);
      if (!project) return;
      await data.update('projects', projectId, { approval: 'approved' });
      for (const a of alerts) {
        if (a.entity === 'projects' && a.entityId === projectId && a.status !== 'resolved') {
          await data.update('alerts', a.id, { status: 'resolved' });
        }
      }
      toast(t('founder.approvals.approved', { project: project.name }));
    },
    [alerts, byId, data, t],
  );

  /** Request changes: the project goes back and the lead designer gets a high-priority task. */
  const requestChanges = useCallback(
    async (projectId: string) => {
      const project = byId.get(projectId);
      if (!project) return;
      await data.update('projects', projectId, { approval: 'changes-requested' });
      await data.create('tasks', {
        projectId,
        title: t('founder.approvals.changeTask', { project: project.name }),
        ownerRole: 'studio',
        assigneeId: project.leadDesignerId,
        status: 'todo',
        priority: 'high',
        startDate: null,
        dueDate: null,
        dependsOn: [],
        sectionId: null,
        description: '',
        createdById: user.id,
        tags: ['aprobación'],
        subtasks: [],
        completedAt: null,
        order: 0,
        parentTaskId: null,
        deliverableId: null,
        externalId: null,
        templateTaskId: null,
      });
      toast(t('founder.approvals.rejected', { project: project.name }));
    },
    [byId, data, t, user.id],
  );

  /** Comment: there is no comments entity yet, so the note is filed as a task for the lead designer. */
  const comment = useCallback(
    async (projectId: string, text: string) => {
      const project = byId.get(projectId);
      if (!project) return;
      await data.create('tasks', {
        projectId,
        title: t('founder.approvals.noteTask', { note: text }),
        ownerRole: 'studio',
        assigneeId: project.leadDesignerId,
        status: 'todo',
        priority: 'normal',
        startDate: null,
        dueDate: null,
        dependsOn: [],
        sectionId: null,
        description: '',
        createdById: user.id,
        tags: ['aprobación'],
        subtasks: [],
        completedAt: null,
        order: 0,
        parentTaskId: null,
        deliverableId: null,
        externalId: null,
        templateTaskId: null,
      });
      toast(t('founder.approvals.commented'));
    },
    [byId, data, t, user.id],
  );

  return { projects, checks, waiting, decided, loading, approve, requestChanges, comment };
}

/** One line describing the studio check behind an approval item. */
export function checkSummary(t: (k: string, v?: Record<string, string | number>) => string, check: ConsistencyCheck | null): string {
  if (!check) return t('founder.approvals.checkNone');
  if (check.status === 'passed') return t('founder.approvals.checkPassed');
  if (check.status === 'pending') return t('founder.approvals.checkPending');
  return t('founder.approvals.checkIssues', { n: check.items.filter((i) => !i.ok).length });
}
