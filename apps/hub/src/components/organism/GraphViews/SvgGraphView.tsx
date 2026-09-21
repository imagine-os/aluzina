import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react';
import { boundsOf, hopsFrom, neighbourMap, type Bounds, type Point } from './layouts';
import { NodeLayer } from './NodeLayer';
import { NodeTile } from './NodeTile';
import type { GraphViewHandle, GraphViewProps, ViewEdge } from './types';

const SCALES = [0.2, 0.28, 0.4, 0.55, 0.75, 1, 1.35, 1.8, 2.4, 3];
/** Fit never goes below this: smaller and the labels stop being readable. */
const MIN_FIT = 0.38;

export interface SvgGraphViewProps extends GraphViewProps {
  /** World positions from the layout. */
  positions: Map<string, Point>;
  /** World bounds the "fit" button frames; defaults to the node bounds. */
  bounds?: Bounds;
  /** Painted behind the edges (lane bands, rings, cluster frames). */
  behind?: ReactNode;
  /** Path of one edge between two placed nodes. */
  edgePath: (a: Point, b: Point, edge: ViewEdge) => string;
  /** Extra class on the region, for per-view CSS. */
  view: string;
  /** Labels are drawn under the tile unless the view packs them tightly. */
  compactTiles?: boolean;
}

/**
 * Shared scaffolding of the three 2D gallery views: a viewBox viewport driven by the page's − / + / fit /
 * reset buttons (pointer pan and pinch are extras, never the only way, P-03), the painted SVG, and the
 * `NodeLayer` overlay that owns every tab stop, tap target and tooltip.
 */
