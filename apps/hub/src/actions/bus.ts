import type { ParamType, RouteDef } from '../specs/PageSpec';

/**
 * Actions bus (P-05, P-06, D-036): pages register a handler for each action they declare in `spec.actions`
 * while they are mounted (`useRegisterAction`), and anything (dev tools, voice, WebMCP, tests) runs an action
 * by id through `runAction`. The manifest publishes it as `window.__aluzina.actions = { run, list, declared }`.
 * Handlers take ids and values, never screen positions, and return something readable (P-06).
 */
export type ActionParams = Record<string, unknown>;
export type ActionHandler = (params: ActionParams) => unknown | Promise<unknown>;

export interface ActionResult {
  ok: boolean;
  /** Whatever the handler returned (undefined for void handlers). */
  result?: unknown;
  /** `not-live` when no page has registered the action, else the thrown error's message. */
  error?: string;
}

/** An action as declared in a page spec, flattened with the route that declares it (the WebMCP tool list). */
export interface DeclaredAction {
  id: string;
  code: string;
  path: string;
  label: string;
  intent: string;
  permission?: string;
  params?: Record<string, ParamType>;
}

const ACTION_ID = /^[a-z][a-z0-9]*\.[a-zA-Z][a-zA-Z0-9]*$/;

/** Most recently registered handler per id runs (a page mounted twice registers twice; unmount pops its own). */
const handlers = new Map<string, ActionHandler[]>();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((cb) => cb());
}

/** Registers `handler` for `id` and returns the unsubscribe. Throws on a malformed id so a typo fails in dev, not in voice. */
export function registerAction(id: string, handler: ActionHandler): () => void {
  if (!ACTION_ID.test(id)) throw new Error(`[actions] "${id}" is not an action id (<module>.<verb>)`);
  const stack = handlers.get(id) ?? [];
  stack.push(handler);
  handlers.set(id, stack);
  notify();
  return () => {
    const s = handlers.get(id);
    if (!s) return;
    const i = s.lastIndexOf(handler);
    if (i !== -1) s.splice(i, 1);
    if (s.length === 0) handlers.delete(id);
    notify();
  };
}

/** Runs the live handler for `id`; never throws (the result carries `ok` / `error`). */
export async function runAction(id: string, params: ActionParams = {}): Promise<ActionResult> {
  const stack = handlers.get(id);
  const handler = stack?.[stack.length - 1];
  if (!handler) return { ok: false, error: 'not-live' };
  try {
    const result = await handler(params);
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Ids that have a handler right now (the mounted pages' actions), sorted. */
export function listLiveActions(): string[] {
  return [...handlers.keys()].sort();
}

export function isActionLive(id: string): boolean {
  return handlers.has(id);
}

/** Fires whenever a handler is registered or removed (D-09 re-renders its "live" column from it). */
export function subscribeLiveActions(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Every declared action across the given routes, one row per (route, action). */
export function declaredActions(routes: RouteDef[]): DeclaredAction[] {
  return routes.flatMap((r) =>
    r.spec.actions.map((a) => ({
      id: a.id,
      code: r.code,
      path: r.path,
      label: a.label,
      intent: a.intent,
      ...(a.permission ? { permission: a.permission } : {}),
      ...(a.params ? { params: a.params } : {}),
    })),
  );
}

/** Distinct action ids across the routes with the codes that declare each (the vocabulary size). */
export function declaredActionIndex(routes: RouteDef[]): Map<string, DeclaredAction[]> {
  const index = new Map<string, DeclaredAction[]>();
  for (const a of declaredActions(routes)) {
    const list = index.get(a.id) ?? [];
    list.push(a);
    index.set(a.id, list);
  }
  return index;
}

/** Test seam: drops every handler (never call from pages). */
export function resetActions(): void {
  handlers.clear();
  notify();
}
