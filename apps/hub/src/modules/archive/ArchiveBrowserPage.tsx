import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useCan, useSession } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { FileIcon } from '../../components/atom/FileIcon/FileIcon';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { ToggleButton } from '../../components/atom/ToggleButton/ToggleButton';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Thumb } from '../../components/molecule/Thumb/Thumb';
import { DataTable, type Column } from '../../components/organism/DataTable/DataTable';
import { useData, useTable } from '../../data/DataContext';
import type { Project, Space } from '../../data/schema';
import { LIFECYCLES, lifecycleOf, pick, type Lifecycle } from '../../domain';
import { copyText } from '../../design/clipboard';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { archiveBrowserSpec } from './specs';
import { useArchiveData, usePortfolioSet } from './model';
import './archive.css';

const PROJECT_TYPES = ['residential', 'commercial', 'hospitality', 'wellness', 'lighting-product'] as const;
/** Spaces a saved example set is filed in (`seed/assets.ts`, `seed/archive.ts`); a missing one is simply skipped. */
const SET_SPACE_IDS = ['sp-portfolio', 'sp-archive'] as const;
/** Absolute link to P-06 with this set in it: the page is stateless, the link IS the set (ar-14). */
function setPageUrl(ids: readonly string[], title: string, print = false): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const query = `p=${ids.join(',')}${title ? `&t=${encodeURIComponent(title)}` : ''}${print ? '&print=1' : ''}`;
  return `${base}#/sets?${query}`;
}
type SortKey = 'yearDesc' | 'yearAsc' | 'name' | 'files';
const SORTS: SortKey[] = ['yearDesc', 'yearAsc', 'name', 'files'];

/** Query-string state, so any view of the archive is a link and voice can address it (P-06). */
interface Filters {
  life: Lifecycle | 'all';
  year: string;
  type: string;
  tag: string;
  q: string;
  sort: SortKey;
  view: 'cards' | 'table';
  set: boolean;
}

function readFilters(params: URLSearchParams): Filters {
  const life = params.get('life');
  const sort = params.get('sort');
  return {
    life: life === 'prospect' || life === 'active' || life === 'past' ? life : 'all',
    year: params.get('year') ?? '',
    type: params.get('type') ?? '',
    tag: params.get('tag') ?? '',
    q: params.get('q') ?? '',
    sort: SORTS.includes(sort as SortKey) ? (sort as SortKey) : 'yearDesc',
    view: params.get('view') === 'table' ? 'table' : 'cards',
    set: params.get('set') === '1',
  };
}

/** A project's cover: `coverUrl` (a column of the row, ar-19), else the mosaic of its most common file types (`fileTypes`). */
function Cover({ project }: { project: Project }) {
  const { t } = useT();
  if (project.coverUrl) return <Thumb src={project.coverUrl} alt={t('archive.browser.cover', { name: project.name })} type="image" ratio="16:9" />;
  const types = project.fileTypes;
  if (types.length === 0) return <Thumb src={null} alt={t('archive.browser.mosaic', { name: project.name })} type="folder" ratio="16:9" />;
  return (
    <span className={`arc-mosaic${types.length === 1 ? ' arc-mosaic--single' : ''}`} role="img" aria-label={t('archive.browser.mosaic', { name: project.name })}>
      {types.map((type) => (
        <FileIcon key={type} type={type} size="md" />
      ))}
    </span>
  );
}

/**
 * S-12 `/studio/archive` (also mounted on `/founder/archive` and `/brand/archive`): every project the
 * studio has, archived or live, with covers, tags, file counts and lifecycle tabs, plus the portfolio
 * set a person assembles to show one client. Reads only; the set is localStorage (prompt 0017).
 */
