import { cx } from '../../../design/cx';
import './Avatar.css';

export interface AvatarProps {
  name: string;
  initials?: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Initials (or image) in a circle; `name` is the accessible label. */
export function Avatar({ name, initials, src, size = 'md', className }: AvatarProps) {
  return (
    <span className={cx('avatar', `avatar--${size}`, className)} role="img" aria-label={name} title={name}>
      {src ? <img className="avatar__img" src={src} alt="" /> : <span aria-hidden="true">{initials ?? initialsOf(name)}</span>}
    </span>
  );
}
