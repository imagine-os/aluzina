import type { Tone } from '../../components/atom/Badge/Badge';
import type { ApprovalStatus, Lead, Project, ProjectPhase, ProjectType } from '../../data/schema';
import {
  LEAD_STATUS_IDS,
  PIPELINE_STATUSES,
  PIPELINE_STATUS_IDS,
  type PipelineGroup,
  type PipelineStatus,
  type PipelineStatusId,
  type ServiceCode,
} from '../../domain';

/** The pipeline, left to right (src/data/schema/projects.ts). */
export const PHASES: readonly ProjectPhase[] = ['lead', 'concept', 'development', 'documentation', 'procurement', 'execution', 'delivered'];

export const PROJECT_TYPES: readonly ProjectType[] = ['residential', 'commercial', 'hospitality', 'wellness', 'lighting-product'];

const TONES: Record<ProjectPhase, Tone> = {
  lead: 'neutral',
  concept: 'info',
  development: 'accent',
  documentation: 'accent',
  procurement: 'warning',
  execution: 'warning',
  delivered: 'success',
};

export function phaseTone(phase: ProjectPhase): Tone {
  return TONES[phase] ?? 'neutral';
}

// ---------------------------------------------------------------------------------------------
// Playbook pipeline (D-033): the 15-status architecture A-03 and A-08 share.
// ---------------------------------------------------------------------------------------------

/**
 * The five status groups as the board's column bands, in order. `close` is the band the board
 * collapses by default ("Closed": delivered, closed, follow-up).
 */
export const PIPELINE_BANDS: readonly { id: PipelineGroup; statuses: readonly PipelineStatus[] }[] = (
  ['lead', 'sale', 'design', 'build', 'close'] as const
).map((id) => ({ id, statuses: PIPELINE_STATUSES.filter((s) => s.group === id) }));

/** Bands collapsed the first time the board is opened (the closed work is history, not pipeline). */
export const DEFAULT_COLLAPSED: readonly PipelineGroup[] = ['close'];

/** Position of a status in the 15-status order; -1 when unknown. */
export function pipelineIndex(id: string): number {
  return PIPELINE_STATUS_IDS.indexOf(id as PipelineStatusId);
}

/** The status before `id` in the architecture, or undefined at `lead-new`. */
export function prevPipelineStatus(id: string): PipelineStatus | undefined {
  const i = pipelineIndex(id);
  return i <= 0 ? undefined : PIPELINE_STATUSES[i - 1];
}

/** Approval states that satisfy the construction gate (G-06 / G-12). */
export const GATE_APPROVALS: readonly ApprovalStatus[] = ['approved', 'client-approved'];

/** Statuses the gate protects: nothing is bought or built before the design package is approved. */
export const GATED_STATUSES: readonly PipelineStatusId[] = ['procurement', 'in-construction'];

export interface MoveCheck {
  ok: boolean;
  /** Governance rule that blocks the move, e.g. `G-06`. */
  rule?: string;
}

/**
 * G-06 / G-12: a project may not enter `procurement` or `in-construction` while its design package is
 * not approved. Returns the rule that blocks it so the UI can name the reason instead of failing silently.
 */
export function checkProjectMove(project: Project, to: string): MoveCheck {
  if (!GATED_STATUSES.includes(to as PipelineStatusId)) return { ok: true };
  if (GATE_APPROVALS.includes(project.approval)) return { ok: true };
  return { ok: false, rule: 'G-06' };
}

/** A lead never leaves the first four statuses: at `contracted` it is converted into a project (A-08). */
export function checkLeadMove(to: string): MoveCheck {
  return LEAD_STATUS_IDS.includes(to as PipelineStatusId) ? { ok: true } : { ok: false, rule: 'lead-range' };
}

/** What a pipeline card stands for: a `leads` row before the contract, a `projects` row after it. */
export type PipelineKind = 'lead' | 'project';

export interface PipelineEntry {
  kind: PipelineKind;
  id: string;
  name: string;
  /** Client name (a lead is its own client until the project exists). */
  client: string;
  status: PipelineStatusId;
  valueCop: number | null;
  serviceCode: ServiceCode | null;
  ownerId: string | null;
}

export function leadEntry(lead: Lead): PipelineEntry {
  return {
    kind: 'lead',
    id: lead.id,
    name: lead.name,
    client: lead.city,
    status: lead.status,
    valueCop: lead.budgetCop,
    serviceCode: lead.requestedService ?? lead.suggestedService,
    ownerId: lead.ownerId,
  };
}

export function projectEntry(project: Project): PipelineEntry {
  return {
    kind: 'project',
    id: project.id,
    name: project.name,
    client: project.client,
    status: project.pipelineStatus,
    valueCop: project.budgetCop,
    serviceCode: project.serviceCode,
    ownerId: project.leadDesignerId,
  };
}

/** Today as `YYYY-MM-DD` (local): the reference date for a lead conversion. */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** `leads.projectType` is wider than `projects.type` ('other'); a converted project falls back to residential. */
export function projectTypeOf(lead: Lead): ProjectType {
  return lead.projectType === 'other' ? 'residential' : lead.projectType;
}
