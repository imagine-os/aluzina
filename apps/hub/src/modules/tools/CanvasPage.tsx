import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useRoutes } from '../../app/RoutesContext';
import { demoUserForRole } from '../../auth/demoUsers';
import { roleForSurface } from '../../auth/roles';
import { useSession } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { SurfaceCard } from '../../components/molecule/SurfaceCard/SurfaceCard';
import { useT } from '../../i18n/I18nProvider';
import { SURFACES, type RouteDef, type Surface } from '../../specs/PageSpec';
import { canvasSpec } from './specs';
import './tools.css';

/** Deploy-time thumbnails (scripts/thumbnails.mjs, D-011); the build id busts the Pages cache, as on the hub. */
const thumb = (code: string) => `./thumbs/${code}.jpg?v=${__BUILD_ID__}`;

const ZOOMS = [25, 50, 75, 100, 150, 200] as const;
const clampZoom = (z: number) => Math.min(200, Math.max(25, z));
/** Largest preset at or below `z` (Fit snaps down, so everything it measured stays visible). */
const snapDown = (z: number) => [...ZOOMS].reverse().find((p) => p <= z) ?? ZOOMS[0];

export function CanvasPage() {
  const { t } = useT();
  const routes = useRoutes();
  const navigate = useNavigate();
  const { can, switchUser } = useSession();
  const [q, setQ] = useState('');
  const [surface, setSurface] = useState('');
  const [status, setStatus] = useState('');
  const [zoom, setZoom] = useState(100);
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return routes.filter(
      (r) =>
        (!surface || r.surface === surface) &&
        (!status || r.status === status) &&
        (!needle || `${r.code} ${r.spec.name} ${r.path} ${r.spec.purpose}`.toLowerCase().includes(needle)),
    );
  }, [routes, q, surface, status]);

  const groups = useMemo(
    () => SURFACES.map((s) => ({ surface: s, items: shown.filter((r) => r.surface === s) })).filter((g) => g.items.length > 0),
    [shown],
  );

  /** Opens a page as a demo user of its surface when the current role lacks the route permission (D-015). */
  const openRoute = useCallback(
    (route: RouteDef) => {
      if (route.permission && !can(route.permission)) {
        const role = roleForSurface(route.surface) ?? 'founder';
        switchUser(role);
        toast(t('tools.canvas.enterAs', { code: route.code, role: demoUserForRole(role)?.name ?? role }));
      }
      navigate(route.path);
      return `opened ${route.code} at #${route.path}`;
    },
    [can, switchUser, navigate, t],
  );

  /** Fit: measure the rendered grid against the stage and snap down to the preset that shows all of it. */
  const fit = useCallback(() => {
    const stage = stageRef.current;
    const inner = innerRef.current;
    if (!stage || !inner) return zoom;
    const rendered = inner.getBoundingClientRect().height;
    const available = stage.clientHeight;
    if (rendered <= 0 || available <= 0) return zoom;
    const next = snapDown(clampZoom(Math.floor((zoom * available) / rendered)));
    setZoom(next);
    return next;
  }, [zoom]);

  const stepZoom = useCallback((dir: 1 | -1) => {
    setZoom((z) => {
      const i = ZOOMS.findIndex((p) => p >= z);
      const at = i === -1 ? ZOOMS.length - 1 : i;
      return ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, at + dir))];
    });
  }, []);

  /** Ctrl + wheel is an extra on top of the buttons and the Select, never the only way to zoom (P-03). */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      stepZoom(e.deltaY < 0 ? 1 : -1);
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [stepZoom, groups.length]);

  const filtered = q !== '' || surface !== '' || status !== '';
  const clear = () => {
    setQ('');
    setSurface('');
    setStatus('');
  };

  useRegisterActions({
    'tools.zoomCanvas': ({ zoom: z }) => {
      const n = Number(z);
      if (!Number.isFinite(n)) return `"${String(z)}" is not a zoom percentage`;
      const next = clampZoom(Math.round(n));
      setZoom(next);
      return `canvas zoom ${next}%`;
    },
    'tools.fitCanvas': () => `canvas zoom ${fit()}%`,
    'tools.filterCanvasSurface': ({ surface: s }) => {
      const next = String(s ?? 'all');
      const value = next === 'all' ? '' : SURFACES.find((x) => x === next);
      if (value === undefined) return `unknown surface "${next}"`;
      setSurface(value);
      return `surface filter: ${value || 'all'}`;
    },
    'tools.filterCanvasStatus': ({ status: s }) => {
      const next = String(s ?? 'all');
      if (next !== 'all' && next !== 'built' && next !== 'stub') return `unknown status "${next}"`;
      setStatus(next === 'all' ? '' : next);
      return `status filter: ${next}`;
    },
    'tools.searchCanvas': ({ query }) => {
      const needle = query === undefined ? '' : String(query);
      setQ(needle);
      return `searching the canvas for "${needle}"`;
    },
    'tools.openCanvasPage': ({ code }) => {
      const wanted = String(code ?? '').toUpperCase();
      const route = routes.find((r) => r.code.toUpperCase() === wanted);
      if (!route) return `no registered page with the code "${wanted}"`;
      return openRoute(route);
    },
  });

  const surfaceLabel = (s: Surface) => t(`tools.surface.${s}`);
  const built = routes.filter((r) => r.status === 'built').length;

  return (
    <>
      <PageHeader
        code={canvasSpec.code}
        title={t('tools.canvas.title')}
        subtitle={t('tools.canvas.subtitle')}
        breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('tools.canvas.title') }]}
      />
      <div className="tools-stats">
        <StatTile label={t('tools.canvas.pages')} value={routes.length} tone="accent" />
        <StatTile label={t('tools.canvas.built')} value={built} tone="success" />
        <StatTile label={t('tools.canvas.stubs')} value={routes.length - built} tone="warning" />
        <StatTile label={t('tools.canvas.surfaces')} value={new Set(routes.map((r) => r.surface)).size} tone="info" />
      </div>
      <FilterBar onClear={filtered ? clear : undefined} summary={t('tools.summary', { shown: shown.length, total: routes.length })}>
        <SearchField value={q} onChange={setQ} placeholder={t('tools.canvas.search')} />
        <Select label={t('tools.canvas.surface')} hideLabel value={surface} onChange={(e) => setSurface(e.target.value)} placeholder={t('tools.canvas.allSurfaces')} options={SURFACES.map((s) => ({ value: s, label: surfaceLabel(s) }))} />
        <Select
          label={t('tools.canvas.status')}
          hideLabel
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder={t('tools.canvas.allStatuses')}
          options={[
            { value: 'built', label: t('tools.canvas.live') },
            { value: 'stub', label: t('tools.canvas.stub') },
          ]}
        />
      </FilterBar>

      <div className="tools-zoom">
        <Button size="sm" icon="−" aria-label={t('tools.canvas.zoomOut')} onClick={() => stepZoom(-1)} disabled={zoom <= ZOOMS[0]} />
        <span className="tools-zoom__value" aria-live="polite">
          {t('tools.canvas.zoomNow', { pct: zoom })}
        </span>
        <Button size="sm" icon="+" aria-label={t('tools.canvas.zoomIn')} onClick={() => stepZoom(1)} disabled={zoom >= ZOOMS[ZOOMS.length - 1]} />
        <Button size="sm" onClick={fit}>
          {t('tools.canvas.fit')}
        </Button>
        <Select
          label={t('tools.canvas.zoom')}
          hideLabel
          value={String(zoom)}
          onChange={(e) => setZoom(Number(e.target.value))}
          options={ZOOMS.map((p) => ({ value: String(p), label: `${p} %` }))}
        />
        <p className="tools-muted tools-zoom__hint">{t('tools.canvas.hint')}</p>
      </div>

      {groups.length === 0 ? (
        <EmptyState title={t('tools.canvas.none')} description={t('tools.canvas.noneHint')} glyph="▦">
          <Button onClick={clear}>{t('core.filter.clear')}</Button>
        </EmptyState>
      ) : (
        <div className="tools-canvas" ref={stageRef} aria-label={t('tools.canvas.stage')} style={{ ['--canvas-zoom' as string]: String(zoom / 100) }}>
          <div className="tools-canvas__inner" ref={innerRef}>
            {groups.map((g) => (
              <section key={g.surface} className="tools-canvas__group" aria-labelledby={`canvas-${g.surface}`}>
                <h3 id={`canvas-${g.surface}`} className="tools-canvas__group-title">
                  {t(g.items.length === 1 ? 'tools.canvas.groupOne' : 'tools.canvas.group', { surface: surfaceLabel(g.surface), n: g.items.length })}
                </h3>
                <ul className="tools-canvas__grid">
                  {g.items.map((r) => (
                    <li key={r.path} data-canvas-code={r.code}>
                      <SurfaceCard
                        code={r.code}
                        title={r.spec.name}
                        description={t('tools.canvas.desc', { path: `#${r.path}`, shell: r.shell, permission: r.permission ?? t('tools.canvas.noPermission') })}
                        status={r.status === 'built' ? 'live' : 'stub'}
                        statusLabel={r.status === 'built' ? t('tools.canvas.live') : t('tools.canvas.stub')}
                        ctaLabel={t('tools.canvas.open')}
                        image={thumb(r.code)}
                        onActivate={() => openRoute(r)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
