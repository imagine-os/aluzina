import { PostCard } from './PostCard';

export default function PostCardExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', maxWidth: '36rem' }}>
      <PostCard title="Brand voice rules" kind="procedure" pinned tags={['brand', 'procesos']} author={{ name: 'Angélica', initials: 'A' }} updated="20 Sep 2026" alsoIn={3} excerpt="Una sola voz en todo lo que sale del estudio: propuestas, PDFs, redes, correos." onOpen={() => undefined} />
      <PostCard title="Sporti: what we know" kind="note" status="draft" tags={['clientes']} author={{ name: 'Dev', initials: 'DV' }} updated="20 Sep 2026" alsoIn={1} onOpen={() => undefined} />
      <PostCard title="Brand kit: logos, type, palette" kind="link" url="https://aluzinaa.com/" author={{ name: 'Angélica', initials: 'A' }} updated="20 Sep 2026" onOpen={() => undefined} />
      {/* ar-17: a file post with no served render - the Thumb draws the file-family icon, never a broken image. */}
      <PostCard title="Proposal template v3.indd" kind="file" thumbType="vector" thumbSrc={null} thumbLabel="Vector / layout" tags={['plantillas']} author={{ name: 'Justin', initials: 'J' }} updated="20 Sep 2026" excerpt="Estructura vigente para toda propuesta comercial." onOpen={() => undefined} />
    </div>
  );
}
