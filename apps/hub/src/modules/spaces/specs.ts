import { defineSpec, type ActionDef, type PageSpec, type Surface } from '../../specs/PageSpec';

const WIDTHS = [390, 1280, 1920];

/** Every button, select and submit of the Spaces pages (P-05). Voice speaks these intents. */
const HOME_ACTIONS: ActionDef[] = [
  { id: 'spaces.selectSpace', label: 'Open space', intent: 'open the space {space}', permission: 'spaces.read', params: { space: 'id' } },
  { id: 'spaces.toggleNode', label: 'Expand or collapse', intent: 'expand the space {space} in the tree', permission: 'spaces.read', params: { space: 'id' } },
  { id: 'spaces.search', label: 'Search spaces and posts', intent: 'search spaces and posts for {query}', permission: 'spaces.read', params: { query: 'string' } },
  { id: 'spaces.showArchived', label: 'Show archived', intent: 'show or hide archived spaces', permission: 'spaces.read' },
  { id: 'spaces.browseTree', label: 'Browse spaces', intent: 'open the spaces tree', permission: 'spaces.read' },
  { id: 'spaces.createSpace', label: 'New space', intent: 'create a space called {name} under {parent}', permission: 'spaces.write', params: { name: 'string', kind: 'enum:area|topic|role|client|deliverable|tool|project|archive', parent: 'id' } },
  { id: 'spaces.createPost', label: 'New post', intent: 'write a {kind} called {title} in {space}', permission: 'spaces.write', params: { title: 'string', kind: 'enum:note|link|file|decision|procedure|brief|announcement', space: 'id' } },
  { id: 'spaces.openPost', label: 'Open post', intent: 'open the post {post}', permission: 'spaces.read', params: { post: 'id' } },
  { id: 'spaces.filterKind', label: 'Filter by kind', intent: 'show only {kind} posts', permission: 'spaces.read', params: { kind: 'enum:all|note|link|file|decision|procedure|brief|announcement' } },
  { id: 'spaces.filterTag', label: 'Filter by tag', intent: 'show only posts tagged {tag}', permission: 'spaces.read', params: { tag: 'string' } },
  { id: 'spaces.filterAuthor', label: 'Filter by author', intent: 'show only posts by {person}', permission: 'spaces.read', params: { person: 'id' } },
  { id: 'spaces.sort', label: 'Sort posts', intent: 'sort the posts by {by}', permission: 'spaces.read', params: { by: 'enum:updated|title|kind|author' } },
  { id: 'spaces.editDescription', label: 'Edit description', intent: 'describe the space {space}: {text}', permission: 'spaces.write', params: { space: 'id', text: 'string' } },
  { id: 'spaces.archive', label: 'Archive space', intent: 'archive the space {space}', permission: 'spaces.admin', params: { space: 'id' } },
  { id: 'spaces.goToRole', label: 'Go to my role space', intent: 'open the space of my role', permission: 'spaces.read' },
];

const POST_ACTIONS: ActionDef[] = [
  { id: 'spaces.editPost', label: 'Edit post', intent: 'edit the post {post}', permission: 'spaces.write', params: { post: 'id' } },
  { id: 'spaces.savePost', label: 'Save post', intent: 'save the post {post}', permission: 'spaces.write', params: { post: 'id', title: 'string', body: 'string' } },
  { id: 'spaces.pin', label: 'Pin or unpin', intent: 'pin the post {post}', permission: 'spaces.write', params: { post: 'id' } },
  { id: 'spaces.setStatus', label: 'Publish / archive post', intent: 'set the post {post} to {status}', permission: 'spaces.write', params: { post: 'id', status: 'enum:draft|published|archived' } },
  { id: 'spaces.fileIn', label: 'File in space', intent: 'file the post {post} in {space}', permission: 'spaces.write', params: { post: 'id', space: 'id' } },
  { id: 'spaces.unfile', label: 'Remove from space', intent: 'remove the post {post} from {space}', permission: 'spaces.write', params: { post: 'id', space: 'id' } },
  { id: 'spaces.setTags', label: 'Edit tags', intent: 'tag the post {post} with {tags}', permission: 'spaces.write', params: { post: 'id', tags: 'string' } },
  { id: 'spaces.relate', label: 'Add relation', intent: 'relate the post {post} to the {type} {target} as {kind}', permission: 'spaces.write', params: { post: 'id', type: 'string', target: 'id', kind: 'enum:references|applies-to|part-of|replaces|depends-on|belongs-to|produced-by|for-client|owned-by' } },
  { id: 'spaces.unrelate', label: 'Remove relation', intent: 'remove the relation {relation}', permission: 'spaces.write', params: { relation: 'id' } },
  { id: 'spaces.openTarget', label: 'Open related entity', intent: 'open the {type} {target}', permission: 'spaces.read', params: { type: 'string', target: 'id' } },
  { id: 'spaces.comment', label: 'Comment', intent: 'comment on the post {post}: {text}', permission: 'spaces.read', params: { post: 'id', text: 'string' } },
  { id: 'spaces.openLink', label: 'Open link', intent: 'open the link of the post {post}', permission: 'spaces.read', params: { post: 'id' } },
  { id: 'spaces.previewAsset', label: 'Preview the file', intent: 'preview the file of this post', permission: 'spaces.read', params: { asset: 'id' } },
  { id: 'spaces.closeAssetPreview', label: 'Close the preview', intent: 'close the file preview', permission: 'spaces.read' },
];

