/**
 * Design token SCHEMA (P-07, tp-06, D-096): the platform half. It defines the token types, the input shape a
 * tenant fills (`TokenValues`), the platform-owned sizes (the `--scale` bands of the responsive matrix, the
 * minimum target, the focus ring, icon sizes) and `composeTokens(values)`, which merges a tenant's values into
 * the full `tokens` object. The tenant's values live in `src/tenant/brand/tokens.values.ts` (Aluzina: silver
 * edition of the brand manual). `npm run tokens` (scripts/gen-tokens.mjs) composes schema + values into
 * src/styles/tokens.css; never edit tokens.css by hand. Pages keep importing `tokens` from here.
 */

import { tokenValues, type MetalName } from '../tenant/brand/tokens.values.ts';

export type { MetalName };
export type ThemeName = 'light' | 'dark';

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

/** What a tenant supplies (`tenant.json` `brand.tokenValues`); the schema adds everything else. */
export interface TokenValues {
  /** Raw brand constants, emitted as `--brand-*`. */
  brand: Record<string, string>;
  /** Metal finishes by name; each is emitted as `:root[data-metal="<name>"]`. */
  metal: Record<string, MetalSet>;
  /** The finish emitted on `:root`. */
  metalDefault: string;
  color: Record<ThemeName, ColorSet>;
  /** Brand gradients other than the metal pair (which is derived from `metal[metalDefault]`). */
  gradient: Record<string, string>;
  font: { sans: string; display: string; mono: string };
  tracking: Record<string, string>;
  weight: Record<string, number>;
  radius: Record<string, string>;
  space: Record<string | number, string>;
  shadow: Record<string, string>;
  /** Rule-line thickness for `hr` / `.hairline` and outline marks. */
  hairline: string;
}

/** Each hex stop mixed 30% into the surface: a metal wash for large backgrounds behind text. */
export function softenGradient(gradient: string, amount = 30): string {
  return gradient.replace(/#[0-9A-Fa-f]{6}\b/g, (hex) => `color-mix(in srgb, ${hex} ${amount}%, var(--color-surface))`);
}

/** Platform-owned tokens: the same for every tenant (P-01, P-03). */
const platform = {
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

/** The full token object for tenant values `V`: every tenant field keeps its literal type from the values file. */
export interface ComposedTokens<V extends TokenValues> {
  readonly brand: V['brand'];
  readonly metal: V['metal'];
  readonly metalDefault: V['metalDefault'];
  readonly color: V['color'];
  readonly gradient: { readonly metal: string; readonly metalSoft: string } & V['gradient'];
  readonly font: V['font'];
  readonly tracking: V['tracking'];
  readonly weight: V['weight'];
  readonly radius: V['radius'];
  readonly space: V['space'];
  readonly shadow: V['shadow'];
  readonly icon: typeof platform.icon;
  readonly hairline: V['hairline'];
  readonly target: typeof platform.target;
  readonly focusRing: typeof platform.focusRing;
  readonly scale: typeof platform.scale;
}

/** Merge a tenant's values with the platform tokens; key order is the order gen-tokens emits. */
export function composeTokens<V extends TokenValues>(values: V): ComposedTokens<V> {
  return {
    brand: values.brand,
    metal: values.metal,
    metalDefault: values.metalDefault,
    color: values.color,
    /**
     * Gradients. The metal pair is derived from `metal[metalDefault]` here and re-emitted per metal
     * inside `:root[data-metal]` by gen-tokens, so `--gradient-metal` always matches the active finish.
     */
    gradient: {
      metal: values.metal[values.metalDefault].gradient,
      metalSoft: softenGradient(values.metal[values.metalDefault].gradient),
      ...values.gradient,
    },
    font: values.font,
    tracking: values.tracking,
    weight: values.weight,
    radius: values.radius,
    space: values.space,
    shadow: values.shadow,
    icon: platform.icon,
    hairline: values.hairline,
    target: platform.target,
    focusRing: platform.focusRing,
    scale: platform.scale,
  } as ComposedTokens<V>;
}

/** The filled tokens of this build's tenant. */
export const tokens = composeTokens(tokenValues);

export type Tokens = typeof tokens;
