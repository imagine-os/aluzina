import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Delivery, Quote, Supplier, SupplierCategory } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueLabel, outstanding, useLookups } from './helpers';
import './ops.css';
import { suppliersSpec } from './specs';

const CATEGORIES: SupplierCategory[] = ['lighting', 'furniture', 'stone', 'wood', 'textiles', 'paint', 'metalwork', 'installation', 'printing'];
const STATUSES = ['active', 'trial', 'paused'];

export function SuppliersPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { projectName } = useLookups();
  const { rows: suppliers, loading } = useTable('suppliers', { orderBy: 'name' });
  const { rows: quotes } = useTable('quotes', { orderBy: 'amountCop' });
  const { rows: deliveries } = useTable('deliveries', { orderBy: 'expectedDate' });
  const { rows: payments } = useTable('payments', { orderBy: 'dueDate' });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const filtered = useMemo(
    () =>
      suppliers.filter((s) => {
        const q = query.toLowerCase();
        if (q && !`${s.name} ${s.contactName} ${s.city}`.toLowerCase().includes(q)) return false;
        if (category && s.category !== category) return false;
        if (status && s.status !== status) return false;
        return true;
      }),
    [suppliers, query, category, status],
  );

  const open = openId ? suppliers.find((s) => s.id === openId) ?? null : null;
  const openQuotes = open ? quotes.filter((q) => q.supplierId === open.id && q.status !== 'rejected') : [];
  const openDeliveries = open ? deliveries.filter((d) => d.supplierId === open.id && d.status !== 'delivered') : [];
  const owed = open ? payments.filter((p) => p.direction === 'out' && p.status !== 'paid' && p.counterparty === open.name) : [];

  const toggleStatus = async (s: Supplier) => {
    await data.update('suppliers', s.id, { status: s.status === 'paused' ? 'active' : 'paused' });
    toast(t('ops.suppliers.statusSaved'));
  };

  const clear = () => {
    setQuery('');
    setCategory('');
    setStatus('');
  };

  return (
    <div className="ops-stack">
      <PageHeader
        code={suppliersSpec.code}
        title={t('ops.suppliers.title')}
        subtitle={t('ops.suppliers.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.suppliers.title') }]}
        actions={
          <Placeholder what={t('ops.suppliers.addWhat')}>
            <Button variant="primary">{t('ops.suppliers.add')}</Button>
          </Placeholder>
        }
      />

      <FilterBar onClear={clear} summary={t('ops.common.count', { n: filtered.length, total: suppliers.length })}>
        <SearchField value={query} onChange={setQuery} placeholder={t('ops.suppliers.searchPlaceholder')} />
        <Select
          className="ops-filter-field"
          label={t('ops.suppliers.category')}
          hideLabel
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[{ value: '', label: t('ops.suppliers.allCategories') }, ...CATEGORIES.map((c) => ({ value: c, label: t(`ops.suppliers.cat.${c}`) }))]}
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

      <DataTable<Supplier>
        caption={t('ops.suppliers.table')}
        rows={filtered}
        rowKey={(s) => s.id}
        loading={loading}
        emptyTitle={t('ops.common.empty')}
        initialSort={{ key: 'name', dir: 'asc' }}
        onRowActivate={(s) => {
          setOpenId(s.id);
          setNote('');
        }}
        columns={[
          { key: 'name', header: t('ops.suppliers.col.name'), sortable: true },
          { key: 'category', header: t('ops.suppliers.col.category'), render: (s) => t(`ops.suppliers.cat.${s.category}`) },
          { key: 'contactName', header: t('ops.suppliers.col.contact'), render: (s) => s.contactName },
          { key: 'city', header: t('ops.suppliers.col.city') },
          { key: 'leadTimeDays', header: t('ops.suppliers.col.lead'), sortable: true, align: 'end' },
          { key: 'rating', header: t('ops.suppliers.col.rating'), sortable: true, align: 'end', render: (s) => `${s.rating}/5` },
          { key: 'status', header: t('ops.common.status'), render: (s) => <StatusPill status={s.status} /> },
        ]}
        rowActions={
          can('suppliers.manage')
            ? [
                { id: 'pause', label: t('ops.suppliers.pause'), onClick: toggleStatus, when: (s: Supplier) => s.status !== 'paused' },
                { id: 'activate', label: t('ops.suppliers.activate'), onClick: toggleStatus, when: (s: Supplier) => s.status === 'paused' },
              ]
            : undefined
        }
      />

      <Drawer open={open !== null} onClose={() => setOpenId(null)} title={open?.name ?? t('ops.common.detail')}>
        {open && (
          <>
            <div className="ops-badges">
              <StatusPill status={open.status} />
              <Badge tone="neutral">{t(`ops.suppliers.cat.${open.category}`)}</Badge>
              <Badge tone="info">{`${open.leadTimeDays} ${t('ops.suppliers.col.lead')}`}</Badge>
            </div>
            <KeyValue
              columns={1}
              items={[
                { key: t('ops.suppliers.col.contact'), value: open.contactName },
                { key: 'Email', value: open.email },
                { key: t('ops.suppliers.col.city'), value: `${open.city} · ${open.phone}` },
                { key: t('ops.suppliers.col.rating'), value: `${open.rating}/5` },
                { key: t('ops.suppliers.owed'), value: formatCop(owed.reduce((n, p) => n + outstanding(p), 0), lang) },
              ]}
            />

            <div className="ops-drawer-section">
              <h3>{t('ops.suppliers.openQuotes')}</h3>
              <DataTable<Quote>
                caption={t('ops.suppliers.openQuotes')}
                rows={openQuotes}
                rowKey={(q) => q.id}
                dense
                emptyTitle={t('ops.common.empty')}
                columns={[
                  { key: 'item', header: t('ops.common.item') },
                  { key: 'amountCop', header: t('ops.common.amount'), align: 'end', render: (q) => formatCop(q.amountCop, lang) },
                  { key: 'status', header: t('ops.common.status'), render: (q) => <StatusPill status={q.status} /> },
                ]}
              />
            </div>

            <div className="ops-drawer-section">
              <h3>{t('ops.suppliers.openDeliveries')}</h3>
              <DataTable<Delivery>
                caption={t('ops.suppliers.openDeliveries')}
                rows={openDeliveries}
                rowKey={(d) => d.id}
                dense
                emptyTitle={t('ops.common.empty')}
                columns={[
                  { key: 'item', header: t('ops.common.item') },
                  { key: 'projectId', header: t('ops.common.project'), render: (d) => projectName(d.projectId) ?? t('ops.common.internal') },
                  { key: 'expectedDate', header: t('ops.deliveries.col.expected'), render: (d) => `${formatDate(d.expectedDate, lang)} · ${dueLabel(d.expectedDate, t)}` },
                  { key: 'status', header: t('ops.common.status'), render: (d) => <StatusPill status={d.status} /> },
                ]}
              />
            </div>

            <div className="ops-drawer-section">
              <h3>{t('ops.suppliers.followUp')}</h3>
              <Textarea label={t('ops.suppliers.followUp')} hideLabel hint={t('ops.suppliers.followUpHint')} value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="ops-row">
                <Placeholder what={t('ops.suppliers.saveNoteWhat')}>
                  <Button variant="primary">{t('ops.suppliers.saveNote')}</Button>
                </Placeholder>
                {can('suppliers.manage') && (
                  <Button onClick={() => toggleStatus(open)}>{open.status === 'paused' ? t('ops.suppliers.activate') : t('ops.suppliers.pause')}</Button>
                )}
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
