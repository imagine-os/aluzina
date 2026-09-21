import { PROJECT_IDS as P } from './projects';
import type { SeedCtx } from './types';

export const order = 10;

export const SUPPLIER_IDS = {
  luminariasValle: 'sup-luminarias-del-valle',
  iluminacionAndina: 'sup-iluminacion-andina',
  marmolesAntioquia: 'sup-marmoles-de-antioquia',
  ebanisteriaRobledo: 'sup-ebanisteria-robledo',
  mueblesSabaneta: 'sup-muebles-sabaneta',
  textilesCandelaria: 'sup-textiles-la-candelaria',
  metalItagui: 'sup-metalmecanica-itagui',
  impresosPrado: 'sup-impresos-prado',
} as const;

export function seed({ add }: SeedCtx): void {
  const S = SUPPLIER_IDS;

  add('suppliers', S.luminariasValle, { name: 'Luminarias del Valle', category: 'lighting', contactName: 'Carolina Mejía', phone: '+57 604 000 0001', email: 'ventas@luminariasdelvalle.demo', city: 'Medellín', leadTimeDays: 21, rating: 5, status: 'active' });
  add('suppliers', S.iluminacionAndina, { name: 'Iluminación Andina', category: 'lighting', contactName: 'Jorge Cadavid', phone: '+57 604 000 0002', email: 'proyectos@iluminacionandina.demo', city: 'Bogotá', leadTimeDays: 30, rating: 4, status: 'active' });
  add('suppliers', S.marmolesAntioquia, { name: 'Mármoles de Antioquia', category: 'stone', contactName: 'Luz Elena Ríos', phone: '+57 604 000 0003', email: 'contacto@marmolesdeantioquia.demo', city: 'Medellín', leadTimeDays: 25, rating: 4, status: 'active' });
  add('suppliers', S.ebanisteriaRobledo, { name: 'Ebanistería Robledo', category: 'wood', contactName: 'Don Álvaro Robledo', phone: '+57 604 000 0004', email: 'taller@ebanisteriarobledo.demo', city: 'Medellín', leadTimeDays: 45, rating: 5, status: 'active' });
  add('suppliers', S.mueblesSabaneta, { name: 'Muebles Sabaneta', category: 'furniture', contactName: 'Paula Gómez', phone: '+57 604 000 0005', email: 'paula@mueblessabaneta.demo', city: 'Sabaneta', leadTimeDays: 35, rating: 3, status: 'trial' });
  add('suppliers', S.textilesCandelaria, { name: 'Textiles La Candelaria', category: 'textiles', contactName: 'Marta Vélez', phone: '+57 604 000 0006', email: 'marta@textileslacandelaria.demo', city: 'Medellín', leadTimeDays: 15, rating: 4, status: 'active' });
  add('suppliers', S.metalItagui, { name: 'Metalmecánica Itagüí', category: 'metalwork', contactName: 'Andrés Zapata', phone: '+57 604 000 0007', email: 'andres@metalitagui.demo', city: 'Itagüí', leadTimeDays: 28, rating: 4, status: 'active' });
  add('suppliers', S.impresosPrado, { name: 'Impresos Prado', category: 'printing', contactName: 'Sandra Ospina', phone: '+57 604 000 0008', email: 'sandra@impresosprado.demo', city: 'Medellín', leadTimeDays: 5, rating: 3, status: 'paused' });

  // Comparison group: living-room luminaires for Casa Laureles (three quotes side by side).
  add('quotes', 'qte-laureles-lum-valle', { projectId: P.laureles, supplierId: S.luminariasValle, comparisonGroup: 'laureles-luminarias-sala', item: '6 colgantes latón + 4 apliques, sala y comedor', amountCop: 18_400_000, leadTimeDays: 21, validUntil: '2026-10-10', status: 'shortlisted', notes: 'Incluye instalación.' });
  add('quotes', 'qte-laureles-lum-andina', { projectId: P.laureles, supplierId: S.iluminacionAndina, comparisonGroup: 'laureles-luminarias-sala', item: '6 colgantes latón + 4 apliques, sala y comedor', amountCop: 16_900_000, leadTimeDays: 30, validUntil: '2026-10-05', status: 'received', notes: 'Sin instalación; flete desde Bogotá aparte.' });
  add('quotes', 'qte-laureles-lum-metal', { projectId: P.laureles, supplierId: S.metalItagui, comparisonGroup: 'laureles-luminarias-sala', item: 'Fabricación a medida de 6 colgantes (diseño Aluzina)', amountCop: 21_200_000, leadTimeDays: 28, validUntil: '2026-10-15', status: 'received', notes: 'Diseño propio, acabado latón cepillado.' });
  // Comparison group: reception marble for HOY (urgent, validity ends this week).
  add('quotes', 'qte-hoy-marmol-antioquia', { projectId: P.hoy, supplierId: S.marmolesAntioquia, comparisonGroup: 'hoy-marmol-recepcion', item: 'Mármol Crema Marfil 14 m² mostrador y muro recepción', amountCop: 27_500_000, leadTimeDays: 25, validUntil: '2026-09-23', status: 'shortlisted', notes: 'Muestras el 23 de septiembre.' });
  add('quotes', 'qte-hoy-marmol-metal', { projectId: P.hoy, supplierId: S.metalItagui, comparisonGroup: 'hoy-marmol-recepcion', item: 'Estructura metálica mostrador recepción', amountCop: 6_800_000, leadTimeDays: 20, validUntil: '2026-09-30', status: 'received', notes: '' });
  // Comparison group: kitchen joinery for Noam (selected).
  add('quotes', 'qte-noam-eban-robledo', { projectId: P.noam, supplierId: S.ebanisteriaRobledo, comparisonGroup: 'noam-ebanisteria-cocina', item: 'Cocina completa en roble + isla', amountCop: 48_000_000, leadTimeDays: 45, validUntil: null, status: 'selected', notes: 'Contrato firmado, 3 pagos.' });
  add('quotes', 'qte-noam-eban-sabaneta', { projectId: P.noam, supplierId: S.mueblesSabaneta, comparisonGroup: 'noam-ebanisteria-cocina', item: 'Cocina completa en roble + isla', amountCop: 41_500_000, leadTimeDays: 35, validUntil: null, status: 'rejected', notes: 'Muestras de acabado por debajo del estándar.' });
  add('quotes', 'qte-rutan-lum-valle', { projectId: P.rutaN, supplierId: S.luminariasValle, comparisonGroup: 'rutan-iluminacion-circadiana', item: '60 luminarias lineales tunable white + control', amountCop: 62_000_000, leadTimeDays: 21, validUntil: '2026-10-20', status: 'requested', notes: '' });

  add('deliveries', 'dlv-noam-cocina', { projectId: P.noam, supplierId: S.ebanisteriaRobledo, item: 'Módulos cocina en roble', expectedDate: '2026-10-14', confirmedDate: '2026-10-14', status: 'confirmed' });
  add('deliveries', 'dlv-noam-marmol', { projectId: P.noam, supplierId: S.marmolesAntioquia, item: 'Mármol baños (2)', expectedDate: '2026-09-19', confirmedDate: null, status: 'delayed' });
  add('deliveries', 'dlv-rutan-puestos', { projectId: P.rutaN, supplierId: S.mueblesSabaneta, item: '60 puestos de trabajo', expectedDate: '2026-11-10', confirmedDate: null, status: 'pending' });
  add('deliveries', 'dlv-hoy-textiles', { projectId: P.hoy, supplierId: S.textilesCandelaria, item: 'Cortinas salas de terapia', expectedDate: '2026-11-25', confirmedDate: null, status: 'pending' });
  add('deliveries', 'dlv-laureles-muestras', { projectId: P.laureles, supplierId: S.luminariasValle, item: 'Muestras de acabado latón', expectedDate: '2026-09-18', confirmedDate: '2026-09-18', status: 'delivered' });

  add('payments', 'pay-laureles-anticipo', { projectId: P.laureles, counterparty: 'Familia Restrepo', direction: 'in', concept: 'Anticipo 30% diseño', amountCop: 18_500_000, paidCop: 0, dueDate: '2026-09-15', paidDate: null, status: 'overdue' });
  add('payments', 'pay-hoy-hito2', { projectId: P.hoy, counterparty: 'HOY', direction: 'in', concept: 'Hito 2: documentación técnica', amountCop: 84_000_000, paidCop: 42_000_000, dueDate: '2026-10-10', paidDate: null, status: 'partial' });
  add('payments', 'pay-noam-robledo-2', { projectId: P.noam, counterparty: 'Ebanistería Robledo', direction: 'out', concept: 'Pago 2 de 3, cocina', amountCop: 16_000_000, paidCop: 0, dueDate: '2026-09-30', paidDate: null, status: 'due' });
  add('payments', 'pay-noam-robledo-1', { projectId: P.noam, counterparty: 'Ebanistería Robledo', direction: 'out', concept: 'Pago 1 de 3, cocina', amountCop: 16_000_000, paidCop: 16_000_000, dueDate: '2026-08-15', paidDate: '2026-08-14', status: 'paid' });
  add('payments', 'pay-rutan-hito1', { projectId: P.rutaN, counterparty: 'Ruta N', direction: 'in', concept: 'Hito 1: concepto aprobado', amountCop: 72_000_000, paidCop: 72_000_000, dueDate: '2026-06-30', paidDate: '2026-07-03', status: 'paid' });
  add('payments', 'pay-hoy-marmol-anticipo', { projectId: P.hoy, counterparty: 'Mármoles de Antioquia', direction: 'out', concept: 'Anticipo 50% mármol recepción', amountCop: 13_750_000, paidCop: 0, dueDate: '2026-10-01', paidDate: null, status: 'due' });
  add('payments', 'pay-arriendo-taller', { projectId: null, counterparty: 'Inmobiliaria Laureles', direction: 'out', concept: 'Arriendo taller octubre', amountCop: 4_200_000, paidCop: 0, dueDate: '2026-10-05', paidDate: null, status: 'due' });

  add('documents', 'doc-laureles-contrato', { projectId: P.laureles, title: 'Contrato de diseño Casa Laureles', kind: 'contract', status: 'signed', ownerRole: 'ops', version: 2, url: null });
  add('documents', 'doc-laureles-pdf', { projectId: P.laureles, title: 'PDF propuesta sala y comedor', kind: 'project-pdf', status: 'draft', ownerRole: 'founder', version: 1, url: null });
  add('documents', 'doc-hoy-planos', { projectId: P.hoy, title: 'Planos técnicos recepción y salas', kind: 'plan', status: 'final', ownerRole: 'studio', version: 3, url: null });
  add('documents', 'doc-hoy-cotizacion', { projectId: P.hoy, title: 'Cotización cliente hito 3', kind: 'quote', status: 'draft', ownerRole: 'founder', version: 1, url: null });
  add('documents', 'doc-noam-factura2', { projectId: P.noam, title: 'Factura Ebanistería Robledo pago 2', kind: 'invoice', status: 'sent', ownerRole: 'ops', version: 1, url: null });
  add('documents', 'doc-informe-sept', { projectId: null, title: 'Informe mensual septiembre 2026', kind: 'report', status: 'draft', ownerRole: 'ops', version: 1, url: null });
  add('documents', 'doc-provenza-brief', { projectId: P.provenza, title: 'Brief Café Provenza', kind: 'brief', status: 'draft', ownerRole: 'founder', version: 1, url: null });
}
