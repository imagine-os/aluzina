import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { OpsHome } from './OpsHome';
import { homeSpec } from './specs';

export { strings } from './strings';

/**
 * ops portal (O-01, D-014). Stub until the module worker lands the real pages; the worker replaces
 * this file's routes and keeps the module contract (src/modules/README.md).
 */
export const routes: RouteDef[] = [
  {
    path: '/ops',
    code: homeSpec.code,
    surface: 'ops',
    status: 'stub',
    permission: homeSpec.actions[0]?.permission ?? 'projects.read',
    shell: 'desktop',
    spec: homeSpec,
    element: createElement(OpsHome),
    nav: { labelKey: 'ops.nav.home', order: 0, glyph: '◈' },
  },
];
