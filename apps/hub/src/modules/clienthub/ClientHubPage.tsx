import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useTheme } from '../../design/ThemeProvider';
import { DeskFace } from '../../desk/DeskObject';
import { PersonPortrait } from '../../desk/DeskPerson';
import { DeskStage } from '../../desk/DeskStage';
import { findItem } from '../../desk/layout';
import { GEOMETRY, SQ, type DeskModel, type Mat, type PlacedItem } from '../../desk/types';
import { useDesk } from '../../desk/useDesk';
import type { DeskPerson } from '../../desk/people';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { pick } from '../../tenant/domain';
import { useHubMap } from './hubMap.load';
import { HUB_LENS_IDS, type Bi, type HubDevice, type HubLensId, type HubMap, type HubRole } from './hubMap.types';
import { buildLens, toolsDefault, type HubEntry, type LensDesk } from './lenses';
import { clientHub, withLensCopy } from './registry';
import { HUB_CODE } from './specs';
import './clienthub.css';

const EMPTY: DeskModel = { code: HUB_CODE, mats: [], items: [] };
let lastModel: DeskModel = EMPTY;
/** The last lens model W-05 rendered (the module's `desk.build`; empty before the map has loaded). */
export const lastLensModel = (): DeskModel => lastModel;
/** A device's real CSS size for the live frame (the hub map's device vocabulary). */
export const DEVICE_SIZE: Record<HubDevice, { w: number; h: number }> = {
  phone: { w: 390, h: 844 },
  tablet: { w: 768, h: 1024 },
  desktop: { w: 1280, h: 800 },
  page: { w: 390, h: 1100 },
  sheet: { w: 1280, h: 800 },
};

export const isLens = (x: unknown): x is HubLensId => HUB_LENS_IDS.includes(x as HubLensId);

/**
 * The home zoom of a hub desk: phones at least 44 px wide on every screen, tilted far rows included (0.8), and on large screens (the UI scale above 1: from 1920 px) about
 * 120 px x the UI scale tall (--scale: 1.125 / 1.5 / 2), so at 3840 a phone is 240 px tall and its caption reads from
 * across the room. The Fit button still shows the whole desk.
 */
export function hubHomeZoom({ w }: { w: number; h: number }): number {
  let scale = 1;
  try {
    scale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale')) || 1;
  } catch {
    /* no computed style (tests): scale 1 */
  }
  const phone = GEOMETRY.phone.h * SQ;
  return Math.max(0.8, scale > 1 && w > 0 ? (120 * scale) / phone : 0);
}

/** The embed URL of the map's pattern for a route, a role and the faces' language and theme. */
export function embedUrl(map: HubMap, route: string, role: string, lang: 'es' | 'en', theme: 'light' | 'dark'): string {
  return map.embed.pattern
    .replace('{baseUrl}', map.product.baseUrl)
    .replace('{route}', route)
    .replace('{role}', encodeURIComponent(role))
    .replace('{lang}', lang)
    .replace('{theme}', theme);
}

/** What an entry opens live: route, role and device. */
function liveOf(entry: HubEntry | undefined, matRole: HubRole | undefined, map: HubMap): { route: string; role: string; device: HubDevice } | null {
  if (!entry) return null;
  switch (entry.kind) {
    case 'page': {
      const allowed = entry.page.roles;
      const own = entry.role?.id ?? matRole?.id;
      const role = own && (allowed.includes(own) || allowed.length === 0) ? own : allowed[0] ?? 'public';
      // A template page (`:id`) opens its sample record (hoy 0.11.2): the consumer rule is `sampleRoute ?? route`.
      return { route: entry.page.sampleRoute ?? entry.page.route, role, device: entry.page.device };
    }
    case 'tool':
      return { route: entry.tool.route, role: map.roles.find((r) => r.band === 'build')?.id ?? 'super_admin', device: 'desktop' };
    case 'site':
      return { route: entry.experience.route, role: entry.experience.roleId, device: 'page' };
    case 'experience':
      return { route: entry.experience.route, role: entry.experience.roleId, device: entry.experience.device };
    case 'hub':
      return { route: map.product.hubRoute, role: map.roles.find((r) => r.band === 'build')?.id ?? 'super_admin', device: 'desktop' };
    default:
      return null;
  }
}

