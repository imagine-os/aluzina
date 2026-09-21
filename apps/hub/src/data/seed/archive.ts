import inventoryRaw from '@docs/archive/index.json';
import {
  DELIVERY_STAGES,
  PROJECT_TYPE_TAGS,
  compareFolderPaths,
  deliveryStage,
  fileTypeOf,
  folderLabel,
  mimeTypeOf,
  normalize,
  projectTypeFromName,
  slugify,
  stageFor,
  stripNumberPrefix,
  titleCase,
  yearOf,
  type DeliveryStage,
} from '../../domain/archive';
import type { Asset, Post, Project, Relation, Space, Tag } from '../schema';
import { PROJECT_IDS } from './projects';
import type { SeedCtx } from './types';

/**
 * The project archive as data (prompt 0017, S-12, D-055 pending). Justin shared Aluzina's Dropbox project folders
 * (2019-2026, ~130 folders) in Slack; two crawlers wrote `docs/archive/index.json` (one entry per project folder
 * with its direct children) and `docs/archive/projects/<slug>/index.json` (every file of a featured project, with
 * thumbnails and page renders). Both are imported through `@docs` so the JSON stays the single source; this file
 * only derives rows. `scripts/archive/build-index.mjs` writes both files (redacted, D-059) from the crawler output.
 *
 * Seeding rules (unknowns are explicit, never guessed silently — D-045 precedent; inferred facts marked, D-060):
 * - One `projects` row per inventory entry with `kind: 'project'`, id `prj-ar-<id>`. Type comes from the folder
 *   name (`projectTypeFromName`), status from the year folder (2026 -> in progress, else closed / delivered); the
 *   summary says both are INFERRED ("confirmar con la fundadora"). The client is `'unknown'` unless the folder
 *   name says SODIME / COASSIST / HOY / SPORTI (existing client rows, relation `for-client`); no new client rows.
 * - `startDate` is `<year>-01-01`; the "2019-2023" folder is a range, so `year` is null and the date is 2019-01-01
 *   (the summary says so).
 * - Entries with `kind: 'admin'` (invoice folders) are NOT projects: each file becomes a `posts` row of kind `file`
 *   (url = the Dropbox href) filed in `sp-ar-admin`. Entries with `kind: 'quote'` (a folder that is only a quotation)
 *   ARE projects, on the prospects shelf: `pipelineStatus: 'proposal-sent'`, `phase: 'lead'`, tag `cotización`
 *   (a quotation-only folder is the studio's record of a prospect; inferred, the summary says so).
 * - Redacted files (D-059, `redacted: true` from build-index) keep the redacted name as title, get the tag
 *   `confidencial`, no excerpt, no thumbnail and no page renders.
 * - One `assets` row (`kind: 'file'`, `source: 'dropbox'`) per child FILE of every project folder; folders are not
 *   rows (the project view groups by `folderPath`), only counted in the summary. For a project with a deep index the
 *   deep index replaces the shallow children: one row per file with `folderPath`, `stage`, thumbnail and page
 *   renders served from `apps/hub/public/archive/<slug>/{thumbs,pages}/` (the integrator copies them).
 * - Spaces: under the existing `sp-archive`, one area per year folder (`sp-ar-<yearFolder>`), one project space per
 *   archived project inside its year, and `sp-ar-admin`. One Spanish `posts` note per FEATURED project listing the
 *   folder tree by stage.
 * - Tags: `archive`, `dropbox`, each year folder, the Spanish type tags, and every DeliveryStage id (tone by
 *   pipeline group). Tags that other seeds already register (`marketing`, `iluminación`) are not repeated.
 */
export const order = 70;

interface InventoryChild {
  name: string;
  is_dir: boolean;
  ext: string;
  size: number | null;
  modified: string | null;
  href: string;
  /** D-059: the name is "<Tipo> (redactado).<ext>"; the row gets the tag `confidencial` and no excerpt or preview. */
  redacted?: boolean;
}

interface InventoryProject {
  id: string;
  folderName: string;
  yearFolder: string;
  year: number | null;
  numberPrefix: string | null;
  sourceHref: string;
  fileCount: number;
  dirCount: number;
  extensions: Record<string, number>;
  totalBytesKnown: number;
  latestModified: string | null;
  children: InventoryChild[];
  listed: boolean;
  deepIndex: string | null;
  kind: 'project' | 'admin' | 'quote';
  /** Free text from build-index: duplicates across year folders, empty / unlisted folders, inferred year; appended to the summary. */
  note?: string;
  yearInferred?: boolean;
}

