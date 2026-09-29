import {
  CLIENT_JOURNEY,
  COMMERCIAL_FIELDS,
  FINAL_PRINCIPLE,
  GOVERNANCE_RULES,
  KPIS,
  LEAD_CHANNELS,
  LEAD_RECORD_FIELDS,
  OPERATIONAL_ASSETS,
  PIPELINE_STATUSES,
  PURCHASE_STATUSES,
  QUALIFICATION_QUESTIONS,
  ROLE_RESPONSIBILITIES,
  SERVICES,
  VALIDATION_STATUSES,
  isGrouped,
  phaseItems,
  type GovernanceKind,
  type PipelineStatusId,
  type ServiceCode,
  type StatusTone,
  type Text,
} from '../../tenant/domain';
import { TEMPLATES, type TemplateTask } from '../../tenant/domain/templates';

/**
 * W-04 Method desk (prompt 0026, D-103): the playbook and the project template laid out as physical objects on a
 * desk. Pure data and geometry, no React. Nothing here is hand-placed: every item is derived from the domain data
 * (`tenant/domain/playbook.ts`, `tenant/domain/templates`), every position comes out of `layoutDesk()`. The only
 * hand-written tables are classifications (which journey phase a service phase, a status or a rule belongs to),
 * each with a fallback so new data still lands on the desk.
 */

/** One chess square in world px. Every mat, sub-mat and item sits on this grid. */
export const SQ = 64;
/** Columns of squares inside one mat. */
export const MAT_COLS = 9;
/** Mat header (the phase label button), one square tall. */
export const MAT_HEAD = SQ;
/** Mat padding and the gap between sub-mats. */
export const MAT_PAD = SQ / 2;
/** Sub-mat label strip above its squares. */
export const SUB_HEAD = 24;
/** Gap between mats and around the world. */
export const MAT_GAP = SQ;

/** The ten phases of the client journey (`CLIENT_JOURNEY`, p. 2); one mat each. */
export type JourneyId = 'lead' | 'diagnosis' | 'brief' | 'analysis' | 'concept' | 'development' | 'validation' | 'delivery' | 'closure' | 'follow-up';

export type ItemKind = 'sheet' | 'form' | 'checklist' | 'document' | 'folder' | 'box' | 'token' | 'card';
export const ITEM_KINDS: readonly ItemKind[] = ['sheet', 'form', 'checklist', 'document', 'folder', 'box', 'token', 'card'];

export type GroupId = 'services' | 'statuses' | 'forms' | 'procedures' | 'deliverables' | 'money' | 'communication' | 'rules' | 'team' | 'measures';
/** Sub-mat order inside a mat (only groups with items are rendered). */
export const GROUP_ORDER: readonly GroupId[] = ['services', 'statuses', 'forms', 'procedures', 'deliverables', 'money', 'communication', 'rules', 'team', 'measures'];

export type ItemSource = 'playbook' | 'template' | 'statusSet';

/**
 * Thickness in world px (translateZ of the top face), footprint in squares, top-face size and the face's base font
 * size in world px (every size inside a preview is em, so the drawer scales the same markup by changing this).
 */
export const GEOMETRY: Record<ItemKind, { t: number; w: 1 | 2; face: { w: number; h: number }; font: number }> = {
  sheet: { t: 1, w: 1, face: { w: 46, h: 60 }, font: 2.3 },
  form: { t: 1, w: 1, face: { w: 46, h: 60 }, font: 2.3 },
  checklist: { t: 1, w: 1, face: { w: 46, h: 60 }, font: 2.3 },
  document: { t: 6, w: 1, face: { w: 46, h: 58 }, font: 2.3 },
  folder: { t: 8, w: 2, face: { w: 114, h: 50 }, font: 3.1 },
  box: { t: 18, w: 1, face: { w: 52, h: 52 }, font: 3.2 },
  token: { t: 4, w: 1, face: { w: 44, h: 44 }, font: 3.4 },
  card: { t: 2, w: 1, face: { w: 56, h: 40 }, font: 2.5 },
};

/** Where the real page for an item lives (the Open button is a Placeholder until it navigates there). */
export interface OpenAt {
  /** A route path of the hub, e.g. `/founder/leads`; the page resolves its code and name from the manifest. */
  path: string;
}

