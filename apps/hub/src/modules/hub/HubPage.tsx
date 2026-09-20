import { HubHeader } from '../../components/organism/HubHeader/HubHeader';
import { SurfaceCard, type SurfaceStatus } from '../../components/molecule/SurfaceCard/SurfaceCard';
import { useT } from '../../i18n/I18nProvider';
import type { SurfaceId } from './specs';
import './HubPage.css';

export const REPO_URL = 'https://github.com/imagine-os/aluzina';
export const WEBSITE_URL = 'https://aluzinaa.com';

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
  { id: 'business-os', code: 'BOS', key: 'businessOs', status: 'planned' },
  { id: 'website', code: 'P-00', key: 'website', status: 'live', href: WEBSITE_URL, external: true },
  { id: 'customer', code: 'C-xx', key: 'customer', status: 'planned' },
  { id: 'staff', code: 'A-xx', key: 'staff', status: 'planned' },
  { id: 'docs', code: 'D-06', key: 'docs', status: 'live', href: `${REPO_URL}/tree/main/docs`, external: true },
  { id: 'manual', code: 'M-xx', key: 'manual', status: 'planned' },
  { id: 'dev', code: 'D-xx', key: 'dev', status: 'planned' },
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
                />
              </li>
            ))}
          </ul>
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
