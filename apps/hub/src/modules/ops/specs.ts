import { defineSpec } from '../../specs/PageSpec';

const WIDTHS = [360, 390, 768, 1280, 1920];

export const homeSpec = defineSpec({
  code: 'O-01',
  name: 'Operations dashboard',
  purpose:
    "Miguel's home: today's commitments, pending tasks, the alerts that must reach the founder before they become urgent, the deliveries of the fortnight and the money due in and out (docs/knowledge/team.md#miguel---administration-and-operations).",
  surface: 'ops',
  navGroup: 'overview',
  layout: [
    'PageHeader (Placeholder: new task)',
    'StatTile row: pending tasks, open alerts, deliveries in 14 days, clients owe us, we owe suppliers',
    'Card: next meetings and commitments (DataTable)',
    'Card: pending tasks (DataTable, opens O-03)',
    'Card: alerts before urgent (DataTable + acknowledge)',
    'Card: deliveries this fortnight (DataTable + confirm date)',
    'Card: money due in and out (DataTable, opens O-07)',
  ],
  dataTables: ['tasks', 'meetings', 'alerts', 'deliveries', 'payments', 'projects', 'suppliers'],
  roles: ['ops', 'founder'],
  logic: [
    'Tiles count live rows: tasks not done, alerts open, deliveries expected within 14 days, unpaid payments summed by direction.',
    'Acknowledging an alert writes alerts.status = acknowledged; confirming a delivery writes confirmedDate = expectedDate and status = confirmed.',
    'Every tile and card opens the page that owns the data (O-02..O-09).',
  ],
  components: ['PageHeader', 'StatTile', 'Card', 'DataTable', 'StatusPill', 'Badge', 'Button', 'Placeholder'],
  actions: [
    { id: 'ops.openSection', label: 'Open section', intent: 'open the {section} section of operations', permission: 'projects.read', params: { section: 'string' } },
    { id: 'ops.acknowledgeAlert', label: 'Acknowledge alert', intent: 'acknowledge the alert {alert}', permission: 'alerts.manage', params: { alert: 'id' } },
    { id: 'ops.confirmDelivery', label: 'Confirm delivery', intent: 'confirm the delivery {delivery} for {date}', permission: 'deliveries.manage', params: { delivery: 'id', date: 'date' } },
    { id: 'ops.newTask', label: 'New task', intent: 'create a task', permission: 'tasks.manage', params: { title: 'string' } },
  ],
  checkedAt: WIDTHS,
});

export const scheduleSpec = defineSpec({
  code: 'O-02',
  name: 'Project schedule',
  purpose: 'The overall project schedule: every task on one timeline with its dependencies, and a month calendar of meetings, expected deliveries and payment due dates.',
  surface: 'ops',
  navGroup: 'schedule',
  layout: ['PageHeader (Placeholder: schedule a meeting)', 'Tabs: Timeline | Calendar', 'Timeline of tasks with dependsOn', 'Calendar of meetings, deliveries and payments', 'Drawer: item detail'],
  dataTables: ['tasks', 'meetings', 'deliveries', 'payments', 'projects', 'suppliers'],
  roles: ['ops', 'founder'],
  logic: [
    'Timeline bars run from tasks.startDate when set, otherwise from the task created_at (or the latest due date among its dependsOn tasks, whichever is later), to its dueDate; tasks without a dueDate are left out.',
    'Calendar events merge meetings (startsAt), deliveries (confirmedDate or expectedDate) and payments (dueDate); the month is page state and starts on the current month.',
    'Selecting a bar or an event opens a Drawer with the row detail.',
  ],
  components: ['PageHeader', 'Tabs', 'Timeline', 'Calendar', 'Drawer', 'KeyValue', 'StatusPill', 'Button', 'Placeholder'],
  actions: [
    { id: 'ops.viewScheduleItem', label: 'Open schedule item', intent: 'show the detail of {item} in the schedule', permission: 'schedule.manage', params: { item: 'id' } },
    { id: 'ops.changeMonth', label: 'Change month', intent: 'show the calendar for {month}', permission: 'schedule.manage', params: { month: 'string' } },
    { id: 'ops.scheduleMeeting', label: 'Schedule a meeting', intent: 'schedule a meeting with {who} on {date}', permission: 'meetings.manage', params: { who: 'string', date: 'date' } },
    { id: 'ops.openWork', label: 'Open in Work', intent: 'open the schedule in the Work timeline', permission: 'schedule.manage' },
  ],
  checkedAt: WIDTHS,
});

