import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useRegisterActions } from '../../actions';
import { useRoutes } from '../../app/RoutesContext';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { usePrefersReducedMotion } from '../../design/env';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { pick } from '../../tenant/domain';
import { DeskObject, Preview } from './DeskObject';
import { GEOMETRY, buildItems, findItem, findPhase, layoutDesk, type DeskItem, type Mat, type PlacedItem } from './model';
import { DESK_CODE } from './specs';
import './desk.css';

/** Camera: the world point at the centre of the stage and the zoom. The world transform is derived from it. */
interface Cam {
  cx: number;
  cy: number;
  z: number;
}

const TILT_DEG = 22;
/** Desk surface beyond the mats (world px), so panning and zooming out still show desk, then its edge. */
const SLAB = 640;
const Z_MIN = 0.04;
const Z_MAX = 10;
const clampZ = (z: number) => Math.min(Z_MAX, Math.max(Z_MIN, z));
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/**
 * W-04 Method desk (prompt 0026, D-103). The client journey as ten felt mats on a desk; on each mat, sub-mats group
 * the phase's objects (statuses, forms, procedures, deliverables...), and every object is a small physical thing
 * (sheet, form, checklist, document, folder, box, token, card) whose top face previews its real content. Zoom and pan
 * are one transform on the world element, written through a ref and requestAnimationFrame while a gesture runs and
 * committed to React state when it ends (the percentage, `--desk-zoom`).
 */
