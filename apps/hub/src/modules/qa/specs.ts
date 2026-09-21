import { defineSpec } from '../../specs/PageSpec';

const SURFACE_ENUM = 'enum:all|hub|founder|ops|studio|brand|client|dev|docs|manual|public' as const;

export const actionsSpec = defineSpec({
  code: 'D-09',
  name: 'Actions registry',
  purpose: 'Every action declared in a page spec joined with the handlers registered right now, with a generated form that runs one by id. This page is the WebMCP tool surface and the voice vocabulary made visible (P-05, P-06, D-036).',
  surface: 'dev',
  navGroup: 'developer',
  layout: ['PageHeader with the export button', 'StatTiles (declared, distinct ids, live now, with permission, with params)', 'FilterBar (search, surface, module, permission, live only)', 'DataTable of declared actions with a live pill', 'Drawer: the full ActionDef, a generated parameter form, Run, and Copy as WebMCP tool JSON'],
  dataTables: [],
  roles: ['dev', 'founder'],
  logic: [
    'Rows are declaredActions(useRoutes()) joined with useLiveActions(); the live column re-renders as pages mount and unmount, so opening another tab does not change it but navigating does.',
    'Run calls runAction(id, params) and shows the ActionResult; it is disabled while the id has no handler or the current person lacks the action permission (can()).',
    'The parameter form is generated from ActionDef.params: string / id -> Input, number -> number Input, date -> date Input, boolean -> Checkbox, enum:a|b -> Select.',
    'Copy as WebMCP tool JSON writes { name, description, inputSchema } to the clipboard; Export all as JSON downloads the whole declared list as a Blob.',
    'qa.runAction refuses to run itself so the bus cannot recurse.',
  ],
  components: ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'Checkbox', 'Input', 'Button', 'DataTable', 'Badge', 'StatusPill', 'Drawer', 'KeyValue', 'EmptyState', 'Card'],
  actions: [
    { id: 'qa.searchActions', label: 'Search actions', intent: 'find the action {query}', permission: 'dev.tools', params: { query: 'string' } },
    { id: 'qa.filterActionsSurface', label: 'Filter actions by surface', intent: 'show only actions of the {surface} surface', permission: 'dev.tools', params: { surface: SURFACE_ENUM } },
    { id: 'qa.filterActionsLive', label: 'Show only live actions', intent: 'show only the actions that are live right now', permission: 'dev.tools', params: { live: 'boolean' } },
    { id: 'qa.openAction', label: 'Open an action', intent: 'open the action {action}', permission: 'dev.tools', params: { action: 'id' } },
    { id: 'qa.runAction', label: 'Run an action', intent: 'run the action {action}', permission: 'dev.tools', params: { action: 'id' } },
    { id: 'qa.copyActionTool', label: 'Copy an action as a WebMCP tool', intent: 'copy the action {action} as a WebMCP tool definition', permission: 'dev.tools', params: { action: 'id' } },
    { id: 'qa.exportActions', label: 'Export every action', intent: 'export every declared action as JSON', permission: 'dev.tools' },
  ],
  checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840],
});

