import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Document } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { plansSpec } from './specs';
import { useProjectIndex } from './useProjectIndex';
import './studio.css';

/** The studio owns drawings and specifications; contracts, invoices and PDFs live in other portals. */
const STUDIO_KINDS = ['plan', 'spec'];
const STATUSES = ['draft', 'final', 'sent', 'signed'];

export function PlansPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: documents, loading } = useTable('documents', { orderBy: 'title' });
  const { options: projectOptions, nameOf } = useProjectIndex();
  const [q, setQ] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState<Document | null>(null);

  const plans = useMemo(() => documents.filter((d) => STUDIO_KINDS.includes(d.kind)), [documents]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return plans.filter(
      (d) =>
        (!project || d.projectId === project) &&
        (!status || d.status === status) &&
        (!needle || `${d.title} ${d.kind} ${d.ownerRole}`.toLowerCase().includes(needle)),
    );
  }, [plans, q, project, status]);

  const current = open ? (documents.find((d) => d.id === open.id) ?? open) : null;

  const newVersion = async (d: Document) => {
    const next = d.version + 1;
    await data.update('documents', d.id, { version: next, status: 'draft' });
    toast(t('studio.plans.versioned', { n: next }));
  };
  const markFinal = async (d: Document) => {
    await data.update('documents', d.id, { status: 'final' });
    toast(t('studio.saved'));
  };

  return (
    <>
      <PageHeader
        code={plansSpec.code}
        title={t('studio.plans.title')}
        subtitle={t('studio.plans.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.plans.title') }]}
        actions={
          <Placeholder what={t('studio.plans.uploadWhat')}>
            <Button variant="primary">{t('studio.plans.upload')}</Button>
          </Placeholder>
        }
      />

      <div className="studio-stats">
        <StatTile label={t('studio.plans.stat.total')} value={plans.length} tone="accent" glyph="▦" />
        <StatTile label={t('studio.plans.stat.draft')} value={plans.filter((d) => d.status === 'draft').length} tone="warning" />
        <StatTile label={t('studio.plans.stat.final')} value={plans.filter((d) => d.status === 'final').length} tone="success" />
      </div>

      <div className="studio-filters">
        <FilterBar
          onClear={q || project || status ? () => { setQ(''); setProject(''); setStatus(''); } : undefined}
          summary={t('studio.filter.summary', { shown: shown.length, total: plans.length })}
        >
          <SearchField value={q} onChange={setQ} placeholder={t('studio.plans.search')} />
          <Select label={t('studio.col.project')} hideLabel value={project} onChange={(e) => setProject(e.target.value)} placeholder={t('studio.filter.allProjects')} options={projectOptions} />
          <Select label={t('studio.col.status')} hideLabel value={status} onChange={(e) => setStatus(e.target.value)} placeholder={t('studio.filter.allStatuses')} options={STATUSES.map((s) => ({ value: s, label: t(`core.status.${s}`) }))} />
        </FilterBar>
      </div>

      <DataTable<Document>
        caption={t('studio.plans.title')}
        rows={shown}
        rowKey={(d) => d.id}
        loading={loading}
        emptyTitle={t('studio.empty.title')}
        emptyDescription={t('studio.empty.desc')}
        onRowActivate={setOpen}
        initialSort={{ key: 'title', dir: 'asc' }}
        columns={[
          { key: 'title', header: t('studio.col.title'), sortable: true },
          { key: 'projectId', header: t('studio.col.project'), render: (d) => (d.projectId ? nameOf(d.projectId) : t('studio.noProject')) },
          { key: 'kind', header: t('studio.col.kind'), sortable: true, render: (d) => t(`studio.docKind.${d.kind}`) },
          { key: 'version', header: t('studio.col.version'), sortable: true, align: 'end' },
          { key: 'ownerRole', header: t('studio.col.owner'), render: (d) => t(`core.role.${d.ownerRole}`) },
          { key: 'status', header: t('studio.col.status'), render: (d) => <StatusPill status={d.status} /> },
        ]}
        rowActions={
          can('plans.write')
            ? [
                { id: 'version', label: t('studio.plans.newVersion'), onClick: newVersion },
                { id: 'final', label: t('studio.plans.markFinal'), onClick: markFinal, when: (d) => d.status === 'draft' },
              ]
            : undefined
        }
      />

      <Drawer
        open={current !== null}
        onClose={() => setOpen(null)}
        title={current?.title ?? t('studio.plans.detail')}
        footer={
          current && (
            <Placeholder what={t('studio.plans.openFileWhat')}>
              <Button>{t('studio.plans.openFile')}</Button>
            </Placeholder>
          )
        }
      >
        {current && (
          <KeyValue
            columns={2}
            items={[
              { key: t('studio.col.project'), value: current.projectId ? nameOf(current.projectId) : t('studio.noProject') },
              { key: t('studio.col.kind'), value: t(`studio.docKind.${current.kind}`) },
              { key: t('studio.col.version'), value: current.version },
              { key: t('studio.col.owner'), value: t(`core.role.${current.ownerRole}`) },
              { key: t('studio.col.status'), value: <StatusPill status={current.status} /> },
              { key: t('studio.col.updated'), value: formatDate(current.updated_at, lang) },
              { key: t('studio.plans.openFile'), value: current.url ?? t('studio.plans.noFile') },
            ]}
          />
        )}
      </Drawer>
    </>
  );
}
