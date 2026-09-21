import { useState } from 'react';
import { Select } from './Select';

export default function SelectExample() {
  const [v, setV] = useState('development');
  return (
    <div style={{ maxWidth: '20rem' }}>
      <Select
        label="Phase"
        value={v}
        onChange={(e) => setV(e.target.value)}
        options={['lead', 'concept', 'development', 'documentation', 'procurement', 'execution', 'delivered'].map((p) => ({ value: p, label: p }))}
        hint="Current project phase"
      />
    </div>
  );
}
