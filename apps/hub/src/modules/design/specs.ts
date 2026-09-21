import { defineSpec } from '../../specs/PageSpec';

/** Shared by the three Design system pages: the one permission every role holds (the brand is not secret). */
export const DESIGN_PERMISSION = 'design.read';

export const brandSpec = defineSpec({
  code: 'D-12',
  name: 'Brand guidelines',
  purpose:
    'The Aluzina brand manual alive inside the product: logo and monogram, the four palette colours with their Pantone / HEX / RGB / CMYK, the metal switch (gold today, silver ready), gradients, typography, the eight elements, textures and the light / dark rules, rendered from the same tokens the app ships with.',
  surface: 'design',
  navGroup: 'design',
  layout: [
    'PageHeader (breadcrumb Design system / Brand guidelines, subtitle naming the source manual)',
    'Logo: wordmark metal on a light tile and iridescent on a dark tile, descriptor lockup, house rules',
    'Monogram: the three official stem tones plus metal and outline',
    'Colors: four diamond swatch Cards (Pantone, HEX, RGB, CMYK, role) with a copy-hex Button each, plus the highlight and ink notes',
    'Metal finish: gold / silver live preview toggle and the one-line explanation of the real switch',
    'Gradients: metal, metal-soft, iridescent, iridescent-x, iridescent-soft tiles',
    'Typography: DIN Round Pro specimen (a-z, A-Z, digits), the five weights, eyebrow / heading / body samples',
    'Elements: the eight glyphs with their names',
    'Textures: the four pattern tiles and the metal / iridescent / outline circles',
    'Light and dark: the same sample card rendered in both themes side by side',
    'What the manual does not define, and the source line',
  ],
  dataTables: [],
  roles: ['founder', 'brand', 'studio', 'ops', 'marketing', 'client', 'dev'],
  logic: [
    'Every mark is the BrandMark atom and every colour comes from src/design/tokens.ts: the page cannot drift from the app.',
    'The metal toggle sets <html data-metal> and stores aluzina.metal; it is a preview only. The real switch is tokens.metalDefault + npm run tokens.',
    'Copy hex writes the value to the clipboard and confirms with a Toast; it falls back to a selection prompt when the clipboard API is blocked.',
    'The light / dark sample renders inside data-theme wrappers, so both themes are visible whatever the header toggle says.',
    'Everything marked (house rule) is ours, not the manual: the manual defines no clear space, minimum size or misuse rules.',
  ],
  components: ['PageHeader', 'Card', 'Badge', 'Button', 'KeyValue', 'BrandMark', 'Shimmer', 'Toast'],
  actions: [
    { id: 'design.copyToken', label: 'Copy value', intent: 'copy the value of {token}', permission: DESIGN_PERMISSION, params: { token: 'string' } },
    { id: 'design.previewMetal', label: 'Preview metal finish', intent: 'preview the brand in {metal}', permission: DESIGN_PERMISSION, params: { metal: 'enum:gold|silver' } },
  ],
  checkedAt: [390, 1280, 1920],
  notes: ['Source: MANUAL DE MARCA ALUZINA (2026-09-21), docs/knowledge/brand.md, docs/design/brand-system.md.'],
});

