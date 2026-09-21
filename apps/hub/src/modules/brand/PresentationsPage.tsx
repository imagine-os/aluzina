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
import type { Presentation, PresentationKind, Project } from '../../data/schema';
import { demoUserById } from '../../auth/demoUsers';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { isOverdue, nextStatus, PRESENTATION_FLOW, unknownable } from './helpers';
import { presentationsSpec } from './specs';
import './brand.css';

const KINDS: PresentationKind[] = ['sales', 'concept', 'proposal', 'competition'];

/** G-03: the decks Angélica produces, requested -> drafting -> review -> final. */
export function PresentationsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows, loading } = useTable('presentations');
  const { rows: projects } = useTable('projects');
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState<Presentation | null>(null);

  const projectName = useMemo(() => new Map(projects.map((p: Project) => [p.id, p.name])), [projects]);
  const unknownLabel = t('brand.unknown');
  const noProject = t('brand.noProject');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((p) => {
      if (kind && p.kind !== kind) return false;
      if (status && p.status !== status) return false;
      if (!needle) return true;
      return `${p.title} ${projectName.get(p.projectId ?? '') ?? ''}`.toLowerCase().includes(needle);
    });
  }, [rows, q, kind, status, projectName]);

  const openDecks = rows.filter((p) => p.status !== 'final');
  const inReview = rows.filter((p) => p.status === 'review');
  const finals = rows.filter((p) => p.status === 'final');
  const overdue = rows.filter((p) => p.status !== 'final' && isOverdue(p.dueDate));

  const advance = async (p: Presentation) => {
    const next = nextStatus(PRESENTATION_FLOW, p.status);
    if (!next) return;
    await data.update('presentations', p.id, { status: next });
    toast(t('brand.presentations.advanced', { title: p.title, status: t(`core.status.${next}`) }));
  };

  const filtersOn = q !== '' || kind !== '' || status !== '';

  return (
    <>
      <PageHeader
        code={presentationsSpec.code}
        title={t('brand.presentations.title')}
        subtitle={t('brand.presentations.subtitle')}
        breadcrumb={[{ label: t('core.portal.brand'), to: '/brand' }, { label: t('brand.presentations.title') }]}
        actions={
          <Placeholder what={t('brand.presentations.requestWhat')}>
            <Button variant="primary">{t('brand.presentations.request')}</Button>
          </Placeholder>
        }
      />

      <div className="brand-stats">
        <StatTile label={t('brand.presentations.stat.open')} value={openDecks.length} tone="accent" glyph="▤" />
        <StatTile label={t('brand.presentations.stat.review')} value={inReview.length} tone="info" glyph="⌕" />
        <StatTile label={t('brand.presentations.stat.final')} value={finals.length} tone="success" glyph="✓" />
        <StatTile label={t('brand.presentations.stat.overdue')} value={overdue.length} tone={overdue.length ? 'danger' : 'neutral'} glyph="◆" />
      </div>

      <FilterBar
        onClear={filtersOn ? () => { setQ(''); setKind(''); setStatus(''); } : undefined}
        summary={t('brand.shown', { shown: filtered.length, total: rows.length })}
      >
        <SearchField value={q} onChange={setQ} placeholder={t('brand.presentations.searchPlaceholder')} />
        <Select label={t('brand.filter.kind')} value={kind} onChange={(e) => setKind(e.target.value)} placeholder={t('brand.filter.allKinds')} options={KINDS.map((k) => ({ value: k, label: t(`brand.kind.${k}`) }))} />
        <Select label={t('brand.filter.status')} value={status} onChange={(e) => setStatus(e.target.value)} placeholder={t('brand.filter.allStatuses')} options={PRESENTATION_FLOW.map((s) => ({ value: s, label: t(`core.status.${s}`) }))} />
      </FilterBar>

      <DataTable<Presentation>
        caption={t('brand.presentations.title')}
        rows={filtered}
        rowKey={(p) => p.id}
        loading={loading}
        onRowActivate={setOpen}
        emptyTitle={t('brand.presentations.empty')}
        columns={[
          { key: 'title', header: t('brand.presentations.col.title'), sortable: true },
          { key: 'projectId', header: t('brand.col.project'), render: (p) => (p.projectId ? (projectName.get(p.projectId) ?? p.projectId) : <span className="brand-unknown">{noProject}</span>) },
          { key: 'kind', header: t('brand.col.kind'), sortable: true, render: (p) => t(`brand.kind.${p.kind}`) },
          { key: 'slideCount', header: t('brand.presentations.col.slides'), align: 'end', sortable: true, render: (p) => unknownable(p.slideCount, t('brand.presentations.notStarted')) },
          {
            key: 'dueDate',
            header: t('brand.col.due'),
            sortable: true,
            sortValue: (p) => p.dueDate ?? '9999-12-31',
            render: (p) => (p.dueDate ? <span className={isOverdue(p.dueDate) && p.status !== 'final' ? 'brand-unknown' : undefined}>{formatDate(p.dueDate, lang)}</span> : <span className="brand-unknown">{t('brand.noDue')}</span>),
          },
          { key: 'status', header: t('brand.col.status'), render: (p) => <StatusPill status={p.status} /> },
        ]}
        rowActions={
          can('presentations.write')
            ? [{ id: 'advance', label: t('brand.advance'), onClick: advance, when: (p) => nextStatus(PRESENTATION_FLOW, p.status) !== null }]
            : undefined
        }
        initialSort={{ key: 'dueDate', dir: 'asc' }}
      />

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        footer={
          open ? (
            <div className="brand-actions-row">
              {can('presentations.write') && nextStatus(PRESENTATION_FLOW, open.status) && (
                <Button variant="primary" onClick={() => { void advance(open); setOpen(null); }}>
                  {t('brand.advanceTo', { status: t(`core.status.${nextStatus(PRESENTATION_FLOW, open.status) as string}`) })}
                </Button>
              )}
              <Placeholder what={t('brand.presentations.openDeckWhat')}>
                <Button variant="ghost">{t('brand.presentations.openDeck')}</Button>
              </Placeholder>
            </div>
          ) : undefined
        }
      >
        {open && (
          <KeyValue
            columns={2}
            items={[
              { key: t('brand.col.status'), value: <StatusPill status={open.status} /> },
              { key: t('brand.col.kind'), value: t(`brand.kind.${open.kind}`) },
              { key: t('brand.col.project'), value: open.projectId ? (projectName.get(open.projectId) ?? open.projectId) : noProject },
              { key: t('brand.col.due'), value: open.dueDate ? formatDate(open.dueDate, lang) : t('brand.noDue') },
              { key: t('brand.presentations.col.slides'), value: unknownable(open.slideCount, t('brand.presentations.notStarted')) },
              { key: t('brand.col.owner'), value: demoUserById(open.ownerId)?.name ?? unknownLabel },
            ]}
          />
        )}
      </Drawer>
    </>
  );
}
