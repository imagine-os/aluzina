import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { cx } from '../../../design/cx';
import { useT } from '../../../i18n/I18nProvider';
import './RelationGraph.css';

export interface GraphNode {
  /** `<type>:<id>`; stable across renders. */
  key: string;
  label: string;
  /** Tone class: a space kind (area, topic, role, client, deliverable, tool, project, archive), `post` or `other`. */
  kind: string;
  size?: 'lg' | 'md' | 'sm';
  /** Secondary line under the label (e.g. the entity type). */
  sub?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  /** `child` (space tree), `filed` (post in space) or a relation kind. */
  kind: string;
}

export interface RelationGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Node the layout is centred on and the keyboard's Home target. */
  focusKey: string | null;
  /** Space on a node: make it the focus node (the page re-queries depth around it). */
  onFocus: (key: string) => void;
  /** Enter / click on a node: open it. */
  onOpen: (key: string) => void;
  /** 0.5 .. 3; the SVG is `1000 * zoom / 16` rem wide and scrolls inside its container. */
  zoom: number;
  label: string;
}

export const GRAPH_W = 1000;
export const GRAPH_H = 700;
const RADIUS = { lg: 18, md: 12, sm: 8 } as const;

interface Pos {
  x: number;
  y: number;
}

/**
 * Deterministic force layout (no library, D-026): radial start by hop distance from the focus node, then
 * 300 iterations of repulsion + springs + gravity. Deterministic so screenshots and tests are stable.
 */
function layout(nodes: GraphNode[], edges: GraphEdge[], focusKey: string | null): Map<string, Pos> {
  const pos = new Map<string, Pos>();
  if (nodes.length === 0) return pos;
  const index = new Map(nodes.map((n, i) => [n.key, i]));
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!index.has(e.from) || !index.has(e.to)) continue;
    adj.set(e.from, [...(adj.get(e.from) ?? []), e.to]);
    adj.set(e.to, [...(adj.get(e.to) ?? []), e.from]);
  }
  // hop distance from focus (or from the first node)
  const root = focusKey && index.has(focusKey) ? focusKey : nodes[0].key;
  const hop = new Map<string, number>([[root, 0]]);
  const queue = [root];
  while (queue.length) {
    const k = queue.shift()!;
    for (const n of adj.get(k) ?? []) if (!hop.has(n)) {
      hop.set(n, (hop.get(k) ?? 0) + 1);
      queue.push(n);
    }
  }
  const maxHop = Math.max(1, ...[...hop.values()]);
  const cx0 = GRAPH_W / 2;
  const cy0 = GRAPH_H / 2;
  const rings = new Map<number, string[]>();
  nodes.forEach((n) => {
    const h = hop.get(n.key) ?? maxHop + 1;
    rings.set(h, [...(rings.get(h) ?? []), n.key]);
  });
  for (const [h, keys] of rings) {
    const r = h === 0 ? 0 : Math.min(GRAPH_H / 2 - 40, 150 + (h - 1) * 130);
    keys.forEach((k, i) => {
      const a = (i / keys.length) * Math.PI * 2 + h * 0.7;
      pos.set(k, { x: cx0 + Math.cos(a) * r, y: cy0 + Math.sin(a) * r });
    });
  }
  const vel = new Map(nodes.map((n) => [n.key, { x: 0, y: 0 }]));
  const restFor = (e: GraphEdge) => (e.kind === 'child' ? 110 : e.kind === 'filed' ? 135 : 150);
  const ITER = 300;
  for (let it = 0; it < ITER; it++) {
    const temp = 1 - it / ITER;
    for (const a of nodes) {
      const pa = pos.get(a.key)!;
      let fx = (cx0 - pa.x) * 0.0012;
      let fy = (cy0 - pa.y) * 0.0012;
      for (const b of nodes) {
        if (a === b) continue;
        const pb = pos.get(b.key)!;
        let dx = pa.x - pb.x;
        let dy = pa.y - pb.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = (index.get(a.key)! - index.get(b.key)!) * 0.1 || 0.1;
          dy = 0.1;
          d2 = dx * dx + dy * dy;
        }
        const f = 9000 / d2;
        const d = Math.sqrt(d2);
        fx += (dx / d) * f;
        fy += (dy / d) * f;
      }
      const v = vel.get(a.key)!;
      v.x = (v.x + fx) * 0.5;
      v.y = (v.y + fy) * 0.5;
    }
    for (const e of edges) {
      const pa = pos.get(e.from);
      const pb = pos.get(e.to);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const f = (d - restFor(e)) * 0.015;
      const va = vel.get(e.from)!;
      const vb = vel.get(e.to)!;
      va.x += (dx / d) * f;
      va.y += (dy / d) * f;
      vb.x -= (dx / d) * f;
      vb.y -= (dy / d) * f;
    }
    for (const n of nodes) {
      const p = pos.get(n.key)!;
      const v = vel.get(n.key)!;
      if (n.key === root) continue; // the focus node stays in the centre
      p.x = Math.min(GRAPH_W - 70, Math.max(70, p.x + v.x * temp));
      p.y = Math.min(GRAPH_H - 60, Math.max(45, p.y + v.y * temp));
    }
  }
  return pos;
}

/**
 * SVG graph of spaces, posts and relations (K-04). Nodes are focusable buttons: Enter opens, Space makes the
 * node the focus, ArrowRight / ArrowDown and ArrowLeft / ArrowUp walk its neighbours, Home returns to the
 * focus node. Zoom comes from the page's buttons (never wheel-only); the drawing scrolls inside `.rgraph`.
 */
