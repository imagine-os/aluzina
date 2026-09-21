import { useState } from 'react';
import { Select } from '../../atom/Select/Select';
import { SearchField } from '../SearchField/SearchField';
import { FilterBar } from './FilterBar';

export default function FilterBarExample() {
  const [q, setQ] = useState('');
  const [s, setS] = useState('');
  return (
    <FilterBar onClear={() => { setQ(''); setS(''); }} summary="7 of 7">
      <SearchField value={q} onChange={setQ} />
      <Select label="Status" hideLabel value={s} onChange={(e) => setS(e.target.value)} placeholder="All statuses" options={['requested', 'received', 'shortlisted', 'selected'].map((v) => ({ value: v, label: v }))} />
    </FilterBar>
  );
}
