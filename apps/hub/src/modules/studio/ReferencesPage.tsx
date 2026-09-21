import { useMemo, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { Reference } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';
import { referencesSpec } from './specs';
import { useProjectIndex } from './useProjectIndex';
import './studio.css';

export function ReferencesPage() {
  const { t } = useT();
  const can = useCan();
  const data = useData();
  const { rows: references, loading } = useTable('references', { orderBy: 'title' });
  const { options: projectOptions, nameOf } = useProjectIndex();
  const [q, setQ] = useState('');
  const [project, setProject] = useState('');
  const [tag, setTag] = useState('');
  const [open, setOpen] = useState<Reference | null>(null);

  const tags = useMemo(() => [...new Set(references.flatMap((r) => r.tags))].sort((a, b) => a.localeCompare(b)), [references]);
  const boards = useMemo(() => [...new Set(references.map((r) => r.board))].sort((a, b) => a.localeCompare(b)), [references]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return references.filter(
      (r) =>
        (!project || r.projectId === project) &&
        (!tag || r.tags.includes(tag)) &&
        (!needle || `${r.title} ${r.source} ${r.note} ${r.tags.join(' ')}`.toLowerCase().includes(needle)),
    );
  }, [references, q, project, tag]);

  const shownBoards = useMemo(() => boards.filter((b) => shown.some((r) => r.board === b)), [boards, shown]);
  const current = open ? (references.find((r) => r.id === open.id) ?? open) : null;

  const moveToBoard = async (r: Reference, board: string) => {
    if (!board || board === r.board) return;
    await data.update('references', r.id, { board });
    toast(t('studio.references.moved'));
  };

  return (
    <>
      <PageHeader
        code={referencesSpec.code}
        title={t('studio.references.title')}
        subtitle={t('studio.references.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.references.title') }]}
        actions={
          <>
            <Placeholder what={t('studio.references.newBoardWhat')}>
              <Button>{t('studio.references.newBoard')}</Button>
            </Placeholder>
            <Placeholder what={t('studio.references.addWhat')}>
              <Button variant="primary">{t('studio.references.add')}</Button>
            </Placeholder>
          </>
        }
      />

      <div className="studio-filters">
        <FilterBar
          onClear={q || project || tag ? () => { setQ(''); setProject(''); setTag(''); } : undefined}
          summary={t('studio.filter.summary', { shown: shown.length, total: references.length })}
        >
          <SearchField value={q} onChange={setQ} placeholder={t('studio.references.search')} />
          <Select label={t('studio.col.project')} hideLabel value={project} onChange={(e) => setProject(e.target.value)} placeholder={t('studio.filter.allProjects')} options={projectOptions} />
          <Select label={t('studio.col.tags')} hideLabel value={tag} onChange={(e) => setTag(e.target.value)} placeholder={t('studio.filter.allTags')} options={tags.map((x) => ({ value: x, label: x }))} />
        </FilterBar>
      </div>

      {!loading && shown.length === 0 && <EmptyState title={t('studio.empty.title')} description={t('studio.empty.desc')} />}

      <div className="studio-stack">
        {shownBoards.map((board) => {
          const items = shown.filter((r) => r.board === board);
          return (
            <Card key={board} title={board} subtitle={t('studio.references.count', { n: items.length })}>
              <ul className="studio-tiles">
                {items.map((r) => (
                  <li key={r.id}>
                    <Card padding="sm" onActivate={() => setOpen(r)} aria-label={r.title}>
                      <span className="studio-thumb">
                        {r.imageUrl ? (
                          <img className="studio-thumb__img" src={r.imageUrl} alt="" />
                        ) : (
                          <>
                            <span className="studio-thumb__glyph" aria-hidden="true">
                              ◇
                            </span>
                            {t('studio.references.noImage')}
                          </>
                        )}
                      </span>
                      <strong>{r.title}</strong>
                      <span className="studio-muted">{r.source}</span>
                      <span className="studio-tags">
                        {r.tags.map((x) => (
                          <Badge key={x} tone="neutral">
                            {x}
                          </Badge>
                        ))}
                      </span>
                    </Card>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Drawer
        open={current !== null}
        onClose={() => setOpen(null)}
        title={current?.title ?? t('studio.references.detail')}
        footer={
          current && (
            <Placeholder what={t('studio.references.uploadWhat')}>
              <Button>{t('studio.references.upload')}</Button>
            </Placeholder>
          )
        }
      >
        {current && (
          <div className="studio-detail">
            <KeyValue
              columns={2}
              items={[
                { key: t('studio.col.project'), value: current.projectId ? nameOf(current.projectId) : t('studio.noProject') },
                { key: t('studio.col.source'), value: current.source },
                { key: t('studio.col.board'), value: current.board },
                {
                  key: t('studio.col.tags'),
                  value: (
                    <span className="studio-tags">
                      {current.tags.map((x) => (
                        <Badge key={x} tone="neutral">
                          {x}
                        </Badge>
                      ))}
                    </span>
                  ),
                },
                { key: t('studio.col.note'), value: current.note || '—' },
              ]}
            />
            {can('references.manage') && (
              <Select
                label={t('studio.references.moveTo')}
                value={current.board}
                onChange={(e) => moveToBoard(current, e.target.value)}
                options={boards.map((b) => ({ value: b, label: b }))}
              />
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
