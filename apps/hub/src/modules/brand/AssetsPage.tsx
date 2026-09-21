import { useMemo, useState } from 'react';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Card } from '../../components/molecule/Card/Card';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useTable } from '../../data/DataContext';
import { useT } from '../../i18n/I18nProvider';
import { assetsSpec } from './specs';
import './brand.css';

interface Folder {
  path: string;
  source: 'brand' | 'competition';
  items: number;
  superseded: number;
}

function parentOf(path: string): string {
  const i = path.replace(/\/$/, '').lastIndexOf('/');
  return i === -1 ? path : path.slice(0, i);
}

/** G-07: the folder map of the graphic files, derived from the asset paths and the competition folders. */
export function AssetsPage() {
  const { t } = useT();
  const { rows: assets, loading } = useTable('brandAssets');
  const { rows: competitions } = useTable('competitions');
  const [q, setQ] = useState('');

  const folders = useMemo<Folder[]>(() => {
    const map = new Map<string, Folder>();
    for (const a of assets) {
      const path = parentOf(a.path);
      const f = map.get(path) ?? { path, source: 'brand' as const, items: 0, superseded: 0 };
      f.items += 1;
      if (a.status === 'superseded') f.superseded += 1;
      map.set(path, f);
    }
    for (const c of competitions) {
      if (!c.materialsFolder) continue;
      const path = c.materialsFolder;
      const f = map.get(path) ?? { path, source: 'competition' as const, items: 0, superseded: 0 };
      f.source = 'competition';
      map.set(path, f);
    }
    return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
  }, [assets, competitions]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? folders.filter((f) => f.path.toLowerCase().includes(needle)) : folders;
  }, [folders, q]);

  const competitionFolders = folders.filter((f) => f.source === 'competition');
  const empty = folders.filter((f) => f.items === 0);

  return (
    <>
      <PageHeader
        code={assetsSpec.code}
        title={t('brand.assets.title')}
        subtitle={t('brand.assets.subtitle')}
        breadcrumb={[{ label: t('core.portal.brand'), to: '/brand' }, { label: t('brand.assets.title') }]}
        actions={
          <div className="brand-actions-row">
            <Placeholder what={t('brand.assets.newFolderWhat')}>
              <Button variant="secondary">{t('brand.assets.newFolder')}</Button>
            </Placeholder>
            <Placeholder what={t('brand.assets.connectWhat')}>
              <Button variant="primary">{t('brand.assets.connect')}</Button>
            </Placeholder>
          </div>
        }
      />

      <div className="brand-stats">
        <StatTile label={t('brand.assets.stat.folders')} value={folders.length} tone="accent" glyph="☷" />
        <StatTile label={t('brand.assets.stat.files')} value={assets.length} tone="info" glyph="▤" />
        <StatTile label={t('brand.assets.stat.competition')} value={competitionFolders.length} hint={t('brand.assets.stat.competitionHint')} tone="neutral" glyph="◆" />
        <StatTile label={t('brand.assets.stat.empty')} value={empty.length} hint={t('brand.assets.stat.emptyHint')} tone={empty.length ? 'warning' : 'success'} glyph="◇" />
      </div>

      <FilterBar onClear={q ? () => setQ('') : undefined} summary={t('brand.shown', { shown: filtered.length, total: folders.length })}>
        <SearchField value={q} onChange={setQ} placeholder={t('brand.assets.searchPlaceholder')} />
      </FilterBar>

      <DataTable<Folder>
        caption={t('brand.assets.title')}
        rows={filtered}
        rowKey={(f) => f.path}
        loading={loading}
        emptyTitle={t('brand.assets.empty')}
        columns={[
          { key: 'path', header: t('brand.assets.col.path'), sortable: true, render: (f) => <span className="brand-path">{f.path}</span> },
          { key: 'source', header: t('brand.assets.col.source'), sortable: true, render: (f) => <Badge tone={f.source === 'competition' ? 'accent' : 'neutral'}>{t(`brand.assets.source.${f.source}`)}</Badge> },
          { key: 'items', header: t('brand.assets.col.items'), align: 'end', sortable: true, render: (f) => (f.items === 0 ? <span className="brand-unknown">{t('brand.assets.emptyFolder')}</span> : f.items) },
          { key: 'superseded', header: t('brand.assets.col.superseded'), align: 'end', sortable: true, render: (f) => (f.superseded ? <Badge tone="warning">{f.superseded}</Badge> : '—') },
        ]}
        initialSort={{ key: 'path', dir: 'asc' }}
      />

      <div className="brand-stack">
        <Card title={t('brand.assets.notWired')} subtitle={t('brand.assets.notWiredSub')}>
          <div className="brand-actions-row">
            <Placeholder what={t('brand.assets.uploadWhat')}>
              <Button variant="ghost">{t('brand.assets.upload')}</Button>
            </Placeholder>
            <Placeholder what={t('brand.assets.renameWhat')}>
              <Button variant="ghost">{t('brand.assets.rename')}</Button>
            </Placeholder>
            <Placeholder what={t('brand.assets.moveWhat')}>
              <Button variant="ghost">{t('brand.assets.move')}</Button>
            </Placeholder>
          </div>
        </Card>
      </div>
    </>
  );
}
