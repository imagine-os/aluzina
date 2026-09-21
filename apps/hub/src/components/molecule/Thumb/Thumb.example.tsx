import { Card } from '../Card/Card';
import { Thumb } from './Thumb';

export default function ThumbExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))' }}>
      <Card padding="sm" onActivate={() => undefined} aria-label="Open portfolio page 4">
        <Thumb src="./thumbs/G-08.jpg" alt="Brand documents page" type="image" badge="JPG" caption="G-08 brand documents screenshot" />
      </Card>
      <Card padding="sm">
        <Thumb src={null} alt="Planta general" type="pdf" badge="12 p." caption="03_PLANOS/planta-general.pdf" iconLabel="PDF" />
      </Card>
      <Card padding="sm">
        <Thumb src="./does-not-exist.jpg" alt="Broken image falls back to the icon" type="cad" ratio="1:1" caption="planta.dwg (failed load)" iconLabel="CAD drawing" />
      </Card>
      <Card padding="sm">
        <Thumb src={null} alt="Carpeta" type="folder" ratio="16:9" size="sm" caption="DISEÑO" iconLabel="Folder" />
      </Card>
    </div>
  );
}
