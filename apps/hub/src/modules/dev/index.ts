import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { ComponentsPage } from './ComponentsPage';
import { componentsSpec, specsSpec } from './specs';
import { SpecsPage } from './SpecsPage';

export { strings } from './strings';

/** Dev tools (D-xx): component library and page specs today; tokens, actions, plan viewer, canvas, simulator next. */
export const routes: RouteDef[] = [
  { path: '/dev/components', code: componentsSpec.code, surface: 'dev', status: 'built', permission: 'dev.tools', shell: 'desktop', spec: componentsSpec, element: createElement(ComponentsPage), nav: { labelKey: 'dev.nav.components', order: 0, glyph: '▦' } },
  { path: '/dev/specs', code: specsSpec.code, surface: 'dev', status: 'built', permission: 'dev.tools', shell: 'desktop', spec: specsSpec, element: createElement(SpecsPage), nav: { labelKey: 'dev.nav.specs', order: 1, glyph: '▤' } },
];
