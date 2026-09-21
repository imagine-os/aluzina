import type { BaseRow, CentsCop, Id, ISODate } from './base';

/** Design references and mood boards (Sarai). */
export interface Reference extends BaseRow {
  projectId: Id | null;
  title: string;
  source: string;
  tags: string[];
  board: string;
  imageUrl: string | null;
  note: string;
}

export type MaterialStatus = 'proposed' | 'sampled' | 'approved' | 'rejected';

/** Material palettes: one row per material in a project palette. */
export interface Material extends BaseRow {
  projectId: Id | null;
  palette: string;
  name: string;
  category: string;
  supplierId: Id | null;
  finish: string;
  color: string;
  unitCop: CentsCop | null;
  status: MaterialStatus;
}

export type ScheduleKind = 'furniture' | 'materials' | 'lighting' | 'elements';
export type ScheduleStatus = 'draft' | 'in-review' | 'final';

/** Furniture / material / element schedules (the specification lists, not the calendar). */
export interface Schedule extends BaseRow {
  projectId: Id;
  kind: ScheduleKind;
  title: string;
  itemCount: number;
  status: ScheduleStatus;
  dueDate: ISODate | null;
}

export type RenderPackStatus = 'briefing' | 'sent' | 'rendering' | 'delivered';

/** Information packs for renderings and for suppliers. */
export interface RenderPack extends BaseRow {
  projectId: Id;
  title: string;
  audience: 'render-artist' | 'supplier';
  viewCount: number;
  status: RenderPackStatus;
  dueDate: ISODate | null;
}

export type CheckStatus = 'pending' | 'passed' | 'issues';

export interface CheckItem {
  label: string;
  ok: boolean;
}

/** Sarai's consistency check before work reaches the founder. */
export interface ConsistencyCheck extends BaseRow {
  projectId: Id;
  title: string;
  checkedById: Id;
  items: CheckItem[];
  status: CheckStatus;
  notes: string;
}
