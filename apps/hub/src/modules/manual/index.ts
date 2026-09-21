import { createElement } from 'react';
import { SERVICES, type ServiceCode } from '../../domain';
import type { RouteDef } from '../../specs/PageSpec';
import { ManualCommercialPage } from './ManualCommercialPage';
import { ManualGovernancePage } from './ManualGovernancePage';
import { ManualOverviewPage } from './ManualOverviewPage';
import { ManualServicePage } from './ManualServicePage';
import { commercialSpec, governanceSpec, overviewSpec, serviceSpec } from './specs';

export { strings } from './strings';

/** Page code -> playbook service, in ladder order (M-03 = 01, M-04 = 02, M-05 = 03, M-06 = E, M-07 = 04). */
const SERVICE_PAGES: { code: string; service: ServiceCode; order: number }[] = [
  { code: 'M-03', service: '01', order: 20 },
  { code: 'M-04', service: '02', order: 21 },
  { code: 'M-05', service: '03', order: 22 },
  { code: 'M-06', service: 'E', order: 23 },
  { code: 'M-07', service: '04', order: 24 },
];

const common = { surface: 'manual' as const, status: 'built' as const, permission: 'manual.read', shell: 'desktop' as const };

/**
 * The operations manual (M-01..M-08, prompt 0009): the founder's Service Delivery Playbook rendered from
 * `src/domain/playbook.ts`, never from a copy. Its own surface (`manual`, guarded by `manual.read`, which
 * every role holds) so the sidebar is the manual's table of contents. Each service is its own route, code
 * and page doc even though one component renders them all.
 */
export const routes: RouteDef[] = [
  {
    path: '/manual',
    code: overviewSpec.code,
    ...common,
    spec: overviewSpec,
    element: createElement(ManualOverviewPage),
    nav: { labelKey: 'manual.nav.overview', order: 0, glyph: '▤' },
  },
  {
    path: '/manual/commercial',
    code: commercialSpec.code,
    ...common,
    spec: commercialSpec,
    element: createElement(ManualCommercialPage),
    nav: { labelKey: 'manual.nav.commercial', order: 10, glyph: '◎' },
  },
  ...SERVICE_PAGES.map((page) => {
    const service = SERVICES.find((s) => s.code === page.service);
    if (!service) throw new Error(`[manual] no playbook service ${page.service}`);
    const spec = serviceSpec(page.code);
    return {
      path: `/manual/services/${service.slug}`,
      code: spec.code,
      ...common,
      spec,
      element: createElement(ManualServicePage, { code: service.code, pageCode: page.code }),
      nav: { labelKey: `manual.nav.service.${service.code}`, order: page.order, glyph: '◇' },
    } satisfies RouteDef;
  }),
  {
    path: '/manual/governance',
    code: governanceSpec.code,
    ...common,
    spec: governanceSpec,
    element: createElement(ManualGovernancePage),
    nav: { labelKey: 'manual.nav.governance', order: 30, glyph: '◉' },
  },
];
