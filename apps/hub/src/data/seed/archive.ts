import inventoryRaw from '@docs/archive/index.json';
import {
  DELIVERY_STAGES,
  PROJECT_TYPE_TAGS,
  compareFolderPaths,
  deliveryStage,
  fileTypeOf,
  folderLabel,
  normalize,
  projectTypeFromName,
  slugify,
  stageFor,
  stripNumberPrefix,
  titleCase,
  yearOf,
  type DeliveryStage,
  type FileType,
} from '../../domain/archive';
import type { Post, Project, Relation, Space, Tag } from '../schema';
import { PROJECT_IDS } from './projects';
import type { SeedCtx } from './types';

/**
 * The project archive as data (prompt 0017, S-12, D-055 pending). Justin shared Aluzina's Dropbox project folders
 * (2019-2026, ~190 folders) in Slack; the crawlers' output becomes `docs/archive/index.json` (one entry per project folder
 * with counts, `depth`, `cover` and notes — no children since ar-19) and `docs/archive/projects/<slug>/index.json` (every
 * file of the folder: the deep index for a featured project, the direct children at depth 1 otherwise). The inventory is
 * imported here through `@docs`; the per-project file indexes are NOT: `data/archiveFiles.ts` loads them lazily and builds
 * the `assets` rows in memory (`data/archiveRows.ts`), and only edited files become stored rows (ar-19, D-071 proposed).
 * `scripts/archive/build-index.mjs` writes all of it (redacted, D-059) from the crawler output.
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
 * - NO `assets` rows and no per-file relations for archived files (ar-19): the project row carries `fileCount`, `coverUrl`,
 *   `coverAssetId` (from the inventory's `cover`), `archiveSlug` (= the inventory id = the chunk key) and `fileTypes`
 *   (from `extensions`, most common first); S-13 loads the files through `useProjectFiles`. Company documents
 *   (`seed/company.ts`) are the only seeded `kind: 'file'` rows.
 * - Spaces: under the existing `sp-archive`, one area per year folder (`sp-ar-<yearFolder>`), one project space per
 *   archived project inside its year, and `sp-ar-admin`. One Spanish `posts` note per FEATURED project listing its
 *   folders by delivery stage (`folders` in the inventory entry: path, file count, files with a preview).
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
  /** Only `kind: 'admin'` entries keep their children (they become posts); every other folder's files live in its chunk (ar-19). */
  children?: InventoryChild[];
  listed: boolean;
  /** Set for a featured project (full-depth crawl with renders); every non-admin folder has a chunk regardless. */
  deepIndex: string | null;
  /** Deepest level the chunk lists (1 = direct children only, 0 = empty folder). */
  depth?: number;
  /** The first design file with a served thumbnail: the project cover, with the asset id `rowsFromDeepIndex` gives it. */
  cover?: { assetId: string; thumb: string; pages?: string[] } | null;
  /** Featured projects: the folders that hold files directly, for the Spaces note. */
  folders?: { path: string; files: number; withThumb: number }[];
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

export const ARCHIVE_INVENTORY = inventoryRaw as unknown as Inventory;

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

type SpaceRow = Omit<Space, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type PostRow = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type ProjectRow = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;

