import type { CSSProperties } from 'react';
import { Shimmer } from './Shimmer';

const band: CSSProperties = { borderRadius: 'var(--radius-lg)', minHeight: '7rem', display: 'grid', placeItems: 'center' };
const caption: CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', fontSize: '0.8125rem' };

export default function ShimmerExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Shimmer finish="metal" intensity={0.7}>
        <div style={{ ...band, padding: 'var(--space-5)' }}>
          <span style={caption}>Metal · brushed, two specular streaks</span>
        </div>
      </Shimmer>
      <Shimmer finish="iridescent" intensity={0.6}>
        <div style={{ ...band, padding: 'var(--space-5)' }}>
          <span style={caption}>Iridescent · thin film, pastel</span>
        </div>
      </Shimmer>
      <Shimmer finish="metal" intensity={0.3} motion={false}>
        <div style={{ ...band, minHeight: '4rem', padding: 'var(--space-4)' }}>
          <span style={caption}>Low intensity, motion off</span>
        </div>
      </Shimmer>
    </div>
  );
}
