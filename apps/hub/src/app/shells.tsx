import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ROLE_META, isRoleId } from '../auth/roles';
import { useSession } from '../auth/SessionProvider';
import { Avatar } from '../components/atom/Avatar/Avatar';
import { Badge } from '../components/atom/Badge/Badge';
import { Button } from '../components/atom/Button/Button';
import { ToggleButton } from '../components/atom/ToggleButton/ToggleButton';
import { PresenceBar } from '../components/molecule/PresenceBar/PresenceBar';
import { Drawer } from '../components/organism/Drawer/Drawer';
import { RoleSwitcher } from '../components/organism/RoleSwitcher/RoleSwitcher';
import { useTheme } from '../design/ThemeProvider';
import { useT } from '../i18n/I18nProvider';
import { usePresence } from '../presence/PresenceProvider';
import type { RouteDef } from '../specs/PageSpec';
import { navGroupOrder } from './navGroups';
import { navRoutesFor } from './registry';
import { useRoutes } from './RoutesContext';
import './shells.css';

/** Picks the shell a route asked for. Modules never edit this file (src/modules/README.md). */
export function Shell({ route, children }: { route: RouteDef; children: ReactNode }) {
  if (route.shell === 'desktop') return <DesktopShell route={route}>{children}</DesktopShell>;
  if (route.shell === 'phone') return <PhoneShell route={route}>{children}</PhoneShell>;
  return <>{children}</>;
}

/** Language, theme and dev-mode toggles (actions hub.setLang / hub.toggleTheme / hub.toggleDevMode). */
export function GlobalControls({ compact }: { compact?: boolean }) {
  const { t, lang, setLang } = useT();
  const { theme, toggleTheme } = useTheme();
  const { devMode, toggleDevMode } = useSession();
  const otherLang = lang === 'en' ? 'es' : 'en';
  return (
    <nav className="shell-controls" aria-label={t('core.shell.controls')}>
      <ToggleButton label={t(otherLang === 'es' ? 'core.shell.lang.toEs' : 'core.shell.lang.toEn')} onClick={() => setLang(otherLang)}>
        {otherLang.toUpperCase()}
      </ToggleButton>
      <ToggleButton label={t(theme === 'dark' ? 'core.shell.theme.toLight' : 'core.shell.theme.toDark')} pressed={theme === 'dark'} onClick={toggleTheme}>
        {compact ? (theme === 'dark' ? '☾' : '☼') : theme === 'dark' ? t('core.shell.theme.dark') : t('core.shell.theme.light')}
      </ToggleButton>
      <ToggleButton label={t('core.shell.dev.label')} pressed={devMode} onClick={toggleDevMode}>
        {compact ? 'DEV' : devMode ? t('core.shell.dev.on') : t('core.shell.dev.off')}
      </ToggleButton>
    </nav>
  );
}

function groupRoutes(navRoutes: RouteDef[]): { group: string | undefined; routes: RouteDef[] }[] {
  const groups = new Map<string | undefined, RouteDef[]>();
  for (const r of navRoutes) {
    const g = r.spec.navGroup;
    groups.set(g, [...(groups.get(g) ?? []), r]);
  }
  return [...groups.entries()].map(([group, routes]) => ({ group, routes })).sort((a, b) => navGroupOrder(a.group) - navGroupOrder(b.group));
}

