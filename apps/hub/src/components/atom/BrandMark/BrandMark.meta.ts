import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'BrandMark',
  tier: 'atom',
  purpose:
    'The Aluzina marks as inline SVG from src/brand/paths.ts: wordmark, monogram A, descriptor lockup and the eight outline glyphs, painted with the metal (gold / silver switch), iridescent, outline or flat finish so they follow theme and metal.',
  props: {
    kind: "'wordmark' | 'monogram' | 'descriptor' | 'glyph'",
    glyph: "'fuego' | 'agua' | 'aire' | 'tierra' | 'neutro' | 'productos' | 'espacios' | 'arte'? – required for kind glyph",
    finish: "'metal' | 'iridescent' | 'outline' | 'flat'? – default metal; glyphs are always strokes, the finish paints the stroke",
    tone: "'periwinkle' | 'aqua' | 'lime'? – monogram stem colour (the foot stays flat metal)",
    size: "'sm' | 'md' | 'lg' | 'xl'? – height 1.25 / 2 / 3.5 / 6 rem, scales with --scale",
    label: 'string? – aria-label; decorative (aria-hidden) when absent',
  },
  a11y: [
    'decorative by default: aria-hidden unless label is given, then role="img" + aria-label',
    'no interaction; wrap in a link or button when it navigates',
    'outline finish uses a non-scaling stroke so the hairline stays visible at every size and scale band',
  ],
  usages: ['DesktopShell / MobileShell (wordmark in the header)', 'Hub hero', 'Placeholder tiles (monogram)', 'Section headers (glyphs)'],
});
