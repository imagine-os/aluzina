import raw from '@docs/plan/plan.json';

/**
 * The machine-readable development plan (D-037): `docs/plan/plan.json`, imported through the `@docs` alias
 * (vite.config.ts + tsconfig paths). The PM viewer (D-05) renders it as kanban / list / timeline with
 * dependencies; `build-plan.md` and `kanban.md` are the human view and must agree with it.
 */
export type PlanStatus = 'done' | 'doing' | 'next' | 'backlog';
export const PLAN_STATUSES: readonly PlanStatus[] = ['done', 'doing', 'next', 'backlog'];

export interface PlanTask {
  id: string;
  title: string;
  /** Build-plan step ("0", "9a", "13"), roadmap phase ("R2") or the step a kanban card belongs to. */
  step: string;
  status: PlanStatus;
  /** Model(s) doing the work, as the docs convention names them. */
  model: string;
  codes: string[];
  dependsOn: string[];
  /** Module worker / owner of a pass task, when assigned. */
  owner?: string;
  /** Changelog number for done tasks. */
  changelog?: string;
}

export interface Plan {
  version: string;
  updatedAt: string;
  source: string;
  tasks: PlanTask[];
}

export const PLAN: Plan = raw as Plan;

export function planTask(id: string): PlanTask | undefined {
  return PLAN.tasks.find((t) => t.id === id);
}

/** Dependencies of `id` that are not done yet (what blocks it). */
export function planBlockers(id: string): PlanTask[] {
  const task = planTask(id);
  return task ? task.dependsOn.map(planTask).filter((t): t is PlanTask => Boolean(t) && t!.status !== 'done') : [];
}

/** Tasks that depend on `id` (what it unblocks). */
export function planDependents(id: string): PlanTask[] {
  return PLAN.tasks.filter((t) => t.dependsOn.includes(id));
}

/**
 * Dependency order (Kahn): every task after everything it depends on, ties broken by the original order.
 * Cycles cannot happen in a plan bound by dependencies; if one slips in, the remaining tasks are appended.
 */
export function planOrder(tasks: PlanTask[] = PLAN.tasks): PlanTask[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const indeg = new Map(tasks.map((t) => [t.id, t.dependsOn.filter((d) => byId.has(d)).length]));
  const out: PlanTask[] = [];
  let ready = tasks.filter((t) => indeg.get(t.id) === 0);
  const seen = new Set<string>();
  while (ready.length) {
    const next: PlanTask[] = [];
    for (const t of ready) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
      for (const d of tasks) {
        if (!d.dependsOn.includes(t.id) || seen.has(d.id)) continue;
        const n = (indeg.get(d.id) ?? 0) - 1;
        indeg.set(d.id, n);
        if (n === 0) next.push(d);
      }
    }
    ready = next;
  }
  return out.concat(tasks.filter((t) => !seen.has(t.id)));
}

/** Depth in the dependency graph (0 = no dependencies): the column of a timeline without dates. */
export function planDepth(id: string, memo = new Map<string, number>()): number {
  const hit = memo.get(id);
  if (hit !== undefined) return hit;
  const task = planTask(id);
  if (!task || task.dependsOn.length === 0) {
    memo.set(id, 0);
    return 0;
  }
  memo.set(id, -1);
  const depth = 1 + Math.max(0, ...task.dependsOn.map((d) => (memo.get(d) === -1 ? 0 : planDepth(d, memo))));
  memo.set(id, depth);
  return depth;
}

export function planCounts(): Record<PlanStatus, number> {
  const counts: Record<PlanStatus, number> = { done: 0, doing: 0, next: 0, backlog: 0 };
  for (const t of PLAN.tasks) counts[t.status] += 1;
  return counts;
}
