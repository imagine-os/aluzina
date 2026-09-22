import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useCan } from '../../auth/SessionProvider';
import { Badge, type Tone } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { FileIcon } from '../../components/atom/FileIcon/FileIcon';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Input } from '../../components/atom/Input/Input';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Thumb } from '../../components/molecule/Thumb/Thumb';
import { DocumentViewer } from '../../components/organism/DocumentViewer/DocumentViewer';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useTable } from '../../data/DataContext';
import { fileTypeOf, normalize, type FileType } from '../../domain/archive';
import { COLLECTION_SLUGS, isCollectionSlug, loadCollection, servedUrl, type CollectionFile, type CollectionIndex, type CollectionSet, type CollectionSlug } from '../../domain/collections';
import { useT } from '../../i18n/I18nProvider';
import { collectionsSpec } from './specs';
import './brand.css';

/** Extensions that are working files rather than deliverables; badged "RAW" so nobody sends one to a client. */
const RAW_EXTS = new Set(['ai', 'psd', 'indd', 'idml', 'eps', 'cdr', 'sketch', 'fig', 'xd', 'afdesign', 'afphoto', 'dwg', 'skp', 'max', '3dm', 'blend', 'c4d', 'aep', 'prproj', 'cr2', 'nef', 'arw', 'dng', 'raw']);

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; index: CollectionIndex };

/** Size with the language's decimal mark: bytes, KB, MB or GB, one decimal from MB up. */
function formatSize(bytes: number, lang: string): string {
  if (bytes <= 0) return '0 KB';
  const units: [number, string, number][] = [
    [1024 ** 3, 'GB', 1],
    [1024 ** 2, 'MB', 1],
    [1024, 'KB', 0],
  ];
  for (const [factor, unit, digits] of units) {
    if (bytes >= factor) return `${(bytes / factor).toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${unit}`;
  }
  return `${bytes.toLocaleString(lang)} B`;
}

/** A file is served (and so previewable) only when it is neither internal nor redacted and has a render. */
function isServed(f: CollectionFile): boolean {
  return !f.redacted && f.visibility !== 'internal' && (f.thumb !== null || f.pages.length > 0);
}

function typeOf(f: CollectionFile): FileType {
  if (f.ext === '') return 'folder';
  return fileTypeOf(f.ext || f.name);
}

/** The file's state as Badges, computed from the row (never a status column that could drift). */
function badgesOf(f: CollectionFile, t: (k: string) => string): { key: string; label: string; tone: Tone }[] {
  const out: { key: string; label: string; tone: Tone }[] = [];
  if (f.redacted) out.push({ key: 'redacted', label: t('brand.collections.badge.redacted'), tone: 'danger' });
  if (f.visibility === 'internal') out.push({ key: 'internal', label: t('brand.collections.badge.internal'), tone: 'warning' });
  if (RAW_EXTS.has(f.ext.toLowerCase()) || f.tags.includes('raw')) out.push({ key: 'raw', label: t('brand.collections.badge.raw'), tone: 'info' });
  if (f.duplicateOf) out.push({ key: 'duplicate', label: t('brand.collections.badge.duplicate'), tone: 'neutral' });
  return out;
}

/**
 * G-09 `/brand/collections`: the two shared Dropbox folders (the 2021 campaign and the studio asset
 * library) as sets of files. The index is read lazily from `docs/archive/collections/<slug>/index.json`
 * (`loadCollection`), never seeded: one collection can hold thousands of file rows, which would bloat
 * both the main bundle and the localStorage store. Renders are served from `public/archive/<slug>/`;
 * anything internal or redacted is listed by name and size with no preview at all (D-059).
 */
