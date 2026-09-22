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
    "The whole commercial-to-delivery flow on one board, on the playbook's 15-status architecture (D-033): leads fill the first four statuses, projects the rest, and the construction gate G-06 / G-12 is enforced on every move.",
  surface: 'founder',
  navGroup: 'projects',
  layout: [
    'PageHeader (A-03) with an "Open leads" action pointing at A-08',
    'FilterBar: search (name, client), type filter, approval filter',
    'Tabs: Board / List',
    'Board: five collapsible bands (lead, sale, design, build, closed), each a Kanban over that group\'s statuses; a card is a lead or a project with its value, a StatusPill, prev / next buttons and a "Move to…" Select over all 15 statuses',
    'List: DataTable of the same entries (name, kind, client, service, value, owner, status), sorted by the status order',
    'Drawer on activation: the entry, its move controls, the project record (client, type, service, creative direction, approval, lead designer, budget, due, location, summary) and the legacy seven-phase Select, or the read-only lead summary',
  ],
  dataTables: ['projects', 'leads'],
  roles: ['founder'],
  logic: [
    'Cards are `leads` rows whose projectId is still null (lead-new..contracted) plus every `projects` row placed by its pipelineStatus, so one inquiry is one card from the first message to closure.',
    'Moving writes leads.status or projects.pipelineStatus by id, never drag (P-03): prev / next buttons walk the 15-status order and the "Move to…" Select jumps anywhere allowed.',
    'G-06 / G-12: procurement and in-construction are disabled for a project whose approval is not approved or client-approved; the option carries the reason and the button its title, and the write is refused with a toast.',
    'A lead may only hold the first four statuses (LEAD_STATUS_IDS); it leaves the lead range by being converted into a project on A-08.',
    'The legacy `projects.phase` vocabulary still drives the Work views (D-033), so the drawer keeps a phase Select writing it; `founder.moveProject` still moves the phase.',
    'Bands collapse and expand from their header button; the closed band starts collapsed.',
    'Type and approval filters only match projects (a lead has neither), so setting one hides the lead cards.',
  ],
  components: ['PageHeader', 'Button', 'FilterBar', 'SearchField', 'Select', 'Tabs', 'Kanban', 'DataTable', 'Drawer', 'KeyValue', 'StatusPill', 'Badge'],
  actions: [
    { id: 'founder.movePipelineStatus', label: 'Move to a pipeline status', intent: 'move {project} to the status {status}', permission: 'projects.write', params: { project: 'id', status: 'enum:lead-new|lead-qualified|proposal-sent|contracted|briefing|concept|design-development|client-review|approved|procurement|in-construction|punch-list|delivered|closed|follow-up' } },
    { id: 'founder.moveProject', label: 'Move project to a phase', intent: 'move the project {project} to the phase {phase}', permission: 'projects.write', params: { project: 'id', phase: 'enum:lead|concept|development|documentation|procurement|execution|delivered' } },
    { id: 'founder.openProject', label: 'Open project', intent: 'open the project {project}', permission: 'projects.read', params: { project: 'id' } },
    { id: 'founder.setCreativeDirection', label: 'Set the creative direction', intent: 'mark the creative direction of {project} as set', permission: 'projects.write', params: { project: 'id' } },
    { id: 'founder.toggleGroup', label: 'Collapse or expand a band', intent: 'collapse or expand the {group} band of the board', permission: 'projects.read', params: { group: 'enum:lead|sale|design|build|close' } },
    { id: 'founder.openLeads', label: 'Open leads', intent: 'open the leads page', permission: 'leads.read' },
  ],
  checkedAt: WIDTHS,
});

