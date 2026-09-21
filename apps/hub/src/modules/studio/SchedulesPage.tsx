import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Schedule, ScheduleKind } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { schedulesSpec } from './specs';
import { useProjectIndex } from './useProjectIndex';
import './studio.css';

const KINDS: ScheduleKind[] = ['furniture', 'materials', 'lighting', 'elements'];

export function SchedulesPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: schedules, loading } = useTable('schedules', { orderBy: 'title' });
  const { nameOf } = useProjectIndex();
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState<Schedule | null>(null);

  const shown = useMemo(() => (tab === 'all' ? schedules : schedules.filter((s) => s.kind === tab)), [schedules, tab]);
  const current = open ? (schedules.find((s) => s.id === open.id) ?? open) : null;
  const items = schedules.reduce((n, s) => n + s.itemCount, 0);

  const sendToReview = async (s: Schedule) => {
    await data.update('schedules', s.id, { status: 'in-review' });
    toast(t('studio.saved'));
  };
  const markFinal = async (s: Schedule) => {
    await data.update('schedules', s.id, { status: 'final' });
    toast(t('studio.saved'));
  };

  return (
    <>
      <PageHeader
        code={schedulesSpec.code}
        title={t('studio.schedules.title')}
        subtitle={t('studio.schedules.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.nav.schedules') }]}
        actions={
          <Placeholder what={t('studio.schedules.newWhat')}>
            <Button variant="primary">{t('studio.schedules.new')}</Button>
          </Placeholder>
        }
      />

      <div className="studio-stats">
        <StatTile label={t('studio.schedules.stat.items')} value={items} tone="accent" glyph="☷" />
        <StatTile label={t('studio.schedules.stat.final')} value={schedules.filter((s) => s.status === 'final').length} tone="success" />
        <StatTile label={t('studio.schedules.stat.open')} value={schedules.filter((s) => s.status !== 'final').length} tone="warning" />
      </div>

      <Tabs
        label={t('studio.schedules.title')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'all', label: t('studio.schedules.all'), count: schedules.length },
          ...KINDS.map((k) => ({ id: k, label: t(`studio.schedules.kind.${k}`), count: schedules.filter((s) => s.kind === k).length })),
        ]}
      >
        <DataTable<Schedule>
          caption={t('studio.schedules.title')}
          rows={shown}
          rowKey={(s) => s.id}
          loading={loading}
          emptyTitle={t('studio.empty.title')}
          emptyDescription={t('studio.empty.desc')}
          onRowActivate={setOpen}
          initialSort={{ key: 'dueDate', dir: 'asc' }}
          columns={[
            { key: 'title', header: t('studio.col.title'), sortable: true },
            { key: 'projectId', header: t('studio.col.project'), render: (s) => nameOf(s.projectId) },
            { key: 'kind', header: t('studio.col.kind'), sortable: true, render: (s) => t(`studio.schedules.kind.${s.kind}`) },
            { key: 'itemCount', header: t('studio.col.items'), sortable: true, align: 'end' },
            { key: 'dueDate', header: t('studio.col.due'), sortable: true, align: 'end', render: (s) => formatDate(s.dueDate, lang) },
            { key: 'status', header: t('studio.col.status'), render: (s) => <StatusPill status={s.status} /> },
          ]}
          rowActions={
            can('schedules.write')
              ? [
                  { id: 'review', label: t('studio.schedules.sendToReview'), onClick: sendToReview, when: (s) => s.status === 'draft' },
                  { id: 'final', label: t('studio.schedules.markFinal'), onClick: markFinal, when: (s) => s.status === 'in-review' },
                ]
              : undefined
          }
        />
      </Tabs>

      <Drawer
        open={current !== null}
        onClose={() => setOpen(null)}
        title={current?.title ?? t('studio.schedules.detail')}
        footer={
          current && (
            <Placeholder what={t('studio.schedules.openItemsWhat')}>
              <Button>{t('studio.schedules.openItems')}</Button>
            </Placeholder>
          )
        }
      >
        {current && (
          <KeyValue
            columns={2}
            items={[
              { key: t('studio.col.project'), value: nameOf(current.projectId) },
              { key: t('studio.col.kind'), value: t(`studio.schedules.kind.${current.kind}`) },
              { key: t('studio.col.items'), value: current.itemCount },
              { key: t('studio.col.due'), value: formatDate(current.dueDate, lang) },
              { key: t('studio.col.status'), value: <StatusPill status={current.status} /> },
              { key: t('studio.col.updated'), value: formatDate(current.updated_at, lang) },
            ]}
          />
        )}
      </Drawer>
    </>
  );
}
