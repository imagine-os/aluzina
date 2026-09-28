import { type ActionParams, type ActionResult, type DeclaredAction, declaredActions, listLiveActions, runAction } from '../actions/bus';
import type { PageSpec, RouteDef, RouteStatus, ShellKind, Surface } from '../specs/PageSpec';
import { GLOBAL_NAME } from '../tenant/config';

export interface ManifestRoute {
  path: string;
  code: string;
  surface: Surface;
  status: RouteStatus;
  shell: ShellKind;
  permission?: string;
  spec: PageSpec;
}

/** The WebMCP seam (D-036): `run(id, params)` drives a mounted page, `list()` says which actions are live, `declared` is the whole vocabulary. */
export interface ManifestActions {
  run(id: string, params?: ActionParams): Promise<ActionResult>;
  list(): string[];
  declared: DeclaredAction[];
}

export interface Manifest {
  routes: ManifestRoute[];
  version: string;
  actions: ManifestActions;
}

/**
 * The window global is `__${TENANT.id}` (D-090): `window.__aluzina` for this tenant, the same name as before tp-02, so the
 * screenshots script, D-03 / D-09 and any outside driver keep working. It is set by name (not a typed `Window` member) because
 * the name is data from `tenant.json`; `readManifest()` is the typed accessor for code that wants it.
 */
type ManifestHost = Record<string, Manifest | undefined>;

/** Reads the published manifest back from the window global (`window[GLOBAL_NAME]`), or `undefined` before `publishManifest` ran. */
export function readManifest(): Manifest | undefined {
  return typeof window === 'undefined' ? undefined : (window as unknown as ManifestHost)[GLOBAL_NAME];
}

/** Publishes the route manifest and the actions bus for tooling (screenshots, QA, /#/dev/specs, WebMCP / voice through `actions.run`). Documented in docs/reference/surfaces.md. */
export function publishManifest(routes: RouteDef[]): Manifest {
  const manifest: Manifest = {
    routes: routes.map(({ path, code, surface, status, shell, permission, spec }) => ({ path, code, surface, status, shell, ...(permission ? { permission } : {}), spec })),
    version: __APP_VERSION__,
    actions: { run: runAction, list: listLiveActions, declared: declaredActions(routes) },
  };
  (window as unknown as ManifestHost)[GLOBAL_NAME] = manifest;
  return manifest;
}
