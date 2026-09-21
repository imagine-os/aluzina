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

const TONES = ['periwinkle', 'aqua', 'lime'] as const;

/** Stable pastel per person: the first letter picks one of the manual's three monogram tints. */
function toneOf(name: string): (typeof TONES)[number] {
  const code = name.trim().toUpperCase().codePointAt(0) ?? 0;
  return TONES[code % TONES.length];
}

/** Initials (or image) in a circle; `name` is the accessible label. */
export function Avatar({ name, initials, src, size = 'md', className }: AvatarProps) {
  return (
    <span className={cx('avatar', `avatar--${size}`, `avatar--${toneOf(name)}`, className)} role="img" aria-label={name} title={name}>
      {src ? <img className="avatar__img" src={src} alt="" /> : <span aria-hidden="true">{initials ?? initialsOf(name)}</span>}
    </span>
  );
}
