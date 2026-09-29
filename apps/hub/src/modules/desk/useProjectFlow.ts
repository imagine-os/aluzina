import { useMemo } from 'react';
import { useTable } from '../../data/DataContext';
import type { Row } from '../../data/provider';
import { FLOW_ENTITIES, type FlowRows } from './deskFlow';

const NONE = '__none__';

/**
 * The followed project's rows, live (D-023): one `useTable` per entity of the light layer, so a write in this tab or in
 * another one (a purchase marked paid on O-12) re-renders the desk from the provider's `subscribe` events. With no
 * project followed every query matches nothing. Alerts carry no `projectId`: they are the ones pointing at the project or
 * at one of its rows. `activity` is the provider's change log (one line per changed field) for the same rows.
 */
export function useProjectFlow(projectId: string | null) {
  const pid = projectId ?? NONE;
  const q = { where: { projectId: pid } };
  const leads = useTable('leads', q);
  const engagements = useTable('engagements', q);
  const meetings = useTable('meetings', q);
  const documents = useTable('documents', q);
  const quotes = useTable('quotes', q);
  const changeOrders = useTable('changeOrders', q);
  const revisionItems = useTable('revisionItems', q);
  const revisions = useTable('revisions', q);
  const purchases = useTable('purchases', q);
  const payments = useTable('payments', q);
  const deliveries = useTable('deliveries', q);
  const siteReports = useTable('siteReports', q);
  const messages = useTable('messages', q);
  const allAlerts = useTable('alerts', projectId ? undefined : { where: { entity: NONE } });
  const activity = useTable('activity', { where: { entity: projectId ? ['projects', ...FLOW_ENTITIES] : [NONE] } });
  const suppliers = useTable('suppliers');

  const rows = useMemo<FlowRows>(() => {
    const base = {
      leads: leads.rows,
      engagements: engagements.rows,
      meetings: meetings.rows,
      documents: documents.rows,
      quotes: quotes.rows,
      changeOrders: changeOrders.rows,
      revisionItems: revisionItems.rows,
      revisions: revisions.rows,
      purchases: purchases.rows,
      payments: payments.rows,
      deliveries: deliveries.rows,
      siteReports: siteReports.rows,
      messages: messages.rows,
    };
    const mine = new Set<string>([`projects:${pid}`]);
    for (const [entity, list] of Object.entries(base)) for (const r of list as { id: string }[]) mine.add(`${entity}:${r.id}`);
    const alerts = allAlerts.rows.filter((a) => mine.has(`${a.entity}:${a.entityId}`));
    return { ...base, alerts };
  }, [pid, leads.rows, engagements.rows, meetings.rows, documents.rows, quotes.rows, changeOrders.rows, revisionItems.rows, revisions.rows, purchases.rows, payments.rows, deliveries.rows, siteReports.rows, messages.rows, allAlerts.rows]);

  const projectActivity = useMemo<Row<'activity'>[]>(() => {
    const mine = new Set<string>([`projects:${pid}`]);
    for (const [entity, list] of Object.entries(rows)) for (const r of list as { id: string }[]) mine.add(`${entity}:${r.id}`);
    return activity.rows.filter((a) => mine.has(`${a.entity}:${a.entityId}`));
  }, [pid, rows, activity.rows]);

  return { rows, activity: projectActivity, suppliers: suppliers.rows };
}
