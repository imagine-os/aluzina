import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'RelationGraph',
  tier: 'organism',
  purpose: 'SVG graph of spaces (tone by kind), posts and typed relations (K-04) with its own deterministic force layout (radial start by hop distance from the focus node, 220 iterations; no library). Zoom is a prop from page buttons; the drawing scrolls inside its own container.',
  props: { nodes: 'GraphNode[] – { key: "<type>:<id>", label, kind, size?, sub? }', edges: 'GraphEdge[] – { from, to, kind: child | filed | <relation kind> }', focusKey: 'string | null – centred node', onFocus: '(key) => void – Space on a node', onOpen: '(key) => void – Enter / click', zoom: 'number 0.5..3', label: 'string' },
  a11y: ['every node is a focusable role=button with an aria-label naming label, kind and neighbour count', 'Enter opens, Space re-centres, ArrowRight / ArrowDown and ArrowLeft / ArrowUp walk the neighbours, Home returns to the focus node', 'keyboard focus draws a 3 px ring and highlights the node\'s edges', 'hit area >= 44 px logical at zoom 1; labels have a surface halo so they stay readable in both themes', 'the container is a labelled region with a hidden help text; zoom buttons live on the page, never wheel-only (P-03)'],
  usages: ['K-04 Spaces graph'],
});
