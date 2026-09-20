import { useState } from 'react';
import { Placeholder } from '../../atom/Placeholder/Placeholder';
import { useT } from '../../../i18n/I18nProvider';
import './SurfaceCard.css';

export type SurfaceStatus = 'live' | 'planned';

interface SurfaceCardProps {
  code: string;
  title: string;
  description: string;
  status: SurfaceStatus;
  statusLabel: string;
  /** Present only when the surface is live. */
  href?: string;
  external?: boolean;
  ctaLabel?: string;
  /**
   * Thumbnail of the page the card opens (`./thumbs/<code>.jpg`, generated at deploy time, D-011).
   * Omitted for planned surfaces; a failed load falls back to the bilingual "No preview yet" tile.
   */
  image?: string;
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
          <span className="surface-card__thumb-mark" />
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

/** One card per surface in the hub grid. Live -> link; planned -> Placeholder (P-09). */
export function SurfaceCard(props: SurfaceCardProps) {
  const { href, external, status, description } = props;
  if (status === 'live' && href) {
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
