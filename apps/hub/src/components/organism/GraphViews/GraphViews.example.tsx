import { Suspense, useRef, useState } from 'react';
import { Button } from '../../atom/Button/Button';
import { Skeleton } from '../../atom/Skeleton/Skeleton';
import { Tabs } from '../../molecule/Tabs/Tabs';
import { LanesView, ObjectsMapView, Objects3DView, RadialView, useWebGLAvailable, type GraphViewHandle, type GraphViewId, type GraphViewLabels, type ViewEdge, type ViewNode } from './GraphViews';

const LABELS: GraphViewLabels = {
  help: 'Arrow keys walk the neighbours of the focused node, Enter opens it, Space re-centres, Home returns to the focus node.',
  node: '{label}, {kind}, {n} links',
  links: '{n} links',
  hops: '{n} hops',
  nodeList: 'Nodes',
  noPreview: 'No preview yet',
  capped: '{n} nodes hidden',
  otherLane: 'Other',
};

const NODES: ViewNode[] = [
  { key: 'spaces:brand', label: 'Brand Memory', kind: 'area', size: 'lg', lane: 'area:brand', laneLabel: 'Brand Memory', image: { kind: 'glyph', text: '◇' } },
  { key: 'spaces:kit', label: 'aluzina-brand-kit', kind: 'topic', lane: 'area:brand', laneLabel: 'Brand Memory', image: { kind: 'glyph', text: '▸' } },
  { key: 'roles:brand', label: 'Brand lead', kind: 'role', lane: 'roles', laneLabel: 'Roles', sub: 'Role', image: { kind: 'initials', text: 'A' } },
  { key: 'users:u-valentina', label: 'Valentina', kind: 'other', size: 'sm', lane: 'users', laneLabel: 'People', sub: 'Person', image: { kind: 'initials', text: 'V' } },
  { key: 'posts:voice', label: 'Brand voice rules', kind: 'post', lane: 'posts', laneLabel: 'Posts', sub: 'Post', image: { kind: 'glyph', text: '✎' } },
  { key: 'deliverables:moodboard', label: 'Moodboard', kind: 'deliverable', size: 'sm', lane: 'deliverables', laneLabel: 'Deliverables', sub: 'Deliverable', image: { kind: 'thumb', text: '▦', code: 'S-04' } },
];

const EDGES: ViewEdge[] = [
  { from: 'spaces:brand', to: 'spaces:kit', kind: 'child' },
  { from: 'posts:voice', to: 'spaces:kit', kind: 'filed' },
  { from: 'roles:brand', to: 'spaces:brand', kind: 'owned-by' },
  { from: 'users:u-valentina', to: 'roles:brand', kind: 'belongs-to' },
  { from: 'posts:voice', to: 'deliverables:moodboard', kind: 'references' },
];

export default function GraphViewsExample() {
  const [view, setView] = useState<GraphViewId>('lanes');
  const [focus, setFocus] = useState<string | null>('spaces:kit');
  const ref = useRef<GraphViewHandle>(null);
  const webgl = useWebGLAvailable();
  const props = { nodes: NODES, edges: EDGES, focusKey: focus, onFocus: setFocus, onOpen: () => undefined, label: 'Example graph', labels: LABELS };
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <Tabs
        label="Graph view"
        value={view}
        onChange={(id) => setView(id as GraphViewId)}
        tabs={[
          { id: 'objects3d', label: webgl ? '3D objects' : '3D objects (no WebGL)' },
          { id: 'lanes', label: 'Lanes' },
          { id: 'radial', label: 'Radial' },
          { id: 'map', label: 'Objects map' },
        ]}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button icon="−" aria-label="Zoom out" onClick={() => ref.current?.zoomOut()} />
        <Button icon="+" aria-label="Zoom in" onClick={() => ref.current?.zoomIn()} />
        <Button onClick={() => ref.current?.fit()}>Fit</Button>
        <Button onClick={() => ref.current?.reset()}>Reset</Button>
      </div>
      {view === 'objects3d' && webgl ? (
        <Suspense fallback={<Skeleton height="16rem" />}>
          <Objects3DView {...props} ref={ref} />
        </Suspense>
      ) : view === 'radial' ? (
        <RadialView {...props} ref={ref} />
      ) : view === 'map' ? (
        <ObjectsMapView {...props} ref={ref} />
      ) : (
        <LanesView {...props} ref={ref} />
      )}
    </div>
  );
}
