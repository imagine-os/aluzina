import { useId, type ReactNode } from 'react';
import { useT } from '../../../i18n/I18nProvider';
import { toast } from '../Toast/Toast';
import './Placeholder.css';

interface PlaceholderProps {
  /** What the real control will do, already translated (goes into the tooltip). */
  what: string;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps UI that is not wired yet (P-09): tooltip on hover / focus, "not wired yet"
 * toast on activation, dashed outline + badge in dev mode, `data-placeholder` for QA.
 * Renders a real <button> so keyboard, touch, pen and d-pad all reach it.
 */
export function Placeholder({ what, className, children }: PlaceholderProps) {
  const { t } = useT();
  const tipId = useId();
  const tip = t('core.placeholder.tooltip', { what });

  return (
    <button
      type="button"
      className={['placeholder', className].filter(Boolean).join(' ')}
      data-placeholder=""
      aria-describedby={tipId}
      onClick={() => toast(t('core.placeholder.toast'))}
    >
      {children}
      <span className="placeholder__badge" aria-hidden="true">
        {t('core.placeholder.badge')}
      </span>
      <span role="tooltip" id={tipId} className="placeholder__tip">
        {tip}
      </span>
    </button>
  );
}
