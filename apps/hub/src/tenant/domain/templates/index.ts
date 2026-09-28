import type { RoleId } from '../../auth/roles';
import type { Text } from '../playbook';
import { ALUZINA_WORKFLOW } from './aluzina-workflow';
import type { ProjectTemplate, TemplatePhase, TemplateTask, Zone } from './types';

export * from './types';
export { ALUZINA_WORKFLOW, TRADES, ZONES } from './aluzina-workflow';

/** Every project template the OS knows (one today, D-062). */
export const TEMPLATES: readonly ProjectTemplate[] = [ALUZINA_WORKFLOW];

export function templateById(id: string): ProjectTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Tasks in a subtree, the node itself included. */
export function subtreeSize(task: TemplateTask): number {
  return 1 + task.children.reduce((n, c) => n + subtreeSize(c), 0);
}

export interface TemplateCounts {
  phases: number;
  /** Tasks as written in the template (a zone-scoped subtree counts once). */
  tasks: number;
  /** Rows that would be created for the chosen zones. */
  generated: number;
  /** Template tasks that are generated once per zone. */
  zoneScoped: number;
  /** Distinct deliverable types the chosen phases produce. */
  deliverables: number;
  /** Distinct owner roles across the chosen phases. */
  owners: RoleId[];
}

/** Every task of a subtree with the owner role it inherits, the node itself included. */
function flatten(tasks: TemplateTask[], owner: RoleId): { task: TemplateTask; owner: RoleId }[] {
  return tasks.flatMap((task) => {
    const role = task.ownerRole ?? owner;
    return [{ task, owner: role }, ...flatten(task.children, role)];
  });
}

/** What the review step of W-03 shows for the chosen phases and zones. */
export function templateCounts(template: ProjectTemplate, phaseIds: string[], zoneCount: number): TemplateCounts {
  const zones = Math.max(1, zoneCount);
  const phases = template.phases.filter((p) => phaseIds.includes(p.id));
  const all = phases.flatMap((phase) => flatten(phase.tasks, phase.ownerRole));
  const owners = new Set<RoleId>(phases.map((p) => p.ownerRole));
  const deliverables = new Set<string>();
  let generated = 0;
  /** A zone-scoped root multiplies itself and its descendants; a descendant of one is already counted. */
  const insideZoneScoped = new Set<TemplateTask>();
  for (const { task } of all) {
    if (task.zoneScoped) for (const d of flatten(task.children, 'ops')) insideZoneScoped.add(d.task);
  }
  for (const { task, owner } of all) {
    owners.add(owner);
    if (task.deliverableId) deliverables.add(task.deliverableId);
    if (insideZoneScoped.has(task)) continue;
    generated += task.zoneScoped ? zones * subtreeSize(task) : 1;
  }
  return {
    phases: phases.length,
    tasks: all.length,
    generated,
    zoneScoped: all.filter(({ task }) => task.zoneScoped).length,
    deliverables: deliverables.size,
    owners: [...owners],
  };
}

/** One `tasks` row to create, with its place in the tree resolved to keys rather than ids. */
export interface ExpandedTask {
  /** Unique within one expansion; the creator maps it to the row id it gets. */
  key: string;
  parentKey: string | null;
  phaseId: string;
  templateTaskId: string;
  title: Text;
  ownerRole: RoleId;
  deliverableId: string | null;
  /** The zone this copy belongs to, for zone-scoped subtrees. */
  zoneId: string | null;
  /** Order among siblings. */
  order: number;
}

export interface ExpandedTemplate {
  phases: TemplatePhase[];
  tasks: ExpandedTask[];
}

/**
 * The rows W-03 creates: the chosen phases in template order, each task once, except a `zoneScoped`
 * subtree, which is cloned per chosen zone with the zone name appended to its root title. Parents always
 * come before their children, so the creator can map `parentKey` to the id it has just written.
 */
export function expandTemplate(template: ProjectTemplate, opts: { phaseIds: string[]; zones: Zone[] }): ExpandedTemplate {
  const phases = template.phases.filter((p) => opts.phaseIds.includes(p.id));
  const tasks: ExpandedTask[] = [];
  const zones: (Zone | null)[] = opts.zones.length > 0 ? opts.zones : [null];

  /** Appends the zone to a title only on the root of a cloned subtree. */
  const titleOf = (task: TemplateTask, zone: Zone | null): Text =>
    zone ? { en: `${task.title.en} — ${zone.name.en}`, es: `${task.title.es ?? task.title.en} — ${zone.name.es ?? zone.name.en}` } : task.title;

  const walk = (list: TemplateTask[], phaseId: string, parentKey: string | null, owner: RoleId, prefix: string, zone: Zone | null) => {
    let order = 0;
    for (const task of list) {
      const role = task.ownerRole ?? owner;
      // A zone-scoped task becomes one copy per zone, each carrying its whole subtree.
      const copies: (Zone | null)[] = task.zoneScoped && !zone ? zones : [zone];
      for (const copy of copies) {
        const key = `${copy ? `${copy.id}:` : prefix}${task.id}`;
        tasks.push({ key, parentKey, phaseId, templateTaskId: task.id, title: titleOf(task, task.zoneScoped ? copy : null), ownerRole: role, deliverableId: task.deliverableId, zoneId: copy?.id ?? null, order: order++ });
        walk(task.children, phaseId, key, role, copy ? `${copy.id}:` : prefix, copy);
      }
    }
  };

  for (const phase of phases) walk(phase.tasks, phase.id, null, phase.ownerRole, '', null);
  return { phases, tasks };
}
