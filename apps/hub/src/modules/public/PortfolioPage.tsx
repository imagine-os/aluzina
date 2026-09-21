import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { useTable } from '../../data/DataContext';
import { useT } from '../../i18n/I18nProvider';
import { absoluteDocUrl, docIn, docsFromAssets, fontNames, formatMb, triggerDocDownload, type PublicDoc } from './documents';
import { PublicLayout, WEBSITE_URL } from './PublicLayout';

/**
 * The PDF viewer, three deep so a visitor is never left with a blank rectangle: `<object>` renders the
 * PDF, the `<iframe>` inside it renders when the browser has no PDF plugin, and the paragraph renders
 * when neither works - or when the file is not on the server yet. The download link sits in the
 * fallback, so the document is always reachable (P-09).
 */
function DocFrame({ doc, title, fallback, download }: { doc: PublicDoc; title: string; fallback: string; download: string }) {
  return (
    <div className="pub-doc__frame">
      <object key={doc.id} className="pub-doc__object" type="application/pdf" data={doc.href} aria-label={title}>
        <iframe className="pub-doc__object" src={doc.href} title={title}>
          <p className="pub-doc__fallback">{fallback}</p>
        </iframe>
        <p className="pub-doc__fallback">
          {fallback}{' '}
          <Button href={doc.href} download={doc.downloadName}>
            {download}
            </Button>
        </p>
      </object>
    </div>
  );
}

/**
 * P-05 `/portfolio`: the studio portfolio and brochure for a visitor - read them in the page or take the
 * PDF away. No session, no permission: the route is public and the shell is bare (D-035). The list is the
 * `assets` table (`kind: 'document'`, prompt 0013): the same rows the brand portal manages on G-08.
 */
export function PortfolioPage() {
  const { t, lang } = useT();
  const documents = useTable('assets', { where: { kind: 'document', status: 'current' } });
  const docs = useMemo(() => docsFromAssets(documents.rows, documents.loading), [documents.rows, documents.loading]);
  const [params, setParams] = useSearchParams();
  const [fallbackId, setFallbackId] = useState('portfolio');
  const current: PublicDoc = docIn(docs, params.get('doc')) ?? docIn(docs, fallbackId) ?? docs[0];
  const viewerRef = useRef<HTMLDivElement>(null);

  const title = (doc: PublicDoc) => (doc.id === 'portfolio' || doc.id === 'brochure' ? t(`public.portfolio.doc.${doc.id}.title`) : lang === 'es' && doc.titleEs ? doc.titleEs : doc.title);
  const desc = (doc: PublicDoc) => (doc.id === 'portfolio' || doc.id === 'brochure' ? t(`public.portfolio.doc.${doc.id}.desc`) : lang === 'es' && doc.titleEs ? doc.titleEs : doc.title);

  /** The selected document is the ?doc= parameter, so a link to one of them opens on it. */
  const select = (doc: PublicDoc) => {
    setFallbackId(doc.id);
    setParams({ doc: doc.id }, { replace: true });
    return doc.id;
  };

  const view = (doc: PublicDoc) => {
    select(doc);
    const node = viewerRef.current;
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      node.focus({ preventScroll: true });
    }
    return doc.id;
  };

  const asDoc = (value: unknown): PublicDoc => docIn(docs, value) ?? current;

  useRegisterActions({
    'public.viewDocument': ({ doc }) => view(asDoc(doc)),
    'public.downloadDocument': ({ doc }) => triggerDocDownload(asDoc(doc)),
    'public.openDocumentTab': ({ doc }) => {
      const url = absoluteDocUrl(asDoc(doc).href);
      window.open(url, '_blank', 'noreferrer');
      return url;
    },
  });

  return (
    <PublicLayout>
      <PageHeader code="P-05" title={t('public.portfolio.title')} subtitle={t('public.portfolio.subtitle')} />

      <p className="pub-prose">{t('public.portfolio.intro')}</p>

      <ul className="pub-grid pub-grid--two">
        {docs.map((doc) => {
          const fonts = fontNames(doc.fonts);
          return (
            <li key={doc.id} data-doc={doc.id} data-asset={doc.assetId ?? undefined}>
              <Card title={title(doc)} subtitle={desc(doc)} raised={doc.id === current.id}>
                <p className="pub-def__key">{t('public.portfolio.fileMeta', { pages: doc.pages, size: formatMb(doc.bytes, lang) })}</p>
                {(doc.palette.length > 0 || fonts.length > 0) && (
                  <p className="pub-doc__meta">
                    {doc.palette.length > 0 && (
                      <span className="pub-doc__palette" role="img" aria-label={t('public.portfolio.palette', { colors: doc.palette.join(', ') })}>
                        {doc.palette.map((c) => (
                          <span key={c} className="pub-doc__palette-swatch" style={{ background: c }} title={c} />
                        ))}
                      </span>
                    )}
                    {fonts.length > 0 && <span className="pub-def__key">{t('public.portfolio.fonts', { fonts: fonts.join(', ') })}</span>}
                  </p>
                )}
                <div className="pub-ctas">
                  <Button variant="primary" onClick={() => view(doc)}>
                    {t('public.portfolio.view')}
                  </Button>
                  <Button href={doc.href} download={doc.downloadName} aria-label={t('public.portfolio.downloadAria', { title: title(doc) })}>
                    {t('public.portfolio.download')}
                    </Button>
                  <Button variant="ghost" href={doc.href} external aria-label={t('public.portfolio.newTabAria', { title: title(doc) })}>
                    {t('public.portfolio.newTab')}
                  </Button>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <section className="pub-section" aria-labelledby="pub-portfolio-viewer">
        <h2 id="pub-portfolio-viewer" className="pub-section__title">
          {t('public.portfolio.viewer')}
        </h2>
        <div ref={viewerRef} tabIndex={-1} className="pub-doc__anchor" id="portfolio-viewer">
          <Tabs label={t('public.portfolio.tabsLabel')} value={current.id} onChange={(id) => select(docIn(docs, id) ?? docs[0])} tabs={docs.map((d) => ({ id: d.id, label: title(d) }))}>
            <DocFrame doc={current} title={t('public.portfolio.frameTitle', { title: title(current) })} fallback={t('public.portfolio.noPdf')} download={t('public.portfolio.download')} />
          </Tabs>
        </div>
      </section>

      <Card title={t('public.portfolio.website.title')} raised>
        <p className="pub-prose">{t('public.portfolio.website.body')}</p>
        <div className="pub-ctas">
          <Button variant="secondary" href={WEBSITE_URL} external>
            {t('public.portfolio.website.cta')}
          </Button>
        </div>
      </Card>
    </PublicLayout>
  );
}