const GRAPH_ACTIONS: ActionDef[] = [
  { id: 'spaces.switchGraphView', label: 'Switch graph view', intent: 'show the graph as {view}', permission: 'spaces.read', params: { view: 'enum:objects3d|lanes|radial|map|force2d' } },
  { id: 'spaces.autoRotate', label: 'Auto-rotate', intent: 'start or stop turning the 3D graph', permission: 'spaces.read' },
  { id: 'spaces.resetCamera', label: 'Reset view', intent: 'reset the graph camera', permission: 'spaces.read' },
  { id: 'spaces.showAllNodes', label: 'Show all nodes', intent: 'draw every node instead of the closest ones', permission: 'spaces.read' },
  { id: 'spaces.focusGraph', label: 'Focus node', intent: 'centre the graph on {node}', permission: 'spaces.read', params: { node: 'string' } },
  { id: 'spaces.setDepth', label: 'Set depth', intent: 'show {depth} hops around the focus', permission: 'spaces.read', params: { depth: 'enum:1|2|3|all' } },
  { id: 'spaces.filterGraphKind', label: 'Toggle kind', intent: 'show or hide {kind} nodes in the graph', permission: 'spaces.read', params: { kind: 'enum:area|topic|role|client|deliverable|tool|project|archive|post|other' } },
  { id: 'spaces.zoom', label: 'Zoom', intent: 'zoom the graph {direction}', permission: 'spaces.read', params: { direction: 'enum:in|out|fit' } },
  { id: 'spaces.openNode', label: 'Open node', intent: 'open the node {node}', permission: 'spaces.read', params: { node: 'string' } },
  { id: 'spaces.showArchived', label: 'Show archived', intent: 'show or hide archived spaces', permission: 'spaces.read' },
];

const CATALOG_ACTIONS: ActionDef[] = [
  { id: 'spaces.catalogTab', label: 'Catalog tab', intent: 'show the {tab} catalog', permission: 'spaces.read', params: { tab: 'enum:deliverables|clients|tools|roles|assets' } },
  { id: 'spaces.openTemplate', label: 'Open template', intent: 'open the template of the deliverable {deliverable}', permission: 'spaces.read', params: { deliverable: 'id' } },
  { id: 'spaces.openRoute', label: 'Open hub page', intent: 'open the hub page {code}', permission: 'spaces.read', params: { code: 'string' } },
  { id: 'spaces.selectSpace', label: 'Open space', intent: 'open the space {space}', permission: 'spaces.read', params: { space: 'id' } },
  { id: 'spaces.openProject', label: 'Open project work', intent: 'open the work of the project {project}', permission: 'spaces.read', params: { project: 'id' } },
  { id: 'spaces.previewAsset', label: 'Preview an asset', intent: 'preview the asset {asset}', permission: 'spaces.read', params: { asset: 'id' } },
  { id: 'spaces.closeAssetPreview', label: 'Close the preview', intent: 'close the asset preview', permission: 'spaces.read' },
  { id: 'spaces.openAssetSource', label: 'Open an asset at its source', intent: 'open the asset {asset} at its source', permission: 'spaces.read', params: { asset: 'id' } },
];

