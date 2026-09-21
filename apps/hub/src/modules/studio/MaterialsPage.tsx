import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
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
import type { Material, MaterialStatus } from '../../data/schema';
import { formatCop } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { materialsSpec } from './specs';
import { useProjectIndex } from './useProjectIndex';
import './studio.css';

const STATUSES: MaterialStatus[] = ['proposed', 'sampled', 'approved', 'rejected'];

export function MaterialsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows: materials, loading } = useTable('materials', { orderBy: 'name' });
  const { rows: suppliers } = useTable('suppliers');
  const { options: projectOptions, nameOf } = useProjectIndex();
  const [q, setQ] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState<Material | null>(null);

  const supplierName = useMemo(() => new Map(suppliers.map((s) => [s.id, s.name])), [suppliers]);
  const palettes = useMemo(() => [...new Set(materials.map((m) => m.palette))].sort((a, b) => a.localeCompare(b)), [materials]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return materials.filter(
      (m) =>
        (!project || m.projectId === project) &&
        (!status || m.status === status) &&
        (!needle || `${m.name} ${m.category} ${m.finish} ${m.color} ${m.palette}`.toLowerCase().includes(needle)),
    );
  }, [materials, q, project, status]);

  const shownPalettes = useMemo(() => palettes.filter((p) => shown.some((m) => m.palette === p)), [palettes, shown]);
  const current = open ? (materials.find((m) => m.id === open.id) ?? open) : null;

  const setStatusOf = async (m: Material, next: MaterialStatus) => {
    await data.update('materials', m.id, { status: next });
    toast(t('studio.saved'));
  };

  const rowActions = can('materials.manage')
    ? [
        { id: 'sample', label: t('studio.materials.requestSample'), onClick: (m: Material) => setStatusOf(m, 'sampled'), when: (m: Material) => m.status === 'proposed' },
        { id: 'approve', label: t('studio.materials.approve'), onClick: (m: Material) => setStatusOf(m, 'approved'), when: (m: Material) => m.status === 'sampled' || m.status === 'rejected' },
        { id: 'reject', label: t('studio.materials.reject'), variant: 'danger' as const, onClick: (m: Material) => setStatusOf(m, 'rejected'), when: (m: Material) => m.status !== 'rejected' },
      ]
    : undefined;

  return (
    <>
      <PageHeader
        code={materialsSpec.code}
        title={t('studio.materials.title')}
        subtitle={t('studio.materials.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.materials.title') }]}
        actions={
          <Placeholder what={t('studio.materials.newPaletteWhat')}>
            <Button variant="primary">{t('studio.materials.newPalette')}</Button>
          </Placeholder>
        }
      />

      <div className="studio-filters">
        <FilterBar
          onClear={q || project || status ? () => { setQ(''); setProject(''); setStatus(''); } : undefined}
          summary={t('studio.filter.summary', { shown: shown.length, total: materials.length })}
        >
          <SearchField value={q} onChange={setQ} placeholder={t('studio.materials.search')} />
          <Select label={t('studio.col.project')} hideLabel value={project} onChange={(e) => setProject(e.target.value)} placeholder={t('studio.filter.allProjects')} options={projectOptions} />
          <Select label={t('studio.col.status')} hideLabel value={status} onChange={(e) => setStatus(e.target.value)} placeholder={t('studio.filter.allStatuses')} options={STATUSES.map((s) => ({ value: s, label: t(`core.status.${s}`) }))} />
        </FilterBar>
      </div>

      {!loading && shown.length === 0 && <EmptyState title={t('studio.empty.title')} description={t('studio.empty.desc')} />}

      <div className="studio-stack">
        {shownPalettes.map((palette) => {
          const rows = shown.filter((m) => m.palette === palette);
          return (
            <Card key={palette} title={palette} subtitle={t('studio.materials.count', { n: rows.length, approved: rows.filter((m) => m.status === 'approved').length })}>
              <DataTable<Material>
                caption={palette}
                rows={rows}
                rowKey={(m) => m.id}
                loading={loading}
                emptyTitle={t('studio.empty.title')}
                onRowActivate={setOpen}
                rowActions={rowActions}
                columns={[
                  { key: 'name', header: t('studio.col.title'), sortable: true },
                  { key: 'category', header: t('studio.col.category'), sortable: true },
                  { key: 'finish', header: t('studio.col.finish') },
                  { key: 'color', header: t('studio.col.colour') },
                  { key: 'unitCop', header: t('studio.col.unit'), sortable: true, align: 'end', render: (m) => (m.unitCop === null ? t('studio.materials.noPrice') : formatCop(m.unitCop, lang)) },
                  { key: 'status', header: t('studio.col.status'), render: (m) => <StatusPill status={m.status} /> },
                ]}
              />
            </Card>
          );
        })}
      </div>

      <Drawer open={current !== null} onClose={() => setOpen(null)} title={current?.name ?? t('studio.materials.title')}>
        {current && (
          <KeyValue
            columns={2}
            items={[
              { key: t('studio.col.project'), value: current.projectId ? nameOf(current.projectId) : t('studio.noProject') },
              { key: t('studio.col.palette'), value: current.palette },
              { key: t('studio.col.category'), value: current.category },
              { key: t('studio.col.finish'), value: current.finish },
              { key: t('studio.col.colour'), value: current.color },
              { key: t('studio.col.unit'), value: current.unitCop === null ? t('studio.materials.noPrice') : formatCop(current.unitCop, lang) },
              { key: t('studio.col.supplier'), value: current.supplierId ? (supplierName.get(current.supplierId) ?? current.supplierId) : t('studio.materials.noSupplier') },
              { key: t('studio.col.status'), value: <StatusPill status={current.status} /> },
            ]}
          />
        )}
      </Drawer>
    </>
  );
}
