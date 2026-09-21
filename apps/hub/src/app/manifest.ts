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

export interface Manifest {
  routes: ManifestRoute[];
  version: string;
}

declare global {
  interface Window {
    __aluzina?: Manifest;
  }
}

/** Publishes the route manifest for tooling (screenshots, QA, /#/dev/specs, future WebMCP). Documented in docs/reference/surfaces.md. */
export function publishManifest(routes: RouteDef[]): Manifest {
  const manifest: Manifest = {
    routes: routes.map(({ path, code, surface, status, shell, permission, spec }) => ({ path, code, surface, status, shell, ...(permission ? { permission } : {}), spec })),
    version: __APP_VERSION__,
  };
  window.__aluzina = manifest;
  return manifest;
}
