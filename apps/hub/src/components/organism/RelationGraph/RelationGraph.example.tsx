import { useState } from 'react';
import { RelationGraph, type GraphEdge, type GraphNode } from './RelationGraph';

const NODES: GraphNode[] = [
  { key: 'spaces:brand', label: 'Brand Memory', kind: 'area', size: 'lg' },
  { key: 'spaces:kit', label: 'aluzina-brand-kit', kind: 'topic' },
  { key: 'spaces:mkt', label: 'marketing-strategist', kind: 'role' },
  { key: 'spaces:studio', label: 'interior-design-jr', kind: 'role' },
  { key: 'posts:voice', label: 'Brand voice rules', kind: 'post', sub: 'post' },
  { key: 'brandAssets:guide', label: 'Manual de identidad', kind: 'other', sub: 'brand asset', size: 'sm' },
];
const EDGES: GraphEdge[] = [
  { from: 'spaces:brand', to: 'spaces:kit', kind: 'child' },
  { from: 'posts:voice', to: 'spaces:kit', kind: 'filed' },
  { from: 'posts:voice', to: 'spaces:mkt', kind: 'filed' },
  { from: 'posts:voice', to: 'spaces:studio', kind: 'filed' },
  { from: 'posts:voice', to: 'brandAssets:guide', kind: 'references' },
];

export default function RelationGraphExample() {
  const [focus, setFocus] = useState<string | null>('posts:voice');
  return <RelationGraph nodes={NODES} edges={EDGES} focusKey={focus} onFocus={setFocus} onOpen={() => undefined} zoom={0.7} label="Relation graph (example)" />;
}
