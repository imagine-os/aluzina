import { forwardRef, useMemo } from 'react';
import { lanesLayout, type Point } from './layouts';
import { SvgGraphView } from './SvgGraphView';
import type { GraphViewHandle, GraphViewProps } from './types';

/** Left-to-right cubic link, the shape D3's `linkHorizontal` draws (gallery `lanes-skilltree`). */
const linkHorizontal = (a: Point, b: Point) => `M${a.x},${a.y}C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}`;

/**
 * Lanes skill tree: one swimlane per area (or entity kind), columns by hop distance from the focus, curved
 * edges. Reimplements the gallery's `lanes-skilltree` (D3 7.9.0, ISC) without a layout library.
 */
export const LanesView = forwardRef<GraphViewHandle, GraphViewProps>(function LanesView(props, ref) {
  const { nodes, edges, focusKey, labels } = props;
  const { pos, bands, bounds, columns } = useMemo(() => lanesLayout(nodes, edges, focusKey, labels.otherLane), [nodes, edges, focusKey, labels.otherLane]);
  const behind = (
    <>
      {bands.map((b, i) => (
        <g key={b.id} className={`glane glane--${i % 2 ? 'odd' : 'even'}`}>
          <rect className="glane__band" x={bounds.minX} y={b.top} width={bounds.maxX - bounds.minX} height={b.bottom - b.top} />
          <text className="glane__label" x={bounds.minX + 16} y={b.top + 24}>{b.label} · {b.count}</text>
        </g>
      ))}
      {columns.map((c) => (
        <text key={c.hop} className="glane__col" x={c.x} y={bounds.minY + 18} textAnchor="middle">{labels.hops.replace('{n}', String(c.hop))}</text>
      ))}
    </>
  );
  return <SvgGraphView {...props} ref={ref} view="lanes" positions={pos} bounds={bounds} behind={behind} edgePath={linkHorizontal} />;
});
