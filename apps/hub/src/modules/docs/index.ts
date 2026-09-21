import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { DocsPage } from './DocsPage';
import { docsSpec, documentSpec } from './specs';

export { strings } from './strings';

const common = { surface: 'docs' as const, status: 'built' as const, permission: 'docs.read', shell: 'desktop' as const };

/**
 * In-app documentation (build plan step 5, D-06): the repo's `docs/` tree rendered inside the product so
 * the memory an agent reads is the memory the studio reads. `/docs` opens the start-here map; `/docs/*`
 * (D-15) gives every document its own URL.
 */
export const routes: RouteDef[] = [
  {
    path: '/docs',
    code: docsSpec.code,
    ...common,
    spec: docsSpec,
    element: createElement(DocsPage, { code: docsSpec.code }),
    nav: { labelKey: 'docs.nav.docs', order: 0, glyph: '▤' },
  },
  {
    path: '/docs/*',
    code: documentSpec.code,
    ...common,
    spec: documentSpec,
    element: createElement(DocsPage, { code: documentSpec.code }),
  },
];
