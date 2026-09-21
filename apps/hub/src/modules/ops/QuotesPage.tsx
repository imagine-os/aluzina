import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Quote } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { useLookups } from './helpers';
import './ops.css';
import { quotesSpec } from './specs';

export function QuotesPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { projects, projectName, supplierName } = useLookups();
  const { rows: quotes, loading } = useTable('quotes', { orderBy: 'amountCop' });
  const [query, setQuery] = useState('');
  const [project, setProject] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      quotes.filter((q) => {
        const text = `${q.item} ${q.comparisonGroup} ${supplierName(q.supplierId) ?? ''}`.toLowerCase();
        if (query && !text.includes(query.toLowerCase())) return false;
        if (project && q.projectId !== project) return false;
        return true;
      }),
    [quotes, query, project, supplierName],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Quote[]>();
    for (const q of filtered) map.set(q.comparisonGroup, [...(map.get(q.comparisonGroup) ?? []), q]);
    return [...map.entries()];
  }, [filtered]);

  const open = openId ? quotes.find((q) => q.id === openId) ?? null : null;

  const select = async (q: Quote) => {
    for (const other of quotes.filter((x) => x.comparisonGroup === q.comparisonGroup)) {
      await data.update('quotes', other.id, { status: other.id === q.id ? 'selected' : 'rejected' });
    }
    toast(t('ops.quotes.selected'));
  };
  const shortlist = async (q: Quote) => {
    await data.update('quotes', q.id, { status: 'shortlisted' });
    toast(t('ops.common.saved'));
  };

  return (
    <div className="ops-stack">
      <PageHeader
        code={quotesSpec.code}
        title={t('ops.quotes.title')}
        subtitle={t('ops.quotes.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.quotes.title') }]}
        actions={
          <Placeholder what={t('ops.quotes.requestWhat')}>
            <Button variant="primary">{t('ops.quotes.request')}</Button>
          </Placeholder>
        }
      />

      <FilterBar
        onClear={() => {
          setQuery('');
          setProject('');
        }}
        summary={t('ops.common.count', { n: filtered.length, total: quotes.length })}
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
      </FilterBar>

      {groups.length === 0 && <EmptyState title={t('ops.quotes.empty')} glyph="◇" />}

      <div className="ops-cards ops-cards--wide">
        {groups.map(([group, rows]) => {
          const prices = rows.map((q) => q.amountCop);
          const best = Math.min(...prices);
          const spread = Math.max(...prices) - best;
          const fastest = Math.min(...rows.map((q) => q.leadTimeDays));
          return (
            <Card
              key={group}
              title={group}
              subtitle={
                rows.length > 1
                  ? `${projectName(rows[0].projectId) ?? ''} · ${t('ops.quotes.spread', { amount: formatCop(spread, lang), n: rows.length })}`
                  : `${projectName(rows[0].projectId) ?? ''} · ${rows[0].item}`
              }
              padding="sm"
            >
              <DataTable<Quote>
                caption={`${t('ops.quotes.group')}: ${group}`}
                rows={rows}
                rowKey={(q) => q.id}
                loading={loading}
                dense
                onRowActivate={(q) => setOpenId(q.id)}
                columns={[
                  { key: 'supplierId', header: t('ops.quotes.col.supplier'), render: (q) => supplierName(q.supplierId) },
                  {
                    key: 'amountCop',
                    header: t('ops.quotes.col.amount'),
                    sortable: true,
                    align: 'end',
                    render: (q) => (
                      <span className="ops-badges">
                        {formatCop(q.amountCop, lang)}
                        {q.amountCop === best && <Badge tone="success">{t('ops.quotes.best')}</Badge>}
                      </span>
                    ),
                  },
                  {
                    key: 'leadTimeDays',
                    header: t('ops.quotes.col.lead'),
                    sortable: true,
                    align: 'end',
                    render: (q) => (
                      <span className="ops-badges">
                        {q.leadTimeDays}
                        {q.leadTimeDays === fastest && <Badge tone="info">{t('ops.quotes.fastest')}</Badge>}
                      </span>
                    ),
                  },
                  { key: 'validUntil', header: t('ops.quotes.col.valid'), render: (q) => formatDate(q.validUntil, lang) },
                  { key: 'status', header: t('ops.common.status'), render: (q) => <StatusPill status={q.status} /> },
                ]}
                rowActions={
                  can('quotes.compare')
                    ? [
                        { id: 'select', label: t('ops.quotes.select'), onClick: select, variant: 'primary' as const, when: (q: Quote) => q.status !== 'selected' },
                        { id: 'shortlist', label: t('ops.quotes.shortlist'), onClick: shortlist, when: (q: Quote) => q.status === 'received' || q.status === 'requested' },
                      ]
                    : undefined
                }
              />
            </Card>
          );
        })}
      </div>

      <Drawer open={open !== null} onClose={() => setOpenId(null)} title={open?.item ?? t('ops.common.detail')}>
        {open && (
          <>
            <StatusPill status={open.status} />
            <KeyValue
              columns={1}
              items={[
                { key: t('ops.common.supplier'), value: supplierName(open.supplierId) ?? '—' },
                { key: t('ops.common.project'), value: projectName(open.projectId) ?? t('ops.common.internal') },
                { key: t('ops.quotes.group'), value: open.comparisonGroup },
                { key: t('ops.quotes.col.amount'), value: formatCop(open.amountCop, lang) },
                { key: t('ops.quotes.col.lead'), value: String(open.leadTimeDays) },
                { key: t('ops.quotes.col.valid'), value: formatDate(open.validUntil, lang) },
                { key: t('ops.common.notes'), value: open.notes || '—' },
              ]}
            />
            {can('quotes.compare') && open.status !== 'selected' && (
              <div className="ops-drawer-section">
                <Button variant="primary" onClick={() => select(open)}>
                  {t('ops.quotes.select')}
                </Button>
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
