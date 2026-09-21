import { useState } from 'react';
import { BrandMark, type BrandMarkTone } from '../../atom/BrandMark/BrandMark';
import { Placeholder } from '../../atom/Placeholder/Placeholder';
import { useT } from '../../../i18n/I18nProvider';
import './SurfaceCard.css';

/** `stub`: the route exists and opens, but the page is a PageStub (portal cards before their module lands). */
export type SurfaceStatus = 'live' | 'stub' | 'planned';

interface SurfaceCardProps {
  code: string;
  title: string;
  description: string;
  status: SurfaceStatus;
  statusLabel: string;
  /** Present when the surface opens as a link. */
  href?: string;
  external?: boolean;
  /** Alternative to href: the card is a button (portal cards switch the session user, then navigate). */
  onActivate?: () => void;
  ctaLabel?: string;
  /**
   * Thumbnail of the page the card opens (`./thumbs/<code>.jpg`, generated at deploy time, D-011).
   * Omitted for planned surfaces; a failed load falls back to the bilingual "No preview yet" tile.
   */
  image?: string;
}

const TONES: BrandMarkTone[] = ['periwinkle', 'aqua', 'lime'];

/** Stable monogram tint per surface code (O-01, K-05...). */
function toneOf(code: string): BrandMarkTone {
  let h = 0;
  for (const ch of code) h = (h * 31 + (ch.codePointAt(0) ?? 0)) % 997;
  return TONES[h % TONES.length];
}

/** 640 x 400 thumbnail slot with a fixed aspect ratio so the grid never shifts (P-01). */
function Thumb({ image, code, title }: { image?: string; code: string; title: string }) {
  const { t } = useT();
  const [broken, setBroken] = useState(false);
  const empty = !image || broken;
  return (
    <span className={`surface-card__thumb${empty ? ' surface-card__thumb--empty' : ''}`} data-thumb={empty ? 'placeholder' : 'image'}>
      {empty ? (
        <span className="surface-card__thumb-tile" aria-hidden="true">
          <span className="surface-card__thumb-mark">
            <BrandMark kind="monogram" tone={toneOf(code)} size="lg" />
          </span>
          <span className="surface-card__thumb-text">{t('core.thumb.none')}</span>
          <span className="surface-card__thumb-code">{code}</span>
        </span>
      ) : (
        <img
          src={image}
          alt={t('core.thumb.alt', { title })}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      )}
    </span>
  );
}

function Body({ code, title, description, status, statusLabel, ctaLabel, image }: SurfaceCardProps) {
  return (
    <>
      <Thumb image={image} code={code} title={title} />
      <div className="surface-card__top">
        <span className="surface-card__code">{code}</span>
        <span className={`surface-card__status surface-card__status--${status}`}>{statusLabel}</span>
      </div>
      <h2 className="surface-card__title">{title}</h2>
      <p className="surface-card__desc">{description}</p>
      {ctaLabel && <span className="surface-card__cta">{ctaLabel} →</span>}
    </>
  );
}

/** One card per surface in the hub grid. Live / stub -> link or button; planned -> Placeholder (P-09). */
export function SurfaceCard(props: SurfaceCardProps) {
  const { href, external, onActivate, status, description } = props;
  if (status !== 'planned' && onActivate) {
    return (
      <button type="button" className="surface-card surface-card--live" data-surface-code={props.code} onClick={onActivate}>
        <Body {...props} />
      </button>
    );
  }
  if (status !== 'planned' && href) {
    return (
      <a className="surface-card surface-card--live" href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
        <Body {...props} />
      </a>
    );
  }
  return (
    <Placeholder what={description} className="surface-card">
      <Body {...props} ctaLabel={undefined} image={undefined} />
    </Placeholder>
  );
}
