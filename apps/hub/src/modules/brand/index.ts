import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { AssetsPage } from './AssetsPage';
import { BrandHome } from './BrandHome';
import { CompetitionsPage } from './CompetitionsPage';
import { IdentityPage } from './IdentityPage';
import { ImagesPage } from './ImagesPage';
import { PresentationsPage } from './PresentationsPage';
import { RevisionsPage } from './RevisionsPage';
import { assetsSpec, competitionsSpec, homeSpec, identitySpec, imagesSpec, presentationsSpec, revisionsSpec } from './specs';

export { strings } from './strings';

/**
 * Brand and communication portal (G-01..G-07, D-014): Angélica's view of the system
 * (docs/knowledge/team.md, docs/knowledge/roles-and-portals.md). Nav order 0/10/20/30 are the four
 * bottom-nav entries under 768 px; the rest live in the "More" drawer.
 */
export const routes: RouteDef[] = [
  {
    path: '/brand',
    code: homeSpec.code,
    surface: 'brand',
    status: 'built',
    permission: 'brand.manage',
    shell: 'desktop',
    spec: homeSpec,
    element: createElement(BrandHome),
    nav: { labelKey: 'brand.nav.home', order: 0, glyph: '◈' },
  },
  {
    path: '/brand/competitions',
    code: competitionsSpec.code,
    surface: 'brand',
    status: 'built',
    permission: 'competitions.manage',
    shell: 'desktop',
    spec: competitionsSpec,
    element: createElement(CompetitionsPage),
    nav: { labelKey: 'brand.nav.competitions', order: 10, glyph: '◆' },
  },
  {
    path: '/brand/presentations',
    code: presentationsSpec.code,
    surface: 'brand',
    status: 'built',
    permission: 'presentations.write',
    shell: 'desktop',
    spec: presentationsSpec,
    element: createElement(PresentationsPage),
    nav: { labelKey: 'brand.nav.presentations', order: 20, glyph: '▤' },
  },
  {
    path: '/brand/identity',
    code: identitySpec.code,
    surface: 'brand',
    status: 'built',
    permission: 'brand.manage',
    shell: 'desktop',
    spec: identitySpec,
    element: createElement(IdentityPage),
    nav: { labelKey: 'brand.nav.identity', order: 30, glyph: '▣' },
  },
  {
    path: '/brand/images',
    code: imagesSpec.code,
    surface: 'brand',
    status: 'built',
    permission: 'images.write',
    shell: 'desktop',
    spec: imagesSpec,
    element: createElement(ImagesPage),
    nav: { labelKey: 'brand.nav.images', order: 40, glyph: '▦' },
  },
  {
    path: '/brand/revisions',
    code: revisionsSpec.code,
    surface: 'brand',
    status: 'built',
    permission: 'revisions.manage',
    shell: 'desktop',
    spec: revisionsSpec,
    element: createElement(RevisionsPage),
    nav: { labelKey: 'brand.nav.revisions', order: 50, glyph: '▷' },
  },
  {
    path: '/brand/assets',
    code: assetsSpec.code,
    surface: 'brand',
    status: 'built',
    permission: 'assets.manage',
    shell: 'desktop',
    spec: assetsSpec,
    element: createElement(AssetsPage),
    nav: { labelKey: 'brand.nav.assets', order: 60, glyph: '☷' },
  },
];
