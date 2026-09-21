import { cx } from '../../../design/cx';
import { useT } from '../../../i18n/I18nProvider';
import { Avatar } from '../../atom/Avatar/Avatar';
import './PresenceBar.css';

export interface PresencePerson {
  id: string;
  name: string;
  initials?: string;
  /** Hash route the person is on, shown in the tooltip. */
  route?: string;
  self?: boolean;
}

export interface PresenceBarProps {
  people: PresencePerson[];
  /** Avatars only (the text stays for screen readers): shell top bar. */
  compact?: boolean;
  max?: number;
}

/** Stacked avatars of who is here right now with a visible "Miguel, Sarai are here" line (D-023). */
export function PresenceBar({ people, compact, max = 5 }: PresenceBarProps) {
  const { t } = useT();
  const others = people.filter((p) => !p.self);
  const shown = people.slice(0, max);
  const text = others.length === 0 ? t('core.presence.alone') : others.length === 1 ? t('core.presence.one', { name: others[0].name }) : t('core.presence.here', { names: others.map((p) => p.name).join(', ') });
  return (
    <div className={cx('presence', compact && 'presence--compact')} role="group" aria-label={t('core.presence.label')} data-count={people.length}>
      <span className="presence__stack">
        {shown.map((p) => (
          <span key={p.id} className={cx('presence__avatar', p.self && 'presence__avatar--self')} title={p.route ? t('core.presence.on', { name: p.self ? `${p.name} (${t('core.presence.you')})` : p.name, route: p.route }) : p.name}>
            <Avatar size="sm" name={p.self ? `${p.name} (${t('core.presence.you')})` : p.name} initials={p.initials} />
          </span>
        ))}
        {people.length > max && <span className="presence__more">+{people.length - max}</span>}
      </span>
      <span className={cx('presence__text', compact && 'visually-hidden')}>{text}</span>
    </div>
  );
}
