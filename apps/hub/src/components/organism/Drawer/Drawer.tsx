import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../../design/cx';
import { useFocusTrap } from '../../../design/useFocusTrap';
import { useT } from '../../../i18n/I18nProvider';
import { Button } from '../../atom/Button/Button';
import './Drawer.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left' | 'bottom';
}

/** Side panel (detail views, menus on phones): same focus and Escape behaviour as Modal. */
export function Drawer({ open, onClose, title, children, footer, side = 'right' }: DrawerProps) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="drawer__backdrop" onClick={onClose}>
      <div ref={ref} className={cx('drawer', `drawer--${side}`)} role="dialog" aria-modal="true" aria-labelledby="drawer-title" onClick={(e) => e.stopPropagation()} tabIndex={-1}>
        <div className="drawer__head">
          <h2 id="drawer-title" className="drawer__title">{title}</h2>
          <Button variant="ghost" icon="×" aria-label={t('core.dialog.close')} onClick={onClose} />
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
