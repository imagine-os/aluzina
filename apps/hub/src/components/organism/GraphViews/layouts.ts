import type { ViewEdge, ViewNode } from './types';

/**
 * Layout maths for the four gallery views. Every function is deterministic (same input, same picture) so
 * screenshots and QA runs are stable, and none of them needs a layout library: the techniques come from the
 * imagine-os graph gallery (`demos/lanes-skilltree`, `demos/radial-tree-d3`, `demos/d3-object-map`,
 * `demos/three-objects-3d`, D3 ISC / three.js MIT) and are reimplemented here in plain TypeScript.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Point3 extends Point {
  z: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** The little a graph node needs for the shared helpers (`ViewNode` and `GraphNode` both satisfy it). */
export interface KeyedNode {
  key: string;
  label: string;
}

/** Undirected neighbours of every node, label-sorted so arrow walking is predictable. */
export function neighbourMap(nodes: KeyedNode[], edges: ViewEdge[]): Map<string, string[]> {
  const labelOf = new Map(nodes.map((n) => [n.key, n.label]));
  const m = new Map<string, string[]>();
  for (const e of edges) {
    if (!labelOf.has(e.from) || !labelOf.has(e.to) || e.from === e.to) continue;
    m.set(e.from, [...(m.get(e.from) ?? []), e.to]);
    m.set(e.to, [...(m.get(e.to) ?? []), e.from]);
  }
  for (const [k, list] of m) m.set(k, [...new Set(list)].sort((a, b) => (labelOf.get(a) ?? '').localeCompare(labelOf.get(b) ?? '')));
  return m;
}

/** Hop distance from the focus node (or the first node); unreachable nodes land one ring past the deepest. */
export function hopsFrom(nodes: KeyedNode[], edges: ViewEdge[], focusKey: string | null): Map<string, number> {
  const hop = new Map<string, number>();
  if (!nodes.length) return hop;
  const adj = neighbourMap(nodes, edges);
  const root = focusKey && nodes.some((n) => n.key === focusKey) ? focusKey : nodes[0].key;
  hop.set(root, 0);
  const queue = [root];
  while (queue.length) {
    const k = queue.shift()!;
    for (const n of adj.get(k) ?? []) {
      if (hop.has(n)) continue;
      hop.set(n, (hop.get(k) ?? 0) + 1);
      queue.push(n);
    }
  }
  const max = Math.max(0, ...hop.values());
  for (const n of nodes) if (!hop.has(n.key)) hop.set(n.key, max + 1);
  return hop;
}

/** Lanes in a stable order: the lane of the focus first, then by smallest hop, then by name. */
export function laneOrder(
  nodes: ViewNode[],
  hop: Map<string, number>,
  focusKey: string | null,
  merge?: { max: number; label: string },
): { id: string; label: string; nodes: ViewNode[] }[] {
  const lanes = new Map<string, { id: string; label: string; nodes: ViewNode[] }>();
  for (const n of nodes) {
    const lane = lanes.get(n.lane) ?? { id: n.lane, label: n.laneLabel, nodes: [] };
    lane.nodes.push(n);
    lanes.set(n.lane, lane);
  }
  const focusLane = nodes.find((n) => n.key === focusKey)?.lane;
  const minHop = (l: { nodes: ViewNode[] }) => Math.min(...l.nodes.map((n) => hop.get(n.key) ?? 0));
  const sorted = [...lanes.values()].sort((a, b) => {
    if (a.id === focusLane) return -1;
    if (b.id === focusLane) return 1;
    return minHop(a) - minHop(b) || a.label.localeCompare(b.label);
  });
  if (!merge || sorted.length <= merge.max) return sorted;
  // Too many thin lanes read as a ribbon, so the smallest ones are packed into one lane.
  const ranked = [...sorted].sort((a, b) => (a.id === focusLane ? -1 : b.id === focusLane ? 1 : b.nodes.length - a.nodes.length));
  const keep = new Set(ranked.slice(0, merge.max - 1).map((l) => l.id));
  const rest = sorted.filter((l) => !keep.has(l.id)).flatMap((l) => l.nodes);
  return [...sorted.filter((l) => keep.has(l.id)), { id: '__other', label: merge.label, nodes: rest }];
}

