import type { Row } from '../../data/provider';
import type { EntityName } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { LEAD_CHANNELS, type StatusTone, type Text } from '../../tenant/domain';
import { pipelineLabel, purchaseStatus, statusText, validationStatus } from '../../desk/fields';

export { fieldLabel, pipelineLabel, rowFields, statusText } from '../../desk/fields';
import { PIPELINE_STEP, type DeskItem, type GroupId, type JourneyId } from './model';

/**
 * W-04 light layer (prompt 0028, D-105): the Method desk as the spatial view of one project. Every row of the followed
 * project lands as a small luminous tile on the mat where that kind of thing belongs, and every dated fact of the
 * project becomes an event of its trail ("it is all light: a message, a payment, a status change are one kind of event
 * moving through phases"). Pure data and functions, no React: the placement is the table `FLOW_RULES` below
 * (entity -> mat, with a one-line rationale each), never decided in JSX.
 */

/** The project's entities placed on the desk, in the order their tiles are packed and their same-day events are told. */
export const FLOW_ENTITIES = [
  'leads',
  'engagements',
  'meetings',
  'documents',
  'quotes',
  'changeOrders',
  'revisionItems',
  'revisions',
  'purchases',
  'payments',
  'deliveries',
  'siteReports',
  'messages',
  'alerts',
] as const satisfies readonly EntityName[];
export type FlowEntity = (typeof FLOW_ENTITIES)[number];

/** Rows of the followed project, per entity (alerts are the ones pointing at the project or at one of its rows). */
export type FlowRows = { [E in FlowEntity]: Row<E>[] };

/** At most this many tiles per entity; the last tile says "+N more" (the drawer, the trail and the strip count them all). */
export const FLOW_CAP_PER_ENTITY = 6;
/** At most this many tiles for one project (the biggest mock project places 22). */
export const FLOW_CAP_TOTAL = 40;

const T = (en: string, es: string): Text => ({ en, es });
/** A caption in both languages from one function of the language (numbers and dates are formatted per language). */
const both = (f: (lang: 'en' | 'es') => string): Text => ({ en: f('en'), es: f('es') });
const cop = (n: number): Text => both((l) => formatCop(n, l));
const firstLine = (s: string, max = 64) => {
  const line = (s.split('\n')[0] ?? '').trim();
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
};

const tx = (x: Text, lang: 'en' | 'es') => (lang === 'es' ? x.es ?? x.en : x.en);

/** Names the flow needs to write a face or a caption (suppliers, people), resolved by the page. */
export interface FlowCtx {
  project: Row<'projects'>;
  /** The journey phase of the project's pipeline status (the "now" mat). */
  current: JourneyId;
  supplierName: (id: string | null) => string;
  personName: (id: string | null) => string;
}

/** What a tile shows and what its trail event says. */
interface Face {
  title: Text;
  lines: Text[];
  tone?: StatusTone;
}

interface FlowRule<E extends FlowEntity> {
  /** Singular noun on the tile's kicker and in the drawer. */
  label: Text;
  /** Where the tile goes. */
  mat: (row: Row<E>, ctx: FlowCtx) => JourneyId;
  /** The rule in words (page doc, changelog, drawer). */
  rationale: Text;
  /** Project sub-mat, or the project's communication sub-mat (messages). */
  group: Extract<GroupId, 'project' | 'projectComms'>;
  /** The hub page that manages this entity (`:projectId` is filled in). */
  openAt: string;
  /** When it happened: the entity's own date, `created_at` when it has none. */
  when: (row: Row<E>) => string;
  face: (row: Row<E>, ctx: FlowCtx) => Face;
  caption: (row: Row<E>, ctx: FlowCtx) => Text;
}

const DOC_MAT: Record<string, JourneyId> = { contract: 'brief', brief: 'brief', quote: 'development', plan: 'development', spec: 'development', 'project-pdf': 'validation', invoice: 'delivery', report: 'delivery' };
const toneOf = (status: string): StatusTone =>
  ['paid', 'approved', 'installed', 'received', 'delivered', 'confirmed', 'selected', 'signed', 'final', 'executed', 'resolved', 'client-approved'].includes(status)
    ? 'success'
    : ['overdue', 'delayed', 'rejected', 'urgent'].includes(status)
      ? 'danger'
      : ['due', 'partial', 'revision', 'requested', 'warning', 'approved-with-adjustments'].includes(status)
        ? 'warning'
        : 'info';

