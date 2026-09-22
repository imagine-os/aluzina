import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../design/cx';
import type { IconName } from '../Icon/Icon';
import { glyphNode } from '../Icon/glyphNode';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Before the label: an `IconName` (drawn from the set), a Unicode glyph the icon map knows, or any node.
   * ar-21 / D-064: a string is resolved name first, glyph next, and rendered as text last, so a module can
   * pass `icon="chevron-right"`, keep `icon="›"`, or print a glyph the set has no drawing for.
   */
  icon?: IconName | ReactNode;
  iconEnd?: IconName | ReactNode;
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

/** A string `icon` / `iconEnd` becomes a drawn `Icon` when it is a name or a mapped glyph; anything else renders as it is. */
const iconNode = (value: IconName | ReactNode): ReactNode => glyphNode(value);

/** The one button (P-07): every variant is >= 44 px tall, keyboard and touch reachable, focus ring from global.css. */
export function Button({ variant = 'secondary', size = 'md', icon, iconEnd, href, external, download, fullWidth, className, children, type = 'button', ...rest }: ButtonProps) {
  const cls = cx('btn', `btn--${variant}`, `btn--${size}`, fullWidth && 'btn--full', !children && 'btn--icon', className);
  const inner = (
    <>
      {icon && <span className="btn__icon" aria-hidden="true">{iconNode(icon)}</span>}
      {children && <span className="btn__label">{children}</span>}
      {iconEnd && <span className="btn__icon" aria-hidden="true">{iconNode(iconEnd)}</span>}
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
