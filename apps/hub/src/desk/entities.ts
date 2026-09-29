import type { EntityName } from '../data/schema';
import { PIPELINE_STATUSES, PURCHASE_STATUSES, SERVICES, VALIDATION_STATUSES, pick, type Text } from '../tenant/domain';
import type { ItemKind } from './types';

/**
 * Page desks (D-106): how a row of each entity becomes an object. One rule per entity of `src/data/schema`, read off
 * the schema, each with its reason. Labels reuse the words of `spaces.type.*` (modules/spaces) where those exist.
 *
 * - `kind`: which physical object a row is (documents are documents, money rows are sheets with an amount, people
 *   and companies are cards, work is a checklist, projects are folders, goods are boxes, tags are tokens).
 * - `group`: the status-like field that makes the sub-mats. The first of `status`, `pipelineStatus`, `stage`,
 *   `kind`, `type` that the entity has, unless the reason says why another field groups better; `null` = one sub-mat.
 * - `order`: the field's values in their working order (the schema unions, the playbook sets); values not listed
 *   follow by count.
 * - `title`: the field whose value names the row (else `name`, `title`, `subject`, `item`, then the first string field).
 * - `amount` (COP, `formatCop`) and `date` (`formatDate`) go on the face; `lines` are further short fields.
 * - `meta: true`: a log or a join table, never a mat (activity, comments, filings, relations).
 */
export interface EntityRule {
  one: Text;
  many: Text;
  kind: ItemKind;
  group: string | null;
  order?: readonly string[];
  title?: string;
  amount?: string;
  date?: string;
  lines?: readonly string[];
  /** The noun an action's id or param uses for one row (`ops.advancePurchase {purchase}` -> purchases). */
  noun: string;
  why: string;
  meta?: boolean;
  /** A computed title when no field names the row (engagements, site reports, messages, competitions). */
  titleOf?: (row: Record<string, unknown>, lang: 'en' | 'es') => string;
}

const T = (en: string, es: string): Text => ({ en, es });
const ids = (xs: readonly { id: string }[]) => xs.map((x) => x.id);
const firstLine = (s: unknown, max = 48) => {
  const line = (String(s ?? '').split('\n')[0] ?? '').trim();
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
};

