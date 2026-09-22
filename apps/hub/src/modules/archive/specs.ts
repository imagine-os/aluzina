import { defineSpec, type ActionDef, type PageSpec, type Surface } from '../../specs/PageSpec';

/** Widths actually captured and read back for both pages (P-01). */
/** 2560 / 3840 + dark verified in ar-18 (docs/qa/0004-archive-4k-dark.md, changelog 0021). */
const WIDTHS = [360, 390, 768, 1280, 1920, 2560, 3840];

/** S-12 writes `posts` + `filings` when a set is saved (ar-10); everything else is read. */
const DATA_TABLES = ['projects', 'assets', 'relations', 'clients', 'spaces', 'filings', 'posts'];
const ROLES = ['studio', 'founder', 'brand'];

/** S-12: every control of the archive browser (P-05). Voice speaks these intents. */
export const ARCHIVE_BROWSER_ACTIONS: ActionDef[] = [
  { id: 'archive.filterLifecycle', label: 'Filter by lifecycle', intent: 'show only {life} projects', permission: 'projects.read', params: { life: 'enum:prospect|active|past|all' } },
  { id: 'archive.filterYear', label: 'Filter by year', intent: 'show only projects from {year}', permission: 'projects.read', params: { year: 'string' } },
  { id: 'archive.filterType', label: 'Filter by project type', intent: 'show only {type} projects', permission: 'projects.read', params: { type: 'enum:residential|commercial|hospitality|wellness|lighting-product|all' } },
  { id: 'archive.filterTag', label: 'Filter by tag', intent: 'show only projects tagged {tag}', permission: 'projects.read', params: { tag: 'string' } },
  { id: 'archive.search', label: 'Search the archive', intent: 'find archived projects matching {q}', permission: 'projects.read', params: { q: 'string' } },
  { id: 'archive.setView', label: 'Switch view', intent: 'show the archive as {view}', permission: 'projects.read', params: { view: 'enum:cards|table' } },
  { id: 'archive.openProject', label: 'Open a project', intent: 'open the portal view of the project {project}', permission: 'projects.read', params: { project: 'id' } },
  { id: 'archive.toggleInSet', label: 'Add or remove from the portfolio set', intent: 'put the project {project} in the portfolio set', permission: 'projects.read', params: { project: 'id' } },
  { id: 'archive.copySet', label: 'Copy the portfolio set', intent: 'copy the portfolio set as a list', permission: 'projects.read' },
  { id: 'archive.clearSet', label: 'Clear the portfolio set', intent: 'clear the portfolio set', permission: 'projects.read' },
  { id: 'archive.openSetPage', label: 'Open the example page of the set', intent: 'open the client-facing example page of the portfolio set', permission: 'projects.read' },
  { id: 'archive.exportSet', label: 'Export the portfolio set', intent: 'export the portfolio set as a PDF', permission: 'projects.read' },
  { id: 'archive.saveSetToSpaces', label: 'Save the set to Spaces', intent: 'save the portfolio set as a post in Spaces', permission: 'archive.curate' },
  { id: 'archive.importFolder', label: 'Import a folder', intent: 'import a Dropbox or Drive folder into the archive', permission: 'projects.read' },
];

/** S-13: every control of the project portal view (P-05). */
export const ARCHIVE_PORTAL_ACTIONS: ActionDef[] = [
  { id: 'archive.openFile', label: 'Preview a file', intent: 'preview the file {asset}', permission: 'projects.read', params: { asset: 'id' } },
  { id: 'archive.closeFile', label: 'Close the preview', intent: 'close the file preview', permission: 'projects.read' },
  { id: 'archive.nextFile', label: 'Next file', intent: 'show the next file', permission: 'projects.read' },
  { id: 'archive.prevFile', label: 'Previous file', intent: 'show the previous file', permission: 'projects.read' },
  { id: 'archive.previewPage', label: 'Go to a page', intent: 'go to page {page} of the open file', permission: 'projects.read', params: { page: 'number' } },
  { id: 'archive.filterStage', label: 'Filter by stage', intent: 'show only the files of the stage {stage}', permission: 'projects.read', params: { stage: 'string' } },
  { id: 'archive.filterFileType', label: 'Filter by file type', intent: 'show only {type} files', permission: 'projects.read', params: { type: 'string' } },
  { id: 'archive.searchFiles', label: 'Search the files', intent: 'find files matching {q}', permission: 'projects.read', params: { q: 'string' } },
  { id: 'archive.setFilesView', label: 'Switch the file view', intent: 'show the files as a {view}', permission: 'projects.read', params: { view: 'enum:grid|list' } },
  { id: 'archive.setGrouping', label: 'Switch the grouping', intent: 'group the files {mode}', permission: 'projects.read', params: { mode: 'enum:stage|folder' } },
  { id: 'archive.openSource', label: 'Open a file at the source', intent: 'open the file {asset} in Dropbox', permission: 'projects.read', params: { asset: 'id' } },
  { id: 'archive.downloadFile', label: 'Download a file', intent: 'download the file {asset}', permission: 'projects.read', params: { asset: 'id' } },
  { id: 'archive.copyFileLink', label: 'Copy a file link', intent: 'copy the link to the file {asset}', permission: 'projects.read', params: { asset: 'id' } },
  { id: 'archive.openFolderSource', label: 'Open the source folder', intent: 'open the source folder of this project', permission: 'projects.read' },
  { id: 'archive.tagFile', label: 'Tag a file', intent: 'tag the file {asset} with {tags}', permission: 'archive.curate', params: { asset: 'id', tags: 'string' } },
  { id: 'archive.setStage', label: 'Move a file to a stage', intent: 'move the file {asset} to the delivery stage {stage}', permission: 'archive.curate', params: { asset: 'id', stage: 'string' } },
  { id: 'archive.setCover', label: 'Set the project cover', intent: 'use the file {asset} as the cover of this project', permission: 'archive.curate', params: { asset: 'id' } },
  { id: 'archive.setProjectTags', label: 'Tag the project', intent: 'tag the project {project} with {tags}', permission: 'archive.curate', params: { project: 'id', tags: 'string' } },
  { id: 'archive.addToSet', label: 'Add this project to the set', intent: 'add this project to the portfolio set', permission: 'projects.read' },
];

