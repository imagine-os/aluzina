import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Glyph or icon before the label. */
  icon?: ReactNode;
  iconEnd?: ReactNode;
  /** Renders a link styled as a button. */
  href?: string;
  external?: boolean;
  /** With `href`: download the target instead of navigating (`true`, or a suggested file name). */
  download?: boolean | string;
  fullWidth?: boolean;
  /** Set when the button is icon-only, so it still has a name. */
  'aria-label'?: string;
  type?: 'button' | 'submit' | 'reset';
  children?: ReactNode;
}

/** The one button (P-07): every variant is >= 44 px tall, keyboard and touch reachable, focus ring from global.css. */
export function Button({ variant = 'secondary', size = 'md', icon, iconEnd, href, external, download, fullWidth, className, children, type = 'button', ...rest }: ButtonProps) {
  const cls = cx('btn', `btn--${variant}`, `btn--${size}`, fullWidth && 'btn--full', !children && 'btn--icon', className);
  const inner = (
    <>
      {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
      {children && <span className="btn__label">{children}</span>}
      {iconEnd && <span className="btn__icon" aria-hidden="true">{iconEnd}</span>}
    </>
  );
  if (href) {
    return (
      <a
        className={cls}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        download={download === true ? '' : download || undefined}
        aria-label={rest['aria-label']}
        title={rest.title}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {inner}
    </button>
  );
}
