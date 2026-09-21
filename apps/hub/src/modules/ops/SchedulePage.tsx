import { useMemo, useState } from 'react';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Calendar, type CalendarEvent } from '../../components/organism/Calendar/Calendar';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Timeline, type TimelineRow } from '../../components/organism/Timeline/Timeline';
import { useTable } from '../../data/DataContext';
import { formatCop, formatDate, formatDateTime } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueLabel, monthOf, outstanding, todayIso, useLookups } from './helpers';
import './ops.css';
import { scheduleSpec } from './specs';

interface Detail {
  title: string;
  items: { key: string; value: string }[];
  status?: string;
}

export function SchedulePage() {
  const { t, lang } = useT();
  const { projectName, supplierName, userName } = useLookups();
  const { rows: tasks } = useTable('tasks', { orderBy: 'dueDate' });
  const { rows: meetings } = useTable('meetings', { orderBy: 'startsAt' });
  const { rows: deliveries } = useTable('deliveries', { orderBy: 'expectedDate' });
  const { rows: payments } = useTable('payments', { orderBy: 'dueDate' });
  const [tab, setTab] = useState('timeline');
  const [month, setMonth] = useState(() => monthOf(todayIso()));
  const [detail, setDetail] = useState<Detail | null>(null);

  const timelineRows = useMemo<TimelineRow[]>(() => {
    const dueById = new Map(tasks.map((x) => [x.id, x.dueDate]));
    return tasks
      .filter((x) => x.dueDate !== null)
      .map((x) => {
        const end = x.dueDate as string;
        // Planned start when the task has one (tasks.startDate); otherwise derived from creation / dependencies.
        const depEnds = x.dependsOn.map((id) => dueById.get(id)).filter((d): d is string => Boolean(d));
        const opened = x.created_at.slice(0, 10);
        const candidate = x.startDate ?? ([opened, ...depEnds].sort().pop() as string);
        const start = candidate > end ? end : candidate;
        return {
          id: x.id,
          label: x.title,
          start,
          end,
          dependsOn: x.dependsOn,
          tone: x.status === 'done' ? 'success' : x.status === 'blocked' ? 'warning' : x.priority === 'urgent' ? 'danger' : 'accent',
          meta: projectName(x.projectId) ?? t('ops.common.internal'),
        } satisfies TimelineRow;
      });
  }, [tasks, projectName, t]);

  const events = useMemo<CalendarEvent[]>(() => {
    const list: CalendarEvent[] = [];
    for (const m of meetings) list.push({ id: `mtg:${m.id}`, date: m.startsAt, title: m.title, meta: t('ops.schedule.kind.meeting'), tone: 'accent' });
    for (const d of deliveries) list.push({ id: `dlv:${d.id}`, date: d.confirmedDate ?? d.expectedDate, title: d.item, meta: `${t('ops.schedule.kind.delivery')} · ${supplierName(d.supplierId) ?? ''}`, tone: d.status === 'delayed' ? 'warning' : 'info' });
    for (const p of payments) list.push({ id: `pay:${p.id}`, date: p.dueDate, title: `${p.counterparty} — ${formatCop(outstanding(p), lang)}`, meta: `${t('ops.schedule.kind.payment')} · ${t(`ops.payments.direction.${p.direction}`)}`, tone: p.status === 'paid' ? 'success' : p.status === 'overdue' ? 'danger' : 'warning' });
    return list;
  }, [meetings, deliveries, payments, supplierName, t, lang]);

  const openTask = (row: TimelineRow) => {
    const task = tasks.find((x) => x.id === row.id);
    if (!task) return;
    setDetail({
      title: task.title,
      status: task.status,
      items: [
        { key: t('ops.common.project'), value: projectName(task.projectId) ?? t('ops.common.internal') },
        { key: t('ops.tasks.assignee'), value: userName(task.assigneeId) },
        { key: t('ops.tasks.priority'), value: t(`ops.priority.${task.priority}`) },
        { key: t('ops.common.due'), value: `${formatDate(task.dueDate, lang)} · ${dueLabel(task.dueDate, t)}` },
        { key: t('ops.tasks.dependsOn'), value: task.dependsOn.map((id) => tasks.find((y) => y.id === id)?.title ?? id).join(', ') || '—' },
      ],
    });
  };

  const openEvent = (event: CalendarEvent) => {
    const [kind, id] = event.id.split(':');
    if (kind === 'mtg') {
      const m = meetings.find((x) => x.id === id);
      if (!m) return;
      setDetail({
        title: m.title,
        items: [
          { key: t('ops.schedule.kind.meeting'), value: formatDateTime(m.startsAt, lang) },
          { key: t('ops.home.agenda.where'), value: m.location },
          { key: t('ops.common.project'), value: projectName(m.projectId) ?? t('ops.common.internal') },
          { key: t('ops.tasks.assignee'), value: m.attendeeIds.map(userName).join(', ') },
          { key: t('ops.common.notes'), value: m.notes || '—' },
        ],
      });
      return;
    }
    if (kind === 'dlv') {
      const d = deliveries.find((x) => x.id === id);
      if (!d) return;
      setDetail({
        title: d.item,
        status: d.status,
        items: [
          { key: t('ops.common.supplier'), value: supplierName(d.supplierId) ?? '—' },
          { key: t('ops.common.project'), value: projectName(d.projectId) ?? t('ops.common.internal') },
          { key: t('ops.deliveries.col.expected'), value: formatDate(d.expectedDate, lang) },
          { key: t('ops.deliveries.col.confirmed'), value: formatDate(d.confirmedDate, lang) },
        ],
      });
      return;
    }
    const p = payments.find((x) => x.id === id);
    if (!p) return;
    setDetail({
      title: `${p.counterparty} — ${p.concept}`,
      status: p.status,
      items: [
        { key: t('ops.payments.col.direction'), value: t(`ops.payments.direction.${p.direction}`) },
        { key: t('ops.common.amount'), value: formatCop(p.amountCop, lang) },
        { key: t('ops.payments.col.outstanding'), value: formatCop(outstanding(p), lang) },
        { key: t('ops.common.due'), value: `${formatDate(p.dueDate, lang)} · ${dueLabel(p.dueDate, t)}` },
        { key: t('ops.common.project'), value: projectName(p.projectId) ?? t('ops.common.internal') },
      ],
    });
  };

  return (
    <div className="ops-stack">
      <PageHeader
        code={scheduleSpec.code}
        title={t('ops.schedule.title')}
        subtitle={t('ops.schedule.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.schedule.title') }]}
        actions={
          <Placeholder what={t('ops.schedule.newMeetingWhat')}>
            <Button variant="primary">{t('ops.schedule.newMeeting')}</Button>
          </Placeholder>
        }
      />

      <Tabs
        label={t('ops.schedule.title')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'timeline', label: t('ops.schedule.tab.timeline'), count: timelineRows.length },
          { id: 'calendar', label: t('ops.schedule.tab.calendar'), count: events.filter((e) => e.date.startsWith(month)).length },
        ]}
      >
        {tab === 'timeline' ? (
          <>
            <p className="ops-note">{t('ops.schedule.timelineNote')}</p>
            {timelineRows.length === 0 ? (
              <EmptyState title={t('ops.schedule.noTasks')} glyph="▦" />
            ) : (
              <Timeline rows={timelineRows} label={t('ops.schedule.timelineLabel')} onActivate={openTask} />
            )}
          </>
        ) : (
          <>
            <p className="ops-note">{t('ops.schedule.legend')}</p>
            <Calendar month={month} onMonthChange={setMonth} events={events} label={t('ops.schedule.calendarLabel')} onSelect={openEvent} />
          </>
        )}
      </Tabs>

      <Drawer open={detail !== null} onClose={() => setDetail(null)} title={detail?.title ?? t('ops.common.detail')}>
        {detail && (
          <>
            {detail.status && <StatusPill status={detail.status} />}
            <KeyValue items={detail.items} columns={1} />
          </>
        )}
      </Drawer>
    </div>
  );
}
