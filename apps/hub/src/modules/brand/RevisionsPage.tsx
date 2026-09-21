import { useMemo, useState } from 'react';
import { demoUserById } from '../../auth/demoUsers';
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
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Kanban } from '../../components/organism/Kanban/Kanban';
import { useData, useTable } from '../../data/DataContext';
import type { Project, Revision, RevisionKind, RevisionStatus } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { isOverdue, REVISION_FLOW } from './helpers';
import { revisionsSpec } from './specs';
import './brand.css';

const KINDS: RevisionKind[] = ['image', 'layout', 'pdf', 'presentation', 'social'];
const TONES: Record<RevisionStatus, 'neutral' | 'accent' | 'info' | 'success'> = { requested: 'neutral', 'in-progress': 'accent', delivered: 'info', approved: 'success' };

/** G-06: every graphic revision the studio asks for, as a board with explicit move buttons. */
export function RevisionsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { rows } = useTable('revisions');
  const { rows: projects } = useTable('projects');
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [open, setOpen] = useState<Revision | null>(null);

  const projectName = useMemo(() => new Map(projects.map((p: Project) => [p.id, p.name])), [projects]);
  const noProject = t('brand.noProject');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (kind && r.kind !== kind) return false;
      if (!needle) return true;
      return `${r.title} ${projectName.get(r.projectId ?? '') ?? ''}`.toLowerCase().includes(needle);
    });
  }, [rows, q, kind, projectName]);

  const cards = useMemo(
    () =>
      filtered.map((r) => ({
        id: r.id,
        columnId: r.status,
        title: r.title,
        subtitle: `${r.projectId ? (projectName.get(r.projectId) ?? r.projectId) : noProject} · ${demoUserById(r.requestedById)?.name ?? r.requestedById}`,
        meta: r.dueDate ? `${t('brand.col.due')}: ${formatDate(r.dueDate, lang)}${isOverdue(r.dueDate) && r.status !== 'approved' ? ` · ${t('core.status.overdue')}` : ''}` : t('brand.noDue'),
      })),
    [filtered, projectName, noProject, t, lang],
  );

  const move = async (cardId: string, toColumnId: string) => {
    await data.update('revisions', cardId, { status: toColumnId as RevisionStatus });
    toast(t('brand.revisions.moved', { status: t(`core.status.${toColumnId}`) }));
  };

  const count = (s: RevisionStatus) => rows.filter((r) => r.status === s).length;
  const overdue = rows.filter((r) => r.status !== 'approved' && isOverdue(r.dueDate)).length;
  const filtersOn = q !== '' || kind !== '';

  return (
    <>
      <PageHeader
        code={revisionsSpec.code}
        title={t('brand.revisions.title')}
        subtitle={t('brand.revisions.subtitle')}
        breadcrumb={[{ label: t('core.portal.brand'), to: '/brand' }, { label: t('brand.revisions.title') }]}
        actions={
          <Placeholder what={t('brand.revisions.requestWhat')}>
            <Button variant="primary">{t('brand.revisions.request')}</Button>
          </Placeholder>
        }
      />

      <div className="brand-stats">
        {REVISION_FLOW.map((s) => (
          <StatTile key={s} label={t(`core.status.${s}`)} value={count(s)} tone={TONES[s]} />
        ))}
        <StatTile label={t('core.status.overdue')} value={overdue} tone={overdue ? 'danger' : 'neutral'} glyph="◆" />
      </div>

      <FilterBar onClear={filtersOn ? () => { setQ(''); setKind(''); } : undefined} summary={t('brand.shown', { shown: filtered.length, total: rows.length })}>
        <SearchField value={q} onChange={setQ} placeholder={t('brand.revisions.searchPlaceholder')} />
        <Select label={t('brand.filter.kind')} value={kind} onChange={(e) => setKind(e.target.value)} placeholder={t('brand.filter.allKinds')} options={KINDS.map((k) => ({ value: k, label: t(`brand.kind.${k}`) }))} />
      </FilterBar>

      <Kanban
        label={t('brand.revisions.boardLabel')}
        columns={REVISION_FLOW.map((s) => ({ id: s, title: t(`core.status.${s}`), tone: TONES[s] }))}
        cards={cards}
        onMove={can('revisions.manage') ? (id, to) => void move(id, to) : undefined}
        onActivate={(card) => setOpen(rows.find((r) => r.id === card.id) ?? null)}
      />

      <Drawer open={open !== null} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open && (
          <KeyValue
            columns={2}
            items={[
              { key: t('brand.col.status'), value: <StatusPill status={open.status} /> },
              { key: t('brand.col.kind'), value: t(`brand.kind.${open.kind}`) },
              { key: t('brand.col.project'), value: open.projectId ? (projectName.get(open.projectId) ?? open.projectId) : noProject },
              { key: t('brand.col.requestedBy'), value: demoUserById(open.requestedById)?.name ?? open.requestedById },
              { key: t('brand.col.due'), value: open.dueDate ? formatDate(open.dueDate, lang) : t('brand.noDue') },
            ]}
          />
        )}
      </Drawer>
    </>
  );
}
