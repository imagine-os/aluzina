/**
 * Single source of design tokens (P-07). `npm run tokens` turns this file into
 * src/styles/tokens.css. Never edit tokens.css by hand.
 *
 * Brand source: MANUAL DE MARCA ALUZINA (docs/source/brand-kit/, extraction.md).
 * Primary is a METALLIC gold (Pantone 875 C, print fallback #98876D, on-screen
 * highlight #F1D7AA); secondaries are three pastels (periwinkle / aqua / lime) that
 * only ever appear as fills and tints, never as text; ink is #231F20; one type
 * family (DIN Round Pro) where headings differ by weight and tracking, not by face.
 * The manual has no dark-mode guidance: the dark set below is inferred (see
 * docs/design/brand-system.md). Justin: gold will likely become silver, so the
 * metal is a switch (`metalDefault`) and a runtime attribute (`<html data-metal>`).
 */

export type ThemeName = 'light' | 'dark';
export type MetalName = 'gold' | 'silver';

export interface ColorSet {
  bg: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  border: string;
  /** Gold-tinted rule line: section separators, dividers (`hr`, `.hairline`). */
  hairline: string;
  primary: string;
  primaryText: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  focus: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  tintPeriwinkle: string;
  tintAqua: string;
  tintLime: string;
  /** Flat metal that is readable as text on this theme (outlines, eyebrows, descriptor). */
  metalText: string;
  /** Scrim behind Modal / Drawer (rgb with alpha). */
  overlay: string;
  /** Shadow colour (rgb with alpha); the `shadow.*` tokens build on it. */
  shadow: string;
}

export interface MetalSet {
  base: string;
  highlight: string;
  shade: string;
}

export interface ScaleBand {
  /** Viewport width in CSS px where this band starts (responsive matrix P-01). */
  minWidth: number;
  /** Multiplier applied to the 16 px root font size; everything else is in rem. */
  scale: number;
}