function NavList({ routes, onNavigate }: { routes: RouteDef[]; onNavigate?: () => void }) {
  const { t } = useT();
  const { devMode } = useSession();
  return (
    <>
      {groupRoutes(routes).map(({ group, routes: rs }) => (
        <div key={group ?? 'ungrouped'} className="shell-nav__group">
          {group && <h2 className="shell-nav__group-title">{t(`core.nav.${group}`)}</h2>}
          <ul className="shell-nav__list">
            {rs.map((r) => (
              <li key={r.path}>
                <NavLink to={r.path} end className={({ isActive }) => `shell-nav__link${isActive ? ' shell-nav__link--active' : ''}`} onClick={onNavigate}>
                  {r.nav?.glyph && <span className="shell-nav__glyph" aria-hidden="true">{r.nav.glyph}</span>}
                  <span className="shell-nav__label">{t(r.nav!.labelKey)}</span>
                  {devMode && r.status === 'stub' && <Badge tone="warning">{t('core.shell.stub')}</Badge>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function UserMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const { user, role, viewingAs } = useSession();
  const navigate = useNavigate();
  return (
    <Drawer open={open} onClose={onClose} title={t('core.shell.userMenu')} footer={<Button variant="ghost" onClick={() => { onClose(); navigate('/'); }}>{t('core.shell.backToHub')}</Button>}>
      <div className="shell-user">
        <Avatar name={user.name} initials={user.initials} size="lg" />
        <div>
          <div className="shell-user__name">{user.name}</div>
          <div className="shell-user__role">{t(isRoleId(role) ? ROLE_META[role].labelKey : 'core.role.unknown')}</div>
          {viewingAs && <Badge tone="warning">{t('core.session.viewAs', { role: viewingAs })}</Badge>}
        </div>
      </div>
      <RoleSwitcher onSwitched={(r) => { onClose(); if (isRoleId(r)) navigate(ROLE_META[r].homePath); }} />
    </Drawer>
  );
}

/**
 * Sidebar (routes of the current surface grouped by navGroup) + top bar (portal, role badge, controls,
 * back to hub, user menu). Under 768 px: hamburger drawer and a bottom nav. Everything is a link or a
 * button >= 44 px; the `--scale` bands keep it legible up to 3840 (P-01, P-03).
 */
export function DesktopShell({ route, children }: { route: RouteDef; children: ReactNode }) {
  const { t } = useT();
  const { user, role } = useSession();
  const routes = useRoutes();
  const [navOpen, setNavOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navRoutes = navRoutesFor(route.surface, routes);
  const portalKey = isRoleId(role) && ROLE_META[role].surface === route.surface ? ROLE_META[role].portalKey : `core.portal.${route.surface}`;
  const bottom = navRoutes.slice(0, 4);
  const { people } = usePresence();

  return (
    <div className="dshell" data-surface={route.surface}>
      <a className="shell-skip" href="#main">
        {t('core.shell.skip')}
      </a>
      <header className="dshell__top">
        <Button className="dshell__menu-btn" variant="ghost" icon="☰" aria-label={t('core.shell.openMenu')} aria-expanded={navOpen} onClick={() => setNavOpen(true)} />
        <Link className="dshell__brand" to="/">
          <span className="dshell__mark" aria-hidden="true" />
          <span className="dshell__brand-name">Aluzina</span>
        </Link>
        <span className="dshell__portal">{t(portalKey)}</span>
        <Badge tone="accent" className="dshell__role">{t(isRoleId(role) ? ROLE_META[role].labelKey : 'core.role.unknown')}</Badge>
        <div className="dshell__spacer" />
        {people.length > 1 && <PresenceBar compact people={people} />}
        <GlobalControls compact />
        <Button className="dshell__hub-btn" variant="ghost" href="#/">
          {t('core.shell.backToHub')}
        </Button>
        <button type="button" className="dshell__user" aria-label={t('core.shell.openUserMenu', { name: user.name })} aria-haspopup="dialog" onClick={() => setUserOpen(true)}>
          <Avatar name={user.name} initials={user.initials} />
        </button>
      </header>
      <div className="dshell__body">
        <nav className="dshell__side shell-nav" aria-label={t('core.shell.nav')}>
          <NavList routes={navRoutes} />
        </nav>
        <main id="main" className="dshell__main" tabIndex={-1}>
          <div className="dshell__content">{children}</div>
        </main>
      </div>
      {bottom.length > 0 && (
        <nav className="dshell__bottom" aria-label={t('core.shell.nav')}>
          {bottom.map((r) => (
            <NavLink key={r.path} to={r.path} end className={({ isActive }) => `dshell__bottom-link${isActive ? ' dshell__bottom-link--active' : ''}`}>
              <span aria-hidden="true">{r.nav?.glyph ?? '•'}</span>
              <span>{t(r.nav!.labelKey)}</span>
            </NavLink>
          ))}
          <button type="button" className="dshell__bottom-link" onClick={() => setNavOpen(true)}>
            <span aria-hidden="true">…</span>
            <span>{t('core.shell.more')}</span>
          </button>
        </nav>
      )}
      <Drawer open={navOpen} onClose={() => setNavOpen(false)} title={t('core.shell.menu')} side="left">
        <div className="shell-nav">
          <NavList routes={navRoutes} onNavigate={() => setNavOpen(false)} />
        </div>
      </Drawer>
      <UserMenu open={userOpen} onClose={() => setUserOpen(false)} />
    </div>
  );
}

/** Phone-first frame (390 design) for the client app later: compact header, content, bottom nav from the surface routes. */
export function PhoneShell({ route, children }: { route: RouteDef; children: ReactNode }) {
  const { t } = useT();
  const routes = useRoutes();
  const navRoutes = navRoutesFor(route.surface, routes).slice(0, 5);
  return (
    <div className="pshell" data-surface={route.surface}>
      <a className="shell-skip" href="#main">
        {t('core.shell.skip')}
      </a>
      <header className="pshell__top">
        <Link className="dshell__brand" to="/">
          <span className="dshell__mark" aria-hidden="true" />
          <span className="dshell__brand-name">Aluzina</span>
        </Link>
        <GlobalControls compact />
      </header>
      <main id="main" className="pshell__main" tabIndex={-1}>
        {children}
      </main>
      {navRoutes.length > 0 && (
        <nav className="dshell__bottom pshell__bottom" aria-label={t('core.shell.nav')}>
          {navRoutes.map((r) => (
            <NavLink key={r.path} to={r.path} end className={({ isActive }) => `dshell__bottom-link${isActive ? ' dshell__bottom-link--active' : ''}`}>
              <span aria-hidden="true">{r.nav?.glyph ?? '•'}</span>
              <span>{t(r.nav!.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
