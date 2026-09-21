import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { useRoutes } from '../../app/RoutesContext';
import { DEMO_USERS } from '../../auth/demoUsers';
import { ROLES, type RoleId } from '../../auth/roles';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { ToggleButton } from '../../components/atom/ToggleButton/ToggleButton';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { useTheme } from '../../design/ThemeProvider';
import { useT } from '../../i18n/I18nProvider';
import type { Lang } from '../../i18n/types';
import { SURFACES, type RouteDef } from '../../specs/PageSpec';
import { simulatorSpec } from './specs';
import './tools.css';

type Device = 'phone' | 'desktop';
const SIZES: Record<Device, { w: number; h: number }> = { phone: { w: 390, h: 844 }, desktop: { w: 1280, h: 800 } };

interface Preset {
  id: string;
  path: string;
  role: RoleId;
}

/** The four journeys worth showing cold; a preset whose route is not registered yet becomes a Placeholder. */
const PRESETS: Preset[] = [
  { id: 'clientJourney', path: '/client', role: 'client' },
  { id: 'founderDashboard', path: '/founder', role: 'founder' },
  { id: 'opsSchedule', path: '/ops/schedule', role: 'ops' },
  { id: 'publicServices', path: '/services', role: 'client' },
];

export function SimulatorPage() {
  const { t, lang, setLang } = useT();
  const { theme, setTheme } = useTheme();
  const routes = useRoutes();

  const menuRoutes = useMemo(
    () =>
      [...routes]
        // The simulator itself is left out so a frame cannot nest the simulator in the simulator.
        .filter((r) => (r.nav !== undefined || r.surface === 'public' || r.path === '/') && r.code !== simulatorSpec.code)
        .sort((a, b) => SURFACES.indexOf(a.surface) - SURFACES.indexOf(b.surface) || a.code.localeCompare(b.code)),
    [routes],
  );

  const first = menuRoutes[0]?.path ?? '/';
  const [phonePath, setPhonePath] = useState(first);
  const [desktopPath, setDesktopPath] = useState(first);
  const [role, setRole] = useState<RoleId>('founder');
  const [sync, setSync] = useState(true);
  /** Bumped to remount both iframes, which is how a language / theme change reaches them. */
  const [reload, setReload] = useState(0);

  const setRoute = useCallback(
    (path: string) => {
      setPhonePath(path);
      if (sync) setDesktopPath(path);
    },
    [sync],
  );

  const src = (path: string) => `./index.html?as=${role}#${path}`;
  const label = (r: RouteDef) => `${r.code} · ${r.spec.name} (#${r.path})`;

  useRegisterActions({
    'tools.simulateRoute': ({ route }) => {
      const wanted = String(route ?? '');
      const found = menuRoutes.find((r) => r.path === wanted || r.code.toUpperCase() === wanted.toUpperCase());
      if (!found) return `no simulated route "${wanted}"`;
      setRoute(found.path);
      return `simulating #${found.path}`;
    },
    'tools.simulateRole': ({ role: r }) => {
      const wanted = ROLES.find((x) => x === String(r));
      if (!wanted) return `unknown role "${String(r)}"`;
      setRole(wanted);
      return `simulating as ${wanted}`;
    },
    'tools.simulateLang': ({ lang: l }) => {
      const wanted = String(l) === 'es' ? 'es' : String(l) === 'en' ? 'en' : null;
      if (!wanted) return `unknown language "${String(l)}"`;
      applyLang(wanted);
      return `frames reloaded in ${wanted}`;
    },
    'tools.simulateTheme': ({ theme: th }) => {
      const wanted = String(th) === 'dark' ? 'dark' : String(th) === 'light' ? 'light' : null;
      if (!wanted) return `unknown theme "${String(th)}"`;
      applyTheme(wanted);
      return `frames reloaded in the ${wanted} theme`;
    },
    'tools.openSimulatedTab': ({ frame }) => {
      const device: Device = String(frame) === 'desktop' ? 'desktop' : 'phone';
      const path = device === 'phone' ? phonePath : desktopPath;
      window.open(src(path), '_blank', 'noopener');
      return `opened #${path} as ${role} in a new tab`;
    },
    'tools.toggleFrameSync': ({ on }) => {
      const next = on === undefined ? !sync : !['false', '0', 'off', ''].includes(String(on));
      setSync(next);
      if (next) setDesktopPath(phonePath);
      return next ? 'frames synced' : 'frames independent';
    },
    'tools.applyDemoPreset': ({ preset }) => {
      const found = PRESETS.find((p) => p.id === String(preset));
      if (!found) return `unknown preset "${String(preset)}"`;
      if (!routes.some((r) => r.path === found.path)) return `the route #${found.path} is not registered yet`;
      applyPreset(found);
      return `${found.id}: #${found.path} as ${found.role}`;
    },
  });

  /** Language and theme go through the app's providers (they own aluzina.lang / aluzina.theme); the frames
   * are same-origin, so they pick the new value up on the remount — and so does this tab. */
  function applyLang(next: Lang) {
    setLang(next);
    setReload((n) => n + 1);
  }

  function applyTheme(next: 'light' | 'dark') {
    setTheme(next);
    setReload((n) => n + 1);
  }

  function applyPreset(p: Preset) {
    setRole(p.role);
    setPhonePath(p.path);
    setDesktopPath(p.path);
    setSync(true);
  }

  if (menuRoutes.length === 0) {
    return (
      <>
        <PageHeader code={simulatorSpec.code} title={t('tools.sim.title')} subtitle={t('tools.sim.subtitle')} />
        <EmptyState title={t('tools.sim.noRoutes')} glyph="▢" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        code={simulatorSpec.code}
        title={t('tools.sim.title')}
        subtitle={t('tools.sim.subtitle')}
        breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('tools.sim.title') }]}
      />

      <div className="tools-sim__controls">
        <Select
          label={t('tools.sim.route')}
          value={phonePath}
          onChange={(e) => setRoute(e.target.value)}
          options={menuRoutes.map((r) => ({ value: r.path, label: label(r) }))}
        />
        <Select label={t('tools.sim.role')} value={role} onChange={(e) => setRole(e.target.value as RoleId)} options={DEMO_USERS.map((u) => ({ value: u.role, label: `${u.name} · ${t(u.titleKey)}` }))} />
        <Select label={t('tools.sim.lang')} value={lang} onChange={(e) => applyLang(e.target.value as Lang)} options={[{ value: 'en', label: t('tools.sim.lang.en') }, { value: 'es', label: t('tools.sim.lang.es') }]} />
        <Select label={t('tools.sim.theme')} value={theme} onChange={(e) => applyTheme(e.target.value as 'light' | 'dark')} options={[{ value: 'light', label: t('tools.sim.theme.light') }, { value: 'dark', label: t('tools.sim.theme.dark') }]} />
        <div className="tools-sim__sync">
          <ToggleButton
            label={t('tools.sim.sync')}
            pressed={sync}
            onClick={() => {
              const next = !sync;
              setSync(next);
              if (next) setDesktopPath(phonePath);
            }}
          >
            {sync ? t('tools.sim.syncOn') : t('tools.sim.syncOff')}
          </ToggleButton>
          <p className="tools-muted">{t('tools.sim.syncHint')}</p>
        </div>
      </div>

      <div className="tools-sim__presets">
        <h3 className="tools-h4">{t('tools.sim.presets')}</h3>
        <ul className="tools-sim__preset-list">
          {PRESETS.map((p) => {
            const name = t(`tools.sim.preset.${p.id}`);
            const live = routes.some((r) => r.path === p.path);
            return (
              <li key={p.id}>
                {live ? (
                  <Button size="sm" onClick={() => applyPreset(p)}>
                    {name}
                  </Button>
                ) : (
                  <Placeholder what={t('tools.sim.presetMissing', { name })}>
                    <Button size="sm">{name}</Button>
                  </Placeholder>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="tools-note">{t('tools.sim.storageNote')}</p>

      <div className="tools-sim__frames" role="group" aria-label={t('tools.sim.frames')}>
        <Frame device="phone" path={phonePath} role={role} src={src(phonePath)} reload={reload} />
        <Frame device="desktop" path={desktopPath} role={role} src={src(desktopPath)} reload={reload} />
      </div>
    </>
  );
}

/** One device frame: the app in an iframe at its real CSS size, scaled down to the column it sits in. */
function Frame({ device, path, role, src, reload }: { device: Device; path: string; role: RoleId; src: string; reload: number }) {
  const { t } = useT();
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { w, h } = SIZES[device];

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => setScale(Math.min(1, box.clientWidth / w));
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [w]);

  const deviceName = t(`tools.sim.${device}`);
  const title = t('tools.sim.frameTitle', { device: deviceName, route: `#${path}`, role });

  return (
    <section className="tools-frame" aria-labelledby={`frame-${device}`}>
      <header className="tools-frame__head">
        <h3 id={`frame-${device}`} className="tools-frame__title">
          {deviceName}
        </h3>
        <span className="tools-muted">{t('tools.sim.size', { w, h, pct: Math.round(scale * 100) })}</span>
        <Button size="sm" variant="ghost" href={src} external aria-label={t('tools.sim.openTabLabel', { device: deviceName })}>
          {t('tools.sim.openTab')}
        </Button>
      </header>
      <div className="tools-frame__box" ref={boxRef} style={{ height: `${Math.round(h * scale)}px` }}>
        <div className="tools-frame__scaler" style={{ width: `${w}px`, height: `${h}px`, transform: `scale(${scale})` }}>
          <iframe key={`${device}-${reload}`} className={`tools-frame__iframe tools-frame__iframe--${device}`} title={title} src={src} width={w} height={h} loading="lazy" />
        </div>
      </div>
    </section>
  );
}
