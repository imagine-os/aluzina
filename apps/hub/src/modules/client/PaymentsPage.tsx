import { useMemo } from 'react';
import { useRegisterAction } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { useTable } from '../../data/DataContext';
import type { Payment } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './client.css';
import { paymentsSpec } from './specs';
import { useMyProjects } from './useMyProjects';

/** C-05: what the client owes the studio, read only. Paying online waits for Stripe (D-035), so it is a Placeholder. */
export function PaymentsPage() {
  const { t, lang } = useT();
  const { byId, projectIds, loading } = useMyProjects();
  const { rows: payments, loading: loadingPayments } = useTable('payments', { where: { projectId: projectIds }, orderBy: 'dueDate' });

  // `direction: 'in'` only: what the studio owes its suppliers is never the client's business.
  const mine = useMemo(() => payments.filter((p) => p.direction === 'in'), [payments]);

  const totals = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let overdue = 0;
    for (const p of mine) {
      billed += p.amountCop;
      paid += p.paidCop;
      if (p.status === 'overdue') overdue += 1;
    }
    return { billed, paid, pending: Math.max(0, billed - paid), overdue };
  }, [mine]);

  // Declared so voice and WebMCP see it; it answers with the same "not wired yet" the button shows (P-09).
  useRegisterAction('client.payOnline', () => 'not wired yet: online payment arrives with Stripe (D-035)');

  const columns: Column<Payment>[] = [
    { key: 'concept', header: t('client.payments.col.concept'), sortable: true },
    { key: 'project', header: t('client.payments.col.project'), render: (row) => (row.projectId ? (byId.get(row.projectId)?.project.name ?? '—') : '—') },
    { key: 'dueDate', header: t('client.payments.col.due'), sortable: true, render: (row) => formatDate(row.dueDate, lang) },
    { key: 'amountCop', header: t('client.payments.col.amount'), align: 'end', sortable: true, render: (row) => formatCop(row.amountCop, lang) },
    {
      key: 'pending',
      header: t('client.payments.col.pending'),
      align: 'end',
      sortValue: (row) => Math.max(0, row.amountCop - row.paidCop),
      render: (row) => formatCop(Math.max(0, row.amountCop - row.paidCop), lang),
    },
    { key: 'status', header: t('client.payments.col.status'), render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="client-page">
      <PageHeader code={paymentsSpec.code} title={t('client.payments.title')} subtitle={t('client.payments.desc')} />

      <ul className="client-grid">
        <li>
          <StatTile label={t('client.payments.total.billed')} value={formatCop(totals.billed, lang)} glyph="▤" />
        </li>
        <li>
          <StatTile label={t('client.payments.total.paid')} value={formatCop(totals.paid, lang)} tone="success" glyph="✓" />
        </li>
        <li>
          <StatTile
            label={t('client.payments.total.pending')}
            value={formatCop(totals.pending, lang)}
            hint={t('client.payments.overdue', { n: totals.overdue })}
            tone={totals.overdue > 0 ? 'danger' : totals.pending > 0 ? 'warning' : 'success'}
            glyph="◆"
          />
        </li>
      </ul>

      <Card title={t('client.payments.title')}>
        <div className="client-stack">
          <DataTable
            columns={columns}
            rows={mine}
            rowKey={(row) => row.id}
            caption={t('client.payments.caption')}
            loading={loading || loadingPayments}
            emptyTitle={t('client.payments.empty')}
            emptyDescription={t('client.payments.emptyDesc')}
            initialSort={{ key: 'dueDate', dir: 'asc' }}
          />
          <div className="client-row">
            <Placeholder what={t('client.payments.payOnlineWhat')}>
              <Button variant="primary">{t('client.payments.payOnline')}</Button>
            </Placeholder>
          </div>
          <p className="client-note">{t('client.payments.readOnly')}</p>
        </div>
      </Card>
    </div>
  );
}
