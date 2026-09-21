import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Markdown } from '../../components/atom/Markdown/Markdown';
import { Skeleton } from '../../components/atom/Skeleton/Skeleton';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { SpaceTree } from '../../components/organism/SpaceTree/SpaceTree';
import { PLAN, type PlanTask } from '../../plan';
import { useT } from '../../i18n/I18nProvider';
import './docs.css';
import { allFolderIds, buildTree, DOC_PATHS, docLabel, folderId, hasDoc, loadDoc, PLAN_PATH, resolveDocLink } from './files';
import { docsSpec, documentSpec } from './specs';

const DEFAULT_DOC = 'README.md';
const GITHUB_BASE = 'https://github.com/imagine-os/aluzina/blob/main/docs/';

/** In-app URL of a document, absolute so the Markdown atom links it (it only linkifies http(s) / mailto). */
function docHref(path: string): string {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}#/docs/${path}`;
}

/** Rewrites relative Markdown links between documents to this viewer; links that leave `docs/` stay as written. */
function rewriteLinks(source: string, from: string): string {
  return source.replace(/\]\(([^)\s]+)\)/g, (whole, href: string) => {
    if (/^(https?:|mailto:|#|<)/i.test(href)) return whole;
    const target = resolveDocLink(from, href);
    return target ? `](${docHref(target)})` : whole;
  });
}

/** D-06 `/docs` and D-15 `/docs/*`: the repo documentation tree, rendered in the product. */
export function DocsPage({ code }: { code: string }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const params = useParams();
  const splat = params['*'];
  const path = splat && splat.length > 0 ? splat : DEFAULT_DOC;

  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => Object.fromEntries(allFolderIds().map((id) => [id, false])));
  const [treeOpen, setTreeOpen] = useState(false);
  const [cache, setCache] = useState<Record<string, string>>({});
  const [loadingAll, setLoadingAll] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const known = hasDoc(path);
  const source = cache[path];

  // Load the selected document (once; the cache also feeds the full-text search).
  useEffect(() => {
    if (!known || path === PLAN_PATH || cache[path] !== undefined) return;
    let alive = true;
    loadDoc(path)
      .then((text) => alive && setCache((prev) => (prev[path] === undefined ? { ...prev, [path]: text } : prev)))
      .catch(() => alive && setCache((prev) => ({ ...prev, [path]: '' })));
    return () => {
      alive = false;
    };
  }, [path, known, cache]);

  // Keep the folders of the selected document open.
  useEffect(() => {
    const parts = path.split('/');
    if (parts.length < 2) return;
    setExpanded((prev) => {
      const next = { ...prev };
      for (let i = 1; i < parts.length; i++) next[folderId(parts.slice(0, i).join('/'))] = true;
      return next;
    });
  }, [path]);

  const loadedCount = Object.keys(cache).length;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return DOC_PATHS.map((p) => {
      const inName = p.toLowerCase().includes(q);
      const inText = (cache[p] ?? '').toLowerCase().includes(q);
      return inName || inText ? { path: p, inText: inText && !inName } : null;
    }).filter((m): m is { path: string; inText: boolean } => m !== null);
  }, [query, cache]);

  const folderLabel = useCallback(
    (folder: string) => {
      const key = `docs.folder.${folder}`;
      const label = t(key);
      return label === `<${key}>` ? `${folder}/` : label;
    },
    [t],
  );

  const nodes = useMemo(
    () => buildTree({ paths: matches ? matches.map((m) => m.path) : undefined, folderLabel }),
    [matches, folderLabel],
  );

  const open = useCallback(
    (next: string) => {
      navigate(`/docs/${next}`);
      setTreeOpen(false);
      return next;
    },
    [navigate],
  );

  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    const missing = DOC_PATHS.filter((p) => p !== PLAN_PATH && cache[p] === undefined);
    const loaded = await Promise.all(missing.map(async (p) => [p, await loadDoc(p).catch(() => '')] as const));
    setCache((prev) => ({ ...prev, ...Object.fromEntries(loaded) }));
    setLoadingAll(false);
    return loaded.length;
  }, [cache]);

  useRegisterActions({
    'docs.openDocument': ({ path: wanted }) => {
      const asked = String(wanted).replace(/^\/?docs\//, '').replace(/^\//, '');
      const found = hasDoc(asked) ? asked : DOC_PATHS.find((p) => p.toLowerCase().endsWith(`/${asked.toLowerCase()}`) || docLabel(p).toLowerCase() === asked.toLowerCase());
      if (!found) throw new Error(`no document ${asked}`);
      return open(found);
    },
    'docs.searchDocs': ({ query: q }) => {
      const text = String(q ?? '');
      setQuery(text);
      const lower = text.trim().toLowerCase();
      if (!lower) return [];
      return DOC_PATHS.filter((p) => p.toLowerCase().includes(lower) || (cache[p] ?? '').toLowerCase().includes(lower));
    },
    'docs.openOnGithub': () => {
      const url = `${GITHUB_BASE}${path}`;
      window.open(url, '_blank', 'noreferrer');
      return url;
    },
    'docs.collapseFolder': ({ folder, open: shouldOpen }) => {
      const asked = String(folder);
      const id = asked.startsWith('dir:') ? asked : folderId(asked.replace(/\/$/, ''));
      const next = shouldOpen === undefined ? !expanded[id] : Boolean(shouldOpen) && shouldOpen !== 'false';
      setExpanded((prev) => ({ ...prev, [id]: next }));
      return { folder: id, open: next };
    },
  });

  /** Rewritten links are real <a href>s; this keeps a click inside the app instead of opening a tab. */
  const onBodyClick = (e: MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const hash = anchor.getAttribute('href')?.split('#')[1];
    if (!hash?.startsWith('/docs/')) return;
    e.preventDefault();
    open(hash.slice('/docs/'.length));
  };

  const spec = code === documentSpec.code ? documentSpec : docsSpec;

  const tree = (
    <div className="docs-tree">
      <SearchField value={query} onChange={setQuery} label={t('docs.search')} placeholder={t('docs.searchPlaceholder')} />
      {matches ? (
        <p className="docs-muted" role="status">
          {matches.length === 0 ? t('docs.searchNone', { query }) : t('docs.searchResults', { n: matches.length, query })}
        </p>
      ) : (
        <p className="docs-muted">{t('docs.count', { n: DOC_PATHS.length })}</p>
      )}
      {nodes.length > 0 && (
        <SpaceTree
          nodes={nodes}
          selectedId={path}
          onSelect={(id) => (id.startsWith('dir:') ? setExpanded((prev) => ({ ...prev, [id]: !prev[id] })) : open(id))}
          expanded={expanded}
          onToggle={(id, isOpen) => setExpanded((prev) => ({ ...prev, [id]: isOpen }))}
          label={t('docs.treeLabel')}
        />
      )}
      <p className="docs-muted docs-hint">{t('docs.searchScope', { n: loadedCount })}</p>
      {loadedCount < DOC_PATHS.length - 1 && (
        <Button variant="ghost" size="sm" onClick={loadAll} disabled={loadingAll}>
          {loadingAll ? t('docs.loadingAll') : t('docs.loadAll')}
        </Button>
      )}
    </div>
  );

  return (
    <div className="docs-page">
      <PageHeader
        code={spec.code}
        title={t('docs.title')}
        subtitle={t('docs.subtitle')}
        breadcrumb={path === DEFAULT_DOC ? undefined : [{ label: t('docs.title'), to: '/docs' }, { label: docLabel(path) }]}
        actions={
          <Button variant="secondary" href={`${GITHUB_BASE}${path}`} external>
            {t('docs.openOnGithub')}
          </Button>
        }
      />

      <div className="docs-layout">
        <aside className="docs-side">{tree}</aside>

        <div className="docs-main">
          <div className="docs-browse">
            <Button variant="secondary" onClick={() => setTreeOpen(true)}>
              {t('docs.browse')}
            </Button>
          </div>

          <p className="docs-path">
            <Badge tone="neutral">{t('docs.path')}</Badge>
            <code>docs/{path}</code>
          </p>

          {!known ? (
            <EmptyState title={t('docs.notFound')} description={`docs/${path}`} glyph="▤">
              <Button variant="primary" href={`#/docs/${DEFAULT_DOC}`}>
                {t('docs.startHere')}
              </Button>
            </EmptyState>
          ) : path === PLAN_PATH ? (
            <PlanTable />
          ) : source === undefined ? (
            <Skeleton lines={12} />
          ) : (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- delegated link handling only; every link stays a real, focusable <a>
            <div className="docs-doc" ref={bodyRef} onClick={onBodyClick} lang={lang === 'es' ? 'en' : undefined}>
              <Markdown source={rewriteLinks(source, path)} />
            </div>
          )}
        </div>
      </div>

      <Drawer open={treeOpen} onClose={() => setTreeOpen(false)} title={t('docs.browse')} side="left">
        {tree}
      </Drawer>
    </div>
  );
}

