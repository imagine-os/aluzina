import { useState } from 'react';
import { Input } from './Input';

export default function InputExample() {
  const [v, setV] = useState('Casa Laureles');
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', maxWidth: '24rem' }}>
      <Input label="Project name" value={v} onChange={(e) => setV(e.target.value)} hint="Shown to the client" required />
      <Input label="Budget" prefix="$" type="number" defaultValue={185000000} />
      <Input label="Email" type="email" defaultValue="nope" error="Enter a valid email" />
    </div>
  );
}
