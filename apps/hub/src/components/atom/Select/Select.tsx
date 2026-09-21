import { useId, type SelectHTMLAttributes } from 'react';
import { cx } from '../../../design/cx';
import '../Input/Input.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> {
  label: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  /** Empty first option text (uncontrolled placeholder). */
  placeholder?: string;
  className?: string;
}

/** Native <select>: works with keyboard, touch, pen, d-pad and voice without extra code. */
export function Select({ label, options, hint, error, hideLabel, placeholder, className, ...rest }: SelectProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('field', error && 'field--error', className)}>
      <label className={cx('field__label', hideLabel && 'visually-hidden')} htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <select id={id} className="field__select" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {hint && !error && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="field__error" role="alert">{error}</p>}
    </div>
  );
}