export const ENTITY_RULES: Record<EntityName, EntityRule> = {
  projects: { one: T('Project', 'Proyecto'), many: T('Projects', 'Proyectos'), kind: 'folder', group: 'pipelineStatus', order: ids(PIPELINE_STATUSES), title: 'name', amount: 'budgetCop', date: 'dueDate', lines: ['client', 'location'], noun: 'project', why: 'A project holds everything else: a folder. It has no `status`; `pipelineStatus` (the 15-status architecture, D-033) is its status.' },
  sections: { one: T('Section', 'Sección'), many: T('Sections', 'Secciones'), kind: 'sheet', group: null, title: 'name', noun: 'section', why: 'A section is a heading of a project\'s work (D-022): a sheet. No status-like field.' },
  tasks: { one: T('Task', 'Tarea'), many: T('Tasks', 'Tareas'), kind: 'checklist', group: 'status', order: ['todo', 'doing', 'blocked', 'done'], title: 'title', date: 'dueDate', lines: ['priority'], noun: 'task', why: 'Work to tick off: a checklist, grouped by the Board columns (`status`).' },
  comments: { one: T('Comment', 'Comentario'), many: T('Comments', 'Comentarios'), kind: 'sheet', group: null, title: 'body', noun: 'comment', why: 'A thread on another row: shown with that row, not as a mat.', meta: true },
  activity: { one: T('Change', 'Cambio'), many: T('Changes', 'Cambios'), kind: 'sheet', group: null, noun: 'activity', why: 'The provider\'s change log: it is the trail of other rows (W-04 plays it), not a mat.', meta: true },
  meetings: { one: T('Meeting', 'Reunión'), many: T('Meetings', 'Reuniones'), kind: 'card', group: 'kind', order: ['client', 'supplier', 'internal', 'site-visit', 'strategic'], title: 'title', date: 'startsAt', lines: ['location'], noun: 'meeting', why: 'An appointment card. Meetings have no status; `kind` (client, supplier, internal, site visit, strategic) is the grouping.' },
  suppliers: { one: T('Supplier', 'Proveedor'), many: T('Suppliers', 'Proveedores'), kind: 'card', group: 'status', order: ['active', 'trial', 'paused'], title: 'name', lines: ['category', 'city'], noun: 'supplier', why: 'A company: a business card, grouped by `status` (active, trial, paused).' },
  quotes: { one: T('Quote', 'Cotización'), many: T('Quotes', 'Cotizaciones'), kind: 'sheet', group: 'status', order: ['requested', 'received', 'shortlisted', 'selected', 'rejected'], title: 'item', amount: 'amountCop', date: 'validUntil', lines: ['comparisonGroup'], noun: 'quote', why: 'A priced page from a supplier: a sheet with its amount, grouped by `status`.' },
  deliveries: { one: T('Delivery', 'Entrega'), many: T('Deliveries', 'Entregas'), kind: 'box', group: 'status', order: ['pending', 'confirmed', 'delayed', 'delivered'], title: 'item', date: 'expectedDate', noun: 'delivery', why: 'Goods on their way: a box, grouped by `status`.' },
  payments: { one: T('Payment', 'Pago'), many: T('Payments', 'Pagos'), kind: 'sheet', group: 'status', order: ['due', 'overdue', 'partial', 'paid'], title: 'concept', amount: 'amountCop', date: 'dueDate', lines: ['counterparty'], noun: 'payment', why: 'A money slip: a sheet with its amount, grouped by `status` (due, overdue, partial, paid).' },
  documents: { one: T('Document', 'Documento'), many: T('Documents', 'Documentos'), kind: 'document', group: 'status', order: ['draft', 'final', 'sent', 'signed'], title: 'title', lines: ['kind'], noun: 'document', why: 'A document, grouped by `status` (draft, final, sent, signed); its `kind` is on the face.' },
  references: { one: T('Reference', 'Referencia'), many: T('References', 'Referencias'), kind: 'card', group: 'board', title: 'title', lines: ['source'], noun: 'reference', why: 'A pinned image card. No status-like field; `board` (the mood board it is pinned to) is how the studio groups them.' },
  materials: { one: T('Material', 'Material'), many: T('Materials', 'Materiales'), kind: 'card', group: 'status', order: ['proposed', 'sampled', 'approved', 'rejected'], title: 'name', amount: 'unitCop', lines: ['finish', 'color'], noun: 'material', why: 'A sample card of a palette, grouped by `status` (proposed, sampled, approved, rejected).' },
  schedules: { one: T('Schedule', 'Cuadro'), many: T('Schedules', 'Cuadros'), kind: 'sheet', group: 'status', order: ['draft', 'in-review', 'final'], title: 'title', date: 'dueDate', lines: ['kind'], noun: 'schedule', why: 'A specification list: a sheet, grouped by `status` (it has `kind` too; the status is what the team works by).' },
  renderPacks: { one: T('Render pack', 'Paquete de render'), many: T('Render packs', 'Paquetes de render'), kind: 'folder', group: 'status', order: ['briefing', 'sent', 'rendering', 'delivered'], title: 'title', date: 'dueDate', lines: ['audience'], noun: 'renderPack', why: 'A pack of views and drawings: a folder, grouped by `status`.' },
  consistencyChecks: { one: T('Consistency check', 'Revisión de coherencia'), many: T('Consistency checks', 'Revisiones de coherencia'), kind: 'checklist', group: 'status', order: ['pending', 'issues', 'passed'], title: 'title', noun: 'check', why: 'Sarai\'s check items: a checklist, grouped by `status`.' },
  competitions: { one: T('Competition', 'Concurso'), many: T('Competitions', 'Concursos'), kind: 'card', group: 'status', order: ['slot', 'researching', 'preparing', 'ready', 'submitted', 'result'], title: 'name', date: 'submissionDate', lines: ['organiser'], noun: 'competition', why: 'A competition slot card, grouped by `status` (open slot to result).', titleOf: (r, l) => (typeof r.name === 'string' && r.name ? r.name : `${l === 'es' ? 'Cupo' : 'Slot'} ${String(r.slot ?? '')}`) },
  presentations: { one: T('Presentation', 'Presentación'), many: T('Presentations', 'Presentaciones'), kind: 'document', group: 'status', order: ['requested', 'drafting', 'review', 'final'], title: 'title', date: 'dueDate', lines: ['kind'], noun: 'presentation', why: 'A deck: a document, grouped by `status`.' },
  brandAssets: { one: T('Brand asset', 'Activo de marca'), many: T('Brand assets', 'Activos de marca'), kind: 'document', group: 'status', order: ['current', 'draft', 'superseded'], title: 'name', lines: ['kind', 'format'], noun: 'asset', why: 'A brand file: a document, grouped by `status` (current, draft, superseded).' },
  revisions: { one: T('Revision', 'Revisión'), many: T('Revisions', 'Revisiones'), kind: 'sheet', group: 'status', order: ['requested', 'in-progress', 'delivered', 'approved'], title: 'title', date: 'dueDate', lines: ['kind'], noun: 'revision', why: 'A graphic revision request: a sheet, grouped by `status`.' },
  alerts: { one: T('Alert', 'Alerta'), many: T('Alerts', 'Alertas'), kind: 'card', group: 'status', order: ['open', 'acknowledged', 'resolved'], title: 'title', date: 'dueDate', lines: ['severity'], noun: 'alert', why: 'A notice card, grouped by `status` (open, acknowledged, resolved); the severity is on the face.' },
  spaces: { one: T('Space', 'Espacio'), many: T('Spaces', 'Espacios'), kind: 'folder', group: 'kind', order: ['area', 'topic', 'role', 'client', 'deliverable', 'tool', 'project', 'archive'], title: 'name', lines: ['description'], noun: 'space', why: 'A space files posts: a folder. No status; `kind` (area, topic, role...) is the grouping.' },
  posts: { one: T('Post', 'Publicación'), many: T('Posts', 'Publicaciones'), kind: 'document', group: 'kind', order: ['decision', 'procedure', 'brief', 'announcement', 'note', 'link', 'file'], title: 'title', lines: ['status'], noun: 'post', why: 'A written post: a document. Grouped by `kind`, not `status`: almost every post is published, while decision / procedure / brief is what tells them apart.' },
  filings: { one: T('Filing', 'Archivado'), many: T('Filings', 'Archivados'), kind: 'sheet', group: null, noun: 'filing', why: 'A join row (post in space): shown as the post, not as a mat.', meta: true },
  relations: { one: T('Relation', 'Relación'), many: T('Relations', 'Relaciones'), kind: 'sheet', group: null, noun: 'relation', why: 'A link between two rows: the graph views show them, not a mat.', meta: true },
  tags: { one: T('Tag', 'Etiqueta'), many: T('Tags', 'Etiquetas'), kind: 'token', group: null, title: 'name', noun: 'tag', why: 'A tag is a token (its tone is the coin\'s colour). No status-like field.' },
  clients: { one: T('Client', 'Cliente'), many: T('Clients', 'Clientes'), kind: 'card', group: 'kind', order: ['current', 'prospect', 'past'], title: 'name', lines: ['sector', 'city'], noun: 'client', why: 'A person or company: a card. No status; `kind` (current, prospect, past) is the grouping.' },
  deliverables: { one: T('Deliverable', 'Entregable'), many: T('Deliverables', 'Entregables'), kind: 'document', group: 'status', order: ['defined', 'template-ready', 'automated'], title: 'name', lines: ['phase'], noun: 'deliverable', why: 'A deliverable type: a document, grouped by `status` (defined, template ready, automated).' },
  tools: { one: T('Tool', 'Herramienta'), many: T('Tools', 'Herramientas'), kind: 'card', group: 'status', order: ['in-use', 'evaluating', 'to-replace', 'replaced', 'planned'], title: 'name', lines: ['vendor', 'category'], noun: 'tool', why: 'A software card, grouped by `status` (in use to replaced).' },
  leads: { one: T('Lead', 'Lead'), many: T('Leads', 'Leads'), kind: 'card', group: 'status', order: ['lead-new', 'lead-qualified', 'proposal-sent', 'contracted'], title: 'name', amount: 'budgetCop', date: 'desiredStart', lines: ['city', 'channel'], noun: 'lead', why: 'A person who asked: a card, grouped by `status` (the four lead statuses of the pipeline).' },
  engagements: { one: T('Engagement', 'Servicio contratado'), many: T('Engagements', 'Servicios contratados'), kind: 'folder', group: 'status', order: ['started', 'in-progress', 'delivered', 'closed'], date: 'startedAt', lines: ['currentPhaseId'], noun: 'engagement', why: 'One service on one project, with its checklist and brief inside: a folder, grouped by `status`.', titleOf: (r, l) => { const s = SERVICES.find((x) => x.code === r.serviceCode); return s ? `${s.code} · ${pick(s.name, l)}` : String(r.serviceCode ?? ''); } },
  revisionItems: { one: T('Revision item', 'Ítem de revisión'), many: T('Revision matrix', 'Matriz de revisión'), kind: 'sheet', group: 'status', order: ids(VALIDATION_STATUSES), title: 'item', date: 'decidedAt', lines: ['stage'], noun: 'revisionItem', why: 'A line of the revision matrix: a sheet, grouped by `status` (the three validation statuses).' },
  changeOrders: { one: T('Change order', 'Orden de cambio'), many: T('Change orders', 'Órdenes de cambio'), kind: 'sheet', group: 'status', order: ['requested', 'approved', 'rejected', 'executed'], title: 'description', amount: 'extraCostCop', noun: 'changeOrder', why: 'A signed change: a sheet with its extra cost, grouped by `status`.' },
  purchases: { one: T('Purchase', 'Compra'), many: T('Purchases', 'Compras'), kind: 'sheet', group: 'status', order: ids(PURCHASE_STATUSES), title: 'reference', amount: 'priceCop', date: 'date', lines: ['quantity'], noun: 'purchase', why: 'A purchase order: a sheet with its price, grouped by `status` (the six purchase statuses, quotation to installation).' },
  siteReports: { one: T('Site report', 'Informe de obra'), many: T('Site reports', 'Informes de obra'), kind: 'document', group: null, date: 'date', lines: ['notes'], noun: 'siteReport', why: 'A written visit record: a document. No status-like field; one sub-mat, newest first.', titleOf: (r, l) => `${l === 'es' ? 'Visita' : 'Visit'} · ${String(r.progress ?? 0)} %` },
  messages: { one: T('Message', 'Mensaje'), many: T('Messages', 'Mensajes'), kind: 'sheet', group: null, date: 'at', noun: 'message', why: 'A note in the project channel: a sheet. No channel or status field (every message is the official channel, 03 stage 01); one sub-mat.', titleOf: (r) => firstLine(r.body) },
  assets: { one: T('Asset', 'Archivo'), many: T('Assets', 'Archivos'), kind: 'document', group: 'kind', order: ['document', 'page', 'image', 'logo', 'texture', 'file'], title: 'title', lines: ['status'], noun: 'asset', why: 'A served file or a page render: a document. Grouped by `kind` (document, page, image, logo, texture, file): nearly every asset is current.' },
};

/** The status fields whose values are StatusPill statuses (the pill on a face). */
export const PILL_FIELDS = ['status', 'pipelineStatus'] as const;

/** The field that names a row: the rule's, else the usual ones, else the first non-empty string field. */
export function titleOfRow(row: Record<string, unknown>, rule: EntityRule, lang: 'en' | 'es'): string {
  if (rule.titleOf) return rule.titleOf(row, lang);
  if (lang === 'es' && typeof row.titleEs === 'string' && row.titleEs) return row.titleEs;
  for (const f of [rule.title, 'name', 'title', 'subject', 'item']) {
    const v = f ? row[f] : undefined;
    if (typeof v === 'string' && v.trim()) return firstLine(v, 64);
  }
  for (const [k, v] of Object.entries(row)) if (typeof v === 'string' && v.trim() && !/(^id$|Id$|_at$|^tenant_id$)/.test(k)) return firstLine(v, 64);
  return String(row.id ?? '');
}
