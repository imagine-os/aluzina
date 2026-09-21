import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../../design/cx';
import { useFocusTrap } from '../../../design/useFocusTrap';
import { useT } from '../../../i18n/I18nProvider';
import { Button } from '../../atom/Button/Button';
import './Modal.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Buttons row. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/** Centered dialog: focus trap, Esc and backdrop close, focus returns to the opener. */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="modal__backdrop" onClick={onClose}>
      <div ref={ref} className={cx('modal', `modal--${size}`)} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()} tabIndex={-1}>
        <div className="modal__head">
          <h2 id="modal-title" className="modal__title">{title}</h2>
          <Button variant="ghost" icon="×" aria-label={t('core.dialog.close')} onClick={onClose} />
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