const BROWSER_LOGIC = [
  'Every project is listed, not only the archived ones: lifecycle tabs (Prospects / In progress / Past / All) come from `lifecycleOf(project.pipelineStatus)`, so "sometimes we want to see everything" is one click and the default is All.',
  'Filters live in the query string (`?life=&year=&type=&tag=&q=&view=&set=`), so any view is a link a person can paste and an intent voice can address; the actions write the same params.',
  'A card cover is the project `coverUrl` (a column of the row, set with `coverAssetId` by S-13, ar-19) when there is one; otherwise a 2x2 mosaic of `FileIcon`s for `project.fileTypes`, the four most common file types in the folder, so a project without photography still reads as itself.',
  'The portfolio set is a list of project ids in `localStorage["aluzina.archive.set"]`, shared by S-12 and S-13; "Copy list" writes name, year, client and source link per line through `copyText`, in the order the projects were picked.',
  'The set bar is now real (ar-10 / ar-14): "Open example page" opens P-06 `/#/sets?p=<ids>&t=<title>` in a new tab, "Export PDF" opens the same link with `&print=1` (P-06 calls `window.print()` once after it loads), and "Save set to Spaces" (`archive.curate`: filing a set is curation of the archive, so the studio can do it without `spaces.write`) creates a `link` post carrying that link and a markdown list of the projects, filed through `filings` in `sp-portfolio` and `sp-archive` when they exist; the bar then offers a link to the post (`/<surface>/spaces/post/:id`), because a toast is text only.',
  'The set link is stateless: P-06 resolves the ids in the URL, so nothing about a set is stored and a link keeps working without a row (a saved post is a record of the set, not its storage).',
  'File counts per project are `project.fileCount` (the inventory count, ar-19): no file rows are seeded or scanned. The "N tagged" meta counts the project\'s curated files: the stored `assets` rows linked by a `belongs-to` relation, written by S-13 through `saveFilePatch`.',
  'The Tag filter\'s options are the live union of `projects[].tags` and the tags on curated file rows; a project answers to both, so a tag saved on a file on S-13 finds its project here without a reload (D-023).',
];