const IMPORT_ACTIONS: ActionDef[] = [
  { id: 'spaces.uploadExport', label: 'Upload Slack export', intent: 'import the Slack export {file}', permission: 'spaces.admin', params: { file: 'string' } },
  { id: 'spaces.selectSpace', label: 'Open space', intent: 'open the space {space}', permission: 'spaces.read', params: { space: 'id' } },
];

const COMMON = {
  roles: ['founder', 'ops', 'studio', 'brand', 'marketing', 'dev'],
  checkedAt: WIDTHS,
};

const HOME_LOGIC = [
  'One page for every portal (like Work, D-021): the surface only changes the shell; permissions decide what is editable (spaces.write) and what can be archived (spaces.admin).',
  'Spaces nest without limit (parentId); the tree is built from flat rows and expanded around the selection, the role space and search hits.',
  'A post is one row shown in every space it is filed in (filings, many-to-many); the "also in N spaces" chip counts the other filings.',
  'Entering as a role preselects the space about that role (spaces.aboutType = roles) and the banner counts the posts filed to it from anywhere in the Hub.',
  'Search filters the tree (matches and their ancestors) and, when not empty, lists matching posts across all spaces instead of the selected space.',
  'Pinned posts first, then the chosen sort; filters by kind, tag and author; the description is edited inline and saved with basedOn (D-024). Every write goes through the DataProvider and reaches other tabs live (D-023).',
  'A post of kind file shows a Thumb (ar-17): the served thumbnail of the assets row its relations point at, or the FileIcon of the family read from the file name. The Thumb is markup inside the card button, so the card stays one tab stop.',
];

export function spacesHomeSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'K-01',
    name: 'Spaces',
    purpose: 'The Hub\'s own organizer replacing the Slack sidebar (prompt 0005): a tree of spaces without depth limit on the left, the posts filed in the selected space on the right, one post in as many spaces as it belongs to.',
    surface,
    navGroup: 'spaces',
    layout: ['PageHeader (New space, New post)', 'Role banner: posts filed to my role', 'Left: SearchField, show-archived Checkbox, SpaceTree (Drawer under 1024 px)', 'Right: space description (editable), child spaces grid (Cards), FilterBar (kind, tag, author, sort), PostCard list pinned first (a file post carries a Thumb of its file)', 'Modals: New space, New post'],
    dataTables: ['spaces', 'posts', 'filings', 'tags', 'relations', 'assets'],
    logic: HOME_LOGIC,
    components: ['PageHeader', 'SearchField', 'Checkbox', 'SpaceTree', 'Card', 'FilterBar', 'Select', 'PostCard', 'Thumb', 'FileIcon', 'Badge', 'Button', 'Textarea', 'Input', 'Modal', 'Drawer', 'EmptyState', 'Markdown'],
    actions: HOME_ACTIONS,
    ...COMMON,
  });
}

export function spaceViewSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'K-02',
    name: 'Space',
    purpose: 'One space deep-linked (`/<surface>/spaces/:spaceId`): breadcrumb of its ancestors, its description, its child spaces and its posts; the same page as K-01 with the selection taken from the route.',
    surface,
    layout: ['PageHeader with ancestor breadcrumb (Archive for spaces.admin)', 'Left tree with the space selected and expanded', 'Description (Markdown, editable inline)', 'Child spaces grid', 'FilterBar + PostCard list'],
    dataTables: ['spaces', 'posts', 'filings', 'tags', 'relations', 'assets'],
    logic: [...HOME_LOGIC, 'The space id comes from the route; an unknown id shows an empty state with a way back to Spaces.'],
    components: ['PageHeader', 'SearchField', 'Checkbox', 'SpaceTree', 'Card', 'FilterBar', 'Select', 'PostCard', 'Thumb', 'FileIcon', 'Badge', 'Button', 'Textarea', 'Modal', 'Drawer', 'EmptyState', 'Markdown'],
    actions: HOME_ACTIONS,
    ...COMMON,
  });
}

