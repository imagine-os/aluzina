import { FILE_TYPES, FILE_TYPE_LABELS, pick } from '../../../domain';
import { useT } from '../../../i18n/I18nProvider';
import { FileIcon } from './FileIcon';

export default function FileIconExample() {
  const { lang } = useT();
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        {FILE_TYPES.map((type) => (
          <div key={type} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--space-1)', minWidth: '5rem' }}>
            <FileIcon type={type} size="lg" label={pick(FILE_TYPE_LABELS[type], lang)} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{type}</span>
          </div>
        ))}
      </div>
      <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
        <FileIcon type="pdf" size="sm" label="PDF" /> Inline with text (sm) <FileIcon type="image" size="md" label="Image" /> in a list row (md)
      </p>
    </div>
  );
}
