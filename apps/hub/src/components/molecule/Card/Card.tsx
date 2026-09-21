import type { ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './Card.css';

export interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Buttons rendered in the header, right side. */
  actions?: ReactNode;
  footer?: ReactNode;
  /** Raised (warm) background for highlighted cards. */
  raised?: boolean;
  /** Whole card becomes one button (list cards). Give it an aria-label when the title is not the name. */
  onActivate?: () => void;
  'aria-label'?: string;
  padding?: 'none' | 'sm' | 'md';
  className?: string;
  children?: ReactNode;
}

/** The one card surface: header with title / subtitle / actions, body, footer; optionally one big button. */
export function Card({ title, subtitle, actions, footer, raised, onActivate, padding = 'md', className, children, ...rest }: CardProps) {
  const cls = cx('card', raised && 'card--raised', `card--pad-${padding}`, onActivate && 'card--interactive', className);
  const inner = (
    <>
      {(title || subtitle || actions) && (
        <div className="card__head">
          <div className="card__heading">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      {children !== undefined && <div className="card__body">{children}</div>}
      {footer && <div className="card__footer">{footer}</div>}
    </>
  );
  if (onActivate) {
    return (
      <button type="button" className={cls} onClick={onActivate} aria-label={rest['aria-label']}>
        {inner}
      </button>
    );
  }
  return <section className={cls}>{inner}</section>;
}
