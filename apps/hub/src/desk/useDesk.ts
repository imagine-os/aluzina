import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useRegisterActions } from '../actions';
import { useMediaQuery, usePrefersReducedMotion } from '../design/env';
import { storageKey } from '../tenant/config';
import { layoutDesk } from './layout';
import type { DeskPerson } from './people';
import { MAT_GAP, SQ, defaultPerRow, type DeskLayout, type DeskModel, type Mat, type PlacedItem, type SubMat } from './types';

/**
 * The desk camera and its inputs (D-103, extracted and extended in D-106). One hook per desk: it lays the model out
 * for the stage's shape, owns the camera (world point at the stage centre + zoom + tilt), the gestures, the
 * fullscreen and size state, and registers the toolbar's actions. `DeskStage` renders what it returns.
 *
 * Gestures write the world transform through a ref + requestAnimationFrame (no React render per frame) and commit
 * the zoom as CSS `zoom` layout when they end, so text is crisp at every zoom (D-103).
 */

/** Camera: the world point at the centre of the stage and the zoom. */
export interface Cam {
  cx: number;
  cy: number;
  z: number;
}

export type DeskSize = 's' | 'm' | 'l';
/** Stage height presets (percent of the viewport height). */
export const SIZE_VH: Record<DeskSize, number> = { s: 40, m: 60, l: 85 };
export const DESK_SIZES: readonly DeskSize[] = ['s', 'm', 'l'];
const VH_MIN = 25;
const VH_MAX = 95;
export type FullscreenMode = 'off' | 'api' | 'css';

export const TILT_DEG = 22;
/** Desk surface beyond the mats (world px), so panning and zooming out still show desk, then its edge. */
export const SLAB = 640;
const Z_MIN = 0.04;
const Z_MAX = 10;
export const clampZ = (z: number) => Math.min(Z_MAX, Math.max(Z_MIN, z));
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
/** A click on an object waits this long for a second click (double-click zooms instead of opening). */
const DOUBLE_MS = 240;
/** Inertia after a drag (D-106): exponential decay, off under reduced motion. */
const INERTIA_TAU = 110;
const INERTIA_MAX_MS = 420;

function readStored(name: string): string | null {
  try {
    return window.localStorage.getItem(storageKey(name));
  } catch {
    return null;
  }
}
function writeStored(name: string, value: string): void {
  try {
    window.localStorage.setItem(storageKey(name), value);
  } catch {
    /* private window or blocked storage: the preference lasts for this visit only */
  }
}

export interface UseDeskOptions {
  /** Page code: the height preference is stored per code (`desk.height.<code>`). */
  code: string;
  model: DeskModel;
  /** The height preset when the person has not chosen one: M on W-04, S on the page desks. */
  defaultSize: DeskSize;
  /** Under 768 px the desk can collapse to a bar: open by default on W-04, closed on page desks. */
  compactOpenByDefault: boolean;
  /** Tilted camera by default. */
  tilted?: boolean;
  /** Opens an object (its drawer). Called on Enter / one click / one tap. */
  onOpenItem: (id: string) => void;
  /** Called after Reset (the client clears its own selection). */
  onReset?: () => void;
  /** Space pressed and released on the stage without dragging (W-04: play / pause the trail). */
  onSpacePress?: () => boolean | void;
  /** Extra keys on the stage (W-04: `[` / `]`); return true when handled. */
  onKey?: (e: KeyboardEvent<HTMLDivElement>) => boolean;
  /** Registers the toolbar actions under the route's guard (`false` skips, e.g. without permission). */
  actions?: boolean;
}

export interface Tip {
  id: string;
  x: number;
  y: number;
}

