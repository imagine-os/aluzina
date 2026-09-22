import { fileTypeOf, mimeTypeOf, slugify, stageFor, type DeliveryStage } from '../domain/archive';
import type { Asset } from './schema';
import { SEED_AT } from './seed/types';

/**
 * A project's file index as `scripts/archive/build-index.mjs` writes it to `docs/archive/projects/<slug>/index.json` (ar-19): the
 * same shape for a deep index (every file to full depth, with served renders) and for a shallow one (`depth: 1`, the folder's
 * direct child files, no renders). Redaction (D-059) is already applied: a redacted file carries its display name and no preview.
 */
export interface DeepFile {
  /** Folder path plus file name, `/`-separated, original (redacted) segment names. */
  path: string;
  name: string;
  ext: string;
  mimeType: string | null;
  bytes: number | null;
  modified: string | null;
  sourceHref: string | null;
  downloaded: boolean;
  slug: string;
  /** Served thumbnail relative to `apps/hub/public/archive/<slug>/` (`thumbs/<file>.jpg`) or null. */
  thumb: string | null;
  pages: string[];
  pageCount: number | null;
  textExcerpt: string;
  palette: string[];
  renderer: string | null;
  redacted?: boolean;
  redactedReason?: string;
}

export interface DeepIndex {
  folderName: string;
  sourceUrl: string;
  crawledAt: string;
  indexedAt?: string;
  /** Deepest level a listed file sits at: 1 = the folder's own files only; 0 for an empty folder. */
  depth?: number;
  fileCount: number;
  totalBytes: number;
  files: DeepFile[];
}

function dirname(path: string): string {
  const i = path.lastIndexOf('/');
  return i === -1 ? '' : path.slice(0, i);
}

/**
 * Asset ids of a chunk's files, in file order: `ast-ar-<slug>-<slugify(name without extension) || 'file'>`, then `-2`, `-3`, … on a
 * collision inside the project (two `render.jpg` in different folders), never re-issuing an id already given. `build-index.mjs` ports this rule (`rowIds`) to name the
 * project cover (`cover.assetId` in `docs/archive/index.json`), so a change here is a change there too.
 */
export function archiveAssetIds(slug: string, files: readonly Pick<DeepFile, 'name'>[]): string[] {
  const used = new Set<string>();
  const seen = new Map<string, number>();
  return files.map((f) => {
    const base = `ast-ar-${slug}-${slugify(f.name.replace(/\.[a-z0-9]{1,5}$/i, '')) || 'file'}`;
    let n = seen.get(base) ?? 1;
    let id = n === 1 ? base : `${base}-${n}`;
    // A suffixed id can collide with a file literally named "… 2" (`render.jpg` twice next to `render 2.jpg`): keep counting until free.
    while (used.has(id)) {
      n += 1;
      id = `${base}-${n}`;
    }
    seen.set(base, n + 1);
    used.add(id);
    return id;
  });
}

/**
 * The `assets` rows (`kind: 'file'`, `source: 'dropbox'`) of one project's chunk, exactly as `seed/archive.ts` built them until ar-19,
 * now in memory only: `stage` from `stageFor(folderPath, name)`, tags `archive` + file type + stage (+ `confidencial` when
 * redacted), served renders under `./archive/<slug>/`, `year` the project's year. Pure: same input, same rows; the timestamps are
 * `SEED_AT` so a row that was never edited reads as seed data. Stored patch rows (`archiveFiles.ts` `saveFilePatch`) share these ids.
 */
export function rowsFromDeepIndex(slug: string, index: DeepIndex, year: number | null): Asset[] {
  const ids = archiveAssetIds(slug, index.files);
  return index.files.map((f, i) => {
    const folderPath = dirname(f.path);
    const stage: DeliveryStage = stageFor(folderPath, f.name);
    const thumbnailUrl = f.thumb && !f.redacted ? `./archive/${slug}/${f.thumb}` : null;
    return {
      id: ids[i],
      created_at: SEED_AT,
      updated_at: SEED_AT,
      kind: 'file',
      title: f.name,
      titleEs: null,
      slug: ids[i].replace(/^ast-/, ''),
      url: null,
      // Served copies are the visual memory (D-058): the same file the browser loads, nothing under docs/.
      repoPath: thumbnailUrl ? `apps/hub/public/archive/${slug}/${f.thumb}` : null,
      mimeType: f.mimeType || mimeTypeOf(f.name),
      bytes: f.bytes,
      pageCount: f.pageCount,
      pageNumber: null,
      parentId: null,
      sourceFileId: null,
      sourceName: f.name,
      publishedAt: null,
      language: null,
      palette: f.redacted ? [] : f.palette,
      fonts: [],
      textExcerpt: f.redacted ? '' : (f.textExcerpt ?? ''),
      tags: ['archive', fileTypeOf(f.name), stage, ...(f.redacted ? ['confidencial'] : [])],
      status: 'current',
      supersedesId: null,
      source: 'dropbox',
      sourceUrl: f.sourceHref,
      folderPath,
      thumbnailUrl,
      previewUrls: f.redacted ? [] : f.pages.map((p) => `./archive/${slug}/${p}`),
      stage,
      year,
    };
  });
}
