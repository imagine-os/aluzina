import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { GlobalControls } from '../../app/shells';
import { useRoutes } from '../../app/RoutesContext';
import { useRegisterActions } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { useT } from '../../i18n/I18nProvider';
import './public.css';

/** The owner's Lovable site stays the studio home and the portfolio (P-00, D-031 / D-035). */
export const WEBSITE_URL = 'https://aluzinaa.com';

/**
 * Header and footer of every public page (P-01..P-04). The `public` surface uses the `bare` shell, so the
 * module draws its own chrome: wordmark, tagline, the section nav read from the route manifest, the global
 * EN / ES + theme + dev controls, a way back to the staff hub, and a footer that links the studio site.
 * Instagram and WhatsApp are `Placeholder`s: the studio has not given handles yet (P-09).
 */
export function PublicLayout({ children }: { children: ReactNode }) {
  const { t } = useT();
  const navigate = useNavigate();
  const routes = useRoutes();
  const navRoutes = routes.filter((r) => r.surface === 'public' && r.nav).sort((a, b) => (a.nav?.order ?? 100) - (b.nav?.order ?? 100));

  useRegisterActions({
    'public.openWebsite': () => {
      window.open(WEBSITE_URL, '_blank', 'noreferrer');
      return WEBSITE_URL;
    },
    'public.openHub': () => {
      navigate('/');
      return 'hub';
    },
  });

  return (
    <div className="pub">
      <a className="shell-skip" href="#main">
        {t('public.skip')}
      </a>
      <header className="pub-head">
        <div className="container pub-head__inner">
          <NavLink className="pub-head__brand" to="/services" aria-label={t('public.home')}>
            <span className="pub-head__mark" aria-hidden="true" />
            <span className="pub-head__brand-text">
              <span className="pub-head__wordmark">{t('public.brand')}</span>
              <span className="pub-head__tagline">{t('public.tagline')}</span>
            </span>
          </NavLink>
          <nav className="pub-head__nav" aria-label={t('public.nav.label')}>
            <ul className="pub-head__list">
              {navRoutes.map((r) => (
                <li key={r.path}>
                  <NavLink to={r.path} end className={({ isActive }) => `pub-head__link${isActive ? ' pub-head__link--active' : ''}`}>
                    {t(r.nav!.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="pub-head__controls">
            <GlobalControls compact />
            <Button variant="ghost" href="#/" className="pub-head__staff">
              {t('public.staffHub')}
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="pub-main" tabIndex={-1}>
        <div className="container pub-main__inner">{children}</div>
      </main>

      <footer className="pub-foot">
        <div className="container pub-foot__inner">
          <p className="pub-foot__studio">{t('public.footer.studio')}</p>
          <nav className="pub-foot__links" aria-label={t('public.footer.label')}>
            <Button variant="ghost" href={WEBSITE_URL} external aria-label={t('public.footer.websiteAria')}>
              {t('public.footer.website')}
            </Button>
            <Placeholder what={t('public.footer.instagramWhat')}>
              <Button variant="ghost">{t('public.footer.instagram')}</Button>
            </Placeholder>
            <Placeholder what={t('public.footer.whatsappWhat')}>
              <Button variant="ghost">{t('public.footer.whatsapp')}</Button>
            </Placeholder>
          </nav>
          <p className="pub-foot__hint">{t('public.footer.contactHint')}</p>
        </div>
      </footer>
    </div>
  );
}
