import { useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { useCan, useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Modal } from '../../components/organism/Modal/Modal';
import { useData, useTable } from '../../data/DataContext';
import type { ChangeOrder, ChangeOrderStatus } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { todayIso, useLookups } from './helpers';
import './ops.css';
import { changeOrdersSpec } from './specs';

const CO_STATUSES: readonly ChangeOrderStatus[] = ['requested', 'approved', 'rejected', 'executed'];

interface CoDraft {
  projectId: string;
  description: string;
  reason: string;
  extraCostCop: string;
  extraDays: string;
}

const EMPTY: CoDraft = { projectId: '', description: '', reason: '', extraCostCop: '', extraDays: '0' };

const num = (v: string): number => {
  const n = Number(v.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

/**
 * O-11 Change orders (service E stage 8, G-04 / G-14): any request after approval is written down with
 * its description, reason, extra cost, extra time and approval before the work continues. An unapproved
 * change can never be marked executed — the button stays disabled and says why.
 */
export function ChangeOrdersPage() {
  const { t, lang } = useT();
  const can = useCan();
  const { user } = useSession();
  const data = useData();
  const { projects, projectName, userName } = useLookups();
  const { rows: orders, loading } = useTable('changeOrders', { orderBy: 'created_at', dir: 'desc' });
  const manage = can('changeOrders.manage');

  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<CoDraft>(EMPTY);

  const filtered = useMemo(
    () => orders.filter((o) => (!project || o.projectId === project) && (!status || o.status === status)),
    [orders, project, status],
  );

  const totals = useMemo(() => {
    const scope = project ? orders.filter((o) => o.projectId === project) : orders;
    const counted = scope.filter((o) => o.status === 'approved' || o.status === 'executed');
    return {
      requested: scope.filter((o) => o.status === 'requested').length,
      cost: counted.reduce((n, o) => n + o.extraCostCop, 0),
      days: counted.reduce((n, o) => n + o.extraDays, 0),
      executed: scope.filter((o) => o.status === 'executed').length,
    };
  }, [orders, project]);

  const open = openId ? orders.find((o) => o.id === openId) ?? null : null;

  /** G-14: an unapproved change is never executed. Returns the reason, or null when execution is allowed. */
  const executeBlocked = (order: ChangeOrder): string | null => {
    if (order.status === 'executed') return t('ops.changeOrders.alreadyExecuted');
    return order.status === 'approved' ? null : t('ops.changeOrders.gate');
  };

  const decide = async (order: ChangeOrder, next: ChangeOrderStatus) => {
    await data.update(
      'changeOrders',
      order.id,
      { status: next, approvedAt: next === 'approved' ? todayIso() : next === 'rejected' ? null : order.approvedAt },
      { basedOn: order.updated_at },
    );
    toast(t(`ops.changeOrders.toast.${next}`));
    return next;
  };

  const execute = async (order: ChangeOrder) => {
    const reason = executeBlocked(order);
    if (reason) {
      toast(reason);
      return reason;
    }
    await data.update('changeOrders', order.id, { status: 'executed' }, { basedOn: order.updated_at });
    toast(t('ops.changeOrders.toast.executed'));
    return 'executed';
  };

  const create = async (d: CoDraft) => {
    if (!d.projectId || !d.description.trim()) {
      toast(t('ops.changeOrders.required'));
      return null;
    }
    const row = await data.create('changeOrders', {
      projectId: d.projectId,
      description: d.description.trim(),
      reason: d.reason.trim(),
      extraCostCop: num(d.extraCostCop),
      extraDays: num(d.extraDays),
      requestedById: user.id,
      status: 'requested',
      approvedAt: null,
    });
    toast(t('ops.changeOrders.created'));
    return row.id;
  };

  const submit = async () => {
    const id = await create(draft);
    if (!id) return;
    setFormOpen(false);
    setDraft(EMPTY);
    setOpenId(id);
  };

  /** The stored row for an action's `changeOrder` param (falls back to the open drawer), never a stale render copy. */
  const byId = async (v: unknown): Promise<ChangeOrder | null> => {
    const id = String(v ?? '');
    if (id) return data.get('changeOrders', id);
    return open ? data.get('changeOrders', open.id) : null;
  };

  useRegisterActions({
    'ops.newChangeOrder': manage
      ? async (p) => {
          if (!p?.project && !p?.description) {
            setFormOpen(true);
            return t('ops.changeOrders.formOpened');
          }
          return (
            (await create({
              projectId: String(p?.project ?? ''),
              description: String(p?.description ?? ''),
              reason: String(p?.reason ?? ''),
              extraCostCop: String(p?.cost ?? '0'),
              extraDays: String(p?.days ?? '0'),
            })) ?? t('ops.changeOrders.required')
          );
        }
      : false,
    'ops.approveChangeOrder': manage
      ? async (p) => {
          const o = await byId(p?.changeOrder);
          return o ? decide(o, 'approved') : t('ops.changeOrders.notFound');
        }
      : false,
    'ops.rejectChangeOrder': manage
      ? async (p) => {
          const o = await byId(p?.changeOrder);
          return o ? decide(o, 'rejected') : t('ops.changeOrders.notFound');
        }
      : false,
    'ops.executeChangeOrder': manage
      ? async (p) => {
          const o = await byId(p?.changeOrder);
          return o ? execute(o) : t('ops.changeOrders.notFound');
        }
      : false,
    'ops.filterChangeOrdersProject': (p) => {
      setProject(String(p?.project ?? ''));
      return String(p?.project ?? '');
    },
  });

  return (
    <div className="ops-stack">
      <PageHeader
        code={changeOrdersSpec.code}
        title={t('ops.changeOrders.title')}
        subtitle={t('ops.changeOrders.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.changeOrders.title') }]}
        actions={
          manage ? (
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              {t('ops.changeOrders.new')}
            </Button>
          ) : undefined
        }
      />

      <p className="ops-note">{t('ops.changeOrders.rule')}</p>

      <div className="ops-tiles">
        <StatTile glyph="◦" label={t('ops.changeOrders.tile.requested')} value={totals.requested} tone={totals.requested > 0 ? 'warning' : 'neutral'} />
        <StatTile glyph="✓" label={t('ops.changeOrders.tile.executed')} value={totals.executed} tone="success" />
        <StatTile glyph="◆" label={t('ops.changeOrders.tile.cost')} value={formatCop(totals.cost, lang)} hint={t('ops.changeOrders.tile.costHint')} tone="accent" />
        <StatTile glyph="▷" label={t('ops.changeOrders.tile.days')} value={totals.days} hint={t('ops.changeOrders.tile.daysHint')} tone={totals.days > 0 ? 'warning' : 'neutral'} />
      </div>

      <FilterBar
        onClear={() => {
          setProject('');
          setStatus('');
        }}
        summary={t('ops.common.count', { n: filtered.length, total: orders.length })}
      >
        <Select
          className="ops-filter-field"
          label={t('ops.common.project')}
          value={project}
          onChange={(e) => setProject(e.target.value)}
          options={[{ value: '', label: t('ops.common.allProjects') }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
        />
        <Select
          className="ops-filter-field"
          label={t('ops.common.status')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[{ value: '', label: t('ops.common.allStatuses') }, ...CO_STATUSES.map((s) => ({ value: s, label: t(`core.status.${s}`) }))]}
        />
      </FilterBar>

      <DataTable<ChangeOrder>
        caption={t('ops.changeOrders.title')}
        rows={filtered}
        rowKey={(o) => o.id}
        loading={loading}
        onRowActivate={(o) => setOpenId(o.id)}
        emptyTitle={t('ops.changeOrders.empty')}
        columns={[
          { key: 'projectId', header: t('ops.common.project'), render: (o) => projectName(o.projectId) },
          { key: 'description', header: t('ops.changeOrders.col.description'), render: (o) => o.description },
          { key: 'extraCostCop', header: t('ops.changeOrders.col.cost'), align: 'end', sortable: true, render: (o) => formatCop(o.extraCostCop, lang) },
          { key: 'extraDays', header: t('ops.changeOrders.col.days'), align: 'end', sortable: true, render: (o) => o.extraDays },
          { key: 'requestedById', header: t('ops.changeOrders.col.requestedBy'), render: (o) => userName(o.requestedById) },
          { key: 'approvedAt', header: t('ops.changeOrders.col.approvedAt'), render: (o) => formatDate(o.approvedAt, lang) },
          { key: 'status', header: t('ops.common.status'), render: (o) => <StatusPill status={o.status} /> },
        ]}
        rowActions={
          manage
            ? [
                { id: 'approve', label: t('ops.changeOrders.approve'), variant: 'primary' as const, onClick: (o: ChangeOrder) => void decide(o, 'approved'), when: (o: ChangeOrder) => o.status === 'requested' },
                { id: 'reject', label: t('ops.changeOrders.reject'), variant: 'danger' as const, onClick: (o: ChangeOrder) => void decide(o, 'rejected'), when: (o: ChangeOrder) => o.status === 'requested' },
                { id: 'execute', label: t('ops.changeOrders.execute'), onClick: (o: ChangeOrder) => void execute(o), when: (o: ChangeOrder) => o.status === 'approved' },
              ]
            : undefined
        }
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('ops.changeOrders.new')}
        footer={
          <div className="ops-row">
            <Button variant="primary" onClick={() => void submit()}>
              {t('ops.changeOrders.save')}
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
            placeholder={t('ops.changeOrders.pickProject')}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Textarea label={t('ops.changeOrders.col.description')} rows={2} required value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          <Textarea label={t('ops.changeOrders.col.reason')} rows={2} value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} />
          <div className="ops-grid">
            <Input label={t('ops.changeOrders.col.cost')} inputMode="numeric" hint={t('ops.common.copHint')} value={draft.extraCostCop} onChange={(e) => setDraft({ ...draft, extraCostCop: e.target.value })} />
            <Input label={t('ops.changeOrders.col.days')} inputMode="numeric" value={draft.extraDays} onChange={(e) => setDraft({ ...draft, extraDays: e.target.value })} />
          </div>
          <p className="ops-note">{t('ops.changeOrders.requestedByMe', { name: user.name })}</p>
        </form>
      </Modal>

      <Drawer
        open={open !== null}
        onClose={() => setOpenId(null)}
        title={open?.description ?? t('ops.common.detail')}
        footer={
          <div className="ops-row">
            {open && manage && open.status === 'requested' && (
              <>
                <Button variant="primary" onClick={() => void decide(open, 'approved')}>
                  {t('ops.changeOrders.approve')}
                </Button>
                <Button variant="danger" onClick={() => void decide(open, 'rejected')}>
                  {t('ops.changeOrders.reject')}
                </Button>
              </>
            )}
            {open && manage && (
              <Button variant="secondary" disabled={executeBlocked(open) !== null} title={executeBlocked(open) ?? undefined} onClick={() => void execute(open)}>
                {t('ops.changeOrders.execute')}
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
            <div className="ops-badges">
              <StatusPill status={open.status} />
              {executeBlocked(open) && open.status !== 'executed' && <Badge tone="warning">G-14</Badge>}
            </div>
            <KeyValue
              columns={1}
              items={[
                { key: t('ops.common.project'), value: projectName(open.projectId) ?? '—' },
                { key: t('ops.changeOrders.col.description'), value: open.description },
                { key: t('ops.changeOrders.col.reason'), value: open.reason || '—' },
                { key: t('ops.changeOrders.col.cost'), value: formatCop(open.extraCostCop, lang) },
                { key: t('ops.changeOrders.col.days'), value: String(open.extraDays) },
                { key: t('ops.changeOrders.col.requestedBy'), value: userName(open.requestedById) },
                { key: t('ops.changeOrders.col.approvedAt'), value: formatDate(open.approvedAt, lang) },
              ]}
            />
            {executeBlocked(open) && <p className="ops-note">{executeBlocked(open)}</p>}
          </>
        )}
      </Drawer>
    </div>
  );
}