export function postSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'K-03',
    name: 'Post',
    purpose: 'One post: its Markdown body, the spaces it is filed in (add or remove without duplicating it), tags, typed relations to any entity, what references it (backlinks), comments and the activity trail.',
    surface,
    layout: ['PageHeader (breadcrumb: Spaces > first space > post; Pin, Edit, Publish / Archive, Preview or Open link)', 'File block on a file post: Thumb of the file, its family, Preview (Drawer + DocumentViewer) or the sentence that it cannot be shown here, plus the source link', 'Meta row: kind, status, author, updated, tags (+ editor)', 'Markdown body (Textarea in edit mode)', 'Filed in: chips with remove + "File in…" Drawer (Checkbox per space)', 'Relations: list with remove; add form (type Select, target SearchField results, kind Select, note Input)', 'Referenced by (reverse query)', 'Comments (comments entity) and Activity'],
    dataTables: ['posts', 'filings', 'spaces', 'relations', 'tags', 'comments', 'activity', 'projects', 'tasks', 'documents', 'clients', 'deliverables', 'tools', 'competitions', 'brandAssets', 'presentations', 'assets'],
    logic: [
      'Filing adds or removes a `filings` row: the post stays one row, so an edit shows in every space at once.',
      'Relations are typed (`kind`) and any-to-any: the target picker searches spaces, posts, projects, tasks, documents, clients, deliverables, tools, roles, users, competitions, brand assets and presentations. "Referenced by" is the reverse query on toType = posts.',
      'Edits write with basedOn = post.updated_at (D-024); comments reuse the Work `comments` entity (D-022); the provider writes `activity` rows per changed field.',
      'Draft / archived posts stay visible to the author and to spaces.write roles; the Markdown atom renders bodies without HTML.',
      'A file post shows the file it points at (ar-17): the first assets row among its relations. When that row has served page renders, or is a served PDF, image or video, Preview opens the shared DocumentViewer in the page\'s Drawer pattern and replaces the bare "Open link" in the header; anything else keeps its link, which for the Dropbox archive is the only way to the file.',
    ],
    components: ['PageHeader', 'Badge', 'StatusPill', 'Avatar', 'Markdown', 'Textarea', 'Input', 'Select', 'SearchField', 'Checkbox', 'Drawer', 'Thumb', 'FileIcon', 'DocumentViewer', 'Button', 'EmptyState', 'KeyValue'],
    actions: [...POST_ACTIONS, HOME_ACTIONS[0]],
    ...COMMON,
  });
}

export function graphSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'K-04',
    name: 'Graph',
    purpose: 'The same spaces, posts and relations as a graph: pick a focus node and a depth, filter by kind, zoom with buttons, open anything with a click or Enter; the picture of "this belongs in more than one place".',
    surface,
    navGroup: 'spaces',
    layout: ['PageHeader', 'Tabs: 3D objects (default), Lanes skill tree, Radial tree, Objects map, Force 2D', 'Controls: focus Select (spaces and posts), depth Select (1 / 2 / 3 / all), camera − / + / fit / reset (+ auto-rotate in 3D), show archived, show all nodes', 'Kind ToggleButtons', 'The chosen view (the 3D one is lazy-loaded behind a Skeleton)', 'Legend (node tones, edge styles, what the pictures are) and counts'],
    dataTables: ['spaces', 'posts', 'filings', 'relations', 'projects', 'tasks', 'documents', 'clients', 'deliverables', 'tools', 'competitions', 'brandAssets', 'presentations'],
    logic: [
      'Nodes: spaces (tone by kind, areas larger), posts, and any other entity a relation points at (dashed "other" nodes labelled with their type). Edges: child (tree), filed (dashed accent), relation (arrow, titled with the kind).',
      'Focus + depth is a breadth-first cut around the focus node over the visible edges; kind filters apply before the cut; `?focus=<type>:<id>` and `?depth=` in the hash query make a view addressable (P-06).',
      'Five views over the same graph data (prompt 0012, rebuilt on the imagine-os graph gallery): 3D objects (three.js, the default), Lanes skill tree, Radial tree, Objects map and the dependency-free Force 2D `RelationGraph`. The choice lives in localStorage `aluzina.graphView`; every layout is deterministic, so the same input is the same picture.',
      'Nodes carry system imagery, never bare dots: initials for people and roles, the deploy-time page thumbnail `./thumbs/<code>.jpg` for anything that opens a hub page (with the hub\'s bilingual fallback tile), the space glyph, the post-kind glyph or the catalog glyph for the rest.',
      'The 3D view is `React.lazy`, so three.js only downloads when someone opens it; it falls back to Force 2D when WebGL is missing or the system asks for reduced motion (with a "show 3D anyway" toggle), pauses its render loop when the tab is hidden and disposes every GPU resource on unmount.',
      'Rendering is capped at the 140 nodes closest to the focus unless "Show all" is on; depth stays 2 by default.',
      'Zoom, fit, reset and auto-rotate are buttons driving the view\'s imperative handle (never wheel-only, never drag-only); drag and pinch are extras. Every node is reachable by keyboard through one roving-tabindex overlay: arrows walk neighbours, Enter opens, Space re-centres, Home returns to the focus, and the camera follows the highlighted node.',
    ],
    components: ['PageHeader', 'Tabs', 'Select', 'ToggleButton', 'Checkbox', 'Button', 'Skeleton', 'GraphViews', 'RelationGraph', 'Badge', 'EmptyState'],
    actions: GRAPH_ACTIONS,
    ...COMMON,
    checkedAt: [390, 1280, 1920, 2560, 3840],
  });
}

