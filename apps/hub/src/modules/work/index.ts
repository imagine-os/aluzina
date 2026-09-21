import { createElement } from 'react';
import type { RouteDef, Surface } from '../../specs/PageSpec';
import { NewProjectPage } from './NewProjectPage';
import { newProjectSpec, projectWorkSpec, workSpec } from './specs';
import { WorkPage } from './WorkPage';

export { strings } from './strings';

/**
 * Work (W-01) and project work (W-02) on every portal surface (prompt 0004, D-021). This module is the one
 * exception to "one surface per module": the same page mounts under /founder, /ops, /studio and /brand
 * with that portal's shell, guard and role default. Nav order 5 puts it right after each dashboard, so it
 * is the second item of the phone bottom nav.
 */
const SURFACES: { surface: Surface; permission: string }[] = [
  { surface: 'founder', permission: 'projects.read' },
  { surface: 'ops', permission: 'tasks.manage' },
  { surface: 'studio', permission: 'tasks.own.write' },
  { surface: 'brand', permission: 'tasks.own.write' },
];

/** W-03 creates projects, so it only mounts where someone may (`projects.write`: founder and ops, D-062). */
const NEW_PROJECT_SURFACES: Surface[] = ['founder', 'ops'];

export const routes: RouteDef[] = SURFACES.flatMap(({ surface, permission }) => {
  const list = workSpec(surface);
  const project = projectWorkSpec(surface);
  return [
    { path: `/${surface}/work`, code: list.code, surface, status: 'built', permission, shell: 'desktop', spec: list, element: createElement(WorkPage, { surface }), nav: { labelKey: 'work.nav.work', order: 5, glyph: '▥' } },
    { path: `/${surface}/work/:projectId`, code: project.code, surface, status: 'built', permission, shell: 'desktop', spec: project, element: createElement(WorkPage, { surface }) },
  ] satisfies RouteDef[];
}).concat(
  // `/work/new` is a static segment, so react-router ranks it above `/work/:projectId` (D-062).
  NEW_PROJECT_SURFACES.map((surface) => {
    const spec = newProjectSpec(surface);
    return { path: `/${surface}/work/new`, code: spec.code, surface, status: 'built', permission: 'projects.write', shell: 'desktop', spec, element: createElement(NewProjectPage, { surface }) } satisfies RouteDef;
  }),
);
