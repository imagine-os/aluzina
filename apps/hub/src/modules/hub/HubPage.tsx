import { useNavigate } from 'react-router-dom';
import { demoUserForRole } from '../../auth/demoUsers';
import { ROLE_META, type RoleId } from '../../auth/roles';
import { useSession } from '../../auth/SessionProvider';
import { HubHeader } from '../../components/organism/HubHeader/HubHeader';
import { SurfaceCard, type SurfaceStatus } from '../../components/molecule/SurfaceCard/SurfaceCard';
import { useT } from '../../i18n/I18nProvider';
import { PORTAL_ROLES, type PrototypePageId, type SurfaceId } from './specs';
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

/** Order of the surface grid. Flip `status` and add `href` when a surface goes live (D-003). */
const SURFACES: SurfaceEntry[] = [
  { id: 'business-os', code: 'BOS-01', key: 'businessOs', status: 'live', href: './business-os/' },
  { id: 'website', code: 'P-00', key: 'website', status: 'live', href: WEBSITE_URL, external: true },
  { id: 'docs', code: 'D-06', key: 'docs', status: 'live', href: `${REPO_URL}/tree/main/docs`, external: true },
  { id: 'manual', code: 'M-xx', key: 'manual', status: 'planned' },
  { id: 'dev', code: 'D-02', key: 'dev', status: 'live', href: '#/dev/components' },
];

interface PortalEntry {
  role: RoleId;
  key: string;
  status: SurfaceStatus;
}

/** One card per role (D-014). `stub` while the portal module is a PageStub; the client portal is planned. */
const PORTALS: PortalEntry[] = [
  ...PORTAL_ROLES.map((role) => ({ role, key: role, status: 'stub' as SurfaceStatus })),
  { role: 'client', key: 'client', status: 'planned' },
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
  const { switchUser } = useSession();
  const navigate = useNavigate();

  const statusLabel = (s: SurfaceStatus) => t(s === 'live' ? 'hub.status.live' : s === 'stub' ? 'hub.status.stub' : 'hub.status.planned');

  /** Action hub.enterAs: become the role's demo user, then open its dashboard. */
  const enterAs = (role: RoleId) => {
    switchUser(role);
    navigate(ROLE_META[role].homePath);
  };

  return (
    <div className="hub-page">
      <HubHeader />
      <main className="hub-main">
        <div className="container">
          <section className="hub-hero">
            <h1 className="hub-hero__title">{t('hub.title')}</h1>
            <p className="hub-hero__subtitle">{t('hub.subtitle')}</p>
          </section>

          <section className="hub-group hub-group--first" aria-labelledby="hub-portals">
            <h2 id="hub-portals" className="hub-group__title">
              {t('hub.section.portals')}
            </h2>
            <p className="hub-group__desc">{t('hub.section.portalsDesc')}</p>
            <ul className="hub-grid">
              {PORTALS.map((p) => {
                const meta = ROLE_META[p.role];
                const user = demoUserForRole(p.role);
                return (
                  <li key={p.role} data-portal={p.role}>
                    <SurfaceCard
                      code={meta.homeCode}
                      title={t(`hub.portals.${p.key}.title`)}
                      description={t(`hub.portals.${p.key}.desc`)}
                      status={p.status}
                      statusLabel={statusLabel(p.status)}
                      onActivate={p.status === 'planned' ? undefined : () => enterAs(p.role)}
                      ctaLabel={p.status === 'planned' || !user ? undefined : t('hub.cta.enterAs', { name: user.name })}
                      image={p.status === 'planned' ? undefined : thumb(meta.homeCode)}
                    />
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="hub-group" aria-labelledby="hub-surfaces">
            <h2 id="hub-surfaces" className="hub-group__title">
              {t('hub.section.surfaces')}
            </h2>
            <ul className="hub-grid">
              {SURFACES.map((s) => (
                <li key={s.id} data-surface={s.id}>
                  <SurfaceCard
                    code={s.code}
                    title={t(`hub.cards.${s.key}.title`)}
                    description={t(`hub.cards.${s.key}.desc`)}
                    status={s.status}
                    statusLabel={statusLabel(s.status)}
                    href={s.href}
                    external={s.external}
                    ctaLabel={s.status === 'live' ? t(s.id === 'website' ? 'hub.cta.visit' : 'hub.cta.open') : undefined}
                    image={s.status === 'live' ? thumb(s.code) : undefined}
                  />
                </li>
              ))}
            </ul>
          </section>

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
