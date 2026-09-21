import type { BaseRow, CentsCop, Id, ISODate } from './base';

export type ProjectType = 'residential' | 'commercial' | 'hospitality' | 'wellness' | 'lighting-product';
export type ProjectPhase = 'lead' | 'concept' | 'development' | 'documentation' | 'procurement' | 'execution' | 'delivered';
export type CreativeDirectionStatus = 'pending' | 'set' | 'revised';
/** Approval chain (roles-and-portals.md): studio check -> founder approval -> client approval. */
export type ApprovalStatus = 'draft' | 'in-check' | 'awaiting-founder' | 'changes-requested' | 'approved' | 'client-approved';

export interface Project extends BaseRow {
  name: string;
  client: string;
  clientUserId: Id | null;
  type: ProjectType;
  phase: ProjectPhase;
  creativeDirection: CreativeDirectionStatus;
  approval: ApprovalStatus;
  leadDesignerId: Id;
  budgetCop: CentsCop;
  startDate: ISODate;
  dueDate: ISODate | null;
  location: string;
  summary: string;
}

export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task extends BaseRow {
  projectId: Id | null;
  title: string;
  ownerRole: string;
  assigneeId: Id;
  status: TaskStatus;
  priority: Priority;
  dueDate: ISODate | null;
  /** Ids of tasks that must finish first (Timeline dependency indicator). */
  dependsOn: Id[];
}

export type MeetingKind = 'client' | 'supplier' | 'internal' | 'site-visit' | 'strategic';

export interface Meeting extends BaseRow {
  title: string;
  projectId: Id | null;
  kind: MeetingKind;
  startsAt: ISODate;
  endsAt: ISODate;
  location: string;
  attendeeIds: Id[];
  notes: string;
}

export type AlertSeverity = 'info' | 'warning' | 'urgent';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

/** One notification pattern for Miguel's "before urgent" and Angelica's deadlines (roles-and-portals.md). */
export interface Alert extends BaseRow {
  title: string;
  severity: AlertSeverity;
  dueDate: ISODate;
  /** Days before `dueDate` the alert should surface. */
  leadDays: number;
  forRole: string;
  entity: string;
  entityId: Id;
  status: AlertStatus;
}