export function catalogSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'K-05',
    name: 'Catalog',
    purpose: 'The catalogs behind the spaces as data (D-029): deliverable types with phase, owner and status; clients (past, current, prospect) with their projects; tools with what replaces them and a dependency map; roles with portal links.',
    surface,
    navGroup: 'spaces',
    layout: ['PageHeader', 'Tabs: Deliverables, Clients, Tools, Roles, Assets (`?tab=`)', 'Deliverables: DataTable (name, phase, owner, typical days, status, relations, template)', 'Clients: DataTable (name, kind, sector, city, contact, projects, relations, space)', 'Tools: StatTiles dependency map + DataTable (name, vendor, category, used for, status, replaced by, notes)', 'Roles: DataTable (role, portal, permissions, demo user, role space)', 'Assets: DataTable (Thumb, name, kind, file type, pages, source, relations, Preview / G-08 / Open at source) + Drawer with the DocumentViewer'],
    dataTables: ['deliverables', 'clients', 'tools', 'relations', 'spaces', 'projects', 'assets'],
    logic: [
      'A template that is a hub page code (S-09, O-05, A-04, …) links to that route from the manifest; a deliverable without one shows a Placeholder "Open template" (P-09).',
      'Unknown facts are shown as "unknown", never invented (Sporti: sector, city, contact).',
      'The dependency map counts tools by status: in use, to replace, replaced, planned; "replaced by" links to the hub route when the value is a page code.',
      'Roles come from `src/auth/roles.ts` (seven since D-028) with their permissions and the space about them.',
      'Assets (ar-17) are the assets rows that are files in their own right (kind != page, since a page row is a render inside a document): every row shows a Thumb (served thumbnail, FileIcon of the family otherwise). A row with served page renders, or a served PDF / image / video, previews in a Drawer through the shared DocumentViewer; the rest keep "Open at source", and a document also links to G-08.',
    ],
    components: ['PageHeader', 'Tabs', 'DataTable', 'StatusPill', 'Badge', 'StatTile', 'Thumb', 'FileIcon', 'Drawer', 'DocumentViewer', 'Button', 'Placeholder', 'EmptyState'],
    actions: CATALOG_ACTIONS,
    ...COMMON,
  });
}

export function importSpec(surface: Surface): PageSpec {
  return defineSpec({
    code: 'K-06',
    name: 'Import from Slack and Asana',
    purpose: 'Where imports land: the mapping from Justin\'s Slack sidebar (sections and channels) to the seeded spaces with the checklist of what a real import does, and what the Asana CSV import already produced. The Slack upload is a Placeholder until an export exists; the Asana import is a repository script (D-062).',
    surface,
    navGroup: 'spaces',
    layout: ['PageHeader', 'Card: Slack upload (Placeholder) + note that this page is read-only today', 'Card: Asana import (the script, the generated seeds and their counts)', 'Checklist Card: what a Slack import will do', 'DataTable: Slack section / channel -> space (kind, posts today)'],
    dataTables: ['spaces', 'filings'],
    logic: [
      'Read-only: the mapping is derived from the seeded spaces whose slug equals the Slack channel name (D-027); nothing here re-seeds.',
      'The checklist is the contract for the Slack import script: channels -> spaces, messages -> posts, threads -> comments, pins -> pinned, mentions -> relations, files -> file posts.',
      'The Asana card counts the generated seeds it imports (`data/seed/asana/{hoy,portfolio}.ts`), so the page cannot claim more than the repository holds (D-062). There is no Asana upload: `npm run import:asana` emits reviewable files.',
    ],
    components: ['PageHeader', 'Card', 'KeyValue', 'Placeholder', 'Button', 'DataTable', 'Badge'],
    actions: IMPORT_ACTIONS,
    ...COMMON,
  });
}
