/**
 * Dropbox collections (G-09 "Campaigns & assets"): two shared folders indexed outside the app into
 * `docs/archive/collections/<slug>/index.json` and served from `apps/hub/public/archive/<slug>/`.
 *
 * Unlike the project archive (prompt 0017), a collection index is **not** seeded into the data store:
 * the per-file rows are far too many for the localStorage provider and would bloat the main bundle.
 * The page reads the index with a **lazy** `import.meta.glob`, so the JSON is a separate chunk fetched
 * only when someone opens the page, and the hub's first paint never pays for it. The seed exposes one
 * `assets` row per *set* (kind `file`, tag `colección`) for cross-linking; the page must work without it.
 *
 * Paths inside the index (`thumb`, `pages[]`, `cover`, `contactSheet`) are relative to the served folder;
 * turn one into a URL with `servedUrl()` (relative, so the app survives the GitHub Pages sub-path).
 * A redacted row has `thumb: null` and `pages: []` by design (D-059: never a broken image); a
 * folder-level redacted row carries a folder in `path` and an empty `ext`.
 */

export type CollectionSlug = 'campaign-2021' | 'studio-assets';

export type CollectionSetKind =
  | 'social-posts'
  | 'ads'
  | 'banners'
  | 'photo-shoot'
  | 'project-photos'
  | 'renders'
  | 'icons'
  | 'qr'
  | 'merch'
  | 'presentations'
  | 'methodology'
  | 'articles'
  | 'website'
  | 'video'
  | 'fonts'
  | 'sources'
  | 'templates'
  | 'company-docs'
  | 'internal';

export type Visibility = 'public' | 'internal';

export interface CollectionSet {
  id: string;
  folder: string;
  title: string;
  titleEs: string;
  kind: CollectionSetKind;
  visibility: Visibility;
  fileCount: number;
  bytes: number;
  redactedCount: number;
  cover: string | null;
  contactSheet: string | null;
  projectIds: string[];
  year: number | null;
  note: string;
  noteEs: string;
}

export interface CollectionFile {
  path: string;
  name: string;
  setId: string;
  ext: string;
  mimeType: string;
  bytes: number;
  width: number | null;
  height: number | null;
  pageCount: number | null;
  md5: string | null;
  thumb: string | null;
  pages: string[];
  textExcerpt: string;
  palette: string[];
  redacted: boolean;
  visibility: Visibility;
  owner: 'aluzina' | 'third-party';
  tags: string[];
  duplicateOf: string | null;
  note: string;
}

export interface CollectionIndex {
  collection: CollectionSlug;
  title: string;
  titleEs: string;
  caption: string;
  sourceUrl: string;
  sharedBy: string;
  sharedAt: string;
  indexedAt: string;
  totals: { files: number; bytes: number; redacted: number; served: { thumbs: number; pages: number; sheets: number; bytes: number } };
  sets: CollectionSet[];
  files: CollectionFile[];
}

export const COLLECTION_SLUGS: CollectionSlug[] = ['campaign-2021', 'studio-assets'];

/**
 * Lazy (non-eager) on purpose: each index is its own chunk, fetched when the page asks for it.
 * Making this eager would put every file row of every collection in the main bundle.
 */
export const collectionLoaders = import.meta.glob('@docs/archive/collections/*/index.json', { import: 'default' }) as Record<string, () => Promise<CollectionIndex>>;

/** Loads one collection index; throws a message that names the missing file, so the page can show it. */
export async function loadCollection(slug: CollectionSlug): Promise<CollectionIndex> {
  const suffix = `/${slug}/index.json`;
  const key = Object.keys(collectionLoaders).find((k) => k.endsWith(suffix));
  if (!key) throw new Error(`[collections] no index for "${slug}" (expected docs/archive/collections${suffix})`);
  return collectionLoaders[key]();
}

/** Served URL of a path inside a collection's public folder; relative, so it survives the Pages sub-path. */
export function servedUrl(slug: CollectionSlug, rel: string): string {
  return `./archive/${slug}/${rel}`;
}

/** True when `value` is one of the two collection slugs (guards a URL param or an action argument). */
export function isCollectionSlug(value: unknown): value is CollectionSlug {
  return typeof value === 'string' && (COLLECTION_SLUGS as readonly string[]).includes(value);
}
