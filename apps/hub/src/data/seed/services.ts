import { phaseItems, serviceByCode } from '../../domain/playbook';
import { SUPPLIER_IDS as S } from './operations';
import { PROJECT_IDS as P } from './projects';
import type { SeedCtx } from './types';

/** After projects, operations and studio rows (references suppliers and projects). */
export const order = 40;

export const LEAD_IDS = {
  martinez: 'lead-apto-martinez',
  cafeSanJoaquin: 'lead-cafe-san-joaquin',
  clinicaSonrisa: 'lead-clinica-sonrisa',
  casaEnvigado: 'lead-casa-envigado',
  hotelBoutique: 'lead-hotel-boutique-guatape',
  studioLoft: 'lead-loft-estudio',
  oficinaContadores: 'lead-oficina-contadores',
  provenza: 'lead-cafe-provenza',
} as const;

export const ENGAGEMENT_IDS = {
  laureles: 'eng-laureles-03',
  hoy: 'eng-hoy-03',
  noamDesign: 'eng-noam-03',
  noamExecution: 'eng-noam-e',
  provenza: 'eng-provenza-02',
  rutaN: 'eng-rutan-e',
} as const;

/** Every item of every phase of a service ticked (a delivered engagement). */
function allTicked(code: '01' | '02' | '03' | 'E' | '04'): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const phase of serviceByCode(code)?.phases ?? []) ticked(phase.id, phaseItems(phase).length, out);
  return out;
}

/** Ticks the first `n` items of a phase (`${phaseId}:${index}`). */
function ticked(phaseId: string, n: number, into: Record<string, boolean> = {}): Record<string, boolean> {
  for (let i = 0; i < n; i++) into[`${phaseId}:${i}`] = true;
  return into;
}

/**
 * Playbook entities (prompt 0009, D-034) for the Medellín studio: leads across the seven channels and the
 * four lead statuses, one engagement per real project with its checklist ticked up to its stage, the
 * revision matrix of the two projects in design, change orders and purchases on the projects in execution,
 * site reports on Noam, and the Casa Laureles message thread with its client. COP, unknowns `null`.
 */
