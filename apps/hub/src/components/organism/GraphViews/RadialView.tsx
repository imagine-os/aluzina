import { forwardRef, useMemo } from 'react';
import { radialLayout, type Point } from './layouts';
import { SvgGraphView } from './SvgGraphView';
import type { GraphViewHandle, GraphViewProps } from './types';

/** Quadratic link that bows towards the centre, the shape D3's `linkRadial` draws (gallery `radial-tree-d3`). */
const linkRadial = (a: Point, b: Point) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return `M${a.x},${a.y}Q${mx * 0.62},${my * 0.62} ${b.x},${b.y}`;
};

/**
 * Radial tree: the focus node at the centre, one ring per hop, children placed near their parent's angle.
 * Reimplements the gallery's `radial-tree-d3` (D3 7.9.0, ISC) without `d3-hierarchy`.
 */
export const RadialView = forwardRef<GraphViewHandle, GraphViewProps>(function RadialView(props, ref) {
  const { nodes, edges, focusKey, labels } = props;
  const { pos, rings, bounds } = useMemo(() => radialLayout(nodes, edges, focusKey), [nodes, edges, focusKey]);
  const behind = (
    <>
      {rings.filter((r) => r.hop > 0).map((r) => (
        <g key={r.hop} className="gring">
          <circle className="gring__circle" cx={0} cy={0} r={r.r} />
          <text className="gring__label" x={0} y={-r.r - 12} textAnchor="middle">{labels.hops.replace('{n}', String(r.hop))}</text>
        </g>
      ))}
    </>
  );
  return <SvgGraphView {...props} ref={ref} view="radial" positions={pos} bounds={bounds} behind={behind} edgePath={linkRadial} />;
});
