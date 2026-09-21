/**
 * GraphViews (K-04): four ways to draw the same Spaces graph, rebuilt on the imagine-os graph gallery
 * (https://github.com/imagine-os/graph-gallery, https://imagine-os.github.io/graph-gallery/ — Justin's own
 * repo; techniques reimplemented here, no gallery code copied, so the licences in play are those of the
 * libraries it surveys: three.js MIT, D3 ISC). The views share these types, the interaction layer
 * (`NodeLayer`) and the layout helpers (`layouts.ts`); each one only decides where the nodes go.
 *
 * `RelationGraph` stays the dependency-free 2D fallback (D-026) and is not part of this folder.
 */

/** View ids; `force2d` is rendered by `RelationGraph`, the other four live here. */
export type GraphViewId = 'objects3d' | 'lanes' | 'radial' | 'map' | 'force2d';
export const GRAPH_VIEW_IDS: readonly GraphViewId[] = ['objects3d', 'lanes', 'radial', 'map', 'force2d'];

export function isGraphViewId(v: unknown): v is GraphViewId {
  return typeof v === 'string' && (GRAPH_VIEW_IDS as readonly string[]).includes(v);
}

/**
 * What the node is drawn as. Never a bare dot: the picture comes from the system itself — a person's
 * initials, a space or catalog glyph, or the deploy-time page thumbnail of the route the node opens.
 */
export interface NodeImage {
  kind: 'thumb' | 'initials' | 'glyph';
  /** `thumb` only: `./thumbs/<code>.jpg?v=<build>`; a failed load falls back to the glyph tile. */
  src?: string;
  /** Initials, glyph characters, or the fallback text of a thumbnail tile. */
  text: string;
  /** Page code shown on the thumbnail fallback tile. */
  code?: string;
}

export interface ViewNode {
  /** `<type>:<id>`, stable across renders (the same key `RelationGraph` uses). */
  key: string;
  label: string;
  /** Tone class: a space kind, `post` or `other`. */
  kind: string;
  /** Second line: the translated entity type. */
  sub?: string;
  size?: 'lg' | 'md' | 'sm';
  image: NodeImage;
  /** Stable lane / cluster id (an area's space id, or an entity type). */
  lane: string;
  /** Translated lane name. */
  laneLabel: string;
}

export interface ViewEdge {
  from: string;
  to: string;
  /** `child` (space tree), `filed` (post in space) or a relation kind. */
  kind: string;
}

/** Text the views need; supplied by the page so every string stays in the module's table (P-13). */
export interface GraphViewLabels {
  /** Hidden help paragraph read by screen readers. */
  help: string;
  /** `{label}`, `{kind}`, `{n}` — the accessible name of a node. */
  node: string;
  /** `{n}` — link count in the tooltip. */
  links: string;
  /** `{n}` — "n hops from the focus". */
  hops: string;
  /** Name of the keyboard node list. */
  nodeList: string;
  /** Fallback text on a thumbnail tile that has not been generated yet. */
  noPreview: string;
  /** Announced when the node cap trims the picture: `{n}`. */
  capped: string;
  /** Name of the lane the smallest lanes are packed into. */
  otherLane: string;
}

export interface GraphViewProps {
  nodes: ViewNode[];
  edges: ViewEdge[];
  /** Node the layout is centred on and the keyboard's Home target. */
  focusKey: string | null;
  /** Space on a node: make it the focus (the page re-queries depth around it). */
  onFocus: (key: string) => void;
  /** Enter / click (second tap on touch): open the entity. */
  onOpen: (key: string) => void;
  /** Accessible name of the drawing region. */
  label: string;
  labels: GraphViewLabels;
  /** 3D only: keep the camera turning (off by default and whenever motion is reduced). */
  autoRotate?: boolean;
  /** 3D only: draw without animation (prefers-reduced-motion). */
  reducedMotion?: boolean;
}

/** What the page's − / + / fit / reset buttons drive (P-03: never pointer-only). */
export interface GraphViewHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
  reset: () => void;
  /** Centre the camera / viewport on a node (the keyboard layer calls this as focus moves). */
  centreOn: (key: string) => void;
}
