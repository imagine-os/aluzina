import { useEffect, useState } from 'react';
import type { FileType } from '../../../domain/archive';
import { cx } from '../../../design/cx';
import { FileIcon } from '../../atom/FileIcon/FileIcon';
import './Thumb.css';

export type ThumbRatio = '4:3' | '16:9' | '1:1' | '3:4';
export type ThumbSize = 'sm' | 'md' | 'lg';

export interface ThumbProps {
  /** Served thumbnail; null (or a failed load) shows the `FileIcon` on a tinted background instead. */
  src: string | null;
  alt: string;
  type: FileType;
  ratio?: ThumbRatio;
  /** Short label in the top-left corner ("12 p.", "PDF"). */
  badge?: string;
  /** One line under the image (the file name); clipped with an ellipsis. */
  caption?: string;
  /** Width hint for the fallback icon and caption size; the box itself fills its parent. */
  size?: ThumbSize;
  /** Accessible name for the fallback icon (the translated file-type label); defaults to `alt`. */
  iconLabel?: string;
  className?: string;
}

/**
 * Fixed-ratio thumbnail box (P-07): a lazy `<img>` when there is a source, the file-family icon centred on a
 * tint when there is none or the image fails, an optional badge and caption. It is a plain `<figure>`: the
 * parent makes it interactive (a `Card onActivate`, a `Button href`, an `<a>`), so there is one tab stop.
 */
export function Thumb({ src, alt, type, ratio = '4:3', badge, caption, size = 'md', iconLabel, className }: ThumbProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const showImage = Boolean(src) && !failed;
  return (
    <figure className={cx('thumb', `thumb--${size}`, `thumb--ratio-${ratio.replace(':', 'x')}`, `thumb--${type}`, className)}>
      <div className="thumb__box">
        {showImage ? (
          <img className="thumb__img" src={src ?? undefined} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
        ) : (
          <div className="thumb__fallback">
            <FileIcon type={type} size={size === 'sm' ? 'md' : 'lg'} label={iconLabel ?? alt} />
          </div>
        )}
        {badge && <span className="thumb__badge">{badge}</span>}
      </div>
      {caption && <figcaption className="thumb__caption">{caption}</figcaption>}
    </figure>
  );
}
