import { useMemo, useState } from 'react';
import { demoUserById } from '../../auth/demoUsers';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useData, useTable } from '../../data/DataContext';
import type { Alert, Meeting, Project, Task } from '../../data/schema';
import { formatDate, formatDateTime } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import { teamSpec } from './specs';

const ROLES = ['founder', 'ops', 'studio', 'brand'] as const;
type RoleTab = (typeof ROLES)[number];

const PRIORITY_TONE: Record<string, 'neutral' | 'accent' | 'warning' | 'danger'> = { low: 'neutral', normal: 'neutral', high: 'warning', urgent: 'danger' };

export function TeamPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: tasks, loading } = useTable('tasks', { orderBy: 'dueDate' });
  const { rows: alerts } = useTable('alerts');
  const { rows: meetings } = useTable('meetings', { orderBy: 'startsAt' });
  const { rows: projects } = useTable('projects');
  const [tab, setTab] = useState<RoleTab>('founder');
  const [showDone, setShowDone] = useState(false);

  const projectName = useMemo(() => new Map(projects.map((p: Project) => [p.id, p.name])), [projects]);
  const nameOf = (id: string | null) => (id ? (projectName.get(id) ?? id) : t('founder.common.noProject'));

  const openCount = (role: string) => tasks.filter((task) => task.ownerRole === role && task.status !== 'done').length;
  const visible = useMemo(() => tasks.filter((task) => task.ownerRole === tab && (showDone || task.status !== 'done')), [tasks, tab, showDone]);

  const openAlerts = useMemo(() => alerts.filter((a) => a.status !== 'resolved').sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [alerts]);
  const shared = useMemo(() => meetings.filter((m) => m.kind === 'internal' || m.kind === 'strategic'), [meetings]);

  const complete = async (task: Task) => {
    await data.update('tasks', task.id, { status: 'done' });
    toast(t('founder.team.completed'));
  };

  return (
    <div className="founder-page">
      <PageHeader
        code={teamSpec.code}
        title={t('founder.team.title')}
        subtitle={t('founder.team.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.team.title') }]}
      />

      <ul className="founder-stats">
        {ROLES.map((role) => (
          <li key={role}>
            <StatTile label={t(`founder.role.${role}`)} value={openCount(role)} hint={t('founder.team.openTasks')} tone={openCount(role) > 3 ? 'warning' : 'neutral'} onActivate={() => setTab(role)} />
          </li>
        ))}
      </ul>

      <Card
        title={t('founder.team.tabs')}
        actions={<Checkbox label={t('founder.team.showDone')} checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />}
      >
        <Tabs label={t('founder.team.tabs')} value={tab} onChange={(id) => setTab(id as RoleTab)} tabs={ROLES.map((role) => ({ id: role, label: t(`founder.role.${role}`), count: openCount(role) }))}>
          <DataTable<Task>
            caption={t('founder.team.caption', { role: t(`founder.role.${tab}`) })}
            rows={visible}
            rowKey={(task) => task.id}
            loading={loading}
            emptyTitle={t('founder.team.tasksEmpty')}
            columns={[
              { key: 'title', header: t('founder.common.title') },
              { key: 'projectId', header: t('founder.common.project'), render: (task) => nameOf(task.projectId) },
              { key: 'assigneeId', header: t('founder.common.owner'), render: (task) => demoUserById(task.assigneeId)?.name ?? task.assigneeId },
              { key: 'priority', header: t('founder.team.col.priority'), render: (task) => <Badge tone={PRIORITY_TONE[task.priority] ?? 'neutral'}>{t(`founder.team.priority.${task.priority}`)}</Badge> },
              { key: 'dueDate', header: t('founder.common.due'), sortable: true, render: (task) => formatDate(task.dueDate, lang) },
              { key: 'status', header: t('founder.common.status'), render: (task) => <StatusPill status={task.status} /> },
            ]}
            rowActions={
              can('projects.write') ? [{ id: 'complete', label: t('founder.team.complete'), onClick: complete, variant: 'primary', when: (task) => task.ownerRole === 'founder' && task.status !== 'done' }] : undefined
            }
          />
        </Tabs>
      </Card>

      <div className="founder-cols">
        <Card title={t('founder.team.alerts')} footer={<p className="founder-note">{t('founder.home.alertsNote')}</p>}>
          <DataTable<Alert>
            caption={t('founder.team.alertsCaption')}
            rows={openAlerts}
            rowKey={(a) => a.id}
            emptyTitle={t('founder.home.alertsEmpty')}
            dense
            columns={[
              { key: 'title', header: t('founder.common.title') },
              { key: 'forRole', header: t('founder.team.col.for'), render: (a) => t(`founder.role.${a.forRole}`) },
              { key: 'severity', header: t('founder.team.col.severity'), render: (a) => <StatusPill status={a.severity} /> },
              { key: 'dueDate', header: t('founder.common.due'), sortable: true, render: (a) => formatDate(a.dueDate, lang) },
            ]}
          />
        </Card>

        <Card title={t('founder.team.meetings')}>
          <DataTable<Meeting>
            caption={t('founder.team.meetings')}
            rows={shared}
            rowKey={(m) => m.id}
            emptyTitle={t('founder.team.meetingsEmpty')}
            dense
            columns={[
              { key: 'title', header: t('founder.common.title') },
              { key: 'startsAt', header: t('founder.common.date'), render: (m) => formatDateTime(m.startsAt, lang) },
              { key: 'kind', header: t('founder.common.type'), render: (m) => <Badge tone="neutral">{t(`founder.meeting.kind.${m.kind}`)}</Badge> },
            ]}
          />
        </Card>
      </div>

      <Card title={t('founder.team.vision')}>
        <Placeholder what={t('founder.team.visionWhat')}>
          <p className="founder-note">{t('founder.team.visionBody')}</p>
        </Placeholder>
      </Card>
    </div>
  );
}