/** `docs/plan/plan.json` as the table the plan actually is (D-037), not as raw JSON. */
function PlanTable() {
  const { t } = useT();
  return (
    <section className="docs-plan" aria-label={t('docs.plan.title')}>
      <h2 className="docs-h2">{t('docs.plan.title')}</h2>
      <p className="docs-muted">{t('docs.plan.updated', { version: PLAN.version, updated: PLAN.updatedAt })}</p>
      <p className="docs-muted">{t('docs.plan.hint')}</p>
      <DataTable<PlanTask>
        caption={t('docs.plan.caption')}
        rows={PLAN.tasks}
        rowKey={(row) => row.id}
        initialSort={{ key: 'step', dir: 'asc' }}
        columns={[
          { key: 'id', header: t('docs.plan.id'), sortable: true },
          { key: 'title', header: t('docs.plan.taskTitle'), sortable: true },
          { key: 'step', header: t('docs.plan.step'), sortable: true },
          { key: 'status', header: t('docs.plan.status'), sortable: true, render: (row) => <StatusPill status={row.status} label={t(`docs.planStatus.${row.status}`)} /> },
          { key: 'model', header: t('docs.plan.model'), sortable: true },
          { key: 'codes', header: t('docs.plan.codes'), render: (row) => row.codes.join(', ') },
          { key: 'dependsOn', header: t('docs.plan.dependsOn'), render: (row) => row.dependsOn.join(', ') },
        ]}
      />
    </section>
  );
}