/**
 * Entity -> mat. One rationale per row; the page doc and changelog 0035 carry the same table.
 * Supplier quotes go to Development (the project template's Quotation phase, `phase-cotizacion`, lives there), not to
 * Brief: in this schema `quotes` are supplier prices compared side by side, not the client proposal.
 */
export const FLOW_RULES: { [E in FlowEntity]: FlowRule<E> } = {
  leads: {
    label: T('Lead', 'Lead'),
    mat: () => 'lead',
    rationale: T('The inquiry that became the project: where every client enters (p. 3).', 'La consulta que se volvió proyecto: por donde entra cada cliente (p. 3).'),
    group: 'project',
    openAt: '/founder/leads',
    when: (r) => r.created_at,
    face: (r) => ({ title: T(r.name, r.name), lines: [LEAD_CHANNELS.find((c) => c.id === r.channel)?.label ?? T(r.channel, r.channel), pipelineLabel(r.status), ...(r.budgetCop ? [cop(r.budgetCop)] : [])], tone: 'info' }),
    caption: (r) => {
      const ch = LEAD_CHANNELS.find((c) => c.id === r.channel)?.label ?? T(r.channel, r.channel);
      return both((l) => (l === 'es' ? `Lead por ${tx(ch, l)}: ${r.name}` : `Lead via ${tx(ch, l)}: ${r.name}`));
    },
  },
  engagements: {
    label: T('Service', 'Servicio'),
    mat: () => 'brief',
    rationale: T('The contracted service and its checklist start at the brief (activation, G-01).', 'El servicio contratado y su lista arrancan en el brief (activación, G-01).'),
    group: 'project',
    openAt: '/studio/checklist/:projectId',
    when: (r) => r.startedAt,
    face: (r) => ({ title: both((l) => (l === 'es' ? `Servicio ${r.serviceCode}` : `Service ${r.serviceCode}`)), lines: [both((l) => (l === 'es' ? `Fase ${r.currentPhaseId}` : `Phase ${r.currentPhaseId}`)), statusText(r.status), both((l) => formatDate(r.startedAt, l))], tone: toneOf(r.status) }),
    caption: (r) => both((l) => (l === 'es' ? `Servicio ${r.serviceCode} iniciado, ahora en la fase ${r.currentPhaseId}` : `Service ${r.serviceCode} started, now in phase ${r.currentPhaseId}`)),
  },
  meetings: {
    label: T('Meeting', 'Reunión'),
    mat: (_r, ctx) => (ctx.current === 'lead' ? 'diagnosis' : ctx.current),
    rationale: T('A meeting is about where the project is now; while it is still a lead, the first visit is Diagnosis.', 'Una reunión trata de donde está el proyecto ahora; mientras es lead, la primera visita es Diagnóstico.'),
    group: 'project',
    openAt: '/ops/schedule',
    when: (r) => r.startsAt,
    face: (r) => ({ title: T(r.title, r.title), lines: [both((l) => formatDate(r.startsAt, l)), T(r.kind, r.kind), T(r.location, r.location)], tone: 'info' }),
    caption: (r) => both((l) => (l === 'es' ? `Reunión (${r.kind}): ${r.title}` : `Meeting (${r.kind}): ${r.title}`)),
  },
  documents: {
    label: T('Document', 'Documento'),
    mat: (r) => DOC_MAT[r.kind] ?? 'brief',
    rationale: T('By kind: contract and brief at Brief, quote / plan / spec at Development, the proposal PDF at Validation, invoice and report at Delivery; else Brief.', 'Por tipo: contrato y brief en Brief, cotización / plano / especificación en Desarrollo, el PDF de propuesta en Validación, factura e informe en Entrega; si no, Brief.'),
    group: 'project',
    openAt: '/ops/documents',
    when: (r) => r.created_at,
    face: (r) => ({ title: T(r.title, r.title), lines: [T(r.kind, r.kind), statusText(r.status), T(`v${r.docVersion}`, `v${r.docVersion}`)], tone: toneOf(r.status) }),
    caption: (r) => both((l) => (l === 'es' ? `Documento: ${r.title} (${tx(statusText(r.status), l)})` : `Document: ${r.title} (${tx(statusText(r.status), l)})`)),
  },
  quotes: {
    label: T('Quote', 'Cotización'),
    mat: () => 'development',
    rationale: T('Supplier quotes are the project template’s Quotation phase, which sits on Development.', 'Las cotizaciones de proveedores son la fase Cotización de la plantilla, que está en Desarrollo.'),
    group: 'project',
    openAt: '/ops/quotes',
    when: (r) => r.created_at,
    face: (r, ctx) => ({ title: T(r.item, r.item), lines: [T(ctx.supplierName(r.supplierId), ctx.supplierName(r.supplierId)), cop(r.amountCop), statusText(r.status)], tone: toneOf(r.status) }),
    caption: (r, ctx) => both((l) => (l === 'es' ? `Cotización de ${ctx.supplierName(r.supplierId)}: ${formatCop(r.amountCop, l)} (${tx(statusText(r.status), l)})` : `Quote from ${ctx.supplierName(r.supplierId)}: ${formatCop(r.amountCop, l)} (${tx(statusText(r.status), l)})`)),
  },
  changeOrders: {
    label: T('Change order', 'Orden de cambio'),
    mat: () => 'development',
    rationale: T('A change after approval goes back to design development before work continues (G-13, G-14).', 'Un cambio después de aprobar vuelve a desarrollo de diseño antes de seguir (G-13, G-14).'),
    group: 'project',
    openAt: '/ops/change-orders',
    when: (r) => r.approvedAt ?? r.created_at,
    face: (r) => ({ title: T(r.description, r.description), lines: [both((l) => `+${formatCop(r.extraCostCop, l)}`), both((l) => (l === 'es' ? `+${r.extraDays} días` : `+${r.extraDays} days`)), statusText(r.status)], tone: toneOf(r.status) }),
    caption: (r) => both((l) => (l === 'es' ? `Orden de cambio: ${firstLine(r.description, 48)} (+${formatCop(r.extraCostCop, l)}, ${tx(statusText(r.status), l)})` : `Change order: ${firstLine(r.description, 48)} (+${formatCop(r.extraCostCop, l)}, ${tx(statusText(r.status), l)})`)),
  },
  revisionItems: {
    label: T('Revision', 'Revisión'),
    mat: () => 'validation',
    rationale: T('The single revision matrix is the client’s validation (03 stage 10, G-05).', 'La matriz única de revisión es la validación del cliente (03 etapa 10, G-05).'),
    group: 'project',
    openAt: '/studio/revisions',
    when: (r) => r.decidedAt ?? r.created_at,
    face: (r, ctx) => ({ title: T(r.item, r.item), lines: [T(r.stage, r.stage), validationStatus(r.status), T(ctx.personName(r.authorId), ctx.personName(r.authorId))], tone: toneOf(r.status) }),
    caption: (r, ctx) => both((l) => (l === 'es' ? `Revisión de ${ctx.personName(r.authorId)}: ${r.item} → ${tx(validationStatus(r.status), l)}` : `Revision by ${ctx.personName(r.authorId)}: ${r.item} → ${tx(validationStatus(r.status), l)}`)),
  },
  revisions: {
    label: T('Brand revision', 'Revisión de marca'),
    mat: () => 'validation',
    rationale: T('Presentation and image revisions are prepared for the client to validate.', 'Las revisiones de presentaciones e imágenes se preparan para que el cliente valide.'),
    group: 'project',
    openAt: '/brand/revisions',
    when: (r) => r.dueDate ?? r.created_at,
    face: (r) => ({ title: T(r.title, r.title), lines: [T(r.kind, r.kind), statusText(r.status), both((l) => formatDate(r.dueDate, l))], tone: toneOf(r.status) }),
    caption: (r) => both((l) => (l === 'es' ? `Revisión de marca: ${r.title} (${tx(statusText(r.status), l)})` : `Brand revision: ${r.title} (${tx(statusText(r.status), l)})`)),
  },
  purchases: {
    label: T('Purchase', 'Compra'),
    mat: () => 'delivery',
    rationale: T('Purchasing control runs in production (E stage 5, G-07): money and goods at Delivery.', 'El control de compras corre en producción (E etapa 5, G-07): dinero y bienes en Entrega.'),
    group: 'project',
    openAt: '/ops/purchases',
    when: (r) => r.date,
    face: (r, ctx) => ({ title: T(r.reference, r.reference), lines: [T(ctx.supplierName(r.supplierId), ctx.supplierName(r.supplierId)), purchaseStatus(r.status), cop(r.priceCop)], tone: toneOf(r.status) }),
    caption: (r, ctx) => both((l) => (l === 'es' ? `Compra: ${firstLine(r.reference, 40)} a ${ctx.supplierName(r.supplierId)}, ${tx(purchaseStatus(r.status), l)} (${formatCop(r.priceCop, l)})` : `Purchase: ${firstLine(r.reference, 40)} from ${ctx.supplierName(r.supplierId)}, ${tx(purchaseStatus(r.status), l)} (${formatCop(r.priceCop, l)})`)),
  },
  payments: {
    label: T('Payment', 'Pago'),
    mat: () => 'delivery',
    rationale: T('Payments in and out follow the work at Delivery (money and goods).', 'Los pagos que entran y salen siguen la obra en Entrega (dinero y bienes).'),
    group: 'project',
    openAt: '/ops/payments',
    when: (r) => r.paidDate ?? r.dueDate,
    face: (r) => ({ title: T(r.concept, r.concept), lines: [cop(r.amountCop), statusText(r.status), both((l) => formatDate(r.paidDate ?? r.dueDate, l))], tone: toneOf(r.status) }),
    caption: (r) =>
      both((l) => {
        const amount = formatCop(r.status === 'paid' ? r.paidCop : r.amountCop, l);
        if (r.status === 'paid') return r.direction === 'in' ? (l === 'es' ? `Pago de ${amount} recibido de ${r.counterparty}` : `Payment of ${amount} received from ${r.counterparty}`) : l === 'es' ? `Pago de ${amount} hecho a ${r.counterparty}` : `Payment of ${amount} made to ${r.counterparty}`;
        const st = tx(statusText(r.status), l).toLowerCase();
        return r.direction === 'in' ? (l === 'es' ? `Pago de ${amount} de ${r.counterparty}: ${st}` : `Payment of ${amount} from ${r.counterparty}: ${st}`) : l === 'es' ? `Pago de ${amount} a ${r.counterparty}: ${st}` : `Payment of ${amount} to ${r.counterparty}: ${st}`;
      }),
  },
  deliveries: {
    label: T('Delivery', 'Entrega'),
    mat: () => 'delivery',
    rationale: T('Goods arriving on site are Delivery.', 'Los bienes que llegan a obra son Entrega.'),
    group: 'project',
    openAt: '/ops/deliveries',
    when: (r) => r.confirmedDate ?? r.expectedDate,
    face: (r, ctx) => ({ title: T(r.item, r.item), lines: [T(ctx.supplierName(r.supplierId), ctx.supplierName(r.supplierId)), statusText(r.status), both((l) => formatDate(r.confirmedDate ?? r.expectedDate, l))], tone: toneOf(r.status) }),
    caption: (r, ctx) => both((l) => (l === 'es' ? `Entrega: ${r.item} de ${ctx.supplierName(r.supplierId)}, ${tx(statusText(r.status), l).toLowerCase()}` : `Delivery: ${r.item} from ${ctx.supplierName(r.supplierId)}, ${tx(statusText(r.status), l).toLowerCase()}`)),
  },
  siteReports: {
    label: T('Site report', 'Informe de obra'),
    mat: () => 'delivery',
    rationale: T('The written record of each site visit belongs to construction (E stage 7, G-08).', 'El registro escrito de cada visita de obra pertenece a la construcción (E etapa 7, G-08).'),
    group: 'project',
    openAt: '/ops/site-reports',
    when: (r) => r.date,
    face: (r) => ({ title: T(firstLine(r.notes, 60), firstLine(r.notes, 60)), lines: [T(`${r.progress} %`, `${r.progress} %`), both((l) => formatDate(r.date, l)), T(firstLine(r.problems, 40), firstLine(r.problems, 40))], tone: 'info' }),
    caption: (r) => both((l) => (l === 'es' ? `Informe de obra, ${r.progress} %: ${firstLine(r.notes, 56)}` : `Site report, ${r.progress} %: ${firstLine(r.notes, 56)}`)),
  },
  messages: {
    label: T('Message', 'Mensaje'),
    mat: (_r, ctx) => ctx.current,
    rationale: T('Messages happen where the project is now: the current phase’s mat, on the project’s Communication sub-mat.', 'Los mensajes ocurren donde está el proyecto ahora: el tapete de la fase actual, en el subtapete de Comunicación del proyecto.'),
    group: 'projectComms',
    openAt: '/client/messages',
    when: (r) => r.at,
    face: (r, ctx) => ({ title: T(firstLine(r.body, 70), firstLine(r.body, 70)), lines: [T('Project channel', 'Canal del proyecto'), T(ctx.personName(r.authorId), ctx.personName(r.authorId)), both((l) => formatDate(r.at, l, { day: 'numeric', month: 'short' }))], tone: 'info' }),
    caption: (r, ctx) => both((l) => (l === 'es' ? `Mensaje en el canal del proyecto de ${ctx.personName(r.authorId)}: “${firstLine(r.body, 56)}”` : `Message in the project channel from ${ctx.personName(r.authorId)}: “${firstLine(r.body, 56)}”`)),
  },
  alerts: {
    label: T('Alert', 'Alerta'),
    mat: (_r, ctx) => ctx.current,
    rationale: T('An alert is about now: the current phase.', 'Una alerta es sobre el ahora: la fase actual.'),
    group: 'project',
    openAt: '/ops/alerts',
    when: (r) => r.dueDate,
    face: (r) => ({ title: T(r.title, r.title), lines: [statusText(r.severity), statusText(r.status), both((l) => formatDate(r.dueDate, l))], tone: r.severity === 'urgent' ? 'danger' : r.severity === 'warning' ? 'warning' : 'info' }),
    caption: (r) => both((l) => (l === 'es' ? `Alerta (${tx(statusText(r.severity), l).toLowerCase()}): ${r.title}` : `Alert (${tx(statusText(r.severity), l).toLowerCase()}): ${r.title}`)),
  },
};

