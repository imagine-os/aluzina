import { useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { useCan, useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Modal } from '../../components/organism/Modal/Modal';
import { useData, useTable } from '../../data/DataContext';
import type { Purchase } from '../../data/schema';
import { PURCHASE_STATUSES, nextPurchaseStatus, pick, type PurchaseStatusId } from '../../domain';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { todayIso, useLookups } from './helpers';
import './ops.css';
import { purchasesSpec } from './specs';

interface PurchaseDraft {
  projectId: string;
  supplierId: string;
  reference: string;
  quantity: string;
  priceCop: string;
  date: string;
}

const num = (v: string): number => {
  const n = Number(v.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

/**
 * O-12 Purchasing control (service E stage 5, G-07): every purchase is tracked from quotation to
 * installation through the six-status flow, with the per-project total set against the project budget
 * so the studio sees what the execution has already committed.
 */
export function PurchasesPage() {
  const { t, lang } = useT();
  const can = useCan();
  const { user } = useSession();
  const data = useData();
  const { projects, suppliers, projectName, supplierName, userName } = useLookups();
  const { rows: purchases, loading } = useTable('purchases', { orderBy: 'date', dir: 'desc' });
  const manage = can('purchases.manage');

  const emptyDraft: PurchaseDraft = { projectId: '', supplierId: '', reference: '', quantity: '1', priceCop: '', date: todayIso() };

  const [query, setQuery] = useState('');
  const [project, setProject] = useState('');
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<PurchaseDraft>(emptyDraft);

  const statusOptions = PURCHASE_STATUSES.map((s) => ({ value: s.id, label: pick(s.label, lang) }));

  const filtered = useMemo(
    () =>
      purchases.filter((p) => {
        const needle = query.trim().toLowerCase();
        if (needle && !`${p.reference} ${supplierName(p.supplierId) ?? ''}`.toLowerCase().includes(needle)) return false;
        if (project && p.projectId !== project) return false;
        if (supplier && p.supplierId !== supplier) return false;
        if (status && p.status !== status) return false;
        return true;
      }),
    [purchases, query, project, supplier, status, supplierName],
  );

  const byStatus = useMemo(() => {
    const scope = project ? purchases.filter((p) => p.projectId === project) : purchases;
    return PURCHASE_STATUSES.map((s) => ({ status: s, rows: scope.filter((p) => p.status === s.id) }));
  }, [purchases, project]);

  /** Committed purchase spend per project against `projects.budgetCop` (G-07 tracked end to end). */
  const perProject = useMemo(() => {
    const scope = project ? projects.filter((p) => p.id === project) : projects;
    return scope
      .map((p) => {
        const rows = purchases.filter((x) => x.projectId === p.id);
        const total = rows.reduce((n, x) => n + x.priceCop, 0);
        const installed = rows.filter((x) => x.status === 'installed').length;
        return { project: p, rows, total, installed, share: p.budgetCop > 0 ? Math.round((total / p.budgetCop) * 100) : null };
      })
      .filter((x) => x.rows.length > 0);
  }, [projects, purchases, project]);

  const open = openId ? purchases.find((p) => p.id === openId) ?? null : null;

  const setStatusOf = async (row: Purchase, to: string) => {
    if (!PURCHASE_STATUSES.some((s) => s.id === to)) return t('ops.purchases.unknownStatus');
    await data.update('purchases', row.id, { status: to as PurchaseStatusId }, { basedOn: row.updated_at });
    const label = pick(PURCHASE_STATUSES.find((s) => s.id === to)?.label ?? { en: to }, lang);
    toast(t('ops.purchases.statusSet', { reference: row.reference, status: label }));
    return label;
  };

  const advance = async (row: Purchase) => {
    const next = nextPurchaseStatus(row.status);
    if (!next) {
      toast(t('ops.purchases.alreadyInstalled'));
      return t('ops.purchases.alreadyInstalled');
    }
    return setStatusOf(row, next.id);
  };

  const create = async (d: PurchaseDraft) => {
    if (!d.projectId || !d.reference.trim()) {
      toast(t('ops.purchases.required'));
      return null;
    }
    const row = await data.create('purchases', {
      projectId: d.projectId,
      supplierId: d.supplierId || null,
      reference: d.reference.trim(),
      quantity: Math.max(1, num(d.quantity)),
      priceCop: num(d.priceCop),
      date: d.date || todayIso(),
      responsibleId: user.id,
      status: 'quoted',
    });
    toast(t('ops.purchases.created', { reference: row.reference }));
    return row.id;
  };

  const submit = async () => {
    const id = await create(draft);
    if (!id) return;
    setFormOpen(false);
    setDraft(emptyDraft);
    setOpenId(id);
  };

  /** The stored row for an action's `purchase` param (falls back to the open drawer), never a stale render copy. */
  const byId = async (v: unknown): Promise<Purchase | null> => {
    const id = String(v ?? '');
    if (id) return data.get('purchases', id);
    return open ? data.get('purchases', open.id) : null;
  };

  useRegisterActions({
    'ops.newPurchase': manage
      ? async (p) => {
          if (!p?.project && !p?.reference) {
            setFormOpen(true);
            return t('ops.purchases.formOpened');
          }
          return (
            (await create({
              projectId: String(p?.project ?? ''),
              supplierId: String(p?.supplier ?? ''),
              reference: String(p?.reference ?? ''),
              quantity: String(p?.quantity ?? '1'),
              priceCop: String(p?.price ?? '0'),
              date: String(p?.date ?? todayIso()),
            })) ?? t('ops.purchases.required')
          );
        }
      : false,
    'ops.advancePurchase': manage
      ? async (p) => {
          const row = await byId(p?.purchase);
          return row ? advance(row) : t('ops.purchases.notFound');
        }
      : false,
    'ops.setPurchaseStatus': manage
      ? async (p) => {
          const row = await byId(p?.purchase);
          return row ? setStatusOf(row, String(p?.status ?? '')) : t('ops.purchases.notFound');
        }
      : false,
    'ops.filterPurchases': (p) => {
      if (p?.project !== undefined) setProject(String(p.project));
      if (p?.supplier !== undefined) setSupplier(String(p.supplier));
      if (p?.status !== undefined) setStatus(String(p.status));
      return filtered.length;
    },
  });

  return (
    <div className="ops-stack">
      <PageHeader
        code={purchasesSpec.code}
        title={t('ops.purchases.title')}
        subtitle={t('ops.purchases.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.purchases.title') }]}
        actions={
          manage ? (
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              {t('ops.purchases.new')}
            </Button>
          ) : undefined
        }
      />

      <p className="ops-note">{t('ops.purchases.rule')}</p>

      <div className="ops-tiles">
        {byStatus.map(({ status: s, rows }) => (
          <StatTile
            key={s.id}
            label={pick(s.label, lang)}
            value={rows.length}
            hint={formatCop(rows.reduce((n, r) => n + r.priceCop, 0), lang)}
            tone={s.tone}
            onActivate={() => setStatus(status === s.id ? '' : s.id)}
          />
        ))}
      </div>

      <FilterBar
        onClear={() => {
          setQuery('');
          setProject('');
          setSupplier('');
          setStatus('');
        }}
        summary={t('ops.common.count', { n: filtered.length, total: purchases.length })}
      >
        <SearchField value={query} onChange={setQuery} />
        <Select
          className="ops-filter-field"
          label={t('ops.common.project')}
          value={project}
          onChange={(e) => setProject(e.target.value)}
          options={[{ value: '', label: t('ops.common.allProjects') }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
        />
        <Select
          className="ops-filter-field"
          label={t('ops.common.supplier')}
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          options={[{ value: '', label: t('ops.common.allSuppliers') }, ...suppliers.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <Select
          className="ops-filter-field"
          label={t('ops.common.status')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[{ value: '', label: t('ops.common.allStatuses') }, ...statusOptions]}
        />
      </FilterBar>

      <DataTable<Purchase>
        caption={t('ops.purchases.title')}
        rows={filtered}
        rowKey={(p) => p.id}
        loading={loading}
        onRowActivate={(p) => setOpenId(p.id)}
        emptyTitle={t('ops.purchases.empty')}
        columns={[
          { key: 'projectId', header: t('ops.common.project'), render: (p) => projectName(p.projectId) },
          { key: 'supplierId', header: t('ops.common.supplier'), render: (p) => supplierName(p.supplierId) ?? '—' },
          { key: 'reference', header: t('ops.purchases.col.reference'), sortable: true, render: (p) => p.reference },
          { key: 'quantity', header: t('ops.purchases.col.quantity'), align: 'end', render: (p) => p.quantity },
          { key: 'priceCop', header: t('ops.purchases.col.price'), align: 'end', sortable: true, render: (p) => formatCop(p.priceCop, lang) },
          { key: 'date', header: t('ops.common.date'), sortable: true, render: (p) => formatDate(p.date, lang) },
          { key: 'responsibleId', header: t('ops.common.owner'), render: (p) => userName(p.responsibleId) },
          { key: 'status', header: t('ops.common.status'), render: (p) => <StatusPill status={p.status} /> },
        ]}
        rowActions={
          manage
            ? [
                {
                  id: 'advance',
                  label: t('ops.purchases.advance'),
                  variant: 'primary' as const,
                  onClick: (p: Purchase) => void advance(p),
                  when: (p: Purchase) => nextPurchaseStatus(p.status) !== undefined,
                },
              ]
            : undefined
        }
      />

      {/* Per-project commitment against the budget (G-07). */}
      <div className="ops-cards">
        {perProject.map(({ project: p, rows, total, installed, share }) => (
          <Card key={p.id} title={p.name} subtitle={t('ops.purchases.perProject', { n: rows.length, installed })} padding="sm">
            <KeyValue
              columns={1}
              items={[
                { key: t('ops.purchases.committed'), value: formatCop(total, lang) },
                { key: t('ops.purchases.budget'), value: p.budgetCop > 0 ? formatCop(p.budgetCop, lang) : '—' },
                {
                  key: t('ops.purchases.share'),
                  value: share === null ? '—' : <Badge tone={share > 100 ? 'danger' : share > 80 ? 'warning' : 'success'}>{t('ops.purchases.sharePct', { n: share })}</Badge>,
                },
              ]}
            />
          </Card>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('ops.purchases.new')}
        footer={
          <div className="ops-row">
            <Button variant="primary" onClick={() => void submit()}>
              {t('ops.purchases.save')}
            </Button>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              {t('ops.common.close')}
            </Button>
          </div>
        }
      >
        <form className="ops-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <Select
            label={t('ops.common.project')}
            required
            value={draft.projectId}
            onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}
            placeholder={t('ops.purchases.pickProject')}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Select
            label={t('ops.common.supplier')}
            value={draft.supplierId}
            onChange={(e) => setDraft({ ...draft, supplierId: e.target.value })}
            placeholder={t('ops.purchases.noSupplier')}
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Input label={t('ops.purchases.col.reference')} required value={draft.reference} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} />
          <div className="ops-grid">
            <Input label={t('ops.purchases.col.quantity')} inputMode="numeric" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} />
            <Input label={t('ops.purchases.col.price')} inputMode="numeric" hint={t('ops.common.copHint')} value={draft.priceCop} onChange={(e) => setDraft({ ...draft, priceCop: e.target.value })} />
            <Input label={t('ops.common.date')} type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </div>
          <p className="ops-note">{t('ops.purchases.startsQuoted', { name: user.name })}</p>
        </form>
      </Modal>

      <Drawer
        open={open !== null}
        onClose={() => setOpenId(null)}
        title={open?.reference ?? t('ops.common.detail')}
        footer={
          <div className="ops-row">
            {open && manage && (
              <Button variant="primary" disabled={nextPurchaseStatus(open.status) === undefined} onClick={() => void advance(open)}>
                {nextPurchaseStatus(open.status) ? t('ops.purchases.advanceTo', { status: pick(nextPurchaseStatus(open.status)?.label ?? { en: '' }, lang) }) : t('ops.purchases.alreadyInstalled')}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setOpenId(null)}>
              {t('ops.common.close')}
            </Button>
          </div>
        }
      >
        {open && (
          <>
            <StatusPill status={open.status} />
            <KeyValue
              columns={1}
              items={[
                { key: t('ops.common.project'), value: projectName(open.projectId) ?? '—' },
                { key: t('ops.common.supplier'), value: supplierName(open.supplierId) ?? t('ops.purchases.noSupplier') },
                { key: t('ops.purchases.col.quantity'), value: String(open.quantity) },
                { key: t('ops.purchases.col.price'), value: formatCop(open.priceCop, lang) },
                { key: t('ops.common.date'), value: formatDate(open.date, lang) },
                { key: t('ops.common.owner'), value: userName(open.responsibleId) },
              ]}
            />
            {manage && (
              <div className="ops-drawer-section">
                <h3>{t('ops.purchases.setStatus')}</h3>
                <Select label={t('ops.common.status')} hideLabel value={open.status} options={statusOptions} onChange={(e) => void setStatusOf(open, e.target.value)} />
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
