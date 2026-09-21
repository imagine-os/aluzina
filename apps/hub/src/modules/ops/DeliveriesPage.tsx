import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Modal } from '../../components/organism/Modal/Modal';
import { useData, useTable } from '../../data/DataContext';
import type { Delivery } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueLabel, useLookups } from './helpers';
import './ops.css';
import { deliveriesSpec } from './specs';

const STATUSES = ['pending', 'confirmed', 'delivered', 'delayed'];

export function DeliveriesPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { projects, projectName, supplierName } = useLookups();
  const { rows: deliveries, loading } = useTable('deliveries', { orderBy: 'expectedDate' });
  const [query, setQuery] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const [confirming, setConfirming] = useState<Delivery | null>(null);
  const [date, setDate] = useState('');

  const filtered = useMemo(
    () =>
      deliveries.filter((d) => {
        const text = `${d.item} ${supplierName(d.supplierId) ?? ''}`.toLowerCase();
        if (query && !text.includes(query.toLowerCase())) return false;
        if (project && d.projectId !== project) return false;
        if (status && d.status !== status) return false;
        return true;
      }),
    [deliveries, query, project, status, supplierName],
  );

  const startConfirm = (d: Delivery) => {
    setConfirming(d);
    setDate(d.confirmedDate ?? d.expectedDate);
  };
  const saveConfirm = async () => {
    if (!confirming) return;
    await data.update('deliveries', confirming.id, { confirmedDate: date, status: 'confirmed' });
    setConfirming(null);
    toast(t('ops.deliveries.confirmed'));
  };
  const receive = async (d: Delivery) => {
    await data.update('deliveries', d.id, { status: 'delivered', confirmedDate: d.confirmedDate ?? d.expectedDate });
    toast(t('ops.common.saved'));
  };
  const delay = async (d: Delivery) => {
    await data.update('deliveries', d.id, { status: 'delayed', confirmedDate: null });
    toast(t('ops.common.saved'));
  };

  return (
    <div className="ops-stack">
      <PageHeader
        code={deliveriesSpec.code}
        title={t('ops.deliveries.title')}
        subtitle={t('ops.deliveries.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.deliveries.title') }]}
      />

      <FilterBar
        onClear={() => {
          setQuery('');
          setProject('');
          setStatus('');
        }}
        summary={t('ops.common.count', { n: filtered.length, total: deliveries.length })}
      >
        <SearchField value={query} onChange={setQuery} />
        <Select
          className="ops-filter-field"
          label={t('ops.common.project')}
          hideLabel
          value={project}
          onChange={(e) => setProject(e.target.value)}
          options={[{ value: '', label: t('ops.common.allProjects') }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
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

      <DataTable<Delivery>
        caption={t('ops.deliveries.table')}
        rows={filtered}
        rowKey={(d) => d.id}
        loading={loading}
        emptyTitle={t('ops.deliveries.empty')}
        initialSort={{ key: 'expectedDate', dir: 'asc' }}
        columns={[
          { key: 'item', header: t('ops.common.item') },
          { key: 'supplierId', header: t('ops.common.supplier'), render: (d) => supplierName(d.supplierId) },
          { key: 'projectId', header: t('ops.common.project'), render: (d) => projectName(d.projectId) ?? t('ops.common.internal') },
          { key: 'expectedDate', header: t('ops.deliveries.col.expected'), sortable: true, render: (d) => `${formatDate(d.expectedDate, lang)} · ${dueLabel(d.expectedDate, t)}` },
          { key: 'confirmedDate', header: t('ops.deliveries.col.confirmed'), render: (d) => formatDate(d.confirmedDate, lang) },
          { key: 'status', header: t('ops.common.status'), render: (d) => <StatusPill status={d.status} /> },
        ]}
        rowActions={
          can('deliveries.manage')
            ? [
                { id: 'confirm', label: t('ops.deliveries.confirm'), onClick: startConfirm, variant: 'primary' as const, when: (d: Delivery) => d.status !== 'delivered' },
                { id: 'receive', label: t('ops.deliveries.received'), onClick: receive, when: (d: Delivery) => d.status !== 'delivered' },
                { id: 'delay', label: t('ops.deliveries.delay'), onClick: delay, when: (d: Delivery) => d.status !== 'delivered' && d.status !== 'delayed' },
              ]
            : undefined
        }
      />

      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title={t('ops.deliveries.confirmTitle')}
        size="sm"
        footer={
          <>
            <Button variant="primary" onClick={saveConfirm}>
              {t('ops.deliveries.confirmSave')}
            </Button>
            <Button onClick={() => setConfirming(null)}>{t('ops.common.close')}</Button>
          </>
        }
      >
        <Input type="date" label={t('ops.deliveries.confirmedDate')} value={date} onChange={(e) => setDate(e.target.value)} hint={confirming?.item} />
      </Modal>
    </div>
  );
}
