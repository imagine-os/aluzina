import type { FileType } from '../../../domain/archive';
import { cx } from '../../../design/cx';
import './FileIcon.css';

export type FileIconSize = 'sm' | 'md' | 'lg';

export interface FileIconProps {
  type: FileType;
  /** sm 1.25rem (inline with text), md 2rem (lists), lg 3.5rem (empty thumbnails). */
  size?: FileIconSize;
  /** Accessible name; defaults to the type id. Pass the translated `FILE_TYPE_LABELS` text. */
  label?: string;
  className?: string;
}

/** Inner mark per file family, drawn inside the sheet (viewBox 24 x 28). Every type has its own shape, so colour is never the only cue. */
function Mark({ type }: { type: FileType }) {
  switch (type) {
    case 'pdf':
      return <text x="12" y="21" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="var(--font-mono)">PDF</text>;
    case 'image':
      return (
        <>
          <path d="M5.5 22.5 10 16l3.5 4.5 2.5-3 3 5" />
          <circle cx="15.5" cy="12.5" r="1.6" />
        </>
      );
    case 'vector':
      return (
        <>
          <path d="M12 11.5v9" />
          <path d="M12 11.5 8.5 20.5h7L12 11.5Z" />
          <circle cx="12" cy="11" r="1.3" />
        </>
      );
    case 'presentation':
      return (
        <>
          <rect x="6" y="12" width="12" height="8" rx="0.8" />
          <path d="M12 20v3M9 23h6" />
        </>
      );
    case 'spreadsheet':
      return (
        <>
          <rect x="5.5" y="12" width="13" height="10" rx="0.8" />
          <path d="M5.5 15.5h13M5.5 19h13M10 12v10M14.5 12v10" />
        </>
      );
    case 'document':
      return <path d="M6.5 13h11M6.5 16.5h11M6.5 20h7" />;
    case 'cad':
      return (
        <>
          <path d="M12 10.5v3" />
          <path d="M12 13.5 7 23M12 13.5l5 9.5" />
          <path d="M8.8 19.6c1.9 1.2 4.5 1.2 6.4 0" />
        </>
      );
    case 'model3d':
      return (
        <>
          <path d="M12 11 17.5 14v6L12 23l-5.5-3v-6L12 11Z" />
          <path d="M6.5 14 12 17l5.5-3M12 17v6" />
        </>
      );
    case 'video':
      return <path d="M9 12.5v10l8.5-5L9 12.5Z" />;
    case 'audio':
      return <path d="M5.5 17.5h1.5l1.5-4 2 8 2-9 2 7 1.5-4 1.5 2h1" />;
    case 'archive':
      return (
        <>
          <path d="M10.5 3.5v3h3v3h-3v3h3v3h-3v2" />
          <rect x="9.5" y="17.5" width="5" height="4" rx="0.6" />
        </>
      );
    case 'folder':
      return null;
    default:
      return <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none" />;
  }
}

/**
 * Glyph for a file family (P-07): a sheet with a folded corner and a distinct inner mark per type
 * (letters for PDF, mountains for images, a pen nib for vector art, slide + stand, grid, text lines,
 * a compass, a cube, a play triangle, a wave, zip teeth; a folder shape for folders). `currentColor`
 * strokes over a soft tint per type, so light and dark themes and the metal switch all apply.
 */
export function FileIcon({ type, size = 'md', label, className }: FileIconProps) {
  const isFolder = type === 'folder';
  return (
    <span className={cx('file-icon', `file-icon--${type}`, `file-icon--${size}`, className)} role="img" aria-label={label ?? type}>
      <svg viewBox="0 0 24 28" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {isFolder ? (
          <>
            <path className="file-icon__sheet" d="M2.5 8.5A1.5 1.5 0 0 1 4 7h5.2l2.3 2.5H20a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 22.5H4A1.5 1.5 0 0 1 2.5 21V8.5Z" />
            <path d="M2.5 12.5h19" />
          </>
        ) : (
          <>
            <path className="file-icon__sheet" d="M5 2.5h9.5L20 8v16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 24V4a1.5 1.5 0 0 1 1-1.5Z" />
            <path d="M14.5 2.5V8H20" />
            <Mark type={type} />
          </>
        )}
      </svg>
    </span>
  );
}
