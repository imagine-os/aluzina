import type { SpaceTreeNode } from '../../components/organism/SpaceTree/SpaceTree';

/**
 * Every Markdown file of `docs/`, imported lazily through the `@docs` alias (D-037): the viewer reads the
 * repo's own memory, so the in-app docs can never drift from the files an agent reads. `eager: false` keeps
 * each document a separate chunk, so opening the viewer does not download 800 KB of Markdown.
 * `docs/screenshots/` holds images and a route manifest, so nothing there matches `**\/*.md`.
 */
const MODULES = import.meta.glob<string>('@docs/**/*.md', { query: '?raw', import: 'default', eager: false });

/** `plan/plan.json` is not Markdown: it is rendered as a table from the typed `src/plan` module. */
export const PLAN_PATH = 'plan/plan.json';

/** Glob keys are resolved paths (`/…/docs/pages/K-03.md`); the viewer addresses documents by their path inside `docs/`. */
function toRelative(key: string): string {
  const marker = '/docs/';
  const at = key.lastIndexOf(marker);
  if (at !== -1) return key.slice(at + marker.length);
  return key.replace(/^@docs\//, '').replace(/^\.\//, '');
}

const loaders = new Map<string, () => Promise<string>>();
for (const [key, load] of Object.entries(MODULES)) loaders.set(toRelative(key), load as () => Promise<string>);

/** Every document path inside `docs/`, Markdown plus the plan JSON, sorted for a stable tree. */
export const DOC_PATHS: string[] = [...loaders.keys(), PLAN_PATH].sort((a, b) => a.localeCompare(b));

export function hasDoc(path: string): boolean {
  return path === PLAN_PATH || loaders.has(path);
}

/** Loads one document's raw text (the plan is not loaded here: it is already typed data). */
export function loadDoc(path: string): Promise<string> {
  const load = loaders.get(path);
  if (!load) return Promise.reject(new Error(`no document at docs/${path}`));
  return load();
}

/** Root documents in reading order (the rest of the root, if any, follows alphabetically). */
const ROOT_ORDER = ['README.md', 'platform-principles.md', 'project-brief.md', 'build-plan.md', 'kanban.md', 'decisions.md'];
/** Folders in reading order; anything else lands after them, alphabetically. */
const FOLDER_ORDER = ['changelog', 'prompts', 'pages', 'knowledge', 'reference', 'qa', 'plan', 'source'];

const rank = (list: string[], value: string): number => {
  const i = list.indexOf(value);
  return i === -1 ? list.length : i;
};

/** The label shown for a document: `M-01.md` -> `M-01`, the rest of the file name unchanged. */
export function docLabel(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1).replace(/\.md$/, '');
}

export const folderOf = (path: string): string => (path.includes('/') ? path.slice(0, path.indexOf('/')) : '');

/** Folder node id in the tree (a document node's id is its path, so ids can never collide). */
export const folderId = (folder: string): string => `dir:${folder}`;

interface BuildOptions {
  /** Only these paths (search results); every path when undefined. */
  paths?: string[];
  /** Translated label per top-level folder (`docs.folder.<key>`). */
  folderLabel: (folder: string) => string;
}

/**
 * The docs tree: root files first in reading order, then one node per folder in reading order, nested by
 * every path segment. Node kinds reuse the Spaces tree tones (`area` for folders, `topic` for documents).
 */
export function buildTree(options: BuildOptions): SpaceTreeNode[] {
  const paths = options.paths ?? DOC_PATHS;
  const roots = paths.filter((p) => !p.includes('/')).sort((a, b) => rank(ROOT_ORDER, a) - rank(ROOT_ORDER, b) || a.localeCompare(b));
  const folders = [...new Set(paths.filter((p) => p.includes('/')).map(folderOf))].sort((a, b) => rank(FOLDER_ORDER, a) - rank(FOLDER_ORDER, b) || a.localeCompare(b));

  const fileNode = (path: string): SpaceTreeNode => ({ id: path, name: docLabel(path), glyph: '▪', kind: 'topic', children: [] });

  const subtree = (prefix: string, depth: number): SpaceTreeNode[] => {
    const inside = paths.filter((p) => p.startsWith(`${prefix}/`));
    const here = inside.filter((p) => p.split('/').length === depth + 1);
    const deeper = [...new Set(inside.filter((p) => p.split('/').length > depth + 1).map((p) => p.split('/').slice(0, depth + 1).join('/')))];
    return [
      ...deeper.sort((a, b) => a.localeCompare(b)).map((dir) => {
        const children = subtree(dir, depth + 1);
        return { id: folderId(dir), name: `${dir.slice(dir.lastIndexOf('/') + 1)}/`, glyph: '▸', kind: 'topic', count: children.length, children } satisfies SpaceTreeNode;
      }),
      ...here.sort((a, b) => a.localeCompare(b)).map(fileNode),
    ];
  };

  return [
    ...roots.map(fileNode),
    ...folders.map((folder) => {
      const children = subtree(folder, 1);
      return {
        id: folderId(folder),
        name: options.folderLabel(folder),
        glyph: '▣',
        kind: 'area',
        count: paths.filter((p) => folderOf(p) === folder).length,
        children,
      } satisfies SpaceTreeNode;
    }),
  ];
}

/** Every folder node id, so the tree can start fully expanded and `docs.collapseFolder` can address one. */
export function allFolderIds(paths: string[] = DOC_PATHS): string[] {
  const ids = new Set<string>();
  for (const path of paths) {
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) ids.add(folderId(parts.slice(0, i).join('/')));
  }
  return [...ids];
}

/** Resolves a link written inside `docs/<from>` to a path inside `docs/`, or null when it leaves the tree. */
export function resolveDocLink(from: string, href: string): string | null {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  const base = from.includes('/') ? from.slice(0, from.lastIndexOf('/')).split('/') : [];
  const out = clean.startsWith('/') ? [] : [...base];
  for (const part of clean.replace(/^\//, '').split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  const path = out.join('/');
  // Links written from the repo root ("docs/kanban.md") and from inside docs/ ("kanban.md") both resolve.
  if (hasDoc(path)) return path;
  const withoutDocs = path.replace(/^docs\//, '');
  return hasDoc(withoutDocs) ? withoutDocs : null;
}
