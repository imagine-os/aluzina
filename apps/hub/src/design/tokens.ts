/**
 * Single source of design tokens (P-07). `npm run tokens` turns this file into
 * src/styles/tokens.css. Never edit tokens.css by hand.
 *
 * Brand cues taken from aluzinaa.com (data only): near-black neutral base,
 * warm amber "emotional lighting" accent, Playfair Display headings, Roboto body.
 */

export type ThemeName = 'light' | 'dark';

export interface ColorSet {
  bg: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  focus: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ScaleBand {
  /** Viewport width in CSS px where this band starts (responsive matrix P-01). */
  minWidth: number;
  /** Multiplier applied to the 16 px root font size; everything else is in rem. */
  scale: number;
}

export const tokens = {
  color: {
    light: {
      bg: '#fbf9f5',
      surface: '#ffffff',
      surfaceRaised: '#fff7e6',
      text: '#1c1917',
      textMuted: '#6b655e',
      border: '#e7e2d9',
      primary: '#1c1917',
      primaryText: '#fbf9f5',
      accent: '#d97706',
      accentSoft: '#fde68a',
      accentText: '#1c1917',
      focus: '#b45309',
      success: '#15803d',
      warning: '#b45309',
      danger: '#b91c1c',
    },
    dark: {
      bg: '#141210',
      surface: '#1f1b17',
      surfaceRaised: '#2a241d',
      text: '#f5efe6',
      textMuted: '#b3a897',
      border: '#3a3229',
      primary: '#f5efe6',
      primaryText: '#141210',
      accent: '#fbbf24',
      accentSoft: '#4a3a12',
      accentText: '#141210',
      focus: '#fcd34d',
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#f87171',
    },
  } satisfies Record<ThemeName, ColorSet>,

  font: {
    sans: "'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif",
    display: "'Playfair Display', Georgia, 'Times New Roman', serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
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