export const TILE = { lg: 68, md: 52, sm: 40 } as const;
export const tileSize = (n: ViewNode) => TILE[n.size ?? 'md'];

// ---- Lanes skill tree (gallery `lanes-skilltree`: one swimlane per group, left -> right by depth) ----

export interface LaneBand {
  id: string;
  label: string;
  top: number;
  bottom: number;
  count: number;
}

export interface LanesLayout {
  pos: Map<string, Point>;
  bands: LaneBand[];
  bounds: Bounds;
  /** x of every hop column, for the column ruler. */
  columns: { hop: number; x: number }[];
}

const SUB_W = 152;
const ROW = 96;
const LANE_PAD = 20;
const COL_GAP = 90;
const MAX_SUB = 8;

/**
 * Lanes: one swimlane per area (or entity kind), one column per hop distance from the focus. A cell with
 * many nodes wraps into up to six sub-columns, the way the gallery's skill tree packs the leaves of a
 * block, so the picture grows sideways instead of becoming a tall thin ribbon.
 */
export function lanesLayout(nodes: ViewNode[], edges: ViewEdge[], focusKey: string | null, otherLabel: string): LanesLayout {
  const hop = hopsFrom(nodes, edges, focusKey);
  const lanes = laneOrder(nodes, hop, focusKey, { max: 6, label: otherLabel });
  const maxHop = Math.max(0, ...hop.values());
  const cells = new Map<string, ViewNode[]>();
  const cellKey = (lane: string, h: number) => `${lane}#${h}`;
  // keyed by the *resolved* lane, so the merged "other" lane keeps its nodes
  for (const lane of lanes) {
    for (const n of lane.nodes) {
      const k = cellKey(lane.id, hop.get(n.key) ?? 0);
      cells.set(k, [...(cells.get(k) ?? []), n]);
    }
  }
  for (const [k, list] of cells) cells.set(k, list.sort((a, b) => a.label.localeCompare(b.label)));

  // column widths: the widest cell in that hop decides how many sub-columns the column needs
  // prefer wide over tall: two rows at most until a cell holds more than 16 nodes
  const subOf = (count: number) => Math.max(1, Math.min(MAX_SUB, Math.ceil(count / 2)));
  const colX: number[] = [];
  let x = 120;
  for (let h = 0; h <= maxHop; h++) {
    const widest = Math.max(1, ...lanes.map((l) => subOf((cells.get(cellKey(l.id, h)) ?? []).length)));
    colX[h] = x;
    x += widest * SUB_W + COL_GAP;
  }

  const pos = new Map<string, Point>();
  const bands: LaneBand[] = [];
  let y = 0;
  for (const lane of lanes) {
    const top = y;
    const inner = top + LANE_PAD + 14;
    let rows = 1;
    for (let h = 0; h <= maxHop; h++) {
      const list = cells.get(cellKey(lane.id, h)) ?? [];
      if (!list.length) continue;
      const sub = subOf(list.length);
      rows = Math.max(rows, Math.ceil(list.length / sub));
      list.forEach((n, i) => pos.set(n.key, { x: colX[h] + (i % sub) * SUB_W + SUB_W / 2, y: inner + Math.floor(i / sub) * ROW + ROW / 2 }));
    }
    y = inner + rows * ROW + LANE_PAD;
    bands.push({ id: lane.id, label: lane.label, top, bottom: y, count: lane.nodes.length });
  }
  const columns = colX.map((cx, h) => ({ hop: h, x: cx + 40 }));
  return { pos, bands, bounds: { minX: -20, minY: -40, maxX: x + 40, maxY: Math.max(y, 200) + 50 }, columns };
}

// ---- Radial tree (gallery `radial-tree-d3`: centre + one ring per hop, children near their parent) ----

export interface RadialLayout {
  pos: Map<string, Point>;
  rings: { hop: number; r: number; count: number }[];
  bounds: Bounds;
}

const RING = 210;

