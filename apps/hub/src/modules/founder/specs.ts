import { defineSpec } from '../../specs/PageSpec';

/** Widths verified with Playwright at 360 / 390 / 768 / 1280 / 1920 (P-01). */
const WIDTHS = [360, 390, 768, 1280, 1920];

export const homeSpec = defineSpec({
  code: 'A-01',
  name: 'Founder dashboard',
  purpose:
    "Alejandra Guerra's home: what waits for her approval, the pipeline by phase, the week's meetings, the alerts operations raised for her and a read-only money snapshot (docs/knowledge/team.md#alejandra-guerra---founder).",
  surface: 'founder',
  navGroup: 'overview',
  layout: [
    'PageHeader (A-01) with a "Review approvals" primary action',
    'Four StatTiles: waiting for you, projects in the pipeline, open alerts, money owed to the studio',
    'Card "Waiting for you": ApprovalQueue with the first three projects awaiting the founder',
    'Card "Pipeline by phase": one activation button per phase with its project count, opens A-03',
    'Card "This week": meetings starting in the next seven days',
    'Card "Alerts from operations": open alerts, most urgent first, read only',
    'Card "Money" (read only): owed to the studio, owed to suppliers, overdue count',
  ],
  dataTables: ['projects', 'consistencyChecks', 'alerts', 'meetings', 'payments', 'tasks'],
  roles: ['founder'],
  logic: [
    'The approvals card shares the queue logic of A-02: approve writes projects.approval = approved and resolves the founder alerts pointing at that project; request changes writes changes-requested and files a high-priority task for the lead designer; a comment files a normal task with the note.',
    'Stat tiles and cards are derived from live useTable reads, so a decision taken on A-02 updates the dashboard without a reload.',
    'Money is read only here: Miguel owns payments (O-07).',
  ],
  components: ['PageHeader', 'Button', 'StatTile', 'Card', 'ApprovalQueue', 'StatusPill', 'Badge', 'EmptyState', 'KeyValue', 'Skeleton'],
  actions: [
    { id: 'founder.openApprovals', label: 'Review approvals', intent: 'open what is waiting for my approval', permission: 'projects.approve' },
    { id: 'founder.approveProject', label: 'Approve project', intent: 'approve the project {project}', permission: 'projects.approve', params: { project: 'id' } },
    { id: 'founder.requestChanges', label: 'Request changes', intent: 'request changes on the project {project}', permission: 'projects.approve', params: { project: 'id' } },
    { id: 'founder.commentApproval', label: 'Comment on an approval', intent: 'leave the note {note} on the project {project}', permission: 'projects.approve', params: { project: 'id', note: 'string' } },
    { id: 'founder.openPhase', label: 'Open a pipeline phase', intent: 'show the projects in the phase {phase}', permission: 'projects.read', params: { phase: 'enum:lead|concept|development|documentation|procurement|execution|delivered' } },
  ],
  checkedAt: WIDTHS,
});

