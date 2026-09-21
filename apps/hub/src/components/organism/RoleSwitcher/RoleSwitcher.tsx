import { ROLE_META } from '../../../auth/roles';
import { useSession } from '../../../auth/SessionProvider';
import { useT } from '../../../i18n/I18nProvider';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Select } from '../../atom/Select/Select';
import './RoleSwitcher.css';

export interface RoleSwitcherProps {
  /** Hide the avatar and label text (header use). */
  compact?: boolean;
  /** Called after the user changed (e.g. to navigate to the portal). */
  onSwitched?: (role: string) => void;
}

/** "Viewing as" control: a native select of the demo users (action `hub.switchRole`). Identity is mocked, guards are real (P-12). */
export function RoleSwitcher({ compact, onSwitched }: RoleSwitcherProps) {
  const { t } = useT();
  const { user, users, switchUser } = useSession();
  return (
    <div className={`role-switcher${compact ? ' role-switcher--compact' : ''}`} data-role-switcher="">
      {!compact && <Avatar name={user.name} initials={user.initials} />}
      <Select
        label={t('core.session.viewingAs')}
        value={user.id}
        onChange={(e) => {
          switchUser(e.target.value);
          const next = users.find((u) => u.id === e.target.value);
          if (next) onSwitched?.(next.role);
        }}
        options={users.map((u) => ({ value: u.id, label: `${u.name} · ${t(ROLE_META[u.role].labelKey)}` }))}
      />
    </div>
  );
}
