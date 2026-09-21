import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { BrandPage } from './BrandPage';
import { EffectsPage } from './EffectsPage';
import { applyStoredMetal } from './metal';
import { brandSpec, DESIGN_PERMISSION, effectsSpec, tokensSpec } from './specs';
import { TokensPage } from './TokensPage';

export { strings } from './strings';

/** The registry imports every module eagerly, so a stored gold / silver preview is re-applied on boot. */
applyStoredMetal();

/** Design system (D-12 brand, D-10 tokens, D-13 textures and effects): its own `design` surface, open to every role. */
export const routes: RouteDef[] = [
  { path: '/design', code: brandSpec.code, surface: 'design', status: 'built', permission: DESIGN_PERMISSION, shell: 'desktop', spec: brandSpec, element: createElement(BrandPage), nav: { labelKey: 'design.nav.brand', order: 0, glyph: '◈' } },
  { path: '/design/tokens', code: tokensSpec.code, surface: 'design', status: 'built', permission: DESIGN_PERMISSION, shell: 'desktop', spec: tokensSpec, element: createElement(TokensPage), nav: { labelKey: 'design.nav.tokens', order: 10, glyph: '◇' } },
  { path: '/design/effects', code: effectsSpec.code, surface: 'design', status: 'built', permission: DESIGN_PERMISSION, shell: 'desktop', spec: effectsSpec, element: createElement(EffectsPage), nav: { labelKey: 'design.nav.effects', order: 20, glyph: '✦' } },
];
