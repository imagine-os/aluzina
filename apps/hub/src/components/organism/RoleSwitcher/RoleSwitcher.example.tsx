import { RoleSwitcher } from './RoleSwitcher';

export default function RoleSwitcherExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: '28rem' }}>
      <RoleSwitcher />
      <RoleSwitcher compact />
    </div>
  );
}
