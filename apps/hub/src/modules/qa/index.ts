import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { ActionsPage } from './ActionsPage';
import { actionsSpec, testingSpec, tokensSpec } from './specs';
import { TestingPage } from './TestingPage';
import { TokensPage } from './TokensPage';

export { strings } from './strings';

/**
 * QA and control-surface dev tools: D-09 the actions registry (the WebMCP surface as a page),
 * D-14 the design tokens, D-11 the testing hub (responsive matrix + spec checklist).
 */
export const routes: RouteDef[] = [
  { path: '/dev/actions', code: actionsSpec.code, surface: 'dev', status: 'built', permission: 'dev.tools', shell: 'desktop', spec: actionsSpec, element: createElement(ActionsPage), nav: { labelKey: 'qa.nav.actions', order: 30, glyph: '⌁' } },
  { path: '/dev/tokens', code: tokensSpec.code, surface: 'dev', status: 'built', permission: 'dev.tools', shell: 'desktop', spec: tokensSpec, element: createElement(TokensPage), nav: { labelKey: 'qa.nav.tokens', order: 31, glyph: '◐' } },
  { path: '/dev/testing', code: testingSpec.code, surface: 'dev', status: 'built', permission: 'dev.tools', shell: 'desktop', spec: testingSpec, element: createElement(TestingPage), nav: { labelKey: 'qa.nav.testing', order: 32, glyph: '⌗' } },
];
