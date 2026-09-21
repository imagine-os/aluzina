import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { MethodPage } from './MethodPage';
import { PortfolioPage } from './PortfolioPage';
import { ServiceDetailPage } from './ServiceDetailPage';
import { ServicesPage } from './ServicesPage';
import { StartPage } from './StartPage';
import { methodSpec, portfolioSpec, serviceDetailSpec, servicesSpec, startSpec } from './specs';

export { strings } from './strings';

/**
 * The public site inside the OS (D-035): services, one page per service, the intake flow and the method.
 * Surface `public`, shell `bare` (the module draws its own header and footer in `PublicLayout`) and no
 * `permission`: a visitor is never asked who they are.
 */
export const routes: RouteDef[] = [
  {
    path: '/services',
    code: servicesSpec.code,
    surface: 'public',
    status: 'built',
    shell: 'bare',
    spec: servicesSpec,
    element: createElement(ServicesPage),
    nav: { labelKey: 'public.nav.services', order: 0, glyph: '◈' },
  },
  {
    path: '/services/:slug',
    code: serviceDetailSpec.code,
    surface: 'public',
    status: 'built',
    shell: 'bare',
    spec: serviceDetailSpec,
    element: createElement(ServiceDetailPage),
  },
  {
    path: '/start',
    code: startSpec.code,
    surface: 'public',
    status: 'built',
    shell: 'bare',
    spec: startSpec,
    element: createElement(StartPage),
    nav: { labelKey: 'public.nav.start', order: 10, glyph: '✦' },
  },
  {
    path: '/method',
    code: methodSpec.code,
    surface: 'public',
    status: 'built',
    shell: 'bare',
    spec: methodSpec,
    element: createElement(MethodPage),
    nav: { labelKey: 'public.nav.method', order: 20, glyph: '◇' },
  },
  {
    path: '/portfolio',
    code: portfolioSpec.code,
    surface: 'public',
    status: 'built',
    shell: 'bare',
    spec: portfolioSpec,
    element: createElement(PortfolioPage),
    nav: { labelKey: 'public.nav.portfolio', order: 15, glyph: '▩' },
  },
];
