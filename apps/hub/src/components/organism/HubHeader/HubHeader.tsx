import { useTheme } from '../../../design/ThemeProvider';
import { useDevMode } from '../../../dev/DevModeProvider';
import { useT } from '../../../i18n/I18nProvider';
import { ToggleButton } from '../../atom/ToggleButton/ToggleButton';
import './HubHeader.css';

/** Brand + the three global controls: language, theme, dev mode (actions hub.setLang / hub.toggleTheme / hub.toggleDevMode). */
export function HubHeader() {
  const { t, lang, setLang } = useT();
  const { theme, toggleTheme } = useTheme();
  const { devMode, toggleDevMode } = useDevMode();
  const otherLang = lang === 'en' ? 'es' : 'en';

  return (
    <header className="hub-header">
      <div className="container hub-header__inner">
        <a className="hub-header__brand" href="#/">
          <span className="hub-header__mark" aria-hidden="true" />
          <span className="hub-header__name">{t('hub.brand')}</span>
        </a>
        <nav className="hub-header__controls" aria-label={t('hub.header.controls')}>
          <ToggleButton label={t(otherLang === 'es' ? 'hub.header.lang.toEs' : 'hub.header.lang.toEn')} onClick={() => setLang(otherLang)}>
            {otherLang.toUpperCase()}
          </ToggleButton>
          <ToggleButton label={t(theme === 'dark' ? 'hub.header.theme.toLight' : 'hub.header.theme.toDark')} pressed={theme === 'dark'} onClick={toggleTheme}>
            {theme === 'dark' ? t('hub.header.theme.dark') : t('hub.header.theme.light')}
          </ToggleButton>
          <ToggleButton label={t('hub.header.dev.label')} pressed={devMode} onClick={toggleDevMode}>
            {devMode ? t('hub.header.dev.on') : t('hub.header.dev.off')}
          </ToggleButton>
        </nav>
      </div>
    </header>
  );
}
