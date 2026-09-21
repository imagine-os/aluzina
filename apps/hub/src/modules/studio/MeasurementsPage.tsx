import { useMemo } from 'react';
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
import type { Project, Task } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { measurementsSpec } from './specs';
import './studio.css';

const TO_VERIFY = ['development', 'documentation'];

export function MeasurementsPage() {
  const { t, lang } = useT();
  const { rows: projects, loading } = useTable('projects', { orderBy: 'name' });
  const { rows: tasks, loading: loadingTasks } = useTable('tasks', { where: { ownerRole: 'studio' }, orderBy: 'dueDate' });
  const { rows: schedules } = useTable('schedules');

  const projectName = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);
  const sites = useMemo(() => projects.filter((p) => TO_VERIFY.includes(p.phase)), [projects]);
  const openTasks = useMemo(() => tasks.filter((x) => x.status !== 'done'), [tasks]);
  const waiting = schedules.filter((s) => s.status !== 'final').length;

  const notWired: { key: string; title: string; what: string; desc: string }[] = [
    { key: 'sheet', title: t('studio.measurements.sheet'), what: t('studio.measurements.sheetWhat'), desc: t('studio.measurements.sheetDesc') },
    { key: 'requirements', title: t('studio.measurements.requirements'), what: t('studio.measurements.requirementsWhat'), desc: t('studio.measurements.requirementsDesc') },
    { key: 'photos', title: t('studio.measurements.photos'), what: t('studio.measurements.photosWhat'), desc: t('studio.measurements.photosDesc') },
  ];

  return (
    <>
      <PageHeader
        code={measurementsSpec.code}
        title={t('studio.measurements.title')}
        subtitle={t('studio.measurements.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.measurements.title') }]}
        actions={
          <Placeholder what={t('studio.measurements.openSheetWhat')}>
            <Button variant="primary">{t('studio.measurements.openSheet')}</Button>
          </Placeholder>
        }
      />

      <div className="studio-stats">
        <StatTile label={t('studio.measurements.stat.projects')} value={sites.length} tone="accent" glyph="▣" />
        <StatTile label={t('studio.measurements.stat.tasks')} value={openTasks.length} tone="warning" />
        <StatTile label={t('studio.measurements.stat.schedules')} value={waiting} tone="info" />
      </div>

      <div className="studio-stack">
        <Card title={t('studio.measurements.projects')} subtitle={t('studio.measurements.projectsSub')}>
          <DataTable<Project>
            caption={t('studio.measurements.projects')}
            rows={sites}
            rowKey={(p) => p.id}
            loading={loading}
            emptyTitle={t('studio.empty.title')}
            columns={[
              { key: 'name', header: t('studio.col.project'), sortable: true },
              { key: 'location', header: t('studio.col.location') },
              { key: 'phase', header: t('studio.col.phase'), render: (p) => <Badge tone="accent">{t(`studio.phase.${p.phase}`)}</Badge> },
              { key: 'dueDate', header: t('studio.col.due'), sortable: true, align: 'end', render: (p) => formatDate(p.dueDate, lang) },
            ]}
          />
        </Card>

        <Card title={t('studio.measurements.tasks')} subtitle={t('studio.measurements.tasksSub')}>
          <DataTable<Task>
            caption={t('studio.measurements.tasks')}
            rows={openTasks}
            rowKey={(x) => x.id}
            loading={loadingTasks}
            emptyTitle={t('studio.empty.title')}
            columns={[
              { key: 'title', header: t('studio.col.title'), sortable: true },
              { key: 'projectId', header: t('studio.col.project'), render: (x) => (x.projectId ? (projectName.get(x.projectId) ?? x.projectId) : t('studio.noProject')) },
              { key: 'assigneeId', header: t('studio.col.assignee'), render: (x) => demoUserById(x.assigneeId)?.name ?? x.assigneeId },
              { key: 'dueDate', header: t('studio.col.due'), sortable: true, align: 'end', render: (x) => formatDate(x.dueDate, lang) },
              { key: 'status', header: t('studio.col.status'), render: (x) => <StatusPill status={x.status} /> },
            ]}
          />
        </Card>

        <div className="studio-cards">
          {notWired.map((c) => (
            <Card key={c.key} title={c.title}>
              <p className="studio-muted">{c.desc}</p>
              <div className="studio-foot">
                <Placeholder what={c.what}>
                  <Button>{c.title}</Button>
                </Placeholder>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
