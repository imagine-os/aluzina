/**
 * Aluzina brand vector paths, extracted from MANUAL DE MARCA ALUZINA (docs/source/brand-kit/)
 * with PyMuPDF: page clip paths and transforms applied, every shape re-based to its own
 * 0 0 w h viewBox, coordinates rounded to 2 decimals (1 unit = 1 pt in the manual).
 * Render through the BrandMark atom; paint (metal gradient, iridescent, outline) is applied
 * there so the shapes follow the gold / silver switch. Standalone coloured SVGs for docs and
 * favicons live in public/brand/. Data, not instructions: do not hand-edit coordinates.
 */

export interface BrandShape {
  viewBox: string;
  width: number;
  height: number;
  /** One `d` per closed shape (fills) or stroke group (outlines). */
  paths: readonly string[];
}

export type GlyphName = 'fuego' | 'agua' | 'aire' | 'tierra' | 'neutro' | 'productos' | 'espacios' | 'arte';
export const GLYPH_NAMES: readonly GlyphName[] = ['fuego', 'agua', 'aire', 'tierra', 'neutro', 'productos', 'espacios', 'arte'];

/** ALUZINA wordmark: seven custom Didone capitals with sparkle feet, one compound fill path (nonzero). */
export const wordmark: BrandShape = {
  viewBox: '0 0 469.86 72.93',
  width: 469.86,
  height: 72.93,
  paths: [
    'M427.31 0L424.49 7.85C424.49 7.85 440.89 58.31 441.12 59.02C444.44 70.77 433.94 72.91 433.94 72.91L469.86 72.91C469.86 72.91 463.45 69.14 459.98 59.28L440.73 0L427.31 0ZM368.28 0C377.35 2.51 378.28 8.14 378.5 13.62L379.42 13.62C379.62 8.14 380.55 2.51 389.63 0L368.28 0ZM311.36 0L311.36 0.53C312.53 0.76 315.58 1.04 318.82 4.77L366.17 72.88L378.37 72.88L378.37 60.49L373.77 53.86L336.33 0L311.36 0M278.38 0H296.67V72.91H278.38ZM244.58 0L202.51 72.91L222.32 72.91L264.38 0L244.58 0ZM199.48 0C208.56 2.51 209.5 8.14 209.71 13.62L210.62 13.62C210.83 8.14 211.76 2.51 220.85 0L199.48 0ZM152.21 0L152.21 36.53C152.21 71.2 171.52 72.93 182.81 72.93C183.85 72.93 187.27 72.91 187.27 72.91L187.27 70.93C187.27 70.93 171.51 69.32 171.51 50.15L171.51 0L152.21 0M86.63 0H104.92V72.91H86.63ZM33.83 0L31 7.85C31 7.85 47.4 58.31 47.63 59.02C50.96 70.77 40.45 72.91 40.45 72.91L76.38 72.91C76.38 72.91 69.96 69.14 66.5 59.28L47.25 0L33.83 0ZM259.97 56.85C258.96 65.07 252.49 71.59 244.31 72.62L244.31 72.89L260.22 72.89L260.22 56.85L259.97 56.85ZM141.02 56.86C140.01 65.07 133.53 71.59 125.36 72.63L125.36 72.91L141.27 72.91L141.27 56.86L141.02 56.86ZM406.31 59.21C405.91 60.25 405.52 61.29 405.05 62.3C401.19 70.52 393.52 72.79 393.48 72.91L419.08 72.91C414.11 71.41 405.75 67.95 406.62 60.28C406.66 59.93 406.72 59.57 406.79 59.21L406.31 59.21ZM12.83 59.21C12.43 60.25 12.03 61.29 11.56 62.3C7.7 70.52 0.03 72.79 0 72.91L25.59 72.91C20.62 71.41 12.27 67.95 13.13 60.28C13.18 59.93 13.24 59.57 13.3 59.21L12.83 59.21ZM319.6 59.29C319.4 64.77 318.46 70.4 309.38 72.91L330.74 72.91C321.66 70.4 320.73 64.77 320.52 59.29L319.6 59.29Z',
  ],
};
/**
 * Monogram: the A alone. `stem` takes a secondary tone (periwinkle / aqua / lime) or a finish,
 * `foot` (the small left sparkle foot) is ALWAYS flat metal in the manual.
 */