/** Up to four file types of a folder from its extension counts, most common first (the S-12 mosaic; same ranking `topFileTypes` used on rows). */
function topFileTypes(extensions: Record<string, number>, max = 4): FileType[] {
  const counts = new Map<FileType, number>();
  for (const [ext, n] of Object.entries(extensions)) {
    const type = fileTypeOf(ext);
    counts.set(type, (counts.get(type) ?? 0) + n);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([type]) => type);
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
    const name = titleCase(stripNumberPrefix(prj.folderName));

    if (prj.kind === 'admin') {
      // Invoice folders: files as posts in the admin area, nothing else (the inventory keeps their children for this).
      (prj.children ?? []).filter((c) => !c.is_dir).forEach((f) => {
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
    const deep = Boolean(prj.deepIndex);
    const lightsInName = normalize(name).includes('iluminacion') || normalize(name).includes('luminaria');

    const tags = [...new Set(['archive', 'dropbox', yearLabel, PROJECT_TYPE_TAGS[type], ...(lightsInName ? ['iluminación'] : []), ...(isQuote ? ['cotización'] : [])])];
    const dateNote = year ? '' : ` La carpeta "${prj.yearFolder}" es un rango, así que el año queda sin definir y la fecha de inicio se fija en 2019-01-01.`;
    const fileCount = prj.fileCount;
    const dirCount = prj.dirCount;
    const quoteNote = isQuote ? ' Carpeta de cotización: prospecto inferido (propuesta enviada); confirmar.' : '';
    const yearNote = prj.yearInferred && year ? ` Año ${year} inferido de las fechas de los archivos.` : '';
    const summary = `Carpeta "${prj.folderName}" del Dropbox de Aluzina (${prj.yearFolder}): ${fileCount} archivo${fileCount === 1 ? '' : 's'} y ${dirCount} subcarpeta${dirCount === 1 ? '' : 's'}${prj.latestModified ? `, última modificación ${prj.latestModified}` : ''}. Tipo y estado inferidos de la carpeta; confirmar con la fundadora.${quoteNote}${yearNote}${dateNote}${prj.note ? ` ${prj.note}` : ''}${stubNote}`;

    // The cover comes from the inventory (build-index picks the first design file with a served thumbnail and names its asset id).
    const cover = prj.cover ?? null;

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
      coverAssetId: cover?.assetId ?? null,
      year,
      sourceFolderUrl: prj.sourceHref,
      fileCount,
      coverUrl: cover ? `./archive/${prj.id}/${cover.thumb}` : null,
      archiveSlug: prj.id,
      fileTypes: topFileTypes(prj.extensions),
    };
    add('projects', projectId, row);

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

    // Featured project: one Spanish note with the folders grouped by delivery stage (file counts, not file rows: ar-19).
    if (deep) {
      const folders = prj.folders ?? [];
      const byStage = new Map<DeliveryStage, typeof folders>();
      for (const f of folders) {
        const stage = stageFor(f.path, '');
        byStage.set(stage, [...(byStage.get(stage) ?? []), f]);
      }
      const sections = DELIVERY_STAGES.filter((s) => byStage.has(s.id))
        .map((s) => {
          const items = (byStage.get(s.id) ?? []).sort((a, b) => compareFolderPaths(a.path, b.path));
          const lines = items.map((f) => `- \`${f.path ? f.path.split('/').map(folderLabel).join(' / ') : '/'}\` — ${f.files} archivo${f.files === 1 ? '' : 's'}${f.withThumb ? ` (${f.withThumb} con vista previa)` : ''}`);
          return `### ${deliveryStage(s.id)?.label.es ?? s.id} (${items.reduce((n, f) => n + f.files, 0)})\n\n${lines.join('\n')}`;
        })
        .join('\n\n');
      const postId = `post-ar-${prj.id}`;
      post(postId, [spaceId, archiveYearSpaceId(prj.yearFolder)], {
        title: `${name}: carpeta completa (${fileCount} archivos)`,
        kind: 'note',
        authorId: users.founder,
        pinned: true,
        tags: ['archive', 'dropbox', yearLabel],
        body: `Índice de la carpeta **${prj.folderName}** en Dropbox (${formatBytes(prj.totalBytesKnown)}, rastreada ${inv.crawledAt.slice(0, 10)}), agrupado por etapa de entrega; las carpetas conservan la numeración del estudio. Etapas asignadas por palabras clave del nombre de carpeta (\`stageFor\`); revisar las que queden en "Otros". Los archivos se abren en la vista del proyecto (S-13).${stubNote}\n\n${sections}`,
      });
      relate(`rel-${postId}-references-project`, { fromType: 'posts', fromId: postId, toType: 'projects', toId: projectId, kind: 'references' });
    }
  });
}
