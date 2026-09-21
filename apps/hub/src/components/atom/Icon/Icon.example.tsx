import { ICON_NAMES, Icon } from './Icon';
import { GLYPH_ICONS } from './iconMap';

/** The icon sheet on D-02 (/#/dev/components): every name, drawn at lg with its name under it. */
export default function IconExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
        <Icon name="tokens" size="sm" /> sm 16
        <Icon name="tokens" size="md" /> md 20
        <Icon name="tokens" size="lg" /> lg 24
        <Icon name="tokens" size="xl" /> xl 32
        <span style={{ marginInlineStart: 'var(--space-4)' }}>
          <Icon name="info" size="md" /> default <Icon name="info" size="md" tone="muted" /> muted <Icon name="info" size="md" tone="accent" /> accent
        </span>
      </div>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {ICON_NAMES.map((name) => (
          <li
            key={name}
            style={{
              display: 'grid',
              justifyItems: 'center',
              gap: 'var(--space-1)',
              padding: 'var(--space-3) var(--space-2)',
              border: 'var(--hairline) solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Icon name={name} size="lg" />
            <code style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>{name}</code>
          </li>
        ))}
      </ul>
      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        {Object.keys(GLYPH_ICONS).length} Unicode glyphs from the route manifest and the seeded spaces map onto these{' '}
        {ICON_NAMES.length} icons (docs/design/icons.md); page codes override the glyph.
      </p>
    </div>
  );
}
