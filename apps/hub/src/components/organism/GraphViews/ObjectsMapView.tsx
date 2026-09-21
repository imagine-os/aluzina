import { forwardRef, useMemo } from 'react';
import { objectsMapLayout, type Point } from './layouts';
import { SvgGraphView } from './SvgGraphView';
import type { GraphViewHandle, GraphViewProps } from './types';

/** Gentle arc so parallel links between two clusters stay apart (gallery `d3-object-map`). */
const arc = (a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  return `M${a.x},${a.y}Q${(a.x + b.x) / 2 - (dy / d) * Math.min(60, d * 0.12)},${(a.y + b.y) / 2 + (dx / d) * Math.min(60, d * 0.12)} ${b.x},${b.y}`;
};

/**
 * Objects map: image tiles packed into one cluster per area or entity kind, clusters framed and labelled.
 * Reimplements the gallery's `d3-object-map` (D3 7.9.0, ISC) with a deterministic grid instead of a force
 * simulation, so the map is the same picture every time.
 */
export const ObjectsMapView = forwardRef<GraphViewHandle, GraphViewProps>(function ObjectsMapView(props, ref) {
  const { nodes, edges, focusKey } = props;
  const { pos, clusters, bounds } = useMemo(() => objectsMapLayout(nodes, edges, focusKey), [nodes, edges, focusKey]);
  const behind = (
    <>
      {clusters.map((c) => (
        <g key={c.id} className="gcluster">
          <rect className="gcluster__frame" x={c.x} y={c.y} width={c.w} height={c.h} rx={18} />
          <text className="gcluster__label" x={c.x + 18} y={c.y + 26}>{c.label} · {c.count}</text>
        </g>
      ))}
    </>
  );
  return <SvgGraphView {...props} ref={ref} view="map" positions={pos} bounds={bounds} behind={behind} edgePath={arc} />;
});
