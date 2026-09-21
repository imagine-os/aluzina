import { StatTile } from './StatTile';

export default function StatTileExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))' }}>
      <StatTile label="Open projects" value={6} hint="2 awaiting approval" tone="accent" glyph="◆" />
      <StatTile label="Overdue payments" value="$ 18.500.000" hint="1 client" tone="danger" />
      <StatTile label="Deliveries this month" value={3} hint="1 delayed" tone="warning" onActivate={() => undefined} />
    </div>
  );
}
