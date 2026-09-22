import { defineSpec, type ActionDef } from '../../specs/PageSpec';

/** Widths verified with Playwright against `npm run preview`, plus the print stylesheet at 1280 (P-01). */
const CHECKED = [360, 390, 768, 1280, 1920, 2560, 3840];

export const EXAMPLE_SET_ACTIONS: ActionDef[] = [
  { id: 'sets.print', label: 'Print or save as PDF', intent: 'print this set of examples or save it as a PDF' },
  { id: 'sets.copyLink', label: 'Copy the link', intent: 'copy the link to this set of examples' },
  { id: 'sets.setLang', label: 'Switch language', intent: 'read this page in {lang}', params: { lang: 'enum:es|en' } },
  { id: 'sets.openPreview', label: 'Open a preview', intent: 'open the design preview {asset}', params: { asset: 'id' } },
  { id: 'sets.closePreview', label: 'Close the preview', intent: 'close the design preview' },
];

export const exampleSetSpec = defineSpec({
  code: 'P-06',
  name: 'Example set',
  purpose:
    'The client-facing page behind a set the studio assembles on S-12: a quiet, printable selection of past projects — cover, name, year, type, tags, location, one client-ready sentence and a strip of design previews per project — shared as a plain link, Spanish by default, with nothing confidential in it.',
  surface: 'public',
  layout: [
    'Quiet brand header: BrandMark wordmark, "Ejemplos de proyectos" / "Project examples", the optional set title, the project count',
    'Controls (top right, hidden in print): ES | EN language toggle, "Print / Save as PDF", "Copy link"',
    'Intro line: what this selection is',
    'One section per project, in the order of the link: cover (Thumb 16:9 or a FileIcon mosaic), name, year, type, tags, location, the client-facing summary sentence',
    'Design previews: a strip of up to 8 Thumb buttons per project, each opening the preview Drawer',
    'Preview Drawer: DocumentViewer over the served page renders (paged when the file has pages)',
    'Footer: studio name, aluzinaa.com, "prepared by the studio" note',
    'Print stylesheet: one project per page, covers and previews as a grid, no controls, black on white',
  ],
  dataTables: ['projects', 'assets'],
  roles: ['public', 'client'],
  logic: [
    'The set is stateless in the URL: `/sets?p=<projectId>,<projectId>&t=<title>&lang=es|en&print=1`. Nothing is stored, so a link keeps working with no row, no auth and no re-seed risk; S-12 builds the link and the client can forward it.',
    'Projects are rendered in the order given in `p`, de-duplicated; an id that matches no row is skipped silently (a client never reads an error about the studio\'s data).',
    'Spanish is the default when `lang` is missing (the clients are Spanish-first); the toggle writes `lang` into the URL and the page translates itself with its own `translator(lang)` instead of switching the app-wide language, so opening a client link never rewrites the studio\'s own session.',
    'Covers are `project.coverUrl` (the served thumbnail, a column of the row since ar-19), else a mosaic of `FileIcon`s for `project.fileTypes`, the same fallback as S-12: a project without photography still reads as itself.',
    'Previews are `useProjectFiles(project)` (the project\'s lazy chunk, ar-19) filtered to files that have a served thumbnail and are neither tagged `confidencial` nor redacted by the crawler (D-059), capped at 8 per project; a confidential file is never rendered and its name never printed.',
    'The summary is `clientSummary(project.summary)`: whole sentences, with the crawler\'s folder provenance and every "inferred; confirm with the founder" note (D-060) stripped. When nothing client-facing is left the paragraph is omitted rather than filled.',
    'Location is printed only when it is not the seed\'s placeholder ("Ubicación no publicada"); tags drop the archive vocabulary (`archive`, `dropbox`, the bare year) so the client reads words about the work.',
    '`print=1` calls `window.print()` once, after the projects resolve and a short settle for the thumbnails: that is what S-12\'s "Export PDF" opens, so the PDF is the browser\'s own and needs no export service.',
    'The preview Drawer is page state (not the URL): a client\'s back button leaves the set, never a half-open dialog.',
    'No permission, no session, `bare` shell: the page draws its own header and footer, like P-01..P-05 (D-035).',
  ],
  components: ['BrandMark', 'Thumb', 'FileIcon', 'Badge', 'Button', 'ToggleButton', 'Card', 'Drawer', 'DocumentViewer', 'EmptyState', 'Skeleton'],
  actions: EXAMPLE_SET_ACTIONS,
  checkedAt: CHECKED,
  notes: [
    'The set link carries project ids, which are stable seed ids; when projects move to Supabase the same link shape keeps working because the page resolves ids through the provider.',
    'Nothing on the page names a client, a budget or a file: the previews are design renders only (D-059).',
  ],
});
