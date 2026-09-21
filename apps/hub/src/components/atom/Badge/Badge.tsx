import type { ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './Badge.css';

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  tone?: Tone;
  /** Leading dot (status colour plus text, never colour alone). */
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', dot, className, children }: BadgeProps) {
  return (
    <span className={cx('badge', `badge--${tone}`, dot && 'badge--dot', className)}>
      {children}
    </span>
  );
}
