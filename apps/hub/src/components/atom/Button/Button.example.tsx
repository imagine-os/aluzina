import { Button } from './Button';

export default function ButtonExample() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
      <Button variant="primary">Approve</Button>
      <Button>Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Reject</Button>
      <Button size="sm" icon="+">Small</Button>
      <Button size="lg" iconEnd="→">Large</Button>
      <Button aria-label="Close" icon="×" />
      <Button disabled>Disabled</Button>
    </div>
  );
}
