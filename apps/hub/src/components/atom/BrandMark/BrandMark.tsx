import { useId } from 'react';
import { cx } from '../../../design/cx';
import { descriptorSlash, glyphs, monogram, wordmark, type BrandShape, type GlyphName } from '../../../brand/paths';
import './BrandMark.css';

export type BrandMarkKind = 'wordmark' | 'monogram' | 'descriptor' | 'glyph';
export type BrandMarkFinish = 'metal' | 'iridescent' | 'outline' | 'flat';
export type BrandMarkTone = 'periwinkle' | 'aqua' | 'lime';
export type BrandMarkSize = 'sm' | 'md' | 'lg' | 'xl';
/** The two descriptor lockups the silver manual prints (D-052: which one is primary is open). */
export type BrandMarkDescriptor = 'universo' | 'interiorismo';

export interface BrandMarkProps {
  kind: BrandMarkKind;
  /** Required when kind is `glyph`. */
  glyph?: GlyphName;
  /**
   * Paint. Glyphs are outlines: the finish colours their stroke. Default `iridescent` for the wordmark
   * (the primary logo since the silver edition, D-050) and `metal` for everything else.
   */
  finish?: BrandMarkFinish;
  /** Monogram stem colour (the manual's three official variants). The small foot stays flat metal. */
  tone?: BrandMarkTone;
  /**
   * Descriptor text. `universo` = "UNIVERSO DE DISEÑO" in flat metal text (default); `interiorismo` =
   * "INTERIORISMO / ILUMINACIÓN" with the slash, in periwinkle: a logo lockup (role="img"), never UI text.
   */
  variant?: BrandMarkDescriptor;
  /** Height in rem (sm 1.25, md 2, lg 3.5, xl 6); scales with --scale. Default `md`. */
  size?: BrandMarkSize;
  /** Accessible name. Decorative (aria-hidden) when absent, except the interiorismo lockup, which is always named. */
  label?: string;
  className?: string;
}

const DESCRIPTOR_TEXT: Record<BrandMarkDescriptor, readonly [string, string]> = {
  universo: ['UNIVERSO', 'DE DISEÑO'],
  interiorismo: ['INTERIORISMO', 'ILUMINACIÓN'],
};

/**
 * Gradient defs painted with the CSS vars, so they follow theme and the metal switch: the five
 * `--metal-stop-*` colours are the active metal's ramp resampled at these fixed offsets (tokens.ts).
 */
function Defs({ id, horizontal }: { id: string; horizontal: boolean }) {
  return (
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--metal-stop-1)' }} />
        <stop offset="0.22" style={{ stopColor: 'var(--metal-stop-2)' }} />
        <stop offset="0.48" style={{ stopColor: 'var(--metal-stop-3)' }} />
        <stop offset="0.72" style={{ stopColor: 'var(--metal-stop-4)' }} />
        <stop offset="1" style={{ stopColor: 'var(--metal-stop-5)' }} />
      </linearGradient>
      <linearGradient id={`${id}-iri`} x1="0" y1="0" x2={horizontal ? '1' : '0'} y2={horizontal ? '0' : '1'}>
        <stop offset="0.09" style={{ stopColor: 'var(--brand-periwinkle)' }} />
        <stop offset="0.48" style={{ stopColor: 'var(--brand-aqua)' }} />
        <stop offset="0.96" style={{ stopColor: 'var(--brand-lime)' }} />
      </linearGradient>
    </defs>
  );
}

function paint(id: string, finish: BrandMarkFinish): string {
  if (finish === 'metal') return `url(#${id}-metal)`;
  if (finish === 'iridescent') return `url(#${id}-iri)`;
  return 'var(--color-metal-text)';
}

export function BrandMark({ kind, glyph, finish, tone, variant = 'universo', size = 'md', label, className }: BrandMarkProps) {
  const id = useId().replace(/:/g, '');
  const resolved: BrandMarkFinish = finish ?? (kind === 'wordmark' ? 'iridescent' : 'metal');
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  const classes = cx('brand-mark', `brand-mark--${kind}`, `brand-mark--${size}`, `brand-mark--${resolved}`, className);

  if (kind === 'descriptor') {
    const slash = descriptorSlash.left;
    const lockup = variant === 'interiorismo';
    // The periwinkle lockup is a logo (1.5:1 on white): it always carries a name, never reads as UI text.
    const name = label ?? (lockup ? 'Aluzina: interiorismo / iluminación' : undefined);
    const descA11y = name ? { role: 'img' as const, 'aria-label': name } : { 'aria-hidden': true as const };
    return (
      <span className={cx(classes, `brand-mark--${variant}`)} {...descA11y}>
        <svg className="brand-mark__svg" viewBox={slash.viewBox} focusable="false">
          <path d={slash.paths[0]} className="brand-mark__stroke brand-mark__slash" />
        </svg>
        <span className="brand-mark__descriptor" aria-hidden="true">
          {DESCRIPTOR_TEXT[variant].map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </span>
    );
  }

  if (kind === 'monogram') {
    const stemFill = tone ? `var(--brand-${tone})` : paint(id, resolved);
    const outline = resolved === 'outline';
    return (
      <svg className={cx(classes, 'brand-mark__svg')} viewBox={monogram.viewBox} focusable="false" {...a11y}>
        <Defs id={id} horizontal={false} />
        <path d={monogram.foot} className={outline ? 'brand-mark__stroke' : undefined} fill={outline ? 'none' : 'var(--metal-base)'} />
        <path d={monogram.stem} className={outline ? 'brand-mark__stroke' : undefined} fill={outline ? 'none' : stemFill} />
      </svg>
    );
  }

  if (kind === 'glyph') {
    const shape: BrandShape = glyphs[glyph ?? 'neutro'];
    return (
      <svg className={cx(classes, 'brand-mark__svg')} viewBox={shape.viewBox} focusable="false" {...a11y}>
        <Defs id={id} horizontal={false} />
        {shape.paths.map((d, i) => (
          <path key={i} d={d} className="brand-mark__stroke" style={{ stroke: paint(id, resolved === 'outline' ? 'flat' : resolved) }} />
        ))}
      </svg>
    );
  }

  const outline = resolved === 'outline';
  return (
    <svg className={cx(classes, 'brand-mark__svg')} viewBox={wordmark.viewBox} focusable="false" {...a11y}>
      <Defs id={id} horizontal />
      <path d={wordmark.paths[0]} className={outline ? 'brand-mark__stroke' : undefined} fill={outline ? 'none' : paint(id, resolved)} />
    </svg>
  );
}
