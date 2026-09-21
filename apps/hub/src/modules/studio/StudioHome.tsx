import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoUserById } from '../../auth/demoUsers';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useTable } from '../../data/DataContext';
import type { ConsistencyCheck, Project, RenderPack, Task } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { homeSpec } from './specs';
import './studio.css';

const IN_DEVELOPMENT = ['development', 'documentation'];

export function StudioHome() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { rows: projects, loading: loadingProjects } = useTable('projects', { orderBy: 'dueDate' });
  const { rows: checks, loading: loadingChecks } = useTable('consistencyChecks');
  const { rows: tasks, loading: loadingTasks } = useTable('tasks', { where: { ownerRole: 'studio' }, orderBy: 'dueDate' });
  const { rows: packs, loading: loadingPacks } = useTable('renderPacks', { orderBy: 'dueDate' });

  const projectName = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);
  const inDevelopment = useMemo(() => projects.filter((p) => IN_DEVELOPMENT.includes(p.phase)), [projects]);
  const openChecks = useMemo(() => checks.filter((c) => c.status !== 'passed'), [checks]);
  const openTasks = useMemo(() => tasks.filter((x) => x.status !== 'done'), [tasks]);
  const flightPacks = useMemo(() => packs.filter((p) => p.status !== 'delivered'), [packs]);

  return (
    <>
      <PageHeader
        code={homeSpec.code}
        title={t('studio.home.title')}
        subtitle={t('studio.home.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.home.title') }]}
        actions={
          <Placeholder what={t('studio.home.newProposalWhat')}>
            <Button variant="primary">{t('studio.home.newProposal')}</Button>
          </Placeholder>
        }
      />

      <div className="studio-stats">
        <StatTile label={t('studio.home.stat.development')} value={inDevelopment.length} hint={t('studio.home.stat.developmentHint')} tone="accent" glyph="▤" onActivate={() => navigate('/studio/projects')} />
        <StatTile label={t('studio.home.stat.checks')} value={openChecks.length} hint={t('studio.home.stat.checksHint')} tone="warning" glyph="✓" onActivate={() => navigate('/studio/checks')} />
        <StatTile label={t('studio.home.stat.tasks')} value={openTasks.length} hint={t('studio.home.stat.tasksHint')} tone="info" glyph="☷" />
        <StatTile label={t('studio.home.stat.packs')} value={flightPacks.length} hint={t('studio.home.stat.packsHint')} tone="neutral" glyph="▷" onActivate={() => navigate('/studio/packs')} />
      </div>

      <div className="studio-stack">
        <Card title={t('studio.home.projects')} subtitle={t('studio.home.projectsSub')}>
          <DataTable<Project>
            caption={t('studio.home.projects')}
            rows={inDevelopment}
            rowKey={(p) => p.id}
            loading={loadingProjects}
            emptyTitle={t('studio.empty.title')}
            onRowActivate={() => navigate('/studio/projects')}
            columns={[
              { key: 'name', header: t('studio.col.project'), sortable: true },
              { key: 'phase', header: t('studio.col.phase'), render: (p) => <Badge tone="accent">{t(`studio.phase.${p.phase}`)}</Badge> },
              { key: 'creativeDirection', header: t('studio.col.direction'), render: (p) => <Badge tone={p.creativeDirection === 'set' ? 'success' : 'warning'}>{t(`studio.direction.${p.creativeDirection}`)}</Badge> },
              { key: 'approval', header: t('studio.col.approval'), render: (p) => <StatusPill status={p.approval} /> },
              { key: 'dueDate', header: t('studio.col.due'), sortable: true, align: 'end', render: (p) => formatDate(p.dueDate, lang) },
            ]}
            rowActions={[{ id: 'open', label: t('studio.home.open'), onClick: () => navigate('/studio/projects') }]}
          />
        </Card>

        <Card title={t('studio.home.checks')} subtitle={t('studio.home.checksSub')}>
          <DataTable<ConsistencyCheck>
            caption={t('studio.home.checks')}
            rows={openChecks}
            rowKey={(c) => c.id}
            loading={loadingChecks}
            emptyTitle={t('studio.checks.empty')}
            emptyDescription={t('studio.checks.emptyDesc')}
            onRowActivate={() => navigate('/studio/checks')}
            columns={[
              { key: 'title', header: t('studio.col.title'), sortable: true },
              { key: 'projectId', header: t('studio.col.project'), render: (c) => projectName.get(c.projectId) ?? c.projectId },
              { key: 'items', header: t('studio.col.items'), align: 'end', sortValue: (c) => c.items.filter((i) => i.ok).length, render: (c) => t('studio.checks.progress', { ok: c.items.filter((i) => i.ok).length, total: c.items.length }) },
              { key: 'status', header: t('studio.col.status'), render: (c) => <StatusPill status={c.status} /> },
            ]}
            rowActions={[{ id: 'open', label: t('studio.home.open'), onClick: () => navigate('/studio/checks') }]}
          />
        </Card>

        <Card
          title={t('studio.home.tasks')}
          subtitle={t('studio.home.tasksSub')}
          footer={
            <div className="studio-foot">
              <Placeholder what={t('studio.home.rescheduleWhat')}>
                <Button size="sm">{t('studio.home.reschedule')}</Button>
              </Placeholder>
              <span className="studio-foot__spacer" />
            </div>
          }
        >
          <DataTable<Task>
            caption={t('studio.home.tasks')}
            rows={openTasks}
            rowKey={(x) => x.id}
            loading={loadingTasks}
            emptyTitle={t('studio.empty.title')}
            columns={[
              { key: 'title', header: t('studio.col.title'), sortable: true },
              { key: 'projectId', header: t('studio.col.project'), render: (x) => (x.projectId ? (projectName.get(x.projectId) ?? x.projectId) : t('studio.noProject')) },
              { key: 'assigneeId', header: t('studio.col.assignee'), render: (x) => demoUserById(x.assigneeId)?.name ?? x.assigneeId },
              { key: 'priority', header: t('studio.col.priority'), render: (x) => <Badge tone={x.priority === 'urgent' ? 'danger' : x.priority === 'high' ? 'warning' : 'neutral'}>{t(`studio.priority.${x.priority}`)}</Badge> },
              { key: 'dueDate', header: t('studio.col.due'), sortable: true, align: 'end', render: (x) => formatDate(x.dueDate, lang) },
              { key: 'status', header: t('studio.col.status'), render: (x) => <StatusPill status={x.status} /> },
            ]}
          />
        </Card>

        <Card title={t('studio.home.packs')}>
          <DataTable<RenderPack>
            caption={t('studio.home.packs')}
            rows={flightPacks}
            rowKey={(p) => p.id}
            loading={loadingPacks}
            emptyTitle={t('studio.empty.title')}
            onRowActivate={() => navigate('/studio/packs')}
            columns={[
              { key: 'title', header: t('studio.col.title'), sortable: true },
              { key: 'projectId', header: t('studio.col.project'), render: (p) => projectName.get(p.projectId) ?? p.projectId },
              { key: 'audience', header: t('studio.col.audience'), render: (p) => t(`studio.packs.audience.${p.audience}`) },
              { key: 'viewCount', header: t('studio.col.views'), sortable: true, align: 'end' },
              { key: 'dueDate', header: t('studio.col.due'), sortable: true, align: 'end', render: (p) => formatDate(p.dueDate, lang) },
              { key: 'status', header: t('studio.col.status'), render: (p) => <StatusPill status={p.status} /> },
            ]}
            rowActions={[{ id: 'open', label: t('studio.home.open'), onClick: () => navigate('/studio/packs') }]}
          />
        </Card>
      </div>
    </>
  );
}
