import { HubHeader } from '../../components/organism/HubHeader/HubHeader';
import { SurfaceCard, type SurfaceStatus } from '../../components/molecule/SurfaceCard/SurfaceCard';
import { useT } from '../../i18n/I18nProvider';
import type { PrototypePageId, SurfaceId } from './specs';
import './HubPage.css';

export const REPO_URL = 'https://github.com/imagine-os/aluzina';
export const WEBSITE_URL = 'https://aluzinaa.com';

/** Deploy-time thumbnails (scripts/thumbnails.mjs, D-011); the build id busts the Pages cache on every deploy. */
const thumb = (code: string) => `./thumbs/${code}.jpg?v=${__BUILD_ID__}`;

interface SurfaceEntry {
  id: SurfaceId;
  code: string;
  key: string;
  status: SurfaceStatus;
  href?: string;
  external?: boolean;
}

/** Order of the card grid. Flip `status` and add `href` when a surface goes live (D-003). */
const SURFACES: SurfaceEntry[] = [
  { id: 'business-os', code: 'BOS-01', key: 'businessOs', status: 'live', href: './business-os/' },
  { id: 'website', code: 'P-00', key: 'website', status: 'live', href: WEBSITE_URL, external: true },
  { id: 'customer', code: 'C-xx', key: 'customer', status: 'planned' },
  { id: 'staff', code: 'A-xx', key: 'staff', status: 'planned' },
  { id: 'docs', code: 'D-06', key: 'docs', status: 'live', href: `${REPO_URL}/tree/main/docs`, external: true },
  { id: 'manual', code: 'M-xx', key: 'manual', status: 'planned' },
  { id: 'dev', code: 'D-xx', key: 'dev', status: 'planned' },
];

interface PrototypePage {
  id: PrototypePageId;
  code: string;
  key: string;
  href: string;
}

/** The other pages of the Claude Design export (URL-safe entry points, D-010). Canvas.dc.html is empty and not listed. */
const PROTOTYPE_PAGES: PrototypePage[] = [
  { id: 'home', code: 'BOS-02', key: 'home', href: './business-os/home.html' },
  { id: 'cyber-bridge', code: 'BOS-03', key: 'cyberBridge', href: './business-os/cyber-bridge.html' },
  { id: 'cyber-bridge-deck', code: 'BOS-04', key: 'cyberBridgeDeck', href: './business-os/cyber-bridge-deck.html' },
  { id: 'image-generation-plan', code: 'BOS-05', key: 'imageGenerationPlan', href: './business-os/image-generation-plan.html' },
  { id: 'lod-ladder', code: 'BOS-06', key: 'lodLadder', href: './business-os/lod-ladder.html' },
];

export function HubPage() {
  const { t } = useT();

  return (
    <div className="hub-page">
      <HubHeader />
      <main className="hub-main">
        <div className="container">
          <section className="hub-hero">
            <h1 className="hub-hero__title">{t('hub.title')}</h1>
            <p className="hub-hero__subtitle">{t('hub.subtitle')}</p>
          </section>
          <h2 className="visually-hidden">{t('hub.section.surfaces')}</h2>
          <ul className="hub-grid">
            {SURFACES.map((s) => (
              <li key={s.id} data-surface={s.id}>
                <SurfaceCard
                  code={s.code}
                  title={t(`hub.cards.${s.key}.title`)}
                  description={t(`hub.cards.${s.key}.desc`)}
                  status={s.status}
                  statusLabel={t(s.status === 'live' ? 'hub.status.live' : 'hub.status.planned')}
                  href={s.href}
                  external={s.external}
                  ctaLabel={s.status === 'live' ? t(s.id === 'website' ? 'hub.cta.visit' : 'hub.cta.open') : undefined}
                  image={s.status === 'live' ? thumb(s.code) : undefined}
                />
              </li>
            ))}
          </ul>
          <section className="hub-group" aria-labelledby="hub-prototype-pages">
            <h2 id="hub-prototype-pages" className="hub-group__title">
              {t('hub.section.prototypePages')}
            </h2>
            <p className="hub-group__desc">{t('hub.section.prototypePagesDesc')}</p>
            <ul className="hub-grid hub-grid--compact">
              {PROTOTYPE_PAGES.map((p) => (
                <li key={p.id} data-prototype-page={p.id}>
                  <SurfaceCard
                    code={p.code}
                    title={t(`hub.proto.${p.key}.title`)}
                    description={t(`hub.proto.${p.key}.desc`)}
                    status="live"
                    statusLabel={t('hub.status.live')}
                    href={p.href}
                    ctaLabel={t('hub.cta.open')}
                    image={thumb(p.code)}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <footer className="hub-footer">
        <div className="container hub-footer__inner">
          <span>{t('hub.footer.version', { version: __APP_VERSION__ })}</span>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            {t('hub.footer.repo')}
          </a>
          <span>{t('hub.footer.devHint')}</span>
        </div>
      </footer>
    </div>
  );
}
