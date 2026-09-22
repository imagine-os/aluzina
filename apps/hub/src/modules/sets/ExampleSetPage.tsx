import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Badge } from '../../components/atom/Badge/Badge';
import { BrandMark } from '../../components/atom/BrandMark/BrandMark';
import { Button } from '../../components/atom/Button/Button';
import { FileIcon } from '../../components/atom/FileIcon/FileIcon';
import { Skeleton } from '../../components/atom/Skeleton/Skeleton';
import { toast } from '../../components/atom/Toast/Toast';
import { ToggleButton } from '../../components/atom/ToggleButton/ToggleButton';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Thumb } from '../../components/molecule/Thumb/Thumb';
import { DocumentViewer } from '../../components/organism/DocumentViewer/DocumentViewer';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useTable } from '../../data/DataContext';
import { useProjectFiles } from '../../data/archiveFiles';
import type { Asset, Project } from '../../data/schema';
import { FILE_TYPE_LABELS, fileTypeOf, pick, type FileType } from '../../domain';
import { copyText } from '../../design/clipboard';
import type { Lang } from '../../i18n/types';
import { clientPreviews, clientSummary, clientTags, readSetParams, realText, translator } from './model';
import './sets.css';

/** The studio's own site stays the home of the full body of work (D-031); the set page links to it, never replaces it. */
const WEBSITE_URL = 'https://aluzinaa.com';
/** Print waits for the covers and the first previews to settle before handing the page to the browser dialog. */
const PRINT_SETTLE_MS = 1200;

type T = (key: string, vars?: Record<string, string | number>) => string;

function fileTypeOfAsset(asset: Asset): FileType {
  return fileTypeOf(asset.slug.includes('.') ? asset.slug : asset.title || asset.mimeType);
}

/** Cover of a project: its served render, else the mosaic of its file-type icons (the S-12 fallback). */
function Cover({ project, t }: { project: Project; t: T }) {
  if (project.coverUrl) return <Thumb src={project.coverUrl} alt={t('sets.cover', { name: project.name })} type="image" ratio="16:9" size="lg" />;
  const types = project.fileTypes;
  if (types.length === 0) return <Thumb src={null} alt={t('sets.mosaic', { name: project.name })} type="folder" ratio="16:9" size="lg" />;
  return (
    <span className={`set-mosaic${types.length === 1 ? ' set-mosaic--single' : ''}`} role="img" aria-label={t('sets.mosaic', { name: project.name })}>
      {types.map((type) => (
        <FileIcon key={type} type={type} size="lg" />
      ))}
    </span>
  );
}

/**
 * One project of the set: the facts a client cares about and a strip of design previews from the project's
 * file chunk. Confidential and redacted files are filtered out in `clientPreviews`, so they never render
 * and their names never print (D-059).
 */
