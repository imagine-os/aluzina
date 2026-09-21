import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Icon',
  tier: 'atom',
  purpose:
    'The system icon set (71 names): one inline SVG per name on a 24 x 24 grid, stroke 1.75, round caps and joins, currentColor, no fills except tiny dots. Replaces the Unicode nav glyphs; the glyphs stay in the route manifest as data and as the last fallback (docs/design/icons.md).',
  props: {
    name: 'IconName – one of ICON_NAMES (isIconName guards data)',
    size: "'sm' | 'md' | 'lg' | 'xl' = 'md' (--icon-sm 1rem / md 1.25rem / lg 1.5rem / xl 2rem)",
    label: 'string? – accessible name; with it role=img + aria-label, without it aria-hidden (decorative next to a text label)',
    tone: "'default' | 'muted' | 'accent' = 'default'",
    className: 'string?',
  },
  a11y: [
    'aria-hidden by default: every place an icon is used keeps its text label, so the icon is never the only signal (P-03)',
    'role=img + aria-label only when the icon stands alone',
    'focusable="false" keeps the svg out of the tab order in every engine',
    'currentColor and --icon-* rem tokens: light, dark, the metal switch and the --scale bands all apply (P-01)',
  ],
  usages: [
    'DesktopShell sidebar and bottom nav, PhoneShell bottom nav, the More drawer (app/shells.tsx)',
    'SpaceTree rows (space kind) and its expand / collapse chevron',
    'SurfaceCard header line and the empty thumbnail tile (HUB-01 cards)',
  ],
});