export const tokensSpec = defineSpec({
  code: 'D-14',
  name: 'Design tokens',
  purpose: 'The design system as data: every colour in both themes with its contrast ratio, the type ladder, spacing, radii, the responsive scale bands and the target size, read straight from src/design/tokens.ts (P-07, P-01).',
  surface: 'dev',
  navGroup: 'developer',
  layout: ['PageHeader', 'SearchField over token and variable names', 'Card: colours, light and dark swatch per token', 'Card: contrast table for the text-on-surface pairs', 'Card: typography (families and the rem ladder)', 'Card: spacing', 'Card: radii', 'Card: shadows (none tokenised yet)', 'Card: responsive scale bands with a band preview', 'Card: target size and focus ring with a live demo control'],
  dataTables: [],
  roles: ['dev', 'founder', 'brand'],
  logic: [
    'Everything is read from the tokens object, so this page cannot drift from tokens.css: the same source generates both (gen-tokens.mjs).',
    'Variable names are derived the same way the generator does it (camelCase -> --color-kebab-case).',
    'Contrast is the WCAG 2.1 ratio from the two hex values; under 4.5:1 is flagged, 3:1 to 4.5:1 is marked large-text-only.',
    'The preview band select recomputes the rem ladder, spacing and target in px; the default follows the real viewport and updates on resize.',
    'Copy variable writes var(--name) to the clipboard; Edit token is a Placeholder because tokens are edited in the source file.',
  ],
  components: ['PageHeader', 'SearchField', 'Card', 'Select', 'Button', 'Badge', 'DataTable', 'KeyValue', 'Placeholder', 'EmptyState'],
  actions: [
    { id: 'qa.searchTokens', label: 'Search tokens', intent: 'find the token {query}', permission: 'dev.tools', params: { query: 'string' } },
    { id: 'qa.copyToken', label: 'Copy a token variable', intent: 'copy the CSS variable of the token {token}', permission: 'dev.tools', params: { token: 'string' } },
    { id: 'qa.previewScale', label: 'Preview a scale band', intent: 'preview the type scale at {width} px', permission: 'dev.tools', params: { width: 'number' } },
    { id: 'qa.editToken', label: 'Edit a token', intent: 'change the token {token} to {value}', permission: 'dev.tools', params: { token: 'string', value: 'string' } },
  ],
  checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840],
});

export const testingSpec = defineSpec({
  code: 'D-11',
  name: 'Testing hub',
  purpose: 'Every registered route against the responsive matrix and the spec checklist: which widths are recorded, what a spec still lacks, and how to open a page at a given width as the role that uses it (P-01, P-02, P-08).',
  surface: 'dev',
  navGroup: 'quality',
  layout: ['PageHeader', 'StatTiles (routes, fully checked, average completeness, width cells checked)', 'FilterBar (search, surface, incomplete only) with the screenshot-manifest Placeholder', 'DataTable: one row per route, one column per matrix width plus EN/ES, spec score, placeholder count, screenshots', 'Drawer: missing spec checks, recorded and missing widths, Open at 390 / 1280 / 1920, simulator Placeholder', 'Card: feedback and bug filing (P-08) with a Placeholder button'],
  dataTables: [],
  roles: ['dev', 'founder'],
  logic: [
    'Rows come from useRoutes(); a width cell is ticked when it appears in spec.checkedAt, so the matrix reports what builders recorded, not a live measurement.',
    'Spec score is specCompleteness(); "incomplete only" keeps the routes with at least one missing check.',
    'Open at a width calls window.open with the route hash and ?as=<role>, picking the first role of the spec that maps to a portal; routes with URL parameters cannot be opened and say so.',
    'The simulator link is real when a route for /dev/simulator (D-08) is registered and a Placeholder while it is not.',
    'Placeholder counts and screenshot availability cannot be read from a running page, so both columns show a dash and the screenshot manifest button is a Placeholder.',
  ],
  components: ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'Checkbox', 'DataTable', 'Badge', 'Button', 'Drawer', 'KeyValue', 'Card', 'Placeholder', 'EmptyState'],
  actions: [
    { id: 'qa.filterMatrixSurface', label: 'Filter the matrix by surface', intent: 'show only the {surface} routes in the matrix', permission: 'dev.tools', params: { surface: SURFACE_ENUM } },
    { id: 'qa.filterIncomplete', label: 'Show only incomplete pages', intent: 'show only the pages with a missing spec check', permission: 'dev.tools', params: { incomplete: 'boolean' } },
    { id: 'qa.openMatrixRow', label: 'Open a matrix row', intent: 'open the testing detail of page {page}', permission: 'dev.tools', params: { page: 'string' } },
    { id: 'qa.openAtWidth', label: 'Open a page at a width', intent: 'open page {page} at {width} px', permission: 'dev.tools', params: { page: 'string', width: 'number' } },
    { id: 'qa.fileBug', label: 'File a bug', intent: 'file a bug about page {page}', permission: 'dev.tools', params: { page: 'string' } },
  ],
  checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840],
});