export function useDesk(opts: UseDeskOptions) {
  const { code, model } = opts;
  const reduced = usePrefersReducedMotion();
  const compact = useMediaQuery('(max-width: 767.98px)');
  const frameRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const miniViewRef = useRef<SVGPolygonElement>(null);
  /** The zoom the world is laid out at (CSS zoom on .desk-zoom); gestures scale relative to it until they commit. */
  const laidOut = useRef(1);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const sizeRef = useRef(size);
  const cam = useRef<Cam>({ cx: 0, cy: 0, z: 0.3 });
  const [zoom, setZoom] = useState(30);
  const [tilt, setTilt] = useState(opts.tilted ?? true);
  const tiltRef = useRef(tilt);
  const [matSel, setMatSel] = useState('');
  const anim = useRef(0);
  /** True once the person moved the camera; until then the desk stays fitted to the stage. */
  const touched = useRef(false);
  const commitTimer = useRef(0);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const optsRef = useRef(opts);
  optsRef.current = opts;

  // ---------------------------------------------------------------- preferences: height, wheel, open on phones

  const [vh, setVh] = useState<number>(() => {
    const v = Number(readStored(`desk.height.${code}`));
    return Number.isFinite(v) && v >= VH_MIN && v <= VH_MAX ? v : SIZE_VH[opts.defaultSize];
  });
  const [wheelZoom, setWheelZoom] = useState(() => readStored('desk.wheel') === 'zoom');
  const wheelZoomRef = useRef(wheelZoom);
  wheelZoomRef.current = wheelZoom;
  const [openSmall, setOpenSmall] = useState(opts.compactOpenByDefault);
  const [fullscreen, setFullscreen] = useState<FullscreenMode>('off');
  const fsRef = useRef(fullscreen);
  fsRef.current = fullscreen;
  const [legendOpen, setLegendOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  const showStage = !compact || openSmall || fullscreen !== 'off';

  const setHeight = useCallback(
    (next: number) => {
      const v = Math.round(Math.min(VH_MAX, Math.max(VH_MIN, next)) * 10) / 10;
      setVh(v);
      writeStored(`desk.height.${code}`, String(v));
      return v;
    },
    [code],
  );
  const toggleWheelZoom = useCallback((force?: boolean) => {
    const next = force ?? !wheelZoomRef.current;
    wheelZoomRef.current = next;
    setWheelZoom(next);
    writeStored('desk.wheel', next ? 'zoom' : 'pan');
    return next;
  }, []);

  // ---------------------------------------------------------------- layout

  const aspect = size.w > 0 && size.h > 0 ? size.w / size.h : 2;
  const perRow = (model.perRow ?? defaultPerRow)(aspect, model.mats.length);
  const peopleMats = useMemo(() => new Set((model.people ?? []).map((p) => p.phase)), [model.people]);
  const layout: DeskLayout = useMemo(() => layoutDesk(model, perRow, peopleMats), [model, perRow, peopleMats]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const byId = useMemo(() => new Map(layout.items.map((i) => [i.id, i])), [layout]);
  const byIdRef = useRef(byId);
  byIdRef.current = byId;
  const personByMat = useMemo(() => new Map<string, DeskPerson>((model.people ?? []).map((p) => [p.phase, p])), [model.people]);

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

  /** The minimap's viewport: the four stage corners projected onto the desk (a trapezoid when tilted). */
  const updateMinimap = useCallback(() => {
    const poly = miniViewRef.current;
    if (!poly) return;
    const { w, h } = sizeRef.current;
    const { cx, cy, z } = cam.current;
    const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => {
      const q = toPlane(x, y);
      return `${Math.round(cx + q.u / z)},${Math.round(cy + q.v / z)}`;
    });
    poly.setAttribute('points', pts.join(' '));
  }, [toPlane]);

  const apply = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    const { cx, cy, z } = cam.current;
    const { w, h } = sizeRef.current;
    world.style.transform = `translate3d(${w / 2 - z * cx}px, ${h / 2 - z * cy}px, 0) scale(${z / laidOut.current})`;
    updateMinimap();
  }, [updateMinimap]);

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
    setTip(null);
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
      setTip(null);
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

  const fitAll = useCallback(
    (ms?: number) => {
      const l = layoutRef.current;
      const c = fitCam(0, 0, l.width, l.height, 16);
      flyTo(c, ms);
      return c.z;
    },
    [fitCam, flyTo],
  );

  const zoomAtScreen = useCallback(
    (sx: number, sy: number, factor: number) => {
      const { cx, cy, z } = cam.current;
      const q = toPlane(sx, sy);
      const px = cx + q.u / z;
      const py = cy + q.v / z;
      const nz = clampZ(z * factor);
      touched.current = true;
      cam.current = { cx: px - q.u / nz, cy: py - q.v / nz, z: nz };
    },
    [toPlane],
  );

  const zoomTo = useCallback((z: number, ms = 220) => flyTo({ ...cam.current, z }, ms), [flyTo]);
  const zoomBy = useCallback((factor: number) => zoomTo(cam.current.z * factor), [zoomTo]);

  const panScreen = useCallback(
    (dx: number, dy: number) => {
      const q = toPlane(dx, dy);
      const { cx, cy, z } = cam.current;
      touched.current = true;
      cam.current = { cx: cx + q.u / z, cy: cy + q.v / z, z };
    },
    [toPlane],
  );

  const matById = useCallback((id: string): Mat | undefined => layoutRef.current.mats.find((m) => m.id === id), []);

  const fitMat = useCallback(
    (id: string) => {
      const m = matById(id);
      if (!m) return undefined;
      flyTo(fitCam(m.x, m.y, m.x + m.w, m.y + m.h, 20));
      setMatSel(id);
      return m;
    },
    [fitCam, flyTo, matById],
  );

  const fitSub = useCallback(
    (sub: SubMat, mat: Mat) => {
      const x = mat.x + sub.x;
      const y = mat.y + sub.y;
      flyTo(fitCam(x, y, x + sub.w, y + sub.h, 28));
      setMatSel(mat.id);
    },
    [fitCam, flyTo],
  );

  /** A zoom at which a face's text reads (the face fills about 45 % of the stage height). */
  const readableZ = () => clampZ((0.45 * Math.max(200, sizeRef.current.h)) / 60);

  const flyToItem = useCallback(
    (item: PlacedItem, mode: 'focus' | 'open' | 'zoom') => {
      const { w, h } = sizeRef.current;
      const z = mode === 'open' || mode === 'zoom' ? readableZ() : cam.current.z < readableZ() * 0.35 ? readableZ() * 0.6 : cam.current.z;
      let cx = item.x + item.cw / 2;
      let cy = item.y + item.ch / 2;
      if (mode === 'open') {
        // Keep the object visible beside the drawer: right drawer from 768 px, bottom sheet below.
        if (w >= 768) cx += Math.min(w / 4, 224) / z;
        else cy += h / 4 / z;
      }
      flyTo({ cx, cy, z });
    },
    [flyTo],
  );

  /** Flies to a person's station: 'open' shows it beside the drawer at a zoom where the nameplate reads. */
  const flyToPerson = useCallback(
    (matId: string, mode: 'focus' | 'open') => {
      const m = layoutRef.current.mats.find((x) => x.id === matId);
      if (!m?.person) return undefined;
      const { w, h } = sizeRef.current;
      const readable = clampZ(Math.min((0.5 * Math.max(200, h)) / m.person.h, (0.4 * Math.max(200, w)) / m.person.w));
      const z = mode === 'open' ? readable : cam.current.z < readable * 0.35 ? readable * 0.6 : cam.current.z;
      let cx = m.x + m.person.x + m.person.w / 2;
      let cy = m.y + m.person.y + m.person.h / 2;
      if (mode === 'open') {
        if (w >= 768) cx += Math.min(w / 4, 224) / z;
        else cy += h / 4 / z;
      }
      flyTo({ cx, cy, z });
      return m;
    },
    [flyTo],
  );

  const reset = useCallback(() => {
    tiltRef.current = optsRef.current.tilted ?? true;
    setTilt(tiltRef.current);
    setMatSel('');
    optsRef.current.onReset?.();
    return fitAll();
  }, [fitAll]);

  const toggleTilt = useCallback(() => {
    tiltRef.current = !tiltRef.current;
    setTilt(tiltRef.current);
    return tiltRef.current;
  }, []);

  // ---------------------------------------------------------------- fullscreen (Fullscreen API, CSS fallback)

  const enterFullscreen = useCallback(async () => {
    const el = frameRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void }) | null;
    const doc = document as Document & { webkitFullscreenEnabled?: boolean };
    if (el && (doc.fullscreenEnabled || doc.webkitFullscreenEnabled)) {
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else await el.webkitRequestFullscreen?.();
        setFullscreen('api');
        return 'api' as const;
      } catch {
        /* refused (iframe, permissions): fall back to the fixed overlay */
      }
    }
    setFullscreen('css');
    return 'css' as const;
  }, []);

  const exitFullscreen = useCallback(async () => {
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void; webkitFullscreenElement?: Element | null };
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
        else await doc.webkitExitFullscreen?.();
      } catch {
        /* already out */
      }
    }
    setFullscreen('off');
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (fsRef.current !== 'off') {
      await exitFullscreen();
      return 'off' as const;
    }
    return enterFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const on = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      const el = document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
      if (!el && fsRef.current === 'api') setFullscreen('off');
      else if (el && el === frameRef.current) setFullscreen('api');
    };
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      document.removeEventListener('webkitfullscreenchange', on);
    };
  }, []);

  // The CSS fallback exits on Escape (the API exits on its own); an open drawer takes Escape first (it is a dialog).
  useEffect(() => {
    if (fullscreen !== 'css') return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || document.querySelector('.drawer__backdrop')) return;
      setFullscreen('off');
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  // ---------------------------------------------------------------- stage size, staying fitted

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !showStage) return;
    const ro = new ResizeObserver(([entry]) => {
      const next = { w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) };
      sizeRef.current = next;
      setSize(next);
      apply();
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [apply, showStage]);

  // Stay fitted while the person has not moved the camera (first measure, a new height, a window resize, going full
  // screen), and refit when the layout reflows (portrait <-> landscape changes the mats per row).
  const lastPerRow = useRef(perRow);
  useEffect(() => {
    if (size.w === 0 || size.h === 0) return;
    if (!touched.current || lastPerRow.current !== perRow) fitAll(0);
    lastPerRow.current = perRow;
  }, [perRow, size.w, size.h, fitAll]);

  /** The next layout change flies to the whole desk once (W-04: following or clearing a project). */
  const refitNext = useRef(false);
  const refitOnNextLayout = useCallback(() => {
    refitNext.current = true;
  }, []);
  useEffect(() => {
    if (sizeRef.current.w === 0) return;
    if (refitNext.current) {
      refitNext.current = false;
      fitAll();
    } else if (!touched.current) fitAll(0);
  }, [layout.width, layout.height, fitAll]);

  // ---------------------------------------------------------------- wheel: pan by default, pinch / ctrl zooms

  /**
   * How far the camera centre may travel for a wheel pan: until the desk's edge reaches the stage's edge. When the
   * desk already fits that way, or the camera is at the edge, a vertical wheel scrolls the page instead (outside
   * full screen), so a page desk never traps the page's scroll.
   */
  const wheelRange = (axis: 'x' | 'y') => {
    const l = layoutRef.current;
    const { z } = cam.current;
    const { w, h } = sizeRef.current;
    const total = axis === 'x' ? l.width : l.height;
    // The desk-plane extent the stage shows on each side of the centre (tilt-aware: the far edge sees more).
    const before = axis === 'x' ? w / 2 / z : -toPlane(0, -h / 2).v / z;
    const after = axis === 'x' ? w / 2 / z : toPlane(0, h / 2).v / z;
    const lo = before - SQ;
    const hi = total - after + SQ;
    return lo > hi ? { lo: total / 2, hi: total / 2 } : { lo, hi };
  };
  /** True while the whole desk is in view (the camera is at or below the fit zoom): vertical scrolling is the page's. */
  const wholeInView = () => {
    const l = layoutRef.current;
    return cam.current.z <= fitCam(0, 0, l.width, l.height, 16).z * 1.03;
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !showStage) return;
    const onWheel = (e: WheelEvent) => {
      const rect = stage.getBoundingClientRect();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1;
      const dx = e.deltaX * unit;
      const dy = e.deltaY * unit;
      const zooming = e.ctrlKey || e.metaKey || (wheelZoomRef.current && !e.shiftKey);
      if (zooming) {
        e.preventDefault();
        moving();
        // Trackpad pinch arrives as ctrl + wheel with small deltas; a mouse notch is ~100 (clamped so one notch is one step).
        const d = Math.max(-60, Math.min(60, dy));
        const k = e.ctrlKey || e.metaKey ? 0.01 : 0.0025;
        zoomAtScreen(e.clientX - rect.left - rect.width / 2, e.clientY - rect.top - rect.height / 2, Math.exp(-d * k));
      } else {
        // Pan: two-finger scroll on a trackpad (both axes, the OS's natural direction), shift + wheel sideways.
        let px = dx;
        let py = dy;
        if (e.shiftKey && !dx) {
          px = dy;
          py = 0;
        }
        const { cx, cy } = cam.current;
        const ry = wheelRange('y');
        const vertical = Math.abs(py) > Math.abs(px);
        const atEdge = wholeInView() || (py > 0 && cy >= ry.hi - 0.5) || (py < 0 && cy <= ry.lo + 0.5);
        if (vertical && atEdge && fsRef.current === 'off') return; // let the page scroll
        e.preventDefault();
        moving();
        panScreen(px, py);
        const rx = wheelRange('x');
        const c = cam.current;
        cam.current = {
          ...c,
          cx: Math.min(Math.max(rx.hi, cx), Math.max(Math.min(rx.lo, cx), c.cx)),
          cy: Math.min(Math.max(ry.hi, cy), Math.max(Math.min(ry.lo, cy), c.cy)),
        };
      }
      apply();
      commitSoon();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [apply, commitSoon, moving, panScreen, zoomAtScreen, showStage]);

  // ---------------------------------------------------------------- pointer: drag (inertia), pinch, double-tap

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<
    | { kind: 'drag'; id: number; sx: number; sy: number; wx: number; wy: number; moved: boolean; type: string; t0: number; samples: { t: number; x: number; y: number }[] }
    | { kind: 'pinch'; d0: number; z0: number; wx: number; wy: number }
    | null
  >(null);
  const suppressClick = useRef(false);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);
  const doubleTapped = useRef(false);
  const pendingOpen = useRef(0);
  const spaceHeld = useRef(false);
  const spaceDragged = useRef(false);

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
  const startDrag = (id: number, p: { x: number; y: number }, moved: boolean, type: string) => {
    const t = performance.now();
    gesture.current = { kind: 'drag', id, sx: p.x, sy: p.y, ...worldAt(p.x, p.y), moved, type, t0: t, samples: [{ t, x: p.x, y: p.y }] };
  };

  const glide = (vx: number, vy: number) => {
    let last = performance.now();
    const t0 = last;
    worldRef.current?.classList.add('is-moving');
    const step = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const k = Math.exp(-dt / INERTIA_TAU);
      vx *= k;
      vy *= k;
      panScreen(-vx * dt, -vy * dt);
      apply();
      if (Math.hypot(vx, vy) > 0.02 && now - t0 < INERTIA_MAX_MS) anim.current = requestAnimationFrame(step);
      else commit();
    };
    anim.current = requestAnimationFrame(step);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 1) return;
    cancelAnimationFrame(anim.current);
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 1) {
      // Space + drag (or the middle button) pans from anywhere, objects included, without activating them.
      const grab = spaceHeld.current || e.button === 1;
      startDrag(e.pointerId, p, grab, e.pointerType);
      if (grab) {
        spaceDragged.current = true;
        moving();
        stageRef.current?.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      }
    } else if (pointers.current.size === 2) {
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
      // Two fingers: zoom about their midpoint (the midpoint also pans); no rotation.
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
        // Tap or drag: a drag starts past 6 px (touch and pen get 10 px: fingers wobble).
        if (Math.hypot(p.x - g.sx, p.y - g.sy) < (g.type === 'mouse' ? 6 : 10)) return;
        g.moved = true;
        moving();
        stageRef.current?.setPointerCapture?.(e.pointerId);
      }
      const now = performance.now();
      g.samples.push({ t: now, x: p.x, y: p.y });
      while (g.samples.length > 2 && now - g.samples[0].t > 90) g.samples.shift();
      const q = toPlane(p.x, p.y);
      cam.current = { ...cam.current, cx: g.wx - q.u / cam.current.z, cy: g.wy - q.v / cam.current.z };
      apply();
    }
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = local(e);
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    const active = g && (g.kind === 'pinch' || g.moved);
    if (active) suppressClick.current = true;
    if (pointers.current.size === 1 && g?.kind === 'pinch') {
      const [[id, q]] = [...pointers.current.entries()];
      startDrag(id, q, true, 'touch');
    } else if (pointers.current.size === 0) {
      gesture.current = null;
      if (active) {
        const s = g?.kind === 'drag' ? g.samples : [];
        const first = s[0];
        const lastS = s[s.length - 1];
        const dt = first && lastS ? lastS.t - first.t : 0;
        const fresh = lastS && performance.now() - lastS.t < 60;
        if (!reducedRef.current && e.type === 'pointerup' && g?.kind === 'drag' && dt > 8 && fresh) {
          const vx = (lastS.x - first.x) / dt;
          const vy = (lastS.y - first.y) / dt;
          if (Math.hypot(vx, vy) > 0.3) glide(vx, vy);
          else commit();
        } else commit();
      } else if (e.type === 'pointerup' && e.pointerType !== 'mouse') {
        // A tap. Two taps within 320 ms and 30 px: zoom to the object under the finger, or one step in at the point.
        const now = performance.now();
        const prev = lastTap.current;
        if (prev && now - prev.t < 320 && Math.hypot(p.x - prev.x, p.y - prev.y) < 30) {
          lastTap.current = null;
          doubleTapped.current = true;
          window.clearTimeout(pendingOpen.current);
          doubleAt(p, e.target as Element);
          window.setTimeout(() => (doubleTapped.current = false), 400);
        } else lastTap.current = { t: now, x: p.x, y: p.y };
      }
      window.setTimeout(() => (suppressClick.current = false), 0);
    }
  };

  /** Double-click / double-tap: zoom to the object under the point, else one step in about the point. */
  const doubleAt = (p: { x: number; y: number }, target: Element | null) => {
    const el = target?.closest?.('[data-desk-item]');
    const item = el ? byIdRef.current.get(el.getAttribute('data-desk-item') ?? '') : undefined;
    if (item) {
      flyToItem(item, 'zoom');
      return;
    }
    if (target?.closest?.('.desk-mat__label, .desk-sub__label, [data-desk-person]')) return;
    const from = { ...cam.current };
    zoomAtScreen(p.x, p.y, 1.8);
    const to = cam.current;
    cam.current = from;
    flyTo(to, 260);
  };

  const onDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (doubleTapped.current) return;
    // Objects handle their own double click (activateItem); this is the empty desk.
    if ((e.target as Element).closest('[data-desk-item]')) return;
    doubleAt(local(e), e.target as Element);
  };

  /** One click opens (after a short wait for a second click), two zoom to the object, Enter opens at once. */
  const activateItem = useCallback(
    (id: string, detail: number) => {
      window.clearTimeout(pendingOpen.current);
      if (doubleTapped.current) return;
      if (detail === 0) {
        optsRef.current.onOpenItem(id);
        return;
      }
      if (detail >= 2) {
        const item = byIdRef.current.get(id);
        if (item) flyToItem(item, 'zoom');
        return;
      }
      pendingOpen.current = window.setTimeout(() => optsRef.current.onOpenItem(id), DOUBLE_MS);
    },
    [flyToItem],
  );
  useEffect(() => () => window.clearTimeout(pendingOpen.current), []);

  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClick.current || spaceHeld.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick.current = false;
    }
  };

  // ---------------------------------------------------------------- keyboard

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (optsRef.current.onKey?.(e)) return;
    if (e.key === ' ' && e.target === e.currentTarget) {
      // Space on the stage: hold and drag to pan; a press without a drag goes to the client (W-04 plays its trail).
      e.preventDefault();
      if (!e.repeat) {
        spaceHeld.current = true;
        spaceDragged.current = false;
        stageRef.current?.classList.add('is-space');
      }
      return;
    }
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

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== ' ' || !spaceHeld.current) return;
    spaceHeld.current = false;
    stageRef.current?.classList.remove('is-space');
    if (!spaceDragged.current && e.target === e.currentTarget) optsRef.current.onSpacePress?.();
  };

  useEffect(() => {
    // Space released outside the stage (focus moved): stop holding.
    const up = (e: globalThis.KeyboardEvent) => {
      if (e.key === ' ' && spaceHeld.current) {
        spaceHeld.current = false;
        stageRef.current?.classList.remove('is-space');
      }
    };
    window.addEventListener('keyup', up);
    return () => window.removeEventListener('keyup', up);
  }, []);

  // ---------------------------------------------------------------- focus and hover: fly into view, tooltip

  const onFocusItem = useCallback(
    (id: string, e: FocusEvent<HTMLButtonElement>) => {
      // Keyboard (and restored) focus flies the object into view; a pointer press does not move the camera.
      if (!e.currentTarget.matches(':focus-visible')) return;
      const item = layoutRef.current.items.find((i) => i.id === id);
      if (item) flyToItem(item, 'focus');
    },
    [flyToItem],
  );

  const onFocusPerson = useCallback(
    (matId: string, e: FocusEvent<HTMLButtonElement>) => {
      if (e.currentTarget.matches(':focus-visible')) flyToPerson(matId, 'focus');
    },
    [flyToPerson],
  );

  const tipTimer = useRef(0);
  const onHint = useCallback((id: string, el: HTMLElement | null) => {
    window.clearTimeout(tipTimer.current);
    if (!el) {
      setTip((t) => (t?.id === id ? null : t));
      return;
    }
    // Wait for the fly-to of a keyboard focus to settle before measuring.
    tipTimer.current = window.setTimeout(() => {
      const box = boxRef.current?.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (!box) return;
      setTip({ id, x: r.left + r.width / 2 - box.left, y: r.top - box.top });
    }, worldRef.current?.classList.contains('is-moving') ? 520 : 60);
  }, []);

  // ---------------------------------------------------------------- minimap

  const miniJump = useCallback(
    (wx: number, wy: number, ms = 0) => {
      touched.current = true;
      flyTo({ ...cam.current, cx: wx, cy: wy }, ms);
    },
    [flyTo],
  );

  // ---------------------------------------------------------------- actions (the toolbar's vocabulary, D-106)

  const legendOpenRef = useRef(legendOpen);
  legendOpenRef.current = legendOpen;
  const heightOf = (s: DeskSize) => SIZE_VH[s];
  const sizeOf = (v: number): DeskSize | null => DESK_SIZES.find((s) => Math.abs(SIZE_VH[s] - v) < 0.6) ?? null;
  const ensureOpen = () => {
    if (showStage) return null;
    setOpenSmall(true);
    return 'the desk was collapsed on this narrow screen: it is shown now, run again to';
  };

  useRegisterActions(
    opts.actions === false
      ? {}
      : {
          'desk.zoom': ({ zoom: z }) => {
            const n = Number(z);
            if (!Number.isFinite(n) || n <= 0) return `"${String(z)}" is not a zoom percentage`;
            const closed = ensureOpen();
            if (closed) return `${closed} zoom`;
            const next = clampZ(n / 100);
            zoomTo(next);
            return `desk zoom ${Math.round(next * 100)}%`;
          },
          'desk.fit': () => {
            const closed = ensureOpen();
            return closed ? `${closed} fit` : `desk fitted at ${Math.round(fitAll() * 100)}%`;
          },
          'desk.reset': () => {
            const closed = ensureOpen();
            if (closed) return `${closed} reset`;
            const z = reset();
            return `desk reset, ${tiltRef.current ? 'tilted' : 'flat'}, fitted at ${Math.round(z * 100)}%`;
          },
          'desk.toggleTilt': () => (toggleTilt() ? 'desk tilted (22°)' : 'desk flat (top-down)'),
          'desk.fullscreen': async () => {
            const mode = await toggleFullscreen();
            return mode === 'off' ? 'desk back in the page' : mode === 'api' ? 'desk in full screen (Esc exits)' : 'desk filling the window (full screen is not available here; Esc exits)';
          },
          'desk.setHeight': ({ size: s }) => {
            const k = String(s ?? '').toLowerCase() as DeskSize;
            if (!DESK_SIZES.includes(k)) return `size must be s, m or l, not "${String(s)}"`;
            setOpenSmall(true);
            return `desk height ${k.toUpperCase()} (${setHeight(heightOf(k))} % of the screen)`;
          },
          'desk.toggleWheelZoom': () => (toggleWheelZoom() ? 'the scroll wheel zooms the desk (shift + wheel moves it)' : 'the scroll wheel moves the desk (pinch or ctrl + wheel zooms)'),
          'desk.legend': () => {
            const next = !legendOpenRef.current;
            setLegendOpen(next);
            return next ? `legend open: ${[...new Set(layoutRef.current.items.map((i) => i.kind))].join(', ')}` : 'legend closed';
          },
        },
  );

  return {
    code,
    model,
    layout,
    byId,
    personByMat,
    size,
    zoom,
    tilt,
    matSel,
    setMatSel,
    reduced,
    compact,
    showStage,
    openSmall,
    setOpenSmall,
    vh,
    setHeight,
    sizeOf,
    wheelZoom,
    toggleWheelZoom,
    fullscreen,
    toggleFullscreen,
    legendOpen,
    setLegendOpen,
    settingsOpen,
    setSettingsOpen,
    tip,
    setTip,
    refs: { frameRef, boxRef, stageRef, worldRef, zoomRef, miniViewRef },
    api: { fitAll, fitMat, fitSub, flyToItem, flyToPerson, zoomBy, zoomTo, reset, toggleTilt, matById, refitOnNextLayout, miniJump, apply },
    handlers: { onPointerDown, onPointerMove, onPointerEnd, onKeyDown, onKeyUp, onDoubleClick, onClickCapture, activateItem, onFocusItem, onFocusPerson, onHint },
    perspective: persp(),
    MAT_GAP,
  };
}

export type DeskController = ReturnType<typeof useDesk>;