/** Journey phase of a pipeline status (the "now" mat of a project). */
export const phaseOfStatus = (status: string): JourneyId => PIPELINE_STEP[status as keyof typeof PIPELINE_STEP] ?? 'follow-up';

/** Short name for the project's sub-mat label: the name when it is short, else its first word. */
export const shortName = (name: string) => (name.length <= 16 ? name : name.split(/\s+/)[0] ?? name);

export const lightId = (entity: string, id: string) => `light-${entity}-${id}`;

/** One light tile's back-reference (the drawer lists the row's fields and opens its page). */
export interface LightRef {
  entity: FlowEntity;
  id: string;
}

/** Caps per entity so one project places at most `FLOW_CAP_TOTAL` tiles (the biggest entity gives way first). */
function caps(rows: FlowRows): Record<FlowEntity, number> {
  const cap = Object.fromEntries(FLOW_ENTITIES.map((e) => [e, Math.min(FLOW_CAP_PER_ENTITY, rows[e].length)])) as Record<FlowEntity, number>;
  let total = FLOW_ENTITIES.reduce((n, e) => n + cap[e], 0);
  while (total > FLOW_CAP_TOTAL) {
    const biggest = FLOW_ENTITIES.reduce((a, b) => (cap[b] > cap[a] ? b : a));
    if (cap[biggest] <= 1) break;
    cap[biggest] -= 1;
    total -= 1;
  }
  return cap;
}

