import { SurfaceCard } from './SurfaceCard';

export default function SurfaceCardExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))' }}>
      <SurfaceCard code="O-01" title="Operations" description="Miguel's portal" status="live" statusLabel="Live" ctaLabel="Enter as Miguel" onActivate={() => undefined} />
      <SurfaceCard code="C-01" title="Client portal" description="opens the client app" status="planned" statusLabel="Planned" />
    </div>
  );
}
