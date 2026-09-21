import type { LeadChannelId, PipelineStatusId, PurchaseStatusId, QualificationKey, ServiceCode, ValidationStatusId } from '../../domain/playbook';
import type { BaseRow, CentsCop, Id, ISODate } from './base';
import type { ProjectType } from './projects';

/**
 * Entities from the Service Delivery Playbook (prompt 0009, D-034): lead intake and pipeline, one engagement per
 * project and service (its phase checklist and brief), the single revision matrix, change orders, purchasing
 * control, site control and project messages. Vocabulary (status ids, phase ids, question keys) lives in
 * `src/domain/playbook.ts`; unknown facts are `null`, never guessed.
 */

export type LeadProjectType = ProjectType | 'other';
export type LeadProjectStatus = 'built' | 'under-construction' | 'conceptual';
export type LeadSource = 'public-intake' | 'manual' | 'import';

/** One row per inquiry: "every inquiry must enter a single traceable pipeline" (p. 3). Becomes a project at `contracted`. */
export interface Lead extends BaseRow {
  name: string;
  phone: string | null;
  email: string;
  city: string;
  projectType: LeadProjectType;
  areaM2: number | null;
  projectStatus: LeadProjectStatus | null;
  /** What the client asked for. */
  requestedService: ServiceCode | null;
  /** What `routeService()` or the founder suggests (commercial rule G-10). */
  suggestedService: ServiceCode | null;
  budgetCop: CentsCop | null;
  desiredStart: ISODate | null;
  channel: LeadChannelId;
  /** Assigned ALUZINA owner (demo user id); null until assigned. */
  ownerId: Id | null;
  /** `lead-new | lead-qualified | proposal-sent | contracted` (LEAD_STATUS_IDS). */
  status: PipelineStatusId;
  /** Answers to the 10 qualification questions, by `QualificationQuestion.key`. */
  qualification: Partial<Record<QualificationKey, string>>;
  notes: string;
  /** The project created at contract; null before. */
  projectId: Id | null;
  source: LeadSource;
}

export type EngagementStatus = 'started' | 'in-progress' | 'delivered' | 'closed';

/** One service delivered on one project: which phase it is in and which checklist items are ticked. */
export interface Engagement extends BaseRow {
  projectId: Id;
  serviceCode: ServiceCode;
  /** `ServicePhase.id`, e.g. `03-10`. */
  currentPhaseId: string;
  /** `${phaseId}:${itemIndex}` (index over `phaseItems(phase)`) -> ticked. */
  checks: Record<string, boolean>;
  /** Strategic / deep brief answers, free keys (`user.whoUses`, `space.area`, ...). */
  brief: Record<string, string>;
  startedAt: ISODate;
  completedAt: ISODate | null;
  status: EngagementStatus;
}

export type RevisionSource = 'client' | 'studio' | 'founder';

/** One line of the single revision matrix per project (03 stage 10, G-05): a comment and its approval status. */
export interface RevisionItem extends BaseRow {
  projectId: Id;
  engagementId: Id | null;
  /** Free label of what was reviewed (scheme, area, drawing, render, ...). */
  stage: string;
  item: string;
  comment: string;
  authorId: Id;
  source: RevisionSource;
  status: ValidationStatusId;
  decidedAt: ISODate | null;
}

export type ChangeOrderStatus = 'requested' | 'approved' | 'rejected' | 'executed';

/** Any request after approval (E stage 8, G-14): recorded before work continues, executed only when approved. */
export interface ChangeOrder extends BaseRow {
  projectId: Id;
  description: string;
  reason: string;
  extraCostCop: CentsCop;
  extraDays: number;
  requestedById: Id;
  status: ChangeOrderStatus;
  approvedAt: ISODate | null;
}

/** Purchasing control (E stage 5, G-07): one row per purchase, tracked from quotation to installation. */
export interface Purchase extends BaseRow {
  projectId: Id;
  supplierId: Id | null;
  reference: string;
  quantity: number;
  priceCop: CentsCop;
  date: ISODate;
  responsibleId: Id;
  status: PurchaseStatusId;
}

/** ALUZINA site control (E stage 7, G-08): the written and photographic record of one visit. */
export interface SiteReport extends BaseRow {
  projectId: Id;
  date: ISODate;
  /** 0-100. */
  progress: number;
  notes: string;
  decisions: string;
  problems: string;
  responsibleId: Id;
  resolutionDue: ISODate | null;
  photoUrls: string[];
}

/** Project messages between the studio and the client (the official communication channel, 03 stage 01). */
export interface Message extends BaseRow {
  projectId: Id;
  authorId: Id;
  body: string;
  at: ISODate;
  readBy: Id[];
}