const sortByWhen = <E extends FlowEntity>(entity: E, list: Row<E>[]) => [...list].sort((a, b) => FLOW_RULES[entity].when(a).localeCompare(FLOW_RULES[entity].when(b)) || a.id.localeCompare(b.id));

/** The light tiles of a project: DeskItems of kind `light` on the project's sub-mats (language-independent texts). */
export function buildLights(rows: FlowRows, ctx: FlowCtx): DeskItem[] {
  const cap = caps(rows);
  const out: DeskItem[] = [];
  for (const entity of FLOW_ENTITIES) {
    const rule = FLOW_RULES[entity] as FlowRule<FlowEntity>;
    const list = sortByWhen(entity, rows[entity] as Row<FlowEntity>[]) as Row<FlowEntity>[];
    const shown = list.slice(0, cap[entity]);
    shown.forEach((row, k) => {
      const face = rule.face(row as never, ctx);
      const more = k === shown.length - 1 ? list.length - shown.length : 0;
      out.push({
        id: lightId(entity, row.id),
        kind: 'light',
        phase: rule.mat(row as never, ctx),
        group: rule.group,
        source: 'project',
        code: undefined,
        title: face.title,
        subtitle: rule.label,
        lines: face.lines,
        tone: face.tone,
        openAt: { path: rule.openAt.replace(':projectId', ctx.project.id) },
        ref: { entity, id: row.id },
        more,
      });
    });
  }
  return out;
}

