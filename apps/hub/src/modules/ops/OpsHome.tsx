import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCan } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useData, useTable } from '../../data/DataContext';
import type { Alert, Delivery, Meeting, Payment, Task } from '../../data/schema';
import { formatCop, formatDate, formatDateTime, daysUntil } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueLabel, outstanding, todayIso, useLookups } from './helpers';
import './ops.css';
import { homeSpec } from './specs';

export function OpsHome() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const navigate = useNavigate();
  const { projectName, supplierName } = useLookups();
  const { rows: tasks } = useTable('tasks', { orderBy: 'dueDate' });
  const { rows: meetings } = useTable('meetings', { orderBy: 'startsAt' });
  const { rows: alerts } = useTable('alerts', { orderBy: 'dueDate' });
  const { rows: deliveries } = useTable('deliveries', { orderBy: 'expectedDate' });
  const { rows: payments } = useTable('payments', { orderBy: 'dueDate' });

  const today = todayIso();

  const pendingTasks = useMemo(() => tasks.filter((x) => x.status !== 'done'), [tasks]);
  const hotTasks = pendingTasks.filter((x) => x.priority === 'high' || x.priority === 'urgent');
  const openAlerts = useMemo(() => alerts.filter((a) => a.status === 'open'), [alerts]);
  const urgentAlerts = openAlerts.filter((a) => a.severity === 'urgent');
  const soonDeliveries = useMemo(
    () => deliveries.filter((d) => d.status !== 'delivered' && daysUntil(d.expectedDate) <= 14),
    [deliveries],
  );
  const unconfirmed = soonDeliveries.filter((d) => d.confirmedDate === null);
  const openPayments = useMemo(() => payments.filter((p) => p.status !== 'paid'), [payments]);
  const owedIn = openPayments.filter((p) => p.direction === 'in');
  const owedOut = openPayments.filter((p) => p.direction === 'out');
  const sum = (rows: Payment[]) => rows.reduce((n, p) => n + outstanding(p), 0);
  const nextOut = owedOut.map((p) => p.dueDate).sort()[0] ?? null;
  const nextMeetings = useMemo(() => meetings.filter((m) => m.startsAt.slice(0, 10) >= today).slice(0, 5), [meetings, today]);

  const go = (path: string) => () => navigate(path);

  const acknowledge = async (a: Alert) => {
    await data.update('alerts', a.id, { status: 'acknowledged' });
    toast(t('ops.alerts.acknowledged'));
  };
  const confirmDelivery = async (d: Delivery) => {
    await data.update('deliveries', d.id, { confirmedDate: d.expectedDate, status: 'confirmed' });
    toast(t('ops.deliveries.confirmed'));
  };

  return (
    <div className="ops-stack">
      <PageHeader
        code={homeSpec.code}
        title={t('ops.home.title')}
        subtitle={t('ops.home.desc')}
        actions={
          <Placeholder what={t('ops.home.newTaskWhat')}>
            <Button variant="primary">{t('ops.home.newTask')}</Button>
          </Placeholder>
        }
      />

      <div className="ops-tiles">
        <StatTile glyph="▤" label={t('ops.home.tile.tasks')} value={pendingTasks.length} hint={t('ops.home.tile.tasksHint', { n: hotTasks.length })} tone={hotTasks.length > 0 ? 'warning' : 'neutral'} onActivate={go('/ops/tasks')} />
        <StatTile glyph="!" label={t('ops.home.tile.alerts')} value={openAlerts.length} hint={t('ops.home.tile.alertsHint', { n: urgentAlerts.length })} tone={urgentAlerts.length > 0 ? 'danger' : 'neutral'} onActivate={go('/ops/alerts')} />
        <StatTile glyph="▷" label={t('ops.home.tile.deliveries')} value={soonDeliveries.length} hint={t('ops.home.tile.deliveriesHint', { n: unconfirmed.length })} tone={unconfirmed.length > 0 ? 'warning' : 'success'} onActivate={go('/ops/deliveries')} />
        <StatTile glyph="◆" label={t('ops.home.tile.in')} value={formatCop(sum(owedIn), lang)} hint={t('ops.home.tile.inHint', { n: owedIn.filter((p) => daysUntil(p.dueDate) < 0).length })} tone="accent" onActivate={go('/ops/payments')} />
        <StatTile glyph="◇" label={t('ops.home.tile.out')} value={formatCop(sum(owedOut), lang)} hint={t('ops.home.tile.outHint', { date: formatDate(nextOut, lang) })} onActivate={go('/ops/payments')} />
      </div>

      <div className="ops-cards ops-cards--wide">
        <Card
          title={t('ops.home.agenda')}
          actions={<Button size="sm" variant="ghost" onClick={go('/ops/schedule')}>{t('ops.common.seeAll')}</Button>}
          padding="sm"
        >
          <DataTable<Meeting>
            caption={t('ops.home.agenda')}
            rows={nextMeetings}
            rowKey={(m) => m.id}
            dense
            emptyTitle={t('ops.home.agenda.empty')}
            columns={[
              { key: 'startsAt', header: t('ops.home.agenda.when'), render: (m) => formatDateTime(m.startsAt, lang) },
              { key: 'title', header: t('ops.home.agenda.what'), render: (m) => m.title },
              { key: 'location', header: t('ops.home.agenda.where'), render: (m) => m.location },
            ]}
          />
        </Card>

        <Card
          title={t('ops.home.tasks')}
          actions={<Button size="sm" variant="ghost" onClick={go('/ops/tasks')}>{t('ops.common.seeAll')}</Button>}
          padding="sm"
        >
          <DataTable<Task>
            caption={t('ops.home.tasks')}
            rows={pendingTasks.slice(0, 6)}
            rowKey={(x) => x.id}
            dense
            emptyTitle={t('ops.home.tasks.empty')}
            onRowActivate={go('/ops/tasks')}
            columns={[
              { key: 'title', header: t('ops.tasks.col.title'), render: (x) => x.title },
              { key: 'projectId', header: t('ops.common.project'), render: (x) => projectName(x.projectId) ?? t('ops.common.internal') },
              { key: 'dueDate', header: t('ops.common.due'), render: (x) => dueLabel(x.dueDate, t) },
              { key: 'status', header: t('ops.common.status'), render: (x) => <StatusPill status={x.status} /> },
            ]}
          />
        </Card>

        <Card
          title={t('ops.home.alerts')}
          actions={<Button size="sm" variant="ghost" onClick={go('/ops/alerts')}>{t('ops.common.seeAll')}</Button>}
          padding="sm"
        >
          <DataTable<Alert>
            caption={t('ops.home.alerts')}
            rows={openAlerts}
            rowKey={(a) => a.id}
            dense
            emptyTitle={t('ops.home.alerts.empty')}
            columns={[
              { key: 'title', header: t('ops.alerts.col.title'), render: (a) => a.title },
              { key: 'severity', header: t('ops.alerts.severity'), render: (a) => <StatusPill status={a.severity} /> },
              { key: 'dueDate', header: t('ops.common.due'), render: (a) => dueLabel(a.dueDate, t) },
            ]}
            rowActions={can('alerts.manage') ? [{ id: 'ack', label: t('ops.alerts.acknowledge'), onClick: acknowledge }] : undefined}
          />
        </Card>

        <Card
          title={t('ops.home.deliveries')}
          actions={<Button size="sm" variant="ghost" onClick={go('/ops/deliveries')}>{t('ops.common.seeAll')}</Button>}
          padding="sm"
        >
          <DataTable<Delivery>
            caption={t('ops.home.deliveries')}
            rows={soonDeliveries}
            rowKey={(d) => d.id}
            dense
            emptyTitle={t('ops.home.deliveries.empty')}
            columns={[
              { key: 'item', header: t('ops.common.item'), render: (d) => d.item },
              { key: 'supplierId', header: t('ops.common.supplier'), render: (d) => supplierName(d.supplierId) },
              { key: 'expectedDate', header: t('ops.deliveries.col.expected'), render: (d) => `${formatDate(d.expectedDate, lang)} · ${dueLabel(d.expectedDate, t)}` },
              { key: 'status', header: t('ops.common.status'), render: (d) => <StatusPill status={d.status} /> },
            ]}
            rowActions={
              can('deliveries.manage')
                ? [{ id: 'confirm', label: t('ops.deliveries.confirm'), onClick: confirmDelivery, when: (d) => d.confirmedDate === null }]
                : undefined
            }
          />
        </Card>

        <Card
          title={t('ops.home.money')}
          actions={<Button size="sm" variant="ghost" onClick={go('/ops/payments')}>{t('ops.common.seeAll')}</Button>}
          padding="sm"
        >
          <DataTable<Payment>
            caption={t('ops.home.money')}
            rows={openPayments}
            rowKey={(p) => p.id}
            dense
            emptyTitle={t('ops.home.money.empty')}
            onRowActivate={go('/ops/payments')}
            columns={[
              { key: 'counterparty', header: t('ops.payments.col.counterparty'), render: (p) => p.counterparty },
              { key: 'direction', header: t('ops.payments.col.direction'), render: (p) => t(`ops.payments.direction.${p.direction}`) },
              { key: 'amountCop', header: t('ops.payments.col.outstanding'), align: 'end', render: (p) => formatCop(outstanding(p), lang) },
              { key: 'dueDate', header: t('ops.common.due'), render: (p) => dueLabel(p.dueDate, t) },
              { key: 'status', header: t('ops.common.status'), render: (p) => <StatusPill status={p.status} /> },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
