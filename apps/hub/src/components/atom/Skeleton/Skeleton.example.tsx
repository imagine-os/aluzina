import { Skeleton } from './Skeleton';

export default function SkeletonExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: '28rem' }}>
      <Skeleton lines={3} />
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <Skeleton circle width="2.5rem" />
        <Skeleton width="12rem" height="1.25rem" />
      </div>
    </div>
  );
}