/** One step of the trail: a dated fact of the project, where it lands and what it says. */
export interface FlowEvent {
  id: string;
  at: string;
  phase: JourneyId;
  /** The desk object the pulse arrives at (a light tile or the status token). */
  target: string;
  caption: Text;
}

const PROJECT_FIELD: Record<string, Text> = {
  pipelineStatus: T('Status', 'Estado'),
  approval: T('Approval', 'Aprobación'),
  creativeDirection: T('Creative direction', 'Dirección creativa'),
  budgetCop: T('Budget', 'Presupuesto'),
  dueDate: T('Due date', 'Fecha de entrega'),
};

/**
 * The project's ordered events: one per row placed on the desk (its own date) plus one per `activity` line on the
 * project or on one of its rows (writes made since the seed, e.g. a purchase marked paid on O-12 in another tab).
 */
export function buildTrail(rows: FlowRows, activity: Row<'activity'>[], ctx: FlowCtx, lights: DeskItem[]): FlowEvent[] {
  const shownIds = new Set(lights.map((l) => l.id));
  const lastTileOf = new Map<string, string>();
  for (const l of lights) if (l.ref) lastTileOf.set(l.ref.entity, l.id);
  const targetOf = (entity: FlowEntity, id: string) => {
    const own = lightId(entity, id);
    return shownIds.has(own) ? own : lastTileOf.get(entity) ?? own;
  };
  const statusToken = (status: string) => `tok-pipeline-${status}`;
  const events: (FlowEvent & { order: number })[] = [];
  const rowIndex = new Map<string, { entity: FlowEntity; row: Row<FlowEntity> }>();
  FLOW_ENTITIES.forEach((entity, order) => {
    const rule = FLOW_RULES[entity] as FlowRule<FlowEntity>;
    for (const row of rows[entity] as Row<FlowEntity>[]) {
      rowIndex.set(`${entity}:${row.id}`, { entity, row });
      events.push({ id: `${entity}:${row.id}`, at: rule.when(row as never), phase: rule.mat(row as never, ctx), target: targetOf(entity, row.id), caption: rule.caption(row as never, ctx), order });
    }
  });
  for (const a of activity) {
    if (a.entity === 'projects' && a.entityId === ctx.project.id) {
      const name = PROJECT_FIELD[a.field] ?? T(a.field, a.field);
      const isStatus = a.field === 'pipelineStatus';
      const to = a.to ?? '';
      const val = isStatus ? pipelineLabel(to) : T(to, to);
      events.push({ id: `activity:${a.id}`, at: a.at, phase: isStatus ? phaseOfStatus(to) : ctx.current, target: statusToken(isStatus ? to : ctx.project.pipelineStatus), caption: both((l) => `${tx(name, l)} → ${tx(val, l)}`), order: FLOW_ENTITIES.length });
      continue;
    }
    const hit = rowIndex.get(`${a.entity}:${a.entityId}`);
    if (!hit) continue;
    const rule = FLOW_RULES[hit.entity] as FlowRule<FlowEntity>;
    const to = a.to ?? '';
    const val = a.field === 'status' ? (hit.entity === 'purchases' ? purchaseStatus(to) : hit.entity === 'revisionItems' ? validationStatus(to) : statusText(to)) : T(to, to);
    const face = rule.face(hit.row as never, ctx);
    events.push({
      id: `activity:${a.id}`,
      at: a.at,
      phase: rule.mat(hit.row as never, ctx),
      target: targetOf(hit.entity, a.entityId),
      caption: both((l) => `${tx(rule.label, l)} ${firstLine(tx(face.title, l), 36)}: ${a.field} → ${tx(val, l)}`),
      order: FLOW_ENTITIES.length,
    });
  }
  return events.sort((a, b) => a.at.slice(0, 19).localeCompare(b.at.slice(0, 19)) || a.order - b.order || a.id.localeCompare(b.id)).map(({ order: _o, ...e }) => e);
}

