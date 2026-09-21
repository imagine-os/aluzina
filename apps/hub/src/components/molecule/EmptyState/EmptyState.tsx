import type { ReactNode } from 'react';
import { BrandMark } from '../../atom/BrandMark/BrandMark';
import './EmptyState.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Text glyph in place of the default outlined monogram. */
  glyph?: string;
  /** Actions (Buttons). */
  children?: ReactNode;
}

/** Centered message for empty lists, denied access and not-found states. */
export function EmptyState({ title, description, glyph, children }: EmptyStateProps) {
  return (
    <div className="empty" role="status">
      {glyph ? (
        <span className="empty__glyph" aria-hidden="true">{glyph}</span>
      ) : (
        <span className="empty__mark" aria-hidden="true">
          <BrandMark kind="monogram" finish="outline" size="lg" />
        </span>
      )}
      <h3 className="empty__title">{title}</h3>
      {description && <p className="empty__desc">{description}</p>}
      {children && <div className="empty__actions">{children}</div>}
    </div>
  );
}
