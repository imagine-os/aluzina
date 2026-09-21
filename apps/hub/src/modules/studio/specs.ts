import { defineSpec } from '../../specs/PageSpec';

/** Widths verified for every studio page (P-01 matrix, light and dark). */
const WIDTHS = [360, 390, 768, 1280, 1920];

export const homeSpec = defineSpec({
  code: 'S-01',
  name: 'Studio dashboard',
  purpose:
    "Sarai's home: the projects in development with their phase and the creative direction Alejandra set, the consistency checks she has to close before work reaches the founder, the studio's open tasks and the render and supplier packs in flight (docs/knowledge/team.md#sarai---interior-design).",
  surface: 'studio',
  navGroup: 'overview',
  layout: [
    'PageHeader (Placeholder: new design proposal)',
    'Four StatTiles: projects in development, checks to close, open studio tasks, packs in flight',
    'Card: projects in development (DataTable of name, phase, creative direction, approval; row opens S-02)',
    'Card: consistency checks before the founder (DataTable; row opens S-08)',
    'Card: studio tasks, read-only (DataTable) with a Placeholder to ask operations to reschedule',
    'Card: render and supplier packs in flight (DataTable; row opens S-07)',
  ],
  dataTables: ['projects', 'consistencyChecks', 'tasks', 'renderPacks'],
  roles: ['studio', 'founder'],
  logic: [
    'Projects in development = phase development or documentation; checks to close = status pending or issues; packs in flight = status other than delivered.',
    'Studio tasks are read-only here: their status belongs to operations (tasks.manage), so the reschedule control is a Placeholder.',
    'Every StatTile and row activates a navigation to the page that owns the item; no writes happen on this page.',
  ],
  components: ['PageHeader', 'StatTile', 'Card', 'DataTable', 'StatusPill', 'Badge', 'Placeholder', 'Button'],
  actions: [
    { id: 'studio.openProject', label: 'Open project', intent: 'open the project {project}', permission: 'projects.read', params: { project: 'id' } },
    { id: 'studio.openCheck', label: 'Open consistency check', intent: 'open the consistency check {check}', permission: 'projects.check', params: { check: 'id' } },
    { id: 'studio.openPack', label: 'Open render pack', intent: 'open the render pack {pack}', permission: 'renders.brief', params: { pack: 'id' } },
    { id: 'studio.newProposal', label: 'New design proposal', intent: 'start a design proposal for {project}', permission: 'design.develop', params: { project: 'id' } },
    { id: 'studio.askReschedule', label: 'Ask operations to reschedule', intent: 'ask operations to reschedule the task {task}', permission: 'design.develop', params: { task: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const projectsSpec = defineSpec({
  code: 'S-02',
  name: 'Projects and proposals',
  purpose:
    'Sarai develops the design proposal of each project from the creative direction Alejandra set: one card per project with its phase, creative direction, approval state and the documents attached, and the hand-off that sends a proposal into the consistency check.',
  surface: 'studio',
  navGroup: 'projects',
  layout: [
    'PageHeader (Placeholder: new proposal)',
    'FilterBar (search, phase, approval)',
    'Grid of project Cards: client, location, KeyValue with phase / creative direction / approval / due date / budget',
    'Drawer: project detail, summary, its documents in a DataTable, send-to-check button, Placeholder to request creative direction',
  ],
  dataTables: ['projects', 'documents'],
  roles: ['studio', 'founder'],
  logic: [
    'Send to consistency check writes projects.approval = in-check; it is only offered for draft or changes-requested, and only with design.develop.',
    'Creative direction is read-only for the studio: it is Alejandra’s call, so requesting it is a Placeholder.',
    'Filters are client-side over the live projects table; the drawer reads the documents of the selected project.',
  ],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'Card', 'KeyValue', 'StatusPill', 'DataTable', 'Drawer', 'Placeholder', 'Button', 'EmptyState'],
  actions: [
    { id: 'studio.openProjectDetail', label: 'Open project detail', intent: 'show the detail of project {project}', permission: 'projects.read', params: { project: 'id' } },
    { id: 'studio.sendToCheck', label: 'Send to consistency check', intent: 'send {project} to the consistency check', permission: 'design.develop', params: { project: 'id' } },
    { id: 'studio.requestDirection', label: 'Request creative direction', intent: 'ask Alejandra for the creative direction of {project}', permission: 'design.develop', params: { project: 'id' } },
    { id: 'studio.newProposalDoc', label: 'New proposal', intent: 'create a proposal document for {project}', permission: 'design.develop', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const referencesSpec = defineSpec({
  code: 'S-03',
  name: 'References and mood boards',
  purpose:
    'Sarai researches design references and builds mood boards: every reference lives on a board, carries its source and tags, and can be moved to another board as the concept settles.',
  surface: 'studio',
  navGroup: 'references',
  layout: [
    'PageHeader (Placeholders: add reference, new mood board)',
    'FilterBar (search, project, tag)',
    'One Card per board with a grid of reference tiles (thumbnail slot, title, source, tags)',
    'Drawer: reference detail, note, move-to-board Select, Placeholder to upload the image',
  ],
  dataTables: ['references', 'projects'],
  roles: ['studio', 'founder', 'brand'],
  logic: [
    'References are grouped by their board field; boards are sorted by name and show their reference count.',
    'Move to board writes references.board through useData (references.manage); the grid re-renders live.',
    'imageUrl is null in every seed row, so each tile shows a labelled empty thumbnail slot with a Placeholder upload control instead of a broken image.',
  ],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'Card', 'Badge', 'Drawer', 'KeyValue', 'Placeholder', 'Button', 'EmptyState'],
  actions: [
    { id: 'studio.openReference', label: 'Open reference', intent: 'open the reference {reference}', permission: 'references.manage', params: { reference: 'id' } },
    { id: 'studio.moveReference', label: 'Move to board', intent: 'move the reference {reference} to the board {board}', permission: 'references.manage', params: { reference: 'id', board: 'string' } },
    { id: 'studio.addReference', label: 'Add reference', intent: 'add a reference to the board {board}', permission: 'references.manage', params: { board: 'string' } },
    { id: 'studio.newBoard', label: 'New mood board', intent: 'create a mood board for {project}', permission: 'references.manage', params: { project: 'id' } },
    { id: 'studio.uploadReferenceImage', label: 'Upload image', intent: 'upload the image of the reference {reference}', permission: 'references.manage', params: { reference: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const materialsSpec = defineSpec({
  code: 'S-04',
  name: 'Material palettes',
  purpose:
    'Sarai builds the material palette of each project and walks every material from proposed to sampled to approved, so that only approved materials reach a schedule, a supplier pack or the founder.',
  surface: 'studio',
  navGroup: 'references',
  layout: [
    'PageHeader (Placeholder: new palette)',
    'FilterBar (search, project, status)',
    'One Card per palette with a DataTable of its materials (name, category, finish, colour, unit price, status) and row actions',
    'Drawer: material detail',
  ],
  dataTables: ['materials', 'projects', 'suppliers'],
  roles: ['studio', 'founder'],
  logic: [
    'Request sample writes status = sampled, Approve writes approved, Reject writes rejected (materials.manage); each action is hidden when it does not apply to the row.',
    'Materials are grouped by their palette field; the card subtitle counts total and approved materials.',
    'unitCop may be null (product materials not quoted yet): it renders as "Unknown", never as a zero.',
  ],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'Card', 'DataTable', 'StatusPill', 'Drawer', 'KeyValue', 'Placeholder', 'Button', 'EmptyState'],
  actions: [
    { id: 'studio.sampleMaterial', label: 'Request sample', intent: 'request a sample of the material {material}', permission: 'materials.manage', params: { material: 'id' } },
    { id: 'studio.approveMaterial', label: 'Approve material', intent: 'approve the material {material}', permission: 'materials.manage', params: { material: 'id' } },
    { id: 'studio.rejectMaterial', label: 'Reject material', intent: 'reject the material {material}', permission: 'materials.manage', params: { material: 'id' } },
    { id: 'studio.openMaterial', label: 'Open material', intent: 'open the material {material}', permission: 'materials.manage', params: { material: 'id' } },
    { id: 'studio.newPalette', label: 'New palette', intent: 'create a material palette for {project}', permission: 'materials.manage', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const plansSpec = defineSpec({
  code: 'S-05',
  name: 'Plans and design documentation',
  purpose:
    'Sarai drafts the plans and design documentation of each project: the documents of kind plan and spec with their version, who owns them and whether they are still a draft or final.',
  surface: 'studio',
  navGroup: 'documents',
  layout: [
    'PageHeader (Placeholder: upload drawing)',
    'Three StatTiles: plans and specs, still draft, final',
    'FilterBar (search, project, status)',
    'DataTable of documents with row actions (new version, mark final)',
    'Drawer: document detail with a Placeholder to open the stored file',
  ],
  dataTables: ['documents', 'projects'],
  roles: ['studio', 'founder', 'ops'],
  logic: [
    'Only documents of kind plan or spec are shown; other kinds belong to operations (O-08) and the founder (A-04).',
    'New version writes version + 1 and status = draft; Mark final writes status = final (plans.write).',
    'url is null in every seed row, so opening the file is a Placeholder and the detail states that no file is attached.',
  ],
  components: ['PageHeader', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'DataTable', 'StatusPill', 'Drawer', 'KeyValue', 'Placeholder', 'Button'],
  actions: [
    { id: 'studio.newPlanVersion', label: 'New version', intent: 'create a new version of the plan {document}', permission: 'plans.write', params: { document: 'id' } },
    { id: 'studio.finalisePlan', label: 'Mark final', intent: 'mark the plan {document} as final', permission: 'plans.write', params: { document: 'id' } },
    { id: 'studio.openPlan', label: 'Open document', intent: 'open the plan {document}', permission: 'plans.write', params: { document: 'id' } },
    { id: 'studio.uploadDrawing', label: 'Upload drawing', intent: 'upload a drawing file for {project}', permission: 'plans.write', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const schedulesSpec = defineSpec({
  code: 'S-06',
  name: 'Furniture, material and element schedules',
  purpose:
    'Sarai compiles the schedules — the specification lists of furniture, materials, lighting and elements per project — and walks each one from draft to in review to final before it feeds a supplier pack.',
  surface: 'studio',
  navGroup: 'design',
  layout: [
    'PageHeader (Placeholder: new schedule)',
    'Three StatTiles: items specified, final schedules, draft or in review',
    'Tabs by kind (all, furniture, materials, lighting, elements) with counts',
    'DataTable of schedules with row actions (send to review, mark final)',
    'Drawer: schedule detail with a Placeholder for the line-item list',
  ],
  dataTables: ['schedules', 'projects'],
  roles: ['studio', 'founder', 'ops'],
  logic: [
    'Tabs filter by schedules.kind; the counts come from the live table so they follow every write.',
    'Send to review writes status = in-review (only from draft), Mark final writes final (only from in-review) — both need schedules.write.',
    'A schedule stores only itemCount today: the line items themselves have no entity yet, so opening the list is a Placeholder.',
  ],
  components: ['PageHeader', 'StatTile', 'Tabs', 'DataTable', 'StatusPill', 'Drawer', 'KeyValue', 'Placeholder', 'Button'],
  actions: [
    { id: 'studio.reviewSchedule', label: 'Send to review', intent: 'send the schedule {schedule} to review', permission: 'schedules.write', params: { schedule: 'id' } },
    { id: 'studio.finaliseSchedule', label: 'Mark final', intent: 'mark the schedule {schedule} as final', permission: 'schedules.write', params: { schedule: 'id' } },
    { id: 'studio.openSchedule', label: 'Open schedule', intent: 'open the schedule {schedule}', permission: 'schedules.write', params: { schedule: 'id' } },
    { id: 'studio.openScheduleItems', label: 'Open item list', intent: 'open the item list of the schedule {schedule}', permission: 'schedules.write', params: { schedule: 'id' } },
    { id: 'studio.newSchedule', label: 'New schedule', intent: 'create a {kind} schedule for {project}', permission: 'schedules.write', params: { kind: 'enum:furniture|materials|lighting|elements', project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const packsSpec = defineSpec({
  code: 'S-07',
  name: 'Render and supplier packs',
  purpose:
    'Sarai prepares the information for renderings and for suppliers: each pack is briefed, sent, rendered and delivered, and the board shows where every pack stands and how many views it covers.',
  surface: 'studio',
  navGroup: 'design',
  layout: [
    'PageHeader (Placeholder: new pack)',
    'Three StatTiles: in flight, delivered, views briefed',
    'Kanban with the four pack stages (briefing, sent, rendering, delivered); move buttons, no drag',
    'Drawer: pack detail with a Placeholder to attach the pack contents',
  ],
  dataTables: ['renderPacks', 'projects'],
  roles: ['studio', 'founder'],
  logic: [
    'Moving a card writes renderPacks.status to the target column (renders.brief); the Kanban uses explicit move buttons so keyboard, touch, pen and d-pad all work (P-03).',
    'Card subtitle shows the project and the view count; the meta line shows the audience and the due date.',
    'The pack contents (drawings, materials, views) have no entity yet, so attaching them is a Placeholder.',
  ],
  components: ['PageHeader', 'StatTile', 'Kanban', 'Drawer', 'KeyValue', 'StatusPill', 'Badge', 'Placeholder', 'Button'],
  actions: [
    { id: 'studio.movePack', label: 'Move pack', intent: 'move the pack {pack} to {status}', permission: 'renders.brief', params: { pack: 'id', status: 'enum:briefing|sent|rendering|delivered' } },
    { id: 'studio.openPackDetail', label: 'Open pack', intent: 'open the pack {pack}', permission: 'renders.brief', params: { pack: 'id' } },
    { id: 'studio.newPack', label: 'New pack', intent: 'brief a new pack for {project}', permission: 'renders.brief', params: { project: 'id' } },
    { id: 'studio.attachPackContents', label: 'Attach pack contents', intent: 'attach the contents of the pack {pack}', permission: 'renders.brief', params: { pack: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const checksSpec = defineSpec({
  code: 'S-08',
  name: 'Consistency check',
  purpose:
    'The initial consistency check Sarai runs before work reaches Alejandra: tick every item, leave notes, then pass the check (the project moves to the founder’s queue) or report issues (it stays in the studio).',
  surface: 'studio',
  navGroup: 'approvals',
  layout: [
    'PageHeader (Placeholder: new check)',
    'Three StatTiles: pending, with issues, passed',
    'One Card per check: project, checked by, Checkbox list of its items, progress line',
    'Card footer: notes Textarea with save, Mark passed and Report issues buttons',
  ],
  dataTables: ['consistencyChecks', 'projects'],
  roles: ['studio', 'founder'],
  logic: [
    'Ticking an item rewrites the whole consistencyChecks.items array by index (projects.check); the list re-renders from the live table.',
    'Mark passed is disabled until every item is ticked; it writes the check to passed and the project approval to awaiting-founder.',
    'Report issues writes the check to issues and the project approval back to in-check, so the work stays in the studio.',
    'Notes are edited locally and written on save, so a half-typed note never reaches the founder.',
  ],
  components: ['PageHeader', 'StatTile', 'Card', 'Checkbox', 'Textarea', 'StatusPill', 'Button', 'Placeholder', 'EmptyState'],
  actions: [
    { id: 'studio.toggleCheckItem', label: 'Tick check item', intent: 'tick the item {item} of the check {check}', permission: 'projects.check', params: { check: 'id', item: 'number' } },
    { id: 'studio.passCheck', label: 'Mark passed', intent: 'mark the consistency check {check} as passed', permission: 'projects.check', params: { check: 'id' } },
    { id: 'studio.reportCheckIssues', label: 'Report issues', intent: 'report issues on the consistency check {check}', permission: 'projects.check', params: { check: 'id' } },
    { id: 'studio.saveCheckNotes', label: 'Save notes', intent: 'save the notes of the consistency check {check}', permission: 'projects.check', params: { check: 'id', notes: 'string' } },
    { id: 'studio.newCheck', label: 'New check', intent: 'start a consistency check for {project}', permission: 'projects.check', params: { project: 'id' } },
    { id: 'studio.addCheckItem', label: 'Add check item', intent: 'add an item to the consistency check {check}', permission: 'projects.check', params: { check: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const measurementsSpec = defineSpec({
  code: 'S-09',
  name: 'Measurements and requirements',
  purpose:
    'Sarai verifies measurements and requirements on site before documentation. The projects, site visits and waiting schedules are real; the dimension sheet, the requirements checklist and the site photos are not wired yet.',
  surface: 'studio',
  navGroup: 'design',
  layout: [
    'PageHeader (Placeholder: open measurement sheet)',
    'Three StatTiles: projects to verify, open site tasks, schedules waiting',
    'Card: projects and sites (DataTable of name, location, phase, due date)',
    'Card: site visits and measurement tasks, read-only',
    'Three Placeholder Cards: room-by-room dimensions, requirements per space, site photos and annotations',
  ],
  dataTables: ['projects', 'tasks', 'schedules'],
  roles: ['studio', 'founder'],
  logic: [
    'Projects to verify = phase development or documentation; open site tasks = studio-owned tasks that are not done; schedules waiting = schedules still draft or in review.',
    'Nothing on this page writes: measurement capture has no entity yet, so every capture control is a Placeholder and the task list stays read-only (tasks belong to operations).',
  ],
  components: ['PageHeader', 'StatTile', 'Card', 'DataTable', 'StatusPill', 'Placeholder', 'Button'],
  actions: [
    { id: 'studio.openMeasurementSheet', label: 'Open measurement sheet', intent: 'open the measurement sheet of {project}', permission: 'measurements.write', params: { project: 'id' } },
    { id: 'studio.captureDimensions', label: 'Room-by-room dimensions', intent: 'capture the dimensions of {space} in {project}', permission: 'measurements.write', params: { project: 'id', space: 'string' } },
    { id: 'studio.addRequirement', label: 'Requirements per space', intent: 'record a requirement for {space} in {project}', permission: 'measurements.write', params: { project: 'id', space: 'string' } },
    { id: 'studio.attachSitePhoto', label: 'Site photos and annotations', intent: 'attach a site photo to {project}', permission: 'measurements.write', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});
