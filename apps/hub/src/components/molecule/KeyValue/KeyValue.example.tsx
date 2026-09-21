import { StatusPill } from '../../atom/StatusPill/StatusPill';
import { KeyValue } from './KeyValue';

export default function KeyValueExample() {
  return (
    <KeyValue
      columns={3}
      items={[
        { key: 'Client', value: 'Familia Restrepo' },
        { key: 'Phase', value: 'development' },
        { key: 'Approval', value: <StatusPill status="in-check" /> },
        { key: 'Budget', value: '$ 185.000.000' },
        { key: 'Due', value: '15 Dec 2026' },
        { key: 'Location', value: 'Laureles, Medellín' },
      ]}
    />
  );
}
