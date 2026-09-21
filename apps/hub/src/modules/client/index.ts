import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { ApprovalsPage } from './ApprovalsPage';
import { BriefPage } from './BriefPage';
import { ClientHome } from './ClientHome';
import { MessagesPage } from './MessagesPage';
import { PaymentsPage } from './PaymentsPage';
import { ProjectPage } from './ProjectPage';
import { approvalsSpec, briefSpec, homeSpec, messagesSpec, paymentsSpec, projectSpec } from './specs';

export { strings } from './strings';

/**
 * The client app (C-01..C-06, surface `client`, PhoneShell): the customer-facing half of the playbook.
 * Its whole data scope is `projects.clientUserId === session user` (`useMyProjects`); the nav order below
 * is what the phone bottom nav shows (the first five routes of the surface).
 */
export const routes: RouteDef[] = [
  {
    path: '/client',
    code: homeSpec.code,
    surface: 'client',
    status: 'built',
    permission: 'own.projects.read',
    shell: 'phone',
    spec: homeSpec,
    element: createElement(ClientHome),
    nav: { labelKey: 'client.nav.home', order: 0, glyph: '◈' },
  },
  {
    path: '/client/approvals',
    code: approvalsSpec.code,
    surface: 'client',
    status: 'built',
    permission: 'own.projects.read',
    shell: 'phone',
    spec: approvalsSpec,
    element: createElement(ApprovalsPage),
    nav: { labelKey: 'client.nav.approvals', order: 10, glyph: '✓' },
  },
  {
    path: '/client/messages',
    code: messagesSpec.code,
    surface: 'client',
    status: 'built',
    permission: 'own.projects.read',
    shell: 'phone',
    spec: messagesSpec,
    element: createElement(MessagesPage),
    nav: { labelKey: 'client.nav.messages', order: 20, glyph: '✉' },
  },
  {
    path: '/client/payments',
    code: paymentsSpec.code,
    surface: 'client',
    status: 'built',
    permission: 'own.payments.read',
    shell: 'phone',
    spec: paymentsSpec,
    element: createElement(PaymentsPage),
    nav: { labelKey: 'client.nav.payments', order: 30, glyph: '◆' },
  },
  {
    path: '/client/brief',
    code: briefSpec.code,
    surface: 'client',
    status: 'built',
    permission: 'own.projects.read',
    shell: 'phone',
    spec: briefSpec,
    element: createElement(BriefPage),
    nav: { labelKey: 'client.nav.brief', order: 40, glyph: '✎' },
  },
  {
    path: '/client/projects/:projectId',
    code: projectSpec.code,
    surface: 'client',
    status: 'built',
    permission: 'own.projects.read',
    shell: 'phone',
    spec: projectSpec,
    element: createElement(ProjectPage),
  },
];
