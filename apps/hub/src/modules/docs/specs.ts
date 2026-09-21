import { defineSpec, type ActionDef, type PageSpec } from '../../specs/PageSpec';

const WIDTHS = [360, 390, 768, 1280, 1920, 2560, 3840];

const ACTIONS: ActionDef[] = [
  { id: 'docs.openDocument', label: 'Open document', intent: 'open the document {path}', permission: 'docs.read', params: { path: 'string' } },
  { id: 'docs.searchDocs', label: 'Search documents', intent: 'search the documentation for {query}', permission: 'docs.read', params: { query: 'string' } },
  { id: 'docs.openOnGithub', label: 'Open on GitHub', intent: 'open the current document on GitHub', permission: 'docs.read' },
  { id: 'docs.collapseFolder', label: 'Collapse folder', intent: 'collapse or expand the folder {folder}', permission: 'docs.read', params: { folder: 'string', open: 'boolean' } },
];

const LAYOUT = [
  'PageHeader: title, subtitle, Open on GitHub action',
  'Left column: SearchField over file names and loaded text, then the SpaceTree of docs/ (root files in reading order, then changelog, prompts, pages, knowledge, reference, qa, plan, source)',
  'Under 1024 px the tree moves into a Drawer behind a "Browse documents" button',
  'Right column: the selected document — path + Open on GitHub, then the Markdown atom, or the plan table for plan/plan.json',
];

const LOGIC = [
  "Documents are loaded lazily with `import.meta.glob('@docs/**/*.md', { query: '?raw', import: 'default', eager: false })`: the viewer reads the repo's own files, so the in-app docs can never drift from what an agent reads, and opening the page does not download every document.",
  'The selected document is the URL (`#/docs/<path>`), so a link to one document is a link anyone can paste; `/docs` opens README.md, the start-here map.',
  'Relative Markdown links between documents are rewritten to the viewer’s own URL before rendering, and a delegated click handler navigates in-app instead of opening a tab; links that leave `docs/` are left as written.',
  'Search always matches file names and paths; it also matches the text of every document already loaded (opening one caches it), and "Load every document" fetches the rest for a full-text search.',
  '`docs/plan/plan.json` is rendered from the typed `src/plan` module as a DataTable (id, title, step, status, model, codes, dependencies) instead of raw JSON.',
  'Documents are shown exactly as written: only the UI chrome is bilingual (P-13).',
];

const COMPONENTS = ['PageHeader', 'SearchField', 'SpaceTree', 'Markdown', 'DataTable', 'StatusPill', 'Badge', 'Button', 'Drawer', 'EmptyState', 'Skeleton'];

export const docsSpec: PageSpec = defineSpec({
  code: 'D-06',
  name: 'Documentation',
  purpose:
    'The repo docs tree inside the product: anyone in the studio (and any agent) reads the principles, the build plan, the decisions, the changelog, the verbatim prompts, the page docs and the knowledge base without leaving the Hub or opening GitHub.',
  surface: 'docs',
  navGroup: 'docs',
  layout: LAYOUT,
  dataTables: [],
  roles: ['founder', 'ops', 'studio', 'brand', 'marketing', 'dev'],
  logic: LOGIC,
  components: COMPONENTS,
  actions: ACTIONS,
  checkedAt: WIDTHS,
  notes: ['`/docs` selects `README.md`, the start-here map of `docs/README.md`.'],
});

export const documentSpec: PageSpec = defineSpec({
  code: 'D-15',
  name: 'Document',
  purpose:
    'One documentation file at its own address (`#/docs/<path>`): the same viewer with that document selected, so a decision, a changelog entry or a page doc can be linked to from a commit, a Slack message or another page.',
  surface: 'docs',
  layout: LAYOUT,
  dataTables: [],
  roles: ['founder', 'ops', 'studio', 'brand', 'marketing', 'dev'],
  logic: [...LOGIC, 'A path with no document renders an EmptyState with a way back to README.md, never a blank page.'],
  components: COMPONENTS,
  actions: ACTIONS,
  checkedAt: WIDTHS,
  notes: ['Same component as D-06; the splat route gives every document in `docs/` a URL.'],
});
