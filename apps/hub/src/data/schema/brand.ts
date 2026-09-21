import type { BaseRow, Id, ISODate } from './base';

export type CompetitionStatus = 'slot' | 'researching' | 'preparing' | 'ready' | 'submitted' | 'result';
export type CompetitionProject = 'Honey Valley Lighting' | '"Hoy" Interior Design Project' | 'Noam Residential Project';

/** 20 slots in 2027 (docs/knowledge/competitions.md); unknown facts are null, never guessed. */
export interface Competition extends BaseRow {
  slot: number;
  name: string | null;
  organiser: string | null;
  category: string | null;
  submissionDate: ISODate | null;
  project: CompetitionProject | null;
  materialsFolder: string | null;
  status: CompetitionStatus;
  result: string | null;
}

export type PresentationKind = 'sales' | 'concept' | 'proposal' | 'competition';
export type PresentationStatus = 'requested' | 'drafting' | 'review' | 'final';

export interface Presentation extends BaseRow {
  title: string;
  projectId: Id | null;
  kind: PresentationKind;
  status: PresentationStatus;
  dueDate: ISODate | null;
  ownerId: Id;
  slideCount: number;
}

export type BrandAssetKind = 'logo' | 'typography' | 'palette' | 'template' | 'photo' | 'icon' | 'guideline';

export interface BrandAsset extends BaseRow {
  name: string;
  kind: BrandAssetKind;
  format: string;
  version: string;
  path: string;
  status: 'current' | 'superseded' | 'draft';
}

export type RevisionKind = 'image' | 'layout' | 'pdf' | 'presentation' | 'social';
export type RevisionStatus = 'requested' | 'in-progress' | 'delivered' | 'approved';

/** Graphic revisions queue (Angelica). */
export interface Revision extends BaseRow {
  title: string;
  projectId: Id | null;
  kind: RevisionKind;
  requestedById: Id;
  status: RevisionStatus;
  dueDate: ISODate | null;
}
