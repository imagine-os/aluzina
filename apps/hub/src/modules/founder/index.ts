import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { ApprovalsPage } from './ApprovalsPage';
import { ArchiveReviewPage } from './ArchiveReviewPage';
import { ClientsPage } from './ClientsPage';
import { FounderHome } from './FounderHome';
import { LeadsPage } from './LeadsPage';
import { PipelinePage } from './PipelinePage';
import { ProductsPage } from './ProductsPage';
import { ProposalsPage } from './ProposalsPage';
import { approvalsSpec, archiveReviewSpec, clientsSpec, homeSpec, leadsSpec, pipelineSpec, productsSpec, proposalsSpec, teamSpec } from './specs';
import { TeamPage } from './TeamPage';

export { strings } from './strings';

/**
 * Founder portal, Alejandra Guerra's point of view (A-01..A-07, D-014).
 * Her roster in `docs/knowledge/team.md` maps to the pages: final approval -> A-02, creative direction and
 * sales pipeline -> A-03 and the leads CRM -> A-08, quotes, graphic proposals and project PDFs -> A-04, product development and
 * partnerships -> A-05, client relations and negotiations -> A-06, the team and her own list -> A-07.
 */
export const routes: RouteDef[] = [
  {
    path: '/founder',
    code: homeSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'projects.approve',
    shell: 'desktop',
    spec: homeSpec,
    element: createElement(FounderHome),
    nav: { labelKey: 'founder.nav.home', order: 0, glyph: '◈' },
  },
  {
    path: '/founder/approvals',
    code: approvalsSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'projects.approve',
    shell: 'desktop',
    spec: approvalsSpec,
    element: createElement(ApprovalsPage),
    nav: { labelKey: 'founder.nav.approvals', order: 10, glyph: '✓' },
  },
  {
    path: '/founder/pipeline',
    code: pipelineSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'projects.read',
    shell: 'desktop',
    spec: pipelineSpec,
    element: createElement(PipelinePage),
    nav: { labelKey: 'founder.nav.pipeline', order: 20, glyph: '▤' },
  },
  {
    path: '/founder/leads',
    code: leadsSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'leads.manage',
    shell: 'desktop',
    spec: leadsSpec,
    element: createElement(LeadsPage),
    nav: { labelKey: 'founder.nav.leads', order: 15, glyph: '◦' },
  },
  {
    path: '/founder/proposals',
    code: proposalsSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'quotes.review',
    shell: 'desktop',
    spec: proposalsSpec,
    element: createElement(ProposalsPage),
    nav: { labelKey: 'founder.nav.proposals', order: 30, glyph: '▦' },
  },
  {
    path: '/founder/products',
    code: productsSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'products.write',
    shell: 'desktop',
    spec: productsSpec,
    element: createElement(ProductsPage),
    nav: { labelKey: 'founder.nav.products', order: 40, glyph: '◇' },
  },
  {
    path: '/founder/clients',
    code: clientsSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'projects.read',
    shell: 'desktop',
    spec: clientsSpec,
    element: createElement(ClientsPage),
    nav: { labelKey: 'founder.nav.clients', order: 50, glyph: '◆' },
  },
  {
    path: '/founder/team',
    code: teamSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'projects.read',
    shell: 'desktop',
    spec: teamSpec,
    element: createElement(TeamPage),
    nav: { labelKey: 'founder.nav.team', order: 60, glyph: '☷' },
  },
  {
    path: '/founder/archive-review',
    code: archiveReviewSpec.code,
    surface: 'founder',
    status: 'built',
    permission: 'projects.write',
    shell: 'desktop',
    spec: archiveReviewSpec,
    element: createElement(ArchiveReviewPage),
    nav: { labelKey: 'founder.nav.archiveReview', order: 12, glyph: '✓' },
  },
];
