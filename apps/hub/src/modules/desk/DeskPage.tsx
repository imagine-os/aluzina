import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { matchPath, useNavigate } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useRoutes } from '../../app/RoutesContext';
import { useSession } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { useData, useTable } from '../../data/DataContext';
import type { EntityName } from '../../data/schema';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { usePrefersReducedMotion } from '../../design/env';
import { coreStrings } from '../../i18n/core';
import { formatCop, formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import type { RouteDef, Surface } from '../../specs/PageSpec';
import { demoUserById, demoUserForRole } from '../../tenant/auth/demoUsers';
import { hasPermission, rolesWith } from '../../tenant/auth/permissions';
import { roleForSurface } from '../../tenant/auth/roles';
import { lifecycleOf, pick } from '../../tenant/domain';
import { DeskObject, Preview } from './DeskObject';
import { DeskPersonStation, PersonPortrait } from './DeskPerson';
import { FLOW_ENTITIES, FLOW_RULES, buildLights, buildTrail, commsOf, moneyOf, phaseOfStatus, pipelineLabel, rowFields, shortName, type FlowCtx, type FlowEntity } from './deskFlow';
import { buildPeople, type DeskPerson } from './deskPeople';
import { GEOMETRY, buildItems, findItem, findPhase, layoutDesk, type DeskItem, type Mat, type PlacedItem } from './model';
import { useProjectFlow } from './useProjectFlow';
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
/** One trail hop (the pulse's travel) and the pause on each stop while playing (D-105). */
const HOP_MS = 700;
const DWELL_MS = 650;
const LIFECYCLE_RANK = { active: 0, prospect: 1, past: 2 } as const;
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
  /** The phase whose person's drawer is open (people and objects share the one drawer). */
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [phase, setPhase] = useState('');
  const anim = useRef(0);
  /** True once the person moved the camera; until then the desk stays fitted to the stage. */
  const touched = useRef(false);
  const commitTimer = useRef(0);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const navigate = useNavigate();
  const data = useData();
  const { can, switchUser } = useSession();
  /** The followed project (light layer, D-105), the trail's current stop and whether it is playing. */
  const [follow, setFollow] = useState<string | null>(null);
  const [trailIdx, setTrailIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const refitNext = useRef(false);

  const { rows: projects } = useTable('projects');
  const projectOptions = useMemo(
    () => [...projects].sort((a, b) => LIFECYCLE_RANK[lifecycleOf(a.pipelineStatus)] - LIFECYCLE_RANK[lifecycleOf(b.pipelineStatus)] || b.updated_at.localeCompare(a.updated_at) || a.name.localeCompare(b.name)),
    [projects],
  );
  const project = follow ? projects.find((p) => p.id === follow) : undefined;
  const flow = useProjectFlow(project ? project.id : null);
  const flowCtx = useMemo<FlowCtx | null>(() => {
    if (!project) return null;
    const suppliers = new Map(flow.suppliers.map((x) => [x.id, x.name]));
    return {
      project,
      current: phaseOfStatus(project.pipelineStatus),
      supplierName: (id) => (id ? suppliers.get(id) ?? id : '—'),
      personName: (id) => (id ? demoUserById(id)?.name.split(' ')[0] ?? id : '—'),
    };
  }, [project, flow.suppliers]);
  const lights = useMemo(() => (flowCtx ? buildLights(flow.rows, flowCtx) : []), [flow.rows, flowCtx]);
  const trail = useMemo(() => (flowCtx ? buildTrail(flow.rows, flow.activity, flowCtx, lights) : []), [flow.rows, flow.activity, flowCtx, lights]);
  const money = useMemo(() => moneyOf(flow.rows), [flow.rows]);
  const comms = useMemo(() => commsOf(flow.rows, project?.clientUserId ?? null), [flow.rows, project?.clientUserId]);
  const trailRef = useRef(trail);
  trailRef.current = trail;

  const baseItems = useMemo(() => buildItems(), []);
  const items = useMemo(() => (lights.length ? [...baseItems, ...lights] : baseItems), [baseItems, lights]);
  const people = useMemo(() => buildPeople(), []);
  const personByPhase = useMemo(() => new Map(people.map((p) => [p.phase as string, p])), [people]);
  const peoplePhases = useMemo(() => new Set(people.map((p) => p.phase as string)), [people]);
  // Mats per row from the stage's shape, so fit-to-screen stays readable: 5 landscape, 3 squarish, 2 tall phones.
  const aspect = size.w > 0 && size.h > 0 ? size.w / size.h : 2;
  const perRow = aspect < 0.7 ? 2 : aspect < 1.25 ? 3 : 5;
  const layout = useMemo(() => layoutDesk(items, perRow, peoplePhases), [items, perRow, peoplePhases]);
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

  /** Flies to a person's station: 'open' shows it beside the drawer at a zoom where the nameplate reads. */
  const flyToPerson = useCallback((phaseId: string, mode: 'focus' | 'open') => {
    const m = layoutRef.current.mats.find((x) => x.id === phaseId);
    if (!m?.person) return undefined;
    const { w, h } = sizeRef.current;
    const readable = clampZ(Math.min((0.5 * Math.max(200, h)) / m.person.h, (0.4 * Math.max(200, w)) / m.person.w));
    const z = mode === 'open' ? readable : cam.current.z < readable * 0.35 ? readable * 0.6 : cam.current.z;
    let cx = m.x + m.person.x + m.person.w / 2;
    let cy = m.y + m.person.y + m.person.h / 2;
    if (mode === 'open') {
      if (w >= 768) cx += Math.min(w / 4, 224) / z;
      else cy += (h / 4) / z;
    }
    flyTo({ cx, cy, z });
    return m;
  }, [flyTo]);

  const reset = useCallback(() => {
    tiltRef.current = true;
    setTilt(true);
    setSelected(null);
    setSelectedPerson(null);
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
    setSelectedPerson(null);
    setSelected(id);
    flyToItem(item, 'open');
  }, [flyToItem]);

  const openPerson = useCallback((phaseId: string) => {
    const m = flyToPerson(phaseId, 'open');
    if (!m) return undefined;
    setSelected(null);
    setSelectedPerson(phaseId);
    return m;
  }, [flyToPerson]);

  const onFocusPerson = useCallback((phaseId: string, e: FocusEvent<HTMLButtonElement>) => {
    if (e.currentTarget.matches(':focus-visible')) flyToPerson(phaseId, 'focus');
  }, [flyToPerson]);

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

  // Following or clearing a project reflows the mats (its sub-mats, the money strip): fly to the whole desk once;
  // later reflows (a row added in another tab) keep the camera unless it was never moved.
  useEffect(() => {
    if (sizeRef.current.w === 0) return;
    if (refitNext.current) {
      refitNext.current = false;
      fitAll();
    } else if (!touched.current) fitAll(0);
  }, [layout.width, layout.height, fitAll]);

  // The stage takes the rest of the viewport under the toolbar (the bottom nav on phones is reserved in CSS).
  // With a project followed, the trail caption sits above the stage and the money rail on its near edge: both are
  // measured so the stage still ends at the bottom of the viewport.
  const [stageTop, setStageTop] = useState(0);
  const railRef = useRef<HTMLElement>(null);
  const [railH, setRailH] = useState(0);
  const following = Boolean(project);
  useLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (stage) setStageTop(Math.round(stage.getBoundingClientRect().top + window.scrollY));
      setRailH(railRef.current ? Math.round(railRef.current.getBoundingClientRect().height) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (railRef.current) ro.observe(railRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [following]);

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
    // The trail (D-105): Space plays / pauses when the stage itself has focus (inside it Space activates the object), [ and ] step.
    if (project && ((e.key === ' ' && e.target === e.currentTarget) || e.key === '[' || e.key === ']')) {
      e.preventDefault();
      if (e.key === ' ') togglePlay();
      else stepTrail(e.key === '[' ? -1 : 1);
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

  // ---------------------------------------------------------------- labels and actions

  const kindLabel = (k: string) => t(`desk.kind.${k}`);
  const phaseName = (m: Mat) => `${String(m.index + 1).padStart(2, '0')} ${pick(m.label, lang)}`;
  const itemLabel = (i: DeskItem) =>
    i.kind === 'light' && project
      ? t('desk.light.label', { kind: i.subtitle ? pick(i.subtitle, lang) : kindLabel(i.kind), title: pick(i.title, lang), project: project.name, facts: i.lines.map((l) => pick(l, lang)).join(', ') })
      : `${kindLabel(i.kind)}: ${pick(i.title, lang)}${i.code ? ` (${i.code})` : ''}`;
  const subLabel = (group: string) => (project && group === 'project' ? shortName(project.name) : project && group === 'projectComms' ? t('desk.group.projectComms', { name: shortName(project.name) }) : t(`desk.group.${group}`));
  const moreLabel = useCallback((n: number) => t('desk.more', { n }), [t]);
  const roleName = (p: DeskPerson) => pick(p.role.playbookRole, lang);
  const personLabel = (p: DeskPerson, m: Mat) => t('desk.person.label', { role: roleName(p), name: p.firstName ? ` (${p.firstName})` : '', phase: phaseName(m) });
  /** The portal a role works in, in the page language, or in English for the action answers (like `desk.openItem`). */
  const portalOf = useCallback(
    (p: DeskPerson, en = false) => {
      if (!p.portal) return en ? 'no portal role yet' : t('desk.person.noPortalRole');
      const entry = coreStrings[p.portal.portalKey];
      const name = en ? (typeof entry === 'string' ? entry : entry?.en ?? p.portal.portalKey) : t(p.portal.portalKey);
      return `${name} (#${p.portal.path})`;
    },
    [t],
  );
  /** The route that serves a path: the exact path first, then the patterns (`/studio/checklist/:projectId`). */
  const routeOf = useCallback((path: string): RouteDef | undefined => routes.find((x) => x.path === path) ?? routes.find((x) => x.path.includes(':') && matchPath({ path: x.path, end: true }, path)), [routes]);
  const whereOf = useCallback(
    (i: DeskItem) => {
      const r = routeOf(i.openAt.path);
      return r ? `${r.code} ${r.spec.name} (#${i.openAt.path})` : `#${i.openAt.path}`;
    },
    [routeOf],
  );

  /**
   * Opens a hub page for real (Part 1 of changelog 0035). When the current role lacks the route's permission, the
   * session switches to the demo user of the route's surface first, with the D-07 canvas toast (D-015).
   */
  const openPath = useCallback(
    (path: string) => {
      const route = routeOf(path);
      if (route?.permission && !can(route.permission)) {
        const own = roleForSurface(route.surface);
        const role = own && hasPermission(own, route.permission) ? own : rolesWith(route.permission)[0] ?? 'founder';
        switchUser(role);
        toast(t('desk.enterAs', { code: route.code, role: demoUserForRole(role)?.name ?? role }));
      }
      navigate(path);
      return route ? `opened ${route.code} (#${path})` : `opened #${path}`;
    },
    [routeOf, can, switchUser, navigate, t],
  );

  // ---------------------------------------------------------------- the light layer: follow, trail (D-105)

  const followProject = useCallback((id: string | null) => {
    setPlaying(false);
    setTrailIdx(-1);
    setSelected(null);
    setSelectedPerson(null);
    refitNext.current = true;
    setFollow(id);
  }, []);

  const trailIdxRef = useRef(trailIdx);
  trailIdxRef.current = trailIdx;
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const stepTrail = useCallback((dir: 1 | -1) => {
    const n = trailRef.current.length;
    if (n === 0) return -1;
    const i = trailIdxRef.current;
    const next = Math.max(0, Math.min(n - 1, i < 0 ? (dir === 1 ? 0 : n - 1) : i + dir));
    trailIdxRef.current = next;
    setTrailIdx(next);
    return next;
  }, []);

  const togglePlay = useCallback((force?: boolean) => {
    const n = trailRef.current.length;
    if (n === 0) return false;
    const now = force ?? !playingRef.current;
    playingRef.current = now;
    setPlaying(now);
    // Play from the start when the trail is over (or not started).
    const i = trailIdxRef.current;
    if (now && (i < 0 || i >= n - 1)) {
      trailIdxRef.current = 0;
      setTrailIdx(0);
    }
    return now;
  }, []);

  // Playing: one stop per hop + dwell; stops at the end. The pulse's travel is a CSS transform transition (700 ms).
  useEffect(() => {
    if (!playing) return;
    if (trailIdx >= trail.length - 1) {
      const done = window.setTimeout(() => setPlaying(false), HOP_MS);
      return () => window.clearTimeout(done);
    }
    const timer = window.setTimeout(() => setTrailIdx((i) => Math.min(trail.length - 1, i + 1)), reduced ? DWELL_MS + 300 : HOP_MS + DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, trailIdx, trail.length, reduced]);

  // A trail that shrank (a row removed elsewhere) keeps a valid stop.
  useEffect(() => {
    if (trailIdx > trail.length - 1) setTrailIdx(trail.length - 1);
  }, [trail.length, trailIdx]);

  const findProject = useCallback(
    (q: string) => {
      const needle = q.trim().toLowerCase();
      if (!needle) return undefined;
      return projects.find((p) => p.id.toLowerCase() === needle) ?? projects.find((p) => p.name.toLowerCase() === needle) ?? projects.find((p) => p.name.toLowerCase().includes(needle) || p.client.toLowerCase().includes(needle));
    },
    [projects],
  );
  const eventText = useCallback((i: number) => {
    const e = trailRef.current[i];
    return e ? `event ${i + 1}/${trailRef.current.length} (${e.at.slice(0, 10)}, ${e.phase}): ${e.caption.en}` : 'no event';
  }, []);

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
    'desk.focusPerson': ({ phase: q }) => {
      const id = findPhase(String(q ?? ''));
      const p = id && personByPhase.get(id);
      const m = p && openPerson(p.phase);
      if (!p || !m) return `no person on "${String(q ?? '')}" (1-10 or ${[...personByPhase.keys()].join(', ')})`;
      return `showing the ${p.role.playbookRole.en}${p.firstName ? ` (${p.firstName})` : ''} at the ${m.label.en} mat${p.inferred ? ' (inferred owner)' : ''}`;
    },
    'desk.openPersonPortal': ({ phase: q }) => {
      const id = findPhase(String(q ?? ''));
      const p = id && personByPhase.get(id);
      if (!p) return `no person on "${String(q ?? '')}"`;
      if (!p.portal) return `the ${p.role.playbookRole.en} has no portal role yet`;
      return openPath(p.portal.path);
    },
    'desk.openItem': ({ item: q }) => {
      const found = findItem(layoutRef.current.items, String(q ?? ''));
      if (!found) return `no object "${String(q ?? '')}" on the desk`;
      return openPath(found.openAt.path);
    },
    'desk.followProject': ({ project: q }) => {
      const p = findProject(String(q ?? ''));
      if (!p) return `no project "${String(q ?? '')}" (ids: ${projectOptions.slice(0, 6).map((x) => x.id).join(', ')}…)`;
      followProject(p.id);
      return `following ${p.name} (${p.id}): status ${pipelineLabel(p.pipelineStatus).en} on the ${phaseOfStatus(p.pipelineStatus)} mat`;
    },
    'desk.clearProject': () => {
      if (!project) return 'no project followed';
      followProject(null);
      return `stopped following ${project.name}`;
    },
    'desk.playTrail': () => {
      if (!project) return 'follow a project first (desk.followProject)';
      if (!trailRef.current.length) return `no events for ${project.name}`;
      togglePlay(true);
      return `playing the trail of ${project.name} (${trailRef.current.length} events)`;
    },
    'desk.pauseTrail': () => {
      if (!project) return 'no project followed';
      togglePlay(false);
      return `trail paused at ${eventText(trailIdx)}`;
    },
    'desk.stepTrail': ({ dir }) => {
      if (!project) return 'follow a project first (desk.followProject)';
      if (dir !== 'prev' && dir !== 'next') return `dir must be prev or next, not "${String(dir)}"`;
      togglePlay(false);
      return eventText(stepTrail(dir === 'prev' ? -1 : 1));
    },
    'desk.openRow': async ({ entity, id }) => {
      const name = String(entity ?? '') as FlowEntity;
      if (!(FLOW_ENTITIES as readonly string[]).includes(name)) return `no page for "${String(entity)}" (one of ${FLOW_ENTITIES.join(', ')})`;
      const row = (await data.get(name as EntityName, String(id ?? ''))) as { projectId?: string | null } | null;
      if (!row) return `no ${name} row "${String(id)}"`;
      return openPath(FLOW_RULES[name].openAt.replace(':projectId', row.projectId ?? project?.id ?? ''));
    },
  });

  const selectedItem = selected ? byId.get(selected) : undefined;
  /** The row behind a selected light tile (live: the drawer follows writes from other tabs). */
  const selectedRow = selectedItem?.ref ? (flow.rows[selectedItem.ref.entity as FlowEntity] as { id: string }[] | undefined)?.find((r) => r.id === selectedItem.ref?.id) : undefined;
  const currentPhase = project ? phaseOfStatus(project.pipelineStatus) : null;
  const currentIndex = currentPhase ? layout.mats.findIndex((m) => m.id === currentPhase) : -1;
  const glowToken = project ? `tok-pipeline-${project.pipelineStatus}` : null;
  const stop = trailIdx >= 0 ? trail[trailIdx] : undefined;
  /** Where the pulse is: the centre of the stop's object (world px), or of its mat when the object is not on the desk. */
  const pulseAt = useMemo(() => {
    if (!stop) return null;
    const it = byId.get(stop.target);
    if (it) return { x: it.x + it.cw / 2, y: it.y + it.ch / 2 };
    const m = layout.mats.find((x) => x.id === stop.phase);
    return m ? { x: m.x + m.w / 2, y: m.y + m.h / 2 } : null;
  }, [stop, byId, layout.mats]);
  const resolveField = (key: string, value: unknown): string | undefined => {
    if (typeof value !== 'string' || !flowCtx) return undefined;
    if (key === 'supplierId') return flowCtx.supplierName(value);
    if (/^(author|responsible|requestedBy|owner|actor|leadDesigner|clientUser)Id$/.test(key)) return flowCtx.personName(value);
    if (key === 'projectId') return project?.name;
    return undefined;
  };
  const lightDrawer = (i: PlacedItem) => {
    const entity = i.ref?.entity as FlowEntity | undefined;
    const rule = entity ? FLOW_RULES[entity] : undefined;
    const m = matById(i.phase);
    const fields = selectedRow ? rowFields(selectedRow as unknown as Record<string, unknown>, lang).map((f) => ({ key: f.key, value: resolveField(f.field, (selectedRow as unknown as Record<string, unknown>)[f.field]) ?? f.value })) : [];
    const route = routeOf(i.openAt.path);
    return (
      <div className="desk-drawer">
        {preview(i)}
        <KeyValue
          columns={1}
          items={[
            { key: t('desk.drawer.entity'), value: rule ? pick(rule.label, lang) : entity ?? '' },
            { key: t('desk.drawer.project'), value: project?.name ?? '' },
            { key: t('desk.drawer.phase'), value: m ? phaseName(m) : i.phase },
            { key: t('desk.drawer.page'), value: route ? `${route.code} ${route.spec.name}` : `#${i.openAt.path}` },
          ]}
        />
        {rule && (
          <>
            <h3 className="desk-drawer__h">{t('desk.drawer.rule')}</h3>
            <p className="desk-drawer__why">{pick(rule.rationale, lang)}</p>
          </>
        )}
        <h3 className="desk-drawer__h">{t('desk.drawer.fields', { n: fields.length })}</h3>
        {selectedRow ? <KeyValue columns={1} items={fields} /> : <p className="desk-drawer__why">{t('desk.drawer.gone')}</p>}
      </div>
    );
  };
  const selectedPersonData = selectedPerson ? personByPhase.get(selectedPerson) : undefined;
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

  /** The person's drawer: portrait, role facts, responsibilities, why this phase, and every phase the role owns. */
  const personDrawer = (p: DeskPerson) => {
    const owned = people.filter((x) => x.role.id === p.role.id);
    const m = matById(p.phase);
    return (
      <div className="desk-drawer">
        <PersonPortrait person={p} lang={lang} />
        <KeyValue
          columns={1}
          items={[
            { key: t('desk.person.role'), value: roleName(p) },
            { key: t('desk.person.portalRole'), value: p.roleId ? t(`core.role.${p.roleId}`) : t('desk.person.noPortalRole') },
            ...(p.firstName ? [{ key: t('desk.person.person'), value: p.firstName }] : []),
            { key: t('desk.drawer.phase'), value: m ? phaseName(m) : p.phase },
            { key: t('desk.person.basis'), value: t(`desk.person.basis.${p.basis}`) },
          ]}
        />
        <h3 className="desk-drawer__h">{t('desk.person.why')}</h3>
        <p className="desk-drawer__why">{pick(p.rationale, lang)}</p>
        <h3 className="desk-drawer__h">{t('desk.person.responsibilities')}</h3>
        <p className="desk-drawer__why">{pick(p.role.note, lang)}</p>
        <h3 className="desk-drawer__h">{t('desk.person.phases', { n: owned.length })}</h3>
        <ol className="desk-drawer__list">
          {owned.map((x) => {
            const xm = matById(x.phase);
            return (
              <li key={x.phase}>
                {xm ? phaseName(xm) : x.phase}
                {x.inferred ? ` (${t('desk.person.inferred')})` : ''}
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  const home = `/${surface}`;
  return (
    <div className="desk-page">
      <PageHeader
        code={DESK_CODE}
        title={t('desk.title')}
        subtitle={t('desk.subtitle', { items: layout.items.length - lights.length, people: layout.mats.filter((m) => m.person).length, mats: layout.mats.length })}
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

      <div className="desk-toolbar desk-toolbar--light" role="toolbar" aria-label={t('desk.lightToolbar')}>
        <Select
          label={t('desk.followLabel')}
          hideLabel
          className="desk-toolbar__project"
          value={follow ?? ''}
          placeholder={t('desk.follow')}
          onChange={(e) => followProject(e.target.value || null)}
          options={projectOptions.map((p) => ({ value: p.id, label: t('desk.followOption', { name: p.name, status: pick(pipelineLabel(p.pipelineStatus), lang) }) }))}
        />
        {project && (
          <>
            <Button size="sm" variant="ghost" onClick={() => followProject(null)}>
              {t('desk.clear')}
            </Button>
            <span className="desk-toolbar__trail">
              <Button size="sm" icon="‹" aria-label={t('desk.prev')} disabled={trail.length === 0} onClick={() => (togglePlay(false), stepTrail(-1))} />
              <Button size="sm" variant="primary" aria-pressed={playing} disabled={trail.length === 0} onClick={() => togglePlay()}>
                {playing ? t('desk.pause') : t('desk.play')}
              </Button>
              <Button size="sm" icon="›" aria-label={t('desk.next')} disabled={trail.length === 0} onClick={() => (togglePlay(false), stepTrail(1))} />
            </span>
          </>
        )}
      </div>
      {project && (
        <p className="desk-trail" aria-live="polite">
          {stop
            ? t('desk.trail.step', { i: trailIdx + 1, n: trail.length, date: formatDate(stop.at, lang), phase: (() => { const m = matById(stop.phase); return m ? phaseName(m) : stop.phase; })(), caption: pick(stop.caption, lang) })
            : trail.length
              ? t('desk.trail.idle', { n: trail.length, name: project.name, lights: lights.length })
              : t('desk.trail.empty', { name: project.name })}
        </p>
      )}

      <div
        ref={stageRef}
        className={`desk-stage${tilt ? ' is-tilted' : ''}${project ? ' has-rail' : ''}`}
        tabIndex={0}
        role="region"
        aria-roledescription={t('desk.roledescription')}
        aria-label={t('desk.stage')}
        aria-describedby="desk-hint"
        style={{ perspective: `${Math.max(900, 1.6 * Math.max(size.w, size.h))}px`, height: `calc(100dvh - ${stageTop}px - ${railH}px - var(--desk-bottom))` }}
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
              <section
                key={m.id}
                className={`desk-mat${currentIndex >= 0 ? (m.index === currentIndex ? ' is-now' : m.index < currentIndex ? ' is-done' : '') : ''}`}
                style={{ left: m.x, top: m.y, width: m.w, height: m.h }}
                aria-label={phaseName(m)}
                data-desk-mat={m.id}
              >
                <button type="button" className="desk-mat__label" onClick={() => fitMat(m.id)} aria-label={t('desk.matLabel', { name: phaseName(m), n: m.count })}>
                  <span className="desk-mat__num">{String(m.index + 1).padStart(2, '0')}</span>
                  <span className="desk-mat__name">{pick(m.label, lang)}</span>
                  <span className="desk-mat__count">{m.lights ? t('desk.objectsLights', { n: m.count, l: m.lights }) : t('desk.objects', { n: m.count })}</span>
                </button>
                {m.subs.map((s) => (
                  <div key={s.id} className={`desk-sub desk-sub--${s.group}`} data-desk-sub={s.id} style={{ left: s.x, top: s.y, width: s.w, height: s.h }}>
                    <span className="desk-sub__label">{subLabel(s.group)}</span>
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
                        glow={glowToken === it.id}
                        lit={stop?.target === it.id}
                      />
                    ))}
                  </div>
                ))}
                {m.person && personByPhase.get(m.id) && (
                  <DeskPersonStation
                    person={personByPhase.get(m.id)!}
                    left={m.person.x}
                    top={m.person.y}
                    lang={lang}
                    label={personLabel(personByPhase.get(m.id)!, m)}
                    selected={selectedPerson === m.id}
                    onActivate={openPerson}
                    onFocusPerson={onFocusPerson}
                  />
                )}
              </section>
            ))}
            {project && pulseAt && <span className="desk-pulse" aria-hidden="true" style={{ transform: `translate3d(${pulseAt.x}px, ${pulseAt.y}px, 24px)` }} />}
            </div>
          </div>
        </div>
      </div>

      {project && (
        <section ref={railRef} className={`desk-strip${tilt ? ' is-tilted' : ''}`} aria-label={t('desk.strip.label', { name: project.name })} data-desk-strip="">
          <div className="desk-strip__cell desk-strip__cell--name">
            <span className="desk-strip__k">{t('desk.strip.following')}</span>
            <span className="desk-strip__v">{project.name}</span>
            <span className="desk-strip__s">{t('desk.strip.status', { status: pick(pipelineLabel(project.pipelineStatus), lang), phase: currentIndex >= 0 ? phaseName(layout.mats[currentIndex]) : '' })}</span>
          </div>
          <div className="desk-strip__cell">
            <span className="desk-strip__k">{t('desk.money.quoted')}</span>
            <span className="desk-strip__v">{formatCop(money.quoted, lang)}</span>
            <span className="desk-strip__s">{t('desk.money.quotedSub', { n: flow.rows.quotes.length, g: new Set(flow.rows.quotes.map((q) => q.comparisonGroup)).size })}</span>
          </div>
          <div className="desk-strip__cell">
            <span className="desk-strip__k">{t('desk.money.approved')}</span>
            <span className="desk-strip__v">{formatCop(money.approved, lang)}</span>
            <span className="desk-strip__s">{t('desk.money.approvedSub', { p: flow.rows.purchases.filter((x) => x.status !== 'quoted').length, c: flow.rows.changeOrders.filter((x) => x.status === 'approved' || x.status === 'executed').length })}</span>
          </div>
          <div className="desk-strip__cell">
            <span className="desk-strip__k">{t('desk.money.paid')}</span>
            <span className="desk-strip__v">{formatCop(money.paid, lang)}</span>
            <span className="desk-strip__s">{t('desk.money.split', { in: formatCop(money.paidIn, lang), out: formatCop(money.paidOut, lang) })}</span>
          </div>
          <div className="desk-strip__cell">
            <span className="desk-strip__k">{t('desk.money.outstanding')}</span>
            <span className="desk-strip__v">{formatCop(money.outstanding, lang)}</span>
            <span className="desk-strip__s">{t('desk.money.split', { in: formatCop(money.outstandingIn, lang), out: formatCop(money.outstandingOut, lang) })}</span>
          </div>
          <div className="desk-strip__cell desk-strip__cell--comms">
            <span className="desk-strip__k">{t('desk.comms.title')}</span>
            <span className="desk-strip__v">{t(comms.messages === 1 ? 'desk.comms.messages.one' : 'desk.comms.messages', { n: comms.messages })}</span>
            <span className="desk-strip__s">
              {t('desk.comms.sub', { c: comms.fromClient, t: comms.fromTeam, m: comms.meetings })}
              {comms.leadChannels.length > 0 && t('desk.comms.lead', { ch: comms.leadChannels.map((c) => pick(c, lang)).join(', ') })}
            </span>
          </div>
        </section>
      )}
      <p className="desk-hint" id="desk-hint">
        {t('desk.hint')}
      </p>

      <Drawer
        open={Boolean(selectedItem ?? selectedPersonData)}
        onClose={() => {
          setSelected(null);
          setSelectedPerson(null);
        }}
        side={drawerSide}
        title={selectedItem ? pick(selectedItem.title, lang) : selectedPersonData ? roleName(selectedPersonData) : ''}
        footer={
          selectedPersonData && !selectedItem ? (
            selectedPersonData.portal && (
              <Button variant="primary" icon="↗" title={t('desk.person.openPortalWhat', { where: portalOf(selectedPersonData) })} onClick={() => selectedPersonData.portal && openPath(selectedPersonData.portal.path)}>
                {t('desk.person.openPortal')}
              </Button>
            )
          ) : (
            selectedItem && (
              <Button variant="primary" icon="↗" title={t('desk.drawer.openWhat', { where: whereOf(selectedItem) })} onClick={() => openPath(selectedItem.openAt.path)}>
                {t('desk.drawer.open')}
              </Button>
            )
          )
        }
      >
        {selectedPersonData && !selectedItem && personDrawer(selectedPersonData)}
        {selectedItem?.kind === 'light' && lightDrawer(selectedItem)}
        {selectedItem && selectedItem.kind !== 'light' && (
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

