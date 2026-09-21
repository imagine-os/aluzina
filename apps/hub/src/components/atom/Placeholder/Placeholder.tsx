import { cloneElement, isValidElement, useId, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { useT } from '../../../i18n/I18nProvider';
import { Button } from '../Button/Button';
import { toast } from '../Toast/Toast';
import './Placeholder.css';

interface PlaceholderProps {
  /** What the real control will do, already translated (goes into the tooltip). */
  what: string;
  /**
   * Non-interactive wrapper mode (D-019): the child is already a control (a library `Button`, a native
   * `<button>` or `<a>`); Placeholder decorates it (tooltip, toast on activation, dev badge) instead of
   * wrapping it in a second button. Detected automatically for those children; force it with `bare`.
   */
  bare?: boolean;
  className?: string;
  children: ReactNode;
}

interface ClickableProps {
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  'aria-describedby'?: string;
}

function isControl(node: ReactNode): node is ReactElement<ClickableProps> {
  return isValidElement(node) && (node.type === Button || node.type === 'button' || node.type === 'a');
}

/**
 * Marks UI that is not wired yet (P-09): tooltip on hover / focus, "not wired yet" toast on activation,
 * dashed outline + badge in dev mode, `data-placeholder` for QA. Around plain content it renders a real
 * <button> so keyboard, touch, pen and d-pad all reach it; around a control it becomes a <span> wrapper
 * and the control itself carries the activation (one tab stop, no nested buttons).
 */
export function Placeholder({ what, bare, className, children }: PlaceholderProps) {
  const { t } = useT();
  const tipId = useId();
  const tip = t('core.placeholder.tooltip', { what });
  const notWired = () => toast(t('core.placeholder.toast'));

  const decorations = (
    <>
      <span className="placeholder__badge" aria-hidden="true">
        {t('core.placeholder.badge')}
      </span>
      <span role="tooltip" id={tipId} className="placeholder__tip">
        {tip}
      </span>
    </>
  );

  if (bare || isControl(children)) {
    const child = isControl(children)
      ? cloneElement(children, {
          'aria-describedby': [children.props['aria-describedby'], tipId].filter(Boolean).join(' '),
          onClick: (e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            children.props.onClick?.(e);
            notWired();
          },
        })
      : children;
    return (
      <span className={['placeholder', 'placeholder--bare', className].filter(Boolean).join(' ')} data-placeholder="">
        {child}
        {decorations}
      </span>
    );
  }

  return (
    <button type="button" className={['placeholder', className].filter(Boolean).join(' ')} data-placeholder="" aria-describedby={tipId} onClick={notWired}>
      {children}
      {decorations}
    </button>
  );
}
