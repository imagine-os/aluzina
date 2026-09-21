import { Button } from '../../atom/Button/Button';
import { Card } from './Card';

export default function CardExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))' }}>
      <Card title="Casa Laureles" subtitle="Familia Restrepo · development" actions={<Button size="sm">Open</Button>} footer="Due 15 Dec 2026">
        Remodelación integral de casa de dos plantas.
      </Card>
      <Card raised title="Raised card">
        Warm background for highlighted content.
      </Card>
      <Card onActivate={() => undefined} title="Interactive card" subtitle="The whole card is one button" />
    </div>
  );
}
