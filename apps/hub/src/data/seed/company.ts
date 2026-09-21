import companyRaw from '@docs/archive/company/index.json';
import { mimeTypeOf, slugify } from '../../domain/archive';
import type { Asset, Relation, Tag } from '../schema';
import type { SeedCtx } from './types';

/**
 * Company documents from Dropbox "00 INFORMACION RELEVANTE ALUZINA 2023" (ar-15, step 14, prompt 0017 follow-up).
 * Justin shared this folder's 12 files directly (not inside a year folder), so they are not archive `projects`:
 * they are the studio's own marketing / pricing material plus three third-party references kept for comparison.
 * `docs/archive/company/index.json` is the single source (owner / visibility decided per file, no renderer output
 * for internal or third-party files); this module only derives rows. Read by `modules/brand/DocumentsPage.tsx`
 * (G-08) as a grid below the two brand documents.
 *
 * Rules:
 * - One `assets` row per file (`kind: 'file'`, `source: 'dropbox'`, `stage: 'marketing'`, `year: 2023` from the
 *   folder name). `owner: 'aluzina' | 'third-party'` and `visibility: 'public' | 'internal'` are read straight
 *   from the index (never re-decided here); both surface as tags so the page and any list can filter on them.
 * - Only the five files marked `visibility: 'public'` in the index carry a served thumbnail / page renders; the
 *   three price lists, the internal market-research PDF and the three third-party files are indexed with their
 *   Dropbox link only (no download, no preview) — the index never rendered them either.
 * - No new client, project or space rows: one Spanish `posts` note is filed in the existing Brand Memory area
 *   (`sp-brand-memory`, `seed/spaces.ts`) listing all 12 files with owner / visibility.
 */
export const order = 75;

interface CompanyFile {
  name: string;
  ext: string;
  mimeType: string;
  bytes: number | null;
  modified: string | null;
  sourceHref: string;
  owner: 'aluzina' | 'third-party';
  visibility: 'public' | 'internal';
  tags: string[];
  thumb: string | null;
  pages: string[];
  pageCount: number | null;
  textExcerpt: string;
  palette: string[];
  renderer: string | null;
  note: string;
}

interface CompanyIndex {
  folderName: string;
  sourceUrl: string;
  crawledAt: string;
  files: CompanyFile[];
}

export const COMPANY_INDEX = companyRaw as unknown as CompanyIndex;
export const COMPANY_SPACE_ID = 'sp-brand-memory';
export const COMPANY_YEAR = 2023;

export function companyAssetId(name: string): string {
  return `ast-co-${slugify(name.replace(/\.[a-z0-9]{1,5}$/i, '')) || 'file'}`;
}

type AssetRow = Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;

/** Playbook services a company document argues for; only where the file's subject is unambiguous (D-060 style, inferred). */
const APPLIES_TO: Record<string, readonly string[]> = {
  'INTEROR DESIGN PRESENTATION   .ai': ['03'],
  'MENSAJES DE IMPORTANCIA DE INTERIORISMO.ai': ['03'],
};

export function seed({ add, users }: SeedCtx): void {
  const idx = COMPANY_INDEX;
  const relate = (id: string, row: Omit<Relation, 'id' | 'created_at' | 'updated_at' | 'updated_by' | 'note'> & { note?: string }) => add('relations', id, { note: '', ...row });

  // ---- Tags registry: the tag names this batch introduces (`empresa`, `interno`/`público`, plus what/kind tags) ----
  const tagRows: [string, Tag['tone']][] = [
    ['empresa', 'accent'],
    ['catálogo', 'info'],
    ['presentación', 'info'],
    ['precios', 'warning'],
    ['referencia', 'neutral'],
    ['investigación', 'neutral'],
    ['interno', 'warning'],
    ['público', 'success'],
    ['propio', 'accent'],
    ['terceros', 'neutral'],
  ];
  tagRows.forEach(([name, tone]) => add('tags', `tag-${slugify(name)}`, { name, tone }));

  // ---- Assets: one row per file ----
  for (const f of idx.files) {
    const id = companyAssetId(f.name);
    const thumbnailUrl = f.thumb ? `./archive/company/${f.thumb}` : null;
    add('assets', id, {
      kind: 'file',
      title: f.name,
      titleEs: null,
      slug: id.replace(/^ast-/, ''),
      url: null,
      repoPath: thumbnailUrl ? `apps/hub/public/archive/company/${f.thumb}` : null,
      mimeType: f.mimeType || mimeTypeOf(f.name),
      bytes: f.bytes,
      pageCount: f.pageCount,
      pageNumber: null,
      parentId: null,
      sourceFileId: null,
      sourceName: f.name,
      publishedAt: null,
      language: 'es',
      palette: f.palette,
      fonts: [],
      textExcerpt: f.textExcerpt,
      tags: ['empresa', f.owner === 'aluzina' ? 'propio' : 'terceros', ...f.tags, f.visibility === 'public' ? 'público' : 'interno'],
      status: 'current',
      supersedesId: null,
      source: 'dropbox',
      sourceUrl: f.sourceHref,
      folderPath: '',
      thumbnailUrl,
      previewUrls: f.pages.map((p) => `./archive/company/${p}`),
      stage: 'marketing',
      year: COMPANY_YEAR,
    } satisfies AssetRow);

    const services = APPLIES_TO[f.name];
    if (services) {
      for (const code of services) {
        relate(`rel-${id}-applies-to-${code}`, { fromType: 'assets', fromId: id, toType: 'services', toId: code, kind: 'applies-to', note: 'Servicio del playbook más cercano al contenido del documento (estimación).' });
      }
    }
  }

  // ---- One Spanish note in Brand Memory listing the 12 files with owner / visibility ----
  const lines = idx.files.map((f) => {
    const owner = f.owner === 'aluzina' ? 'Aluzina' : 'terceros';
    const vis = f.visibility === 'public' ? 'público' : 'interno';
    return `- \`${f.name}\` — ${owner}, ${vis}${f.note ? `: ${f.note}` : ''}`;
  });
  add('posts', 'post-company-docs-2023', {
    title: '00 INFORMACION RELEVANTE ALUZINA 2023: 12 archivos de Dropbox',
    kind: 'note',
    authorId: users.brand,
    url: idx.sourceUrl,
    pinned: false,
    status: 'published',
    tags: ['empresa', 'archive', 'dropbox'],
    body: `Carpeta de Dropbox "${idx.folderName}" (rastreada ${idx.crawledAt}): catálogos, presentaciones y listas de precios de Aluzina, más tres documentos de referencia de terceros. Cinco archivos propios y públicos tienen vista previa en G-08 (Documentos de marca); los tres listados de precios y el estudio de mercado quedan solo indexados (no se renderizan precios); los tres de terceros quedan solo indexados y enlazados (derechos de autor).\n\n${lines.join('\n')}`,
  });
  add('filings', 'fil-company-docs-2023-1', { postId: 'post-company-docs-2023', spaceId: COMPANY_SPACE_ID });
}
