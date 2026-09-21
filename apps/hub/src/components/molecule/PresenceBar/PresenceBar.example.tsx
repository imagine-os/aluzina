import { PresenceBar } from './PresenceBar';

export default function PresenceBarExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <PresenceBar people={[{ id: 'u-miguel', name: 'Miguel', initials: 'M', route: '/ops/work', self: true }, { id: 'u-sarai', name: 'Sarai', initials: 'S', route: '/studio/work' }, { id: 'u-alejandra', name: 'Alejandra Guerra', initials: 'AG', route: '/founder' }]} />
      <PresenceBar compact people={[{ id: 'u-miguel', name: 'Miguel', initials: 'M', self: true }, { id: 'u-sarai', name: 'Sarai', initials: 'S' }]} />
    </div>
  );
}
