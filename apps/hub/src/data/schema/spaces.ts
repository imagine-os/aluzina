import type { BaseRow, Id } from './base';
import type { ProjectPhase, ProjectType } from './projects';

/**
 * Spaces (K-xx, D-026): the Hub's own relational organizer that replaces the Slack sidebar (prompt 0005).
 * A space nests without limit (`parentId`), a post is filed in many spaces at once (`filings`), and any
 * entity relates to any other with a typed relation (`relations`); backlinks are the reverse query.
 */
export type SpaceKind = 'area' | 'topic' | 'role' | 'client' | 'deliverable' | 'tool' | 'project' | 'archive';
export const SPACE_KINDS: readonly SpaceKind[] = ['area', 'topic', 'role', 'client', 'deliverable', 'tool', 'project', 'archive'];

/** `team` (everyone), `role:<roleId>` (one role), `private` (the author). */
export type SpaceVisibility = 'team' | `role:${string}` | 'private';

export interface Space extends BaseRow {
  name: string;
  /** URL-safe, unique among siblings (the Slack channel name for seeded spaces). */
  slug: string;
  parentId: Id | null;
  kind: SpaceKind;
  description: string;
  /** One or two characters shown before the name in the tree. */
  glyph: string;
  /** Manual order among siblings (lower first). */
  order: number;
  visibility: SpaceVisibility;
  archived: boolean;
  /** The entity this space is about (role spaces -> `roles`, client spaces -> `clients`, deliverable spaces -> `deliverables`, tool spaces -> `tools`, project spaces -> `projects`); null for areas and topics. */
  aboutType: string | null;
  aboutId: Id | null;
}

export type PostKind = 'note' | 'link' | 'file' | 'decision' | 'procedure' | 'brief' | 'announcement';
export const POST_KINDS: readonly PostKind[] = ['note', 'link', 'file', 'decision', 'procedure', 'brief', 'announcement'];
export type PostStatus = 'draft' | 'published' | 'archived';

/** The thing that gets filed: one row, shown in every space it is filed in. */
export interface Post extends BaseRow {
  title: string;
  /** Markdown (rendered by the `Markdown` atom, never as HTML). */
  body: string;
  kind: PostKind;
  authorId: Id;
  url: string | null;
  pinned: boolean;
  status: PostStatus;
  tags: string[];
}

/** Many-to-many: a post appears in every space it is filed in; unfiling from one leaves it in the others. */
export interface Filing extends BaseRow {
  postId: Id;
  spaceId: Id;
}

export type RelationKind = 'references' | 'applies-to' | 'part-of' | 'replaces' | 'depends-on' | 'belongs-to' | 'produced-by' | 'for-client' | 'owned-by' | 'depicts';
/** `depicts` (0013): an asset page shows a project (portfolio page -> project); `references` stays for mentions in text. */
export const RELATION_KINDS: readonly RelationKind[] = ['references', 'applies-to', 'part-of', 'replaces', 'depends-on', 'belongs-to', 'produced-by', 'for-client', 'owned-by', 'depicts'];

/**
 * Typed link between any two entities (`fromType` / `toType` are entity names, or `roles` / `users` / `services`
 * for the role, demo-user and playbook-service registries). "Referenced by" is the reverse query on `toType` + `toId`.
 */
export interface Relation extends BaseRow {
  fromType: string;
  fromId: Id;
  toType: string;
  toId: Id;
  kind: RelationKind;
  note: string;
}

/** Tag registry: the name is the key posts carry in `tags[]`; the count is derived at render time. */
export interface Tag extends BaseRow {
  name: string;
  tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

export type ClientKind = 'past' | 'current' | 'prospect';

export interface Client extends BaseRow {
  name: string;
  kind: ClientKind;
  /** e.g. wellness, residential, hospitality; `null` when unknown. */
  sector: string | null;
  city: string | null;
  contactName: string | null;
  notes: string;
  projectIds: Id[];
}

export type DeliverableStatus = 'defined' | 'template-ready' | 'automated';

/** Catalog of deliverable TYPES (not instances): what the studio hands over, per phase, and who owns it. */
export interface Deliverable extends BaseRow {
  name: string;
  phase: ProjectPhase;
  description: string;
  /** Document kind the template produces (`documents.kind` or a hub page code), null when none yet. */
  templateDocKind: string | null;
  ownerRole: string;
  typicalDays: number | null;
  requiredFor: ProjectType[];
  status: DeliverableStatus;
}

export type ToolCategory = 'ai-image' | 'ai-text' | 'pm' | 'chat' | 'website-builder' | 'design' | 'render' | 'finance' | 'comms' | 'infra';
export type ToolStatus = 'in-use' | 'evaluating' | 'to-replace' | 'replaced' | 'planned';

/** Software the team pays for or plans to, and which hub module replaces it (P-15: own the whole operations platform). */
export interface Tool extends BaseRow {
  name: string;
  vendor: string;
  category: ToolCategory;
  usedFor: string;
  status: ToolStatus;
  /** Hub page code (`W-01`), route (`/founder/spaces`) or planned module name that replaces it; null while none is planned. */
  replacedByModule: string | null;
  notes: string;
}