/** The money strip's totals (COP). Formulas are in `docs/pages/W-04.md` and changelog 0035. */
export interface FlowMoney {
  /** Per comparison group: the selected quote, else the lowest quote not rejected. */
  quoted: number;
  /** Purchases at Approved or later (any status but Quoted) + change orders approved or executed. */
  approved: number;
  /** Σ paidCop of the project's payments (in + out). */
  paid: number;
  paidIn: number;
  paidOut: number;
  /** Σ (amountCop − paidCop) of payments not yet paid (in + out). */
  outstanding: number;
  outstandingIn: number;
  outstandingOut: number;
}

export function moneyOf(rows: FlowRows): FlowMoney {
  const groups = new Map<string, Row<'quotes'>[]>();
  for (const q of rows.quotes) (groups.get(q.comparisonGroup) ?? groups.set(q.comparisonGroup, []).get(q.comparisonGroup)!).push(q);
  let quoted = 0;
  for (const list of groups.values()) {
    const selected = list.find((q) => q.status === 'selected');
    const open = list.filter((q) => q.status !== 'rejected').map((q) => q.amountCop);
    quoted += selected ? selected.amountCop : open.length ? Math.min(...open) : 0;
  }
  const approved = rows.purchases.filter((p) => p.status !== 'quoted').reduce((n, p) => n + p.priceCop, 0) + rows.changeOrders.filter((c) => c.status === 'approved' || c.status === 'executed').reduce((n, c) => n + c.extraCostCop, 0);
  const sum = (dir: 'in' | 'out', f: (p: Row<'payments'>) => number) => rows.payments.filter((p) => p.direction === dir).reduce((n, p) => n + f(p), 0);
  const paidIn = sum('in', (p) => p.paidCop);
  const paidOut = sum('out', (p) => p.paidCop);
  const owed = (p: Row<'payments'>) => (p.status === 'paid' ? 0 : Math.max(0, p.amountCop - p.paidCop));
  const outstandingIn = sum('in', owed);
  const outstandingOut = sum('out', owed);
  return { quoted, approved, paid: paidIn + paidOut, paidIn, paidOut, outstanding: outstandingIn + outstandingOut, outstandingIn, outstandingOut };
}

/** Communication counts by channel: the project channel (messages, split client / team), meetings, and the lead's intake channel. */
export interface FlowComms {
  messages: number;
  fromClient: number;
  fromTeam: number;
  meetings: number;
  leadChannels: Text[];
}

export function commsOf(rows: FlowRows, clientUserId: string | null): FlowComms {
  const fromClient = rows.messages.filter((m) => clientUserId && m.authorId === clientUserId).length;
  return {
    messages: rows.messages.length,
    fromClient,
    fromTeam: rows.messages.length - fromClient,
    meetings: rows.meetings.length,
    leadChannels: rows.leads.map((l) => LEAD_CHANNELS.find((c) => c.id === l.channel)?.label ?? T(l.channel, l.channel)),
  };
}
