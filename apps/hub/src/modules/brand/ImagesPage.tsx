import { useMemo, useState } from 'react';
import { demoUserById } from '../../auth/demoUsers';
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
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Project, Revision } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { isOverdue, nextStatus, REVISION_FLOW } from './helpers';
import { imagesSpec } from './specs';
import './brand.css';

/** G-05: the image sets prepared for clients (revisions of kind `image`), grouped by project. */
export function ImagesPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows, loading } = useTable('revisions', { where: { kind: 'image' } });
  const { rows: projects } = useTable('projects');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState<Revision | null>(null);

  const projectName = useMemo(() => new Map(projects.map((p: Project) => [p.id, p.name])), [projects]);
  const noProject = t('brand.noProject');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (!needle) return true;
      return `${r.title} ${projectName.get(r.projectId ?? '') ?? ''}`.toLowerCase().includes(needle);
    });
  }, [rows, q, status, projectName]);

  const groups = useMemo(() => {
    const map = new Map<string, Revision[]>();
    for (const r of filtered) {
      const key = r.projectId ?? '';
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => (projectName.get(a) ?? noProject).localeCompare(projectName.get(b) ?? noProject));
  }, [filtered, projectName, noProject]);

  const count = (s: Revision['status']) => rows.filter((r) => r.status === s).length;

  const advance = async (r: Revision) => {
    const next = nextStatus(REVISION_FLOW, r.status);
    if (!next) return;
    await data.update('revisions', r.id, { status: next });
    toast(t('brand.images.advanced', { title: r.title, status: t(`core.status.${next}`) }));
  };

  const filtersOn = q !== '' || status !== '';

  return (
    <>
      <PageHeader
        code={imagesSpec.code}
        title={t('brand.images.title')}
        subtitle={t('brand.images.subtitle')}
        breadcrumb={[{ label: t('core.portal.brand'), to: '/brand' }, { label: t('brand.images.title') }]}
        actions={
          <Placeholder what={t('brand.images.newWhat')}>
            <Button variant="primary">{t('brand.images.new')}</Button>
          </Placeholder>
        }
      />

      <div className="brand-stats">
        <StatTile label={t('core.status.requested')} value={count('requested')} tone="neutral" glyph="◇" />
        <StatTile label={t('core.status.in-progress')} value={count('in-progress')} tone="accent" glyph="▷" />
        <StatTile label={t('core.status.delivered')} value={count('delivered')} tone="info" glyph="▦" />
        <StatTile label={t('core.status.approved')} value={count('approved')} tone="success" glyph="✓" />
      </div>

      <FilterBar onClear={filtersOn ? () => { setQ(''); setStatus(''); } : undefined} summary={t('brand.shown', { shown: filtered.length, total: rows.length })}>
        <SearchField value={q} onChange={setQ} placeholder={t('brand.images.searchPlaceholder')} />
        <Select label={t('brand.filter.status')} value={status} onChange={(e) => setStatus(e.target.value)} placeholder={t('brand.filter.allStatuses')} options={REVISION_FLOW.map((s) => ({ value: s, label: t(`core.status.${s}`) }))} />
      </FilterBar>

      <div className="brand-stack">
        {groups.length === 0 && <EmptyState title={t('brand.images.empty')} description={t('brand.images.emptyDesc')} glyph="▦" />}
        {groups.map(([projectId, list]) => (
          <Card key={projectId || 'none'} title={projectName.get(projectId) ?? noProject} subtitle={t('brand.images.setCount', { n: list.length })}>
            <DataTable<Revision>
              caption={projectName.get(projectId) ?? noProject}
              rows={list}
              rowKey={(r) => r.id}
              loading={loading}
              onRowActivate={setOpen}
              columns={[
                { key: 'title', header: t('brand.images.col.title'), sortable: true },
                { key: 'requestedById', header: t('brand.col.requestedBy'), render: (r) => demoUserById(r.requestedById)?.name ?? r.requestedById },
                {
                  key: 'dueDate',
                  header: t('brand.col.due'),
                  sortable: true,
                  sortValue: (r) => r.dueDate ?? '9999-12-31',
                  render: (r) => (r.dueDate ? formatDate(r.dueDate, lang) : <span className="brand-unknown">{t('brand.noDue')}</span>),
                },
                { key: 'status', header: t('brand.col.status'), render: (r) => <StatusPill status={r.status} /> },
              ]}
              rowActions={can('images.write') ? [{ id: 'advance', label: t('brand.advance'), onClick: advance, when: (r) => nextStatus(REVISION_FLOW, r.status) !== null }] : undefined}
              dense
            />
          </Card>
        ))}
      </div>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        footer={
          open ? (
            <div className="brand-actions-row">
              {can('images.write') && nextStatus(REVISION_FLOW, open.status) && (
                <Button variant="primary" onClick={() => { void advance(open); setOpen(null); }}>
                  {t('brand.advanceTo', { status: t(`core.status.${nextStatus(REVISION_FLOW, open.status) as string}`) })}
                </Button>
              )}
              <Placeholder what={t('brand.images.shareWhat')}>
                <Button variant="ghost">{t('brand.images.share')}</Button>
              </Placeholder>
            </div>
          ) : undefined
        }
      >
        {open && (
          <>
            <KeyValue
              columns={2}
              items={[
                { key: t('brand.col.status'), value: <StatusPill status={open.status} /> },
                { key: t('brand.col.project'), value: open.projectId ? (projectName.get(open.projectId) ?? open.projectId) : noProject },
                { key: t('brand.col.requestedBy'), value: demoUserById(open.requestedById)?.name ?? open.requestedById },
                { key: t('brand.col.due'), value: open.dueDate ? `${formatDate(open.dueDate, lang)}${isOverdue(open.dueDate) ? ` · ${t('core.status.overdue')}` : ''}` : t('brand.noDue') },
              ]}
            />
            <div className="brand-drawer-section">
              <Placeholder what={t('brand.images.previewWhat')}>
                <span className="brand-list__meta">{t('brand.images.preview')}</span>
              </Placeholder>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