export function RelationGraph({ nodes, edges, focusKey, onFocus, onOpen, zoom, label }: RelationGraphProps) {
  const { t } = useT();
  const positions = useMemo(() => layout(nodes, edges, focusKey), [nodes, edges, focusKey]);
  const neighbours = useMemo(() => {
    const m = new Map<string, string[]>();
    const labelOf = new Map(nodes.map((n) => [n.key, n.label]));
    for (const e of edges) {
      if (!labelOf.has(e.from) || !labelOf.has(e.to)) continue;
      m.set(e.from, [...(m.get(e.from) ?? []), e.to]);
      m.set(e.to, [...(m.get(e.to) ?? []), e.from]);
    }
    for (const [k, list] of m) m.set(k, [...new Set(list)].sort((a, b) => (labelOf.get(a) ?? '').localeCompare(labelOf.get(b) ?? '')));
    return m;
  }, [nodes, edges]);
  const [kbFocus, setKbFocus] = useState<string | null>(null);
  /** Per node: index of the neighbour the arrows last moved to, so repeated presses cycle. */
  const kbFocusNeighbour = useRef(new Map<string, number>());
  const svgRef = useRef<SVGSVGElement>(null);
  const pending = useRef<string | null>(null);

  useEffect(() => {
    if (!pending.current) return;
    svgRef.current?.querySelector<SVGGElement>(`[data-key="${pending.current}"]`)?.focus();
    pending.current = null;
  });

  const moveTo = (key: string) => {
    setKbFocus(key);
    pending.current = key;
  };

  const onKey = (e: KeyboardEvent<SVGGElement>, key: string) => {
    const nb = neighbours.get(key) ?? [];
    const cur = kbFocusNeighbour.current.get(key) ?? -1;
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onOpen(key);
        break;
      case ' ':
        e.preventDefault();
        onFocus(key);
        break;
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        if (!nb.length) return;
        const next = (cur + 1) % nb.length;
        kbFocusNeighbour.current.set(key, next);
        moveTo(nb[next]);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        if (!nb.length) return;
        const next = (cur - 1 + nb.length) % nb.length;
        kbFocusNeighbour.current.set(key, next);
        moveTo(nb[next]);
        break;
      }
      case 'Home':
        e.preventDefault();
        if (focusKey) moveTo(focusKey);
        break;
    }
  };

  const width = `${(GRAPH_W * zoom) / 16}rem`;
  const height = `${(GRAPH_H * zoom) / 16}rem`;
  const kindOf = new Map(nodes.map((n) => [n.key, n.kind]));

  return (
    <div className="rgraph" tabIndex={0} role="region" aria-label={label} aria-describedby="rgraph-help">
      <p id="rgraph-help" className="visually-hidden">{t('core.spaces.graph.help')}</p>
      <svg ref={svgRef} className="rgraph__svg" viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} style={{ width, height } as CSSProperties} role="group" aria-label={label}>
        <defs>
          <marker id="rg-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="rg-arrow" />
          </marker>
        </defs>
        <g className="rg-edges">
          {edges.map((e, i) => {
            const a = positions.get(e.from);
            const b = positions.get(e.to);
            if (!a || !b) return null;
            const rb = RADIUS[nodes.find((n) => n.key === e.to)?.size ?? 'md'];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const ex = b.x - (dx / d) * (rb + 2);
            const ey = b.y - (dy / d) * (rb + 2);
            const highlighted = kbFocus === e.from || kbFocus === e.to;
            return (
              <line key={`${e.from}-${e.to}-${e.kind}-${i}`} x1={a.x} y1={a.y} x2={ex} y2={ey} className={cx('rg-edge', `rg-edge--${e.kind === 'child' || e.kind === 'filed' ? e.kind : 'relation'}`, highlighted && 'rg-edge--hi')} markerEnd={e.kind === 'child' || e.kind === 'filed' ? undefined : 'url(#rg-arrow)'}>
                <title>{e.kind}</title>
              </line>
            );
          })}
        </g>
        <g className="rg-nodes">
          {nodes.map((n) => {
            const p = positions.get(n.key);
            if (!p) return null;
            const r = RADIUS[n.size ?? 'md'];
            const isFocus = n.key === focusKey;
            const nb = neighbours.get(n.key)?.length ?? 0;
            return (
              <g
                key={n.key}
                data-key={n.key}
                className={cx('rg-node', `rg-node--${kindOf.get(n.key)}`, isFocus && 'rg-node--focus', kbFocus === n.key && 'rg-node--kb')}
                transform={`translate(${p.x} ${p.y})`}
                tabIndex={0}
                role="button"
                aria-label={t('core.spaces.graph.node', { label: n.label, kind: n.sub ?? n.kind, n: nb })}
                onClick={() => onOpen(n.key)}
                onFocus={() => setKbFocus(n.key)}
                onBlur={() => setKbFocus((k) => (k === n.key ? null : k))}
                onKeyDown={(e) => onKey(e, n.key)}
              >
                <circle className="rg-node__hit" r={Math.max(r + 8, 22)} />
                {isFocus && <circle className="rg-node__ring" r={r + 6} />}
                <circle className="rg-node__dot" r={r} />
                <text className="rg-node__label" y={r + 14} textAnchor="middle">{n.label.length > 26 ? `${n.label.slice(0, 25)}…` : n.label}</text>
                {n.sub && (
                  <text className="rg-node__sub" y={r + 27} textAnchor="middle">{n.sub}</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
