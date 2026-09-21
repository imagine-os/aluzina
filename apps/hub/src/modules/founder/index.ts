import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { FounderHome } from './FounderHome';
import { homeSpec } from './specs';

export { strings } from './strings';

/**
 * founder portal (A-01, D-014). Stub until the module worker lands the real pages; the worker replaces
 * this file's routes and keeps the module contract (src/modules/README.md).
 */
export const routes: RouteDef[] = [
  {
    path: '/founder',
    code: homeSpec.code,
    surface: 'founder',
    status: 'stub',
    permission: homeSpec.actions[0]?.permission ?? 'projects.read',
    shell: 'desktop',
    spec: homeSpec,
    element: createElement(FounderHome),
    nav: { labelKey: 'founder.nav.home', order: 0, glyph: '◈' },
  },
];
