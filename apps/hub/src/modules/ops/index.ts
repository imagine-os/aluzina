import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { AlertsPage } from './AlertsPage';
import { DeliveriesPage } from './DeliveriesPage';
import { DocumentsPage } from './DocumentsPage';
import { OpsHome } from './OpsHome';
import { PaymentsPage } from './PaymentsPage';
import { QuotesPage } from './QuotesPage';
import { ReportsPage } from './ReportsPage';
import { SchedulePage } from './SchedulePage';
import { SuppliersPage } from './SuppliersPage';
import { TasksPage } from './TasksPage';
import { alertsSpec, deliveriesSpec, documentsSpec, homeSpec, paymentsSpec, quotesSpec, reportsSpec, scheduleSpec, suppliersSpec, tasksSpec } from './specs';

export { strings } from './strings';

/**
 * Operations portal (O-01..O-10, D-014): Miguel's part of the system, one page per line of his
 * roster in `docs/knowledge/team.md`. The first four `nav.order` values are the phone bottom nav.
 */
export const routes: RouteDef[] = [
  {
    path: '/ops',
    code: homeSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'schedule.manage',
    shell: 'desktop',
    spec: homeSpec,
    element: createElement(OpsHome),
    nav: { labelKey: 'ops.nav.home', order: 0, glyph: '◈' },
  },
  {
    path: '/ops/tasks',
    code: tasksSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'tasks.manage',
    shell: 'desktop',
    spec: tasksSpec,
    element: createElement(TasksPage),
    nav: { labelKey: 'ops.nav.tasks', order: 10, glyph: '▤' },
  },
  {
    path: '/ops/schedule',
    code: scheduleSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'schedule.manage',
    shell: 'desktop',
    spec: scheduleSpec,
    element: createElement(SchedulePage),
    nav: { labelKey: 'ops.nav.schedule', order: 20, glyph: '▦' },
  },
  {
    path: '/ops/alerts',
    code: alertsSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'alerts.manage',
    shell: 'desktop',
    spec: alertsSpec,
    element: createElement(AlertsPage),
    nav: { labelKey: 'ops.nav.alerts', order: 30, glyph: '!' },
  },
  {
    path: '/ops/suppliers',
    code: suppliersSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'suppliers.manage',
    shell: 'desktop',
    spec: suppliersSpec,
    element: createElement(SuppliersPage),
    nav: { labelKey: 'ops.nav.suppliers', order: 40, glyph: '☷' },
  },
  {
    path: '/ops/quotes',
    code: quotesSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'quotes.compare',
    shell: 'desktop',
    spec: quotesSpec,
    element: createElement(QuotesPage),
    nav: { labelKey: 'ops.nav.quotes', order: 50, glyph: '◇' },
  },
  {
    path: '/ops/deliveries',
    code: deliveriesSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'deliveries.manage',
    shell: 'desktop',
    spec: deliveriesSpec,
    element: createElement(DeliveriesPage),
    nav: { labelKey: 'ops.nav.deliveries', order: 60, glyph: '▷' },
  },
  {
    path: '/ops/payments',
    code: paymentsSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'payments.manage',
    shell: 'desktop',
    spec: paymentsSpec,
    element: createElement(PaymentsPage),
    nav: { labelKey: 'ops.nav.payments', order: 70, glyph: '◆' },
  },
  {
    path: '/ops/documents',
    code: documentsSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'documents.manage',
    shell: 'desktop',
    spec: documentsSpec,
    element: createElement(DocumentsPage),
    nav: { labelKey: 'ops.nav.documents', order: 80, glyph: '▣' },
  },
  {
    path: '/ops/reports',
    code: reportsSpec.code,
    surface: 'ops',
    status: 'built',
    permission: 'reports.write',
    shell: 'desktop',
    spec: reportsSpec,
    element: createElement(ReportsPage),
    nav: { labelKey: 'ops.nav.reports', order: 90, glyph: '✓' },
  },
];
