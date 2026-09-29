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
  type Text,
} from '../../tenant/domain';
import { TEMPLATES, type TemplateTask } from '../../tenant/domain/templates';
import type { DeskItem, DeskMatDef, ItemKind } from '../../desk/types';

/**
 * W-04 Method desk (prompt 0026, D-103): the playbook and the project template laid out as physical objects on a
 * desk. Pure data and geometry, no React. Nothing here is hand-placed: every item is derived from the domain data
 * (`tenant/domain/playbook.ts`, `tenant/domain/templates`), every position comes out of `layoutDesk()`. The only
 * hand-written tables are classifications (which journey phase a service phase, a status or a rule belongs to),
 * each with a fallback so new data still lands on the desk.
 */

export { GEOMETRY, SQ, MAT_COLS, type DeskItem, type DeskLayout, type ItemKind, type Mat, type OpenAt, type PlacedItem, type SubMat } from '../../desk/types';
export { findItem, layoutDesk } from '../../desk/layout';

/** The ten phases of the client journey (`CLIENT_JOURNEY`, p. 2); one mat each. */
export type JourneyId = 'lead' | 'diagnosis' | 'brief' | 'analysis' | 'concept' | 'development' | 'validation' | 'delivery' | 'closure' | 'follow-up';

/** `project` / `projectComms`: the followed project's sub-mats (its rows as light tiles; its messages), D-105. */
export type GroupId = 'services' | 'statuses' | 'forms' | 'procedures' | 'deliverables' | 'money' | 'communication' | 'rules' | 'team' | 'measures' | 'project' | 'projectComms';
/** Sub-mat order inside a mat (only groups with items are rendered); the project's sub-mats come last, above the person. */
export const GROUP_ORDER: readonly GroupId[] = ['services', 'statuses', 'forms', 'procedures', 'deliverables', 'money', 'communication', 'rules', 'team', 'measures', 'project', 'projectComms'];

export type ItemSource = 'playbook' | 'template' | 'statusSet' | 'project';

/** A playbook object: the engine's `DeskItem` with W-04's own mat, group and source vocabularies. */
export interface PlaybookItem extends DeskItem {
  phase: JourneyId;
  group: GroupId;
  source: ItemSource;
}

/** The journey mats in order (the model's `mats`; labels are the playbook's own). */
export const JOURNEY_MATS: DeskMatDef[] = CLIENT_JOURNEY.map((step) => ({ id: step.id, label: step.label }));

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

export const PIPELINE_STEP: Record<PipelineStatusId, JourneyId> = {
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
export function buildItems(): PlaybookItem[] {
  const items: PlaybookItem[] = [];
  const add = (item: PlaybookItem) => items.push(item);

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
    let sections: PlaybookItem['sections'];
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

/** Finds a journey phase by id, number (1-10) or label (en or es). */
export function findPhase(query: string): JourneyId | undefined {
  const q = query.trim().toLowerCase();
  const n = Number(q);
  const id = Number.isInteger(n) && n >= 1 && n <= CLIENT_JOURNEY.length ? CLIENT_JOURNEY[n - 1].id : CLIENT_JOURNEY.find((s) => s.id === q || s.label.en.toLowerCase() === q || s.label.es?.toLowerCase() === q)?.id;
  return id && isJourney(id) ? id : undefined;
}