interface Inventory {
  stub?: boolean;
  source: string;
  crawledAt: string;
  roots: { label: string; url: string }[];
  projects: InventoryProject[];
}

interface DeepFile {
  path: string;
  name: string;
  ext: string;
  mimeType: string;
  bytes: number | null;
  modified: string | null;
  sourceHref: string;
  downloaded: boolean;
  thumb: string | null;
  pages: string[];
  pageCount: number | null;
  textExcerpt: string;
  palette: string[];
  renderer: string | null;
  redacted?: boolean;
  redactedReason?: string;
}

interface DeepIndex {
  stub?: boolean;
  folderName: string;
  sourceUrl: string;
  crawledAt: string;
  fileCount: number;
  totalBytes: number;
  files: DeepFile[];
}

export const ARCHIVE_INVENTORY = inventoryRaw as unknown as Inventory;

/**
 * Deep indexes by inventory project id (= the folder slug `docs/archive/projects/<slug>/index.json`). Every file build-index
 * writes is picked up by the glob, so a new featured project needs no import here (ar-06; the JSON is the source, D-037).
 * Vite resolves the `@docs` alias inside the glob (mirrored in tsconfig `paths`); the key is whatever path form Vite emits,
 * so the slug is read from the `/projects/<slug>/index.json` tail.
 */
const DEEP_INDEX_MODULES = import.meta.glob('@docs/archive/projects/*/index.json', { eager: true, import: 'default' }) as Record<string, unknown>;
export const DEEP_INDEXES: Record<string, DeepIndex> = Object.fromEntries(
  Object.entries(DEEP_INDEX_MODULES).flatMap(([file, mod]) => {
    const m = /\/projects\/([^/]+)\/index\.json$/.exec(file);
    return m ? [[m[1], mod as DeepIndex]] : [];
  }),
);

export const ARCHIVE_SPACE_ID = 'sp-archive';
export const ARCHIVE_ADMIN_SPACE_ID = 'sp-ar-admin';

export function archiveProjectId(inventoryId: string): string {
  return `prj-ar-${inventoryId}`;
}
export function archiveSpaceId(inventoryId: string): string {
  return `sp-ar-${inventoryId}`;
}
export function archiveYearSpaceId(yearFolder: string): string {
  return `sp-ar-${slugify(yearFolder)}`;
}

/** Folder names that name a client the hub already has a row for (`for-client`); anything else stays `'unknown'`. */
const KNOWN_CLIENTS: { match: string; id: string; name: string }[] = [
  { match: 'sodime', id: 'cl-sodime', name: 'Sodime' },
  { match: 'coassist', id: 'cl-coassist', name: 'Coassist' },
  { match: 'hoy', id: 'cl-hoy', name: 'HOY Wellness Center' },
  { match: 'sporti', id: 'cl-sporti', name: 'Sporti' },
];

const STAGE_TONE: Record<string, Tag['tone']> = { lead: 'neutral', sale: 'info', design: 'accent', build: 'warning', close: 'neutral' };

/** Registered by other seeds (spaces.ts, assets.ts); the registry has one row per name. */
const TAGS_ELSEWHERE = new Set(['brand', 'marketing', 'procesos', 'plantillas', 'asana', 'slack', 'clientes', 'entregables', 'herramientas', 'decisión', 'iluminación', 'dev', 'portfolio']);

type AssetRow = Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type SpaceRow = Omit<Space, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type PostRow = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type ProjectRow = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;

function dirname(path: string): string {
  const i = path.lastIndexOf('/');
  return i === -1 ? '' : path.slice(0, i);
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024 * 1024) return `${(n / 1024 / 1024 / 1024).toFixed(1).replace('.', ',')} GB`;
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

