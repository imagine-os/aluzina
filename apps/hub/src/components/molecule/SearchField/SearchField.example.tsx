import { useState } from 'react';
import { SearchField } from './SearchField';

export default function SearchFieldExample() {
  const [q, setQ] = useState('mármol');
  return (
    <div style={{ maxWidth: '24rem' }}>
      <SearchField value={q} onChange={setQ} />
    </div>
  );
}
