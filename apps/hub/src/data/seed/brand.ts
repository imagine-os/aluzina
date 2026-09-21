import { PROJECT_IDS as P } from './projects';
import type { SeedCtx } from './types';

export const order = 30;

export function seed({ add, users }: SeedCtx): void {
  // 20 competition slots in 2027 (docs/knowledge/competitions.md). Names and dates are unknown: null, never guessed.
  for (let i = 1; i <= 20; i++) {
    const project = i === 1 ? 'Honey Valley Lighting' : i === 2 ? '"Hoy" Interior Design Project' : i === 3 ? 'Noam Residential Project' : null;
    add('competitions', `cmp-2027-${String(i).padStart(2, '0')}`, {
      slot: i,
      name: null,
      organiser: null,
      category: project === 'Honey Valley Lighting' ? 'lighting' : project ? 'interior design' : null,
      submissionDate: null,
      project,
      materialsFolder: project ? `Concursos 2027/${String(i).padStart(2, '0')} - ${project.replaceAll('"', '')}` : null,
      status: project ? 'researching' : 'slot',
      result: null,
    });
  }

  add('presentations', 'prs-hv-concursos', { title: 'Honey Valley Lighting: dossier de colección', projectId: P.honeyValley, kind: 'competition', status: 'drafting', dueDate: '2026-10-15', ownerId: users.brand, slideCount: 18 });
  add('presentations', 'prs-provenza-ventas', { title: 'Propuesta comercial Café Provenza', projectId: P.provenza, kind: 'sales', status: 'requested', dueDate: '2026-09-24', ownerId: users.brand, slideCount: 0 });
  add('presentations', 'prs-laureles-propuesta', { title: 'Propuesta sala y comedor Casa Laureles', projectId: P.laureles, kind: 'proposal', status: 'review', dueDate: '2026-10-02', ownerId: users.brand, slideCount: 26 });
  add('presentations', 'prs-aluzina-servicios', { title: 'Aluzina: servicios y portafolio 2026', projectId: null, kind: 'sales', status: 'final', dueDate: null, ownerId: users.brand, slideCount: 32 });

  add('brandAssets', 'ast-logo-primary', { name: 'Logotipo principal', kind: 'logo', format: 'svg', version: '2.1', path: 'Marca/Logo/aluzina-primary.svg', status: 'current' });
  add('brandAssets', 'ast-logo-mono', { name: 'Logotipo monocromo', kind: 'logo', format: 'svg', version: '2.1', path: 'Marca/Logo/aluzina-mono.svg', status: 'current' });
  add('brandAssets', 'ast-type', { name: 'Tipografías: Playfair Display + Roboto', kind: 'typography', format: 'otf', version: '1.0', path: 'Marca/Tipografia/', status: 'current' });
  add('brandAssets', 'ast-palette', { name: 'Paleta: negro cálido, ámbar, crema', kind: 'palette', format: 'ase', version: '1.2', path: 'Marca/Paleta/aluzina.ase', status: 'current' });
  add('brandAssets', 'ast-template-pdf', { name: 'Plantilla PDF de proyecto', kind: 'template', format: 'indd', version: '3.0', path: 'Marca/Plantillas/proyecto-pdf.indd', status: 'draft' });
  add('brandAssets', 'ast-template-deck', { name: 'Plantilla presentación de ventas', kind: 'template', format: 'key', version: '2.0', path: 'Marca/Plantillas/ventas.key', status: 'current' });
  add('brandAssets', 'ast-guideline', { name: 'Manual de identidad', kind: 'guideline', format: 'pdf', version: '1.0', path: 'Marca/manual-identidad-v1.pdf', status: 'superseded' });

  add('revisions', 'rev-laureles-pdf', { title: 'Aplicar identidad al PDF propuesta sala', projectId: P.laureles, kind: 'pdf', requestedById: users.studio, status: 'requested', dueDate: '2026-09-30' });
  add('revisions', 'rev-hoy-imagenes', { title: 'Imágenes cliente: renders recepción HOY', projectId: P.hoy, kind: 'image', requestedById: users.founder, status: 'in-progress', dueDate: '2026-09-26' });
  add('revisions', 'rev-noam-fotos', { title: 'Retoque fotos de avance Noam', projectId: P.noam, kind: 'image', requestedById: users.ops, status: 'delivered', dueDate: '2026-09-18' });
  add('revisions', 'rev-social-septiembre', { title: 'Piezas redes septiembre', projectId: null, kind: 'social', requestedById: users.founder, status: 'approved', dueDate: '2026-09-10' });
}
