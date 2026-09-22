import { useEffect, useMemo, useState } from 'react';
import { useTable } from './DataContext';
import { rowsFromDeepIndex, type DeepIndex } from './archiveRows';
import type { DataProvider, NewRow, Patch } from './provider';
import type { Asset, Project } from './schema';

/**
 * Archived files are lazy chunks plus patch rows, never seeded (ar-19, D-071 proposed). One JSON per project folder under
 * `docs/archive/projects/<slug>/index.json` is a lazy chunk of the bundle (`import.meta.glob`, not eager): the seed holds only the
 * `projects` row (with `fileCount`, `coverUrl`, `archiveSlug`), and a project's `assets` rows are built in memory from its chunk the
 * first time a page asks for them. Only the files a person edits (tags, stage) become stored rows, created with the SAME id as the
 * in-memory row, so the stored row overlays the chunk row and travels through `subscribe` to every list and tab (P-14, D-023).
 * Supabase later: the chunk stays the source of the unedited rows; the patch rows move to a table behind the same provider.
 */

/** Vite resolves the `@docs` alias inside the glob (mirrored in tsconfig `paths`); the key is whatever path form Vite emits, so the slug is read from the tail. */
const CHUNKS = import.meta.glob('@docs/archive/projects/*/index.json', { import: 'default' }) as Record<string, () => Promise<unknown>>;
const LOADERS: Record<string, () => Promise<unknown>> = Object.fromEntries(
  Object.entries(CHUNKS).flatMap(([file, load]) => {
    const m = /\/projects\/([^/]+)\/index\.json$/.exec(file);
    return m ? [[m[1], load]] : [];
  }),
);

/** Slugs that have a chunk (one per project folder of `docs/archive/index.json`, admin folders excepted). */
export const ARCHIVE_CHUNK_SLUGS: readonly string[] = Object.keys(LOADERS).sort();

export function hasProjectChunk(slug: string | null | undefined): boolean {
  return Boolean(slug && LOADERS[slug]);
}

const cache = new Map<string, Promise<Asset[]>>();

/**
 * The in-memory `assets` rows of one project, from its chunk; cached per slug for the session (the chunk is static data). Rejects
 * when the slug has no chunk or the chunk fails to load (offline); callers show an EmptyState, never an empty list that lies.
 */
export function loadProjectFiles(slug: string, year: number | null = null): Promise<Asset[]> {
  let pending = cache.get(slug);
  if (!pending) {
    const load = LOADERS[slug];
    pending = load
      ? load().then((mod) => rowsFromDeepIndex(slug, mod as DeepIndex, year))
      : Promise.reject(new Error(`[archive] no file index for "${slug}" (docs/archive/projects/${slug}/index.json)`));
    cache.set(slug, pending);
    pending.catch(() => cache.delete(slug));
  }
  return pending;
}

export interface ProjectFilesState {
  /** Chunk rows in file order, each replaced by the stored row of the same id when one exists (edits win). */
  rows: Asset[];
  loading: boolean;
  error: string | null;
}

const NO_ROWS: Asset[] = [];

/**
 * Live files of a project: the chunk rows overlaid by the provider's `assets` rows with the same id, so a tag saved here or in
 * another tab re-renders through `subscribe` (D-023). A project without `archiveSlug` (born in the hub) has no files and is not loading.
 */
export function useProjectFiles(project: Project | null | undefined): ProjectFilesState {
  const slug = project?.archiveSlug ?? null;
  const year = project?.year ?? null;
  const [state, setState] = useState<{ slug: string | null; base: Asset[]; error: string | null }>({ slug: null, base: NO_ROWS, error: null });

  useEffect(() => {
    if (!slug) {
      setState({ slug: null, base: NO_ROWS, error: null });
      return;
    }
    let alive = true;
    loadProjectFiles(slug, year).then(
      (rows) => alive && setState({ slug, base: rows, error: null }),
      (err: unknown) => alive && setState({ slug, base: NO_ROWS, error: err instanceof Error ? err.message : String(err) }),
    );
    return () => {
      alive = false;
    };
  }, [slug, year]);

  // Stored file rows: the company documents (seed/company.ts) plus every archived file someone edited. Small by design.
  const stored = useTable('assets', { where: { kind: 'file' } });

  const rows = useMemo(() => {
    if (state.base.length === 0) return NO_ROWS;
    const byId = new Map(stored.rows.map((r) => [r.id, r]));
    return state.base.map((r) => byId.get(r.id) ?? r);
  }, [state.base, stored.rows]);

  const loading = Boolean(slug) && (state.slug !== slug || stored.loading);
  return { rows, loading, error: state.slug === slug ? state.error : null };
}

/**
 * Persist an edit to an archived file as a row (ar-19): `update` when the row is already stored (with `basedOn` so a stale edit
 * raises the D-024 conflict), else `create` with the chunk row's own id so the stored row overlays it everywhere; the first
 * create also writes the `belongs-to` relation to the project (D-026), which is how S-12 counts curated files per project.
 * `baseRow` is the row the person was looking at (chunk or stored, whatever `useProjectFiles` returned).
 */
export async function saveFilePatch(data: DataProvider, baseRow: Asset, patch: Patch<'assets'>, projectId: string | null): Promise<Asset> {
  const stored = await data.get('assets', baseRow.id);
  if (stored) return data.update('assets', baseRow.id, patch, { basedOn: baseRow.updated_at });
  const draft: Record<string, unknown> = { ...baseRow, ...patch };
  delete draft.id;
  delete draft.created_at;
  delete draft.updated_at;
  delete draft.updated_by;
  const created = await data.create('assets', draft as unknown as NewRow<'assets'>, baseRow.id);
  if (projectId) {
    await data.create(
      'relations',
      { fromType: 'assets', fromId: baseRow.id, toType: 'projects', toId: projectId, kind: 'belongs-to', note: 'Archivo del archivo curado en S-13 (ar-19): la fila guarda la edición, el índice del proyecto el resto.' },
      `rel-${baseRow.id}-belongs-to`,
    );
  }
  return created;
}
