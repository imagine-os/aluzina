import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { StudioHome } from './StudioHome';
import { homeSpec } from './specs';

export { strings } from './strings';

/**
 * studio portal (S-01, D-014). Stub until the module worker lands the real pages; the worker replaces
 * this file's routes and keeps the module contract (src/modules/README.md).
 */
export const routes: RouteDef[] = [
  {
    path: '/studio',
    code: homeSpec.code,
    surface: 'studio',
    status: 'stub',
    permission: homeSpec.actions[0]?.permission ?? 'projects.read',
    shell: 'desktop',
    spec: homeSpec,
    element: createElement(StudioHome),
    nav: { labelKey: 'studio.nav.home', order: 0, glyph: '◈' },
  },
];