export const leadsSpec = defineSpec({
  code: 'A-08',
  name: 'Leads',
  purpose:
    'The single traceable pipeline entry of the playbook (p. 3): every inquiry is registered here with its lead record and commercial data, qualified with the ten questions, routed to a service and, once contracted, converted into a project and its engagement.',
  surface: 'founder',
  navGroup: 'sales',
  layout: [
    'PageHeader (A-08) with a "New lead" primary action',
    'Five StatTiles: new, qualified, proposal sent, contracted, and the lead -> contract conversion rate',
    'FilterBar: search (name, city, email, notes), status, channel and service Selects',
    'DataTable of leads: name, city, project type, requested vs suggested service, channel, budget, desired start, owner, status pill, source',
    'Modal "New lead": the lead record fields and the commercial fields, plus notes',
    'Drawer on row activation: the full record, service routing (Suggest service + requested-service Select), owner Select, status Select with prev / next, the ten qualification questions, notes, and Convert to project',
  ],
  dataTables: ['leads', 'projects', 'engagements'],
  roles: ['founder', 'ops'],
  logic: [
    'A new lead is created with status lead-new and source manual; the public intake form (P-01) writes source public-intake.',
    'Suggest service runs routeService() over the qualification answers, writes leads.suggestedService and shows the reason; it never writes requestedService, because the founder decides the service (G-10).',
    'Status is limited to the first four statuses of the architecture (LEAD_STATUS_IDS); the prev / next buttons walk the same list.',
    'Convert to project is offered only at contracted with no project yet: it creates a `projects` row (phase lead, pipelineStatus contracted, the chosen service, the studio lead designer, the lead budget and city), an `engagements` row on the service first phase with empty checks, and writes leads.projectId; a toast names the project and the drawer then links to its Work page.',
    'Every write carries `basedOn` the row the founder was looking at (D-024), so a concurrent edit is reported instead of lost.',
    'Qualification answers and notes are edited as a draft and saved together; `founder.qualifyLead` also writes one answer directly when it is given a question and an answer (voice, WebMCP).',
  ],
  components: ['PageHeader', 'Button', 'StatTile', 'FilterBar', 'SearchField', 'Select', 'Input', 'Textarea', 'DataTable', 'Modal', 'Drawer', 'KeyValue', 'StatusPill', 'Badge'],
  actions: [
    { id: 'founder.newLead', label: 'New lead', intent: 'register a new lead called {name}', permission: 'leads.manage', params: { name: 'string', city: 'string', email: 'string', channel: 'enum:instagram|whatsapp|website|referral|email|networking|partnership', projectType: 'string' } },
    { id: 'founder.openLead', label: 'Open lead', intent: 'open the lead {lead}', permission: 'leads.read', params: { lead: 'id' } },
    { id: 'founder.qualifyLead', label: 'Record the qualification', intent: 'answer {question} with {answer} on the lead {lead}', permission: 'leads.manage', params: { lead: 'id', question: 'string', answer: 'string' } },
    { id: 'founder.suggestService', label: 'Suggest a service', intent: 'suggest the right service for the lead {lead}', permission: 'leads.manage', params: { lead: 'id' } },
    { id: 'founder.setLeadService', label: 'Set the requested service', intent: 'set the service of the lead {lead} to {service}', permission: 'leads.manage', params: { lead: 'id', service: 'enum:01|02|03|E|04' } },
    { id: 'founder.assignLeadOwner', label: 'Assign the owner', intent: 'assign the lead {lead} to {owner}', permission: 'leads.manage', params: { lead: 'id', owner: 'id' } },
    { id: 'founder.advanceLead', label: 'Advance the lead', intent: 'move the lead {lead} to {status}', permission: 'leads.manage', params: { lead: 'id', status: 'enum:lead-new|lead-qualified|proposal-sent|contracted' } },
    { id: 'founder.convertLead', label: 'Convert to project', intent: 'convert the lead {lead} into a project', permission: 'leads.manage', params: { lead: 'id' } },
    { id: 'founder.filterLeads', label: 'Filter leads', intent: 'show the leads with status {status}, channel {channel} and service {service}', permission: 'leads.read', params: { status: 'string', channel: 'string', service: 'string' } },
    { id: 'founder.searchLeads', label: 'Search leads', intent: 'search the leads for {query}', permission: 'leads.read', params: { query: 'string' } },
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

export const archiveReviewSpec = defineSpec({
  code: 'A-09',
  name: 'Archive review',
  purpose:
    'The facts the archive intake inferred (type, status, client, year, duplicates; D-060 and changelog 0019 section H) are confirmed or corrected by the founder here, in the product, one row at a time or in bulk, instead of being answered in a chat.',
  surface: 'founder',
  navGroup: 'projects',
  layout: [
    'PageHeader (A-09) with a "Open questions" toggle',
    'Four StatTiles: archived projects, confirmed, pending, flagged (a duplicate or an intake note)',
    'Collapsible Card "Open questions": the eleven items of changelog 0019 section H as bilingual text, each with a button that filters the table to the rows it is about',
    'FilterBar: search, year (incl. "no year"), type, status, "pending only" (on by default), "duplicates only"',
    'Bulk row: select all shown + "Confirm selected"',
    'DataTable of archived projects: checkbox, project (cover thumb, name, year, file count), inferred type (inline Select), status (inline Select + lifecycle Badge), client (inline Select of clients / unknown / new client…), year (number Input), the intake note (read only), the Dropbox folder link, and the actions Confirm and "Mark as duplicate of…"',
    'Drawer "New client": name, kind (past / current / prospect), sector',
  ],
  dataTables: ['projects', 'clients', 'relations'],
  roles: ['founder'],
  logic: [
    'The table is the `projects` rows tagged `archive`; "pending only" (default) hides the rows already tagged `confirmado`.',
    'Confirm adds the tag `confirmado` and removes the sentence "Tipo y estado inferidos de la carpeta; confirmar con la fundadora." from the summary, keeping the folder line and every note: confirmation is a tag plus a summary edit, no schema change.',
    'The note column is every sentence of the summary except the folder line and that inferred sentence, so it survives the confirmation edit.',
    '"Mark as duplicate of…" adds the tag `duplicado`, appends "Duplicado de <name> (<id>)" to the summary and records a `replaces` relation from the project that is kept to the duplicate (D-026).',
    'Choosing "new client…" opens the Drawer: it creates a `clients` row, writes `projects.client` and records a `for-client` relation; picking an existing client writes the name and links the same relation once.',
    'Every write goes through `data.update(\'projects\', id, patch, { basedOn: row.updated_at })` (D-024); the bulk confirmation re-reads each stored row before writing it.',
    'The eleven open questions are a constant in the page, not a read of the changelog file: the numbered changelog is history, this list shrinks as the founder answers.',
  ],
  components: ['PageHeader', 'Button', 'StatTile', 'Card', 'FilterBar', 'SearchField', 'Select', 'Input', 'Checkbox', 'Badge', 'Thumb', 'DataTable', 'Drawer'],
  actions: [
    { id: 'founder.confirmProject', label: 'Confirm the inferred facts', intent: 'confirm the inferred facts of the project {project}', permission: 'projects.write', params: { project: 'id' } },
    { id: 'founder.setProjectType', label: 'Set the project type', intent: 'set the type of {project} to {type}', permission: 'projects.write', params: { project: 'id', type: 'enum:residential|commercial|hospitality|wellness|lighting-product' } },
    { id: 'founder.setProjectStatus', label: 'Set the project status', intent: 'set the status of {project} to {status}', permission: 'projects.write', params: { project: 'id', status: 'enum:lead-new|lead-qualified|proposal-sent|contracted|briefing|concept|design-development|client-review|approved|procurement|in-construction|punch-list|delivered|closed|follow-up' } },
    { id: 'founder.setProjectClient', label: 'Set the client', intent: 'set the client of {project} to {client}', permission: 'projects.write', params: { project: 'id', client: 'string' } },
    { id: 'founder.setProjectYear', label: 'Set the year', intent: 'set the year of {project} to {year}', permission: 'projects.write', params: { project: 'id', year: 'number' } },
    { id: 'founder.markDuplicate', label: 'Mark as a duplicate', intent: 'mark {project} as a duplicate of {of}', permission: 'projects.write', params: { project: 'id', of: 'id' } },
    { id: 'founder.createClient', label: 'Create a client', intent: 'create the client {name} of kind {kind}', permission: 'clients.write', params: { name: 'string', kind: 'enum:past|current|prospect' } },
    { id: 'founder.confirmSelected', label: 'Confirm the selected projects', intent: 'confirm the projects I selected', permission: 'projects.write' },
  ],
  checkedAt: WIDTHS,
});

export const founderSpecs = [homeSpec, approvalsSpec, pipelineSpec, leadsSpec, proposalsSpec, productsSpec, clientsSpec, teamSpec, archiveReviewSpec];
