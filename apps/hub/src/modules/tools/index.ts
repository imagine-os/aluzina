import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { CanvasPage } from './CanvasPage';
import { PlanPage } from './PlanPage';
import { SimulatorPage } from './SimulatorPage';
import { canvasSpec, planSpec, simulatorSpec } from './specs';

export { strings } from './strings';

/** Builder tools (D-05 plan viewer, D-07 canvas, D-08 demo simulator): the PM and demo surface of the hub. */
export const routes: RouteDef[] = [
  { path: '/dev/plan', code: planSpec.code, surface: 'dev', status: 'built', permission: 'dev.tools', shell: 'desktop', spec: planSpec, element: createElement(PlanPage), nav: { labelKey: 'tools.nav.plan', order: 20, glyph: '◱' } },
  { path: '/dev/canvas', code: canvasSpec.code, surface: 'dev', status: 'built', permission: 'dev.tools', shell: 'desktop', spec: canvasSpec, element: createElement(CanvasPage), nav: { labelKey: 'tools.nav.canvas', order: 21, glyph: '▦' } },
  { path: '/dev/simulator', code: simulatorSpec.code, surface: 'dev', status: 'built', permission: 'dev.tools', shell: 'desktop', spec: simulatorSpec, element: createElement(SimulatorPage), nav: { labelKey: 'tools.nav.simulator', order: 22, glyph: '▭' } },
];
