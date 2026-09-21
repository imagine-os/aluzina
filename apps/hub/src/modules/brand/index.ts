import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { BrandHome } from './BrandHome';
import { homeSpec } from './specs';

export { strings } from './strings';

/**
 * brand portal (G-01, D-014). Stub until the module worker lands the real pages; the worker replaces
 * this file's routes and keeps the module contract (src/modules/README.md).
 */
export const routes: RouteDef[] = [
  {
    path: '/brand',
    code: homeSpec.code,
    surface: 'brand',
    status: 'stub',
    permission: homeSpec.actions[0]?.permission ?? 'projects.read',
    shell: 'desktop',
    spec: homeSpec,
    element: createElement(BrandHome),
    nav: { labelKey: 'brand.nav.home', order: 0, glyph: '◈' },
  },
];
