import { useMemo, useState } from 'react';
import { demoUserById } from '../../auth/demoUsers';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { ApprovalQueue, type ApprovalItem } from '../../components/organism/ApprovalQueue/ApprovalQueue';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import type { ConsistencyCheck, Project } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './founder.css';
import { approvalsSpec } from './specs';
import { checkSummary, useApprovals } from './useApprovals';

export function ApprovalsPage() {
  const { t, lang } = useT();
  const { projects, checks, waiting, decided, loading, approve, requestChanges, comment } = useApprovals();
  const [open, setOpen] = useState<ConsistencyCheck | null>(null);

  const projectName = useMemo(() => new Map(projects.map((p: Project) => [p.id, p.name])), [projects]);

  const items: ApprovalItem[] = waiting.map(({ project, check }) => ({
    id: project.id,
    title: project.name,
    subtitle: checkSummary(t, check),
    meta: t('founder.approvals.meta', { client: project.client, phase: t(`founder.phase.${project.phase}`), due: formatDate(project.dueDate, lang) }),
    status: project.approval,
  }));

  return (
    <div className="founder-page">
      <PageHeader
        code={approvalsSpec.code}
        title={t('founder.approvals.title')}
        subtitle={t('founder.approvals.desc')}
        breadcrumb={[{ label: t('founder.nav.home'), to: '/founder' }, { label: t('founder.approvals.title') }]}
      />

      <Card title={t('founder.approvals.queue')}>
        <ApprovalQueue
          items={items}
          label={t('founder.approvals.queueLabel')}
          emptyTitle={t('founder.approvals.empty')}
          onApprove={approve}
          onReject={requestChanges}
          onComment={comment}
        />
      </Card>

      <Card title={t('founder.approvals.checks')} footer={<p className="founder-note">{t('founder.approvals.readOnly')}</p>}>
        <DataTable<ConsistencyCheck>
          caption={t('founder.approvals.checksCaption')}
          rows={checks}
          rowKey={(c) => c.id}
          loading={loading}
          onRowActivate={setOpen}
          columns={[
            { key: 'title', header: t('founder.approvals.col.check') },
            { key: 'projectId', header: t('founder.common.project'), render: (c) => projectName.get(c.projectId) ?? c.projectId },
            {
              key: 'items',
              header: t('founder.approvals.col.items'),
              align: 'end',
              sortable: true,
              sortValue: (c) => c.items.filter((i) => i.ok).length,
              render: (c) => `${c.items.filter((i) => i.ok).length} / ${c.items.length}`,
            },
            { key: 'checkedById', header: t('founder.approvals.col.checkedBy'), render: (c) => demoUserById(c.checkedById)?.name ?? c.checkedById },
            { key: 'status', header: t('founder.common.status'), render: (c) => <StatusPill status={c.status} /> },
          ]}
          rowActions={[{ id: 'open', label: t('founder.approvals.open'), onClick: setOpen, variant: 'secondary' }]}
        />
      </Card>

      <Card title={t('founder.approvals.decided')}>
        <DataTable<{ project: Project; check: ConsistencyCheck | null }>
          caption={t('founder.approvals.decidedCaption')}
          rows={decided}
          rowKey={(e) => e.project.id}
          loading={loading}
          emptyTitle={t('founder.approvals.decidedEmpty')}
          dense
          columns={[
            { key: 'name', header: t('founder.common.project'), render: (e) => e.project.name },
            { key: 'client', header: t('founder.common.client'), render: (e) => e.project.client },
            { key: 'phase', header: t('founder.common.phase'), render: (e) => <Badge tone="neutral">{t(`founder.phase.${e.project.phase}`)}</Badge> },
            { key: 'approval', header: t('founder.common.approval'), render: (e) => <StatusPill status={e.project.approval} /> },
            { key: 'due', header: t('founder.common.due'), render: (e) => formatDate(e.project.dueDate, lang) },
          ]}
        />
      </Card>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        footer={
          <Button variant="secondary" onClick={() => setOpen(null)}>
            {t('founder.common.close')}
          </Button>
        }
      >
        {open && (
          <div className="founder-stack">
            <KeyValue
              columns={1}
              items={[
                { key: t('founder.common.project'), value: projectName.get(open.projectId) ?? open.projectId },
                { key: t('founder.approvals.col.checkedBy'), value: demoUserById(open.checkedById)?.name ?? open.checkedById },
                { key: t('founder.common.status'), value: <StatusPill status={open.status} /> },
                { key: t('founder.approvals.notes'), value: open.notes || t('founder.common.none') },
              ]}
            />
            <ul className="founder-checklist" aria-label={t('founder.approvals.itemsLabel')}>
              {open.items.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <Badge tone={item.ok ? 'success' : 'warning'}>{item.ok ? t('founder.approvals.itemOk') : t('founder.approvals.itemNotOk')}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Drawer>
    </div>
  );
}
