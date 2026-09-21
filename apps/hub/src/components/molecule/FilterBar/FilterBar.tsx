import type { ReactNode } from 'react';
import { useT } from '../../../i18n/I18nProvider';
import { Button } from '../../atom/Button/Button';
import './FilterBar.css';

export interface FilterBarProps {
  /** SearchField, Selects, Checkboxes. */
  children: ReactNode;
  /** Shows a "Clear filters" button when set. */
  onClear?: () => void;
  /** Right-aligned summary, e.g. "12 of 40". */
  summary?: ReactNode;
}

/** Toolbar row above a table or board; wraps on phones. */
export function FilterBar({ children, onClear, summary }: FilterBarProps) {
  const { t } = useT();
  return (
    <div className="filterbar" role="group" aria-label={t('core.filter.label')}>
      <div className="filterbar__filters">{children}</div>
      <div className="filterbar__end">
        {summary && <span className="filterbar__summary">{summary}</span>}
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {t('core.filter.clear')}
          </Button>
        )}
      </div>
    </div>
  );
}
