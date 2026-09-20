import { Placeholder } from '../../atom/Placeholder/Placeholder';
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
}

function Body({ code, title, description, status, statusLabel, ctaLabel }: SurfaceCardProps) {
  return (
    <>
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
      <Body {...props} ctaLabel={undefined} />
    </Placeholder>
  );
}
