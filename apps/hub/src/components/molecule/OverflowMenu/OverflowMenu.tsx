import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../../design/cx';
import type { IconName } from '../../atom/Icon/Icon';
import { glyphNode } from '../../atom/Icon/glyphNode';
import './OverflowMenu.css';

export interface OverflowMenuProps {
  /** The visible text on the trigger ("More"). */
  label: string;
  /** The trigger's full accessible name; it must contain the visible label ("More desk controls"). */
  'aria-label'?: string;
  /** The panel's accessible name (a `group`). */
  panelLabel?: string;
  icon?: IconName | ReactNode;
  /** Controlled open state (optional; uncontrolled otherwise). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which edge of the trigger the panel lines up with. */
  align?: 'start' | 'end';
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
}

/**
 * The overflow menu (changelog 0043): a native `<details>` whose `<summary>` is styled as a Button and whose panel
 * holds ordinary controls. Keyboard: Enter / Space on the trigger, Tab through the panel, Escape closes and returns
 * focus to the trigger; focus or a pointer leaving the menu closes it; activating a button inside closes it unless the
 * button (or an ancestor in the panel) carries `data-keep-open`. Nothing is hover-only.
 */
export function OverflowMenu({ label, panelLabel, icon = 'more', open: openProp, onOpenChange, align = 'end', size = 'sm', className, children, ...rest }: OverflowMenuProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const ref = useRef<HTMLDetailsElement>(null);
  const setOpen = (v: boolean) => {
    if (openProp === undefined) setOpenState(v);
    onOpenChange?.(v);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDetailsElement>) => {
    if (e.key !== 'Escape' || !open) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    ref.current?.querySelector<HTMLElement>(':scope > summary')?.focus();
  };
  const onPanelClick = (e: MouseEvent<HTMLDivElement>) => {
    const btn = (e.target as HTMLElement).closest('button, a');
    if (!btn || btn.closest('[data-keep-open]')) return;
    setOpen(false);
    // The activated row is about to be hidden: focus goes back to the trigger instead of the page.
    ref.current?.querySelector<HTMLElement>(':scope > summary')?.focus();
  };

  return (
    <details
      ref={ref}
      className={cx('omenu', `omenu--${align}`, className)}
      open={open}
      onToggle={(e) => {
        if (e.currentTarget.open !== open) setOpen(e.currentTarget.open);
      }}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (open && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <summary className={cx('btn', 'btn--ghost', `btn--${size}`, 'omenu__summary')} aria-label={rest['aria-label']}>
        {icon && (
          <span className="btn__icon" aria-hidden="true">
            {glyphNode(icon)}
          </span>
        )}
        <span className="btn__label">{label}</span>
      </summary>
      <div className="omenu__panel" role="group" aria-label={panelLabel ?? label} onClick={onPanelClick}>
        {children}
      </div>
    </details>
  );
}
