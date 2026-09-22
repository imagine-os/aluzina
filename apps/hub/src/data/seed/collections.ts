import campaignSets from '@docs/archive/collections/campaign-2021/sets.json';
import studioSets from '@docs/archive/collections/studio-assets/sets.json';
import type { CollectionSet, CollectionSlug } from '../../domain/collections';
import { slugify } from '../../domain/archive';
import type { Asset, Relation, Tag } from '../schema';
import type { SeedCtx } from './types';

/**
 * Dropbox collections shared by Aleja Guerra through Justin Massion in Slack #all-aluzina (2026-09-21): the 2021
 * digital campaign and the studio's asset folder ("services, lighting, presentations, projects, icons"). Indexed
 * outside the app by `scripts/archive/index-collection.py`, which writes `docs/archive/collections/<slug>/index.json`
 * (every file, read lazily by G-09 through `domain/collections.ts`) and the compact `sets.json` this module imports
 * eagerly.
 *
 * Rules:
 * - **One `assets` row per set, never per file.** The store sits at 3.66 MB of a 4.5 MB line (D-070); the file rows
 *   (1,700) stay in the JSON and the page loads them on demand. A set row is a `file` from `dropbox` at stage
 *   `marketing`, its thumbnail the set cover, its preview the contact sheet when one exists, its `folderPath` the
 *   set folder, its `sourceUrl` the collection's share link (files carry no per-file href, D-059 R6).
 * - Tags: `colección`, the set kind, `público` / `interno` (the set's visibility as decided by the indexer), and the
 *   collection tag (`campaña 2021` / `assets estudio`). New tag names get registry rows here; `público` / `interno`
 *   already exist (`seed/company.ts`).
 * - `relations` set -> project (`depicts`, D-060 inferred, the note says so) only for ids the indexer matched
 *   against existing rows (`prj-ar-*` archive, `prj-pf-*` portfolio); nothing is invented.
 * - One Spanish `posts` note per collection in Brand Memory (`sp-brand-memory`) listing every set with visibility.
 */
export const order = 76;

interface SetsFile {
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
}

export const COLLECTION_SETS: Record<CollectionSlug, SetsFile> = {
  'campaign-2021': campaignSets as unknown as SetsFile,
  'studio-assets': studioSets as unknown as SetsFile,
};
export const COLLECTION_TAGS: Record<CollectionSlug, string> = { 'campaign-2021': 'campaña 2021', 'studio-assets': 'assets estudio' };
export const COLLECTION_SPACE_ID = 'sp-brand-memory';

export function collectionAssetId(slug: CollectionSlug, setId: string): string {
  return `ast-col-${slugify(slug)}-${setId}`;
}

type AssetRow = Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;

const KIND_TAGS: Record<string, string> = {
  'social-posts': 'redes sociales',
  ads: 'anuncios',
  banners: 'banners',
  'photo-shoot': 'sesión fotográfica',
  'project-photos': 'fotos de proyecto',
  renders: 'renders',
  icons: 'iconos',
  qr: 'códigos qr',
  merch: 'merchandising',
  presentations: 'presentación',
  methodology: 'metodología',
  articles: 'artículos',
  website: 'página web',
  video: 'video',
  fonts: 'fuentes',
  sources: 'fuentes editables',
  templates: 'plantillas',
  'company-docs': 'empresa',
  internal: 'interno',
};