function ProjectSection({
  project,
  lang,
  t,
  onPreviews,
  onOpen,
}: {
  project: Project;
  lang: Lang;
  t: T;
  onPreviews: (projectId: string, previews: Asset[]) => void;
  onOpen: (asset: Asset) => void;
}) {
  const { rows, loading } = useProjectFiles(project);
  const previews = useMemo(() => clientPreviews(rows), [rows]);
  const summary = useMemo(() => clientSummary(project.summary), [project.summary]);
  const location = realText(project.location);
  const typeLabel = t(`sets.type.${project.type}`);
  // The archive tags a project with its type in Spanish; the type already has its own line, so it is dropped here.
  const tags = useMemo(() => clientTags(project, [typeLabel, project.type]), [project, typeLabel]);

  useEffect(() => {
    onPreviews(project.id, previews);
  }, [onPreviews, project.id, previews]);

  const headingId = `set-project-${project.id}`;

  return (
    <section className="set-project" aria-labelledby={headingId} data-project={project.id}>
      <div className="set-project__cover">
        <Cover project={project} t={t} />
      </div>
      <div className="set-project__body">
        <h2 id={headingId} className="set-project__name">
          {project.name}
        </h2>
        <p className="set-project__meta">
          {project.year !== null && <span>{project.year}</span>}
          <span>{typeLabel}</span>
          {location && <span>{location}</span>}
        </p>
        {tags.length > 0 && (
          <p className="set-project__tags">
            {tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </p>
        )}
        {summary && <p className="set-project__summary">{summary}</p>}

        <div className="set-previews">
          <h3 className="set-previews__title">{t('sets.previews')}</h3>
          {loading && (
            <div className="set-previews__loading" aria-busy="true">
              <Skeleton lines={2} />
            </div>
          )}
          {!loading && previews.length === 0 && <p className="set-previews__none">{t('sets.previewNone')}</p>}
          {previews.length > 0 && (
            <ul className="set-previews__strip" aria-label={t('sets.previewsOf', { name: project.name })}>
              {previews.map((file) => {
                const type = fileTypeOfAsset(file);
                return (
                  <li key={file.id}>
                    <button type="button" className="set-preview" onClick={() => onOpen(file)} aria-label={t('sets.previewOpen', { name: file.title })}>
                      <Thumb
                        src={file.thumbnailUrl}
                        alt={file.title}
                        type={type}
                        ratio="4:3"
                        badge={file.previewUrls.length > 1 ? String(file.previewUrls.length) : undefined}
                        iconLabel={pick(FILE_TYPE_LABELS[type], lang)}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {previews.length > 0 && <p className="set-previews__more">{t('sets.previewMore')}</p>}
        </div>
      </div>
    </section>
  );
}

/**
 * P-06 `/sets?p=<id>,<id>&t=<title>&lang=es|en&print=1`: the page a client opens when the studio shares a set
 * of examples from S-12. Stateless (the link is the set), Spanish by default, printable as a PDF, and free of
 * anything the studio marked confidential. Public surface, `bare` shell, no session (D-035).
 */
export function ExampleSetPage() {
  const [params, setParams] = useSearchParams();
  const { ids, title, lang, print } = readSetParams(params);
  const t = useMemo(() => translator(lang), [lang]);
  const { rows, loading } = useTable('projects');

  const projects = useMemo(() => {
    const byId = new Map((rows as Project[]).map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter((p): p is Project => Boolean(p));
  }, [ids, rows]);

  const [open, setOpen] = useState<Asset | null>(null);
  const [page, setPage] = useState(1);
  /** Previews reported by the mounted sections, so `sets.openPreview {asset}` can resolve an id (P-05). */
  const previewsRef = useRef(new Map<string, Asset[]>());
  const onPreviews = useCallback((projectId: string, previews: Asset[]) => {
    previewsRef.current.set(projectId, previews);
  }, []);

  const openPreview = useCallback((asset: Asset) => {
    setOpen(asset);
    setPage(1);
  }, []);

  const setLang = useCallback(
    (next: Lang) => {
      const out = new URLSearchParams(params);
      out.set('lang', next);
      setParams(out, { replace: true });
      return next;
    },
    [params, setParams],
  );

  const copyLink = useCallback(async () => {
    const link = window.location.href;
    const ok = await copyText(link);
    toast(ok ? t('sets.copied') : t('sets.copyFailed'));
    return link;
  }, [t]);

  // `print=1` (what S-12's "Export PDF" opens) hands the page to the browser's print dialog once the
  // projects have resolved and the thumbnails have had a moment to load.
  const printedRef = useRef(false);
  useEffect(() => {
    if (!print || printedRef.current || loading || projects.length === 0) return;
    printedRef.current = true;
    const timer = setTimeout(() => window.print(), PRINT_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [print, loading, projects.length]);

  useRegisterActions({
    'sets.print': () => {
      window.print();
      return 'print dialog';
    },
    'sets.copyLink': () => copyLink(),
    'sets.setLang': ({ lang: next }) => setLang(String(next) === 'en' ? 'en' : 'es'),
    'sets.openPreview': ({ asset }) => {
      const needle = String(asset ?? '');
      for (const previews of previewsRef.current.values()) {
        const found = previews.find((p) => p.id === needle) ?? previews.find((p) => p.title.toLowerCase() === needle.toLowerCase());
        if (found) {
          openPreview(found);
          return found.title;
        }
      }
      return `no preview called ${needle}`;
    },
    'sets.closePreview': () => {
      setOpen(null);
      return 'closed';
    },
  });

  const openType = open ? fileTypeOfAsset(open) : 'other';
  const countLabel = projects.length === 1 ? t('sets.countOne') : t('sets.count', { count: projects.length });

  return (
    <div className="set-page" lang={lang}>
      <header className="set-head">
        <div className="set-head__brand">
          <BrandMark kind="wordmark" size="md" label={t('sets.brandAria')} />
          {/* The kicker names the page under the wordmark; without a set title the h1 in the body says it instead. */}
          {title && <p className="set-head__kicker">{t('sets.title')}</p>}
        </div>
        <div className="set-head__controls no-print" role="group" aria-label={t('sets.controls')}>
          <div className="set-head__langs" role="group" aria-label={t('sets.lang')}>
            <ToggleButton label={t('sets.langEsAria')} pressed={lang === 'es'} onClick={() => setLang('es')}>
              {t('sets.langEs')}
            </ToggleButton>
            <ToggleButton label={t('sets.langEnAria')} pressed={lang === 'en'} onClick={() => setLang('en')}>
              {t('sets.langEn')}
            </ToggleButton>
          </div>
          <Button onClick={() => window.print()}>{t('sets.print')}</Button>
          <Button variant="ghost" onClick={() => void copyLink()}>
            {t('sets.copyLink')}
          </Button>
        </div>
      </header>

      <main className="set-main">
        <h1 className="set-title">{title || t('sets.title')}</h1>
        <p className="set-intro">
          {t('sets.intro')} {projects.length > 0 && <span className="set-intro__count">{countLabel}</span>}
        </p>

        {loading && projects.length === 0 && (
          <div className="set-loading" aria-busy="true">
            <Skeleton lines={3} />
          </div>
        )}

        {!loading && projects.length === 0 && (
          <EmptyState title={t('sets.emptyTitle')} description={t('sets.emptyDesc')} glyph="◇">
            <Button href={WEBSITE_URL} external>
              {t('sets.emptyAction')}
            </Button>
          </EmptyState>
        )}

        {projects.map((project) => (
          <ProjectSection key={project.id} project={project} lang={lang} t={t} onPreviews={onPreviews} onOpen={openPreview} />
        ))}
      </main>

      <footer className="set-foot">
        <p className="set-foot__studio">{t('sets.footStudio')}</p>
        <p className="set-foot__site">
          <a href={WEBSITE_URL} target="_blank" rel="noreferrer" aria-label={t('sets.footSiteAria')}>
            {t('sets.footSite')}
          </a>
        </p>
        <p className="set-foot__note">{t('sets.footNote')}</p>
      </footer>

      <Drawer open={open !== null} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open && (
          <DocumentViewer
            asset={{
              title: open.title,
              titleEs: open.titleEs,
              url: open.url,
              sourceUrl: null,
              mimeType: open.mimeType,
              previewUrls: open.previewUrls,
              pageCount: open.pageCount,
              thumbnailUrl: open.thumbnailUrl,
              fileType: openType,
            }}
            page={page}
            onPage={setPage}
            controls={false}
            labels={{
              fallback: t('sets.previewFallback'),
              download: t('sets.previewOpen', { name: open.title }),
              openSource: t('sets.footSite'),
              page: (n, total) => t('sets.previewPage', { index: n, total }),
              prev: t('sets.previewPrev'),
              next: t('sets.previewNext'),
              thumbnails: t('sets.previewPages'),
              fileType: pick(FILE_TYPE_LABELS[openType], lang),
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
