import { useState } from 'react';
import { toast } from '../../atom/Toast/Toast';
import { ApprovalQueue, type ApprovalItem } from './ApprovalQueue';

export default function ApprovalQueueExample() {
  const [items, setItems] = useState<ApprovalItem[]>([
    { id: 'hoy', title: 'HOY Wellness Center: documentación técnica', subtitle: 'Checked by Sarai · passed', meta: 'Due 27 Sep', status: 'awaiting-founder' },
    { id: 'laureles', title: 'Casa Laureles: propuesta sala y comedor', subtitle: 'Consistency check has 2 issues', status: 'in-check' },
  ]);
  const set = (id: string, status: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status } : x)));
  return (
    <ApprovalQueue
      label="Approvals"
      items={items}
      isOpen={(it) => it.status !== 'approved' && it.status !== 'changes-requested'}
      onApprove={(id) => set(id, 'approved')}
      onReject={(id) => set(id, 'changes-requested')}
      onComment={(id, text) => toast(`${id}: ${text}`)}
    />
  );
}
