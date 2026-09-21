import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Shimmer',
  tier: 'atom',
  purpose:
    'Decorative shader surface for the two brand finishes (brand-system.md section 3): a dependency-free WebGL2 canvas painting anisotropic brushed metal from the live --metal-* vars (two specular streaks that follow pointer and device tilt) or a thin-film iridescent shift across the three brand pastels. Falls back to the CSS gradient when WebGL2 is unavailable.',
  props: {
    finish: "'metal' | 'iridescent'? – default metal; metal reads --metal-base/-highlight/-shade so it follows the silver / gold switch",
    intensity: 'number? – 0..1, strength of the streaks / interference (default 0.6)',
    motion: 'boolean? – overrides the prefers-reduced-motion default (static single frame when reduced)',
    label: 'string? – aria-label on the canvas; decorative (aria-hidden) without it',
    className: 'string?',
    children: 'ReactNode? – content overlaid on the finish; always ink text',
  },
  a11y: [
    'decorative by default (canvas aria-hidden); it never carries information, so nothing is lost when it does not render',
    'prefers-reduced-motion: renders one static frame, no idle drift and no tilt tracking',
    'renders only while intersecting the viewport, pauses on a hidden tab, caps devicePixelRatio at 2',
    'overlaid children keep --brand-ink on both finishes in both themes (the surfaces stay light)',
  ],
  usages: ['Hub hero band (HUB-01)', 'Textures and effects playground (D-13)', 'Brand guidelines, metal and iridescent previews (D-12)'],
});
