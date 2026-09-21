import { useCallback, useMemo } from 'react';
import { DEMO_USERS } from '../../auth/demoUsers';
import { ROLE_META, ROLES, isRoleId } from '../../auth/roles';
import { useTable } from '../../data/DataContext';
import type { Asset, Space } from '../../data/schema';
import { SERVICES, pick } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';

/**
 * Every entity type a relation may point at (D-026) and how to name and open it. `roles`, `users` and
 * `services` (the playbook's five services, id = code) are registries, not tables. Adding a type here is the
 * one change needed for a new relation target.
 */
export const RELATABLE_TYPES = ['spaces', 'posts', 'projects', 'tasks', 'documents', 'clients', 'deliverables', 'tools', 'roles', 'users', 'competitions', 'brandAssets', 'presentations', 'assets', 'services'] as const;
export type RelatableType = (typeof RELATABLE_TYPES)[number];

export interface Resolved {
  label: string;
  /** Translated type name. */
  sub: string;
  /** Hash-router path that opens the entity, or null. */
  route: string | null;
}

export interface EntityOption {
  id: string;
  label: string;
}

export interface EntityIndex {
  resolve: (type: string, id: string) => Resolved | null;
  /** Up to `limit` entities of a type whose label matches the query. */
  search: (type: string, query: string, limit?: number) => EntityOption[];
  spaces: Space[];
  loading: boolean;
}

/** The Work views exist on the four portals; from dev or client surfaces we open them in the founder portal. */
function workSurface(surface: Surface): Surface {
  return surface === 'founder' || surface === 'ops' || surface === 'studio' || surface === 'brand' ? surface : 'founder';
}

