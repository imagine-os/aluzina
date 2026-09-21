import { useMemo } from 'react';
import { demoUserById } from '../../auth/demoUsers';
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
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useData, useTable } from '../../data/DataContext';
import type { Material, Meeting, Project, RenderPack, Task } from '../../data/schema';
import { formatCop, formatDate, formatDateTime } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import { phaseTone } from './pipelineData';
import { productsSpec } from './specs';

export function ProductsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: projects, loading } = useTable('projects', { where: { type: 'lighting-product' }, orderBy: 'name' });
  const { rows: materials } = useTable('materials', { orderBy: 'name' });
  const { rows: packs } = useTable('renderPacks');
  const { rows: tasks } = useTable('tasks');
  const { rows: meetings } = useTable('meetings', { where: { kind: 'strategic' }, orderBy: 'startsAt' });

  const projectName = useMemo(() => new Map(projects.map((p: Project) => [p.id, p.name])), [projects]);
  const mayWrite = can('products.write');

  const approveMaterial = async (m: Material) => {
    await data.update('materials', m.id, { status: 'approved' });
    toast(t('founder.products.approved', { name: m.name }));
  };

  return (
    <div className="founder-page">
      <PageHeader
        code={productsSpec.code}
        title={t('founder.products.title')}
        subtitle={t('founder.products.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.products.title') }]}
        actions={
          <Placeholder what={t('founder.products.newWhat')}>
            <Button variant="primary">{t('founder.products.new')}</Button>
          </Placeholder>
        }
      />

      {!loading && projects.length === 0 && <EmptyState title={t('founder.products.empty')} description={t('founder.products.emptyDesc')} glyph="◇" />}

      {projects.map((project) => {
        const projectMaterials = materials.filter((m) => m.projectId === project.id);
        const projectPacks = packs.filter((p) => p.projectId === project.id);
        const projectTasks = tasks.filter((task) => task.projectId === project.id && task.status !== 'done');
        return (
          <Card key={project.id} title={project.name} subtitle={project.summary}>
            <div className="founder-stack">
              <KeyValue
                columns={2}
                items={[
                  { key: t('founder.common.phase'), value: <Badge tone={phaseTone(project.phase)}>{t(`founder.phase.${project.phase}`)}</Badge> },
                  { key: t('founder.common.creativeDirection'), value: t(`founder.cd.${project.creativeDirection}`) },
                  { key: t('founder.common.budget'), value: formatCop(project.budgetCop, lang) },
                  { key: t('founder.common.location'), value: project.location },
                ]}
              />

              <DataTable<Material>
                caption={t('founder.products.materialsCaption', { project: project.name })}
                rows={projectMaterials}
                rowKey={(m) => m.id}
                dense
                columns={[
                  { key: 'name', header: t('founder.products.col.material') },
                  { key: 'category', header: t('founder.common.type') },
                  { key: 'finish', header: t('founder.products.col.finish') },
                  { key: 'unitCop', header: t('founder.products.col.unit'), align: 'end', render: (m) => (m.unitCop === null ? '—' : formatCop(m.unitCop, lang)) },
                  { key: 'status', header: t('founder.common.status'), render: (m) => <StatusPill status={m.status} /> },
                ]}
                rowActions={mayWrite ? [{ id: 'approve', label: t('founder.products.approve'), onClick: approveMaterial, variant: 'primary', when: (m) => m.status !== 'approved' }] : undefined}
              />

              <DataTable<RenderPack>
                caption={t('founder.products.packsCaption', { project: project.name })}
                rows={projectPacks}
                rowKey={(p) => p.id}
                dense
                columns={[
                  { key: 'title', header: t('founder.common.title') },
                  { key: 'audience', header: t('founder.products.col.audience'), render: (p) => t(`founder.products.audience.${p.audience}`) },
                  { key: 'viewCount', header: t('founder.products.col.views'), align: 'end' },
                  { key: 'dueDate', header: t('founder.common.due'), render: (p) => formatDate(p.dueDate, lang) },
                  { key: 'status', header: t('founder.common.status'), render: (p) => <StatusPill status={p.status} /> },
                ]}
              />

              <DataTable<Task>
                caption={t('founder.products.tasksCaption', { project: project.name })}
                rows={projectTasks}
                rowKey={(task) => task.id}
                emptyTitle={t('founder.products.tasksEmpty')}
                dense
                columns={[
                  { key: 'title', header: t('founder.products.tasks') },
                  { key: 'assigneeId', header: t('founder.common.owner'), render: (task) => demoUserById(task.assigneeId)?.name ?? task.assigneeId },
                  { key: 'dueDate', header: t('founder.common.due'), render: (task) => formatDate(task.dueDate, lang) },
                  { key: 'status', header: t('founder.common.status'), render: (task) => <StatusPill status={task.status} /> },
                ]}
              />
            </div>
          </Card>
        );
      })}

      <Card title={t('founder.products.meetings')}>
        <DataTable<Meeting>
          caption={t('founder.products.meetings')}
          rows={meetings}
          rowKey={(m) => m.id}
          emptyTitle={t('founder.products.meetingsEmpty')}
          dense
          columns={[
            { key: 'title', header: t('founder.common.title') },
            { key: 'startsAt', header: t('founder.common.date'), render: (m) => formatDateTime(m.startsAt, lang) },
            { key: 'projectId', header: t('founder.common.project'), render: (m) => (m.projectId ? (projectName.get(m.projectId) ?? m.projectId) : t('founder.common.noProject')) },
            { key: 'location', header: t('founder.common.location') },
          ]}
        />
      </Card>

      <Card title={t('founder.products.roadmap')}>
        <Placeholder what={t('founder.products.roadmapWhat')}>
          <p className="founder-note">{t('founder.products.roadmapBody')}</p>
        </Placeholder>
      </Card>
    </div>
  );
}
