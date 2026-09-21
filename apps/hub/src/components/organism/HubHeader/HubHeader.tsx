import { useT } from '../../../i18n/I18nProvider';
import { BrandMark } from '../../atom/BrandMark/BrandMark';
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
          <BrandMark kind="wordmark" size="md" finish="iridescent" label={t('hub.brand')} />
        </a>
        <div className="hub-header__controls">
          <RoleSwitcher compact />
          <GlobalControls />
        </div>
      </div>
    </header>
  );
}
