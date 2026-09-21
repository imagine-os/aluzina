import { useCallback, useMemo } from 'react';
import { useRoutes } from '../../app/RoutesContext';
import { DEMO_USERS, demoUserForRole } from '../../auth/demoUsers';
import { isRoleId } from '../../auth/roles';
import type { GraphNode } from '../../components/organism/RelationGraph/RelationGraph';
import type { NodeImage, ViewNode } from '../../components/organism/GraphViews/GraphViews';
import { useTable } from '../../data/DataContext';
import type { PostKind, Space } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';
import { parseKey } from './model';

/**
 * What each graph node is drawn as (Justin, prompt 0012: "the graph should use icons or images from the
 * actual system when possible") and which lane / cluster it belongs to. Nothing here changes the data
 * model: it reads the same rows K-04 already loads and turns a `GraphNode` into a `ViewNode`.
 *
 * - people and roles -> the demo user's initials (the Avatar atom's own two-letter rule),
 * - a node that opens a hub page -> that page's deploy-time thumbnail `./thumbs/<code>.jpg` (D-011), with
 *   the same bilingual fallback tile the hub cards use while the thumbnail has not been generated,
 * - spaces -> their own `glyph`, posts -> a glyph per kind, catalog entries -> the glyph of the space
 *   about them, falling back to a glyph per entity type.
 */

const CODE_RE = /^([A-Z]+-\d{2})/;

const POST_GLYPH: Record<PostKind, string> = {
  note: '✎',
  link: '↗',
  file: '▤',
  decision: '✓',
  procedure: '≡',
  brief: '◨',
  announcement: '✶',
};

const TYPE_GLYPH: Record<string, string> = {
  spaces: '◇',
  posts: '✎',
  projects: '▦',
  tasks: '☐',
  documents: '▤',
  clients: '◉',
  deliverables: '◆',
  tools: '⚙',
  competitions: '★',
  brandAssets: '❖',
  presentations: '▭',
  roles: '◎',
  users: '◍',
};

const thumbSrc = (code: string) => `./thumbs/${code}.jpg?v=${__BUILD_ID__}`;

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export interface NodeDecor {
  image: NodeImage;
  lane: string;
  laneLabel: string;
}

/** `GraphNode` (what `buildGraph` returns) plus the picture and the lane, ready for the gallery views. */
export function useViewNodes(nodes: GraphNode[]): ViewNode[] {
  const decorate = useNodeDecor();
  return useMemo(() => nodes.map((n) => ({ ...n, ...decorate(n) })), [nodes, decorate]);
}

export function useNodeDecor(): (node: GraphNode) => NodeDecor {
  const { t } = useT();
  const routes = useRoutes();
  const spaces = useTable('spaces');
  const posts = useTable('posts');
  const deliverables = useTable('deliverables');
  const tools = useTable('tools');

  const index = useMemo(() => {
    const spaceById = new Map(spaces.rows.map((s) => [s.id, s]));
    const aboutSpace = new Map<string, Space>();
    for (const s of spaces.rows) if (s.aboutType && s.aboutId) aboutSpace.set(`${s.aboutType}:${s.aboutId}`, s);
    const rootOf = (space: Space): Space => {
      let cur = space;
      const seen = new Set<string>([cur.id]);
      while (cur.parentId && spaceById.has(cur.parentId) && !seen.has(cur.parentId)) {
        seen.add(cur.parentId);
        cur = spaceById.get(cur.parentId)!;
      }
      return cur;
    };
    const codes = new Set(routes.map((r) => r.code));
    const pathToCode = new Map(routes.map((r) => [r.path, r.code]));
    /** A page code we can show a thumbnail for: it must be a registered route (D-011 only shoots those). */
    const codeOf = (value: string | null | undefined): string | null => {
      if (!value) return null;
      if (value.startsWith('/')) return pathToCode.get(value) ?? null;
      const m = CODE_RE.exec(value);
      return m && codes.has(m[1]) ? m[1] : null;
    };
    return {
      spaceById,
      aboutSpace,
      rootOf,
      codeOf,
      postById: new Map(posts.rows.map((p) => [p.id, p])),
      deliverableById: new Map(deliverables.rows.map((d) => [d.id, d])),
      toolById: new Map(tools.rows.map((x) => [x.id, x])),
    };
  }, [spaces.rows, posts.rows, deliverables.rows, tools.rows, routes]);

  return useCallback(
    (node: GraphNode): NodeDecor => {
      const { type, id } = parseKey(node.key);
      const typeLabel = (key: string) => {
        const s = t(`spaces.type.${key}`);
        return s === `spaces.type.${key}` ? key : s;
      };
      const glyphImage = (text: string): NodeImage => ({ kind: 'glyph', text });

      // people and roles carry a face, not a dot
      if (type === 'users') {
        const u = DEMO_USERS.find((x) => x.id === id);
        return { image: { kind: 'initials', text: u?.initials ?? initialsOf(node.label) }, lane: 'users', laneLabel: typeLabel('users') };
      }
      if (type === 'roles') {
        const u = isRoleId(id) ? demoUserForRole(id) : undefined;
        return { image: { kind: 'initials', text: u?.initials ?? initialsOf(node.label) }, lane: 'roles', laneLabel: typeLabel('roles') };
      }

      // a hub page behind the node -> its deploy-time thumbnail
      const pageCode =
        type === 'deliverables'
          ? index.codeOf(index.deliverableById.get(id)?.templateDocKind)
          : type === 'tools'
            ? index.codeOf(index.toolById.get(id)?.replacedByModule)
            : null;
      if (pageCode) {
        const glyph = TYPE_GLYPH[type] ?? '◇';
        return { image: { kind: 'thumb', src: thumbSrc(pageCode), text: glyph, code: pageCode }, lane: type, laneLabel: typeLabel(type) };
      }

      if (type === 'spaces') {
        const space = index.spaceById.get(id);
        if (space) {
          const root = index.rootOf(space);
          const aboutRole = space.aboutType === 'roles' && space.aboutId && isRoleId(space.aboutId) ? demoUserForRole(space.aboutId) : undefined;
          return {
            image: aboutRole ? { kind: 'initials', text: aboutRole.initials } : glyphImage(space.glyph || TYPE_GLYPH.spaces),
            lane: `space:${root.id}`,
            laneLabel: root.name,
          };
        }
        return { image: glyphImage(TYPE_GLYPH.spaces), lane: 'spaces', laneLabel: typeLabel('spaces') };
      }

      if (type === 'posts') {
        const post = index.postById.get(id);
        return { image: glyphImage(post ? POST_GLYPH[post.kind] : TYPE_GLYPH.posts), lane: 'posts', laneLabel: typeLabel('posts') };
      }

      // catalog entries borrow the glyph of the space that is about them
      const about = index.aboutSpace.get(`${type}:${id}`);
      return {
        image: glyphImage(about?.glyph || TYPE_GLYPH[type] || '◇'),
        lane: type,
        laneLabel: typeLabel(type),
      };
    },
    [index, t],
  );
}
