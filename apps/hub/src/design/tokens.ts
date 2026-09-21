/**
 * Single source of design tokens (P-07). `npm run tokens` turns this file into
 * src/styles/tokens.css. Never edit tokens.css by hand.
 *
 * Brand source: MANUAL DE MARCA ALUZINA, silver edition of 2026-09-21
 * (docs/source/brand-kit/MANUAL-DE-MARCA-ALUZINA-silver-2026-09-21.pdf, extraction-silver.md).
 * Primary is a METALLIC silver (Pantone 877 C, flat #C0C0C0 = RGB 192,192,192, CMYK 0/0/0/25);
 * on screen the metal is a smooth ramp white -> #4D4D4D decoded from the manual's only metallic
 * shading. The primary logo is the IRIDESCENT wordmark on white; the footer band is flat black.
 * Secondaries are three pastels (periwinkle / aqua / lime) that only ever appear as fills, tints
 * and gradient stops, never as text; caption ink is #231F20; one type family (DIN Round Pro) where
 * headings differ by weight and tracking, not by face. The manual has no dark-mode guidance: the
 * dark set below is inferred (docs/design/brand-system.md). Gold (Pantone 875 C) is the previous
 * edition and stays defined so it can be previewed (`<html data-metal="gold">`), D-050.
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
  /** Flat-metal rule line: section separators, dividers (`hr`, `.hairline`). */
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
  /** The flat print value (palette swatch, outlines, monogram foot, descriptor text). */
  base: string;
  /** Brightest stop of the ramp. */
  highlight: string;
  /** Darkest stop of the ramp. */
  shade: string;
  /** The CSS gradient exactly as decoded from the manual (135deg). Emitted as `--gradient-metal`. */
  gradient: string;
  /**
   * The same ramp resampled at the five fixed SVG stop offsets 0 / 0.22 / 0.48 / 0.72 / 1
   * (BrandMark paints its gradient defs with `--metal-stop-1..5`, so the marks follow the switch).
   */
  stops: readonly [string, string, string, string, string];
}

export interface ScaleBand {
  /** Viewport width in CSS px where this band starts (responsive matrix P-01). */
  minWidth: number;
  /** Multiplier applied to the 16 px root font size; everything else is in rem. */
  scale: number;
}

/** Each hex stop mixed 30% into the surface: a metal wash for large backgrounds behind text. */
export function softenGradient(gradient: string, amount = 30): string {
  return gradient.replace(/#[0-9A-Fa-f]{6}\b/g, (hex) => `color-mix(in srgb, ${hex} ${amount}%, var(--color-surface))`);
}

const metal = {
  /** Previous edition (Pantone 875 C): two brushed specular streaks, stop bounds decoded from the gold manual. Preview only. */
  gold: {
    base: '#98876D',
    highlight: '#F1D7AA',
    shade: '#6F6250',
    gradient: 'linear-gradient(135deg, #98876D 0%, #F1D7AA 22%, #98876D 48%, #F1D7AA 72%, #98876D 100%)',
    stops: ['#98876D', '#F1D7AA', '#98876D', '#F1D7AA', '#98876D'],
  },
  /** Current edition (Pantone 877 C): one smooth ramp white -> #4D4D4D, the manual's single metallic shading (no bands). */
  silver: {
    base: '#C0C0C0',
    highlight: '#FFFFFF',
    shade: '#4D4D4D',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 37%, #999999 69%, #4D4D4D 100%)',
    stops: ['#FFFFFF', '#EDEDED', '#C8C8C8', '#929292', '#4D4D4D'],
  },
} satisfies Record<MetalName, MetalSet>;

const metalDefault: MetalName = 'silver';

export const tokens = {
  /** Raw brand constants exactly as the manual prints them. Emitted as `--brand-*`; prefer the semantic `color.*` in UI. */
  brand: {
    /** Pantone 877 C, RGB 192,192,192, CMYK 0/0/0/25: the flat print value of the metallic silver (2026-09-21 edition). */
    silver: '#C0C0C0',
    /** Pantone 875 C, CMYK 40/41/59/7: the previous edition's metallic gold (kept for the gold preview). */
    gold: '#98876D',
    /** Highlight stop inside the gold gradient (previous edition, not a palette colour). */
    goldHighlight: '#F1D7AA',
    /** Pantone 270 C. */
    periwinkle: '#C2D1F7',
    /** Pantone 3245 C. */
    aqua: '#82FEE7',
    /** Pantone 379 C. */
    lime: '#DDFF79',
    /** Caption ink (rich black). */
    ink: '#231F20',
    /** Flat black: the footer band and one texture disc (silver edition). `.surface-ink` uses it. */
    black: '#000000',
  },

  /**
   * Metal finishes. `metalDefault` picks the one emitted on `:root`; every one is also emitted as
   * `:root[data-metal="<name>"]` (with its own `--gradient-metal*` and `--metal-stop-*`) so the
   * switch can be previewed at runtime. Silver is the current edition (D-050); gold is the previous one.
   */
  metal,
  metalDefault,

  color: {
    light: {
      bg: '#FAFAFA',
      surface: '#FFFFFF',
      surfaceRaised: '#F2F2F2',
      text: '#111111',
      textMuted: '#5F5F5F',
      border: '#E2E2E2',
      hairline: '#C0C0C0',
      primary: '#111111',
      primaryText: '#FFFFFF',
      accent: '#8A8A8A',
      accentSoft: '#EEEEEE',
      accentText: '#3F3F3F',
      focus: '#4D4D4D',
      success: '#4D7A0B',
      successSoft: '#F1FBD6',
      warning: '#956710',
      warningSoft: '#FBF3DD',
      danger: '#B4322A',
      dangerSoft: '#FCE8E6',
      info: '#4A63B8',
      infoSoft: '#E9EEFC',
      tintPeriwinkle: '#E9EEFC',
      tintAqua: '#DFFCF6',
      tintLime: '#F3FCD9',
      metalText: '#5C5C5C',
      overlay: 'rgb(17 17 17 / 0.45)',
      shadow: 'rgb(17 17 17 / 0.12)',
    },
    dark: {
      bg: '#0E0E0E',
      surface: '#171717',
      surfaceRaised: '#222222',
      text: '#F2F2F2',
      textMuted: '#A6A6A6',
      border: '#333333',
      hairline: '#5A5A5A',
      primary: '#F2F2F2',
      primaryText: '#0E0E0E',
      accent: '#C0C0C0',
      accentSoft: '#2A2A2A',
      accentText: '#E0E0E0',
      focus: '#E0E0E0',
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
      metalText: '#C0C0C0',
      overlay: 'rgb(0 0 0 / 0.6)',
      shadow: 'rgb(0 0 0 / 0.5)',
    },
  } satisfies Record<ThemeName, ColorSet>,

  /**
   * Gradients. The metal pair is derived from `metal[metalDefault]` here and re-emitted per metal
   * inside `:root[data-metal]` by gen-tokens, so `--gradient-metal` always matches the active finish.
   * Iridescent stops 0.09 / 0.48 / 0.96 (flat plateaus at both ends), byte-identical in both editions.
   */
  gradient: {
    metal: metal[metalDefault].gradient,
    metalSoft: softenGradient(metal[metalDefault].gradient),
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

  /**
   * Icon sizes (Icon atom, docs/design/icons.md), in rem so they follow `--scale` up to 4K: sm inline with
   * text, md nav rows and card headers, lg section headers and the icon sheet, xl empty thumbnail tiles.
   */
  icon: {
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  /** Rule-line thickness for `hr` / `.hairline` and outline marks (the silver manual draws every line at 1 pt). */
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
