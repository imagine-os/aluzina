import { defineSpec } from '../../specs/PageSpec';

/** Widths verified with Playwright against the dev server, light and dark (P-01). */
const WIDTHS = [360, 390, 768, 1280, 1920];

export const homeSpec = defineSpec({
  code: 'C-01',
  name: 'Client home',
  purpose:
    'The client app opens on what matters to the person who hired ALUZINA: how their project stands today, what is waiting for their decision, and where they are in the ten-step client journey of the playbook.',
  surface: 'client',
  navGroup: 'overview',
  layout: [
    'PageHeader (C-01) with a greeting carrying the client name',
    'One Card per project: name, service, pipeline StatusPill, current phase, progress bar with ticked / total checklist items, next step',
    'Three StatTiles "Waiting for you": revision comments to decide, unread messages, pending payments with the outstanding amount',
    'Card "Your journey": the ten CLIENT_JOURNEY steps with the current one highlighted (project Select when the client has more than one project)',
    'Note "Not your project?" explaining the data scope',
  ],
  dataTables: ['projects', 'engagements', 'revisionItems', 'messages', 'payments'],
  roles: ['client'],
  logic: [
    'Data scope: only projects whose clientUserId is the signed-in user (useMyProjects); every other list filters on those project ids.',
    'Progress = ticked engagements.checks over phaseItems() of every phase of the service, so it follows the playbook checklist, not a guessed percentage.',
    'Next step = the first unticked item of the current phase, else the title of the next phase, else "everything done".',
    'Comments to decide = revisionItems of my projects with decidedAt null; unread = messages not written by me whose readBy lacks my id; pending payments = payments with direction in and status not paid.',
    'The journey step comes from projects.pipelineStatus mapped onto CLIENT_JOURNEY (several pipeline statuses share one client-facing step).',
  ],
  components: ['PageHeader', 'Card', 'StatTile', 'StatusPill', 'Badge', 'Button', 'Select', 'EmptyState', 'Skeleton'],
  actions: [
    { id: 'client.openProject', label: 'Open project', intent: 'open my project {project}', permission: 'own.projects.read', params: { project: 'id' } },
    { id: 'client.openApprovals', label: 'Open approvals', intent: 'show the comments waiting for my decision', permission: 'own.projects.read' },
    { id: 'client.openMessages', label: 'Open messages', intent: 'open my conversation with the studio', permission: 'own.projects.read' },
    { id: 'client.selectProject', label: 'Select project', intent: 'focus on my project {project}', permission: 'own.projects.read', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const projectSpec = defineSpec({
  code: 'C-02',
  name: 'Project detail',
  purpose:
    'Everything the client may see about one project: the service they bought, the phases of the playbook with the studio ticks as read-only progress, the documents finalised for them, the dates, who is leading the design, and the way into the revision matrix when the scheme is with them.',
  surface: 'client',
  layout: [
    'PageHeader (C-02) with a breadcrumb back to C-01 and the pipeline StatusPill',
    'Card with the service name, its outcome and the progress bar',
    'Banner Card (only while pipelineStatus is client-review) linking to C-03',
    'Card "What we do, step by step": one disclosure per phase, the current phase open, items as read-only ticks from engagements.checks',
    'Card "Documents for you": final, sent and signed documents of the project',
    'Card "Dates" and Card "Your studio team" (lead designer)',
    'Button "Message the studio" linking to C-04',
  ],
  dataTables: ['projects', 'engagements', 'documents'],
  roles: ['client'],
  logic: [
    'A project id that is not linked to this client renders an EmptyState, never another client\'s data.',
    'The phase list is read only: the client never writes engagements.checks (only the studio does, G-03).',
    'Documents are filtered to status final, sent or signed so a draft the studio is still writing never reaches the client (there is no documents.clientVisible field yet: requested).',
    'The client-review banner is derived from projects.pipelineStatus, so it disappears the moment the studio moves the project on.',
  ],
  components: ['PageHeader', 'Card', 'StatusPill', 'Badge', 'Button', 'KeyValue', 'Avatar', 'EmptyState', 'Skeleton'],
  actions: [
    { id: 'client.openApprovals', label: 'Open approvals', intent: 'open the revision matrix of this project', permission: 'own.projects.read' },
    { id: 'client.openMessages', label: 'Message the studio', intent: 'write to the studio about this project', permission: 'own.projects.read' },
  ],
  checkedAt: WIDTHS,
});

export const approvalsSpec = defineSpec({
  code: 'C-03',
  name: 'Approvals and revision matrix',
  purpose:
    'The client side of the single revision matrix (playbook service 03 stage 10, rule G-05): every comment on the design in one list grouped by stage, the client adds their own, decides the ones waiting for them, and approves the proposal for execution once nothing is left in revision.',
  surface: 'client',
  navGroup: 'approvals',
  layout: [
    'PageHeader (C-03)',
    'Card with the rule "All comments are collected here, not in WhatsApp" and the count waiting for a decision',
    'Per project: Card "Approve the proposal for execution" with the gate button and its explanation',
    'Per project: one Card per stage, each with its revision items (what it is about, the comment, who wrote it, status pill, decision date)',
    'Decision form inside every item still open: Select of approved / approved with adjustments / revision and a confirm button',
    'Card "Add a comment": stage Select from the service phases, what it is about, the comment, submit',
  ],
  dataTables: ['projects', 'engagements', 'revisionItems'],
  roles: ['client'],
  logic: [
    'Items are read from revisionItems filtered to the client\'s own project ids and grouped by stage, newest group last.',
    'Adding a comment creates a revisionItems row with source client, status revision, decidedAt null and the signed-in user as author; it is never free text on the project (G-05).',
    'Deciding writes status and decidedAt (today) on the row, based on the row the client was looking at (basedOn, D-024).',
    'The approval gate (G-06) writes projects.approval = client-approved and is enabled only when no revision item of that project is still in revision; otherwise it is disabled and says how many are left. It is real logic, not a Placeholder.',
    'Both writes need own.revisions.write / own.proposals.approve; without the permission the forms are not rendered and the actions are not registered.',
  ],
  components: ['PageHeader', 'Card', 'Select', 'Input', 'Textarea', 'Button', 'StatusPill', 'Badge', 'EmptyState', 'Skeleton'],
  actions: [
    { id: 'client.addRevisionComment', label: 'Add a comment', intent: 'add the comment {comment} about {item} at the stage {stage} of {project}', permission: 'own.revisions.write', params: { project: 'id', stage: 'string', item: 'string', comment: 'string' } },
    { id: 'client.decideRevision', label: 'Decide a revision item', intent: 'mark the revision item {item} as {status}', permission: 'own.revisions.write', params: { item: 'id', status: 'enum:approved|approved-with-adjustments|revision' } },
    { id: 'client.approveForExecution', label: 'Approve for execution', intent: 'approve the proposal of {project} for execution', permission: 'own.proposals.approve', params: { project: 'id' } },
    { id: 'client.selectProject', label: 'Select project', intent: 'use the project {project} in the comment form', permission: 'own.projects.read', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const messagesSpec = defineSpec({
  code: 'C-04',
  name: 'Messages',
  purpose:
    'The official conversation with the studio, one thread per project: the client reads what the studio wrote, writes back, and everything stays on the project instead of scattering through WhatsApp (playbook service 03 stage 01).',
  surface: 'client',
  navGroup: 'communication',
  layout: [
    'PageHeader (C-04)',
    'Tabs, one per project, when the client has more than one',
    'Thread: message bubbles, the client\'s own on the right, the studio\'s on the left, each with author name and date',
    'Composer: Textarea and a send button',
    'Button "Mark as read" for the shown thread',
  ],
  dataTables: ['projects', 'messages'],
  roles: ['client'],
  logic: [
    'Messages are filtered to the client\'s project ids and sorted by their at timestamp.',
    'Sending creates a messages row with authorId = me, at = now and readBy = [me]; the list re-renders from the provider subscribe event, so a second tab (or the studio) sees it without a reload (D-023, P-14).',
    'Opening a thread adds my id to readBy of every message I have not read, one update per row by id; a ref keeps it from running twice for the same row.',
    'The composer needs messages.write; without it the thread is read only and the send action is not registered.',
  ],
  components: ['PageHeader', 'Card', 'Tabs', 'Textarea', 'Button', 'Avatar', 'Badge', 'EmptyState', 'Skeleton'],
  actions: [
    { id: 'client.sendMessage', label: 'Send a message', intent: 'send the message {body} to the studio about {project}', permission: 'messages.write', params: { project: 'id', body: 'string' } },
    { id: 'client.markRead', label: 'Mark as read', intent: 'mark the conversation about {project} as read', permission: 'messages.write', params: { project: 'id' } },
    { id: 'client.selectProject', label: 'Select project', intent: 'open the thread of {project}', permission: 'own.projects.read', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});

export const paymentsSpec = defineSpec({
  code: 'C-05',
  name: 'Payments',
  purpose:
    'What the client has been billed, what they have paid and what is still open, read only, with the online payment kept honest as a Placeholder until Stripe is wired (D-035).',
  surface: 'client',
  navGroup: 'money',
  layout: [
    'PageHeader (C-05)',
    'Three StatTiles: billed, paid, outstanding (with the overdue count)',
    'DataTable of the payments of my projects: concept, project, due date, amount, outstanding, status pill',
    'Placeholder "Pay online" button and the read-only note',
  ],
  dataTables: ['projects', 'payments'],
  roles: ['client'],
  logic: [
    'Only payments whose projectId is one of mine and whose direction is in (money the client owes the studio); what the studio owes its suppliers is never shown to the client.',
    'Totals are computed from amountCop and paidCop and formatted with formatCop in the current language.',
    'Nothing on this page writes: the studio issues every invoice (O-07).',
  ],
  components: ['PageHeader', 'Card', 'StatTile', 'DataTable', 'StatusPill', 'Button', 'Placeholder', 'EmptyState'],
  actions: [{ id: 'client.payOnline', label: 'Pay online', intent: 'pay the invoice {payment} online', permission: 'own.payments.read', params: { payment: 'id' } }],
  checkedAt: WIDTHS,
});

export const briefSpec = defineSpec({
  code: 'C-06',
  name: 'Strategic brief',
  purpose:
    'The strategic brief of the playbook (service 01 phase 2: user, space, aesthetic direction, expectation) as a form the client fills in their own time; the answers are saved on the engagement so the studio reads them before the session.',
  surface: 'client',
  navGroup: 'documents',
  layout: [
    'PageHeader (C-06) with the answered count',
    'Project Select when the client has more than one project',
    'One Card per playbook group (User, Space, Aesthetic direction, Expectation) with a Textarea per item',
    'Save button with a saved toast',
  ],
  dataTables: ['projects', 'engagements'],
  roles: ['client'],
  logic: [
    'The questions are read from SERVICES code 01 phase 01-2 (grouped items), so the form is the playbook and changes with it.',
    'Answers are stored in engagements.brief under checkKey("01-2", index) over phaseItems(), the same key scheme the checklist uses; keys written by the studio under other names are merged, never dropped.',
    'Save writes the whole brief object once with basedOn the engagement the client was editing (D-024), then toasts.',
    'A project without an engagement shows an EmptyState instead of a form that would write nowhere.',
  ],
  components: ['PageHeader', 'Card', 'Select', 'Textarea', 'Button', 'EmptyState', 'Skeleton'],
  actions: [
    { id: 'client.saveBrief', label: 'Save the brief', intent: 'save my brief for {project}', permission: 'own.projects.read', params: { project: 'id' } },
    { id: 'client.selectProject', label: 'Select project', intent: 'fill the brief of {project}', permission: 'own.projects.read', params: { project: 'id' } },
  ],
  checkedAt: WIDTHS,
});
