import { createElement } from 'react';
import type { RouteDef, RouteDeskOverride, Surface } from '../../specs/PageSpec';
import type { DeskModel } from '../../desk/types';
import { ClientHubPage, lastLensModel } from './ClientHubPage';
import { CLIENT_HUBS } from './registry';
import { hubSpec } from './specs';

export { strings } from './strings';

/**
 * W-05 Client hub desk (prompt 0030): a client's whole hub (HOY today) laid on aluzina mats by role, on the four
 * portals with W-04's guards and on dev. One route per client hub in `CLIENT_HUBS`: `/<surface>/clients/<id>/hub`.
 * Nav order 8 puts it right after the Method desk (7).
 */
const SURFACES: { surface: Surface; permission: string }[] = [
  { surface: 'founder', permission: 'projects.read' },
  { surface: 'ops', permission: 'tasks.manage' },
  { surface: 'studio', permission: 'tasks.own.write' },
  { surface: 'brand', permission: 'tasks.own.write' },
  { surface: 'dev', permission: 'dev.tools' },
];

export const routes: RouteDef[] = Object.values(CLIENT_HUBS).flatMap((hub) =>
  SURFACES.map(({ surface, permission }) => {
    const spec = hubSpec(surface, permission);
    return {
      path: `/${surface}/clients/${hub.id}/hub`,
      code: spec.code,
      surface,
      status: 'built',
      permission,
      shell: 'desktop',
      spec,
      element: createElement(ClientHubPage, { surface, clientId: hub.id }),
      nav: surface === 'dev' ? undefined : { labelKey: 'clienthub.nav.hub', order: 8, glyph: '▣' },
    } satisfies RouteDef;
  }),
);

/**
 * W-05 is itself a desk (like W-04): the shell mounts no page desk above it. `build` hands any host that wants it as
 * a page desk the last lens model W-05 rendered (the map loads asynchronously; empty until then).
 */
export const desk: Record<string, RouteDeskOverride> = {
  'W-05': { self: true, build: (): DeskModel => lastLensModel() },
};
