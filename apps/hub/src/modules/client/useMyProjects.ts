import { useMemo } from 'react';
import { useSession } from '../../auth/SessionProvider';
import { useTable } from '../../data/DataContext';
import type { Engagement, Project } from '../../data/schema';
import { CLIENT_JOURNEY, checkKey, phaseItems, serviceByCode, type PipelineStatusId, type Service, type ServicePhase, type Text } from '../../domain';

/**
 * Which journey step (`CLIENT_JOURNEY`, playbook p. 2) a pipeline status sits in. The journey is what the
 * client sees; the 15 pipeline statuses are the studio's own vocabulary, so several map to one step.
 */
const JOURNEY_BY_STATUS: Record<PipelineStatusId, string> = {
  'lead-new': 'lead',
  'lead-qualified': 'lead',
  'proposal-sent': 'lead',
  contracted: 'diagnosis',
  briefing: 'brief',
  concept: 'concept',
  'design-development': 'development',
  'client-review': 'validation',
  approved: 'validation',
  procurement: 'delivery',
  'in-construction': 'delivery',
  'punch-list': 'delivery',
  delivered: 'delivery',
  closed: 'closure',
  'follow-up': 'follow-up',
};

export function journeyIndexFor(status: string): number {
  const step = JOURNEY_BY_STATUS[status as PipelineStatusId];
  return CLIENT_JOURNEY.findIndex((s) => s.id === step);
}

/** One project of the signed-in client, with its engagement and everything derived from the service playbook. */
export interface MyProject {
  project: Project;
  engagement: Engagement | null;
  service: Service | undefined;
  currentPhase: ServicePhase | undefined;
  /** Ticked checklist items across every phase of the service. */
  done: number;
  total: number;
  /** 0-100. */
  percent: number;
  /** Position in `CLIENT_JOURNEY` (-1 when the status maps to no step). */
  journeyIndex: number;
  /** First unticked item of the current phase, when there is one. */
  nextItem: Text | undefined;
  /** The phase after the current one, when the current phase is complete. */
  nextPhase: ServicePhase | undefined;
}

function buildMyProject(project: Project, engagement: Engagement | null): MyProject {
  const service = serviceByCode(project.serviceCode);
  const checks = engagement?.checks ?? {};
  let done = 0;
  let total = 0;
  for (const phase of service?.phases ?? []) {
    const items = phaseItems(phase);
    total += items.length;
    for (let i = 0; i < items.length; i++) if (checks[checkKey(phase.id, i)]) done += 1;
  }
  const phases = service?.phases ?? [];
  const currentIndex = engagement ? phases.findIndex((p) => p.id === engagement.currentPhaseId) : -1;
  const currentPhase = currentIndex === -1 ? undefined : phases[currentIndex];
  let nextItem: Text | undefined;
  if (currentPhase) {
    const items = phaseItems(currentPhase);
    nextItem = items.find((_, i) => !checks[checkKey(currentPhase.id, i)]);
  }
  return {
    project,
    engagement,
    service,
    currentPhase,
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    journeyIndex: journeyIndexFor(project.pipelineStatus),
    nextItem,
    nextPhase: nextItem || currentIndex === -1 ? undefined : phases[currentIndex + 1],
  };
}

export interface MyProjectsState {
  /** Only rows where `projects.clientUserId` is the signed-in user (the client app's whole data scope). */
  mine: MyProject[];
  projectIds: string[];
  byId: Map<string, MyProject>;
  loading: boolean;
}

/**
 * The client app's data scope (C-01..C-06): the projects whose `clientUserId` is the signed-in person, each
 * paired with its `engagements` row, its playbook service, its checklist progress and its journey step.
 * Every other list in the client app filters on `projectIds`, so a client never reads another project.
 */
export function useMyProjects(): MyProjectsState {
  const { user } = useSession();
  const { rows: projects, loading } = useTable('projects', { where: { clientUserId: user.id }, orderBy: 'startDate' });
  const { rows: engagements, loading: loadingEngagements } = useTable('engagements');

  return useMemo(() => {
    const engagementFor = new Map<string, Engagement>();
    for (const e of engagements) {
      const current = engagementFor.get(e.projectId);
      // The engagement still running wins over a delivered one (Noam has two: design delivered, execution live).
      if (!current || (current.status === 'delivered' || current.status === 'closed')) engagementFor.set(e.projectId, e);
    }
    const mine = projects.map((p) => buildMyProject(p, engagementFor.get(p.id) ?? null));
    return {
      mine,
      projectIds: mine.map((m) => m.project.id),
      byId: new Map(mine.map((m) => [m.project.id, m])),
      loading: loading || loadingEngagements,
    };
  }, [projects, engagements, loading, loadingEngagements]);
}
