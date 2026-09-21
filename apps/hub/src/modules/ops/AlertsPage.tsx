import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { useData, useTable } from '../../data/DataContext';
import type { Alert, AlertStatus } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueLabel, dueTone, useLookups } from './helpers';
import './ops.css';
import { alertsSpec } from './specs';

const TABS: AlertStatus[] = ['open', 'acknowledged', 'resolved'];

/** Which ops page owns the entity an alert points at. */
const ROUTE_FOR: Record<string, string> = {
  quotes: '/ops/quotes',
  payments: '/ops/payments',
  deliveries: '/ops/deliveries',
  projects: '/ops/schedule',
  tasks: '/ops/tasks',
  documents: '/ops/documents',
};

export function AlertsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const navigate = useNavigate();
  const { projectName, supplierName } = useLookups();
  const { rows: alerts } = useTable('alerts', { orderBy: 'dueDate' });
  const { rows: quotes } = useTable('quotes');
  const { rows: payments } = useTable('payments');
  const { rows: deliveries } = useTable('deliveries');
  const [tab, setTab] = useState<string>('open');

  const subjectOf = useMemo(
    () =>
      (a: Alert): string => {
        if (a.entity === 'quotes') return quotes.find((q) => q.id === a.entityId)?.item ?? a.entityId;
        if (a.entity === 'payments') {
          const p = payments.find((x) => x.id === a.entityId);
          return p ? `${p.counterparty} — ${p.concept}` : a.entityId;
        }
        if (a.entity === 'deliveries') {
          const d = deliveries.find((x) => x.id === a.entityId);
          return d ? `${d.item} · ${supplierName(d.supplierId) ?? ''}` : a.entityId;
        }
        if (a.entity === 'projects') return projectName(a.entityId) ?? a.entityId;
        return a.entityId;
      },
    [quotes, payments, deliveries, projectName, supplierName],
  );

  const shown = alerts.filter((a) => a.status === tab);

  const setStatus = async (a: Alert, status: AlertStatus) => {
    await data.update('alerts', a.id, { status });
    toast(status === 'resolved' ? t('ops.alerts.resolved') : status === 'acknowledged' ? t('ops.alerts.acknowledged') : t('ops.common.saved'));
  };

  return (
    <div className="ops-stack">
      <PageHeader
        code={alertsSpec.code}
        title={t('ops.alerts.title')}
        subtitle={t('ops.alerts.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.alerts.title') }]}
        actions={
          <Placeholder what={t('ops.alerts.newWhat')}>
            <Button variant="primary">{t('ops.alerts.new')}</Button>
          </Placeholder>
        }
      />

      <Tabs
        label={t('ops.alerts.title')}
        value={tab}
        onChange={setTab}
        tabs={TABS.map((s) => ({ id: s, label: t(`ops.alerts.tab.${s}`), count: alerts.filter((a) => a.status === s).length }))}
      >
        {shown.length === 0 ? (
          <EmptyState title={t('ops.alerts.empty')} glyph="✓" />
        ) : (
          <div className="ops-cards">
            {shown.map((a) => (
              <Card
                key={a.id}
                title={a.title}
                subtitle={`${formatDate(a.dueDate, lang)} · ${dueLabel(a.dueDate, t)}`}
                raised={a.severity === 'urgent'}
                footer={
                  <div className="ops-row">
                    {can('alerts.manage') && a.status === 'open' && (
                      <Button variant="primary" onClick={() => setStatus(a, 'acknowledged')}>
                        {t('ops.alerts.acknowledge')}
                      </Button>
                    )}
                    {can('alerts.manage') && a.status !== 'resolved' && <Button onClick={() => setStatus(a, 'resolved')}>{t('ops.alerts.resolve')}</Button>}
                    {can('alerts.manage') && a.status === 'resolved' && <Button onClick={() => setStatus(a, 'open')}>{t('ops.alerts.reopen')}</Button>}
                    {ROUTE_FOR[a.entity] && (
                      <Button variant="ghost" onClick={() => navigate(ROUTE_FOR[a.entity])}>
                        {t('ops.alerts.openItem')}
                      </Button>
                    )}
                  </div>
                }
              >
                <div className="ops-badges">
                  <StatusPill status={a.severity} />
                  <StatusPill status={a.status} />
                  <Badge tone={dueTone(a.dueDate, a.leadDays)}>{t('ops.alerts.lead', { n: a.leadDays })}</Badge>
                </div>
                <KeyValue
                  columns={1}
                  items={[
                    { key: t('ops.alerts.about'), value: subjectOf(a) },
                    { key: t('ops.alerts.forRole'), value: t(`core.role.${a.forRole}`) },
                  ]}
                />
              </Card>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
}