export function radialLayout(nodes: ViewNode[], edges: ViewEdge[], focusKey: string | null): RadialLayout {
  const hop = hopsFrom(nodes, edges, focusKey);
  const adj = neighbourMap(nodes, edges);
  const lanes = laneOrder(nodes, hop, focusKey);
  const laneIndex = new Map(lanes.map((l, i) => [l.id, i]));
  const byHop = new Map<number, ViewNode[]>();
  for (const n of nodes) {
    const h = hop.get(n.key) ?? 0;
    byHop.set(h, [...(byHop.get(h) ?? []), n]);
  }
  const angle = new Map<string, number>();
  const pos = new Map<string, Point>();
  const rings: { hop: number; r: number; count: number }[] = [];
  const maxHop = Math.max(0, ...byHop.keys());
  for (let h = 0; h <= maxHop; h++) {
    const list = byHop.get(h) ?? [];
    if (!list.length) continue;
    const r = h * RING;
    rings.push({ hop: h, r, count: list.length });
    if (h === 0) {
      list.forEach((n) => {
        angle.set(n.key, 0);
        pos.set(n.key, { x: 0, y: 0 });
      });
      continue;
    }
    // Preferred angle = mean of the angles already placed one ring in; ties break by lane then label,
    // then the ring is spread evenly in that order so glyphs never overlap.
    const preferred = (n: ViewNode) => {
      const parents = (adj.get(n.key) ?? []).filter((k) => (hop.get(k) ?? 0) === h - 1 && angle.has(k));
      if (!parents.length) return Math.PI * 2 * ((laneIndex.get(n.lane) ?? 0) / Math.max(1, lanes.length));
      let sx = 0;
      let sy = 0;
      for (const p of parents) {
        sx += Math.cos(angle.get(p)!);
        sy += Math.sin(angle.get(p)!);
      }
      return Math.atan2(sy, sx);
    };
    const sorted = [...list]
      .map((n) => ({ n, a: (preferred(n) + Math.PI * 4) % (Math.PI * 2) }))
      .sort((a, b) => a.a - b.a || (laneIndex.get(a.n.lane) ?? 0) - (laneIndex.get(b.n.lane) ?? 0) || a.n.label.localeCompare(b.n.label));
    // Keep tiles at least a tile apart: widen the ring when the circumference is too small.
    const need = sorted.reduce((s, x) => s + tileSize(x.n) + 46, 0);
    const radius = Math.max(r, need / (Math.PI * 2));
    rings[rings.length - 1].r = radius;
    sorted.forEach((x, i) => {
      const a = (i / sorted.length) * Math.PI * 2 + (h % 2 ? Math.PI / sorted.length : 0);
      angle.set(x.n.key, a);
      pos.set(x.n.key, { x: Math.cos(a) * radius, y: Math.sin(a) * radius });
    });
  }
  const r = Math.max(RING, ...rings.map((x) => x.r)) + 140;
  return { pos, rings, bounds: { minX: -r, minY: -r, maxX: r, maxY: r } };
}

// ---- Objects map (gallery `d3-object-map`: image tiles packed into one cluster per kind) ----

export interface MapCluster {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  count: number;
}

export interface MapLayout {
  pos: Map<string, Point>;
  clusters: MapCluster[];
  bounds: Bounds;
}

const CELL = 150;
const CLUSTER_PAD = 40;
const MAP_WIDTH = 1900;

export function objectsMapLayout(nodes: ViewNode[], edges: ViewEdge[], focusKey: string | null): MapLayout {
  const hop = hopsFrom(nodes, edges, focusKey);
  const lanes = laneOrder(nodes, hop, focusKey);
  const pos = new Map<string, Point>();
  const clusters: MapCluster[] = [];
  let rowY = 0;
  let rowX = 0;
  let rowH = 0;
  for (const lane of lanes) {
    const list = [...lane.nodes].sort((a, b) => (hop.get(a.key) ?? 0) - (hop.get(b.key) ?? 0) || a.label.localeCompare(b.label));
    const cols = Math.max(1, Math.min(6, Math.ceil(Math.sqrt(list.length * 1.5))));
    const rows = Math.ceil(list.length / cols);
    const w = cols * CELL + CLUSTER_PAD * 2;
    const h = rows * CELL + CLUSTER_PAD * 2 + 26;
    if (rowX > 0 && rowX + w > MAP_WIDTH) {
      rowY += rowH + 44;
      rowX = 0;
      rowH = 0;
    }
    const cx = rowX;
    const cy = rowY;
    list.forEach((n, i) => {
      pos.set(n.key, {
        x: cx + CLUSTER_PAD + (i % cols) * CELL + CELL / 2,
        y: cy + CLUSTER_PAD + 26 + Math.floor(i / cols) * CELL + CELL / 2,
      });
    });
    clusters.push({ id: lane.id, label: lane.label, x: cx, y: cy, w, h, count: list.length });
    rowX += w + 44;
    rowH = Math.max(rowH, h);
  }
  return { pos, clusters, bounds: { minX: -40, minY: -40, maxX: Math.max(MAP_WIDTH, rowX) + 40, maxY: rowY + rowH + 60 } };
}

