import type { SpaceTreeNode } from '../../components/organism/SpaceTree/SpaceTree';
import type { GraphEdge, GraphNode } from '../../components/organism/RelationGraph/RelationGraph';
import type { Filing, Post, Relation, Space } from '../../data/schema';

/** Spaces model (D-026): tree helpers over flat rows, post counts, excerpts and the graph builder for K-04. */

export interface SpaceNode {
  space: Space;
  children: SpaceNode[];
}

const byOrder = (a: Space, b: Space) => a.order - b.order || a.name.localeCompare(b.name);

export function buildTree(spaces: Space[], showArchived: boolean): SpaceNode[] {
  const visible = showArchived ? spaces : spaces.filter((s) => !s.archived);
  const ids = new Set(visible.map((s) => s.id));
  const childrenOf = new Map<string | null, Space[]>();
  for (const s of visible) {
    const parent = s.parentId && ids.has(s.parentId) ? s.parentId : null;
    childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), s]);
  }
  const build = (parent: string | null): SpaceNode[] => (childrenOf.get(parent) ?? []).sort(byOrder).map((space) => ({ space, children: build(space.id) }));
  return build(null);
}

/** Root-first list of the ancestors of `id` (excluding the space itself). */
export function ancestorsOf(spaces: Space[], id: string): Space[] {
  const byId = new Map(spaces.map((s) => [s.id, s]));
  const out: Space[] = [];
  let cur = byId.get(id)?.parentId ?? null;
  const seen = new Set<string>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const s = byId.get(cur);
    if (!s) break;
    out.unshift(s);
    cur = s.parentId;
  }
  return out;
}

export function descendantIds(spaces: Space[], id: string): string[] {
  const out: string[] = [];
  const walk = (parent: string) => {
    for (const s of spaces) if (s.parentId === parent) {
      out.push(s.id);
      walk(s.id);
    }
  };
  walk(id);
  return out;
}

export function postCountsBySpace(filings: Filing[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const f of filings) m.set(f.spaceId, (m.get(f.spaceId) ?? 0) + 1);
  return m;
}

export function toTreeNodes(nodes: SpaceNode[], counts: Map<string, number>): SpaceTreeNode[] {
  return nodes.map(({ space, children }) => ({ id: space.id, name: space.name, glyph: space.glyph, kind: space.kind, archived: space.archived, count: counts.get(space.id), children: toTreeNodes(children, counts) }));
}

/** Ids of every space on the path to a match, so a search can expand the tree around its results. */
export function matchingSpaceIds(spaces: Space[], query: string): Set<string> {
  const q = query.trim().toLowerCase();
  const hits = new Set<string>();
  if (!q) return hits;
  for (const s of spaces) {
    if (s.name.toLowerCase().includes(q) || s.slug.includes(q) || s.description.toLowerCase().includes(q)) {
      hits.add(s.id);
      for (const a of ancestorsOf(spaces, s.id)) hits.add(a.id);
    }
  }
  return hits;
}

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'space';
}

/** Plain-text first lines of a Markdown body. */
export function excerptOf(body: string, max = 160): string {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\|.*$/gm, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*(?:[-*]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/gm, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function postMatches(post: Post, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return post.title.toLowerCase().includes(q) || post.body.toLowerCase().includes(q) || post.tags.some((t) => t.toLowerCase().includes(q));
}

// ---- Graph (K-04) ----

export const graphKey = (type: string, id: string) => `${type}:${id}`;
export const parseKey = (key: string): { type: string; id: string } => {
  const i = key.indexOf(':');
  return { type: key.slice(0, i), id: key.slice(i + 1) };
};

export interface GraphInput {
  spaces: Space[];
  posts: Post[];
  filings: Filing[];
  relations: Relation[];
  /** Label and tone for entities that are neither spaces nor posts. */
  resolve: (type: string, id: string) => { label: string; sub: string } | null;
  /** Kinds to keep: space kinds, `post`, `other`. */
  kinds: Set<string>;
  focusKey: string | null;
  /** 1..3 hops around the focus, or null for everything. */
  depth: number | null;
  includeArchived: boolean;
}

export function buildGraph({ spaces, posts, filings, relations, resolve, kinds, focusKey, depth, includeArchived }: GraphInput): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const spaceById = new Map(spaces.map((s) => [s.id, s]));
  const postById = new Map(posts.map((p) => [p.id, p]));
  for (const s of spaces) {
    if (!includeArchived && s.archived) continue;
    nodes.set(graphKey('spaces', s.id), { key: graphKey('spaces', s.id), label: s.name, kind: s.kind, size: s.kind === 'area' ? 'lg' : 'md' });
  }
  for (const s of spaces) {
    if (s.parentId && nodes.has(graphKey('spaces', s.id)) && nodes.has(graphKey('spaces', s.parentId))) edges.push({ from: graphKey('spaces', s.parentId), to: graphKey('spaces', s.id), kind: 'child' });
  }
  for (const p of posts) {
    if (p.status === 'archived' && !includeArchived) continue;
    nodes.set(graphKey('posts', p.id), { key: graphKey('posts', p.id), label: p.title, kind: 'post', size: 'md' });
  }
  for (const f of filings) {
    const a = graphKey('posts', f.postId);
    const b = graphKey('spaces', f.spaceId);
    if (nodes.has(a) && nodes.has(b)) edges.push({ from: a, to: b, kind: 'filed' });
  }
  const ensure = (type: string, id: string): string | null => {
    const key = graphKey(type, id);
    if (nodes.has(key)) return key;
    if (type === 'spaces' && !spaceById.has(id)) return null;
    if (type === 'posts' && !postById.has(id)) return null;
    if (type === 'spaces' || type === 'posts') return null; // archived and hidden
    const r = resolve(type, id);
    if (!r) return null;
    nodes.set(key, { key, label: r.label, kind: 'other', size: 'sm', sub: r.sub });
    return key;
  };
  for (const r of relations) {
    const a = ensure(r.fromType, r.fromId);
    const b = ensure(r.toType, r.toId);
    if (a && b) edges.push({ from: a, to: b, kind: r.kind });
  }
  // kind filter
  let keep = new Set([...nodes.values()].filter((n) => kinds.has(n.kind)).map((n) => n.key));
  // depth around focus
  if (focusKey && depth !== null && keep.has(focusKey)) {
    const adj = new Map<string, string[]>();
    for (const e of edges) {
      if (!keep.has(e.from) || !keep.has(e.to)) continue;
      adj.set(e.from, [...(adj.get(e.from) ?? []), e.to]);
      adj.set(e.to, [...(adj.get(e.to) ?? []), e.from]);
    }
    const hop = new Map<string, number>([[focusKey, 0]]);
    const queue = [focusKey];
    while (queue.length) {
      const k = queue.shift()!;
      const h = hop.get(k)!;
      if (h >= depth) continue;
      for (const n of adj.get(k) ?? []) if (!hop.has(n)) {
        hop.set(n, h + 1);
        queue.push(n);
      }
    }
    keep = new Set(hop.keys());
  } else if (focusKey && depth !== null) {
    // the focus node was filtered out: keep the focus alone with its neighbours so the page is never empty
    keep = new Set([focusKey, ...edges.filter((e) => e.from === focusKey || e.to === focusKey).flatMap((e) => [e.from, e.to])].filter((k) => nodes.has(k)));
  }
  return { nodes: [...nodes.values()].filter((n) => keep.has(n.key)), edges: edges.filter((e) => keep.has(e.from) && keep.has(e.to)) };
}
