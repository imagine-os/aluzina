import { useState } from 'react';
import { SpaceTree, type SpaceTreeNode } from './SpaceTree';

const NODES: SpaceTreeNode[] = [
  { id: 'a', name: 'Brand Memory', glyph: '◈', kind: 'area', count: 2, children: [
    { id: 'a1', name: 'aluzina-brand-kit', glyph: '▸', kind: 'topic', count: 1, children: [
      { id: 'a11', name: 'voice-and-tone', glyph: '·', kind: 'topic', count: 1, children: [] },
      { id: 'a12', name: 'visual-identity', glyph: '·', kind: 'topic', children: [] },
    ] },
    { id: 'a2', name: 'operations-manual', glyph: '▸', kind: 'topic', count: 3, children: [] },
  ] },
  { id: 'b', name: 'All Roles', glyph: '◉', kind: 'area', children: [
    { id: 'b1', name: 'owner', glyph: '◦', kind: 'role', count: 6, children: [] },
    { id: 'b2', name: 'developer', glyph: '◦', kind: 'role', count: 4, children: [] },
  ] },
  { id: 'c', name: 'Archive', glyph: '▫', kind: 'archive', archived: true, children: [] },
];

export default function SpaceTreeExample() {
  const [selected, setSelected] = useState<string | null>('a11');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ a: true, a1: true });
  return (
    <div style={{ maxWidth: '20rem' }}>
      <SpaceTree nodes={NODES} selectedId={selected} onSelect={setSelected} expanded={expanded} onToggle={(id, open) => setExpanded((e) => ({ ...e, [id]: open }))} label="Spaces (example)" />
    </div>
  );
}
