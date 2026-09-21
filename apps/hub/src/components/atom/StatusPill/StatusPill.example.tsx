import { StatusPill } from './StatusPill';

export default function StatusPillExample() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
      {['draft', 'in-check', 'awaiting-founder', 'approved', 'overdue', 'delayed', 'paid', 'blocked'].map((s) => (
        <StatusPill key={s} status={s} />
      ))}
    </div>
  );
}