export interface DeskItem {
  id: string;
  kind: ItemKind;
  phase: JourneyId;
  group: GroupId;
  source: ItemSource;
  /** Short code printed on the object (service code, phase id, rule id, unit). */
  code?: string;
  title: Text;
  /** Second line: the service a checklist belongs to, the status set of a token, a rule kind. */
  subtitle?: Text;
  /** Rows of the preview: field labels, checklist items, deliverable lines. */
  lines: Text[];
  /** Section headings inside `lines` for grouped checklists (index -> heading). */
  sections?: { at: number; label: Text }[];
  tone?: StatusTone;
  openAt: OpenAt;
}

export interface PlacedItem extends DeskItem {
  /** Cell position in world px (top left of the footprint cell). */
  x: number;
  y: number;
  /** Footprint in world px (w squares by 1 square). */
  cw: number;
  ch: number;
}

export interface SubMat {
  id: string;
  group: GroupId;
  x: number;
  y: number;
  w: number;
  h: number;
  items: PlacedItem[];
}

export interface Mat {
  id: JourneyId;
  index: number;
  label: Text;
  x: number;
  y: number;
  w: number;
  h: number;
  subs: SubMat[];
  count: number;
}

export interface DeskLayout {
  mats: Mat[];
  items: PlacedItem[];
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------------------------
// Classifications (data -> journey phase). Each has a fallback so new data never falls off the desk.
// ---------------------------------------------------------------------------------------------

/** Journey phase of each service phase, parallel to `service.phases` (by index). */
const SERVICE_PHASE_STEPS: Record<ServiceCode, JourneyId[]> = {
  '01': ['brief', 'brief', 'analysis', 'analysis', 'concept', 'concept', 'delivery'],
  '02': ['diagnosis', 'diagnosis', 'diagnosis', 'diagnosis', 'diagnosis', 'analysis', 'concept'],
  '03': ['brief', 'brief', 'analysis', 'analysis', 'analysis', 'analysis', 'analysis', 'concept', 'concept', 'validation', 'development', 'development', 'development', 'development', 'development', 'development', 'development', 'development'],
  E: ['development', 'development', 'development', 'development', 'delivery', 'delivery', 'delivery', 'delivery', 'delivery'],
  '04': ['brief', 'analysis', 'concept', 'development', 'development', 'development', 'delivery'],
};

const PIPELINE_STEP: Record<PipelineStatusId, JourneyId> = {
  'lead-new': 'lead',
  'lead-qualified': 'lead',
  'proposal-sent': 'diagnosis',
  contracted: 'brief',
  briefing: 'brief',
  concept: 'concept',
  'design-development': 'development',
  'client-review': 'validation',
  approved: 'validation',
  procurement: 'delivery',
  'in-construction': 'delivery',
  'punch-list': 'delivery',
  delivered: 'delivery',
  closed: 'closure',
  'follow-up': 'follow-up',
};

const RULE_STEP: Record<string, JourneyId> = {
  'G-01': 'brief',
  'G-02': 'brief',
  'G-03': 'validation',
  'G-04': 'delivery',
  'G-05': 'validation',
  'G-06': 'validation',
  'G-07': 'delivery',
  'G-08': 'delivery',
  'G-09': 'closure',
  'G-10': 'lead',
  'G-11': 'diagnosis',
  'G-12': 'validation',
  'G-13': 'development',
  'G-14': 'delivery',
  'G-15': 'validation',
  'G-16': 'validation',
  'G-17': 'delivery',
};
const RULE_KIND_STEP: Record<GovernanceKind, JourneyId> = { mandatory: 'closure', commercial: 'lead', method: 'diagnosis', gate: 'validation', principle: 'development', 'change-control': 'delivery' };

/** Project template phase -> journey phase (the founder's Asana sections). */
const TEMPLATE_STEP: Record<string, JourneyId> = {
  'phase-cierre': 'brief',
  'phase-diseno': 'concept',
  'phase-planeacion': 'development',
  'phase-cotizacion': 'development',
  'phase-produccion': 'delivery',
};

/** Operational assets (p. 17) -> journey phase, group and kind. */
const ASSET_PLACE: Record<string, { phase: JourneyId; group: GroupId; kind: ItemKind; openAt: string }> = {
  'folder-tree': { phase: 'brief', group: 'procedures', kind: 'sheet', openAt: '/manual/governance' },
  'naming-convention': { phase: 'brief', group: 'procedures', kind: 'sheet', openAt: '/manual/governance' },
  'message-templates': { phase: 'lead', group: 'communication', kind: 'sheet', openAt: '/founder/leads' },
  'brief-forms': { phase: 'brief', group: 'forms', kind: 'form', openAt: '/studio/checklist' },
  'visit-checklists': { phase: 'diagnosis', group: 'procedures', kind: 'sheet', openAt: '/studio/checklist' },
  'revision-matrix': { phase: 'validation', group: 'forms', kind: 'form', openAt: '/studio/revisions' },
  'approval-forms': { phase: 'validation', group: 'forms', kind: 'form', openAt: '/founder/approvals' },
  'budget-tracker': { phase: 'development', group: 'money', kind: 'sheet', openAt: '/ops/purchases' },
  'procurement-tracker': { phase: 'delivery', group: 'money', kind: 'sheet', openAt: '/ops/purchases' },
  'site-report': { phase: 'delivery', group: 'communication', kind: 'sheet', openAt: '/ops/site-reports' },
  'handover-checklist': { phase: 'closure', group: 'procedures', kind: 'checklist', openAt: '/studio/checklist' },
};

const T = (en: string, es: string): Text => ({ en, es });
const JOURNEY_IDS: readonly string[] = CLIENT_JOURNEY.map((s) => s.id);
const isJourney = (id: string): id is JourneyId => JOURNEY_IDS.includes(id);

const RULE_KIND_TEXT: Record<GovernanceKind, Text> = {
  mandatory: T('Mandatory rule', 'Regla obligatoria'),
  commercial: T('Commercial rule', 'Regla comercial'),
  method: T('Method', 'Método'),
  gate: T('Approval gate', 'Puerta de aprobación'),
  principle: T('Principle', 'Principio'),
  'change-control': T('Change control', 'Control de cambios'),
};
const UNIT_TEXT: Record<string, Text> = { '%': T('%', '%'), days: T('days', 'días'), count: T('count', 'conteo'), score: T('score', 'puntaje') };
const pickUnit = (u: string) => (u === '%' ? '%' : u === 'days' ? 'd' : u === 'count' ? '#' : '★');
const manualPath = (slug: string) => `/manual/services/${slug}`;

/** Every object on the desk, in data order. Language-independent: texts are `{ en, es }`. */
export function buildItems(): DeskItem[] {
  const items: DeskItem[] = [];
  const add = (item: DeskItem) => items.push(item);

  // Services: one folder each on the Lead mat (where the service ladder routes the client), checklists per phase,
  // and at Delivery a document of the delivery contents plus the delivery kit box.
  for (const service of SERVICES) {
    add({
      id: `svc-${service.code}`,
      kind: 'folder',
      phase: 'lead',
      group: 'services',
      source: 'playbook',
      code: service.code,
      title: service.name,
      subtitle: service.ladderWord,
      lines: [service.outcome, service.idealFor],
      openAt: { path: manualPath(service.slug) },
    });
    const steps = SERVICE_PHASE_STEPS[service.code] ?? [];
    service.phases.forEach((phase, i) => {
      const step = steps[i] ?? 'development';
      const flat = phaseItems(phase);
      const sections = isGrouped(phase.items)
        ? phase.items.reduce<{ at: number; label: Text }[]>((acc, g, gi, all) => {
            const at = all.slice(0, gi).reduce((n, x) => n + x.items.length, 0);
            return [...acc, { at, label: g.group }];
          }, [])
        : undefined;
      add({
        id: `chk-${phase.id}`,
        kind: 'checklist',
        phase: step,
        group: 'procedures',
        source: 'playbook',
        code: phase.id,
        title: phase.title,
        subtitle: service.name,
        lines: flat,
        sections,
        openAt: { path: '/studio/checklist' },
      });
    });
    add({
      id: `doc-${service.code}`,
      kind: 'document',
      phase: 'delivery',
      group: 'deliverables',
      source: 'playbook',
      code: service.code,
      title: T('Deliverables', 'Entregables'),
      subtitle: service.name,
      lines: service.deliveryContents,
      openAt: { path: manualPath(service.slug) },
    });
    add({
      id: `box-${service.code}`,
      kind: 'box',
      phase: 'delivery',
      group: 'deliverables',
      source: 'playbook',
      code: service.code,
      title: T('Delivery kit', 'Kit de entrega'),
      subtitle: service.name,
      lines: service.deliveryContents,
      openAt: { path: manualPath(service.slug) },
    });
  }

  // Statuses: one token per status of the three status sets.
  for (const s of PIPELINE_STATUSES) {
    add({ id: `tok-pipeline-${s.id}`, kind: 'token', phase: PIPELINE_STEP[s.id] ?? 'follow-up', group: 'statuses', source: 'statusSet', code: s.playbook, title: s.label, subtitle: T('Pipeline status', 'Estado del proceso'), lines: [], tone: s.tone, openAt: { path: '/founder/pipeline' } });
  }
  for (const s of VALIDATION_STATUSES) {
    add({ id: `tok-validation-${s.id}`, kind: 'token', phase: 'validation', group: 'statuses', source: 'statusSet', code: s.playbook, title: s.label, subtitle: T('Validation status', 'Estado de validación'), lines: [], tone: s.tone, openAt: { path: '/studio/revisions' } });
  }
  for (const s of PURCHASE_STATUSES) {
    add({ id: `tok-purchase-${s.id}`, kind: 'token', phase: 'delivery', group: 'statuses', source: 'statusSet', code: s.playbook, title: s.label, subtitle: T('Purchase status', 'Estado de compra'), lines: [], tone: s.tone, openAt: { path: '/ops/purchases' } });
  }

  // Lead intake forms (p. 3) and the channels a lead arrives through.
  add({ id: 'form-lead-record', kind: 'form', phase: 'lead', group: 'forms', source: 'playbook', title: T('Lead record', 'Registro del lead'), lines: LEAD_RECORD_FIELDS.map((f) => f.label), openAt: { path: '/founder/leads' } });
  add({ id: 'form-commercial', kind: 'form', phase: 'lead', group: 'forms', source: 'playbook', title: T('Commercial data', 'Datos comerciales'), lines: COMMERCIAL_FIELDS.map((f) => f.label), openAt: { path: '/founder/leads' } });
  add({ id: 'form-qualification', kind: 'form', phase: 'lead', group: 'forms', source: 'playbook', title: T('Qualification', 'Calificación'), lines: QUALIFICATION_QUESTIONS.map((q) => q.question), openAt: { path: '/founder/leads' } });
  add({ id: 'sheet-lead-channels', kind: 'sheet', phase: 'lead', group: 'communication', source: 'playbook', title: T('Lead channels', 'Canales de leads'), lines: LEAD_CHANNELS.map((c) => c.label), openAt: { path: '/founder/leads' } });

  // Operational assets (p. 17): the studio's standing templates. Their previews read real data where it exists.
  const brief = SERVICES.flatMap((s) => s.phases).find((p) => p.id === '01-2');
  const diagnosisChecklists = SERVICES.flatMap((s) => s.phases.map((p, i) => ({ p, step: SERVICE_PHASE_STEPS[s.code]?.[i] }))).filter((x) => x.step === 'diagnosis').map((x) => x.p.title);
  const handover = SERVICES.find((s) => s.code === 'E')?.deliveryContents ?? [];
  const g16 = GOVERNANCE_RULES.find((r) => r.id === 'G-16');
  for (const asset of OPERATIONAL_ASSETS) {
    const place = ASSET_PLACE[asset.id] ?? { phase: 'closure', group: 'procedures', kind: 'sheet', openAt: '/manual/governance' };
    let lines: Text[] = asset.productMapping ? [T(`→ ${asset.productMapping}`, `→ ${asset.productMapping}`)] : [];
    let sections: DeskItem['sections'];
    if (asset.id === 'brief-forms' && brief) {
      lines = phaseItems(brief);
      sections = isGrouped(brief.items) ? brief.items.map((g, gi, all) => ({ at: all.slice(0, gi).reduce((n, x) => n + x.items.length, 0), label: g.group })) : undefined;
    }
    if (asset.id === 'visit-checklists') lines = diagnosisChecklists;
    if (asset.id === 'handover-checklist') lines = handover;
    if (asset.id === 'revision-matrix') lines = VALIDATION_STATUSES.map((s) => s.label);
    if (asset.id === 'approval-forms' && g16) lines = [g16.rule];
    if (asset.id === 'procurement-tracker') lines = PURCHASE_STATUSES.map((s) => s.label);
    add({ id: `asset-${asset.id}`, kind: place.kind, phase: place.phase, group: place.group, source: 'playbook', title: asset.label, lines, sections, openAt: { path: place.openAt } });
  }

  // Governance rules as stiff cards.
  for (const rule of GOVERNANCE_RULES) {
    const step = RULE_STEP[rule.id] ?? RULE_KIND_STEP[rule.kind] ?? 'closure';
    add({ id: `rule-${rule.id}`, kind: 'card', phase: step, group: 'rules', source: 'playbook', code: rule.id, title: rule.rule, subtitle: RULE_KIND_TEXT[rule.kind], lines: [], openAt: { path: '/manual/governance' } });
  }
  add({ id: 'sheet-final-principle', kind: 'sheet', phase: 'follow-up', group: 'rules', source: 'playbook', title: T('Final principle', 'Principio final'), lines: [FINAL_PRINCIPLE], openAt: { path: '/manual/governance' } });

  // The team (p. 17) on the Brief mat, where every project gets its owner (G-01).
  for (const role of ROLE_RESPONSIBILITIES) {
    add({ id: `role-${role.id}`, kind: 'card', phase: 'brief', group: 'team', source: 'playbook', code: role.roleId ?? '—', title: role.playbookRole, subtitle: role.note, lines: [], openAt: { path: '/manual/governance' } });
  }

  // KPIs (p. 17) on Follow-up.
  for (const kpi of KPIS) {
    add({ id: `kpi-${kpi.key}`, kind: 'card', phase: 'follow-up', group: 'measures', source: 'playbook', code: pickUnit(kpi.unit), title: kpi.label, subtitle: UNIT_TEXT[kpi.unit] ?? T(kpi.unit, kpi.unit), lines: [], openAt: { path: '/manual/governance' } });
  }

  // Project template phases as folders; their top-level tasks are the preview.
  for (const template of TEMPLATES) {
    template.phases.forEach((phase, i) => {
      const count = (tasks: TemplateTask[]): number => tasks.reduce((n, t) => n + 1 + count(t.children), 0);
      add({
        id: `tpl-${phase.id}`,
        kind: 'folder',
        phase: TEMPLATE_STEP[phase.id] ?? 'development',
        group: 'procedures',
        source: 'template',
        code: String(i).padStart(2, '0'),
        title: phase.name,
        subtitle: template.name,
        lines: phase.tasks.map((t) => t.title),
        sections: [{ at: 0, label: T(`${count(phase.tasks)} tasks`, `${count(phase.tasks)} tareas`) }],
        openAt: { path: '/founder/work/new' },
      });
    });
  }

  return items.filter((i) => isJourney(i.phase));
}

// ---------------------------------------------------------------------------------------------
// Layout: items -> sub-mats -> mats -> rows. Deterministic, grid-aligned, no overlaps.
// ---------------------------------------------------------------------------------------------

/** Dense first-fit packing of 1x1 / 2x1 items into `cols` columns; returns cell positions and the row count. */
function pack(items: DeskItem[], cols: number): { cells: { col: number; row: number }[]; rows: number } {
  const taken: boolean[][] = [];
  const free = (r: number, c: number) => !(taken[r]?.[c] ?? false);
  const cells: { col: number; row: number }[] = [];
  for (const item of items) {
    const w = GEOMETRY[item.kind].w;
    let placed = false;
    for (let r = 0; !placed; r++) {
      for (let c = 0; c + w <= cols; c++) {
        if (free(r, c) && (w === 1 || free(r, c + 1))) {
          for (let k = 0; k < w; k++) (taken[r] ??= [])[c + k] = true;
          cells.push({ col: c, row: r });
          placed = true;
          break;
        }
      }
    }
  }
  return { cells, rows: taken.length };
}

/**
 * Columns for a sub-mat, chosen so small groups pair up on one shelf of the mat (3 + 4, 4 + 4, 3 + 5 fit in 9 with the
 * half-square gap) and big groups take the whole width.
 */
function subCols(items: DeskItem[]): number {
  const area = items.reduce((n, i) => n + GEOMETRY[i.kind].w, 0);
  const cols = area <= 3 ? 3 : area <= 8 ? 4 : area <= 10 ? 5 : MAT_COLS;
  return Math.min(MAT_COLS, cols);
}

/** Lays out every item. `perRow` mats per row (5 landscape, 3 squarish, 2 tall phone stages). */
export function layoutDesk(items: DeskItem[], perRow: number): DeskLayout {
  const matW = MAT_COLS * SQ + 2 * MAT_PAD;
  const mats: Mat[] = CLIENT_JOURNEY.map((step, index) => {
    const mine = items.filter((i) => i.phase === step.id);
    // Sub-mats: pack each group, then shelf-pack the sub-mats inside the mat.
    const subs: SubMat[] = [];
    let shelfX = 0;
    let shelfY = MAT_HEAD;
    let shelfH = 0;
    for (const group of GROUP_ORDER) {
      const groupItems = mine.filter((i) => i.group === group);
      if (groupItems.length === 0) continue;
      const cols = subCols(groupItems);
      const { cells, rows } = pack(groupItems, cols);
      const w = cols * SQ;
      const h = SUB_HEAD + rows * SQ;
      if (shelfX > 0 && shelfX + MAT_PAD + w > MAT_COLS * SQ) {
        shelfY += shelfH + MAT_PAD;
        shelfX = 0;
        shelfH = 0;
      }
      const x = MAT_PAD + (shelfX === 0 ? 0 : shelfX + MAT_PAD);
      const placed: PlacedItem[] = groupItems.map((item, k) => ({
        ...item,
        x: cells[k].col * SQ,
        y: SUB_HEAD + cells[k].row * SQ,
        cw: GEOMETRY[item.kind].w * SQ,
        ch: SQ,
      }));
      subs.push({ id: `${step.id}:${group}`, group, x, y: shelfY, w, h, items: placed });
      shelfX = x - MAT_PAD + w;
      shelfH = Math.max(shelfH, h);
    }
    const h = shelfY + shelfH + MAT_PAD;
    return { id: step.id as JourneyId, index, label: step.label, x: 0, y: 0, w: matW, h, subs, count: mine.length };
  });

  // Rows of mats in journey order, top-aligned; each mat is as long as its content (a phase with little on it is a
  // short mat, which is information too).
  const rows: Mat[][] = [];
  mats.forEach((m, i) => (rows[Math.floor(i / perRow)] ??= []).push(m));
  let y = MAT_GAP;
  for (const row of rows) {
    const rowH = Math.max(...row.map((m) => m.h));
    row.forEach((m, i) => {
      m.x = MAT_GAP + i * (matW + MAT_GAP);
      m.y = y;
    });
    y += rowH + MAT_GAP;
  }
  const width = MAT_GAP + Math.min(perRow, mats.length) * (matW + MAT_GAP);

  // World coordinates of every item (mat + sub-mat + cell), for fly-to and the actions.
  const placed: PlacedItem[] = mats.flatMap((m) => m.subs.flatMap((s) => s.items.map((it) => ({ ...it, x: m.x + s.x + it.x, y: m.y + s.y + it.y }))));
  return { mats, items: placed, width, height: y };
}

/** Finds an item by id, code or title words (en or es), for `desk.focusItem` / `desk.openItem`. */
export function findItem(items: DeskItem[], query: string): DeskItem | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return (
    items.find((i) => i.id.toLowerCase() === q) ??
    items.find((i) => i.code?.toLowerCase() === q) ??
    items.find((i) => i.title.en.toLowerCase() === q || i.title.es?.toLowerCase() === q) ??
    items.find((i) => i.title.en.toLowerCase().includes(q) || (i.title.es ?? '').toLowerCase().includes(q))
  );
}

/** Finds a journey phase by id, number (1-10) or label (en or es). */
export function findPhase(query: string): JourneyId | undefined {
  const q = query.trim().toLowerCase();
  const n = Number(q);
  const id = Number.isInteger(n) && n >= 1 && n <= CLIENT_JOURNEY.length ? CLIENT_JOURNEY[n - 1].id : CLIENT_JOURNEY.find((s) => s.id === q || s.label.en.toLowerCase() === q || s.label.es?.toLowerCase() === q)?.id;
  return id && isJourney(id) ? id : undefined;
}