export const SvgGraphView = forwardRef<GraphViewHandle, SvgGraphViewProps>(function SvgGraphView(
  { nodes, edges, positions, bounds, behind, edgePath, view, compactTiles, focusKey, onFocus, onOpen, label, labels },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 560 });
  const [scale, setScale] = useState(1);
  const [centre, setCentre] = useState<Point>({ x: 0, y: 0 });
  const [active, setActive] = useState<string | null>(null);
  const box = useMemo(() => bounds ?? boundsOf(positions), [bounds, positions]);
  const hops = useMemo(() => hopsFrom(nodes, edges, focusKey), [nodes, edges, focusKey]);
  const neighbours = useMemo(() => neighbourMap(nodes, edges), [nodes, edges]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setSize({ w: el.clientWidth || 900, h: el.clientHeight || 560 }));
    obs.observe(el);
    setSize({ w: el.clientWidth || 900, h: el.clientHeight || 560 });
    return () => obs.disconnect();
  }, []);

  /** Keep the viewport inside the drawing, so panning and fitting never wander into empty space. */
  const clampCentre = useCallback(
    (p: Point, s: number): Point => {
      const vwv = size.w / s;
      const vhv = size.h / s;
      const bw = box.maxX - box.minX;
      const bh = box.maxY - box.minY;
      return {
        x: vwv >= bw ? (box.minX + box.maxX) / 2 : Math.min(box.maxX - vwv / 2, Math.max(box.minX + vwv / 2, p.x)),
        y: vhv >= bh ? (box.minY + box.maxY) / 2 : Math.min(box.maxY - vhv / 2, Math.max(box.minY + vhv / 2, p.y)),
      };
    },
    [box, size.w, size.h],
  );

  const fit = useCallback(() => {
    const bw = Math.max(1, box.maxX - box.minX);
    const bh = Math.max(1, box.maxY - box.minY);
    const raw = Math.min(size.w / bw, size.h / bh);
    // A "fit" that makes the labels unreadable is not a fit (P-01): below 38 % the view keeps that scale
    // and starts on the focus node instead, and the buttons / pan reach the rest.
    const clamped = Math.min(1.4, Math.max(MIN_FIT, Math.round(raw * 100) / 100));
    setScale(clamped);
    const focusPos = focusKey ? positions.get(focusKey) : undefined;
    setCentre(clampCentre(raw < MIN_FIT && focusPos ? focusPos : { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 }, clamped));
  }, [box, size.w, size.h, focusKey, positions, clampCentre]);

  // Frame the drawing once per layout change (the tables load after the first render).
  const fitKey = `${nodes.length}:${view}:${focusKey ?? ''}:${Math.round(box.maxX)}x${Math.round(box.maxY)}:${size.w}x${size.h}`;
  const fittedFor = useRef('');
  useEffect(() => {
    if (!nodes.length || fittedFor.current === fitKey) return;
    fittedFor.current = fitKey;
    fit();
  }, [fitKey, fit, nodes.length]);

  const step = useCallback((dir: 1 | -1) => {
    setScale((s) => {
      const i = SCALES.findIndex((x) => x >= s - 0.001);
      return SCALES[Math.min(SCALES.length - 1, Math.max(0, (i === -1 ? SCALES.length - 1 : i) + dir))];
    });
  }, []);

  const centreOn = useCallback(
    (key: string) => {
      const p = positions.get(key);
      if (p) setCentre((c) => clampCentre({ x: p.x, y: p.y }, scale) ?? c);
    },
    [positions, clampCentre, scale],
  );

  useImperativeHandle(ref, () => ({
    zoomIn: () => step(1),
    zoomOut: () => step(-1),
    fit,
    reset: () => {
      setActive(null);
      fit();
    },
    centreOn,
  }), [step, fit, centreOn]);

  const vw = size.w / scale;
  const vh = size.h / scale;
  const vx = centre.x - vw / 2;
  const vy = centre.y - vh / 2;
  const screen = useMemo(() => {
    const m = new Map<string, Point>();
    for (const [k, p] of positions) m.set(k, { x: (p.x - vx) * scale, y: (p.y - vy) * scale });
    return m;
  }, [positions, vx, vy, scale]);

  // Pointer pan and two-finger pinch; the buttons do the same job without a pointer.
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  return (
    <div className={`gview gview--${view}`} ref={wrapRef} role="region" aria-label={label} aria-describedby={`gview-help-${view}`}>
      <p id={`gview-help-${view}`} className="visually-hidden">{labels.help}</p>
      <svg
        className="gview__svg"
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        width={size.w}
        height={size.h}
        role="presentation"
        onPointerDown={(e) => {
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.current.size === 1) drag.current = { x: e.clientX, y: e.clientY, cx: centre.x, cy: centre.y };
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale };
            drag.current = null;
          }
        }}
        onPointerMove={(e) => {
          if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pinch.current && pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
            setScale(Math.min(3, Math.max(0.12, (pinch.current.scale * d) / pinch.current.dist)));
            return;
          }
          if (!drag.current) return;
          setCentre(clampCentre({ x: drag.current.cx - (e.clientX - drag.current.x) / scale, y: drag.current.cy - (e.clientY - drag.current.y) / scale }, scale));
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          if (pointers.current.size < 2) pinch.current = null;
          if (!pointers.current.size) drag.current = null;
        }}
        onPointerCancel={() => {
          pointers.current.clear();
          drag.current = null;
          pinch.current = null;
        }}
      >
        <defs>
          <marker id={`gv-arrow-${view}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="gview__arrowhead" />
          </marker>
        </defs>
        <g className="gview__behind">{behind}</g>
        <g className="gview__edges">
          {edges.map((e, i) => {
            const a = positions.get(e.from);
            const b = positions.get(e.to);
            if (!a || !b) return null;
            const hot = active === e.from || active === e.to;
            const kind = e.kind === 'child' || e.kind === 'filed' ? e.kind : 'relation';
            return (
              <path
                key={`${e.from}-${e.to}-${e.kind}-${i}`}
                className={`gview__edge gview__edge--${kind}${hot ? ' gview__edge--hot' : ''}`}
                d={edgePath(a, b, e)}
                markerEnd={kind === 'relation' ? `url(#gv-arrow-${view})` : undefined}
              />
            );
          })}
        </g>
        <g className="gview__nodes">
          {nodes.map((n) => {
            const p = positions.get(n.key);
            if (!p) return null;
            return <NodeTile key={n.key} node={n} x={p.x} y={p.y} active={active === n.key} isFocus={n.key === focusKey} noPreview={labels.noPreview} compact={compactTiles} />;
          })}
        </g>
      </svg>
      <NodeLayer
        nodes={nodes}
        positions={screen}
        neighbours={neighbours}
        hops={hops}
        focusKey={focusKey}
        active={active}
        onActive={setActive}
        onFocus={onFocus}
        onOpen={onOpen}
        onCentre={centreOn}
        labels={labels}
      />
    </div>
  );
});
