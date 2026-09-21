import type { CSSProperties } from 'react';
import { GLYPH_NAMES } from '../../../brand/paths';
import { BrandMark } from './BrandMark';

const tile: CSSProperties = {
  display: 'grid',
  gap: 'var(--space-4)',
  padding: 'var(--space-5)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
};
const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-5)' };

function Tile({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div data-theme={theme} style={{ ...tile, background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <span className="eyebrow">{theme === 'light' ? 'Light: gold wordmark' : 'Dark: iridescent wordmark'}</span>
      <div style={row}>
        <BrandMark kind="wordmark" finish={theme === 'light' ? 'metal' : 'iridescent'} size="lg" label="Aluzina" />
        <BrandMark kind="descriptor" size="lg" label="Universo de diseño" />
      </div>
      <div style={row}>
        <BrandMark kind="wordmark" finish={theme === 'light' ? 'iridescent' : 'metal'} size="md" />
        <BrandMark kind="wordmark" finish="outline" size="md" />
        <BrandMark kind="wordmark" finish="flat" size="sm" />
      </div>
      <div style={row}>
        <BrandMark kind="monogram" tone="periwinkle" size="xl" label="Monogram, periwinkle" />
        <BrandMark kind="monogram" tone="aqua" size="xl" label="Monogram, aqua" />
        <BrandMark kind="monogram" tone="lime" size="xl" label="Monogram, lime" />
        <BrandMark kind="monogram" size="xl" label="Monogram, metal" />
        <BrandMark kind="monogram" finish="outline" size="xl" label="Monogram, outline" />
      </div>
      <div style={row}>
        {GLYPH_NAMES.map((g) => (
          <BrandMark key={g} kind="glyph" glyph={g} finish="outline" size="lg" label={g} />
        ))}
      </div>
    </div>
  );
}

export default function BrandMarkExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Tile theme="light" />
      <Tile theme="dark" />
    </div>
  );
}
