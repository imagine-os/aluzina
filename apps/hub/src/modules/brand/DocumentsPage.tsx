import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useCan } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { useTable } from '../../data/DataContext';
import type { Asset, Project, Relation } from '../../data/schema';
import { SERVICES, pick, type Service } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import { absoluteUrl, copyText, docIn, docsFromAssets, fontNames, formatMb, triggerDownload, type BrandDoc } from './documents';
import { documentsSpec } from './specs';
import './brand.css';

/**
 * The PDF viewer, three deep so nothing is a dead frame: `<object>` renders the PDF, its children render
 * when the browser has no PDF plugin (an `<iframe>`, which most mobile browsers do show), and the plain
 * paragraph renders when neither works - or when the file is simply not on the server yet. The download
 * link is inside the fallback, so a person who cannot read the PDF in place can still get it (P-09).
 * `page` opens the viewer at that page (`#page=N`, honoured by the browsers' PDF viewers).
 */
export function DocFrame({ doc, page, title, label, fallback, download }: { doc: BrandDoc; page?: number | null; title: string; label: string; fallback: string; download: string }) {
  const src = page && page > 0 ? `${doc.href}#page=${page}` : doc.href;
  return (
    <div className="brand-doc__frame">
      <object key={`${doc.id}-${page ?? 0}`} className="brand-doc__object" type="application/pdf" data={src} aria-label={label}>
        <iframe className="brand-doc__object" src={src} title={title}>
          <p className="brand-doc__fallback">{fallback}</p>
        </iframe>
        <p className="brand-doc__fallback">
          {fallback}{' '}
          <a className="btn btn--secondary btn--md" href={doc.href} download={doc.downloadName}>
            {download}
          </a>
        </p>
      </object>
    </div>
  );
}

/** What a document's pages relate to (D-026): the projects they depict or mention, the services they argue for. */
interface Related {
  pageCount: number;
  projects: Project[];
  services: Service[];
}

function relatedOf(doc: BrandDoc, pages: readonly Asset[], relations: readonly Relation[], projects: readonly Project[]): Related {
  const pageIds = new Set(pages.filter((p) => p.parentId === doc.assetId).map((p) => p.id));
  const rels = relations.filter((r) => r.fromType === 'assets' && pageIds.has(r.fromId));
  const projectIds = [...new Set(rels.filter((r) => r.toType === 'projects' && (r.kind === 'depicts' || r.kind === 'references')).map((r) => r.toId))];
  const serviceCodes = [...new Set(rels.filter((r) => r.toType === 'services' && r.kind === 'applies-to').map((r) => r.toId))];
  return {
    pageCount: pageIds.size,
    projects: projectIds.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => p !== undefined),
    services: serviceCodes.map((code) => SERVICES.find((s) => s.code === code)).filter((s): s is Service => s !== undefined),
  };
}

/** Colours the renderer read from the file, as swatches with the hex in the name (colour never alone, P-03). */
function Palette({ colors, label, className }: { colors: readonly string[]; label: string; className: string }) {
  if (!colors.length) return null;
  return (
    <span className={className} role="img" aria-label={label}>
      {colors.map((c) => (
        <span key={c} className={`${className}-swatch`} style={{ background: c }} title={c} />
      ))}
    </span>
  );
}

/**
 * G-08 `/brand/documents`: the studio portfolio and brochure, viewable in place and downloadable, read
 * from the `assets` table (`kind: 'document'`, prompt 0013) with what their pages relate to. The files are
 * static assets served with the app (`./brand/*.pdf`); there is no file storage yet, so "Replace document"
 * is a `Placeholder`. The same documents are public on P-05 `/portfolio`.
 */