export const tokensSpec = defineSpec({
  code: 'D-10',
  name: 'Design tokens',
  purpose:
    'Every token in src/design/tokens.ts rendered live: colours in both themes with their contrast ratios and a pass / fail badge, the metal sets, gradients, type, spacing, radius, shadow, target, focus ring and the responsive scale bands with the current viewport band highlighted.',
  surface: 'design',
  navGroup: 'design',
  layout: [
    'PageHeader (breadcrumb Design system / Tokens)',
    'Live card: current theme, metal, --scale, viewport width, target and focus ring read from getComputedStyle',
    'SearchField filtering every table by token name, CSS var or value',
    'Colour table: name, CSS var, light and dark swatch with hex and contrast vs bg / surface, pass or fail badge',
    'Brand constants, metal sets (gold and silver), gradients',
    'Type: families, the five weights as samples, tracking',
    'Radius, space, shadow, hairline, target, focus ring',
    'Scale bands table with the active band marked',
  ],
  dataTables: [],
  roles: ['founder', 'brand', 'studio', 'ops', 'marketing', 'client', 'dev'],
  logic: [
    'Values come from the tokens module; the live card reads the same vars back from getComputedStyle(document.documentElement) so a mismatch between tokens.ts and tokens.css is visible.',
    'Contrast is WCAG 2.1 relative luminance, computed in the browser against the theme bg and surface; text tokens are judged at 4.5:1, UI tokens at 3:1, surfaces are reported without a verdict.',
    'Search matches the token name, the CSS var and the value; a section with no match is hidden.',
    'The viewport width and the active scale band update on resize.',
  ],
  components: ['PageHeader', 'Card', 'SearchField', 'FilterBar', 'Badge', 'Button', 'KeyValue', 'EmptyState', 'Toast'],
  actions: [
    { id: 'design.searchTokens', label: 'Search tokens', intent: 'find the token {query}', permission: DESIGN_PERMISSION, params: { query: 'string' } },
    { id: 'design.copyToken', label: 'Copy CSS variable', intent: 'copy the variable {token}', permission: DESIGN_PERMISSION, params: { token: 'string' } },
  ],
  checkedAt: [390, 1280, 1920],
});

export const effectsSpec = defineSpec({
  code: 'D-13',
  name: 'Textures and effects',
  purpose:
    'The playground for the brand finishes: the Shimmer shader at every intensity with motion on or off, the four texture tiles at four sizes, the sheen sweep, metal and iridescent text, and the rules for where each one is allowed.',
  surface: 'design',
  navGroup: 'design',
  layout: [
    'PageHeader (breadcrumb Design system / Textures and effects)',
    'Controls: intensity, motion toggle (the page respects prefers-reduced-motion by default)',
    'Shimmer: metal and iridescent bands, a tile and a chip, with the CSS-gradient fallback shown beside them',
    'Textures: the four tiles with a size control',
    'Finishes: the sheen sweep toggle, .text-metal and .text-iridescent headings',
    'Where each is allowed: the rules card',
  ],
  dataTables: [],
  roles: ['founder', 'brand', 'studio', 'ops', 'marketing', 'client', 'dev'],
  logic: [
    'Intensity and motion drive the Shimmer atom props; motion defaults to the prefers-reduced-motion setting and the control says so.',
    'The texture size control sets --texture-size on the tile grid, in rem, so the pattern keeps scaling with --scale.',
    'The sheen toggle adds the .sheen class to the sample band; the sweep itself only runs on hover / focus-within and is off under reduced motion.',
    'Every surface here is decorative: no information is carried by a finish, and all overlaid text is ink.',
  ],
  components: ['PageHeader', 'Card', 'Select', 'ToggleButton', 'Badge', 'Button', 'KeyValue', 'Shimmer', 'BrandMark'],
  actions: [
    { id: 'design.setShimmerIntensity', label: 'Set shader intensity', intent: 'set the shimmer intensity to {intensity}', permission: DESIGN_PERMISSION, params: { intensity: 'enum:0.2|0.4|0.6|0.8|1' } },
    { id: 'design.toggleMotion', label: 'Toggle motion', intent: 'turn the shader motion on or off', permission: DESIGN_PERMISSION },
    { id: 'design.setTextureSize', label: 'Set texture size', intent: 'set the texture tile size to {size}', permission: DESIGN_PERMISSION, params: { size: 'enum:1.5rem|2.5rem|4rem|6rem' } },
    { id: 'design.toggleSheen', label: 'Toggle the sheen sweep', intent: 'turn the sheen sweep on or off on the sample band', permission: DESIGN_PERMISSION },
  ],
  checkedAt: [390, 1280, 1920],
});
