import { defineSpec } from '../../specs/PageSpec';

/**
 * Brand and communication portal (G-xx): Angélica's part of the system
 * (docs/knowledge/team.md#angelica---graphic-design-and-communication). One spec per page; every
 * button on a page has an entry in `actions` (P-05).
 */

export const homeSpec = defineSpec({
  code: 'G-01',
  name: 'Brand dashboard',
  purpose:
    "Angélica's home: what is due next across the 2027 competitions, the sales presentations, the graphic revisions queue and the brand asset library, plus the alerts addressed to her role.",
  surface: 'brand',
  navGroup: 'overview',
  layout: [
    'PageHeader',
    'StatTile row (competitions with a date / unknown, presentations open, revisions in the queue, current brand assets)',
    'Card "Next deadlines": merged competitions + presentations + revisions with a due date, soonest first',
    'Card "Alerts for this role": open alerts with forRole=brand (read-only here)',
    'Card grid: one card per section of the portal (competitions, presentations, identity, images, revisions, assets)',
  ],
  dataTables: ['competitions', 'presentations', 'revisions', 'brandAssets', 'alerts'],
  roles: ['brand', 'founder'],
  logic: [
    'Deadlines merge three entities: competition.submissionDate, presentation.dueDate, revision.dueDate; rows without a date are counted, never shown with an invented date.',
    'daysUntil() decides the tone: past = danger, 0-7 days = warning, else neutral.',
    'Competition facts that are null render as "unknown" (docs/knowledge/competitions.md), never as a guess.',
    'Section cards navigate; they are the keyboard path into the portal.',
  ],
  components: ['PageHeader', 'StatTile', 'Card', 'DataTable', 'StatusPill', 'Badge', 'EmptyState', 'Button'],
  actions: [
    { id: 'brand.openSection', label: 'Open section', intent: 'open the {section} section of the brand portal', permission: 'brand.manage', params: { section: 'string' } },
  ],
  checkedAt: [360, 390, 768, 1280, 1920],
});

export const competitionsSpec = defineSpec({
  code: 'G-02',
  name: 'Competitions 2027',
  purpose:
    'The 20 competition slots Aluzina enters in 2027, ordered by submission date with undated slots last: each slot carries its materials folder, the project entered and where it stands from slot to result.',
  surface: 'brand',
  navGroup: 'competitions',
  layout: [
    'PageHeader',
    'StatTile row (slots, dated, undated, submitted)',
    'FilterBar (search, status, project)',
    'Tabs: DataTable of the slots | Calendar of the dated slots',
    'Drawer: slot detail (KeyValue) + the form that fills in name, organiser, category, submission date, project and materials folder + status advance',
  ],
  dataTables: ['competitions'],
  roles: ['brand', 'founder'],
  logic: [
    'Sort: submissionDate ascending, rows without a date last, slot number as the tiebreak (docs/knowledge/competitions.md: "organized by submission date").',
    'Every null field renders as "unknown"; the 20 slots are seeded empty and are filled in from the drawer form, never guessed.',
    'Status advances one step along slot -> researching -> preparing -> ready -> submitted -> result; the result text itself is entered in the drawer.',
    'The Calendar only shows slots that have a submission date; with none set it shows its empty state, which is the honest picture today.',
    'The list keeps the six columns that fit at 1280 px (slot, competition, date, project, folder, status); organiser and category live in the drawer.',
  ],
  components: ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'Tabs', 'DataTable', 'Calendar', 'Drawer', 'KeyValue', 'Input', 'StatusPill', 'Button', 'Placeholder'],
  actions: [
    { id: 'brand.openCompetition', label: 'Open competition slot', intent: 'open competition slot {slot}', permission: 'competitions.manage', params: { slot: 'number' } },
    { id: 'brand.saveCompetition', label: 'Save competition details', intent: 'set the submission date of slot {slot} to {date}', permission: 'competitions.manage', params: { slot: 'number', date: 'date' } },
    { id: 'brand.advanceCompetition', label: 'Advance competition status', intent: 'move competition slot {slot} to the next status', permission: 'competitions.manage', params: { slot: 'number' } },
    { id: 'brand.openMaterialsFolder', label: 'Open materials folder', intent: 'open the materials folder of competition slot {slot}', permission: 'competitions.manage', params: { slot: 'number' } },
    { id: 'brand.importCompetitions', label: 'Import the competition list', intent: 'import the 2027 competition list', permission: 'competitions.manage' },
    { id: 'brand.switchCompetitionView', label: 'Switch view', intent: 'show the competitions as a {view}', permission: 'competitions.manage', params: { view: 'enum:table|calendar' } },
  ],
  checkedAt: [360, 390, 768, 1280, 1920],
});

