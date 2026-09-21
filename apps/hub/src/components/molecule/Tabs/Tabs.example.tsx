import { useState } from 'react';
import { Tabs } from './Tabs';

export default function TabsExample() {
  const [v, setV] = useState('open');
  return (
    <Tabs
      label="Quotes"
      value={v}
      onChange={setV}
      tabs={[
        { id: 'open', label: 'Open', count: 4 },
        { id: 'shortlisted', label: 'Shortlisted', count: 2 },
        { id: 'selected', label: 'Selected', count: 1 },
      ]}
    >
      Panel for <strong>{v}</strong>
    </Tabs>
  );
}