const PORTAL_LOGIC = [
  'The delivery order rail is `DELIVERY_STAGES` in `order`, sub-headed by `pipelineGroup`; each stage button carries its file count and filters the sections below. Arrow keys move along the rail (roving tabindex), Home / End jump to the ends.',
  'Files are grouped two ways (`?group=stage|folder`): by delivery stage (`stageFor`) in pipeline order, or by the studio\'s own numbered folders sorted with `folderOrderKey` and labelled with `folderLabel`, which is the "documents in order" view. Empty numbered folders still render, muted, in the folder view so the structure is complete.',
  'The preview Drawer holds one asset at a time (`?file=<assetId>`), with Previous / Next walking the currently filtered, sorted file list, and `page` state driving the `DocumentViewer`. When nothing is previewable the viewer renders its sentence and type icon, never a blank frame.',
  'Related is three reverse queries: the client through `relations` `for-client`, the Spaces post through `spaces.aboutId` and its `filings`, and up to six other projects sharing at least two tags — the "sets of related examples" the studio shows a client.',
  'The files are not seeded (ar-19): `useProjectArchiveFiles` loads the project\'s chunk (`docs/archive/projects/<slug>/index.json`, a lazy `import.meta.glob` chunk keyed by `project.archiveSlug`) the first time the page opens it, turns it into `assets` rows in memory (`rowsFromDeepIndex`) and overlays the stored rows of the same id; a Skeleton shows while the chunk loads and an EmptyState says why when it cannot.',
  'Tags are real writes (ar-09): the `TagEditor` holds a draft and Save writes it once through `saveFilePatch(data, asset, { tags }, projectId)` — `update` with `basedOn` when the file already has a stored row, else `create` with the chunk row\'s own id plus its `belongs-to` relation — or through `data.update` on `projects`; both behind the curation permission `archive.curate` (studio, brand, founder), so one save is one row version and a stale edit raises the global D-024 conflict toast.',
  'Tags are free text, trimmed, lower-cased and de-duplicated; the suggestion list is the live union of this project\'s file tags, the `tags` registry names and the delivery-stage ids, so new vocabulary reaches S-12\'s tag filter the moment it is saved (lists re-render from `subscribe`, D-023).',
  'The delivery stage of a file is a `Select` over `DELIVERY_STAGES` that writes `assets.stage` at once through `saveFilePatch`: the rail, the sections and the counts move with it because they all read the same overlaid rows.',
  '"Set as cover" writes `projects.coverAssetId` and `projects.coverUrl` together, offered only for an image or a PDF that already has a thumbnail; a coverable file without a render is a Placeholder saying why, and a `confidencial` or redacted file is never offered as a cover (D-059).',
  'The portfolio set is still localStorage on this page, but it now leaves the studio two ways (ar-10 / ar-14): as the client page P-06 (`/#/sets?p=…`, also the PDF through the browser\'s own print) and as a `link` post in Spaces filed in the portfolio and archive spaces.',
];

const BROWSER_COMPONENTS = ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'ToggleButton', 'Checkbox', 'Card', 'Thumb', 'FileIcon', 'Badge', 'StatusPill', 'Button', 'DataTable', 'EmptyState', 'Placeholder', 'Skeleton'];
const PORTAL_COMPONENTS = ['PageHeader', 'Card', 'Thumb', 'FileIcon', 'DocumentViewer', 'Drawer', 'FilterBar', 'SearchField', 'Select', 'ToggleButton', 'TagEditor', 'Badge', 'StatusPill', 'Button', 'EmptyState', 'Placeholder', 'Skeleton'];

export function archiveBrowserSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'S-12',
    name: 'Project archive',
    purpose: 'One browser over every project the studio has ever had — past work, work in progress and prospects — with covers, thumbnails, tags and file counts, so Alejandra can review past work while building a portfolio or assemble a set of related examples for a specific client.',
    surface,
    navGroup: 'projects',
    layout: [
      'PageHeader (code, title, counts, breadcrumb) with "Portfolio set" toggle and a Placeholder "Import folder"',
      'StatTile row: Prospects / In progress / Past / All, each a button that sets the lifecycle filter',
      'FilterBar: search, year, type, tag, sort, and a Cards | Table ToggleButton',
      'Cards grid (Thumb cover or FileIcon mosaic, name, client, year, StatusPill, Badges, file count) or DataTable with the same columns',
      'EmptyState when nothing matches',
      'Sticky portfolio-set bar: count, Open example page (P-06, new tab), Export PDF (P-06 with print=1), Save set to Spaces (archive.curate), a link to the saved post once it exists, Copy list, Clear',
    ],
    dataTables: DATA_TABLES,
    roles: ROLES,
    logic: BROWSER_LOGIC,
    components: BROWSER_COMPONENTS,
    actions: ARCHIVE_BROWSER_ACTIONS,
    checkedAt: WIDTHS,
  });
}

export function archivePortalSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'S-13',
    name: 'Project portal view',
    purpose: 'Everything about one archived project on a single page: the hero with its cover and source folder, the delivery order as a stage rail, every file previewable in place grouped by stage or by the studio\'s numbered folders, and what the project is related to.',
    surface,
    layout: [
      'PageHeader with breadcrumb (portal / Archive / project)',
      'Hero: cover Thumb, name, client, year, location, StatusPill, lifecycle Badge, the project Tags row (TagEditor for archive.curate, read-only Badges otherwise), Open in Dropbox / Open in Work / Open space / Add to set',
      'Delivery order: a stage rail from DELIVERY_STAGES grouped by pipelineGroup, each stage a button with glyph, label and file count',
      'Files toolbar: search, stage, file type, grid | list, By stage | By folder (tagging lives in the preview drawer)',
      'Files by stage (or by numbered folder), each file a Thumb button that opens the preview',
      'Preview Drawer: DocumentViewer with page controls, Download, Open at source, Copy link, Previous / Next file, then "Tags and stage": TagEditor + Save, the delivery-stage Select and "Set as cover"',
      'Related: client card, the Spaces post about the project, up to six projects sharing two or more tags',
    ],
    dataTables: DATA_TABLES,
    roles: ROLES,
    logic: PORTAL_LOGIC,
    components: PORTAL_COMPONENTS,
    actions: ARCHIVE_PORTAL_ACTIONS,
    checkedAt: WIDTHS,
  });
}
