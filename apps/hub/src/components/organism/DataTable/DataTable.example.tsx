import { toast } from '../../atom/Toast/Toast';
import { StatusPill } from '../../atom/StatusPill/StatusPill';
import { DataTable } from './DataTable';

interface Row {
  id: string;
  supplier: string;
  item: string;
  amount: number;
  status: string;
}

const ROWS: Row[] = [
  { id: '1', supplier: 'Luminarias del Valle', item: '6 colgantes + 4 apliques', amount: 18_400_000, status: 'shortlisted' },
  { id: '2', supplier: 'Iluminación Andina', item: '6 colgantes + 4 apliques', amount: 16_900_000, status: 'received' },
  { id: '3', supplier: 'Metalmecánica Itagüí', item: 'Fabricación a medida', amount: 21_200_000, status: 'received' },
];

export default function DataTableExample() {
  return (
    <DataTable<Row>
      caption="Quotes for the living room luminaires"
      rows={ROWS}
      rowKey={(r) => r.id}
      initialSort={{ key: 'amount', dir: 'asc' }}
      onRowActivate={(r) => toast(r.supplier)}
      columns={[
        { key: 'supplier', header: 'Supplier', sortable: true },
        { key: 'item', header: 'Item' },
        { key: 'amount', header: 'Amount (COP)', sortable: true, align: 'end', render: (r) => r.amount.toLocaleString('es-CO') },
        { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
      ]}
      rowActions={[{ id: 'select', label: 'Select', onClick: (r) => toast(`Selected ${r.supplier}`) }]}
    />
  );
}
