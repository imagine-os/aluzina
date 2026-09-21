import { useState } from 'react';
import { cx } from '../../../design/cx';
import { tileSize } from './layouts';
import type { ViewNode } from './types';

/**
 * One node drawn as the thing it is (the gallery's object-view rule): a page thumbnail, a person's initials
 * or the system glyph of the space / post / catalog entry - never a bare dot. A thumbnail that has not been
 * generated yet falls back to the same tile the hub cards use, with the page code on it.
 */
export function NodeTile({ node, x, y, active, isFocus, noPreview, compact }: { node: ViewNode; x: number; y: number; active: boolean; isFocus: boolean; noPreview: string; compact?: boolean }) {
  const [broken, setBroken] = useState(false);
  const s = tileSize(node);
  const half = s / 2;
  const img = node.image;
  const showThumb = img.kind === 'thumb' && img.src && !broken;
  const label = node.label.length > 20 ? `${node.label.slice(0, 19)}…` : node.label;
  return (
    <g className={cx('gtile', `gtile--${node.kind}`, isFocus && 'gtile--focus', active && 'gtile--active')} transform={`translate(${x} ${y})`} aria-hidden="true">
      {isFocus && <rect className="gtile__ring" x={-half - 7} y={-half - 7} width={s + 14} height={s + 14} rx={14} />}
      <rect className="gtile__frame" x={-half} y={-half} width={s} height={s} rx={10} />
      {showThumb ? (
        <image className="gtile__thumb" href={img.src} x={-half + 3} y={-half + 3} width={s - 6} height={s - 6} preserveAspectRatio="xMidYMid slice" onError={() => setBroken(true)} />
      ) : img.kind === 'initials' ? (
        <>
          <circle className="gtile__avatar" r={half - 5} />
          <text className="gtile__initials" y={s * 0.13} textAnchor="middle">{img.text}</text>
        </>
      ) : (
        <>
          <text className="gtile__glyph" y={s * 0.16} textAnchor="middle" style={{ fontSize: `${s * 0.46}px` }}>{img.text}</text>
          {img.kind === 'thumb' && (
            <text className="gtile__code" y={half - 6} textAnchor="middle">{img.code ?? noPreview}</text>
          )}
        </>
      )}
      {!compact && (
        <>
          <text className="gtile__label" y={half + 18} textAnchor="middle">{label}</text>
          {node.sub && <text className="gtile__sub" y={half + 32} textAnchor="middle">{node.sub}</text>}
        </>
      )}
    </g>
  );
}