export const approvalsSpec = defineSpec({
  code: 'A-02',
  name: 'Approvals',
  purpose:
    'Final project approval: every project the studio has checked and handed over waits here with its consistency check, so the founder approves it or sends it back with a note (roles-and-portals.md, approval chain).',
  surface: 'founder',
  navGroup: 'approvals',
  layout: [
    'PageHeader (A-02)',
    'Card "Waiting for you": ApprovalQueue, one item per project in-check or awaiting-founder, with the consistency check result as meta',
    'Card "Consistency checks": DataTable of the studio checks with their passed / failed item counts, row opens a Drawer',
    'Card "Already decided": DataTable of approved, client-approved and changes-requested projects',
    'Drawer: the check item list (label + ok), notes and who checked it',
  ],
  dataTables: ['projects', 'consistencyChecks', 'tasks', 'alerts'],
  roles: ['founder', 'studio'],
  logic: [
    'Queue = projects with approval in-check or awaiting-founder, awaiting-founder first, then by dueDate.',
    'Approve: projects.approval = approved, and every open or acknowledged alert whose entity is that project becomes resolved.',
    'Request changes: projects.approval = changes-requested and a high-priority task is created for the project lead designer.',
    'Comment: a normal-priority task carrying the note is created for the lead designer (there is no comments entity yet).',
    'The check drawer is read only: Sarai owns consistencyChecks (S-08).',
  ],
  components: ['PageHeader', 'Card', 'ApprovalQueue', 'DataTable', 'StatusPill', 'Badge', 'Drawer', 'KeyValue', 'Button', 'EmptyState'],
  actions: [
    { id: 'founder.approveProject', label: 'Approve project', intent: 'approve the project {project}', permission: 'projects.approve', params: { project: 'id' } },
    { id: 'founder.requestChanges', label: 'Request changes', intent: 'request changes on the project {project}', permission: 'projects.approve', params: { project: 'id' } },
    { id: 'founder.commentApproval', label: 'Comment on an approval', intent: 'leave the note {note} on the project {project}', permission: 'projects.approve', params: { project: 'id', note: 'string' } },
    { id: 'founder.openCheck', label: 'Open consistency check', intent: 'show the consistency check {check}', permission: 'projects.read', params: { check: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const pipelineSpec = defineSpec({
  code: 'A-03',
  name: 'Pipeline',
  purpose:
    'Every project as a card in its phase, from lead to delivered: the founder moves a project forward, sets the creative direction and opens the detail of each one (sales and growth view).',
  surface: 'founder',
  navGroup: 'projects',
  layout: [
    'PageHeader (A-03) with a "New lead" placeholder action',
    'FilterBar: search, type filter, approval filter',
    'Kanban with one column per phase (lead … delivered); each card shows the client, the budget and the approval status',
    'Drawer: project detail (client, type, phase, creative direction, approval, lead designer, budget, dates, location, summary) with the creative-direction action',
  ],
  dataTables: ['projects', 'tasks', 'meetings'],
  roles: ['founder'],
  logic: [
    'The Kanban move buttons (never drag: P-03) write projects.phase, so the board is the pipeline itself.',
    'The filters are combined with AND and are cleared from the FilterBar.',
    'Set creative direction writes projects.creativeDirection = set; it is the only project field the founder edits from the drawer.',
    'Moving a project is guarded by projects.write; without it the board is read only.',
  ],
  components: ['PageHeader', 'Button', 'Placeholder', 'FilterBar', 'SearchField', 'Select', 'Kanban', 'Drawer', 'KeyValue', 'StatusPill', 'Badge'],
  actions: [
    { id: 'founder.moveProject', label: 'Move project to a phase', intent: 'move the project {project} to the phase {phase}', permission: 'projects.write', params: { project: 'id', phase: 'enum:lead|concept|development|documentation|procurement|execution|delivered' } },
    { id: 'founder.openProject', label: 'Open project', intent: 'open the project {project}', permission: 'projects.read', params: { project: 'id' } },
    { id: 'founder.setCreativeDirection', label: 'Set the creative direction', intent: 'mark the creative direction of {project} as set', permission: 'projects.write', params: { project: 'id' } },
    { id: 'founder.newLead', label: 'New lead', intent: 'add a new lead called {name}', permission: 'sales.write', params: { name: 'string' } },
  ],
  checkedAt: WIDTHS,
});

export const proposalsSpec = defineSpec({
  code: 'A-04',
  name: 'Quotes and proposals',
  purpose:
    'The founder writes the client quotes, the graphic proposals and the project PDFs, and reviews the supplier quotes Miguel collected before a major negotiation (team.md: "Quotes and graphic proposals", "Project PDFs").',
  surface: 'founder',
  navGroup: 'sales',
  layout: [
    'PageHeader (A-04) with a "New client quote" placeholder action',
    'Tabs: client documents / graphic proposals / supplier quotes, each with its count',
    'Client documents: DataTable of documents of kind quote, project-pdf and brief with row actions mark final and send',
    'Graphic proposals: DataTable of presentations with a sign-off action on the ones in review',
    'Supplier quotes: DataTable of the quotes Miguel received, grouped by comparison group, with a shortlist action',
  ],
  dataTables: ['documents', 'presentations', 'quotes', 'projects'],
  roles: ['founder', 'brand', 'ops'],
  logic: [
    'Mark final writes documents.status draft -> final; send writes final -> sent. Both are guarded by proposals.write.',
    'Signing off a presentation writes presentations.status review -> final (proposals.write).',
    'Shortlisting a supplier quote writes quotes.status -> shortlisted (quotes.review); selecting the winner stays with Miguel in O-05.',
    'The supplier-quote table shows the comparison group and the item: supplier names are not in the founder read set yet (request filed).',
  ],
  components: ['PageHeader', 'Button', 'Placeholder', 'Tabs', 'DataTable', 'StatusPill', 'Badge', 'Card', 'EmptyState'],
  actions: [
    { id: 'founder.finaliseDocument', label: 'Mark document final', intent: 'mark the document {document} as final', permission: 'proposals.write', params: { document: 'id' } },
    { id: 'founder.sendDocument', label: 'Send document to the client', intent: 'send the document {document} to the client', permission: 'proposals.write', params: { document: 'id' } },
    { id: 'founder.signOffPresentation', label: 'Sign off presentation', intent: 'sign off the presentation {presentation}', permission: 'proposals.write', params: { presentation: 'id' } },
    { id: 'founder.shortlistQuote', label: 'Shortlist supplier quote', intent: 'shortlist the supplier quote {quote}', permission: 'quotes.review', params: { quote: 'id' } },
    { id: 'founder.newClientQuote', label: 'New client quote', intent: 'write a new client quote for {project}', permission: 'proposals.write', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const productsSpec = defineSpec({
  code: 'A-05',
  name: 'Products and partnerships',
  purpose:
    'Lighting fixture and product development plus partnerships: the Honey Valley collection with its materials, render packs and open tasks, and the strategic meetings where a partnership is negotiated.',
  surface: 'founder',
  navGroup: 'projects',
  layout: [
    'PageHeader (A-05) with a "New partnership" placeholder action',
    'One Card per product project (type lighting-product): phase, creative direction, budget, summary',
    'Inside the card: materials of the collection with an approve action, render packs and the open tasks',
    'Card "Strategic meetings": the partnership and negotiation meetings with their date and attendees',
    'Card "Collection roadmap": placeholder until a product entity exists',
  ],
  dataTables: ['projects', 'materials', 'renderPacks', 'tasks', 'meetings'],
  roles: ['founder', 'studio'],
  logic: [
    'Product projects are the projects of type lighting-product; nothing is hard-coded to Honey Valley.',
    'Approving a material writes materials.status = approved for the collection the founder owns (products.write).',
    'Render packs and tasks are read only here: the studio owns them (S-07) and operations the schedule (O-03).',
    'Strategic meetings are meetings of kind strategic, soonest first.',
  ],
  components: ['PageHeader', 'Button', 'Placeholder', 'Card', 'DataTable', 'StatusPill', 'Badge', 'KeyValue', 'EmptyState'],
  actions: [
    { id: 'founder.approveMaterial', label: 'Approve material', intent: 'approve the material {material} for the collection', permission: 'products.write', params: { material: 'id' } },
    { id: 'founder.newPartnership', label: 'New partnership', intent: 'record a new partnership with {partner}', permission: 'partnerships.write', params: { partner: 'string' } },
  ],
  checkedAt: WIDTHS,
});

export const clientsSpec = defineSpec({
  code: 'A-06',
  name: 'Clients and negotiations',
  purpose:
    'Client relations, sales and major negotiations in one table: every client with their projects, the budget in play, what they still owe and their next meeting, so the founder prepares a conversation in one look.',
  surface: 'founder',
  navGroup: 'sales',
  layout: [
    'PageHeader (A-06) with a "New lead" placeholder action',
    'Three StatTiles: clients, budget in play, owed to the studio',
    'FilterBar: search by client or project',
    'DataTable of clients (projects, budget, outstanding, next meeting), row opens a Drawer',
    'Drawer: the client projects with their phase and approval, their payments and their meetings, plus a placeholder note field',
  ],
  dataTables: ['projects', 'payments', 'meetings', 'documents'],
  roles: ['founder'],
  logic: [
    'Clients are derived from projects.client (there is no clients entity yet): one row per distinct client name.',
    'Outstanding = sum of amountCop - paidCop over the payments of direction in that are not paid.',
    'Next meeting = the earliest future meeting of any project of that client.',
    'Everything is read only: writing a client note and adding a lead are placeholders until a clients entity exists.',
  ],
  components: ['PageHeader', 'Button', 'Placeholder', 'StatTile', 'FilterBar', 'SearchField', 'DataTable', 'Drawer', 'KeyValue', 'StatusPill', 'EmptyState'],
  actions: [
    { id: 'founder.openClient', label: 'Open client', intent: 'open the client {client}', permission: 'projects.read', params: { client: 'string' } },
    { id: 'founder.logClientNote', label: 'Log a client note', intent: 'log the note {note} for the client {client}', permission: 'clients.write', params: { client: 'string', note: 'string' } },
    { id: 'founder.newLead', label: 'New lead', intent: 'add a new lead called {name}', permission: 'sales.write', params: { name: 'string' } },
  ],
  checkedAt: WIDTHS,
});

export const teamSpec = defineSpec({
  code: 'A-07',
  name: 'Team overview',
  purpose:
    'What each of the four roles is carrying: their open tasks, the alerts raised for them and the shared meetings, plus the founder\'s own list, so nothing waits on her without her seeing it.',
  surface: 'founder',
  navGroup: 'reports',
  layout: [
    'PageHeader (A-07)',
    'One StatTile per role with their open task count',
    'Tabs per role (founder, ops, studio, brand) over a DataTable of that role\'s tasks; the founder tab can mark her own tasks done',
    'Card "Alerts": every open alert with its role and due date, read only',
    'Card "Shared meetings": the next internal and strategic meetings',
    'Card "Vision and growth": placeholder until goals exist as data',
  ],
  dataTables: ['tasks', 'alerts', 'meetings', 'projects'],
  roles: ['founder'],
  logic: [
    'Tasks are grouped by ownerRole; done tasks are hidden unless the "show done" checkbox is on.',
    'Only tasks whose ownerRole is founder can be marked done here (projects.write); the other roles own their own boards.',
    'Alerts are read only: alerts.manage belongs to Miguel (O-09).',
  ],
  components: ['PageHeader', 'StatTile', 'Tabs', 'DataTable', 'Checkbox', 'Card', 'StatusPill', 'Badge', 'Placeholder', 'EmptyState'],
  actions: [
    { id: 'founder.completeTask', label: 'Mark my task done', intent: 'mark my task {task} as done', permission: 'projects.write', params: { task: 'id' } },
    { id: 'founder.showDoneTasks', label: 'Show done tasks', intent: 'show the tasks that are already done', permission: 'projects.read', params: { on: 'boolean' } },
    { id: 'founder.openGoals', label: 'Open vision and growth', intent: 'open the vision and growth goals', permission: 'projects.read' },
  ],
  checkedAt: WIDTHS,
});

export const founderSpecs = [homeSpec, approvalsSpec, pipelineSpec, proposalsSpec, productsSpec, clientsSpec, teamSpec];
