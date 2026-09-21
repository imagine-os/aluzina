import { useNavigate } from 'react-router-dom';
import { useRoutes } from '../../app/RoutesContext';
import { demoUserForRole } from '../../auth/demoUsers';
import { ROLE_META, isRoleId, type RoleId } from '../../auth/roles';
import { useSession } from '../../auth/SessionProvider';
import { BrandMark } from '../../components/atom/BrandMark/BrandMark';
import { Shimmer } from '../../components/atom/Shimmer/Shimmer';
import { HubHeader } from '../../components/organism/HubHeader/HubHeader';
import { SurfaceCard, type SurfaceStatus } from '../../components/molecule/SurfaceCard/SurfaceCard';
import { useT } from '../../i18n/I18nProvider';
import { PORTAL_ROLES, type PrototypePageId, type SurfaceId } from './specs';
import './HubPage.css';

export const REPO_URL = 'https://github.com/imagine-os/aluzina';
export const WEBSITE_URL = 'https://aluzinaa.com';

/** Deploy-time thumbnails (scripts/thumbnails.mjs, D-011); the build id busts the Pages cache on every deploy. */
const thumb = (code: string) => `./thumbs/${code}.jpg?v=${__BUILD_ID__}`;

/**
 * A card on the Product surfaces or Builder and dev tools grids (pass 0013). `route`: live when a built route
 * with `code` is registered (its path is the href), stub when the route is a stub, planned otherwise, exactly
 * like portal cards; `fallbackHref` keeps a planned surface reachable outside the app (docs on GitHub).
 * `static`: always live at `href`. `external`: a site outside the OS.
 */
interface SurfaceEntry {
  id: SurfaceId;
  code: string;
  key: string;
  kind: 'route' | 'static' | 'external';
  href?: string;
  fallbackHref?: string;
  /** Route-derived cards that need a session switch first (the client app opens as the demo client). */
  enterAs?: RoleId;
}

/** Product surfaces: what clients and the team use. */
const PRODUCT_SURFACES: SurfaceEntry[] = [
  { id: 'website', code: 'P-00', key: 'website', kind: 'external', href: WEBSITE_URL },
  { id: 'services', code: 'P-01', key: 'services', kind: 'route' },
  { id: 'client', code: 'C-01', key: 'client', kind: 'route', enterAs: 'client' },
  { id: 'manual', code: 'M-01', key: 'manual', kind: 'route' },
  { id: 'docs', code: 'D-06', key: 'docs', kind: 'route', fallbackHref: `${REPO_URL}/tree/main/docs` },
  { id: 'spaces', code: 'K-01', key: 'spaces', kind: 'static', href: '#/founder/spaces' },
  { id: 'business-os', code: 'BOS-01', key: 'businessOs', kind: 'static', href: './business-os/' },
];

/** Builder and dev tools: how the system is built and checked (D-xx). */
const TOOL_SURFACES: SurfaceEntry[] = [
  { id: 'design', code: 'D-12', key: 'design', kind: 'route' },
  { id: 'plan', code: 'D-05', key: 'plan', kind: 'route' },
  { id: 'canvas', code: 'D-07', key: 'canvas', kind: 'route' },
  { id: 'simulator', code: 'D-08', key: 'simulator', kind: 'route' },
  { id: 'actions', code: 'D-09', key: 'actions', kind: 'route' },
  { id: 'tokens', code: 'D-10', key: 'tokens', kind: 'route' },
  { id: 'testing', code: 'D-11', key: 'testing', kind: 'route' },
  { id: 'components', code: 'D-02', key: 'components', kind: 'route' },
  { id: 'specs', code: 'D-03', key: 'specs', kind: 'route' },
  { id: 'multiuser', code: 'D-04', key: 'multiuser', kind: 'route' },
];

interface PortalEntry {
  role: RoleId;
  key: string;
}

