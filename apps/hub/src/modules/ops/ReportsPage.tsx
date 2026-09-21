import { useMemo, useState } from 'react';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useTable } from '../../data/DataContext';
import type { Document as Doc } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { monthOf, outstanding, todayIso, useLookups } from './helpers';
import './ops.css';
import { reportsSpec } from './specs';

/** The last six months, newest first, as `YYYY-MM`. */
function lastMonths(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i += 1) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export function ReportsPage() {
  const { t, lang } = useT();
  const { projectName } = useLookups();
  const { rows: payments } = useTable('payments');
  const { rows: deliveries } = useTable('deliveries');
  const { rows: tasks } = useTable('tasks');
  const { rows: documents } = useTable('documents', { where: { kind: 'report' }, orderBy: 'title' });
  const months = useMemo(() => lastMonths(6), []);
  const [period, setPeriod] = useState(() => monthOf(todayIso()));

  const figures = useMemo(() => {
    const paidIn = payments.filter((p) => p.direction === 'in' && monthOf(p.paidDate) === period).reduce((n, p) => n + p.paidCop, 0);
    const paidOut = payments.filter((p) => p.direction === 'out' && monthOf(p.paidDate) === period).reduce((n, p) => n + p.paidCop, 0);
    const pending = payments.filter((p) => p.status !== 'paid' && monthOf(p.dueDate) === period).reduce((n, p) => n + outstanding(p), 0);
    const dueDeliveries = deliveries.filter((d) => monthOf(d.confirmedDate ?? d.expectedDate) === period).length;
    const tasksDone = tasks.filter((x) => x.status === 'done' && monthOf(x.dueDate) === period).length;
    return { paidIn, paidOut, pending, dueDeliveries, tasksDone };
  }, [payments, deliveries, tasks, period]);

  const periodLabel = formatDate(`${period}-01`, lang, { month: 'long', year: 'numeric' });

  return (
    <div className="ops-stack">
      <PageHeader
        code={reportsSpec.code}
        title={t('ops.reports.title')}
        subtitle={t('ops.reports.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.reports.title') }]}
        actions={
          <Placeholder what={t('ops.reports.exportWhat')}>
            <Button variant="primary">{t('ops.reports.export')}</Button>
          </Placeholder>
        }
      />

      <Select
        className="ops-filter-field"
        label={t('ops.reports.period')}
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        options={months.map((m) => ({ value: m, label: formatDate(`${m}-01`, lang, { month: 'long', year: 'numeric' }) }))}
      />

      <Card title={t('ops.reports.figures', { period: periodLabel })} padding="sm">
        <div className="ops-tiles">
          <StatTile glyph="◆" label={t('ops.reports.fig.in')} value={formatCop(figures.paidIn, lang)} tone="success" />
          <StatTile glyph="◇" label={t('ops.reports.fig.out')} value={formatCop(figures.paidOut, lang)} />
          <StatTile glyph="!" label={t('ops.reports.fig.pending')} value={formatCop(figures.pending, lang)} tone={figures.pending > 0 ? 'warning' : 'neutral'} />
          <StatTile glyph="▷" label={t('ops.reports.fig.deliveries')} value={figures.dueDeliveries} />
          <StatTile glyph="✓" label={t('ops.reports.fig.tasksDone')} value={figures.tasksDone} />
        </div>
        <p className="ops-note">{t('ops.reports.note')}</p>
        <div className="ops-row">
          <Placeholder what={t('ops.reports.buildWhat')}>
            <Button variant="primary">{t('ops.reports.build')}</Button>
          </Placeholder>
          <Placeholder what={t('ops.reports.sendWhat')}>
            <Button>{t('ops.reports.send')}</Button>
          </Placeholder>
        </div>
      </Card>

      <Card title={t('ops.reports.existing')} padding="sm">
        <DataTable<Doc>
          caption={t('ops.reports.existing')}
          rows={documents}
          rowKey={(d) => d.id}
          dense
          emptyTitle={t('ops.common.empty')}
          columns={[
            { key: 'title', header: t('ops.documents.col.title') },
            { key: 'projectId', header: t('ops.common.project'), render: (d) => projectName(d.projectId) ?? t('ops.common.internal') },
            { key: 'version', header: t('ops.documents.col.version'), align: 'end', render: (d) => `v${d.version}` },
            { key: 'status', header: t('ops.common.status'), render: (d) => <StatusPill status={d.status} /> },
          ]}
        />
      </Card>
    </div>
  );
}
