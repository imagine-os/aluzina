import { useId, type InputHTMLAttributes } from 'react';
import { cx } from '../../../design/cx';
import '../Input/Input.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type' | 'className'> {
  label: string;
  hint?: string;
  className?: string;
}

/** Native checkbox with a 44 px row target; the whole label is clickable. */
export function Checkbox({ label, hint, className, ...rest }: CheckboxProps) {
  const id = useId();
  return (
    <label className={cx('check', className)} htmlFor={id}>
      <input id={id} type="checkbox" className="check__box" aria-describedby={hint ? `${id}-hint` : undefined} {...rest} />
      <span className="check__label">{label}</span>
      {hint && <span id={`${id}-hint`} className="check__hint">{hint}</span>}
    </label>
  );
}
