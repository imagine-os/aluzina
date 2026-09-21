import { type ActionParams, type ActionResult, type DeclaredAction, declaredActions, listLiveActions, runAction } from '../actions/bus';
import type { PageSpec, RouteDef, RouteStatus, ShellKind, Surface } from '../specs/PageSpec';

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

declare global {
  interface Window {
    __aluzina?: Manifest;
  }
}

/** Publishes the route manifest and the actions bus for tooling (screenshots, QA, /#/dev/specs, WebMCP / voice through `actions.run`). Documented in docs/reference/surfaces.md. */
export function publishManifest(routes: RouteDef[]): Manifest {
  const manifest: Manifest = {
    routes: routes.map(({ path, code, surface, status, shell, permission, spec }) => ({ path, code, surface, status, shell, ...(permission ? { permission } : {}), spec })),
    version: __APP_VERSION__,
    actions: { run: runAction, list: listLiveActions, declared: declaredActions(routes) },
  };
  window.__aluzina = manifest;
  return manifest;
}
