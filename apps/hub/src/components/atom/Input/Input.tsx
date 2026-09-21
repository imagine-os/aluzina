import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './Input.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | 'prefix'> {
  label: string;
  hint?: string;
  error?: string;
  /** Prefix glyph or unit inside the field (e.g. `$`). */
  prefix?: ReactNode;
  /** Visually hide the label (it stays for screen readers). */
  hideLabel?: boolean;
  className?: string;
}

/** Labelled text input with hint and error, 44 px tall. Shares `.field` styles with Select and Textarea. */
export function Input({ label, hint, error, prefix, hideLabel, className, ...rest }: InputProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('field', error && 'field--error', className)}>
      <label className={cx('field__label', hideLabel && 'visually-hidden')} htmlFor={id}>
        {label}
        {rest.required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="field__control">
        {prefix && <span className="field__prefix" aria-hidden="true">{prefix}</span>}
        <input id={id} className="field__input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest} />
      </div>
      {hint && !error && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="field__error" role="alert">{error}</p>}
    </div>
  );
}
