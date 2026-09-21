import { useT } from '../../../i18n/I18nProvider';
import './Skeleton.css';

export interface SkeletonProps {
  /** Number of text lines (default 1); ignored when width/height set a block. */
  lines?: number;
  width?: string;
  height?: string;
  /** Round (avatar) shape. */
  circle?: boolean;
}

/** Loading shimmer; announces "Loading" once for screen readers. */
export function Skeleton({ lines = 1, width, height, circle }: SkeletonProps) {
  const { t } = useT();
  const items = Array.from({ length: circle || height ? 1 : lines });
  return (
    <span className="skeleton" role="status" aria-label={t('core.skeleton.loading')}>
      {items.map((_, i) => (
        <span
          key={i}
          className={`skeleton__bar${circle ? ' skeleton__bar--circle' : ''}`}
          style={{ width: width ?? (i === items.length - 1 && items.length > 1 ? '60%' : '100%'), height: height ?? (circle ? width : undefined) }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