export const tasksSpec = defineSpec({
  code: 'O-03',
  name: 'Pending tasks',
  purpose: 'Miguel tracks every pending task of the studio on a board by state; moving a card writes the task status, and the drawer shows what a blocked task is waiting for.',
  surface: 'ops',
  navGroup: 'schedule',
  layout: ['PageHeader (Placeholder: new task)', 'FilterBar (search, project, owner role, only mine)', 'Kanban: to do | doing | blocked | done', 'Drawer: task detail with dependencies'],
  dataTables: ['tasks', 'projects'],
  roles: ['ops', 'founder', 'studio', 'brand'],
  logic: [
    'Moving a card calls data.update("tasks", id, { status }) with the target column id; the board re-renders from the live table.',
    'Filters are page state (search matches the title, project and owner role are selects, "only mine" keeps tasks assigned to the signed-in demo user).',
    'The drawer lists dependsOn tasks by title with their status and offers "mark done".',
  ],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'Checkbox', 'Kanban', 'Drawer', 'KeyValue', 'StatusPill', 'Button', 'Placeholder'],
  actions: [
    { id: 'ops.moveTask', label: 'Move task', intent: 'move the task {task} to {status}', permission: 'tasks.manage', params: { task: 'id', status: 'enum:todo|doing|blocked|done' } },
    { id: 'ops.completeTask', label: 'Mark task done', intent: 'mark the task {task} as done', permission: 'tasks.manage', params: { task: 'id' } },
    { id: 'ops.viewTask', label: 'Open task', intent: 'show the task {task}', permission: 'tasks.manage', params: { task: 'id' } },
    { id: 'ops.newTask', label: 'New task', intent: 'create a task called {title}', permission: 'tasks.manage', params: { title: 'string' } },
    { id: 'ops.openWork', label: 'Open in Work', intent: 'open the tasks in the Work views', permission: 'tasks.manage' },
  ],
  checkedAt: WIDTHS,
});

export const suppliersSpec = defineSpec({
  code: 'O-04',
  name: 'Suppliers and follow-ups',
  purpose: 'Liaising with suppliers: the directory with lead time and rating, and a drawer per supplier with everything open with them right now (quotes, deliveries, money owed) plus the follow-up note.',
  surface: 'ops',
  navGroup: 'suppliers',
  layout: ['PageHeader (Placeholder: add supplier)', 'FilterBar (search, category, status)', 'DataTable of suppliers', 'Drawer: contact, open quotes, pending deliveries, money owed, follow-up note (Placeholder), pause / activate'],
  dataTables: ['suppliers', 'quotes', 'deliveries', 'payments'],
  roles: ['ops', 'founder'],
  logic: [
    'Pausing or activating a supplier writes suppliers.status (active <-> paused) through useData.',
    'The drawer joins the supplier to its quotes (not rejected), its deliveries that are not delivered and the outstanding "out" payments whose counterparty is the supplier name.',
    'The follow-up note has no field in the schema yet, so the save button is a Placeholder (request in the changelog draft).',
  ],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'DataTable', 'Drawer', 'KeyValue', 'Textarea', 'StatusPill', 'Badge', 'Button', 'Placeholder'],
  actions: [
    { id: 'ops.viewSupplier', label: 'Open supplier', intent: 'show the supplier {supplier}', permission: 'suppliers.manage', params: { supplier: 'id' } },
    { id: 'ops.setSupplierStatus', label: 'Pause or activate supplier', intent: 'set the supplier {supplier} to {status}', permission: 'suppliers.manage', params: { supplier: 'id', status: 'enum:active|paused' } },
    { id: 'ops.logFollowUp', label: 'Save follow-up note', intent: 'log a follow-up note on {supplier}', permission: 'suppliers.manage', params: { supplier: 'id', note: 'string' } },
    { id: 'ops.addSupplier', label: 'Add supplier', intent: 'add the supplier {name}', permission: 'suppliers.manage', params: { name: 'string' } },
  ],
  checkedAt: WIDTHS,
});

export const quotesSpec = defineSpec({
  code: 'O-05',
  name: 'Quotes and comparisons',
  purpose: 'Miguel requests supplier quotes and prepares the price comparisons: one card per comparison group with the quotes side by side, the best price and the shortest lead time marked, and one selectable winner.',
  surface: 'ops',
  navGroup: 'suppliers',
  layout: ['PageHeader (Placeholder: request quote)', 'FilterBar (search, project)', 'One Card per comparisonGroup with a DataTable of its quotes and the spread', 'Drawer: quote detail and notes'],
  dataTables: ['quotes', 'suppliers', 'projects'],
  roles: ['ops', 'founder'],
  logic: [
    'Selecting a quote writes status = selected on it and status = rejected on every other quote of the same comparisonGroup.',
    'Shortlisting writes status = shortlisted on that quote only.',
    'Best price and fastest are computed per group from the live rows and shown as Badges; the spread is the difference between the highest and the lowest price.',
  ],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'Card', 'DataTable', 'Drawer', 'KeyValue', 'StatusPill', 'Badge', 'Button', 'Placeholder'],
  actions: [
    { id: 'ops.selectQuote', label: 'Select quote', intent: 'select the quote {quote}', permission: 'quotes.compare', params: { quote: 'id' } },
    { id: 'ops.shortlistQuote', label: 'Shortlist quote', intent: 'shortlist the quote {quote}', permission: 'quotes.compare', params: { quote: 'id' } },
    { id: 'ops.viewQuote', label: 'Open quote', intent: 'show the quote {quote}', permission: 'quotes.compare', params: { quote: 'id' } },
    { id: 'ops.requestQuote', label: 'Request quote', intent: 'request a quote from {supplier} for {item}', permission: 'quotes.request', params: { supplier: 'id', item: 'string' } },
  ],
  checkedAt: WIDTHS,
});

