import type { ReactNode } from 'react';
import { cx } from '../../../design/cx';
import type { Tone } from '../../atom/Badge/Badge';
import { glyphNode } from '../../atom/Icon/glyphNode';
import './StatTile.css';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Small line under the value (e.g. "3 overdue"). */
  hint?: ReactNode;
  tone?: Tone;
  /** Icon name, a mapped Unicode glyph or text (D-064 order, resolved by `glyphNode`). */
  glyph?: string;
  onActivate?: () => void;
}

/** KPI tile: label, big value, hint; tone colours the value bar (text carries the meaning). */
export function StatTile({ label, value, hint, tone = 'neutral', glyph, onActivate }: StatTileProps) {
  const cls = cx('stat', `stat--${tone}`, onActivate && 'stat--interactive');
  const inner = (
    <>
      <span className="stat__label">
        {glyph && <span className="stat__glyph" aria-hidden="true">{glyphNode(glyph)}</span>}
        {label}
      </span>
      <span className="stat__value">{value}</span>
      {hint && <span className="stat__hint">{hint}</span>}
    </>
  );
  return onActivate ? (
    <button type="button" className={cls} onClick={onActivate}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