export function seed({ add, users }: SeedCtx): void {
  const L = LEAD_IDS;
  const E = ENGAGEMENT_IDS;

  // Leads (two from the public intake flow, the rest registered by hand or imported from the old spreadsheet).
  add('leads', L.martinez, { name: 'Camila Martínez', phone: '+57 300 000 0101', email: 'camila.martinez@demo.aluzina.local', city: 'Medellín', projectType: 'residential', areaM2: 95, projectStatus: 'built', requestedService: '01', suggestedService: '01', budgetCop: 25_000_000, desiredStart: '2026-11-01', channel: 'instagram', ownerId: users.founder, status: 'lead-new', qualification: { transform: 'Sala y comedor del apartamento', why: 'Acaban de mudarse', typology: 'residential', areaM2: '95', floorPlan: 'yes', projectStatus: 'built', depth: 'ideas', execute: 'no', investment: '20 a 30 millones', start: 'Noviembre' }, notes: 'Escribió por DM después de ver el reel de Casa Laureles.', projectId: null, source: 'public-intake' });
  add('leads', L.cafeSanJoaquin, { name: 'Café San Joaquín', phone: '+57 300 000 0102', email: 'hola@cafesanjoaquin.demo', city: 'Medellín', projectType: 'hospitality', areaM2: 120, projectStatus: 'under-construction', requestedService: '03', suggestedService: '03', budgetCop: 180_000_000, desiredStart: '2026-10-15', channel: 'website', ownerId: users.founder, status: 'lead-qualified', qualification: { transform: 'Local nuevo: barra, mesas y terraza', why: 'Apertura en enero', typology: 'hospitality', areaM2: '120', floorPlan: 'yes', projectStatus: 'under-construction', depth: 'full-design', execute: 'later', investment: '150 a 200 millones', start: 'Octubre' }, notes: 'Llenó el formulario del sitio; llamada de calificación hecha por Alejandra.', projectId: null, source: 'public-intake' });
  add('leads', L.clinicaSonrisa, { name: 'Clínica Sonrisa Sana', phone: null, email: 'gerencia@sonrisasana.demo', city: 'Rionegro', projectType: 'wellness', areaM2: 260, projectStatus: 'built', requestedService: '02', suggestedService: '03', budgetCop: null, desiredStart: null, channel: 'referral', ownerId: users.founder, status: 'lead-qualified', qualification: { transform: 'Recepción y salas de espera', why: 'Quieren diferenciarse', typology: 'wellness', areaM2: '260', floorPlan: 'no', projectStatus: 'built', depth: 'full-design', execute: 'yes', investment: 'Por definir', start: '2027' }, notes: 'Referida por HOY. Pidieron una visita; el diagnóstico sugiere diseño integral (regla comercial G-10).', projectId: null, source: 'manual' });
  add('leads', L.casaEnvigado, { name: 'Familia Gómez Arango', phone: '+57 300 000 0104', email: 'gomezarango@demo.aluzina.local', city: 'Envigado', projectType: 'residential', areaM2: 210, projectStatus: 'built', requestedService: '03', suggestedService: '03', budgetCop: 220_000_000, desiredStart: '2026-11-15', channel: 'whatsapp', ownerId: users.founder, status: 'proposal-sent', qualification: { transform: 'Casa completa, primer piso', why: 'Herencia familiar, quieren renovarla', typology: 'residential', areaM2: '210', floorPlan: 'yes', projectStatus: 'built', depth: 'full-design', execute: 'yes', investment: '200 a 250 millones', start: 'Noviembre' }, notes: 'Propuesta enviada el 18 de septiembre; esperan respuesta esta semana.', projectId: null, source: 'manual' });
  add('leads', L.hotelBoutique, { name: 'Hotel Boutique Guatapé', phone: '+57 300 000 0105', email: 'reservas@boutiqueguatape.demo', city: 'Guatapé', projectType: 'hospitality', areaM2: 640, projectStatus: 'conceptual', requestedService: '01', suggestedService: '03', budgetCop: 450_000_000, desiredStart: '2027-03-01', channel: 'networking', ownerId: null, status: 'lead-new', qualification: { transform: 'Hotel de 12 habitaciones', typology: 'hospitality', areaM2: '640', projectStatus: 'conceptual', depth: 'ideas', execute: 'later' }, notes: 'Contacto en el evento de Camacol; sin dueño asignado aún.', projectId: null, source: 'manual' });
  add('leads', L.studioLoft, { name: 'Andrés Palacio', phone: '+57 300 000 0106', email: 'andres.palacio@demo.aluzina.local', city: 'Medellín', projectType: 'residential', areaM2: 60, projectStatus: 'built', requestedService: '04', suggestedService: '04', budgetCop: 12_000_000, desiredStart: '2026-10-05', channel: 'email', ownerId: users.studio, status: 'contracted', qualification: { transform: 'Loft: composición y luz decorativa', why: 'Sesión de fotos en noviembre', typology: 'residential', areaM2: '60', floorPlan: 'no', projectStatus: 'built', depth: 'styling', execute: 'no', investment: '10 a 15 millones', start: 'Octubre' }, notes: 'Styling contratado; proyecto pendiente de crear.', projectId: null, source: 'manual' });
  add('leads', L.oficinaContadores, { name: 'Contadores Asociados SAS', phone: '+57 300 000 0107', email: 'admin@contadoresasociados.demo', city: 'Medellín', projectType: 'commercial', areaM2: 180, projectStatus: 'built', requestedService: null, suggestedService: '02', budgetCop: null, desiredStart: null, channel: 'partnership', ownerId: users.ops, status: 'lead-new', qualification: {}, notes: 'Llegó por la alianza con Luminarias del Valle; falta la llamada de calificación.', projectId: null, source: 'import' });
  add('leads', L.provenza, { name: 'Grupo Provenza', phone: '+57 300 000 0108', email: 'proyectos@grupoprovenza.demo', city: 'Medellín', projectType: 'hospitality', areaM2: 80, projectStatus: 'built', requestedService: '02', suggestedService: '02', budgetCop: 95_000_000, desiredStart: '2026-10-01', channel: 'referral', ownerId: users.founder, status: 'lead-qualified', qualification: { transform: 'Café de especialidad: barra, terraza y mezzanine', why: 'Cambio de concepto del local', typology: 'hospitality', areaM2: '80', floorPlan: 'yes', projectStatus: 'built', depth: 'ideas', execute: 'later', investment: '80 a 100 millones', start: 'Octubre' }, notes: 'Lead calificado; ya existe el proyecto Café Provenza en fase lead.', projectId: P.provenza, source: 'manual' });

  // Engagements: one service per real project, checklist ticked up to the current phase.
  add('engagements', E.laureles, { projectId: P.laureles, serviceCode: '03', currentPhaseId: '03-11', checks: { ...ticked('03-1', 7), ...ticked('03-2', 9), ...ticked('03-3', 9), ...ticked('03-4', 7), ...ticked('03-5', 3), ...ticked('03-6', 3), ...ticked('03-7', 6), ...ticked('03-8', 10), ...ticked('03-9', 6), ...ticked('03-10', 4), ...ticked('03-11', 2) }, brief: { 'client.goals': 'Casa luminosa para recibir amigos; cocina abierta al comedor.', 'user.profile': 'Pareja con dos hijos adolescentes.', 'experience.desired': 'Cálida, sin ruido visual, luz baja en la noche.', 'budget.framework': '185 millones incluyendo luminarias.', 'maintenance.expectations': 'Materiales fáciles de limpiar en cocina.' }, startedAt: '2026-07-06', completedAt: null, status: 'in-progress' });
  add('engagements', E.hoy, { projectId: P.hoy, serviceCode: '03', currentPhaseId: '03-17', checks: { ...ticked('03-1', 7), ...ticked('03-2', 9), ...ticked('03-3', 9), ...ticked('03-4', 7), ...ticked('03-5', 3), ...ticked('03-6', 3), ...ticked('03-7', 6), ...ticked('03-8', 10), ...ticked('03-9', 6), ...ticked('03-10', 4), ...ticked('03-11', 5), ...ticked('03-12', 10), ...ticked('03-13', 8), ...ticked('03-14', 7), ...ticked('03-15', 5), ...ticked('03-16', 1), ...ticked('03-17', 7) }, brief: { 'client.goals': 'Centro de bienestar con identidad propia.', 'brand.context': 'Marca HOY: calma, ritual, naturaleza.', 'routines.operational': 'Terapias de 60 min, recepción continua.', 'experience.desired': 'Neurointeriorismo: escenas de luz por ritual.' }, startedAt: '2026-03-02', completedAt: null, status: 'in-progress' });
  add('engagements', E.noamDesign, { projectId: P.noam, serviceCode: '03', currentPhaseId: '03-19', checks: allTicked('03'), brief: { 'client.goals': 'Apartamento de 210 m² con carpintería a medida.' }, startedAt: '2026-01-19', completedAt: '2026-06-30', status: 'delivered' });
  add('engagements', E.noamExecution, { projectId: P.noam, serviceCode: 'E', currentPhaseId: 'E-6', checks: { ...ticked('E-1', 10), ...ticked('E-2', 3), ...ticked('E-3', 7), ...ticked('E-4', 5), ...ticked('E-5', 4), ...ticked('E-6', 7) }, brief: {}, startedAt: '2026-07-01', completedAt: null, status: 'in-progress' });
  add('engagements', E.provenza, { projectId: P.provenza, serviceCode: '02', currentPhaseId: '02-2', checks: { ...ticked('02-1', 7), ...ticked('02-2', 2) }, brief: { 'problem.main': 'El local no invita a quedarse; la barra está escondida.', 'user.who': 'Clientes de café de especialidad, 25 a 45 años.', 'outcome.desired': 'Un café que se sienta como una sala.' }, startedAt: '2026-09-14', completedAt: null, status: 'started' });
  add('engagements', E.rutaN, { projectId: P.rutaN, serviceCode: 'E', currentPhaseId: 'E-5', checks: { ...ticked('E-1', 10), ...ticked('E-2', 3), ...ticked('E-3', 7), ...ticked('E-4', 5), ...ticked('E-5', 3) }, brief: {}, startedAt: '2026-08-03', completedAt: null, status: 'in-progress' });

  // Revision matrix (03 stage 10, G-05): one row per comment, never scattered through WhatsApp.
  add('revisionItems', 'rev-laureles-01', { projectId: P.laureles, engagementId: E.laureles, stage: 'Esquema sala y comedor', item: 'Ubicación del sofá frente a la ventana', comment: 'Preferimos el sofá mirando al jardín, no a la TV.', authorId: users.client, source: 'client', status: 'approved-with-adjustments', decidedAt: '2026-09-12' });
  add('revisionItems', 'rev-laureles-02', { projectId: P.laureles, engagementId: E.laureles, stage: 'Esquema sala y comedor', item: 'Isla de cocina', comment: 'La isla queda; confirmar altura de 90 cm.', authorId: users.client, source: 'client', status: 'approved', decidedAt: '2026-09-12' });
  add('revisionItems', 'rev-laureles-03', { projectId: P.laureles, engagementId: E.laureles, stage: 'Esquema sala y comedor', item: 'Colgantes sobre el comedor', comment: 'Quieren ver una segunda opción más discreta.', authorId: users.client, source: 'client', status: 'revision', decidedAt: null });
  add('revisionItems', 'rev-laureles-04', { projectId: P.laureles, engagementId: E.laureles, stage: 'Paleta', item: 'Lino crudo en cortinas', comment: 'Verificar que el lino crudo esté dentro de la paleta aprobada antes del PDF.', authorId: users.studio, source: 'studio', status: 'revision', decidedAt: null });
  add('revisionItems', 'rev-hoy-01', { projectId: P.hoy, engagementId: E.hoy, stage: 'Planos técnicos v3', item: 'Mostrador de recepción', comment: 'Aprobado con la estructura metálica de Metalmecánica Itagüí.', authorId: users.founder, source: 'founder', status: 'approved', decidedAt: '2026-09-15' });
  add('revisionItems', 'rev-hoy-02', { projectId: P.hoy, engagementId: E.hoy, stage: 'Escenas de luz', item: 'Escena "cierre" de las salas de terapia', comment: 'Bajar la temperatura de color a 2400 K en la escena de cierre.', authorId: users.founder, source: 'founder', status: 'approved-with-adjustments', decidedAt: '2026-09-15' });

  // Change orders (E stage 8, G-14) on Noam.
  add('changeOrders', 'co-noam-01', { projectId: P.noam, description: 'Cambiar el mármol de los baños por cuarzo Calacatta', reason: 'El mármol se retrasó 3 semanas (entrega Mármoles de Antioquia).', extraCostCop: 2_400_000, extraDays: 0, requestedById: users.ops, status: 'approved', approvedAt: '2026-09-18' });
  add('changeOrders', 'co-noam-02', { projectId: P.noam, description: 'Agregar iluminación bajo la isla de cocina', reason: 'Solicitud del cliente en la visita del 12 de septiembre.', extraCostCop: 1_850_000, extraDays: 4, requestedById: users.studio, status: 'requested', approvedAt: null });

  // Purchasing control (E stage 5, G-07) on Noam and Ruta N.
  add('purchases', 'pur-noam-cocina', { projectId: P.noam, supplierId: S.ebanisteriaRobledo, reference: 'Cocina completa en roble + isla', quantity: 1, priceCop: 48_000_000, date: '2026-07-10', responsibleId: users.ops, status: 'ordered' });
  add('purchases', 'pur-noam-marmol', { projectId: P.noam, supplierId: S.marmolesAntioquia, reference: 'Mármol baños (2), Crema Marfil', quantity: 2, priceCop: 9_600_000, date: '2026-08-20', responsibleId: users.ops, status: 'paid' });
  add('purchases', 'pur-noam-colgantes', { projectId: P.noam, supplierId: S.luminariasValle, reference: 'Colgantes colección Aluzina, comedor', quantity: 3, priceCop: 7_200_000, date: '2026-08-01', responsibleId: users.ops, status: 'installed' });
  add('purchases', 'pur-noam-textiles', { projectId: P.noam, supplierId: S.textilesCandelaria, reference: 'Cortinas lino, habitaciones (3)', quantity: 3, priceCop: 4_100_000, date: '2026-09-15', responsibleId: users.ops, status: 'quoted' });
  add('purchases', 'pur-rutan-luminarias', { projectId: P.rutaN, supplierId: S.luminariasValle, reference: '60 luminarias lineales tunable white + control', quantity: 60, priceCop: 62_000_000, date: '2026-09-10', responsibleId: users.ops, status: 'approved' });
  add('purchases', 'pur-rutan-puestos', { projectId: P.rutaN, supplierId: S.mueblesSabaneta, reference: 'Puestos de trabajo (60)', quantity: 60, priceCop: 84_000_000, date: '2026-09-01', responsibleId: users.ops, status: 'received' });

  // Site control (E stage 7, G-08) on Noam.
  add('siteReports', 'sr-noam-01', { projectId: P.noam, date: '2026-08-29', progress: 55, notes: 'Instalaciones eléctricas terminadas; cielos en curso.', decisions: 'Se confirma la altura del cielo en cocina a 2,55 m.', problems: 'Mármol de baños retrasado.', responsibleId: users.ops, resolutionDue: '2026-09-19', photoUrls: [] });
  add('siteReports', 'sr-noam-02', { projectId: P.noam, date: '2026-09-12', progress: 68, notes: 'Pisos instalados en zonas sociales; carpintería en taller.', decisions: 'Cliente pide luz bajo la isla (orden de cambio co-noam-02).', problems: 'Ninguno nuevo.', responsibleId: users.studio, resolutionDue: null, photoUrls: [] });
  add('siteReports', 'sr-noam-03', { projectId: P.noam, date: '2026-09-19', progress: 72, notes: 'Acabados de muros; baños a la espera del cuarzo.', decisions: 'Cuarzo Calacatta aprobado en lugar del mármol (co-noam-01).', problems: 'Entrega de cuarzo por confirmar.', responsibleId: users.ops, resolutionDue: '2026-09-30', photoUrls: [] });

  // Messages on Casa Laureles between the studio and its client (the demo client user).
  const thread: [string, string, string, string[]][] = [
    ['msg-laureles-01', users.founder, 'Hola familia Restrepo, bienvenidos al canal oficial del proyecto. Todo lo que decidamos queda aquí.', [users.client, users.studio]],
    ['msg-laureles-02', users.client, 'Gracias Alejandra. ¿Cuándo vemos el esquema de la sala?', [users.founder, users.studio]],
    ['msg-laureles-03', users.studio, 'El jueves 10 de septiembre les presentamos el esquema; les comparto la agenda.', [users.client, users.founder]],
    ['msg-laureles-04', users.client, 'Perfecto. Una cosa: preferimos el sofá mirando al jardín.', [users.founder, users.studio]],
    ['msg-laureles-05', users.founder, 'Anotado en la matriz de revisión como "aprobado con ajustes". Lo resolvemos en la propuesta.', [users.client]],
    ['msg-laureles-06', users.client, '¿Podemos ver otra opción de colgantes para el comedor? Los actuales se sienten muy grandes.', [users.founder, users.studio]],
    ['msg-laureles-07', users.studio, 'Sí, preparamos una segunda opción más discreta para la presentación del 3 de octubre.', [users.client]],
    ['msg-laureles-08', users.ops, 'Recordatorio amable: el anticipo del 30% venció el 15 de septiembre. ¿Necesitan que reenviemos la cuenta de cobro?', [users.client]],
    ['msg-laureles-09', users.client, 'Sí por favor, lo pagamos esta semana. Disculpen la demora.', [users.ops, users.founder]],
    ['msg-laureles-10', users.ops, 'Enviada por correo. Gracias.', []],
  ];
  thread.forEach(([id, authorId, body, readBy], i) => {
    const day = String(4 + Math.floor(i * 1.6)).padStart(2, '0');
    add('messages', id, { projectId: P.laureles, authorId, body, at: `2026-09-${day}T10:${String(10 + i).padStart(2, '0')}:00-05:00`, readBy });
  });
}
