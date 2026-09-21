import { SUPPLIER_IDS as S } from './operations';
import { PROJECT_IDS as P } from './projects';
import type { SeedCtx } from './types';

export const order = 20;

export function seed({ add, users }: SeedCtx): void {
  add('references', 'ref-laureles-sala-1', { projectId: P.laureles, title: 'Sala con luz cálida rasante', source: 'Pinterest', tags: ['sala', 'luz cálida', 'madera'], board: 'Casa Laureles: zonas sociales', imageUrl: null, note: 'Temperatura 2700 K, rasante sobre muro texturizado.' });
  add('references', 'ref-laureles-cocina', { projectId: P.laureles, title: 'Cocina abierta con isla en piedra', source: 'Archdaily', tags: ['cocina', 'isla', 'piedra'], board: 'Casa Laureles: zonas sociales', imageUrl: null, note: '' });
  add('references', 'ref-hoy-recepcion', { projectId: P.hoy, title: 'Recepción wellness en mármol crema', source: 'Dezeen', tags: ['recepción', 'mármol', 'wellness'], board: 'HOY: recepción', imageUrl: null, note: 'Referencia para el mostrador.' });
  add('references', 'ref-hv-laton', { projectId: P.honeyValley, title: 'Latón cepillado y vidrio ámbar', source: 'Feria Euroluce', tags: ['latón', 'vidrio', 'colgante'], board: 'Honey Valley: materiales', imageUrl: null, note: 'Acabado base de la colección.' });
  add('references', 'ref-provenza-barra', { projectId: P.provenza, title: 'Barra de café con iluminación bajo mesón', source: 'Instagram', tags: ['barra', 'café', 'led'], board: 'Café Provenza: primeras ideas', imageUrl: null, note: '' });
  add('references', 'ref-general-texturas', { projectId: null, title: 'Biblioteca de texturas cálidas', source: 'Archivo Aluzina', tags: ['texturas', 'paleta'], board: 'Biblioteca general', imageUrl: null, note: 'Referencias compartidas entre proyectos.' });

  add('materials', 'mat-laureles-roble', { projectId: P.laureles, palette: 'Casa Laureles: cálida', name: 'Roble natural', category: 'madera', supplierId: S.ebanisteriaRobledo, finish: 'Aceite mate', color: 'Miel', unitCop: 420_000, status: 'approved' });
  add('materials', 'mat-laureles-piedra', { projectId: P.laureles, palette: 'Casa Laureles: cálida', name: 'Piedra Royal Beige', category: 'piedra', supplierId: S.marmolesAntioquia, finish: 'Apomazado', color: 'Beige', unitCop: 890_000, status: 'sampled' });
  add('materials', 'mat-laureles-lino', { projectId: P.laureles, palette: 'Casa Laureles: cálida', name: 'Lino crudo', category: 'textil', supplierId: S.textilesCandelaria, finish: 'Natural', color: 'Crudo', unitCop: 95_000, status: 'proposed' });
  add('materials', 'mat-hoy-crema', { projectId: P.hoy, palette: 'HOY: serena', name: 'Mármol Crema Marfil', category: 'piedra', supplierId: S.marmolesAntioquia, finish: 'Pulido suave', color: 'Crema', unitCop: 1_250_000, status: 'sampled' });
  add('materials', 'mat-hoy-microcemento', { projectId: P.hoy, palette: 'HOY: serena', name: 'Microcemento arena', category: 'revestimiento', supplierId: null, finish: 'Mate', color: 'Arena', unitCop: 180_000, status: 'approved' });
  add('materials', 'mat-noam-nogal', { projectId: P.noam, palette: 'Noam: profunda', name: 'Nogal americano', category: 'madera', supplierId: S.ebanisteriaRobledo, finish: 'Laca mate', color: 'Nogal', unitCop: 610_000, status: 'approved' });
  add('materials', 'mat-hv-laton', { projectId: P.honeyValley, palette: 'Honey Valley', name: 'Latón cepillado', category: 'metal', supplierId: S.metalItagui, finish: 'Cepillado', color: 'Latón', unitCop: null, status: 'approved' });
  add('materials', 'mat-hv-vidrio', { projectId: P.honeyValley, palette: 'Honey Valley', name: 'Vidrio soplado ámbar', category: 'vidrio', supplierId: null, finish: 'Soplado', color: 'Ámbar', unitCop: null, status: 'proposed' });

  add('schedules', 'sch-laureles-mobiliario', { projectId: P.laureles, kind: 'furniture', title: 'Cuadro de mobiliario zonas sociales', itemCount: 24, status: 'in-review', dueDate: '2026-09-30' });
  add('schedules', 'sch-laureles-materiales', { projectId: P.laureles, kind: 'materials', title: 'Cuadro de materiales y acabados', itemCount: 18, status: 'draft', dueDate: '2026-10-07' });
  add('schedules', 'sch-hoy-iluminacion', { projectId: P.hoy, kind: 'lighting', title: 'Cuadro de luminarias por escena', itemCount: 42, status: 'final', dueDate: null });
  add('schedules', 'sch-noam-elementos', { projectId: P.noam, kind: 'elements', title: 'Elementos decorativos y arte', itemCount: 11, status: 'final', dueDate: null });
  add('schedules', 'sch-rutan-mobiliario', { projectId: P.rutaN, kind: 'furniture', title: 'Puestos, sillas y salas', itemCount: 96, status: 'final', dueDate: null });

  add('renderPacks', 'rp-laureles-sala', { projectId: P.laureles, title: 'Renders sala y comedor (3 vistas)', audience: 'render-artist', viewCount: 3, status: 'sent', dueDate: '2026-09-29' });
  add('renderPacks', 'rp-hoy-recepcion', { projectId: P.hoy, title: 'Paquete proveedor: mostrador recepción', audience: 'supplier', viewCount: 2, status: 'delivered', dueDate: null });
  add('renderPacks', 'rp-provenza-concepto', { projectId: P.provenza, title: 'Renders concepto barra y terraza', audience: 'render-artist', viewCount: 4, status: 'briefing', dueDate: '2026-10-10' });

  add('consistencyChecks', 'chk-laureles-sala', {
    projectId: P.laureles,
    title: 'Chequeo propuesta sala y comedor',
    checkedById: users.studio,
    items: [
      { label: 'Medidas verificadas en sitio', ok: true },
      { label: 'Cuadro de mobiliario coincide con planos', ok: true },
      { label: 'Materiales de la paleta aprobada', ok: false },
      { label: 'Luminarias con cotización vigente', ok: true },
      { label: 'PDF con identidad Aluzina', ok: false },
    ],
    status: 'issues',
    notes: 'Lino crudo aún en propuesta; PDF pendiente de plantilla.',
  });
  add('consistencyChecks', 'chk-hoy-documentacion', {
    projectId: P.hoy,
    title: 'Chequeo documentación técnica',
    checkedById: users.studio,
    items: [
      { label: 'Planos versión 3 firmados por estudio', ok: true },
      { label: 'Cuadro de luminarias final', ok: true },
      { label: 'Especificaciones de mármol con proveedor', ok: true },
    ],
    status: 'passed',
    notes: 'Listo para aprobación final de la fundadora.',
  });
  add('consistencyChecks', 'chk-hv-concepto', { projectId: P.honeyValley, title: 'Chequeo concepto colección', checkedById: users.studio, items: [{ label: 'Moodboard aprobado', ok: true }, { label: 'Prototipo colgante cotizado', ok: false }], status: 'pending', notes: '' });
}
