import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { ExampleSetPage } from './ExampleSetPage';
import { exampleSetSpec } from './specs';

export { strings } from './strings';

/**
 * P-06 `/sets`: the client-facing view of a portfolio set assembled on S-12 (ar-14). Surface `public`,
 * shell `bare`, no permission — a client opens a link the studio sent and reads it, no login, no row.
 * No `nav` entry: the page is a link the studio hands out, not a section of the public site.
 */
export const routes: RouteDef[] = [
  {
    path: '/sets',
    code: exampleSetSpec.code,
    surface: 'public',
    status: 'built',
    shell: 'bare',
    spec: exampleSetSpec,
    element: createElement(ExampleSetPage),
  },
];