// ---- 3D objects (gallery `three-objects-3d`: depth bands per kind + a short 2D relaxation) ----

/** Band order back-to-front; anything unknown lands in the middle. */
export const BAND_ORDER = ['area', 'topic', 'project', 'role', 'client', 'deliverable', 'tool', 'post', 'archive', 'other'] as const;

export function bandOf(kind: string): number {
  const i = BAND_ORDER.indexOf(kind as (typeof BAND_ORDER)[number]);
  return ((i === -1 ? BAND_ORDER.length - 1 : i) - (BAND_ORDER.length - 1) / 2) * 2.6;
}

/**
 * Ground positions for the 3D city: start on the node's band, then 220 iterations of link springs, body
 * repulsion and a pull back to the band (the gallery's `three-objects-3d` relaxation, reimplemented).
 * The focus node is pinned at the origin so the camera always has a home.
 */
export function bandLayout3d(nodes: ViewNode[], edges: ViewEdge[], focusKey: string | null): Map<string, Point3> {
  const out = new Map<string, Point3>();
  if (!nodes.length) return out;
  const index = new Map(nodes.map((n, i) => [n.key, i]));
  // deterministic pseudo-random start (Lehmer generator, seed 11 like the gallery)
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const p = nodes.map((n, i) => ({ x: ((i % 9) - 4) * 2.1 + rnd() - 0.5, z: bandOf(n.kind) + rnd() - 0.5 }));
  const links = edges
    .map((e) => ({ s: index.get(e.from), t: index.get(e.to), kind: e.kind }))
    .filter((l): l is { s: number; t: number; kind: string } => l.s !== undefined && l.t !== undefined && l.s !== l.t);
  const R = 1.05;
  for (let it = 0; it < 220; it++) {
    for (const l of links) {
      const a = p[l.s];
      const b = p[l.t];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const d = Math.hypot(dx, dz) || 0.01;
      const rest = l.kind === 'child' ? 2.4 : 3.2;
      const k = l.kind === 'child' ? 0.06 : 0.02;
      const f = (d - rest) * k;
      a.x += (dx / d) * f;
      b.x -= (dx / d) * f;
      a.z += (dz / d) * f * 0.35;
      b.z -= (dz / d) * f * 0.35;
    }
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const a = p[i];
        const b = p[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dz) || 0.01;
        const min = R * 2 + 0.5;
        if (d < min) {
          const push = ((min - d) / d) * 0.5;
          a.x -= dx * push;
          a.z -= dz * push;
          b.x += dx * push;
          b.z += dz * push;
        }
      }
    }
    const mx = p.reduce((s, q) => s + q.x, 0) / p.length;
    nodes.forEach((n, i) => {
      p[i].z += (bandOf(n.kind) - p[i].z) * 0.09;
      p[i].x -= mx * 0.05 + p[i].x * 0.002;
    });
  }
  const fi = focusKey ? index.get(focusKey) : undefined;
  const ox = fi === undefined ? 0 : p[fi].x;
  nodes.forEach((n, i) => out.set(n.key, { x: p[i].x - ox, y: 0, z: p[i].z }));
  return out;
}

export function boundsOf(pos: Map<string, Point>, pad = 120): Bounds {
  const pts = [...pos.values()];
  if (!pts.length) return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  return {
    minX: Math.min(...pts.map((p) => p.x)) - pad,
    minY: Math.min(...pts.map((p) => p.y)) - pad,
    maxX: Math.max(...pts.map((p) => p.x)) + pad,
    maxY: Math.max(...pts.map((p) => p.y)) + pad,
  };
}
