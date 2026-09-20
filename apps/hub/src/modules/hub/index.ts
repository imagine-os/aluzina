import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { HubPage } from './HubPage';
import { hubSpec } from './specs';

export { strings } from './strings';

export const routes: RouteDef[] = [
  { path: '/', code: hubSpec.code, surface: 'hub', status: 'built', element: createElement(HubPage), spec: hubSpec },
];
