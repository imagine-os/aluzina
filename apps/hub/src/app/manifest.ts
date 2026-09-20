import type { PageSpec, RouteDef, RouteStatus, Surface } from '../specs/PageSpec';

export interface ManifestRoute {
  path: string;
  code: string;
  surface: Surface;
  status: RouteStatus;
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

/** Publishes the route manifest for tooling (screenshots, QA, future WebMCP). Documented in docs/reference/surfaces.md. */
export function publishManifest(routes: RouteDef[]): Manifest {
  const manifest: Manifest = {
    routes: routes.map(({ path, code, surface, status, spec }) => ({ path, code, surface, status, spec })),
    version: __APP_VERSION__,
  };
  window.__aluzina = manifest;
  return manifest;
}