export const presentationsSpec = defineSpec({
  code: 'G-03',
  name: 'Sales presentations',
  purpose:
    'Every sales, concept, proposal and competition deck Angélica produces, from requested through drafting and review to final, with its project, slide count and due date.',
  surface: 'brand',
  navGroup: 'sales',
  layout: [
    'PageHeader (request a deck)',
    'StatTile row (open, in review, final, overdue)',
    'FilterBar (search, kind, status)',
    'DataTable of presentations',
    'Drawer: deck detail (KeyValue) + advance + open deck',
  ],
  dataTables: ['presentations', 'projects'],
  roles: ['brand', 'founder'],
  logic: [
    'Status advances one step along requested -> drafting -> review -> final; final decks have no advance action.',
    'Overdue = dueDate in the past and status is not final.',
    'Slide count 0 means the deck has not been started; it renders as "unknown" rather than as a zero-slide deck.',
  ],
  components: ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'DataTable', 'Drawer', 'KeyValue', 'StatusPill', 'Button', 'Placeholder'],
  actions: [
    { id: 'brand.openPresentation', label: 'Open presentation', intent: 'open the presentation {presentation}', permission: 'presentations.write', params: { presentation: 'id' } },
    { id: 'brand.advancePresentation', label: 'Advance presentation', intent: 'move the presentation {presentation} to the next status', permission: 'presentations.write', params: { presentation: 'id' } },
    { id: 'brand.requestPresentation', label: 'Request a presentation', intent: 'request a {kind} presentation for {project}', permission: 'presentations.write', params: { kind: 'enum:sales|concept|proposal|competition', project: 'id' } },
    { id: 'brand.openDeck', label: 'Open the deck file', intent: 'open the deck file of {presentation}', permission: 'presentations.write', params: { presentation: 'id' } },
  ],
  checkedAt: [360, 390, 768, 1280, 1920],
});

export const identitySpec = defineSpec({
  code: 'G-04',
  name: 'Brand identity and assets',
  purpose:
    "Aluzina's identity in one place: logos, typography, palette, templates and the identity manual, grouped by kind, with the superseded versions kept visible so nobody applies an old file.",
  surface: 'brand',
  navGroup: 'brand',
  layout: [
    'PageHeader (upload a new version)',
    'StatTile row (current, draft, superseded)',
    'Card "Identity manual" with the guideline assets and a placeholder viewer',
    'One Card per asset kind with a DataTable of its assets (name, format, version, path, status)',
  ],
  dataTables: ['brandAssets'],
  roles: ['brand', 'founder', 'studio'],
  logic: [
    'Assets are grouped by kind in a fixed order (logo, typography, palette, template, icon, photo, guideline); empty kinds are not rendered.',
    'Superseded assets keep their row and are marked; marking an asset superseded is a real write, replacing it with a new version is not wired yet.',
    'The identity manual card reads the guideline assets and warns when the current manual is superseded.',
  ],
  components: ['PageHeader', 'StatTile', 'Card', 'DataTable', 'StatusPill', 'Badge', 'Button', 'Placeholder', 'EmptyState'],
  actions: [
    { id: 'brand.supersedeAsset', label: 'Mark asset superseded', intent: 'mark the asset {asset} as superseded', permission: 'assets.manage', params: { asset: 'id' } },
    { id: 'brand.restoreAsset', label: 'Mark asset current', intent: 'mark the asset {asset} as current', permission: 'assets.manage', params: { asset: 'id' } },
    { id: 'brand.uploadAsset', label: 'Upload a new version', intent: 'upload a new version of {asset}', permission: 'assets.manage', params: { asset: 'id' } },
    { id: 'brand.openManual', label: 'Open the identity manual', intent: 'open the Aluzina identity manual', permission: 'brand.manage' },
    { id: 'brand.checkIdentity', label: 'Check a file against the identity', intent: 'check whether {file} follows the Aluzina identity', permission: 'brand.manage', params: { file: 'string' } },
    { id: 'brand.openTokens', label: 'Open the design tokens', intent: 'open the design tokens behind the identity', permission: 'brand.manage' },
  ],
  checkedAt: [360, 390, 768, 1280, 1920],
});

export const imagesSpec = defineSpec({
  code: 'G-05',
  name: 'Images for clients',
  purpose:
    'The image sets Angélica prepares for clients: every image revision grouped by project, from the request through retouching to delivery and the client approval.',
  surface: 'brand',
  navGroup: 'communication',
  layout: [
    'PageHeader (new image set)',
    'StatTile row (requested, in progress, delivered, approved)',
    'FilterBar (search, status)',
    'One Card per project with a DataTable of its image revisions',
    'Drawer: image set detail + advance + share with the client',
  ],
  dataTables: ['revisions', 'projects'],
  roles: ['brand', 'founder'],
  logic: [
    'Only revisions with kind = image appear here; the other kinds live in the revisions queue (G-06).',
    'Rows are grouped by project; revisions without a project fall into a "no project" card.',
    'Advance moves requested -> in-progress -> delivered -> approved; approval by the client is not wired yet.',
  ],
  components: ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'Card', 'DataTable', 'Drawer', 'KeyValue', 'StatusPill', 'Button', 'Placeholder', 'EmptyState'],
  actions: [
    { id: 'brand.openImageSet', label: 'Open image set', intent: 'open the image set {revision}', permission: 'images.write', params: { revision: 'id' } },
    { id: 'brand.advanceImageSet', label: 'Advance image set', intent: 'move the image set {revision} to the next status', permission: 'images.write', params: { revision: 'id' } },
    { id: 'brand.newImageSet', label: 'New image set', intent: 'prepare a new image set for {project}', permission: 'images.write', params: { project: 'id' } },
    { id: 'brand.shareImages', label: 'Share with the client', intent: 'share the image set {revision} with the client', permission: 'images.write', params: { revision: 'id' } },
    { id: 'brand.previewImages', label: 'Preview the images', intent: 'preview the images of {revision}', permission: 'images.write', params: { revision: 'id' } },
  ],
  checkedAt: [360, 390, 768, 1280, 1920],
});

