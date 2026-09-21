import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'GraphViews',
  tier: 'organism',
  purpose:
    'Four ways to draw one graph, rebuilt on the imagine-os graph gallery (imagine-os.github.io/graph-gallery): Objects 3D (three.js 0.186 MIT, lazy-loaded, ground grid + depth bands + object bodies carrying the node\'s own picture), Lanes skill tree (one swimlane per area, columns by hop), Radial tree (focus at the centre, one ring per hop) and Objects map (image tiles clustered per kind). Nodes never render as bare dots: a person shows initials, a page shows its deploy-time thumbnail, a space or catalog entry shows its glyph. RelationGraph stays the dependency-free 2D fallback.',
  props: {
    nodes: 'ViewNode[] – { key: "<type>:<id>", label, kind, sub?, size?, image: { kind: thumb | initials | glyph, src?, text, code? }, lane, laneLabel }',
    edges: 'ViewEdge[] – { from, to, kind: child | filed | <relation kind> }',
    focusKey: 'string | null – centred node and the keyboard Home target',
    onFocus: '(key) => void – Space on a node',
    onOpen: '(key) => void – Enter, click, second tap',
    label: 'string – accessible name of the drawing region',
    labels: 'GraphViewLabels – help, node, links, hops, nodeList, noPreview, capped (the page owns the strings)',
    autoRotate: 'boolean – 3D only, ignored when motion is reduced',
    reducedMotion: 'boolean – 3D only: no tween, no auto-rotation',
    ref: 'GraphViewHandle – zoomIn, zoomOut, fit, reset, centreOn(key) for the page buttons',
  },
  a11y: [
    'every view shares one interaction overlay (NodeLayer): the drawing is paint only, the overlay carries the tab stop, the >= 44 px targets, the tooltip and the keyboard model',
    'roving tabindex: the graph is one tab stop, arrows walk the focused node\'s neighbours (list order when it has none), Enter opens, Space re-centres the query, Home returns to the focus node',
    'the camera / viewport follows keyboard focus (centreOn), the focused node draws a ring in the scene and a visible focus ring on the overlay button',
    'hover is never alone: the same card shows on focus; on touch the first tap selects and centres, the second opens',
    'zoom, fit, reset and auto-rotate are page buttons driving the imperative handle - never pointer-only, never wheel-only, no scroll-jacking',
    '3D falls back to RelationGraph when WebGL is missing; auto-rotation and camera tweens are off under prefers-reduced-motion',
  ],
  usages: ['K-04 Spaces graph'],
});
