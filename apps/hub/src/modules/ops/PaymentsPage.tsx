import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Modal } from '../../components/organism/Modal/Modal';
import { useData, useTable } from '../../data/DataContext';
import type { Payment } from '../../data/schema';
import { daysUntil, formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueLabel, outstanding, todayIso, useLookups } from './helpers';
import './ops.css';
import { paymentsSpec } from './specs';

const STATUSES = ['due', 'overdue', 'partial', 'paid'];

/** A row is overdue when it still owes money and its due date has passed, whatever the stored status says. */
function isOverdue(p: Payment): boolean {
  return p.status !== 'paid' && daysUntil(p.dueDate) < 0;
}

export function PaymentsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { projectName } = useLookups();
  const { rows: payments, loading } = useTable('payments', { orderBy: 'dueDate' });
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState('');
  const [status, setStatus] = useState('');
  const [paying, setPaying] = useState<Payment | null>(null);
  const [amount, setAmount] = useState('');

  const openRows = useMemo(() => payments.filter((p) => p.status !== 'paid'), [payments]);
  const totalIn = openRows.filter((p) => p.direction === 'in').reduce((n, p) => n + outstanding(p), 0);
  const totalOut = openRows.filter((p) => p.direction === 'out').reduce((n, p) => n + outstanding(p), 0);
  const overdue = useMemo(() => openRows.filter(isOverdue), [openRows]);
  const overdueTotal = overdue.reduce((n, p) => n + outstanding(p), 0);

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        const text = `${p.counterparty} ${p.concept}`.toLowerCase();
        if (query && !text.includes(query.toLowerCase())) return false;
        if (direction && p.direction !== direction) return false;
        if (status === 'overdue' ? !isOverdue(p) : status && p.status !== status) return false;
        return true;
      }),
    [payments, query, direction, status],
  );

  const markPaid = async (p: Payment) => {
    await data.update('payments', p.id, { paidCop: p.amountCop, paidDate: todayIso(), status: 'paid' });
    toast(t('ops.payments.paid'));
  };
  const startRegister = (p: Payment) => {
    setPaying(p);
    setAmount(String(outstanding(p)));
  };
  const register = async () => {
    if (!paying) return;
    const add = Math.max(0, Number(amount) || 0);
    const paid = Math.min(paying.amountCop, paying.paidCop + add);
    const done = paid >= paying.amountCop;
    await data.update('payments', paying.id, {
      paidCop: paid,
      paidDate: done ? todayIso() : null,
      status: done ? 'paid' : paid > 0 ? 'partial' : paying.status,
    });
    setPaying(null);
    toast(done ? t('ops.payments.paid') : t('ops.payments.registered'));
  };

  const columns = [
    { key: 'counterparty', header: t('ops.payments.col.counterparty'), sortable: true },
    { key: 'concept', header: t('ops.payments.col.concept') },
    { key: 'projectId', header: t('ops.common.project'), render: (p: Payment) => projectName(p.projectId) ?? t('ops.common.internal') },
    { key: 'direction', header: t('ops.payments.col.direction'), render: (p: Payment) => t(`ops.payments.direction.${p.direction}`) },
    { key: 'amountCop', header: t('ops.common.amount'), sortable: true, align: 'end' as const, render: (p: Payment) => formatCop(p.amountCop, lang) },
    { key: 'outstanding', header: t('ops.payments.col.outstanding'), align: 'end' as const, sortValue: (p: Payment) => outstanding(p), sortable: true, render: (p: Payment) => formatCop(outstanding(p), lang) },
    { key: 'dueDate', header: t('ops.common.due'), sortable: true, render: (p: Payment) => `${formatDate(p.dueDate, lang)} · ${dueLabel(p.dueDate, t)}` },
    { key: 'status', header: t('ops.common.status'), render: (p: Payment) => <StatusPill status={isOverdue(p) ? 'overdue' : p.status} /> },
  ];

  const rowActions = can('payments.manage')
    ? [
        { id: 'paid', label: t('ops.payments.markPaid'), onClick: markPaid, variant: 'primary' as const, when: (p: Payment) => p.status !== 'paid' },
        { id: 'part', label: t('ops.payments.registerPart'), onClick: startRegister, when: (p: Payment) => p.status !== 'paid' },
      ]
    : undefined;

  return (
    <div className="ops-stack">
      <PageHeader
        code={paymentsSpec.code}
        title={t('ops.payments.title')}
        subtitle={t('ops.payments.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.payments.title') }]}
      />

      <div className="ops-tiles">
        <StatTile glyph="◆" label={t('ops.payments.tile.in')} value={formatCop(totalIn, lang)} hint={t('ops.common.count', { n: openRows.filter((p) => p.direction === 'in').length, total: openRows.length })} tone="accent" />
        <StatTile glyph="◇" label={t('ops.payments.tile.out')} value={formatCop(totalOut, lang)} hint={t('ops.common.count', { n: openRows.filter((p) => p.direction === 'out').length, total: openRows.length })} />
        <StatTile glyph="!" label={t('ops.payments.tile.overdue')} value={formatCop(overdueTotal, lang)} hint={String(overdue.length)} tone={overdue.length > 0 ? 'danger' : 'success'} />
        <StatTile glyph="▤" label={t('ops.payments.tile.balance')} value={formatCop(totalIn - totalOut, lang)} tone={totalIn - totalOut >= 0 ? 'success' : 'warning'} />
      </div>

      <Card title={t('ops.payments.overdueList')} padding="sm">
        <DataTable<Payment>
          caption={t('ops.payments.overdueList')}
          rows={overdue}
          rowKey={(p) => p.id}
          dense
          emptyTitle={t('ops.payments.noneOverdue')}
          columns={columns}
          rowActions={rowActions}
        />
      </Card>

      <FilterBar
        onClear={() => {
          setQuery('');
          setDirection('');
          setStatus('');
        }}
        summary={t('ops.common.count', { n: filtered.length, total: payments.length })}
      >
        <SearchField value={query} onChange={setQuery} />
        <Select
          className="ops-filter-field"
          label={t('ops.payments.col.direction')}
          hideLabel
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          options={[
            { value: '', label: t('ops.payments.allDirections') },
            { value: 'in', label: t('ops.payments.direction.in') },
            { value: 'out', label: t('ops.payments.direction.out') },
          ]}
        />
        <Select
          className="ops-filter-field"
          label={t('ops.common.status')}
          hideLabel
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[{ value: '', label: t('ops.common.allStatuses') }, ...STATUSES.map((s) => ({ value: s, label: t(`core.status.${s}`) }))]}
        />
      </FilterBar>

      <DataTable<Payment>
        caption={t('ops.payments.table')}
        rows={filtered}
        rowKey={(p) => p.id}
        loading={loading}
        emptyTitle={t('ops.payments.empty')}
        initialSort={{ key: 'dueDate', dir: 'asc' }}
        columns={columns}
        rowActions={rowActions}
      />

      <Modal
        open={paying !== null}
        onClose={() => setPaying(null)}
        title={t('ops.payments.registerTitle')}
        size="sm"
        footer={
          <>
            <Button variant="primary" onClick={register}>
              {t('ops.payments.registerSave')}
            </Button>
            <Button onClick={() => setPaying(null)}>{t('ops.common.close')}</Button>
          </>
        }
      >
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          label={t('ops.payments.partAmount')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          prefix="$"
          hint={paying ? `${paying.counterparty} · ${formatCop(outstanding(paying), lang)}` : undefined}
        />
      </Modal>
    </div>
  );
}
