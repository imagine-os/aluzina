import { createElement } from 'react';
import type { RouteDeskOverride, RouteDef, Surface } from '../../specs/PageSpec';
import { DeskPage } from './DeskPage';
import { playbookDeskModel } from './playbookDesk';
import { deskSpec } from './specs';

export { strings } from './strings';

/**
 * W-04 Method desk (prompt 0026, changelog 0033, D-103): the same page on the four portals (with the guard `work`
 * uses per surface, D-021) and on dev. Nav order 7 puts it right after Work (5) and Spaces (6).
 */
const SURFACES: { surface: Surface; permission: string }[] = [
  { surface: 'founder', permission: 'projects.read' },
  { surface: 'ops', permission: 'tasks.manage' },
  { surface: 'studio', permission: 'tasks.own.write' },
  { surface: 'brand', permission: 'tasks.own.write' },
  { surface: 'dev', permission: 'dev.tools' },
];

export const routes: RouteDef[] = SURFACES.map(({ surface, permission }) => {
  const spec = deskSpec(surface, permission);
  return {
    path: `/${surface}/desk`,
    code: spec.code,
    surface,
    status: 'built',
    permission,
    shell: 'desktop',
    spec,
    element: createElement(DeskPage, { surface }),
    nav: { labelKey: 'desk.nav.desk', order: 7, glyph: '▦' },
  } satisfies RouteDef;
});

/**
 * The desk system's per-page override (D-106): W-04 is itself the full-page playbook desk, so the shell mounts no
 * page desk above it; `build` is the same playbook model for any host that wants it as a page desk.
 */
export const desk: Record<string, RouteDeskOverride> = {
  'W-04': { self: true, build: () => playbookDeskModel() },
};
