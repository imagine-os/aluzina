import type { BrandAsset, Competition, Presentation, Revision } from './brand';
import type { Delivery, Document, Payment, Quote, Supplier } from './operations';
import type { Activity, Alert, Comment, Meeting, Project, Section, Task } from './projects';
import type { Client, Deliverable, Filing, Post, Relation, Space, Tag, Tool } from './spaces';
import type { ConsistencyCheck, Material, Reference, RenderPack, Schedule } from './studio';

export * from './base';
export * from './brand';
export * from './operations';
export * from './projects';
export * from './spaces';
export * from './studio';

/** Entity name -> row type. The DataProvider is typed over this map; `spec.dataTables` names these keys. */
export interface EntityMap {
  projects: Project;
  sections: Section;
  tasks: Task;
  comments: Comment;
  activity: Activity;
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
  spaces: Space;
  posts: Post;
  filings: Filing;
  relations: Relation;
  tags: Tag;
  clients: Client;
  deliverables: Deliverable;
  tools: Tool;
}

export type EntityName = keyof EntityMap;

export const ENTITIES: readonly EntityName[] = [
  'projects',
  'sections',
  'tasks',
  'comments',
  'activity',
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
  'spaces',
  'posts',
  'filings',
  'relations',
  'tags',
  'clients',
  'deliverables',
  'tools',
];
