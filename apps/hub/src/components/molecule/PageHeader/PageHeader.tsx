import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import { useT } from '../../../i18n/I18nProvider';
import './PageHeader.css';

export interface Crumb {
  label: string;
  /** Hash-router path; the last crumb has none. */
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
  /** Primary and secondary Buttons. */
  actions?: ReactNode;
  /** Page code, shown as a chip in dev mode. */
  code?: string;
}

/** Title block of every portal page: breadcrumb, h1, subtitle, actions; the page code appears in dev mode. */
export function PageHeader({ title, subtitle, breadcrumb, actions, code }: PageHeaderProps) {
  const { t } = useT();
  const { devMode } = useSession();
  return (
    <header className="page-header">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="page-header__crumbs" aria-label={t('core.header.breadcrumb')}>
          <ol>
            {breadcrumb.map((c, i) => (
              <li key={`${c.label}-${i}`}>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="page-header__row">
        <div className="page-header__text">
          <h1 className="page-header__title">
            {title}
            {devMode && code && <span className="page-header__code">{code}</span>}
          </h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