export function ArchiveBrowserPage({ surface }: { surface: Surface }) {
  const { t, lang } = useT();
  const [params, setParams] = useSearchParams();
  const f = readFilters(params);
  const { projects, curatedByProject, loading } = useArchiveData();
  const set = usePortfolioSet();
  const data = useData();
  const { user } = useSession();
  const can = useCan();
  const spaces = useTable('spaces');
  /** The post the last "Save set to Spaces" created, so the bar can offer a link to it (a toast is text only). */
  const [savedPostId, setSavedPostId] = useState<string | null>(null);

  const patch = (next: Partial<Filters>) => {
    const merged = { ...f, ...next };
    const out = new URLSearchParams();
    if (merged.life !== 'all') out.set('life', merged.life);
    if (merged.year) out.set('year', merged.year);
    if (merged.type) out.set('type', merged.type);
    if (merged.tag) out.set('tag', merged.tag);
    if (merged.q) out.set('q', merged.q);
    if (merged.sort !== 'yearDesc') out.set('sort', merged.sort);
    if (merged.view !== 'cards') out.set('view', merged.view);
    if (merged.set) out.set('set', '1');
    setParams(out, { replace: true });
    return merged;
  };

  // File counts are a column of the project row (`fileCount`, from the inventory), never a scan of file rows (ar-19).
  const fileCount = (p: Project) => p.fileCount ?? 0;
  const totalFiles = useMemo(() => projects.reduce((n, p) => n + (p.fileCount ?? 0), 0), [projects]);

  const years = useMemo(() => [...new Set(projects.map((p) => p.year).filter((y): y is number => y !== null))].sort((a, b) => b - a), [projects]);
  /** Tags a project answers to: its own plus those saved on its curated files (S-13), so a file tag reaches this filter. */
  const tagsOf = (p: Project): string[] => [...p.tags, ...(curatedByProject.get(p.id) ?? []).flatMap((a) => a.tags)];
  const tags = useMemo(
    () => [...new Set(projects.flatMap((p) => [...p.tags, ...(curatedByProject.get(p.id) ?? []).flatMap((a) => a.tags)]))].sort((a, b) => a.localeCompare(b)),
    [projects, curatedByProject],
  );

  const counts = useMemo(() => {
    const byLife = { prospect: 0, active: 0, past: 0 } as Record<Lifecycle, number>;
    const filesByLife = { prospect: 0, active: 0, past: 0 } as Record<Lifecycle, number>;
    for (const p of projects) {
      const life = lifecycleOf(p.pipelineStatus);
      byLife[life] += 1;
      filesByLife[life] += fileCount(p);
    }
    return { byLife, filesByLife };
  }, [projects]);

  const shown = useMemo(() => {
    const needle = f.q.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (f.life !== 'all' && lifecycleOf(p.pipelineStatus) !== f.life) return false;
      if (f.year && String(p.year ?? '') !== f.year) return false;
      if (f.type && p.type !== f.type) return false;
      if (f.tag && !tagsOf(p).includes(f.tag)) return false;
      if (!needle) return true;
      const hay = [p.name, p.client, String(p.year ?? ''), ...tagsOf(p)].join(' ').toLowerCase();
      return hay.includes(needle);
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (f.sort === 'name') return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      if (f.sort === 'files') return fileCount(b) - fileCount(a) || a.name.localeCompare(b.name);
      const ya = a.year ?? 0;
      const yb = b.year ?? 0;
      if (ya !== yb) return f.sort === 'yearAsc' ? ya - yb : yb - ya;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, curatedByProject, f.life, f.year, f.type, f.tag, f.q, f.sort]);

  const projectPath = (id: string) => `/${surface}/archive/${id}`;
  const byName = (value: unknown): Project | undefined => {
    const needle = String(value ?? '').toLowerCase();
    return projects.find((p) => p.id === value) ?? projects.find((p) => p.name.toLowerCase() === needle);
  };

  /** The set in the order it was picked (`set.ids`), which is the order P-06 renders and the post lists. */
  const setProjects = useMemo(() => {
    const byId = new Map(projects.map((p) => [p.id, p]));
    return set.ids.map((id) => byId.get(id)).filter((p): p is Project => Boolean(p));
  }, [projects, set.ids]);

  const setTitle = () => (setProjects.length === 1 ? t('archive.set.titleOne') : t('archive.set.title', { count: setProjects.length }));
  const setLink = (print = false) => setPageUrl(setProjects.map((p) => p.id), setTitle(), print);

  /**
   * Files the set as a `link` post in Spaces (ar-10): the post carries the P-06 link and a markdown list of
   * the projects, filed in the portfolio and archive spaces through `filings` (D-026) so two people share one
   * set instead of one localStorage list. Behind `archive.curate` (the set is curation of the archive; studio, brand and the
   * founder hold it, so Sarai can file a set without the brand's whole `spaces.write`).
   */
  const saveSetToSpaces = async () => {
    if (setProjects.length === 0) return 'the portfolio set is empty';
    const title = setTitle();
    const url = setLink();
    const list = setProjects.map((p) => `- ${[p.name, p.year ?? '', t(`archive.type.${p.type}`)].filter((part) => String(part).length > 0).join(' · ')}`);
    const body = [t('archive.set.postBody'), '', ...list].join('\n');
    const post = await data.create('posts', { title, body, kind: 'link', url, authorId: user.id, pinned: false, status: 'published', tags: ['portfolio', 'ejemplos'] });
    const targets = (spaces.rows as Space[]).filter((space) => (SET_SPACE_IDS as readonly string[]).includes(space.id));
    for (const space of targets) await data.create('filings', { postId: post.id, spaceId: space.id });
    setSavedPostId(post.id);
    toast(targets.length > 0 ? t('archive.set.saved', { count: setProjects.length, spaces: targets.length }) : t('archive.set.savedUnfiled', { count: setProjects.length }));
    return post.id;
  };

  const copySet = async () => {
    const chosen = setProjects;
    const text = chosen.map((p) => [p.name, p.year ?? '', p.client, p.sourceFolderUrl ?? ''].filter(Boolean).join(' · ')).join('\n');
    const ok = await copyText(text);
    if (!ok) console.info('[archive] portfolio set:\n', text);
    toast(ok ? t('archive.set.copied', { count: chosen.length }) : t('archive.set.copyFailed'));
    return text;
  };

  useRegisterActions({
    'archive.filterLifecycle': ({ life }) => patch({ life: (['prospect', 'active', 'past'].includes(String(life)) ? String(life) : 'all') as Lifecycle | 'all' }).life,
    'archive.filterYear': ({ year }) => patch({ year: year === undefined || year === null ? '' : String(year) }).year,
    'archive.filterType': ({ type }) => patch({ type: String(type ?? '') === 'all' ? '' : String(type ?? '') }).type,
    'archive.filterTag': ({ tag }) => patch({ tag: String(tag ?? '') }).tag,
    'archive.search': ({ q }) => patch({ q: String(q ?? '') }).q,
    'archive.setView': ({ view }) => patch({ view: view === 'table' ? 'table' : 'cards' }).view,
    'archive.openProject': ({ project }) => {
      const found = byName(project);
      if (!found) return `no project called ${String(project)}`;
      window.location.hash = `#${projectPath(found.id)}`;
      return found.id;
    },
    'archive.toggleInSet': ({ project }) => {
      const found = byName(project);
      if (!found) return `no project called ${String(project)}`;
      const added = set.toggle(found.id);
      patch({ set: true });
      return `${found.name}: ${added ? 'in the set' : 'removed from the set'}`;
    },
    'archive.copySet': () => copySet(),
    'archive.openSetPage': () => {
      if (setProjects.length === 0) return 'the portfolio set is empty';
      window.open(setLink(), '_blank', 'noreferrer');
      return setLink();
    },
    'archive.exportSet': () => {
      if (setProjects.length === 0) return 'the portfolio set is empty';
      window.open(setLink(true), '_blank', 'noreferrer');
      return setLink(true);
    },
    'archive.saveSetToSpaces': can('archive.curate') ? () => saveSetToSpaces() : false,
    'archive.clearSet': () => {
      set.clear();
      toast(t('archive.set.cleared'));
      return 'cleared';
    },
    // Declared, shown as a Placeholder, still registered so the bus tells the same truth as the tooltip (D-047).
    'archive.importFolder': () => 'not wired yet: Dropbox / Drive intake runs as scripts/archive/*, see docs/reference/surfaces.md',
  });

  const lifeTile = (id: Lifecycle | 'all') => {
    const active = f.life === id;
    const label = id === 'all' ? t('archive.stat.all') : t(`archive.stat.${id}`);
    const value = id === 'all' ? projects.length : counts.byLife[id];
    const files = id === 'all' ? totalFiles : counts.filesByLife[id];
    return <StatTile key={id} label={label} value={value} hint={t('archive.stat.hint', { files })} glyph={id === 'all' ? '▦' : LIFECYCLES.find((l) => l.id === id)?.glyph} tone={active ? 'accent' : 'neutral'} onActivate={() => patch({ life: id })} />;
  };

  const columns: Column<Project>[] = [
    { key: 'name', header: t('archive.label.project'), sortable: true, render: (p) => <span className="arc-card__name">{p.name}</span> },
    { key: 'client', header: t('archive.label.client'), sortable: true },
    { key: 'year', header: t('archive.label.year'), sortable: true, render: (p) => p.year ?? '—' },
    { key: 'type', header: t('archive.label.type'), sortable: true, render: (p) => t(`archive.type.${p.type}`) },
    { key: 'pipelineStatus', header: t('archive.label.status'), render: (p) => <StatusPill status={p.pipelineStatus} /> },
    { key: 'life', header: t('archive.label.lifecycle'), sortValue: (p) => lifecycleOf(p.pipelineStatus), render: (p) => <Badge>{pick(LIFECYCLES.find((l) => l.id === lifecycleOf(p.pipelineStatus))!.label, lang)}</Badge> },
    { key: 'files', header: t('archive.label.files'), align: 'end', sortValue: (p) => fileCount(p), render: (p) => fileCount(p) },
  ];

  const clearAll = () => patch({ life: 'all', year: '', type: '', tag: '', q: '', sort: 'yearDesc' });
  const hasFilters = f.life !== 'all' || Boolean(f.year || f.type || f.tag || f.q);

  return (
    <>
      <PageHeader
        code={archiveBrowserSpec(surface).code}
        title={t('archive.browser.title')}
        subtitle={t('archive.browser.subtitle', { projects: projects.length, files: totalFiles })}
        breadcrumb={[{ label: t(`core.portal.${surface}`), to: `/${surface}` }, { label: t('archive.browser.title') }]}
        actions={
          <>
            <ToggleButton label={t('archive.set.toggleAria')} pressed={f.set} onClick={() => patch({ set: !f.set })}>
              {f.set ? t('archive.set.modeOn') : t('archive.set.mode')}
            </ToggleButton>
            <Placeholder what={t('archive.browser.importWhat')}>
              <Button variant="primary">{t('archive.browser.import')}</Button>
            </Placeholder>
          </>
        }
      />

      <div className="arc-stats">{(['prospect', 'active', 'past', 'all'] as const).map(lifeTile)}</div>

      <FilterBar onClear={hasFilters ? clearAll : undefined} summary={t('archive.browser.summary', { shown: shown.length, total: projects.length })}>
        <div className="arc-toolbar__search">
          <SearchField value={f.q} onChange={(q) => patch({ q })} label={t('archive.browser.searchLabel')} placeholder={t('archive.browser.searchPlaceholder')} />
        </div>
        <Select className="arc-toolbar__field" label={t('archive.label.year')} value={f.year} onChange={(e) => patch({ year: e.target.value })} options={[{ value: '', label: t('archive.any.year') }, ...years.map((y) => ({ value: String(y), label: String(y) }))]} />
        <Select className="arc-toolbar__field" label={t('archive.label.type')} value={f.type} onChange={(e) => patch({ type: e.target.value })} options={[{ value: '', label: t('archive.any.type') }, ...PROJECT_TYPES.map((v) => ({ value: v, label: t(`archive.type.${v}`) }))]} />
        <Select className="arc-toolbar__field" label={t('archive.label.tag')} value={f.tag} onChange={(e) => patch({ tag: e.target.value })} options={[{ value: '', label: t('archive.any.tag') }, ...tags.map((v) => ({ value: v, label: v }))]} />
        <Select className="arc-toolbar__field" label={t('archive.label.sort')} value={f.sort} onChange={(e) => patch({ sort: e.target.value as SortKey })} options={SORTS.map((v) => ({ value: v, label: t(`archive.sort.${v}`) }))} />
        <div className="arc-views">
          <ToggleButton label={t('archive.view.toggle')} pressed={f.view === 'cards'} onClick={() => patch({ view: 'cards' })}>
            {t('archive.view.cards')}
          </ToggleButton>
          <ToggleButton label={t('archive.view.toggle')} pressed={f.view === 'table'} onClick={() => patch({ view: 'table' })}>
            {t('archive.view.table')}
          </ToggleButton>
        </div>
      </FilterBar>

      {shown.length === 0 && !loading && (
        <EmptyState title={t('archive.browser.emptyTitle')} description={t('archive.browser.emptyDesc')} glyph="▤">
          <Button onClick={clearAll}>{t('archive.browser.emptyAction')}</Button>
        </EmptyState>
      )}

      {f.view === 'table' && shown.length > 0 && (
        <DataTable
          columns={columns}
          rows={shown}
          rowKey={(p) => p.id}
          caption={t('archive.browser.tableCaption')}
          loading={loading}
          onRowActivate={(p) => {
            window.location.hash = `#${projectPath(p.id)}`;
          }}
        />
      )}

      {f.view === 'cards' && shown.length > 0 && (
        <ul className="arc-grid">
          {shown.map((p) => {
            const count = fileCount(p);
            // Curated files: the stored rows of this project (tagged or moved on S-13), how far the tagging pass has got (ar-09, ar-19).
            const tagged = (curatedByProject.get(p.id) ?? []).filter((file) => file.tags.length > 0).length;
            const life = LIFECYCLES.find((l) => l.id === lifecycleOf(p.pipelineStatus));
            return (
              <li key={p.id} data-project={p.id}>
                <Card padding="sm">
                  <Link className="arc-card__link" to={projectPath(p.id)} aria-label={t('archive.browser.openAria', { name: p.name })}>
                    <Cover project={p} />
                    <div className="arc-card__body">
                      <span className="arc-card__name">{p.name}</span>
                      <span className="arc-card__meta">
                        <span>{p.client}</span>
                        {p.year !== null && <span>· {p.year}</span>}
                        <span>· {count === 0 ? t('archive.browser.noFiles') : count === 1 ? t('archive.browser.filesOne') : t('archive.browser.files', { count })}</span>
                        {tagged > 0 && <span>· {t('archive.browser.tagged', { count: tagged })}</span>}
                        {p.sourceFolderUrl && <span title={t('archive.browser.source')} aria-label={t('archive.browser.source')}>· ⛁</span>}
                      </span>
                      <span className="arc-card__badges">
                        <StatusPill status={p.pipelineStatus} />
                        {life && <Badge tone="info">{pick(life.label, lang)}</Badge>}
                        {p.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </span>
                    </div>
                  </Link>
                  {f.set && (
                    <div className="arc-set-check">
                      <Checkbox label={t('archive.set.add')} aria-label={t('archive.set.addAria', { name: p.name })} checked={set.has(p.id)} onChange={() => set.toggle(p.id)} />
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {f.set && set.ids.length > 0 && (
        <div className="arc-setbar" role="group" aria-label={t('archive.set.bar')}>
          <span className="arc-setbar__count">{set.ids.length === 1 ? t('archive.set.countOne') : t('archive.set.count', { count: set.ids.length })}</span>
          <div className="arc-setbar__actions">
            <Button variant="primary" href={setLink()} external>
              {t('archive.set.openPage')}
            </Button>
            <Button href={setLink(true)} external>
              {t('archive.set.export')}
            </Button>
            {can('archive.curate') && <Button onClick={() => void saveSetToSpaces()}>{t('archive.set.saveToSpaces')}</Button>}
            {savedPostId && (
              <Button variant="ghost" href={`#/${surface}/spaces/post/${savedPostId}`}>
                {t('archive.set.openPost')}
              </Button>
            )}
            <Button onClick={() => void copySet()}>{t('archive.set.copy')}</Button>
            <Button
              variant="ghost"
              onClick={() => {
                set.clear();
                toast(t('archive.set.cleared'));
              }}
            >
              {t('archive.set.clear')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