export function DeskPage({ surface }: { surface: Surface }) {
  const { t, lang } = useT();
  const routes = useRoutes();
  const reduced = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  /** The zoom the world is laid out at (CSS zoom on .desk-zoom); gestures scale relative to it until they commit. */
  const laidOut = useRef(1);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const sizeRef = useRef(size);
  const cam = useRef<Cam>({ cx: 0, cy: 0, z: 0.3 });
  const [zoom, setZoom] = useState(30);
  const [tilt, setTilt] = useState(true);
  const tiltRef = useRef(tilt);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState('');
  const anim = useRef(0);
  /** True once the person moved the camera; until then the desk stays fitted to the stage. */
  const touched = useRef(false);
  const commitTimer = useRef(0);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const items = useMemo(() => buildItems(), []);
  // Mats per row from the stage's shape, so fit-to-screen stays readable: 5 landscape, 3 squarish, 2 tall phones.
  const aspect = size.w > 0 && size.h > 0 ? size.w / size.h : 2;
  const perRow = aspect < 0.7 ? 2 : aspect < 1.25 ? 3 : 5;
  const layout = useMemo(() => layoutDesk(items, perRow), [items, perRow]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const byId = useMemo(() => new Map(layout.items.map((i) => [i.id, i])), [layout]);

  // ---------------------------------------------------------------- projection (screen <-> desk plane <-> world)

  const persp = () => Math.max(900, 1.6 * Math.max(sizeRef.current.w, sizeRef.current.h));
  const theta = () => (tiltRef.current ? (TILT_DEG * Math.PI) / 180 : 0);

  /** Screen point relative to the stage centre -> point on the tilted desk plane (camera-local, centre origin). */
  const toPlane = useCallback((sx: number, sy: number) => {
    const th = theta();
    if (!th) return { u: sx, v: sy };
    const P = persp();
    const v = (sy * P) / (P * Math.cos(th) + sy * Math.sin(th));
    return { u: (sx * (P - v * Math.sin(th))) / P, v };
  }, []);

  /** Desk plane point -> screen point relative to the stage centre (rotateX then perspective). */
  const toScreen = useCallback((u: number, v: number) => {
    const th = theta();
    if (!th) return { x: u, y: v };
    const P = persp();
    const s = P / (P - v * Math.sin(th));
    return { x: u * s, y: v * Math.cos(th) * s };
  }, []);

  const apply = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    const { cx, cy, z } = cam.current;
    const { w, h } = sizeRef.current;
    world.style.transform = `translate3d(${w / 2 - z * cx}px, ${h / 2 - z * cy}px, 0) scale(${z / laidOut.current})`;
  }, []);

  const commit = useCallback(() => {
    window.clearTimeout(commitTimer.current);
    const world = worldRef.current;
    const inner = zoomRef.current;
    if (world && inner) {
      // Commit: lay the world out at the new zoom (crisp text), and drop the gesture scale in the same frame.
      laidOut.current = cam.current.z;
      inner.style.zoom = String(cam.current.z);
      world.classList.remove('is-moving');
      world.style.setProperty('--desk-zoom', String(cam.current.z));
      apply();
    }
    setZoom(Math.round(cam.current.z * 100));
  }, [apply]);

  const moving = useCallback(() => {
    touched.current = true;
    cancelAnimationFrame(anim.current);
    worldRef.current?.classList.add('is-moving');
  }, []);

  const commitSoon = useCallback(() => {
    window.clearTimeout(commitTimer.current);
    commitTimer.current = window.setTimeout(commit, 160);
  }, [commit]);

  const flyTo = useCallback(
    (target: Cam, ms = 480) => {
      cancelAnimationFrame(anim.current);
      const to = { ...target, z: clampZ(target.z) };
      if (ms !== 0) touched.current = true;
      if (reducedRef.current || ms === 0) {
        cam.current = to;
        apply();
        commit();
        return;
      }
      const from = { ...cam.current };
      const t0 = performance.now();
      worldRef.current?.classList.add('is-moving');
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / ms);
        const e = ease(k);
        cam.current = { cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e, z: from.z * Math.pow(to.z / from.z, e) };
        apply();
        if (k < 1) anim.current = requestAnimationFrame(step);
        else commit();
      };
      anim.current = requestAnimationFrame(step);
    },
    [apply, commit],
  );

  /** The camera that shows a world rectangle whole, accounting for the tilt (iterated on the projected corners). */
  const fitCam = useCallback(
    (x0: number, y0: number, x1: number, y1: number, pad = 24): Cam => {
      const { w, h } = sizeRef.current;
      const aw = Math.max(40, w - 2 * pad);
      const ah = Math.max(40, h - 2 * pad);
      let z = clampZ(Math.min(aw / (x1 - x0), ah / (y1 - y0)));
      let cx = (x0 + x1) / 2;
      let cy = (y0 + y1) / 2;
      const box = () => {
        const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => toScreen(z * (x - cx), z * (y - cy)));
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
      };
      for (let i = 0; i < 4; i++) {
        const b = box();
        z = clampZ(z * Math.min(aw / (b.maxX - b.minX), ah / (b.maxY - b.minY)));
        const c = box();
        const q = toPlane((c.minX + c.maxX) / 2, (c.minY + c.maxY) / 2);
        cx += q.u / z;
        cy += q.v / z;
      }
      return { cx, cy, z };
    },
    [toPlane, toScreen],
  );

  // ---------------------------------------------------------------- camera verbs (buttons, keys, actions)

  const fitAll = useCallback((ms?: number) => {
    const l = layoutRef.current;
    const c = fitCam(0, 0, l.width, l.height, 16);
    flyTo(c, ms);
    return c.z;
  }, [fitCam, flyTo]);

  const zoomAtScreen = useCallback((sx: number, sy: number, factor: number) => {
    const { cx, cy, z } = cam.current;
    const q = toPlane(sx, sy);
    const px = cx + q.u / z;
    const py = cy + q.v / z;
    const nz = clampZ(z * factor);
    touched.current = true;
    cam.current = { cx: px - q.u / nz, cy: py - q.v / nz, z: nz };
  }, [toPlane]);

  const zoomTo = useCallback((z: number, ms = 220) => flyTo({ ...cam.current, z }, ms), [flyTo]);
  const zoomBy = useCallback((factor: number) => zoomTo(cam.current.z * factor), [zoomTo]);

  const panScreen = useCallback((dx: number, dy: number) => {
    const q = toPlane(dx, dy);
    const { cx, cy, z } = cam.current;
    touched.current = true;
    cam.current = { cx: cx + q.u / z, cy: cy + q.v / z, z };
  }, [toPlane]);

  const matById = useCallback((id: string): Mat | undefined => layoutRef.current.mats.find((m) => m.id === id), []);

  const fitMat = useCallback((id: string) => {
    const m = matById(id);
    if (!m) return undefined;
    flyTo(fitCam(m.x, m.y, m.x + m.w, m.y + m.h, 20));
    setPhase(id);
    return m;
  }, [fitCam, flyTo, matById]);

  /** A zoom at which a page's text reads (the face fills about 45 % of the stage height). */
  const readableZ = () => clampZ((0.45 * Math.max(200, sizeRef.current.h)) / 60);

  const flyToItem = useCallback((item: PlacedItem, mode: 'focus' | 'open') => {
    const { w, h } = sizeRef.current;
    const z = mode === 'open' ? readableZ() : cam.current.z < readableZ() * 0.35 ? readableZ() * 0.6 : cam.current.z;
    let cx = item.x + item.cw / 2;
    let cy = item.y + item.ch / 2;
    if (mode === 'open') {
      // Keep the object visible beside the drawer: right drawer from 768 px, bottom sheet below.
      if (w >= 768) cx += Math.min(w / 4, 224) / z;
      else cy += (h / 4) / z;
    }
    flyTo({ cx, cy, z });
  }, [flyTo]);

  const reset = useCallback(() => {
    tiltRef.current = true;
    setTilt(true);
    setSelected(null);
    setPhase('');
    return fitAll();
  }, [fitAll]);

  const toggleTilt = useCallback(() => {
    tiltRef.current = !tiltRef.current;
    setTilt(tiltRef.current);
    return tiltRef.current;
  }, []);

  const openItem = useCallback((id: string) => {
    const item = layoutRef.current.items.find((i) => i.id === id);
    if (!item) return;
    setSelected(id);
    flyToItem(item, 'open');
  }, [flyToItem]);

  const onFocusItem = useCallback((id: string, e: FocusEvent<HTMLButtonElement>) => {
    // Keyboard (and restored) focus flies the object into view; a pointer press does not move the camera.
    if (!e.currentTarget.matches(':focus-visible')) return;
    const item = layoutRef.current.items.find((i) => i.id === id);
    if (item) flyToItem(item, 'focus');
  }, [flyToItem]);

  // ---------------------------------------------------------------- stage size, first fit, wheel

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(([entry]) => {
      const next = { w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) };
      sizeRef.current = next;
      setSize(next);
      apply();
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [apply]);

  // Stay fitted while the person has not moved the camera (first measure, stage height settling, window resizes),
  // and refit when the layout reflows (portrait <-> landscape changes the mats per row).
  const lastPerRow = useRef(perRow);
  useEffect(() => {
    if (size.w === 0 || size.h === 0) return;
    if (!touched.current || lastPerRow.current !== perRow) fitAll(0);
    lastPerRow.current = perRow;
  }, [perRow, size.w, size.h, fitAll]);

  // The stage takes the rest of the viewport under the toolbar (the bottom nav on phones is reserved in CSS).
  const [stageTop, setStageTop] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (stage) setStageTop(Math.round(stage.getBoundingClientRect().top + window.scrollY));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1;
      const dx = e.deltaX * unit;
      const dy = e.deltaY * unit;
      moving();
      if (e.shiftKey && !e.ctrlKey) {
        panScreen(dx || dy, dx ? dy : 0);
      } else {
        // Trackpad pinch arrives as ctrl + wheel with small deltas; a mouse wheel notch is ~100.
        const k = e.ctrlKey ? 0.01 : 0.0015;
        zoomAtScreen(e.clientX - rect.left - rect.width / 2, e.clientY - rect.top - rect.height / 2, Math.exp(-dy * k));
      }
      apply();
      commitSoon();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [apply, commitSoon, moving, panScreen, zoomAtScreen]);

  // ---------------------------------------------------------------- pointer: drag to pan, two-finger pinch

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ kind: 'drag'; id: number; sx: number; sy: number; wx: number; wy: number; moved: boolean } | { kind: 'pinch'; d0: number; z0: number; wx: number; wy: number } | null>(null);
  const suppressClick = useRef(false);

  const local = (e: { clientX: number; clientY: number }) => {
    const rect = stageRef.current?.getBoundingClientRect();
    return rect ? { x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 } : { x: 0, y: 0 };
  };
  const worldAt = (x: number, y: number) => {
    const q = toPlane(x, y);
    const { cx, cy, z } = cam.current;
    return { wx: cx + q.u / z, wy: cy + q.v / z };
  };
  const startPinch = () => {
    const [a, b] = [...pointers.current.values()];
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    gesture.current = { kind: 'pinch', d0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), z0: cam.current.z, ...worldAt(mid.x, mid.y) };
    moving();
  };
  const startDrag = (id: number, p: { x: number; y: number }, moved: boolean) => {
    gesture.current = { kind: 'drag', id, sx: p.x, sy: p.y, ...worldAt(p.x, p.y), moved };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 1) startDrag(e.pointerId, p, false);
    else if (pointers.current.size === 2) {
      for (const id of pointers.current.keys()) stageRef.current?.setPointerCapture?.(id);
      startPinch();
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    if (!g) return;
    if (g.kind === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const q = toPlane((a.x + b.x) / 2, (a.y + b.y) / 2);
      const nz = clampZ((g.z0 * d) / g.d0);
      cam.current = { cx: g.wx - q.u / nz, cy: g.wy - q.v / nz, z: nz };
      apply();
      return;
    }
    if (g.kind === 'drag' && g.id === e.pointerId) {
      if (!g.moved) {
        if (Math.hypot(p.x - g.sx, p.y - g.sy) < 5) return;
        g.moved = true;
        moving();
        stageRef.current?.setPointerCapture?.(e.pointerId);
      }
      const q = toPlane(p.x, p.y);
      cam.current = { ...cam.current, cx: g.wx - q.u / cam.current.z, cy: g.wy - q.v / cam.current.z };
      apply();
    }
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    const active = g && (g.kind === 'pinch' || g.moved);
    if (active) suppressClick.current = true;
    if (pointers.current.size === 1 && g?.kind === 'pinch') {
      const [[id, p]] = [...pointers.current.entries()];
      startDrag(id, p, true);
    } else if (pointers.current.size === 0) {
      gesture.current = null;
      if (active) commit();
      window.setTimeout(() => (suppressClick.current = false), 0);
    }
  };

  // ---------------------------------------------------------------- keyboard

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const step = 96;
    const keys: Record<string, () => void> = {
      '+': () => zoomBy(1.25),
      '=': () => zoomBy(1.25),
      '-': () => zoomBy(0.8),
      _: () => zoomBy(0.8),
      '0': () => reset(),
      f: () => fitAll(),
      F: () => fitAll(),
      ArrowLeft: () => (panScreen(-step, 0), flyTo(cam.current, 0)),
      ArrowRight: () => (panScreen(step, 0), flyTo(cam.current, 0)),
      ArrowUp: () => (panScreen(0, -step), flyTo(cam.current, 0)),
      ArrowDown: () => (panScreen(0, step), flyTo(cam.current, 0)),
    };
    const run = keys[e.key];
    if (!run) return;
    e.preventDefault();
    run();
  };

  // ---------------------------------------------------------------- labels and actions

  const kindLabel = (k: string) => t(`desk.kind.${k}`);
  const phaseName = (m: Mat) => `${String(m.index + 1).padStart(2, '0')} ${pick(m.label, lang)}`;
  const itemLabel = (i: DeskItem) => `${kindLabel(i.kind)}: ${pick(i.title, lang)}${i.code ? ` (${i.code})` : ''}`;
  const moreLabel = useCallback((n: number) => t('desk.more', { n }), [t]);
  const whereOf = useCallback(
    (i: DeskItem) => {
      const r = routes.find((x) => x.path === i.openAt.path);
      return r ? `${r.code} ${r.spec.name} (#${r.path})` : `#${i.openAt.path}`;
    },
    [routes],
  );

  useRegisterActions({
    'desk.zoom': ({ zoom: z }) => {
      const n = Number(z);
      if (!Number.isFinite(n) || n <= 0) return `"${String(z)}" is not a zoom percentage`;
      const next = clampZ(n / 100);
      zoomTo(next);
      return `desk zoom ${Math.round(next * 100)}%`;
    },
    'desk.fit': () => `desk fitted at ${Math.round(fitAll() * 100)}%`,
    'desk.reset': () => `desk reset, tilted, fitted at ${Math.round(reset() * 100)}%`,
    'desk.toggleTilt': () => (toggleTilt() ? 'desk tilted (22°)' : 'desk flat (top-down)'),
    'desk.focusPhase': ({ phase: q }) => {
      const id = findPhase(String(q ?? ''));
      const m = id && fitMat(id);
      return m ? `showing the ${m.label.en} mat (${m.count} objects)` : `no phase "${String(q ?? '')}" (1-10 or ${layoutRef.current.mats.map((x) => x.id).join(', ')})`;
    },
    'desk.focusItem': ({ item: q }) => {
      const found = findItem(layoutRef.current.items, String(q ?? ''));
      const item = found && byId.get(found.id);
      if (!item) return `no object "${String(q ?? '')}" on the desk`;
      openItem(item.id);
      return `showing the ${item.kind} ${item.title.en} (${item.id}) on the ${item.phase} mat`;
    },
    'desk.openItem': ({ item: q }) => {
      const found = findItem(layoutRef.current.items, String(q ?? ''));
      if (!found) return `no object "${String(q ?? '')}" on the desk`;
      return `not wired yet: ${whereOf(found)}`;
    },
  });

  const selectedItem = selected ? byId.get(selected) : undefined;
  const drawerSide = size.w >= 768 ? 'right' : 'bottom';
  const kv = (i: PlacedItem) => {
    const m = matById(i.phase);
    return [
      { key: t('desk.drawer.kind'), value: kindLabel(i.kind) },
      { key: t('desk.drawer.phase'), value: m ? phaseName(m) : i.phase },
      { key: t('desk.drawer.group'), value: t(`desk.group.${i.group}`) },
      { key: t('desk.drawer.source'), value: t(`desk.source.${i.source}`) },
      ...(i.code ? [{ key: t('desk.drawer.code'), value: i.code }] : []),
      { key: t('desk.drawer.id'), value: i.id },
    ];
  };

  /** The drawer's large preview: the same face markup at a larger base font size (every inner size is em). */
  const preview = (i: PlacedItem) => {
    const g = GEOMETRY[i.kind];
    const k = Math.min(380 / g.face.w, 380 / g.face.h);
    const tab = i.kind === 'folder' ? 7 * k : 0;
    return (
      <div className="desk-preview" style={{ width: g.face.w * k, height: g.face.h * k + tab, paddingTop: tab }}>
        <span className={`desk-item--${i.kind} desk-preview__face`} style={{ display: 'block', position: 'relative', width: g.face.w * k, height: g.face.h * k, fontSize: g.font * k }}>
          <span className="desk-top">
            <Preview item={i} lang={lang} rows={Infinity} moreLabel={moreLabel} />
          </span>
        </span>
      </div>
    );
  };

  const home = `/${surface}`;
  return (
    <div className="desk-page">
      <PageHeader
        code={DESK_CODE}
        title={t('desk.title')}
        subtitle={t('desk.subtitle', { items: layout.items.length, mats: layout.mats.length })}
        breadcrumb={[{ label: t(`core.portal.${surface}`), to: surface === 'dev' ? '/dev/components' : home }, { label: t('desk.title') }]}
      />

      <div className="desk-toolbar" role="toolbar" aria-label={t('desk.toolbar')}>
        <div className="desk-toolbar__zoom">
          <Button size="sm" icon="−" aria-label={t('desk.zoomOut')} onClick={() => zoomBy(0.8)} />
          <span className="desk-toolbar__pct" aria-live="polite">
            <span className="visually-hidden">{t('desk.zoomLabel')} </span>
            {t('desk.zoomNow', { pct: zoom })}
          </span>
          <Button size="sm" icon="+" aria-label={t('desk.zoomIn')} onClick={() => zoomBy(1.25)} />
        </div>
        <Button size="sm" onClick={() => fitAll()}>
          {t('desk.fit')}
        </Button>
        <Button size="sm" aria-pressed={tilt} onClick={toggleTilt}>
          {tilt ? t('desk.tiltOn') : t('desk.tiltOff')}
        </Button>
        <Select
          label={t('desk.phase')}
          hideLabel
          className="desk-toolbar__phase"
          value={phase}
          placeholder={t('desk.goToPhase')}
          onChange={(e) => e.target.value && fitMat(e.target.value)}
          options={layout.mats.map((m) => ({ value: m.id, label: t('desk.phaseOption', { name: phaseName(m), n: m.count }) }))}
        />
        <Button size="sm" variant="ghost" onClick={reset}>
          {t('desk.reset')}
        </Button>
      </div>

      <div
        ref={stageRef}
        className={`desk-stage${tilt ? ' is-tilted' : ''}`}
        tabIndex={0}
        role="region"
        aria-roledescription={t('desk.roledescription')}
        aria-label={t('desk.stage')}
        aria-describedby="desk-hint"
        style={{ perspective: `${Math.max(900, 1.6 * Math.max(size.w, size.h))}px`, height: `calc(100dvh - ${stageTop}px - var(--desk-bottom))` }}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}
        onScroll={(e) => {
          // Focus inside an overflow-hidden box scrolls it; the camera moves instead.
          e.currentTarget.scrollTop = 0;
          e.currentTarget.scrollLeft = 0;
        }}
      >
        <div className="desk-camera" style={{ transform: `rotateX(${tilt ? TILT_DEG : 0}deg)` }}>
          <div ref={worldRef} className="desk-world">
            <div ref={zoomRef} className="desk-zoom" style={{ width: layout.width, height: layout.height }}>
            <div className="desk-slab" aria-hidden="true" style={{ left: -SLAB, top: -SLAB, width: layout.width + 2 * SLAB, height: layout.height + 2 * SLAB }} />
            {layout.mats.map((m) => (
              <section key={m.id} className="desk-mat" style={{ left: m.x, top: m.y, width: m.w, height: m.h }} aria-label={phaseName(m)} data-desk-mat={m.id}>
                <button type="button" className="desk-mat__label" onClick={() => fitMat(m.id)} aria-label={t('desk.matLabel', { name: phaseName(m), n: m.count })}>
                  <span className="desk-mat__num">{String(m.index + 1).padStart(2, '0')}</span>
                  <span className="desk-mat__name">{pick(m.label, lang)}</span>
                  <span className="desk-mat__count">{t('desk.objects', { n: m.count })}</span>
                </button>
                {m.subs.map((s) => (
                  <div key={s.id} className={`desk-sub desk-sub--${s.group}`} style={{ left: s.x, top: s.y, width: s.w, height: s.h }}>
                    <span className="desk-sub__label">{t(`desk.group.${s.group}`)}</span>
                    {s.items.map((it) => (
                      <DeskObject
                        key={it.id}
                        item={it}
                        left={it.x}
                        top={it.y}
                        lang={lang}
                        label={itemLabel(it)}
                        selected={selected === it.id}
                        moreLabel={moreLabel}
                        onActivate={openItem}
                        onFocusItem={onFocusItem}
                      />
                    ))}
                  </div>
                ))}
              </section>
            ))}
            </div>
          </div>
        </div>
      </div>

      <p className="desk-hint" id="desk-hint">
        {t('desk.hint')}
      </p>

      <Drawer
        open={Boolean(selectedItem)}
        onClose={() => setSelected(null)}
        side={drawerSide}
        title={selectedItem ? pick(selectedItem.title, lang) : ''}
        footer={
          selectedItem && (
            <Placeholder what={t('desk.drawer.openWhat', { where: whereOf(selectedItem) })}>
              <Button variant="primary" icon="↗">
                {t('desk.drawer.open')}
              </Button>
            </Placeholder>
          )
        }
      >
        {selectedItem && (
          <div className="desk-drawer">
            {preview(selectedItem)}
            <KeyValue columns={1} items={kv(selectedItem)} />
            {selectedItem.lines.length > 0 && (
              <>
                <h3 className="desk-drawer__h">{t('desk.drawer.contents', { n: selectedItem.lines.length })}</h3>
                <ol className="desk-drawer__list">
                  {selectedItem.lines.map((line, i) => (
                    <li key={i}>{pick(line, lang)}</li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