export function useEntityIndex(surface: Surface): EntityIndex {
  const { t, lang } = useT();
  const spaces = useTable('spaces');
  const posts = useTable('posts');
  const projects = useTable('projects');
  const tasks = useTable('tasks');
  const documents = useTable('documents');
  const clients = useTable('clients');
  const deliverables = useTable('deliverables');
  const tools = useTable('tools');
  const competitions = useTable('competitions');
  const brandAssets = useTable('brandAssets');
  const presentations = useTable('presentations');
  const assets = useTable('assets');
  const loading = [spaces, posts, projects, tasks, documents, clients, deliverables, tools, competitions, brandAssets, presentations, assets].some((x) => x.loading);

  const base = `/${surface}/spaces`;
  const work = `/${workSurface(surface)}/work`;

  const tables = useMemo(() => {
    const roleSpace = new Map(spaces.rows.filter((s) => s.aboutType === 'roles' && s.aboutId).map((s) => [s.aboutId as string, s.id]));
    const m: Record<string, { list: () => EntityOption[]; find: (id: string) => Resolved | null }> = {
      spaces: { list: () => spaces.rows.map((s) => ({ id: s.id, label: s.name })), find: (id) => nameOf(spaces.rows, id, (s) => s.name, `${base}/${id}`, t('spaces.type.spaces')) },
      posts: { list: () => posts.rows.map((p) => ({ id: p.id, label: p.title })), find: (id) => nameOf(posts.rows, id, (p) => p.title, `${base}/post/${id}`, t('spaces.type.posts')) },
      projects: { list: () => projects.rows.map((p) => ({ id: p.id, label: p.name })), find: (id) => nameOf(projects.rows, id, (p) => p.name, `${work}/${id}`, t('spaces.type.projects')) },
      tasks: { list: () => tasks.rows.map((x) => ({ id: x.id, label: x.title })), find: (id) => nameOf(tasks.rows, id, (x) => x.title, work, t('spaces.type.tasks')) },
      documents: { list: () => documents.rows.map((d) => ({ id: d.id, label: d.title })), find: (id) => nameOf(documents.rows, id, (d) => d.title, '/ops/documents', t('spaces.type.documents')) },
      clients: { list: () => clients.rows.map((c) => ({ id: c.id, label: c.name })), find: (id) => nameOf(clients.rows, id, (c) => c.name, `${base}/catalog?tab=clients`, t('spaces.type.clients')) },
      deliverables: { list: () => deliverables.rows.map((d) => ({ id: d.id, label: d.name })), find: (id) => nameOf(deliverables.rows, id, (d) => d.name, `${base}/catalog?tab=deliverables`, t('spaces.type.deliverables')) },
      tools: { list: () => tools.rows.map((x) => ({ id: x.id, label: x.name })), find: (id) => nameOf(tools.rows, id, (x) => x.name, `${base}/catalog?tab=tools`, t('spaces.type.tools')) },
      competitions: { list: () => competitions.rows.map((c) => ({ id: c.id, label: c.name ?? c.id })), find: (id) => nameOf(competitions.rows, id, (c) => c.name ?? c.id, '/brand/competitions', t('spaces.type.competitions')) },
      brandAssets: { list: () => brandAssets.rows.map((a) => ({ id: a.id, label: a.name })), find: (id) => nameOf(brandAssets.rows, id, (a) => a.name, '/brand/assets', t('spaces.type.brandAssets')) },
      presentations: { list: () => presentations.rows.map((p) => ({ id: p.id, label: p.title })), find: (id) => nameOf(presentations.rows, id, (p) => p.title, '/brand/presentations', t('spaces.type.presentations')) },
      // Documents open on G-08 (`?doc=<slug>`); a page opens its document at that page (page renders are not served by the app).
      assets: { list: () => assets.rows.map((a) => ({ id: a.id, label: assetLabel(a, lang) })), find: (id) => nameOf(assets.rows, id, (a) => assetLabel(a, lang), assetRoute(assets.rows, id), t('spaces.type.assets')) },
      services: {
        list: () => SERVICES.map((s) => ({ id: s.code, label: `${s.code} · ${pick(s.name, lang)}` })),
        find: (id) => {
          const s = SERVICES.find((x) => x.code === id);
          return s ? { label: `${s.code} · ${pick(s.name, lang)}`, sub: t('spaces.type.services'), route: `/manual/services/${s.slug}` } : null;
        },
      },
      roles: {
        list: () => ROLES.map((r) => ({ id: r, label: t(ROLE_META[r].labelKey) })),
        find: (id) => (isRoleId(id) ? { label: t(ROLE_META[id].labelKey), sub: t('spaces.type.roles'), route: roleSpace.has(id) ? `${base}/${roleSpace.get(id)}` : ROLE_META[id].homePath } : null),
      },
      users: {
        list: () => DEMO_USERS.map((u) => ({ id: u.id, label: u.name })),
        find: (id) => {
          const u = DEMO_USERS.find((x) => x.id === id);
          return u ? { label: u.name, sub: t('spaces.type.users'), route: null } : null;
        },
      },
    };
    return m;
  }, [spaces.rows, posts.rows, projects.rows, tasks.rows, documents.rows, clients.rows, deliverables.rows, tools.rows, competitions.rows, brandAssets.rows, presentations.rows, assets.rows, base, work, t, lang]);

  const resolve = useCallback((type: string, id: string) => tables[type]?.find(id) ?? null, [tables]);
  const search = useCallback(
    (type: string, query: string, limit = 8) => {
      const q = query.trim().toLowerCase();
      const all = tables[type]?.list() ?? [];
      return (q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all).slice(0, limit);
    },
    [tables],
  );

  return { resolve, search, spaces: spaces.rows, loading };
}

function nameOf<T extends { id: string }>(rows: T[], id: string, label: (r: T) => string, route: string | null, sub: string): Resolved | null {
  const r = rows.find((x) => x.id === id);
  return r ? { label: label(r), sub, route } : null;
}

function assetLabel(a: Asset, lang: 'en' | 'es'): string {
  return lang === 'es' && a.titleEs ? a.titleEs : a.title;
}

/** G-08 route of an asset: the document itself, or the parent document opened at the page's number. */
function assetRoute(rows: Asset[], id: string): string | null {
  const a = rows.find((x) => x.id === id);
  if (!a) return null;
  if (a.kind === 'document') return `/brand/documents?doc=${a.slug}`;
  const parent = a.parentId ? rows.find((x) => x.id === a.parentId) : undefined;
  if (parent) return `/brand/documents?doc=${parent.slug}${a.pageNumber ? `&page=${a.pageNumber}` : ''}`;
  return a.url ? '/brand/documents' : null;
}
