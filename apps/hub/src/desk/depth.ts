import type { CSSProperties } from 'react';

/**
 * The desk's one depth order (D-107): every layer of the 3D context and how far above the desk plane it sits, in
 * world px (translateZ; the committed CSS zoom scales them with the world). Two rules keep it clean at every zoom:
 *
 * 1. No two layers that can overlap share a Z. Layers that cannot overlap (two sub-mats, two mats) may share one.
 * 2. DOM order is depth order, so when the zoom squeezes two planes closer than the compositor can tell apart
 *    (it then paints them in DOM order), the result is the same: the current mat's light before every mat, a sub-mat's glows before
 *    its objects plane, an object's shadow before its face.
 *
 * Thin objects (sheet, form, checklist, card, light, plain tiles) are not layers of their own: they are painted into
 * their sub-mat's objects plane in DOM order, with their shadow, so the plane is one layer per sub-mat. Lifted parts
 * (the top face of a document, folder, box, token, the sheets of a stack, a station's desk top and its stand-up
 * planes) are layers above it. Nothing inside the 3D context carries `overflow` or `contain` (both flatten
 * `preserve-3d` and clip); text is clipped by the 2D spans inside a face. The only clip is the stage frame. The
 * toolbar, minimap, tooltip (a portal), legend, drawer, height handle and money rail are outside the 3D context.
 */
export const DEPTH = {
  /** The wooden desk, painted into the world layer. */
  slab: 0,
  /** The followed project's light rings round the current mat (before every mat in the DOM). A mat's own drop shadow
   *  stays on the mat: it never reaches a neighbour, the gap between mats is one square. */
  matGlow: 0.5,
  /** Mat felt, stitching and the mat label (one layer per mat). */
  mat: 1,
  /** Sub-mat linen, chess squares and the sub-mat label (one layer per sub-mat). */
  sub: 2,
  /** Glows under objects: the status token's halo, light tiles' light (before the objects plane in the DOM). */
  glow: 2.5,
  /** The objects plane of a sub-mat: thin faces and every object's single shadow. Lifted tops add their thickness. */
  objects: 3,
  /** A focused or selected object lifts this much, so its ring is never under a neighbour's face or shadow. */
  lift: 0.75,
  /** A station's desk top above its mat (the stand-up planes stand this much above it, never on it). */
  stationTop: 22,
  standGap: 0.5,
  /** The trail's pulse of light: above every object top (the tallest, a box, reaches objects + 18). */
  pulse: 40,
  /** A fanned dossier's overlay plane (lead dossiers, D-114): above every object top, below the pulse. */
  fan: 28,
} as const;

/** The depth table as custom properties for the world element (desk.css reads `--z-*`). */
export function depthVars(): CSSProperties {
  const v: Record<string, string> = {};
  for (const [k, z] of Object.entries(DEPTH)) v[`--z-${k}`] = `${z}px`;
  return v as CSSProperties;
}

/** The depth table in reading order, for the docs and the legend of D-107. */
export const DEPTH_ORDER: readonly (keyof typeof DEPTH)[] = ['slab', 'matGlow', 'mat', 'sub', 'glow', 'objects', 'lift', 'stationTop', 'standGap', 'fan', 'pulse'];