export const deliveriesSpec = defineSpec({
  code: 'O-06',
  name: 'Deliveries and dates',
  purpose: 'Confirming deliveries and dates: what each supplier owes each project, the expected date, the date the supplier actually confirmed, and whether it arrived or slipped.',
  surface: 'ops',
  navGroup: 'suppliers',
  layout: ['PageHeader', 'FilterBar (search, project, status)', 'DataTable of deliveries with row actions', 'Modal: confirm the date the supplier gave'],
  dataTables: ['deliveries', 'suppliers', 'projects'],
  roles: ['ops', 'founder'],
  logic: [
    'Confirm opens a Modal with a date input defaulted to the expected date; saving writes confirmedDate and status = confirmed.',
    'Mark received writes status = delivered; flag as delayed writes status = delayed and clears confirmedDate.',
    'Rows due in the next 14 days and still pending are marked with the days-left hint.',
  ],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'DataTable', 'Modal', 'Input', 'StatusPill', 'Button'],
  actions: [
    { id: 'ops.confirmDelivery', label: 'Confirm delivery', intent: 'confirm the delivery {delivery} for {date}', permission: 'deliveries.manage', params: { delivery: 'id', date: 'date' } },
    { id: 'ops.receiveDelivery', label: 'Mark received', intent: 'mark the delivery {delivery} as received', permission: 'deliveries.manage', params: { delivery: 'id' } },
    { id: 'ops.delayDelivery', label: 'Flag as delayed', intent: 'flag the delivery {delivery} as delayed', permission: 'deliveries.manage', params: { delivery: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const paymentsSpec = defineSpec({
  code: 'O-07',
  name: 'Payments and accounts',
  purpose: 'Who owes what: money the clients owe the studio and money the studio owes suppliers, what is overdue today, and the register of part payments and settlements.',
  surface: 'ops',
  navGroup: 'money',
  layout: ['PageHeader', 'StatTile row: clients owe us, we owe suppliers, overdue, net balance', 'Card: overdue right now', 'FilterBar (search, direction, status)', 'DataTable of payments with row actions', 'Modal: register a part payment'],
  dataTables: ['payments', 'projects'],
  roles: ['ops', 'founder'],
  logic: [
    'Outstanding per row is amountCop - paidCop; the tiles sum it by direction over every row that is not paid.',
    'Mark paid writes paidCop = amountCop, paidDate = today and status = paid.',
    'A part payment adds to paidCop and sets status to partial, or to paid when it covers the balance.',
    'A row whose dueDate is past and is not paid is shown as overdue even when the stored status still says due.',
  ],
  components: ['PageHeader', 'StatTile', 'Card', 'FilterBar', 'SearchField', 'Select', 'DataTable', 'Modal', 'Input', 'StatusPill', 'Button'],
  actions: [
    { id: 'ops.markPaid', label: 'Mark paid', intent: 'mark the payment {payment} as paid', permission: 'payments.manage', params: { payment: 'id' } },
    { id: 'ops.registerPayment', label: 'Register part payment', intent: 'register a part payment of {amount} on {payment}', permission: 'payments.manage', params: { payment: 'id', amount: 'number' } },
    { id: 'ops.viewPayment', label: 'Open payment', intent: 'show the payment {payment}', permission: 'payments.manage', params: { payment: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const documentsSpec = defineSpec({
  code: 'O-08',
  name: 'Administrative documents',
  purpose: 'The administrative paperwork Miguel manages: contracts, invoices, quotes, briefs and reports with their owner, version and state, filterable by kind and project.',
  surface: 'ops',
  navGroup: 'documents',
  layout: ['PageHeader (Placeholder: upload document)', 'FilterBar (search, kind, status)', 'DataTable of documents', 'Drawer: document detail, advance status, open file (Placeholder)'],
  dataTables: ['documents', 'projects'],
  roles: ['ops', 'founder'],
  logic: [
    'Advance status moves the document along draft -> final -> sent -> signed through useData; a signed document has no next state.',
    'Opening the file is a Placeholder: documents carry no stored url in the mock data yet.',
  ],
  components: ['PageHeader', 'FilterBar', 'SearchField', 'Select', 'DataTable', 'Drawer', 'KeyValue', 'StatusPill', 'Badge', 'Button', 'Placeholder'],
  actions: [
    { id: 'ops.setDocumentStatus', label: 'Advance status', intent: 'move the document {document} to {status}', permission: 'documents.manage', params: { document: 'id', status: 'enum:draft|final|sent|signed' } },
    { id: 'ops.viewDocument', label: 'Open document', intent: 'show the document {document}', permission: 'documents.manage', params: { document: 'id' } },
    { id: 'ops.openDocumentFile', label: 'Open file', intent: 'open the file of the document {document}', permission: 'documents.manage', params: { document: 'id' } },
    { id: 'ops.uploadDocument', label: 'Upload document', intent: 'upload a document for {project}', permission: 'documents.manage', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const alertsSpec = defineSpec({
  code: 'O-09',
  name: 'Alerts before urgent',
  purpose: 'Alerting the founder before a situation becomes urgent: dated items with a lead time, grouped by open, acknowledged and resolved, each one pointing at the quote, payment or project behind it.',
  surface: 'ops',
  navGroup: 'alerts',
  layout: ['PageHeader (Placeholder: new alert)', 'Tabs: open | acknowledged | resolved', 'One Card per alert with severity, due date, lead time and the entity it is about', 'Acknowledge / resolve / reopen buttons'],
  dataTables: ['alerts', 'quotes', 'payments', 'projects', 'deliveries'],
  roles: ['ops', 'founder'],
  logic: [
    'Acknowledge writes alerts.status = acknowledged, resolve writes resolved, reopen writes open.',
    'The days-left line compares dueDate with today and says "due today", "in n days" or "n days overdue"; an alert inside its leadDays window is shown with a warning tone.',
    'Alerts for other roles are listed too, marked with the role they belong to, because Miguel is the one who chases them.',
  ],
  components: ['PageHeader', 'Tabs', 'Card', 'KeyValue', 'StatusPill', 'Badge', 'EmptyState', 'Button', 'Placeholder'],
  actions: [
    { id: 'ops.acknowledgeAlert', label: 'Acknowledge alert', intent: 'acknowledge the alert {alert}', permission: 'alerts.manage', params: { alert: 'id' } },
    { id: 'ops.resolveAlert', label: 'Resolve alert', intent: 'resolve the alert {alert}', permission: 'alerts.manage', params: { alert: 'id' } },
    { id: 'ops.reopenAlert', label: 'Reopen alert', intent: 'reopen the alert {alert}', permission: 'alerts.manage', params: { alert: 'id' } },
    { id: 'ops.openAlertSubject', label: 'Open the item', intent: 'open the page of the item behind the alert {alert}', permission: 'projects.read', params: { alert: 'id' } },
    { id: 'ops.newAlert', label: 'New alert', intent: 'create an alert about {subject} for {date}', permission: 'alerts.manage', params: { subject: 'string', date: 'date' } },
  ],
  checkedAt: WIDTHS,
});

export const reportsSpec = defineSpec({
  code: 'O-10',
  name: 'Reports',
  purpose: 'Formatting and laying out reports: the live figures of a month (collected, paid out, still outstanding, deliveries due, tasks done) next to the report documents, ready to be laid out in the Aluzina template.',
  surface: 'ops',
  navGroup: 'reports',
  layout: ['PageHeader (Placeholder: export PDF)', 'Select: period (month)', 'StatTile row of the period figures', 'Card: report documents (DataTable)', 'Placeholder row: format and lay out, export, send to founder'],
  dataTables: ['payments', 'deliveries', 'tasks', 'documents'],
  roles: ['ops', 'founder'],
  logic: [
    'The period select lists the last six months; the figures recompute from the live rows whose paidDate, expectedDate or dueDate falls in that month.',
    'Layout, export and sending are Placeholders: there is no document template engine yet.',
  ],
  components: ['PageHeader', 'Select', 'StatTile', 'Card', 'DataTable', 'StatusPill', 'Button', 'Placeholder'],
  actions: [
    { id: 'ops.setReportPeriod', label: 'Set period', intent: 'show the report figures for {period}', permission: 'reports.write', params: { period: 'string' } },
    { id: 'ops.buildReport', label: 'Format and lay out report', intent: 'lay out the report for {period}', permission: 'reports.write', params: { period: 'string' } },
    { id: 'ops.exportReport', label: 'Export PDF', intent: 'export the report for {period} as a PDF', permission: 'reports.write', params: { period: 'string' } },
    { id: 'ops.sendReport', label: 'Send to founder', intent: 'send the report for {period} to the founder', permission: 'reports.write', params: { period: 'string' } },
  ],
  checkedAt: WIDTHS,
});