export function seed({ add, users }: SeedCtx): void {
  const relate = (id: string, row: Omit<Relation, 'id' | 'created_at' | 'updated_at' | 'updated_by' | 'note'> & { note?: string }) => add('relations', id, { note: '', ...row });

  // ---- Tags registry: only names no other seed registers (`público`, `interno`, `empresa`, `presentación`, `plantillas` exist) ----
  const tagRows: [string, Tag['tone']][] = [
    ['colección', 'accent'],
    ['campaña 2021', 'info'],
    ['assets estudio', 'info'],
    ['redes sociales', 'info'],
    ['anuncios', 'info'],
    ['banners', 'info'],
    ['sesión fotográfica', 'neutral'],
    ['fotos de proyecto', 'neutral'],
    ['renders', 'neutral'],
    ['iconos', 'accent'],
    ['códigos qr', 'neutral'],
    ['merchandising', 'neutral'],
    ['metodología', 'success'],
    ['artículos', 'info'],
    ['página web', 'info'],
    ['video', 'info'],
    ['fuentes', 'neutral'],
    ['fuentes editables', 'neutral'],
  ];
  tagRows.forEach(([name, tone]) => add('tags', `tag-${slugify(name)}`, { name, tone }));

  for (const slug of Object.keys(COLLECTION_SETS) as CollectionSlug[]) {
    const col = COLLECTION_SETS[slug];
    for (const s of col.sets) {
      const id = collectionAssetId(slug, s.id);
      const thumbnailUrl = s.cover ? `./archive/${slug}/${s.cover}` : null;
      add('assets', id, {
        kind: 'file',
        title: s.title,
        titleEs: s.titleEs,
        slug: id.replace(/^ast-/, ''),
        url: null,
        repoPath: thumbnailUrl ? `apps/hub/public/archive/${slug}/${s.cover}` : null,
        mimeType: 'inode/directory',
        bytes: s.bytes,
        pageCount: null,
        pageNumber: null,
        parentId: null,
        sourceFileId: null,
        sourceName: s.folder || '(root)',
        publishedAt: null,
        language: 'es',
        palette: [],
        fonts: [],
        textExcerpt: s.note,
        tags: ['colección', KIND_TAGS[s.kind] ?? s.kind, s.visibility === 'public' ? 'público' : 'interno', COLLECTION_TAGS[slug]],
        status: 'current',
        supersedesId: null,
        source: 'dropbox',
        sourceUrl: col.sourceUrl,
        folderPath: s.folder,
        thumbnailUrl,
        previewUrls: s.contactSheet ? [`./archive/${slug}/${s.contactSheet}`] : [],
        stage: 'marketing',
        year: s.year,
      } satisfies AssetRow);
      for (const projectId of s.projectIds) {
        relate(`rel-${id}-depicts-${projectId}`, { fromType: 'assets', fromId: id, toType: 'projects', toId: projectId, kind: 'depicts', note: 'Vínculo inferido del nombre de la carpeta o del archivo (D-060); confirmar con la fundadora.' });
      }
    }

    // ---- One Spanish note per collection in Brand Memory ----
    const lines = col.sets.map((s) => {
      const vis = s.visibility === 'public' ? 'público' : 'interno';
      const links = s.projectIds.length ? ` · proyectos: ${s.projectIds.map((p) => `\`${p}\``).join(', ')}` : '';
      return `- **${s.titleEs}** (\`${s.id}\`, ${s.fileCount} archivos, ${vis}${s.redactedCount ? `, ${s.redactedCount} redactados` : ''})${links}${s.noteEs ? `: ${s.noteEs}` : ''}`;
    });
    const postId = `post-collection-${slug}`;
    add('posts', postId, {
      title: `${col.titleEs}: ${col.totals.files} archivos de Dropbox en ${col.sets.length} conjuntos`,
      kind: 'note',
      authorId: users.brand,
      url: col.sourceUrl,
      pinned: false,
      status: 'published',
      tags: ['colección', COLLECTION_TAGS[slug], 'archive', 'dropbox'],
      body: `Carpeta de Dropbox compartida por ${col.sharedBy} el ${col.sharedAt} ("${col.caption}"), indexada ${col.indexedAt.slice(0, 10)} con \`scripts/archive/index-collection.py\`: ${col.totals.files} archivos, ${col.totals.redacted} redactados (D-059), ${col.totals.served.thumbs} miniaturas, ${col.totals.served.pages} páginas y ${col.totals.served.sheets} hojas de contactos servidas (${(col.totals.served.bytes / 1048576).toFixed(1)} MB). El índice completo vive en \`docs/archive/collections/${slug}/index.json\` y se ve en G-09.\n\n${lines.join('\n')}`,
    });
    add('filings', `fil-collection-${slug}-1`, { postId, spaceId: COLLECTION_SPACE_ID });
  }
}
