import { useId, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../../design/cx';
import '../Input/Input.css';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  className?: string;
}

export function Textarea({ label, hint, error, hideLabel, className, rows = 3, ...rest }: TextareaProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('field', error && 'field--error', className)}>
      <label className={cx('field__label', hideLabel && 'visually-hidden')} htmlFor={id}>
        {label}
        {rest.required && <span aria-hidden="true"> *</span>}
      </label>
      <textarea id={id} className="field__textarea" rows={rows} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest} />
      {hint && !error && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="field__error" role="alert">{error}</p>}
    </div>
  );
}