export function seed({ add, users }: SeedCtx): void {
  const inv = ARCHIVE_INVENTORY;
  const stubNote = inv.stub ? ' Índice provisional (stub): el rastreo completo lo reemplaza.' : '';

  const relate = (id: string, row: Omit<Relation, 'id' | 'created_at' | 'updated_at' | 'updated_by' | 'note'> & { note?: string }) => add('relations', id, { note: '', ...row });
  const space = (id: string, row: Partial<SpaceRow> & Pick<SpaceRow, 'name' | 'slug' | 'kind'>) =>
    add('spaces', id, { parentId: ARCHIVE_SPACE_ID, description: '', glyph: '◦', order: 0, visibility: 'team', archived: false, aboutType: null, aboutId: null, ...row });
  const post = (id: string, spaces: string[], row: Partial<PostRow> & Pick<PostRow, 'title' | 'body' | 'kind' | 'authorId'>) => {
    add('posts', id, { url: null, pinned: false, status: 'published', tags: [], ...row });
    spaces.forEach((spaceId, i) => add('filings', `fil-${id.replace(/^post-/, '')}-${i + 1}`, { postId: id, spaceId }));
  };

  // Unique asset ids: `ast-ar-<projectId>-<slug>`, `-2`, `-3` … on collisions (two "render.jpg" in different folders).
  const seenIds = new Map<string, number>();
  const uniqueId = (base: string): string => {
    const n = (seenIds.get(base) ?? 0) + 1;
    seenIds.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  const fileAsset = (projectSlug: string, name: string, extra: Partial<AssetRow> & Pick<AssetRow, 'sourceUrl' | 'folderPath' | 'stage' | 'year' | 'bytes'>): string => {
    const type = fileTypeOf(name);
    const id = uniqueId(`ast-ar-${projectSlug}-${slugify(name.replace(/\.[a-z0-9]{1,5}$/i, '')) || 'file'}`);
    add('assets', id, {
      kind: 'file',
      title: name,
      titleEs: null,
      slug: id.replace(/^ast-/, ''),
      url: null,
      repoPath: null,
      mimeType: mimeTypeOf(name),
      pageCount: null,
      pageNumber: null,
      parentId: null,
      sourceFileId: null,
      sourceName: name,
      publishedAt: null,
      language: null,
      palette: [],
      fonts: [],
      textExcerpt: '',
      tags: ['archive', type],
      status: 'current',
      supersedesId: null,
      source: 'dropbox',
      thumbnailUrl: null,
      previewUrls: [],
      ...extra,
    });
    return id;
  };

  // ---- Tags registry ----
  const yearFolders = [...new Set(inv.projects.map((p) => p.yearFolder))].sort();
  const tagRows: [string, Tag['tone']][] = [
    ['archive', 'neutral'],
    ['dropbox', 'info'],
    ['cotización', 'info'],
    ['confidencial', 'warning'],
    ...yearFolders.map((y): [string, Tag['tone']] => [y, 'neutral']),
    ...Object.values(PROJECT_TYPE_TAGS).map((t): [string, Tag['tone']] => [t, 'accent']),
    ...DELIVERY_STAGES.map((s): [string, Tag['tone']] => [s.id, STAGE_TONE[s.pipelineGroup] ?? 'neutral']),
  ];
  const added = new Set<string>();
  for (const [name, tone] of tagRows) {
    if (TAGS_ELSEWHERE.has(name) || added.has(name)) continue;
    added.add(name);
    add('tags', `tag-${slugify(name)}`, { name, tone });
  }

  // ---- Year areas under the existing Archive space ----
  yearFolders.forEach((y, i) => {
    space(archiveYearSpaceId(y), {
      name: y,
      slug: slugify(y),
      kind: 'area',
      glyph: '▤',
      order: i + 1,
      description: `Carpetas de proyectos de Dropbox del año ${y} (${inv.projects.filter((p) => p.yearFolder === y).length} carpetas). Fuente: ${inv.source}.${stubNote}`,
    });
  });
  space(ARCHIVE_ADMIN_SPACE_ID, {
    name: 'Administrativo',
    slug: 'administrativo',
    kind: 'area',
    glyph: '§',
    order: yearFolders.length + 1,
    description: 'Carpetas de facturas y cotizaciones del archivo de Dropbox: no son proyectos; cada archivo es una publicación con su enlace de origen.',
  });

  // ---- Projects, their files, spaces and relations ----
  inv.projects.forEach((prj, i) => {
    const year = prj.year ?? yearOf(prj.yearFolder);
    const yearLabel = year ? String(year) : prj.yearFolder;
    const dirs = prj.children.filter((c) => c.is_dir);
    const files = prj.children.filter((c) => !c.is_dir);
    const name = titleCase(stripNumberPrefix(prj.folderName));

    if (prj.kind === 'admin') {
      // Invoice folders: files as posts in the admin area, nothing else.
      files.forEach((f) => {
        const postId = `post-ar-${prj.id}-${slugify(f.name.replace(/\.[a-z0-9]{1,5}$/i, '')) || 'file'}`;
        post(postId, [ARCHIVE_ADMIN_SPACE_ID, archiveYearSpaceId(prj.yearFolder)], {
          title: f.name,
          kind: 'file',
          authorId: users.ops,
          url: f.href,
          tags: ['archive', 'dropbox', prj.yearFolder, 'admin', ...(f.redacted ? ['confidencial'] : [])],
          body: `Archivo de la carpeta **${prj.folderName}** (${prj.yearFolder}) en Dropbox${f.modified ? `, modificado ${f.modified}` : ''}${f.size ? `, ${formatBytes(f.size)}` : ''}. Se abre en el origen.`,
        });
      });
      return;
    }

    const projectId = archiveProjectId(prj.id);
    const spaceId = archiveSpaceId(prj.id);
    const type = projectTypeFromName(name);
    const isCurrent = prj.yearFolder === '2026';
    const isQuote = prj.kind === 'quote';
    const client = KNOWN_CLIENTS.find((c) => normalize(name).split(' ').includes(c.match));
    const deep = prj.deepIndex ? DEEP_INDEXES[prj.id] : undefined;
    const lightsInName = normalize(name).includes('iluminacion') || normalize(name).includes('luminaria');

    const tags = [...new Set(['archive', 'dropbox', yearLabel, PROJECT_TYPE_TAGS[type], ...(lightsInName ? ['iluminación'] : []), ...(isQuote ? ['cotización'] : [])])];
    const dateNote = year ? '' : ` La carpeta "${prj.yearFolder}" es un rango, así que el año queda sin definir y la fecha de inicio se fija en 2019-01-01.`;
    const fileCount = deep ? deep.files.length : files.length;
    const quoteNote = isQuote ? ' Carpeta de cotización: prospecto inferido (propuesta enviada); confirmar.' : '';
    const yearNote = prj.yearInferred && year ? ` Año ${year} inferido de las fechas de los archivos.` : '';
    const summary = `Carpeta "${prj.folderName}" del Dropbox de Aluzina (${prj.yearFolder}): ${fileCount} archivo${fileCount === 1 ? '' : 's'} y ${dirs.length} subcarpeta${dirs.length === 1 ? '' : 's'}${prj.latestModified ? `, última modificación ${prj.latestModified}` : ''}. Tipo y estado inferidos de la carpeta; confirmar con la fundadora.${quoteNote}${yearNote}${dateNote}${prj.note ? ` ${prj.note}` : ''}${stubNote}`;

    // Files first, so the cover can be chosen before the project row is written.
    const assetIds: { id: string; type: ReturnType<typeof fileTypeOf>; hasThumb: boolean; stage: DeliveryStage; folderPath: string; name: string }[] = [];
    if (deep) {
      for (const f of deep.files) {
        const folderPath = dirname(f.path);
        const stage = stageFor(folderPath, f.name);
        const thumbnailUrl = f.thumb && !f.redacted ? `./archive/${prj.id}/${f.thumb}` : null;
        const id = fileAsset(prj.id, f.name, {
          sourceUrl: f.sourceHref,
          folderPath,
          stage,
          year,
          bytes: f.bytes,
          mimeType: f.mimeType || mimeTypeOf(f.name),
          // Served copies are the visual memory (D-058): the same file the browser loads, nothing under docs/.
          repoPath: thumbnailUrl ? `apps/hub/public/archive/${prj.id}/${f.thumb}` : null,
          thumbnailUrl,
          previewUrls: f.redacted ? [] : f.pages.map((p) => `./archive/${prj.id}/${p}`),
          pageCount: f.pageCount,
          textExcerpt: f.redacted ? '' : f.textExcerpt ?? '',
          palette: f.redacted ? [] : f.palette,
          tags: ['archive', fileTypeOf(f.name), stage, ...(f.redacted ? ['confidencial'] : [])],
        });
        assetIds.push({ id, type: fileTypeOf(f.name), hasThumb: Boolean(thumbnailUrl), stage, folderPath, name: f.name });
      }
    } else {
      for (const f of files) {
        const stage = stageFor('', f.name);
        const id = fileAsset(prj.id, f.name, { sourceUrl: f.href, folderPath: '', stage, year, bytes: f.size, tags: ['archive', fileTypeOf(f.name), stage, ...(f.redacted ? ['confidencial'] : [])] });
        assetIds.push({ id, type: fileTypeOf(f.name), hasThumb: false, stage, folderPath: '', name: f.name });
      }
    }
    const cover = assetIds.find((a) => a.hasThumb && (a.type === 'image' || a.type === 'pdf'));

    const row: ProjectRow = {
      name,
      client: client?.name ?? 'unknown',
      clientUserId: null,
      type,
      phase: isQuote ? 'lead' : isCurrent ? 'development' : 'delivered',
      serviceCode: null,
      pipelineStatus: isQuote ? 'proposal-sent' : isCurrent ? 'contracted' : 'closed',
      creativeDirection: 'set',
      approval: isQuote || isCurrent ? 'draft' : 'client-approved',
      leadDesignerId: users.founder,
      budgetCop: 0,
      startDate: `${year ?? 2019}-01-01`,
      dueDate: null,
      location: 'Ubicación no publicada',
      summary,
      tags,
      coverAssetId: cover?.id ?? null,
      year,
      sourceFolderUrl: prj.sourceHref,
    };
    add('projects', projectId, row);

    for (const a of assetIds) {
      relate(`rel-${a.id}-belongs-to`, { fromType: 'assets', fromId: a.id, toType: 'projects', toId: projectId, kind: 'belongs-to' });
      if (deep && (a.type === 'image' || a.stage === 'design-development' || a.stage === 'concept')) {
        relate(`rel-${a.id}-depicts`, { fromType: 'assets', fromId: a.id, toType: 'projects', toId: projectId, kind: 'depicts' });
      }
    }
    if (client) relate(`rel-${projectId}-for-client`, { fromType: 'projects', fromId: projectId, toType: 'clients', toId: client.id, kind: 'for-client', note: 'Cliente reconocido por el nombre de la carpeta.' });
    relate(`rel-${projectId}-produced-by`, { fromType: 'projects', fromId: projectId, toType: 'roles', toId: 'founder', kind: 'produced-by', note: 'Proyecto anterior al Hub; autoría del estudio.' });
    if (normalize(name).includes('honey valley') && lightsInName) {
      relate(`rel-${projectId}-references-honey-valley`, { fromType: 'projects', fromId: projectId, toType: 'projects', toId: PROJECT_IDS.honeyValley, kind: 'references', note: 'La carpeta de Dropbox y el proyecto de luminarias del Hub parecen ser el mismo trabajo; confirmar.' });
    }

    space(spaceId, {
      name,
      slug: slugify(prj.folderName, true) || prj.id,
      kind: 'project',
      parentId: archiveYearSpaceId(prj.yearFolder),
      glyph: '◦',
      order: i + 1,
      aboutType: 'projects',
      aboutId: projectId,
      description: summary,
    });

    // Featured project: one Spanish note with the folder tree grouped by delivery stage.
    if (deep) {
      const byStage = new Map<DeliveryStage, typeof assetIds>();
      for (const a of assetIds) byStage.set(a.stage, [...(byStage.get(a.stage) ?? []), a]);
      const sections = DELIVERY_STAGES.filter((s) => byStage.has(s.id))
        .map((s) => {
          const items = (byStage.get(s.id) ?? []).sort((a, b) => compareFolderPaths(a.folderPath, b.folderPath) || a.name.localeCompare(b.name));
          const lines = items.map((a) => `- \`${a.folderPath ? `${a.folderPath.split('/').map(folderLabel).join(' / ')} / ` : ''}${a.name}\`${a.hasThumb ? ' (con vista previa)' : ''}`);
          return `### ${deliveryStage(s.id)?.label.es ?? s.id} (${items.length})\n\n${lines.join('\n')}`;
        })
        .join('\n\n');
      const postId = `post-ar-${prj.id}`;
      post(postId, [spaceId, archiveYearSpaceId(prj.yearFolder)], {
        title: `${name}: carpeta completa (${deep.files.length} archivos)`,
        kind: 'note',
        authorId: users.founder,
        pinned: true,
        tags: ['archive', 'dropbox', yearLabel],
        body: `Índice de la carpeta **${deep.folderName}** en Dropbox (${formatBytes(deep.totalBytes)}, rastreada ${deep.crawledAt.slice(0, 10)}), agrupado por etapa de entrega; las carpetas conservan la numeración del estudio. Etapas asignadas por palabras clave del nombre de carpeta (\`stageFor\`); revisar las que queden en "Otros".${stubNote}\n\n${sections}`,
      });
      relate(`rel-${postId}-references-project`, { fromType: 'posts', fromId: postId, toType: 'projects', toId: projectId, kind: 'references' });
    }
  });
}
