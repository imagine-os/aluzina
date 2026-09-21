import type { BrandAsset, Competition, Presentation, Revision } from './brand';
import type { Delivery, Document, Payment, Quote, Supplier } from './operations';
import type { Alert, Meeting, Project, Task } from './projects';
import type { ConsistencyCheck, Material, Reference, RenderPack, Schedule } from './studio';

export * from './base';
export * from './brand';
export * from './operations';
export * from './projects';
export * from './studio';

/** Entity name -> row type. The DataProvider is typed over this map; `spec.dataTables` names these keys. */
export interface EntityMap {
  projects: Project;
  tasks: Task;
  meetings: Meeting;
  suppliers: Supplier;
  quotes: Quote;
  deliveries: Delivery;
  payments: Payment;
  documents: Document;
  references: Reference;
  materials: Material;
  schedules: Schedule;
  renderPacks: RenderPack;
  consistencyChecks: ConsistencyCheck;
  competitions: Competition;
  presentations: Presentation;
  brandAssets: BrandAsset;
  revisions: Revision;
  alerts: Alert;
}

export type EntityName = keyof EntityMap;

export const ENTITIES: readonly EntityName[] = [
  'projects',
  'tasks',
  'meetings',
  'suppliers',
  'quotes',
  'deliveries',
  'payments',
  'documents',
  'references',
  'materials',
  'schedules',
  'renderPacks',
  'consistencyChecks',
  'competitions',
  'presentations',
  'brandAssets',
  'revisions',
  'alerts',
];