/** The page in an iframe at its device's real size, scaled to the drawer's width; mounted only while live. */
function LiveFrame({ src, device, title }: { src: string; device: HubDevice; title: string }) {
  const { t } = useT();
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = DEVICE_SIZE[device];
  const scale = width > 0 ? Math.min(1, width / w) : 0;
  return (
    <div className="ch-live" ref={boxRef} data-live-device={device}>
      <p className="ch-muted">{t('clienthub.liveSize', { w, h, pct: Math.round(scale * 100) })}</p>
      <div className={`ch-live__box ch-live__box--${device}`} style={{ height: Math.round(h * scale), width: Math.round(w * scale) }}>
        {scale > 0 && (
          <div className="ch-live__scaler" style={{ width: w, height: h, transform: `scale(${scale})` }}>
            <iframe className="ch-live__frame" title={title} src={src} width={w} height={h} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ClientHubPage({ surface, clientId }: { surface: Surface; clientId: string }) {
  const { t, lang } = useT();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const hub = clientHub(clientId);
  const hm = useHubMap(clientId);
  const map = useMemo(() => withLensCopy(hm.map, hub), [hm.map, hub]);
  const b = (x: Bi | undefined) => (x ? x[lang] ?? x.en : '');

  // ---------------------------------------------------------------- view state in the hash query
  const qLens = params.get('lens');
  const lens: HubLensId = isLens(qLens) ? qLens : 'aluzina';
  const qFaces = params.get('faces');
  const facesLang: 'es' | 'en' = qFaces === 'es' || qFaces === 'en' ? qFaces : lang;
  const qTools = params.get('tools');
  const showTools = qTools === '1' ? true : qTools === '0' ? false : toolsDefault(map, lens);
  const setQuery = useCallback(
    (patch: Record<string, string | null>) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null) next.delete(k);
            else next.set(k, v);
          }
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const lensDesk: LensDesk | null = useMemo(() => (map ? buildLens(map, lens, { facesLang, theme, showTools }) : null), [map, lens, facesLang, theme, showTools]);
  const model = lensDesk?.model ?? EMPTY;
  lastModel = model;

  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const desk = useDesk({
    code: HUB_CODE,
    model,
    defaultSize: 'l',
    compactOpenByDefault: true,
    onOpenItem: (id) => openItem(id),
    onReset: () => {
      setSelected(null);
      setSelectedPerson(null);
      setLive(false);
    },
    homeZoom: hubHomeZoom,
  });
  const { layout, byId, api } = desk;

  const openItem = useCallback(
    (id: string) => {
      const item = byId.get(id);
      if (!item) return undefined;
      setSelectedPerson(null);
      setSelected(id);
      setLive(false);
      api.flyToItem(item, 'open');
      return item;
    },
    [byId, api],
  );
  const openPerson = useCallback(
    (matId: string) => {
      const m = api.flyToPerson(matId, 'open');
      if (!m) return undefined;
      setSelected(null);
      setSelectedPerson(matId);
      setLive(false);
      return m;
    },
    [api],
  );
  const closeDrawer = () => {
    setSelected(null);
    setSelectedPerson(null);
    setLive(false);
  };

  // Lens, faces or tools changed: the next layout flies home once.
  const viewKey = `${lens}|${showTools}`;
  const lastView = useRef(viewKey);
  useEffect(() => {
    if (lastView.current === viewKey) return;
    lastView.current = viewKey;
    closeDrawer();
    api.refitOnNextLayout();
  }, [viewKey, api]);

  // ?open=<id|code> (D-16 links here with an object selected).
  const wantOpen = params.get('open');
  useEffect(() => {
    if (!wantOpen || !layout.items.length) return;
    const it = findItem(layout.items, wantOpen);
    if (it) window.setTimeout(() => openItem(it.id), 60);
    setQuery({ open: null });
  }, [wantOpen, layout.items, openItem, setQuery]);

  // ---------------------------------------------------------------- labels
  const kindLabel = (k: string) => t(`desk.kind.${k}`);
  const matName = (m: Mat) => pick(m.label, lang);
  const subName = (group: string, m: Mat) => {
    const def = model.mats.find((x) => x.id === m.id);
    return def?.subLabels?.[group] ? pick(def.subLabels[group], lang) : group;
  };
  const whereOf = (i: PlacedItem) => {
    const m = layout.mats.find((x) => x.id === i.phase);
    return m ? `${matName(m)} · ${subName(i.group, m)}` : i.phase;
  };
  const itemLabel = (i: PlacedItem) => t('clienthub.itemLabel', { kind: kindLabel(i.kind), code: i.code ?? '', title: pick(i.title, lang), where: whereOf(i) });
  const personLabel = (p: DeskPerson, m: Mat) => t('clienthub.personLabel', { role: pick(p.caption ?? p.role.playbookRole, lang), name: p.firstName ? ` (${p.firstName})` : '', mat: matName(m) });
  const name = map ? b(map.product.name) : clientId.toUpperCase();
  const client = hub?.name ?? clientId.toUpperCase();
  const pages = map?.pages.length ?? 0;
  /** "one mat" / "8 mats" (EN), "un tapete" / "8 tapetes" (ES). */
  const matsPhrase = (n: number) => (n === 1 ? t('clienthub.mats.one') : t('clienthub.mats.other', { n }));

  // ---------------------------------------------------------------- selection
  const selectedItem = selected ? byId.get(selected) : undefined;
  const entry = selected ? lensDesk?.entries.get(selected) : undefined;
  const matRole = selectedItem ? lensDesk?.matRole.get(selectedItem.phase) : undefined;
  const liveTarget = map ? liveOf(entry, matRole, map) : null;
  const siblings = useMemo(() => (selectedItem ? layout.items.filter((i) => i.phase === selectedItem.phase && i.group === selectedItem.group) : []), [layout.items, selectedItem]);
  const sibIndex = selectedItem ? siblings.findIndex((i) => i.id === selectedItem.id) : -1;
  const step = useCallback(
    (dir: 1 | -1) => {
      if (sibIndex < 0 || siblings.length < 2) return undefined;
      const next = siblings[(sibIndex + dir + siblings.length) % siblings.length];
      openItem(next.id);
      return next;
    },
    [sibIndex, siblings, openItem],
  );
  const personRole = selectedPerson ? lensDesk?.matRole.get(selectedPerson) : undefined;
  const personData = selectedPerson ? desk.personByMat.get(selectedPerson) : undefined;

  const openInClient = useCallback(
    (route: string) => {
      if (!map) return 'no hub map loaded';
      const url = `${map.product.baseUrl}#${route}`;
      window.open(url, '_blank', 'noopener');
      return `opened ${url} in a new tab`;
    },
    [map],
  );
  const projectPath = `/${surface === 'dev' ? 'founder' : surface}/work/${hub?.projectId ?? ''}`;

  // ---------------------------------------------------------------- actions (P-05)
  const findRole = (q: string): HubRole | undefined => {
    const n = q.trim().toLowerCase().replace(/[\s-]+/g, '_');
    return map?.roles.find((r) => r.id === n || r.look === n.replace(/_/g, '') || r.label.en.toLowerCase().replace(/[\s-]+/g, '_') === n || r.label.es.toLowerCase().replace(/[\s-]+/g, '_') === n);
  };
  const byCode = (q: unknown) => (q ? findItem(layout.items, String(q)) : undefined);
  useRegisterActions({
    'clienthub.open': ({ code }) => {
      const it = byCode(code);
      if (!it) return `no screen "${String(code ?? '')}" on the desk (${lens} lens)`;
      openItem(it.id);
      return `opened ${it.code ?? it.id} ${it.title.en} (${it.kind}) on ${whereOf(it)}`;
    },
    'clienthub.focusRole': ({ role }) => {
      const r = findRole(String(role ?? ''));
      if (!r) return `no role "${String(role ?? '')}" (${map?.roles.map((x) => x.id).join(', ') ?? 'no map'})`;
      const mat = [...(lensDesk?.matRole.entries() ?? [])].find(([, x]) => x.id === r.id)?.[0];
      if (!mat) return `the ${r.label.en} role has no mat in the ${lens} lens`;
      openPerson(mat);
      return `showing the ${r.label.en} mat${r.demoUser ? ` (${r.demoUser.firstName})` : ''}`;
    },
    'clienthub.setLens': ({ lens: l }) => {
      if (!isLens(l)) return `lens must be aluzina, between-gigs or standalone, not "${String(l)}"`;
      setQuery({ lens: l === 'aluzina' ? null : l });
      return `showing the hub as ${l} sees it`;
    },
    'clienthub.setFacesLang': ({ lang: l }) => {
      if (l !== 'es' && l !== 'en') return `lang must be es or en, not "${String(l)}"`;
      setQuery({ faces: l });
      return `screens in ${l === 'es' ? 'Spanish' : 'English'}`;
    },
    'clienthub.toggleTools': () => {
      setQuery({ tools: showTools ? '0' : '1' });
      return showTools ? 'tools hidden' : 'tools shown';
    },
    'clienthub.openLive': ({ code }) => {
      const it = byCode(code) ?? selectedItem;
      if (!it) return `no screen "${String(code ?? '')}" on the desk`;
      if (it.id !== selected) openItem(it.id);
      const target = map ? liveOf(lensDesk?.entries.get(it.id), lensDesk?.matRole.get(it.phase), map) : null;
      if (!target || !map) return `${it.title.en} has nothing to open live`;
      setLive(true);
      return `live: ${embedUrl(map, target.route, target.role, facesLang, theme)}`;
    },
    'clienthub.closeLive': () => {
      if (!live) return 'nothing is live';
      setLive(false);
      return 'live frame closed';
    },
    'clienthub.stepObject': ({ dir }) => {
      if (dir !== 'prev' && dir !== 'next') return `dir must be prev or next, not "${String(dir)}"`;
      const it = step(dir === 'prev' ? -1 : 1);
      return it ? `opened ${it.code ?? it.id} ${it.title.en}` : 'open a screen first (clienthub.open)';
    },
    'clienthub.openInClient': ({ code }) => {
      const it = byCode(code) ?? selectedItem;
      const target = it && map ? liveOf(lensDesk?.entries.get(it.id), lensDesk?.matRole.get(it.phase), map) : null;
      return target ? openInClient(target.route) : `no screen "${String(code ?? '')}" on the desk`;
    },
    'clienthub.openProject': () => {
      navigate(projectPath);
      return `opened #${projectPath}`;
    },
    'clienthub.reloadMap': async () => {
      const result = await hm.reload();
      return result;
    },
    'desk.focusMat': ({ mat }) => {
      const q = String(mat ?? '').trim().toLowerCase();
      const m = layout.mats.find((x) => x.id.toLowerCase() === q || pick(x.label, 'en').toLowerCase() === q || pick(x.label, 'es').toLowerCase() === q || String(x.index + 1) === q) ?? layout.mats.find((x) => pick(x.label, 'en').toLowerCase().includes(q) || pick(x.label, 'es').toLowerCase().includes(q));
      if (!m) return `no mat "${String(mat ?? '')}" (${layout.mats.map((x) => x.id).join(', ') || 'the map is loading'})`;
      api.fitMat(m.id);
      return `showing the ${m.label.en} mat (${m.count} objects)`;
    },
    'desk.focusObject': ({ object }) => {
      const it = byCode(object);
      if (!it) return `no object "${String(object ?? '')}" on the desk`;
      api.flyToItem(it, 'zoom');
      return `showing the ${it.kind} ${it.code ?? ''} ${it.title.en}`;
    },
    'desk.openObject': ({ object }) => {
      const it = byCode(object);
      if (!it) return `no object "${String(object ?? '')}" on the desk`;
      openItem(it.id);
      return `opened the ${it.kind} ${it.code ?? ''} ${it.title.en}`;
    },
  });

  // ---------------------------------------------------------------- header strip
  const mapPill = hm.loading ? (
    <StatusPill status="loading" tone="neutral" label={t('clienthub.map.loading')} />
  ) : hm.source === 'live' ? (
    <StatusPill status="live" tone="success" label={t('clienthub.map.live', { date: formatDate(hm.asOf ?? '', lang) })} />
  ) : hm.source === 'snapshot' ? (
    <StatusPill status="snapshot" tone="warning" label={t('clienthub.map.snapshot', { date: formatDate(hm.asOf ?? '', lang) })} />
  ) : null;
  const [wordmarkOk, setWordmarkOk] = useState(true);
  const wordmark = map?.product.brand.wordmark && wordmarkOk ? new URL(map.product.brand.wordmark, map.product.baseUrl).href : null;

  const header = (
    <div className="ch-strip" role="toolbar" aria-label={t('clienthub.toolbar')}>
      <div className="ch-strip__brand">
        {wordmark ? <img className="ch-wordmark" src={wordmark} alt={t('clienthub.wordmark', { name })} onError={() => setWordmarkOk(false)} /> : <span className="ch-name">{name}</span>}
        {map && <span className="ch-version">{t('clienthub.version', { version: map.product.version })}</span>}
        <Button size="sm" variant="ghost" icon="↗" title={t('clienthub.clientWhat')} onClick={() => navigate(projectPath)}>
          {/* Phones: the short label keeps the wordmark, the version and the project link on one line (changelog 0041). */}
          <span className="ch-wide">{t('clienthub.client', { project: hub?.projectId ?? '' })}</span>
          <span className="ch-narrow">{t('clienthub.clientShort', { project: hub?.projectId ?? '' })}</span>
        </Button>
      </div>
      <div className="ch-strip__map">
        {mapPill}
        <Button size="sm" variant="ghost" icon="↻" aria-label={t('clienthub.map.reload')} title={t('clienthub.map.reload')} onClick={() => void hm.reload().then((r) => toast(t('clienthub.map.reloaded', { result: r })))}>
          {/* A narrow strip keeps the icon (44 px, named) so the pill and the button share one line (changelog 0041). */}
          <span className="ch-wide-label">{t('clienthub.map.reload')}</span>
        </Button>
      </div>
      <div className="ch-strip__lens">
        <Tabs label={t('clienthub.lens')} value={lens} onChange={(id) => setQuery({ lens: id === 'aluzina' ? null : id, tools: null })} tabs={HUB_LENS_IDS.map((id) => ({ id, label: t(`clienthub.lens.${id}`) }))} />
      </div>
      <div className="ch-strip__faces" role="group" aria-label={t('clienthub.faces')}>
        <span className="ch-muted" aria-hidden="true">
          {t('clienthub.faces')}
        </span>
        {(['es', 'en'] as const).map((l) => (
          <Button key={l} size="sm" variant={facesLang === l ? 'primary' : 'secondary'} aria-pressed={facesLang === l} aria-label={t(`clienthub.faces.${l}`)} title={t(`clienthub.faces.${l}`)} onClick={() => setQuery({ faces: l })}>
            {l.toUpperCase()}
          </Button>
        ))}
        <Button size="sm" variant={showTools ? 'primary' : 'secondary'} aria-pressed={showTools} title={t('clienthub.tools.label')} onClick={() => setQuery({ tools: showTools ? '0' : '1' })}>
          {t('clienthub.tools.show')}
        </Button>
      </div>
    </div>
  );
  const hint = map?.lenses[lens];
  const framing = (
    <div className="ch-framing">
      {hint && (
        <div className="ch-framing__text">
          <p>
            <strong>{b(hint.title)}.</strong> {b(hint.framing)}
          </p>
          {map && lens === 'between-gigs' && <p className="ch-muted ch-tagline">{b(map.product.tagline)}</p>}
        </div>
      )}
      {hm.source === 'snapshot' && hm.liveError && <p className="ch-muted">{t('clienthub.map.why', { why: hm.liveError })}</p>}
      {map && lens === 'between-gigs' && (
        // One compact strip beside the framing (changelog 0041): the desk stays within the first screen at 1280.
        <Card
          className="ch-gig"
          padding="sm"
          title={name}
          subtitle={`${t('clienthub.gig.kicker')} · ${t('clienthub.version', { version: map.product.version })} · ${t('clienthub.gig.counts', { experiences: map.experiences.length, pages: map.pages.length, tools: map.tools.length })}`}
          actions={
            <Button size="sm" variant="secondary" icon="↗" href={`${map.product.baseUrl}#${map.product.hubRoute}`} external aria-label={t('clienthub.gig.open', { name })} title={t('clienthub.gig.open', { name })}>
              <span className="ch-gig__open">{t('clienthub.gig.open', { name })}</span>
            </Button>
          }
        />
      )}
    </div>
  );

  // ---------------------------------------------------------------- drawer
  const drawerSide = desk.size.w >= 768 || window.innerWidth >= 768 ? 'right' : 'bottom';
  const roleName = (id: string | undefined) => (id ? b(map?.roles.find((r) => r.id === id)?.label) || id : '');
  const deviceName = (d: HubDevice) => t(`clienthub.device.${d}`);
  const pageButtons = (codes: { code: string; name: Bi }[]) => (
    <ul className="ch-list">
      {codes.map((p) => {
        const it = byId.get(`hp-${p.code}`);
        return (
          <li key={p.code}>
            <Button size="sm" variant="ghost" disabled={!it} onClick={() => it && openItem(it.id)}>
              {p.code} · {b(p.name)}
            </Button>
          </li>
        );
      })}
    </ul>
  );
  const entryBody = (e: HubEntry) => {
    switch (e.kind) {
      case 'page':
        return (
          <>
            <KeyValue
              columns={1}
              items={[
                { key: t('clienthub.drawer.code'), value: e.page.code },
                { key: t('clienthub.drawer.role'), value: roleName(liveTarget?.role ?? e.role?.id) },
                ...(e.experience ? [{ key: t('clienthub.drawer.experience'), value: b(e.experience.label) }] : []),
                { key: t('clienthub.drawer.device'), value: deviceName(e.page.device) },
                { key: t('clienthub.drawer.route'), value: `#${e.page.route}` },
                { key: t('clienthub.drawer.status'), value: t(`clienthub.drawer.status.${e.page.status}`) },
                { key: t('clienthub.drawer.roles'), value: e.page.roles.map(roleName).join(', ') },
              ]}
            />
            <h3 className="desk-drawer__h">{t('clienthub.drawer.purpose')}</h3>
            <p className="desk-drawer__why">{b(e.page.purpose)}</p>
            <h3 className="desk-drawer__h">{t('clienthub.drawer.actions', { n: e.page.actions.length })}</h3>
            {e.page.actions.length ? (
              <ul className="ch-actions">
                {e.page.actions.map((a) => (
                  <li key={a}>
                    <code>{a}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ch-muted">{t('clienthub.drawer.noActions')}</p>
            )}
          </>
        );
      case 'tool':
        return (
          <>
            <KeyValue columns={1} items={[{ key: t('clienthub.drawer.code'), value: e.tool.code }, { key: t('clienthub.drawer.device'), value: deviceName('desktop') }, { key: t('clienthub.drawer.route'), value: `#${e.tool.route}` }]} />
            <h3 className="desk-drawer__h">{t('clienthub.drawer.purpose')}</h3>
            <p className="desk-drawer__why">{b(e.tool.purpose)}</p>
            <p className="ch-muted">{t('clienthub.drawer.tool')}</p>
          </>
        );
      case 'site':
        return (
          <>
            <p className="desk-drawer__why">{b(e.experience.purpose)}</p>
            <h3 className="desk-drawer__h">{t('clienthub.drawer.pages', { n: e.pages.length })}</h3>
            {pageButtons(e.pages)}
          </>
        );
      case 'more':
        return (
          <>
            <h3 className="desk-drawer__h">{t('clienthub.drawer.pages', { n: e.pages.length })}</h3>
            {pageButtons(e.pages)}
          </>
        );
      case 'experience':
        return (
          <>
            <KeyValue
              columns={1}
              items={[
                { key: t('clienthub.drawer.code'), value: e.experience.code },
                { key: t('clienthub.drawer.role'), value: roleName(e.experience.roleId) },
                { key: t('clienthub.drawer.device'), value: deviceName(e.experience.device) },
                { key: t('clienthub.drawer.route'), value: `#${e.experience.route}` },
                { key: t('clienthub.drawer.roles'), value: e.experience.roles.map(roleName).join(', ') },
              ]}
            />
            <h3 className="desk-drawer__h">{t('clienthub.drawer.purpose')}</h3>
            <p className="desk-drawer__why">{b(e.experience.purpose)}</p>
            <h3 className="desk-drawer__h">{t('clienthub.drawer.pages', { n: e.experience.pageCodes.length })}</h3>
            <p className="ch-muted">{e.experience.pageCodes.join(' · ')}</p>
          </>
        );
      case 'hub':
        return <p className="desk-drawer__why">{t('clienthub.drawer.hub')}</p>;
      default:
        return null;
    }
  };
  const personBody = (p: DeskPerson, r: HubRole | undefined, m: Mat | undefined) => (
    <div className="desk-drawer">
      <PersonPortrait person={p} lang={lang} />
      <KeyValue
        columns={1}
        items={[
          { key: t('clienthub.drawer.role'), value: pick(p.caption ?? p.role.playbookRole, lang) },
          ...(r?.demoUser ? [{ key: t('clienthub.drawer.demo'), value: r.demoUser.firstName }] : []),
          ...(r ? [{ key: t('clienthub.drawer.home'), value: `#${r.home}` }, { key: t('clienthub.drawer.device'), value: deviceName(r.device) }] : []),
        ]}
      />
      <p className="desk-drawer__why">{pick(p.role.note, lang)}</p>
      {m && (
        <>
          <h3 className="desk-drawer__h">{t('clienthub.drawer.owns')}</h3>
          <ul className="ch-list">
            {m.subs.map((s) => (
              <li key={s.id}>
                <Button size="sm" variant="ghost" onClick={() => api.fitSub(s, m)}>
                  {subName(s.group, m)} · {s.items.length}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      {live && r && map && <LiveFrame src={embedUrl(map, r.home, r.id, facesLang, theme)} device={r.device} title={t('clienthub.liveTitle', { title: b(r.label), role: b(r.label) })} />}
    </div>
  );
  const liveDevice: HubDevice | undefined = selectedItem ? liveTarget?.device : personRole?.device;
  const drawerWide = live && liveDevice !== undefined && liveDevice !== 'phone' && liveDevice !== 'page';

  const stepper = selectedItem && siblings.length > 1 && (
    <div className="ch-step" role="group" aria-label={t('clienthub.drawer.of', { i: sibIndex + 1, n: siblings.length })}>
      <Button size="sm" variant="ghost" icon="‹" onClick={() => step(-1)}>
        {t('clienthub.prev')}
      </Button>
      <span className="ch-muted ch-of">{t('clienthub.drawer.of', { i: sibIndex + 1, n: siblings.length })}</span>
      <Button size="sm" variant="ghost" iconEnd="›" onClick={() => step(1)}>
        {t('clienthub.next')}
      </Button>
    </div>
  );
  const footer = selectedItem ? (
    <>
      {liveTarget && map && (
        <>
          <Button variant={live ? 'secondary' : 'primary'} aria-pressed={live} title={t('clienthub.liveWhat', { role: roleName(liveTarget.role) })} onClick={() => setLive(!live)}>
            {live ? t('clienthub.liveClose') : t('clienthub.live')}
          </Button>
          <Button variant="secondary" href={`${map.product.baseUrl}#${liveTarget.route}`} external title={t('clienthub.openClientWhat', { name })}>
            {t('clienthub.openClient', { name })}
          </Button>
        </>
      )}
    </>
  ) : personRole && map ? (
    <Button variant={live ? 'secondary' : 'primary'} aria-pressed={live} title={t('clienthub.liveWhat', { role: b(personRole.label) })} onClick={() => setLive(!live)}>
      {live ? t('clienthub.liveClose') : t('clienthub.live')}
    </Button>
  ) : null;

  const shownPages = layout.items.reduce((n, i) => n + (i.id.startsWith('hp-') ? 1 : i.kind === 'stack' ? i.more ?? 0 : 0), 0);

  return (
    <div className="desk-page ch-page">
      <PageHeader
        code={HUB_CODE}
        title={t('clienthub.title', { name: client })}
        subtitle={t(`clienthub.subtitle.${lens}`, { client, pages, mats: matsPhrase(layout.mats.length) })}
        breadcrumb={[{ label: t(`core.portal.${surface}`), to: surface === 'dev' ? '/dev/components' : `/${surface}` }, { label: t('clienthub.crumb.clients') }, { label: t('clienthub.title', { name: client }) }]}
      />
      {header}
      {framing}
      {!hub ? (
        <p className="ch-muted">{t('clienthub.map.none')}</p>
      ) : (
        <DeskStage
          desk={desk}
          stageLabel={t('clienthub.stage', { name: client })}
          hint={t('clienthub.hint')}
          matName={matName}
          matAria={(m) => t('clienthub.matLabel', { name: matName(m), screens: m.count === 1 ? t('clienthub.screens.one') : t('clienthub.screens', { n: m.count }) })}
          matCount={(m) => (m.count === 1 ? t('clienthub.screens.one') : t('clienthub.screens', { n: m.count }))}
          matSelectPlaceholder={t('clienthub.goToMat')}
          subLabel={(s, m) => subName(s.group, m)}
          itemLabel={itemLabel}
          tipOf={(i) => ({ title: `${i.code ? `${i.code} · ` : ''}${pick(i.title, lang)}`, meta: t('clienthub.tip', { kind: kindLabel(i.kind), where: whereOf(i) }) })}
          selected={selected}
          personLabel={personLabel}
          selectedPerson={selectedPerson}
          onActivatePerson={openPerson}
          compactSummary={t('clienthub.compact', { name: client, pages: shownPages, mats: matsPhrase(layout.mats.length) })}
          grouping={pick(model.grouping ?? { en: '' }, lang)}
        />
      )}

      <Drawer
        open={Boolean(selectedItem ?? personData)}
        onClose={closeDrawer}
        side={drawerSide}
        size={drawerWide ? 'lg' : 'md'}
        title={selectedItem ? `${selectedItem.code ? `${selectedItem.code} · ` : ''}${pick(selectedItem.title, lang)}` : personData ? pick(personData.caption ?? personData.role.playbookRole, lang) : ''}
        footer={footer}
      >
        {selectedItem && (
          <div className="desk-drawer">
            {stepper}
            {live && liveTarget && map ? (
              <LiveFrame src={embedUrl(map, liveTarget.route, liveTarget.role, facesLang, theme)} device={liveTarget.device} title={t('clienthub.liveTitle', { title: pick(selectedItem.title, lang), role: roleName(liveTarget.role) })} />
            ) : (
              <div className="ch-face">
                <DeskFace item={{ ...selectedItem, plain: false }} lang={lang} box={selectedItem.kind === 'screen' ? 380 : 300} moreLabel={(n) => t('desk.more', { n })} rows={6} />
              </div>
            )}
            {entry && entryBody(entry)}
          </div>
        )}
        {!selectedItem && personData && personBody(personData, personRole, selectedPerson ? api.matById(selectedPerson) : undefined)}
      </Drawer>
    </div>
  );
}
