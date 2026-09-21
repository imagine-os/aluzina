import { Badge } from './Badge';

export default function BadgeExample() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
      <Badge>Neutral</Badge>
      <Badge tone="accent">Accent</Badge>
      <Badge tone="success" dot>Live</Badge>
      <Badge tone="warning" dot>Due soon</Badge>
      <Badge tone="danger" dot>Overdue</Badge>
      <Badge tone="info">Info</Badge>
    </div>
  );
}