export const tokens = {
  /** Raw brand constants exactly as the manual prints them. Emitted as `--brand-*`; prefer the semantic `color.*` in UI. */
  brand: {
    /** Pantone 875 C, CMYK 40/41/59/7: the print fallback for the metallic gold. */
    gold: '#98876D',
    /** Highlight stop inside the metallic gradient (not a palette colour). */
    goldHighlight: '#F1D7AA',
    /** Pantone 270 C. */
    periwinkle: '#C2D1F7',
    /** Pantone 3245 C. */
    aqua: '#82FEE7',
    /** Pantone 379 C. */
    lime: '#DDFF79',
    /** Caption ink (rich black). */
    ink: '#231F20',
  },

  /**
   * Metal finishes. `metalDefault` picks the one emitted on `:root`; every one is also
   * emitted as `:root[data-metal="<name>"]` so the switch can be previewed at runtime.
   * Silver = Pantone 877 C suggestion from the extraction (base #A7A9AC).
   */
  metal: {
    gold: { base: '#98876D', highlight: '#F1D7AA', shade: '#6F6250' },
    silver: { base: '#A7A9AC', highlight: '#E6E7E8', shade: '#6E7175' },
  } satisfies Record<MetalName, MetalSet>,
  metalDefault: 'gold' as MetalName,

  color: {
    light: {
      bg: '#FBFBF9',
      surface: '#FFFFFF',
      surfaceRaised: '#F4F1EB',
      text: '#231F20',
      textMuted: '#6B655C',
      border: '#E4DFD6',
      hairline: '#CFC4B2',
      primary: '#231F20',
      primaryText: '#FFFFFF',
      accent: '#98876D',
      accentSoft: '#EFEBE3',
      accentText: '#4E4333',
      focus: '#6F6250',
      success: '#4D7A0B',
      successSoft: '#F1FBD6',
      warning: '#9A6B10',
      warningSoft: '#FBF3DD',
      danger: '#B4322A',
      dangerSoft: '#FCE8E6',
      info: '#4A63B8',
      infoSoft: '#E9EEFC',
      tintPeriwinkle: '#E9EEFC',
      tintAqua: '#DFFCF6',
      tintLime: '#F3FCD9',
      metalText: '#6F6250',
      overlay: 'rgb(35 31 32 / 0.45)',
      shadow: 'rgb(35 31 32 / 0.12)',
    },
    dark: {
      bg: '#121110',
      surface: '#1B1917',
      surfaceRaised: '#242120',
      text: '#F3EFE8',
      textMuted: '#A89F92',
      border: '#34302B',
      hairline: '#5A5044',
      primary: '#F3EFE8',
      primaryText: '#121110',
      accent: '#B9A88A',
      accentSoft: '#2C2620',
      accentText: '#E7D7B5',
      focus: '#F1D7AA',
      success: '#B9E35A',
      successSoft: '#2A3314',
      warning: '#E3C070',
      warningSoft: '#332A14',
      danger: '#F08A80',
      dangerSoft: '#3A1D1A',
      info: '#AFC0F2',
      infoSoft: '#1F2538',
      tintPeriwinkle: '#232A3D',
      tintAqua: '#17332E',
      tintLime: '#26301A',
      metalText: '#D9C9A6',
      overlay: 'rgb(0 0 0 / 0.6)',
      shadow: 'rgb(0 0 0 / 0.5)',
    },
  } satisfies Record<ThemeName, ColorSet>,

  /**
   * Gradients reference the metal vars so they follow the gold / silver switch.
   * Metal stops decoded from the manual's shading (0.10 / 0.29 / 0.48 / 0.72, rounded);
   * iridescent stops 0.09 / 0.48 / 0.96 (flat plateaus at both ends).
   */
  gradient: {
    metal:
      'linear-gradient(135deg, var(--metal-base) 0%, var(--metal-highlight) 22%, var(--metal-base) 48%, var(--metal-highlight) 72%, var(--metal-base) 100%)',
    metalSoft:
      'linear-gradient(135deg, color-mix(in srgb, var(--metal-base) 30%, var(--color-surface)) 0%, color-mix(in srgb, var(--metal-highlight) 30%, var(--color-surface)) 22%, color-mix(in srgb, var(--metal-base) 30%, var(--color-surface)) 48%, color-mix(in srgb, var(--metal-highlight) 30%, var(--color-surface)) 72%, color-mix(in srgb, var(--metal-base) 30%, var(--color-surface)) 100%)',
    iridescent: 'linear-gradient(180deg, #C2D1F7 9%, #82FEE7 48%, #DDFF79 96%)',
    iridescentX: 'linear-gradient(90deg, #C2D1F7 9%, #82FEE7 48%, #DDFF79 96%)',
    iridescentSoft:
      'linear-gradient(180deg, color-mix(in srgb, #C2D1F7 35%, var(--color-surface)) 9%, color-mix(in srgb, #82FEE7 35%, var(--color-surface)) 48%, color-mix(in srgb, #DDFF79 35%, var(--color-surface)) 96%)',
  },

  /** One family (DIN Round Pro; Rubik is the free fallback). Headings differ by weight + tracking. */
  font: {
    sans: "'DIN Round Pro', 'Rubik', system-ui, -apple-system, 'Segoe UI', sans-serif",
    display: "'DIN Round Pro', 'Rubik', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },

  /** Letter-spacing for uppercase labels: `caps` = captions / eyebrows, `wide` = descriptor lockup. */
  tracking: {
    caps: '0.18em',
    wide: '0.35em',
  },

  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
    black: 900,
  },

  radius: {
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1.25rem',
    pill: '999px',
  },

  space: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.5rem',
    6: '2rem',
    7: '3rem',
    8: '4rem',
  },

  /** Elevation, built on the theme's `--color-shadow`. */
  shadow: {
    sm: '0 1px 2px var(--color-shadow)',
    md: '0 4px 12px var(--color-shadow)',
    lg: '0 12px 32px var(--color-shadow)',
  },

  /** Rule-line thickness for `hr` / `.hairline` and outline marks. */
  hairline: '1px',

  /** Minimum interactive target (P-03), in rem so it grows with --scale. */
  target: '2.75rem',
  /** Focus ring width (P-01): never below 3 px, grows on large screens. */
  focusRing: 'max(3px, 0.1875rem)',

  /**
   * Responsive matrix bands. Body text is 16 px up to 1920 and grows from there
   * so a 4K TV reads from ten feet (P-01). One entry per matrix width.
   */
  scale: [
    { minWidth: 0, scale: 1 },
    { minWidth: 360, scale: 1 },
    { minWidth: 390, scale: 1 },
    { minWidth: 768, scale: 1 },
    { minWidth: 1280, scale: 1 },
    { minWidth: 1920, scale: 1.125 },
    { minWidth: 2560, scale: 1.5 },
    { minWidth: 3840, scale: 2 },
  ] satisfies ScaleBand[],
} as const;

export type Tokens = typeof tokens;