export function DocumentsPage() {
  const { t, lang } = useT();
  const can = useCan();
  const manage = can('brand.manage');
  const documents = useTable('assets', { where: { kind: 'document', status: 'current' } });
  const pages = useTable('assets', { where: { kind: 'page' } });
  const relations = useTable('relations', { where: { fromType: 'assets' } });
  const projects = useTable('projects');
  const docs = useMemo(() => docsFromAssets(documents.rows, documents.loading), [documents.rows, documents.loading]);

  const [params, setParams] = useSearchParams();
  const [fallbackId, setFallbackId] = useState('portfolio');
  const current: BrandDoc = docIn(docs, params.get('doc')) ?? docIn(docs, fallbackId) ?? docs[0];
  const pageParam = Number(params.get('page'));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : null;
  const viewerRef = useRef<HTMLDivElement>(null);

  const title = (doc: BrandDoc) => (doc.id === 'portfolio' || doc.id === 'brochure' ? t(`brand.documents.doc.${doc.id}.title`) : lang === 'es' && doc.titleEs ? doc.titleEs : doc.title);
  const fullTitle = (doc: BrandDoc) => (lang === 'es' && doc.titleEs ? doc.titleEs : doc.title);
  const desc = (doc: BrandDoc) => (doc.id === 'portfolio' || doc.id === 'brochure' ? t(`brand.documents.doc.${doc.id}.desc`) : '');

  /** Selecting a document is a URL change, so the viewer is linkable and the back button works. */
  const select = (doc: BrandDoc) => {
    setFallbackId(doc.id);
    setParams({ doc: doc.id }, { replace: true });
    return doc.id;
  };

  const view = (doc: BrandDoc) => {
    select(doc);
    const node = viewerRef.current;
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      node.focus({ preventScroll: true });
    }
    return doc.id;
  };

  const openTab = (doc: BrandDoc) => {
    const url = absoluteUrl(doc.href);
    window.open(url, '_blank', 'noreferrer');
    return url;
  };

  const share = async (doc: BrandDoc) => {
    const url = absoluteUrl(doc.href);
    const ok = await copyText(url);
    toast(ok ? t('brand.documents.shared', { title: title(doc) }) : t('brand.documents.shareFailed', { url }));
    return url;
  };

  /** The action bus passes ids as values; an unknown or missing `doc` falls back to the one on screen. */
  const asDoc = (value: unknown): BrandDoc => docIn(docs, value) ?? current;

  useRegisterActions({
    'brand.viewDocument': manage && (({ doc }) => view(asDoc(doc))),
    'brand.downloadDocument': manage && (({ doc }) => triggerDownload(asDoc(doc))),
    'brand.openDocumentTab': manage && (({ doc }) => openTab(asDoc(doc))),
    'brand.shareDocumentLink': manage && (({ doc }) => share(asDoc(doc))),
  });

  const related = useMemo(() => new Map(docs.map((d) => [d.id, relatedOf(d, pages.rows, relations.rows, projects.rows)])), [docs, pages.rows, relations.rows, projects.rows]);

  return (
    <>
      <PageHeader
        code={documentsSpec.code}
        title={t('brand.documents.title')}
        subtitle={t('brand.documents.subtitle')}
        breadcrumb={[{ label: t('core.portal.brand'), to: '/brand' }, { label: t('brand.documents.title') }]}
        actions={
          <Placeholder what={t('brand.documents.replaceWhat')}>
            <Button variant="primary">{t('brand.documents.replace')}</Button>
          </Placeholder>
        }
      />

      <ul className="brand-grid">
        {docs.map((doc) => {
          const rel = related.get(doc.id);
          const fonts = fontNames(doc.fonts);
          return (
            <li key={doc.id} data-doc={doc.id} data-asset={doc.assetId ?? undefined}>
              <Card title={title(doc)} subtitle={fullTitle(doc)} raised={doc.id === current.id}>
                {desc(doc) && <p className="brand-doc__note">{desc(doc)}</p>}
                <p className="brand-doc__meta">
                  <span className="brand-path">{doc.downloadName}</span>
                  <span className="brand-list__meta">{t('brand.documents.fileMeta', { pages: doc.pages, size: formatMb(doc.bytes, lang) })}</span>
                  {rel && rel.pageCount > 0 && <span className="brand-list__meta">{t('brand.documents.pagesInData', { count: rel.pageCount })}</span>}
                </p>
                {(doc.palette.length > 0 || fonts.length > 0) && (
                  <p className="brand-doc__meta">
                    <Palette colors={doc.palette} label={t('brand.documents.palette', { colors: doc.palette.join(', ') })} className="brand-doc__palette" />
                    {fonts.length > 0 && <span className="brand-list__meta">{t('brand.documents.fonts', { fonts: fonts.join(', ') })}</span>}
                  </p>
                )}
                <div className="brand-actions-row">
                  <Button variant="primary" onClick={() => view(doc)}>
                    {t('brand.documents.view')}
                  </Button>
                  {/* The library Button has no `download` attribute yet (request in the changelog draft);
                      until it does, the download is an anchor wearing the Button's own classes, so it is
                      the same 44 px target with the same focus ring and stays one tab stop (P-03, P-07). */}
                  <a className="btn btn--secondary btn--md" href={doc.href} download={doc.downloadName} aria-label={t('brand.documents.downloadAria', { title: title(doc) })}>
                    {t('brand.documents.download')}
                  </a>
                  <Button variant="ghost" href={doc.href} external aria-label={t('brand.documents.newTabAria', { title: title(doc) })}>
                    {t('brand.documents.newTab')}
                  </Button>
                  <Button variant="ghost" onClick={() => void share(doc)} aria-label={t('brand.documents.shareAria', { title: title(doc) })}>
                    {t('brand.documents.share')}
                  </Button>
                </div>

                {/* Related (D-026): what this document's pages depict or argue for, read from `relations`. */}
                <section className="brand-doc__related" aria-labelledby={`brand-doc-related-${doc.id}`}>
                  <h3 id={`brand-doc-related-${doc.id}`} className="brand-doc__related-title">
                    {t('brand.documents.related')}
                  </h3>
                  {rel && rel.projects.length > 0 && (
                    <div className="brand-doc__related-row">
                      <span className="brand-list__meta">{t('brand.documents.relatedProjects', { count: rel.projects.length })}</span>
                      <div className="brand-actions-row">
                        {rel.projects.map((p) => (
                          <Button key={p.id} size="sm" variant="ghost" href={`#/brand/work/${p.id}`} iconEnd="›">
                            {p.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {rel && rel.services.length > 0 && (
                    <div className="brand-doc__related-row">
                      <span className="brand-list__meta">{t('brand.documents.relatedServices', { count: rel.services.length })}</span>
                      <div className="brand-actions-row">
                        {rel.services.map((s) => (
                          <Button key={s.code} size="sm" variant="ghost" href={`#/manual/services/${s.slug}`} iconEnd="›">
                            {s.code} · {pick(s.name, lang)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!rel || (rel.projects.length === 0 && rel.services.length === 0)) && <p className="brand-unknown">{documents.loading || relations.loading ? t('brand.documents.relatedLoading') : t('brand.documents.relatedNone')}</p>}
                </section>
              </Card>
            </li>
          );
        })}
      </ul>

      <div className="brand-stack">
        <div ref={viewerRef} tabIndex={-1} className="brand-doc__anchor" id="brand-documents-viewer">
          <Card title={t('brand.documents.viewer')} subtitle={t('brand.documents.viewerSub')} padding="sm">
            <Tabs label={t('brand.documents.tabsLabel')} value={current.id} onChange={(id) => select(docIn(docs, id) ?? docs[0])} tabs={docs.map((d) => ({ id: d.id, label: title(d) }))}>
              <DocFrame doc={current} page={page} title={t('brand.documents.frameTitle', { title: title(current) })} label={t('brand.documents.frameTitle', { title: title(current) })} fallback={t('brand.documents.noPdf')} download={t('brand.documents.download')} />
            </Tabs>
          </Card>
        </div>

        <Card title={t('brand.documents.storage')} subtitle={t('brand.documents.storageSub')}>
          <p className="brand-doc__note">{t('brand.documents.storageBody')}</p>
          <p className="brand-doc__note">{t('brand.documents.dataBody')}</p>
        </Card>
      </div>
    </>
  );
}
