import { useState } from 'react';
import { ToggleButton } from './ToggleButton';

export default function ToggleButtonExample() {
  const [on, setOn] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <ToggleButton label="Switch to Spanish" onClick={() => undefined}>ES</ToggleButton>
      <ToggleButton label="Dark theme" pressed={on} onClick={() => setOn(!on)}>{on ? 'Dark' : 'Light'}</ToggleButton>
    </div>
  );
}
