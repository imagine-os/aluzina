import type { FileType } from '../../domain/archive';
import type { PipelineStatusId, ServiceCode } from '../../domain/playbook';
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
  /** Older seven-phase vocabulary, kept for the Work views until they migrate to `pipelineStatus` (D-033). */
  phase: ProjectPhase;
  /** The playbook service being delivered (D-033); null for internal projects (own collection). */
  serviceCode: ServiceCode | null;
  /** Position in the 15-status architecture (`PIPELINE_STATUSES`, from `contracted` on). */
  pipelineStatus: PipelineStatusId;
  creativeDirection: CreativeDirectionStatus;
  approval: ApprovalStatus;
  leadDesignerId: Id;
  budgetCop: CentsCop;
  startDate: ISODate;
  dueDate: ISODate | null;
  location: string;
  summary: string;
  /** Free tags (`tags` registry names): `archive`, `dropbox`, the year, the type in Spanish (prompt 0017). `[]` for live projects. */
  tags: string[];
  /** The asset shown as the project's cover (an image or a PDF with a thumbnail); null when none. */
  coverAssetId: Id | null;
  /** The year the project belongs to (its year folder); null when unknown or when the folder is a range (2019-2023). */
  year: number | null;
  /** The shared folder the project's files live in at the source (Dropbox); null for projects born in the hub. */
  sourceFolderUrl: string | null;
  /** How many archived files the folder holds (inventory count, ar-19); null for projects born in the hub. Lists read this, never the file rows. */
  fileCount: number | null;
  /** Served path of the cover thumbnail (`./archive/<slug>/thumbs/<file>.jpg`) so a card needs no asset row; set with `coverAssetId` (S-13 "Set as cover"). */
  coverUrl: string | null;
  /** Key of the project's file chunk (`docs/archive/projects/<slug>/index.json`, loaded by `data/archiveFiles.ts`); null when the project has no archived folder. */
  archiveSlug: string | null;
  /** Up to four file types present in the folder, most common first (the S-12 mosaic when there is no cover); `[]` when unknown. */
  fileTypes: FileType[];
}

export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

/** Asana-style section of a project's work (D-022): List groups, Board columns and Timeline swimlanes. `projectId` null = studio-wide sections. */
export interface Section extends BaseRow {
  projectId: Id | null;
  name: string;
  order: number;
}

export interface Subtask {
  id: string;
  label: string;
  done: boolean;
}

export interface Task extends BaseRow {
  projectId: Id | null;
  /** Section inside the project (D-022); null = "no section" group. */
  sectionId: Id | null;
  title: string;
  description: string;
  ownerRole: string;
  assigneeId: Id;
  /** Who created the task (`tasks.own.write` lets the creator edit it); null for seeded rows. */
  createdById: Id | null;
  status: TaskStatus;
  priority: Priority;
  /** Planned start; null when only the due date is known (Timeline then renders a milestone). */
  startDate: ISODate | null;
  dueDate: ISODate | null;
  /** Ids of tasks that must finish first (Timeline dependency arrows). */
  dependsOn: Id[];
  tags: string[];
  subtasks: Subtask[];
  /** Set when status becomes done, cleared when reopened. */
  completedAt: ISODate | null;
  /** Manual order inside the section (lower first). */
  order: number;
  /** Real nesting (D-062): the task this one hangs under, null at the top level. `subtasks` stays the lightweight checklist. */
  parentTaskId: Id | null;
  /** The deliverable type (`deliverables` catalog) this task produces; null when it produces nothing on its own. */
  deliverableId: Id | null;
  /** Where the row came from outside the OS, e.g. `asana:1215258003746641`; null for rows born here. */
  externalId: string | null;
  /** `TemplateTask.id` this row was generated from (`domain/templates`), null when it was not. */
  templateTaskId: string | null;
}

/** Comment thread on any row (D-022): `entity` is the table name, `entityId` the row. */
export interface Comment extends BaseRow {
  entity: string;
  entityId: Id;
  authorId: Id;
  body: string;
}

/** One line per changed field, written by the provider on every update (D-022): "Miguel changed status: doing -> done". */
export interface Activity extends BaseRow {
  entity: string;
  entityId: Id;
  actorId: Id | null;
  field: string;
  from: string | null;
  to: string | null;
  at: ISODate;
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