export function CollectionsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const manage = can('brand.manage');
  const [params, setParams] = useSearchParams();
  const projects = useTable('projects');

  const slug: CollectionSlug = isCollectionSlug(params.get('c')) ? (params.get('c') as CollectionSlug) : COLLECTION_SLUGS[0];
  const setId = params.get('set');
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [query, setQuery] = useState('');
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Lazy index: one fetch per collection, cancelled when the person switches before it lands.
  useEffect(() => {
    let alive = true;
    setLoad({ status: 'loading' });
    loadCollection(slug).then(
      (index) => alive && setLoad({ status: 'ready', index }),
      (e: unknown) => alive && setLoad({ status: 'error', message: e instanceof Error ? e.message : String(e) }),
    );
    return () => {
      alive = false;
    };
  }, [slug, attempt]);

  // The filter and the open preview belong to the set you are looking at, not to the whole portal.
  useEffect(() => {
    setQuery('');
    setOpenPath(null);
  }, [slug, setId]);

  const index = load.status === 'ready' ? load.index : null;
  const sets = index?.sets ?? [];
  const set: CollectionSet | null = sets.find((s) => s.id === setId) ?? null;
  const setFiles = useMemo(() => (index && set ? index.files.filter((f) => f.setId === set.id) : []), [index, set]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return setFiles;
    return setFiles.filter((f) => normalize(f.name).includes(q) || normalize(f.path).includes(q) || f.tags.some((tag) => normalize(tag).includes(q)));
  }, [setFiles, query]);

  const previewable = filtered.filter(isServed);
  const listed = filtered.filter((f) => !isServed(f));
  const openFile = openPath ? setFiles.find((f) => f.path === openPath) ?? null : null;

  const stats = useMemo(() => {
    if (!index) return null;
    return {
      sets: index.sets.length,
      files: index.files.length,
      previewed: index.files.filter(isServed).length,
      internal: index.files.filter((f) => f.visibility === 'internal' || f.redacted).length,
      bytes: index.totals.bytes,
      redacted: index.totals.redacted,
    };
  }, [index]);

  const collectionTitle = (s: CollectionSlug) => t(`brand.collections.name.${s}`);
  const setTitle = (s: CollectionSet) => (lang === 'es' && s.titleEs ? s.titleEs : s.title);
  const setNote = (s: CollectionSet) => (lang === 'es' && s.noteEs ? s.noteEs : s.note);
  const fileCountLabel = (n: number) => (n === 0 ? t('brand.collections.filesNone') : n === 1 ? t('brand.collections.filesOne') : t('brand.collections.files', { count: n }));
  const projectName = (id: string) => projects.rows.find((p) => p.id === id)?.name ?? id;

  // ---- navigation: collection and set live in the URL, so both are linkable and Back walks out ----
  const selectCollection = (next: CollectionSlug): string => {
    setParams({ c: next });
    return `opened the collection "${collectionTitle(next)}"`;
  };

  const openSet = (s: CollectionSet): string => {
    setParams({ c: slug, set: s.id });
    return `opened the set "${setTitle(s)}" (${s.fileCount} files, ${s.redactedCount} redacted)`;
  };

  const closeSet = () => setParams({ c: slug });

  const openPreview = (f: CollectionFile): string => {
    if (!isServed(f)) return `no preview for "${f.name}": the file is ${f.redacted ? 'redacted' : 'internal'}`;
    setOpenPath(f.path);
    return `opened the preview of "${f.name}" (${f.pages.length > 0 ? `${f.pages.length} page renders` : 'thumbnail only'})`;
  };

  useRegisterActions({
    'brand.openCollection': manage && (({ collection }) => (isCollectionSlug(collection) ? selectCollection(collection) : `unknown collection "${String(collection)}"`)),
    'brand.openSet': manage && (({ set: id }) => {
      const found = sets.find((s) => s.id === id || s.folder === id);
      return found ? openSet(found) : `unknown set "${String(id)}"`;
    }),
    'brand.filterCollection': manage && (({ query: q }) => {
      const text = q === undefined || q === null ? '' : String(q);
      setQuery(text);
      return text ? `filtering the files by "${text}"` : 'cleared the file filter';
    }),
    'brand.openCollectionFile': manage && (({ file }) => {
      const found = setFiles.find((f) => f.path === file || f.name === file) ?? index?.files.find((f) => f.path === file || f.name === file);
      if (!found) return `unknown file "${String(file)}"`;
      if (!set || found.setId !== set.id) {
        const owner = sets.find((s) => s.id === found.setId);
        if (owner) openSet(owner);
      }
      return openPreview(found);
    }),
    'brand.closeCollectionFile': manage && (() => {
      setOpenPath(null);
      return 'closed the file preview';
    }),
    // Declared, shown as a Placeholder, registered so the bus answers honestly instead of `not-live` (D-047).
    'brand.downloadCollectionSet': manage && (() => 'not wired yet: downloading a whole set needs file storage; today the Dropbox folder is the download'),
  });

  const stubbed = index !== null && (index as unknown as { stub?: boolean }).stub === true;

  return (
    <>
      <PageHeader
        code={collectionsSpec.code}
        title={t('brand.collections.title')}
        subtitle={t('brand.collections.subtitle')}
        breadcrumb={[{ label: t('core.portal.brand'), to: '/brand' }, { label: t('brand.collections.title') }]}
      />

      <Tabs
        label={t('brand.collections.tabsLabel')}
        value={slug}
        onChange={(id) => isCollectionSlug(id) && selectCollection(id)}
        tabs={COLLECTION_SLUGS.map((s) => ({ id: s, label: collectionTitle(s) }))}
      >
        {load.status === 'loading' && <p className="brand-doc__note" role="status">{t('brand.collections.loading')}</p>}

        {load.status === 'error' && (
          <EmptyState title={t('brand.collections.errorTitle')} description={t('brand.collections.errorDesc', { message: load.message })} glyph="!">
            <Button variant="primary" onClick={() => setAttempt((n) => n + 1)}>
              {t('brand.collections.retry')}
            </Button>
          </EmptyState>
        )}

        {index && stats && (
          <>
            <p className="brand-doc__note">{index.caption}</p>
            {stubbed && (
              <p className="brand-col__stub" role="status">
                {t('brand.collections.stub')}
              </p>
            )}
            <p className="brand-doc__meta">
              <span className="brand-list__meta">{t('brand.collections.sharedBy', { who: index.sharedBy })}</span>
              <span className="brand-list__meta">{t('brand.collections.sharedAt', { date: index.sharedAt })}</span>
              <span className="brand-list__meta">{t('brand.collections.indexedAt', { date: index.indexedAt })}</span>
              <Button size="sm" variant="ghost" href={index.sourceUrl} external iconEnd="↗" aria-label={t('brand.collections.openDropboxAria', { title: collectionTitle(slug) })}>
                {t('brand.collections.openDropbox')}
              </Button>
            </p>

            <div className="brand-stats">
              <StatTile label={t('brand.collections.stat.sets')} value={stats.sets} />
              <StatTile label={t('brand.collections.stat.files')} value={stats.files} hint={t('brand.collections.stat.bytes', { size: formatSize(stats.bytes, lang) })} />
              <StatTile label={t('brand.collections.stat.previewed')} value={stats.previewed} tone="success" />
              <StatTile label={t('brand.collections.stat.internal')} value={stats.internal} tone="warning" hint={t('brand.collections.stat.redacted', { count: stats.redacted })} />
            </div>

            {/* ---- set grid ---- */}
            {!set && (
              <section aria-labelledby="brand-collections-sets">
                <h2 id="brand-collections-sets" className="brand-doc__related-title">
                  {t('brand.collections.sets')}
                </h2>
                <ul className="brand-grid brand-grid--sets">
                  {sets.map((s) => (
                    <li key={s.id} data-set={s.id}>
                      <Card title={setTitle(s)} subtitle={s.folder} padding="sm">
                        <button type="button" className="brand-col__tile" aria-label={t('brand.collections.openSetAria', { title: setTitle(s) })} onClick={() => openSet(s)}>
                          <Thumb
                            src={s.cover ? servedUrl(slug, s.cover) : null}
                            alt={setTitle(s)}
                            type={s.cover ? 'image' : 'folder'}
                            ratio="4:3"
                            badge={fileCountLabel(s.fileCount)}
                            iconLabel={setTitle(s)}
                          />
                        </button>
                        <p className="brand-doc__meta brand-col__meta">
                          <Badge tone="accent">{t(`brand.collections.kind.${s.kind}`)}</Badge>
                          <Badge tone={s.visibility === 'internal' ? 'warning' : 'success'}>{s.visibility === 'internal' ? t('brand.collections.badge.internal') : t('brand.collections.badge.public')}</Badge>
                          <span className="brand-list__meta">{formatSize(s.bytes, lang)}</span>
                        </p>
                        {setNote(s) && <p className="brand-col__note">{setNote(s)}</p>}
                        {s.projectIds.length > 0 && (
                          <div className="brand-doc__related-row">
                            <span className="brand-list__meta">{t('brand.collections.projects')}</span>
                            <div className="brand-actions-row">
                              {s.projectIds.map((id) => (
                                <Button key={id} size="sm" variant="ghost" href={`#/brand/archive/${id}`} iconEnd="›" aria-label={t('brand.collections.projectAria', { name: projectName(id) })}>
                                  {projectName(id)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ---- one set ---- */}
            {set && (
              <section className="brand-col__set" aria-labelledby="brand-collections-set-title">
                <div className="brand-actions-row">
                  <Button variant="ghost" icon="‹" onClick={closeSet}>
                    {t('brand.collections.back')}
                  </Button>
                </div>
                <h2 id="brand-collections-set-title" className="brand-col__set-title">
                  {setTitle(set)}
                </h2>
                <p className="brand-doc__meta">
                  <span className="brand-path">{set.folder}</span>
                  <Badge tone="accent">{t(`brand.collections.kind.${set.kind}`)}</Badge>
                  <Badge tone={set.visibility === 'internal' ? 'warning' : 'success'}>{set.visibility === 'internal' ? t('brand.collections.badge.internal') : t('brand.collections.badge.public')}</Badge>
                  <span className="brand-list__meta">{fileCountLabel(set.fileCount)}</span>
                  <span className="brand-list__meta">{formatSize(set.bytes, lang)}</span>
                  <Placeholder what={t('brand.collections.downloadWhat')}>
                    <Button size="sm">{t('brand.collections.download')}</Button>
                  </Placeholder>
                </p>
                {setNote(set) && <p className="brand-col__note">{setNote(set)}</p>}

                {set.contactSheet && (
                  <Card title={t('brand.collections.contactSheet')} padding="sm">
                    <img className="brand-col__sheet" src={servedUrl(slug, set.contactSheet)} alt={t('brand.collections.contactSheetAlt', { title: setTitle(set) })} loading="lazy" decoding="async" />
                    <div className="brand-actions-row">
                      <Button size="sm" variant="ghost" href={servedUrl(slug, set.contactSheet)} external iconEnd="↗">
                        {t('brand.collections.contactSheetOpen')}
                      </Button>
                    </div>
                  </Card>
                )}

                {setFiles.length > 0 && (
                  <Input
                    className="brand-col__filter"
                    type="search"
                    label={t('brand.collections.filterLabel')}
                    hint={t('brand.collections.filterHint')}
                    placeholder={t('brand.collections.filterPlaceholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                )}

                {setFiles.length === 0 && <EmptyState title={t('brand.collections.emptyTitle')} description={t('brand.collections.emptyDesc')} glyph="▧" />}
                {setFiles.length > 0 && filtered.length === 0 && <EmptyState title={t('brand.collections.noMatchesTitle')} description={t('brand.collections.noMatchesDesc', { query })} glyph="▧" />}

                {previewable.length > 0 && (
                  <>
                    <h3 className="brand-doc__related-title">{t('brand.collections.previews')}</h3>
                    <ul className="brand-grid brand-grid--files">
                      {previewable.map((f) => (
                        <li key={f.path} data-file={f.path}>
                          <button type="button" className="brand-col__tile" aria-label={t('brand.collections.openFileAria', { name: f.name })} onClick={() => openPreview(f)}>
                            <Thumb
                              src={f.thumb ? servedUrl(slug, f.thumb) : f.pages[0] ? servedUrl(slug, f.pages[0]) : null}
                              alt={f.name}
                              type={typeOf(f)}
                              ratio="4:3"
                              badge={f.pageCount && f.pageCount > 1 ? t('brand.collections.pages', { count: f.pageCount }) : f.ext.toUpperCase()}
                              caption={f.name}
                              size="sm"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {listed.length > 0 && (
                  <>
                    <h3 className="brand-doc__related-title">{t('brand.collections.otherFiles')}</h3>
                    <ul className="brand-list">
                      {listed.map((f) => (
                        <li key={f.path} data-file={f.path}>
                          <div className="brand-list__row" title={t('brand.collections.noPreviewTip')}>
                            <FileIcon type={typeOf(f)} size="md" label={f.ext || t('brand.collections.badge.internal')} />
                            <span className="brand-list__main">
                              <span className="brand-list__title">{f.name}</span>
                              <span className="brand-list__meta">
                                {f.path}
                                {f.duplicateOf ? ` · ${t('brand.collections.duplicateOf', { path: f.duplicateOf })}` : ''}
                              </span>
                            </span>
                            <span className="brand-list__meta">{formatSize(f.bytes, lang)}</span>
                            {badgesOf(f, t).map((b) => (
                              <Badge key={b.key} tone={b.tone}>
                                {b.label}
                              </Badge>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}
          </>
        )}
      </Tabs>

      <Drawer open={openFile !== null} onClose={() => setOpenPath(null)} title={openFile?.name ?? ''}>
        {openFile && index && (
          <>
            <p className="brand-doc__meta">
              <Badge tone="neutral">{openFile.ext.toUpperCase() || t('brand.collections.kind.internal')}</Badge>
              <span className="brand-list__meta">{formatSize(openFile.bytes, lang)}</span>
              {openFile.width && openFile.height && <span className="brand-list__meta">{t('brand.collections.dimensions', { width: openFile.width, height: openFile.height })}</span>}
              {openFile.pageCount && <span className="brand-list__meta">{openFile.pageCount === 1 ? t('brand.collections.pagesOne') : t('brand.collections.pages', { count: openFile.pageCount })}</span>}
              {badgesOf(openFile, t).map((b) => (
                <Badge key={b.key} tone={b.tone}>
                  {b.label}
                </Badge>
              ))}
            </p>
            <DocumentViewer
              asset={{
                title: openFile.name,
                titleEs: null,
                url: null,
                sourceUrl: index.sourceUrl,
                mimeType: openFile.mimeType,
                previewUrls: (openFile.pages.length > 0 ? openFile.pages : openFile.thumb ? [openFile.thumb] : []).map((p) => servedUrl(slug, p)),
                pageCount: openFile.pageCount,
                thumbnailUrl: openFile.thumb ? servedUrl(slug, openFile.thumb) : null,
                fileType: typeOf(openFile),
              }}
              controls={false}
              labels={{
                fallback: t('brand.collections.viewerFallback'),
                download: t('brand.collections.viewerDownload'),
                openSource: t('brand.collections.openDropbox'),
                page: (n, total) => t('brand.collections.viewerPosition', { index: n, total }),
                prev: t('brand.collections.viewerPrev'),
                next: t('brand.collections.viewerNext'),
                thumbnails: t('brand.collections.viewerThumbnails'),
              }}
            />
            <p className="brand-path">{openFile.path}</p>
            {openFile.textExcerpt && <p className="brand-col__note">{openFile.textExcerpt}</p>}
            {openFile.note && <p className="brand-col__note">{openFile.note}</p>}
            <div className="brand-actions-row">
              <Button href={index.sourceUrl} external iconEnd="↗">
                {t('brand.collections.openDropbox')}
              </Button>
              <Button variant="ghost" onClick={() => setOpenPath(null)}>
                {t('brand.collections.close')}
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
