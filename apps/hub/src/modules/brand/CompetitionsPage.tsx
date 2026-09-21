import { useEffect, useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Calendar } from '../../components/organism/Calendar/Calendar';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Competition, CompetitionProject } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { byDateThen, COMPETITION_FLOW, dueTone, nextStatus, unknownable } from './helpers';
import { competitionsSpec } from './specs';
import './brand.css';

const PROJECTS: CompetitionProject[] = ['Honey Valley Lighting', '"Hoy" Interior Design Project', 'Noam Residential Project'];

interface Draft {
  name: string;
  organiser: string;
  category: string;
  submissionDate: string;
  project: string;
  materialsFolder: string;
  result: string;
}

const EMPTY_DRAFT: Draft = { name: '', organiser: '', category: '', submissionDate: '', project: '', materialsFolder: '', result: '' };

function toDraft(c: Competition): Draft {
  return {
    name: c.name ?? '',
    organiser: c.organiser ?? '',
    category: c.category ?? '',
    submissionDate: c.submissionDate ?? '',
    project: c.project ?? '',
    materialsFolder: c.materialsFolder ?? '',
    result: c.result ?? '',
  };
}

/** G-02: the 20 competition slots of 2027, by submission date, undated last. */
export function CompetitionsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows, loading } = useTable('competitions');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [project, setProject] = useState('');
  const [tab, setTab] = useState('table');
  const [month, setMonth] = useState('2027-01');
  const [open, setOpen] = useState<Competition | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  useEffect(() => {
    setDraft(open ? toDraft(open) : EMPTY_DRAFT);
  }, [open]);

  const sorted = useMemo(() => [...rows].sort(byDateThen<Competition>((c) => c.submissionDate, (c) => c.slot)), [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sorted.filter((c) => {
      if (status && c.status !== status) return false;
      if (project && c.project !== project) return false;
      if (!needle) return true;
      return `${c.slot} ${c.name ?? ''} ${c.organiser ?? ''} ${c.category ?? ''} ${c.project ?? ''} ${c.materialsFolder ?? ''}`.toLowerCase().includes(needle);
    });
  }, [sorted, q, status, project]);

  const dated = rows.filter((c) => c.submissionDate !== null);
  const submitted = rows.filter((c) => c.status === 'submitted' || c.status === 'result');
  const unknownLabel = t('brand.unknown');

  const events = useMemo(
    () =>
      dated.map((c) => ({
        id: c.id,
        date: c.submissionDate as string,
        title: c.name ?? t('brand.competitions.slotN', { n: c.slot }),
        meta: c.project ?? unknownLabel,
        tone: dueTone(c.submissionDate),
      })),
    [dated, t, unknownLabel],
  );

  const advance = async (c: Competition) => {
    const next = nextStatus(COMPETITION_FLOW, c.status);
    if (!next) return;
    await data.update('competitions', c.id, { status: next });
    toast(t('brand.competitions.advanced', { slot: c.slot, status: t(`core.status.${next}`) }));
  };

  const save = async () => {
    if (!open) return;
    await data.update('competitions', open.id, {
      name: draft.name.trim() || null,
      organiser: draft.organiser.trim() || null,
      category: draft.category.trim() || null,
      submissionDate: draft.submissionDate || null,
      project: (draft.project as CompetitionProject) || null,
      materialsFolder: draft.materialsFolder.trim() || null,
      result: draft.result.trim() || null,
    });
    toast(t('brand.competitions.saved'));
    setOpen(null);
  };

  const filtersOn = q !== '' || status !== '' || project !== '';

  return (
    <>
      <PageHeader
        code={competitionsSpec.code}
        title={t('brand.competitions.title')}
        subtitle={t('brand.competitions.subtitle')}
        breadcrumb={[{ label: t('core.portal.brand'), to: '/brand' }, { label: t('brand.competitions.title') }]}
        actions={
          <Placeholder what={t('brand.competitions.importWhat')}>
            <Button variant="secondary">{t('brand.competitions.import')}</Button>
          </Placeholder>
        }
      />

      <div className="brand-stats">
        <StatTile label={t('brand.competitions.stat.slots')} value={rows.length} hint={t('brand.competitions.stat.slotsHint')} tone="accent" glyph="◆" />
        <StatTile label={t('brand.competitions.stat.dated')} value={dated.length} tone={dated.length ? 'success' : 'neutral'} glyph="▦" />
        <StatTile label={t('brand.competitions.stat.undated')} value={rows.length - dated.length} hint={t('brand.competitions.stat.undatedHint')} tone={rows.length - dated.length ? 'warning' : 'success'} glyph="◇" />
        <StatTile label={t('brand.competitions.stat.submitted')} value={submitted.length} tone="info" glyph="✓" />
      </div>

      <FilterBar
        onClear={filtersOn ? () => { setQ(''); setStatus(''); setProject(''); } : undefined}
        summary={t('brand.shown', { shown: filtered.length, total: rows.length })}
      >
        <SearchField value={q} onChange={setQ} placeholder={t('brand.competitions.searchPlaceholder')} />
        <Select
          label={t('brand.filter.status')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder={t('brand.filter.allStatuses')}
          options={COMPETITION_FLOW.map((s) => ({ value: s, label: t(`core.status.${s}`) }))}
        />
        <Select
          label={t('brand.filter.project')}
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder={t('brand.filter.allProjects')}
          options={PROJECTS.map((p) => ({ value: p, label: p }))}
        />
      </FilterBar>

      <Tabs
        label={t('brand.competitions.viewLabel')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'table', label: t('brand.competitions.tab.table'), count: filtered.length },
          { id: 'calendar', label: t('brand.competitions.tab.calendar'), count: events.length },
        ]}
      >
        {tab === 'table' ? (
          <DataTable<Competition>
            caption={t('brand.competitions.title')}
            rows={filtered}
            rowKey={(c) => c.id}
            loading={loading}
            onRowActivate={setOpen}
            emptyTitle={t('brand.competitions.empty')}
            emptyDescription={t('brand.competitions.emptyDesc')}
            columns={[
              { key: 'slot', header: t('brand.competitions.col.slot'), sortable: true, align: 'end', width: '4rem' },
              { key: 'name', header: t('brand.competitions.col.name'), sortable: true, render: (c) => unknownable(c.name, unknownLabel) },
              {
                key: 'submissionDate',
                header: t('brand.competitions.col.date'),
                sortable: true,
                sortValue: (c) => c.submissionDate ?? '9999-12-31',
                render: (c) => (c.submissionDate ? formatDate(c.submissionDate, lang) : <span className="brand-unknown">{unknownLabel}</span>),
              },
              { key: 'project', header: t('brand.competitions.col.project'), render: (c) => unknownable(c.project, unknownLabel) },
              { key: 'materialsFolder', header: t('brand.competitions.col.folder'), render: (c) => (c.materialsFolder ? <span className="brand-path">{c.materialsFolder}</span> : <span className="brand-unknown">{unknownLabel}</span>) },
              { key: 'status', header: t('brand.competitions.col.status'), render: (c) => <StatusPill status={c.status} /> },
            ]}
            rowActions={
              can('competitions.manage')
                ? [{ id: 'advance', label: t('brand.advance'), onClick: advance, when: (c) => nextStatus(COMPETITION_FLOW, c.status) !== null }]
                : undefined
            }
            initialSort={{ key: 'submissionDate', dir: 'asc' }}
          />
        ) : (
          <Calendar month={month} onMonthChange={setMonth} events={events} label={t('brand.competitions.calendarLabel')} onSelect={(e) => setOpen(rows.find((c) => c.id === e.id) ?? null)} />
        )}
      </Tabs>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? (open.name ?? t('brand.competitions.slotN', { n: open.slot })) : ''}
        footer={
          can('competitions.manage') ? (
            <div className="brand-actions-row">
              <Button variant="primary" onClick={save}>{t('brand.save')}</Button>
              {open && nextStatus(COMPETITION_FLOW, open.status) && (
                <Button onClick={() => { void advance(open); setOpen(null); }}>
                  {t('brand.advanceTo', { status: t(`core.status.${nextStatus(COMPETITION_FLOW, open.status) as string}`) })}
                </Button>
              )}
              <Placeholder what={t('brand.competitions.folderWhat')}>
                <Button variant="ghost">{t('brand.competitions.openFolder')}</Button>
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
                { key: t('brand.competitions.col.slot'), value: open.slot },
                { key: t('brand.competitions.col.status'), value: <StatusPill status={open.status} /> },
                { key: t('brand.competitions.col.date'), value: open.submissionDate ? formatDate(open.submissionDate, lang) : <span className="brand-unknown">{unknownLabel}</span> },
                { key: t('brand.competitions.col.project'), value: unknownable(open.project, unknownLabel) },
                { key: t('brand.competitions.col.folder'), value: open.materialsFolder ? <span className="brand-path">{open.materialsFolder}</span> : <span className="brand-unknown">{unknownLabel}</span> },
                { key: t('brand.competitions.col.result'), value: unknownable(open.result, unknownLabel) },
              ]}
            />
            {can('competitions.manage') && (
              <div className="brand-drawer-section">
                <p className="brand-list__meta">{t('brand.competitions.formHint')}</p>
                <div className="brand-form">
                  <Input label={t('brand.competitions.col.name')} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={unknownLabel} />
                  <Input label={t('brand.competitions.col.organiser')} value={draft.organiser} onChange={(e) => setDraft({ ...draft, organiser: e.target.value })} placeholder={unknownLabel} />
                  <Input label={t('brand.competitions.col.category')} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder={unknownLabel} />
                  <Input type="date" label={t('brand.competitions.col.date')} value={draft.submissionDate} onChange={(e) => setDraft({ ...draft, submissionDate: e.target.value })} />
                  <Select
                    label={t('brand.competitions.col.project')}
                    value={draft.project}
                    onChange={(e) => setDraft({ ...draft, project: e.target.value })}
                    placeholder={unknownLabel}
                    options={PROJECTS.map((p) => ({ value: p, label: p }))}
                  />
                  <Input className="brand-form__wide" label={t('brand.competitions.col.folder')} value={draft.materialsFolder} onChange={(e) => setDraft({ ...draft, materialsFolder: e.target.value })} placeholder={unknownLabel} hint={t('brand.competitions.folderHint')} />
                  <Input className="brand-form__wide" label={t('brand.competitions.col.result')} value={draft.result} onChange={(e) => setDraft({ ...draft, result: e.target.value })} placeholder={unknownLabel} />
                </div>
              </div>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}
