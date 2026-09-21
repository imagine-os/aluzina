import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { demoUserById } from '../../auth/demoUsers';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Document, Project } from '../../data/schema';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { projectsSpec } from './specs';
import './studio.css';

const PHASES = ['lead', 'concept', 'development', 'documentation', 'procurement', 'execution', 'delivered'];
const APPROVALS = ['draft', 'in-check', 'awaiting-founder', 'changes-requested', 'approved', 'client-approved'];
/** Only these approval states can be handed back into the studio consistency check. */
const SENDABLE = ['draft', 'changes-requested'];

export function ProjectsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: projects, loading } = useTable('projects', { orderBy: 'name' });
  const { rows: documents } = useTable('documents', { orderBy: 'title' });
  const [q, setQ] = useState('');
  const [phase, setPhase] = useState('');
  const [approval, setApproval] = useState('');
  const [open, setOpen] = useState<Project | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (!phase || p.phase === phase) &&
        (!approval || p.approval === approval) &&
        (!needle || `${p.name} ${p.client} ${p.location} ${p.summary}`.toLowerCase().includes(needle)),
    );
  }, [projects, q, phase, approval]);

  const current = open ? (projects.find((p) => p.id === open.id) ?? open) : null;
  const projectDocs = useMemo(() => (current ? documents.filter((d) => d.projectId === current.id) : []), [documents, current]);

  const sendToCheck = async (p: Project) => {
    await data.update('projects', p.id, { approval: 'in-check' });
    toast(t('studio.projects.sent'));
  };

  const facts = (p: Project) => [
    { key: t('studio.col.phase'), value: <Badge tone="accent">{t(`studio.phase.${p.phase}`)}</Badge> },
    { key: t('studio.col.direction'), value: <Badge tone={p.creativeDirection === 'set' ? 'success' : 'warning'}>{t(`studio.direction.${p.creativeDirection}`)}</Badge> },
    { key: t('studio.col.approval'), value: <StatusPill status={p.approval} /> },
    { key: t('studio.col.due'), value: formatDate(p.dueDate, lang) },
  ];

  return (
    <>
      <PageHeader
        code={projectsSpec.code}
        title={t('studio.projects.title')}
        subtitle={t('studio.projects.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.projects.title') }]}
        actions={
          <Placeholder what={t('studio.projects.newProposalWhat')}>
            <Button variant="primary">{t('studio.projects.newProposal')}</Button>
          </Placeholder>
        }
      />

      <div className="studio-filters">
        <FilterBar
          onClear={q || phase || approval ? () => { setQ(''); setPhase(''); setApproval(''); } : undefined}
          summary={t('studio.filter.summary', { shown: shown.length, total: projects.length })}
        >
          <SearchField value={q} onChange={setQ} placeholder={t('studio.projects.search')} />
          <Select label={t('studio.col.phase')} hideLabel value={phase} onChange={(e) => setPhase(e.target.value)} placeholder={t('studio.filter.allPhases')} options={PHASES.map((p) => ({ value: p, label: t(`studio.phase.${p}`) }))} />
          <Select label={t('studio.col.approval')} hideLabel value={approval} onChange={(e) => setApproval(e.target.value)} placeholder={t('studio.filter.allStatuses')} options={APPROVALS.map((a) => ({ value: a, label: t(`core.status.${a}`) }))} />
        </FilterBar>
      </div>

      {!loading && shown.length === 0 && <EmptyState title={t('studio.empty.title')} description={t('studio.empty.desc')} />}

      <div className="studio-cards">
        {shown.map((p) => (
          <Card
            key={p.id}
            title={p.name}
            subtitle={`${p.client} · ${p.location}`}
            footer={
              <Button variant="secondary" fullWidth onClick={() => setOpen(p)}>
                {t('studio.projects.open')}
              </Button>
            }
          >
            <KeyValue items={facts(p)} columns={2} />
            <p className="studio-note">{p.summary}</p>
          </Card>
        ))}
      </div>

      <Drawer
        open={current !== null}
        onClose={() => setOpen(null)}
        title={current?.name ?? t('studio.projects.detail')}
        footer={
          current && (
            <div className="studio-foot">
              <Placeholder what={t('studio.projects.requestDirectionWhat')}>
                <Button>{t('studio.projects.requestDirection')}</Button>
              </Placeholder>
              <span className="studio-foot__spacer" />
              {can('design.develop') && SENDABLE.includes(current.approval) ? (
                <Button variant="primary" onClick={() => sendToCheck(current)}>
                  {t('studio.projects.sendToCheck')}
                </Button>
              ) : (
                <p className="studio-hint">{t('studio.projects.sendHint')}</p>
              )}
            </div>
          )
        }
      >
        {current && (
          <div className="studio-detail">
            <KeyValue
              columns={2}
              items={[
                ...facts(current),
                { key: t('studio.col.client'), value: current.client },
                { key: t('studio.col.location'), value: current.location },
                { key: t('studio.projects.lead'), value: demoUserById(current.leadDesignerId)?.name ?? current.leadDesignerId },
                { key: t('studio.col.budget'), value: formatCop(current.budgetCop, lang) },
                { key: t('studio.projects.summary'), value: current.summary },
              ]}
            />
            <DataTable<Document>
              caption={t('studio.projects.documents')}
              rows={projectDocs}
              rowKey={(d) => d.id}
              dense
              emptyTitle={t('studio.empty.title')}
              columns={[
                { key: 'title', header: t('studio.col.title') },
                { key: 'kind', header: t('studio.col.kind') },
                { key: 'version', header: t('studio.col.version'), align: 'end' },
                { key: 'status', header: t('studio.col.status'), render: (d) => <StatusPill status={d.status} /> },
              ]}
            />
          </div>
        )}
      </Drawer>
    </>
  );
}
