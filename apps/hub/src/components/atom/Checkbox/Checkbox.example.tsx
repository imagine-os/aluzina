import { useState } from 'react';
import { Checkbox } from './Checkbox';

export default function CheckboxExample() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div style={{ display: 'grid', maxWidth: '28rem' }}>
      <Checkbox label="Measurements verified on site" checked={a} onChange={(e) => setA(e.target.checked)} />
      <Checkbox label="Materials from the approved palette" hint="Lino crudo is still proposed" checked={b} onChange={(e) => setB(e.target.checked)} />
    </div>
  );
}