export const revisionsSpec = defineSpec({
  code: 'G-06',
  name: 'Graphic revisions queue',
  purpose:
    'The queue of graphic revisions the rest of the studio asks Angélica for, as a board from requested through in progress and delivered to approved, with who asked and when it is due.',
  surface: 'brand',
  navGroup: 'communication',
  layout: [
    'PageHeader (request a revision)',
    'StatTile row (one per column, plus overdue)',
    'FilterBar (search, kind)',
    'Kanban: requested | in-progress | delivered | approved',
    'Drawer: revision detail (KeyValue)',
  ],
  dataTables: ['revisions', 'projects'],
  roles: ['brand', 'founder', 'studio', 'ops'],
  logic: [
    'Moving a card writes revision.status through useData; the board has explicit move buttons, never drag only (P-03).',
    'The card subtitle names the project and the requester, resolved from demoUsers.',
    'Overdue = dueDate in the past and status is neither delivered nor approved.',
  ],
  components: ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'Kanban', 'Drawer', 'KeyValue', 'StatusPill', 'Button', 'Placeholder'],
  actions: [
    { id: 'brand.moveRevision', label: 'Move revision', intent: 'move the revision {revision} to {status}', permission: 'revisions.manage', params: { revision: 'id', status: 'enum:requested|in-progress|delivered|approved' } },
    { id: 'brand.openRevision', label: 'Open revision', intent: 'open the revision {revision}', permission: 'revisions.manage', params: { revision: 'id' } },
    { id: 'brand.requestRevision', label: 'Request a revision', intent: 'request a {kind} revision for {project}', permission: 'revisions.manage', params: { kind: 'enum:image|layout|pdf|presentation|social', project: 'id' } },
  ],
  checkedAt: [360, 390, 768, 1280, 1920],
});

export const assetsSpec = defineSpec({
  code: 'G-07',
  name: 'Asset library organization',
  purpose:
    "How Aluzina's graphic files are organized: the folders derived from the brand asset paths and the competition materials folders, so Angélica can see at a glance which folder holds what and which are still empty.",
  surface: 'brand',
  navGroup: 'brand',
  layout: [
    'PageHeader (new folder, connect storage)',
    'StatTile row (folders, files, competition folders, folders still empty)',
    'FilterBar (search)',
    'DataTable of folders (path, source, items, status summary)',
    'Card: what is not wired yet (upload, rename, move, storage sync)',
  ],
  dataTables: ['brandAssets', 'competitions'],
  roles: ['brand', 'founder'],
  logic: [
    'Folders are derived, not stored: the parent path of every brandAsset plus every competition materialsFolder; there is no folder entity yet.',
    'A competition folder with no asset in it counts as empty, which is the normal state until the 2027 materials are produced.',
    'Everything that would change files on disk (upload, rename, move, sync) is a Placeholder: the hub has no file storage yet.',
  ],
  components: ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'DataTable', 'Card', 'Badge', 'Button', 'Placeholder'],
  actions: [
    { id: 'brand.openFolder', label: 'Open folder', intent: 'open the folder {folder}', permission: 'assets.manage', params: { folder: 'string' } },
    { id: 'brand.newFolder', label: 'New folder', intent: 'create the folder {folder}', permission: 'assets.manage', params: { folder: 'string' } },
    { id: 'brand.connectStorage', label: 'Connect storage', intent: 'connect the asset library to the studio storage', permission: 'assets.manage' },
    { id: 'brand.uploadToFolder', label: 'Upload files', intent: 'upload files into {folder}', permission: 'assets.manage', params: { folder: 'string' } },
    { id: 'brand.renameFolder', label: 'Rename folder', intent: 'rename the folder {folder}', permission: 'assets.manage', params: { folder: 'string' } },
    { id: 'brand.moveAsset', label: 'Move a file', intent: 'move {file} into {folder}', permission: 'assets.manage', params: { file: 'string', folder: 'string' } },
  ],
  checkedAt: [360, 390, 768, 1280, 1920],
});
