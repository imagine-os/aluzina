import type { ReactNode } from 'react';
import './ToggleButton.css';

interface ToggleButtonProps {
  /** Accessible name; the visible children may be an abbreviation. */
  label: string;
  onClick: () => void;
  /** When defined, the button is a two-state toggle (aria-pressed). */
  pressed?: boolean;
  children: ReactNode;
}

export function ToggleButton({ label, onClick, pressed, children }: ToggleButtonProps) {
  return (
    <button type="button" className="toggle-btn" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}
