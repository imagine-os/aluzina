import { useT } from '../../../i18n/I18nProvider';
import { GlobalControls } from '../../../app/shells';
import { RoleSwitcher } from '../RoleSwitcher/RoleSwitcher';
import './HubHeader.css';

/** Brand + "Viewing as" role switcher (hub.switchRole) + the three global controls (hub.setLang / hub.toggleTheme / hub.toggleDevMode). */
export function HubHeader() {
  const { t } = useT();
  return (
    <header className="hub-header">
      <div className="container hub-header__inner">
        <a className="hub-header__brand" href="#/">
          <span className="hub-header__mark" aria-hidden="true" />
          <span className="hub-header__name">{t('hub.brand')}</span>
        </a>
        <div className="hub-header__controls">
          <RoleSwitcher compact />
          <GlobalControls />
        </div>
      </div>
    </header>
  );
}