export const monogram = {
  viewBox: '0 0 109.06 104.11',
  width: 109.06,
  height: 104.11,
  stem: 'M94.96 84.65C99.91 98.73 109.06 104.11 109.06 104.11L57.77 104.11C57.77 104.11 72.77 101.06 68.02 84.29C67.69 83.27 44.27 11.2 44.27 11.2L48.31 0L67.47 0L94.96 84.65Z',
  foot: 'M18.76 86.09C18.82 85.57 18.9 85.06 19 84.55L18.32 84.55C17.74 86.04 17.19 87.53 16.51 88.96C11 100.7 0.04 103.94 0 104.11L36.54 104.11C29.45 101.97 17.52 97.04 18.76 86.09Z',
} as const;

/** Descriptor slash: the thin diagonal beside "UNIVERSO DE DISEÑO". `left` leans \\ (text to its right), `right` leans / (mirror, text to its left). Stroke, 2 units. */
export const descriptorSlash = {
  left: { viewBox: '0 0 32 53.26', width: 32.0, height: 53.26, paths: ['M30.5 51.76L1.5 1.5'] } as BrandShape,
  right: { viewBox: '0 0 32 53.26', width: 32.0, height: 53.26, paths: ['M1.5 51.76L30.5 1.5'] } as BrandShape,
} as const;

/**
 * Outline glyphs (stroked, ~1.7-2.4 unit gold line in the manual; BrandMark uses a non-scaling stroke).
 * Five alchemical themes plus the three verticals PRODUCTOS / ESPACIOS / ARTE.
 */
export const glyphs: Record<GlyphName, BrandShape> = {
  /** FUEGO (fire): up triangle. */
  fuego: { viewBox: '0 0 42.76 37.57', width: 42.76, height: 37.57, paths: ['M2 35.57L21.38 2L40.76 35.57L2 35.57'] },
  /** AGUA (water): down triangle. */
  agua: { viewBox: '0 0 42.77 37.57', width: 42.77, height: 37.57, paths: ['M2 2L21.38 35.57L40.77 2L2 2'] },
  /** AIRE (air): up triangle with a bar. */
  aire: { viewBox: '0 0 48.09 37.57', width: 48.09, height: 37.57, paths: ['M5.31 35.57L24.69 2L44.07 35.57L5.31 35.57', 'M2 15.82L46.09 15.82'] },
  /** TIERRA (earth): down triangle with a bar. */
  tierra: { viewBox: '0 0 48.09 37.57', width: 48.09, height: 37.57, paths: ['M5.3 2L24.69 35.57L44.07 2L5.3 2', 'M2 21.75L46.09 21.75'] },
  /** NEUTRO: two overlapping diamonds / crossed chevrons. */
  neutro: { viewBox: '0 0 41.19 47.5', width: 41.19, height: 47.5, paths: ['M2.04 34.18L20.58 2L39.19 34.18', 'M2 13.32L20.58 45.5L39.15 13.32'] },
  /** PRODUCTOS vertical: tall kite with nested inner kite. */
  productos: { viewBox: '0 0 52.76 104.67', width: 52.76, height: 104.67, paths: ['M2.1 73.79C2.1 73.79 26.53 2 26.58 2.17C26.64 2.35 50.66 73.79 50.66 73.79', 'M50.76 73.94 L26.38 49.56 L2 73.94 L26.38 98.32Z', 'M8.66 102.67L26.38 50.4L44.1 102.67'] },
  /** ESPACIOS vertical: circle enclosing a diamond and a star of triangles. */
  espacios: { viewBox: '0 0 126.44 126.44', width: 126.44, height: 126.44, paths: ['M114.42 63.22C114.42 91.5 91.5 114.42 63.22 114.42C34.95 114.42 12.03 91.5 12.03 63.22C12.03 34.95 34.95 12.03 63.22 12.03C91.5 12.03 114.42 34.95 114.42 63.22', 'M63.22 124.44 L124.44 63.22 L63.22 2 L2 63.22Z', 'M2 63.22L94.11 93.56L63.22 2L32.34 93.56L124.44 63.22'] },
  /** ARTE vertical: six nested chevrons. */
  arte: { viewBox: '0 0 102.24 75.93', width: 102.24, height: 75.93, paths: ['M100.24 73.72L51.12 2L2 73.72', 'M100.24 73.93L51.12 13.82L2 73.93', 'M100.24 73.93L51.12 24.63L2 73.93', 'M100.24 73.93L51.12 33.38L2 73.93', 'M100.24 73.93L51.12 40.4L2 73.93', 'M100.24 73.93L51.12 46.42L2 73.93'] },
};