/** One card per role (D-014). Status comes from the route manifest at render time (see portalStatus); the client portal has no route yet. */
const PORTALS: PortalEntry[] = [...PORTAL_ROLES.map((role) => ({ role, key: role })), { role: 'client', key: 'client' }];

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
  const { switchUser, role } = useSession();
  const navigate = useNavigate();
  const routes = useRoutes();

  /** Live / stub / planned from the registered dashboard route, so the card can never disagree with the manifest. */
  const portalStatus = (role: RoleId): SurfaceStatus => {
    const home = routes.find((r) => r.path === ROLE_META[role].homePath);
    return home ? (home.status === 'built' ? 'live' : 'stub') : 'planned';
  };

  /** Spaces (K-01) mounts on every portal and on dev; open it on the current role's surface, founder when the role has none (client). */
  const spacesHref = (() => {
    const surface = isRoleId(role) ? ROLE_META[role].surface : 'founder';
    return routes.some((r) => r.path === `/${surface}/spaces`) ? `#/${surface}/spaces` : '#/founder/spaces';
  })();

  interface ResolvedSurface {
    status: SurfaceStatus;
    href?: string;
    external?: boolean;
    onActivate?: () => void;
  }

  /** Card state from the manifest (route-derived by page code) or from the static entry; never hard-coded per card. */
  const resolve = (s: SurfaceEntry): ResolvedSurface => {
    if (s.kind === 'external') return { status: 'live', href: s.href, external: true };
    if (s.kind === 'static') return { status: 'live', href: s.id === 'spaces' ? spacesHref : s.href };
    const route = routes.find((r) => r.code === s.code);
    if (!route) return s.fallbackHref ? { status: 'live', href: s.fallbackHref, external: true } : { status: 'planned' };
    const status: SurfaceStatus = route.status === 'built' ? 'live' : 'stub';
    if (s.enterAs) {
      const as = s.enterAs;
      return { status, onActivate: () => { switchUser(as); navigate(route.path); } };
    }
    return { status, href: `#${route.path}` };
  };

  const surfaceCard = (s: SurfaceEntry) => {
    const r = resolve(s);
    const cta = r.status === 'planned' ? undefined : t(r.external && s.kind === 'external' ? 'hub.cta.visit' : 'hub.cta.open');
    return (
      <li key={s.id} data-surface={s.id} data-surface-status={r.status}>
        <SurfaceCard
          code={s.code}
          title={t(`hub.cards.${s.key}.title`)}
          description={t(`hub.cards.${s.key}.desc`)}
          status={r.status}
          statusLabel={statusLabel(r.status)}
          href={r.href}
          external={r.external}
          onActivate={r.onActivate}
          ctaLabel={cta}
          image={r.status === 'live' ? thumb(s.code) : undefined}
        />
      </li>
    );
  };

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
            <Shimmer finish="metal" intensity={0.35} className="hub-hero__band">
              <div className="hub-hero__band-inner">
                <BrandMark kind="wordmark" finish="iridescent" size="xl" />
              </div>
            </Shimmer>
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
                const status = portalStatus(p.role);
                return (
                  <li key={p.role} data-portal={p.role}>
                    <SurfaceCard
                      code={meta.homeCode}
                      title={t(`hub.portals.${p.key}.title`)}
                      description={t(`hub.portals.${p.key}.desc`)}
                      status={status}
                      statusLabel={statusLabel(status)}
                      onActivate={status === 'planned' ? undefined : () => enterAs(p.role)}
                      ctaLabel={status === 'planned' || !user ? undefined : t('hub.cta.enterAs', { name: user.name })}
                      image={status === 'planned' ? undefined : thumb(meta.homeCode)}
                    />
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="hub-group" aria-labelledby="hub-surfaces">
            <h2 id="hub-surfaces" className="hub-group__title">
              {t('hub.section.product')}
            </h2>
            <p className="hub-group__desc">{t('hub.section.productDesc')}</p>
            <ul className="hub-grid">{PRODUCT_SURFACES.map(surfaceCard)}</ul>
          </section>

          <section className="hub-group" aria-labelledby="hub-tools">
            <h2 id="hub-tools" className="hub-group__title">
              {t('hub.section.tools')}
            </h2>
            <p className="hub-group__desc">{t('hub.section.toolsDesc')}</p>
            <ul className="hub-grid">{TOOL_SURFACES.map(surfaceCard)}</ul>
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
