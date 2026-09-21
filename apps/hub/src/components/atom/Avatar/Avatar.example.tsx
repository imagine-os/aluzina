import { Avatar } from './Avatar';

export default function AvatarExample() {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      <Avatar name="Alejandra Guerra" size="sm" />
      <Avatar name="Miguel" />
      <Avatar name="Sarai" size="lg" />
      <Avatar name="Angélica" initials="A" />
    </div>
  );
}
