import type { SeedCtx } from './types';

export const order = 0;

/** Section ids (D-022) shared with seed/work.ts, which adds the rest of the tasks. */
export const SECTION_IDS = {
  laurelesBrief: 'sec-laureles-brief',
  laurelesConcepto: 'sec-laureles-concepto',
  laurelesDesarrollo: 'sec-laureles-desarrollo',
  laurelesDocs: 'sec-laureles-docs',
  laurelesCompras: 'sec-laureles-compras',
  laurelesObra: 'sec-laureles-obra',
  // HOY's sections come from the Asana import (seed/asana.ts, D-063), not from here.
  noamDiseno: 'sec-noam-diseno',
  noamDocs: 'sec-noam-docs',
  noamCompras: 'sec-noam-compras',
  noamObra: 'sec-noam-obra',
  noamEntrega: 'sec-noam-entrega',
  hvConcepto: 'sec-hv-concepto',
  hvPrototipos: 'sec-hv-prototipos',
  hvConcursos: 'sec-hv-concursos',
  provenzaLead: 'sec-provenza-lead',
  rutaNCompras: 'sec-rutan-compras',
  rutaNObra: 'sec-rutan-obra',
  studioAdmin: 'sec-studio-admin',
  studioMarca: 'sec-studio-marca',
} as const;

/** Fields every seeded task starts from (D-022); each row overrides what it needs. */
export const TASK_DEFAULTS = {
  sectionId: null as string | null,
  description: '',
  createdById: null as string | null,
  tags: [] as string[],
  subtasks: [] as { id: string; label: string; done: boolean }[],
  completedAt: null as string | null,
  order: 0,
  parentTaskId: null as string | null,
  deliverableId: null as string | null,
  externalId: null as string | null,
  templateTaskId: null as string | null,
};

export const PROJECT_IDS = {
  laureles: 'prj-laureles',
  hoy: 'prj-hoy',
  noam: 'prj-noam',
  honeyValley: 'prj-honey-valley',
  provenza: 'prj-cafe-provenza',
  rutaN: 'prj-oficinas-ruta-n',
} as const;

export function seed({ add, users }: SeedCtx): void {
  const P = PROJECT_IDS;
  const S = SECTION_IDS;

  add('projects', P.laureles, {
    name: 'Casa Laureles',
    client: 'Familia Restrepo',
    clientUserId: users.client,
    type: 'residential',
    phase: 'development',
    serviceCode: '03',
    pipelineStatus: 'design-development',
    creativeDirection: 'set',
    approval: 'in-check',
    leadDesignerId: users.studio,
    budgetCop: 185_000_000,
    startDate: '2026-07-06',
    dueDate: '2026-12-15',
    location: 'Laureles, Medellín',
    summary: 'Remodelación integral de casa de dos plantas: sala, comedor, cocina abierta y estudio; iluminación emocional en zonas sociales.',
    tags: [],
    coverAssetId: null,
    year: null,
    sourceFolderUrl: null,
  });
  add('projects', P.hoy, {
    name: 'HOY Wellness Center',
    client: 'HOY',
    clientUserId: null,
    type: 'wellness',
    phase: 'documentation',
    serviceCode: '03',
    pipelineStatus: 'client-review',
    creativeDirection: 'set',
    approval: 'awaiting-founder',
    leadDesignerId: users.studio,
    budgetCop: 420_000_000,
    startDate: '2026-03-02',
    dueDate: '2027-02-28',
    location: 'El Poblado, Medellín',
    summary: 'Centro de bienestar: recepción, salas de terapia, zona húmeda; neurointeriorismo y escenas de luz por ritual. Tareas importadas de Asana PROYECTO HOY (creado 2026-05-29); siguen siendo las zonas y los proveedores de la plantilla, pendiente la adaptación de la fundadora. — Tasks imported from Asana PROYECTO HOY (created 2026-05-29); still the template\'s zones and vendors, pending the founder\'s adaptation.',
    tags: [],
    coverAssetId: null,
    year: null,
    sourceFolderUrl: null,
  });
  add('projects', P.noam, {
    name: 'Noam Residential',
    client: 'Noam',
    clientUserId: null,
    type: 'residential',
    phase: 'execution',
    serviceCode: 'E',
    pipelineStatus: 'in-construction',
    creativeDirection: 'set',
    approval: 'approved',
    leadDesignerId: users.studio,
    budgetCop: 310_000_000,
    startDate: '2026-01-19',
    dueDate: '2026-11-30',
    location: 'Envigado',
    summary: 'Apartamento de 210 m²: carpintería a medida, mármol en zonas húmedas, luminarias de la colección Aluzina.',
    tags: [],
    coverAssetId: null,
    year: null,
    sourceFolderUrl: null,
  });
  add('projects', P.honeyValley, {
    name: 'Honey Valley Lighting',
    client: 'Aluzina (colección propia)',
    clientUserId: null,
    type: 'lighting-product',
    phase: 'concept',
    serviceCode: null,
    pipelineStatus: 'concept',
    creativeDirection: 'revised',
    approval: 'draft',
    leadDesignerId: users.founder,
    budgetCop: 60_000_000,
    startDate: '2026-08-10',
    dueDate: null,
    location: 'Taller Aluzina, Medellín',
    summary: 'Familia de luminarias en latón y vidrio ámbar: colgante, aplique y lámpara de mesa; prototipos para concursos 2027.',
    tags: [],
    coverAssetId: null,
    year: null,
    sourceFolderUrl: null,
  });
  add('projects', P.provenza, {
    name: 'Café Provenza',
    client: 'Grupo Provenza',
    clientUserId: null,
    type: 'hospitality',
    phase: 'lead',
    serviceCode: '02',
    pipelineStatus: 'lead-qualified',
    creativeDirection: 'pending',
    approval: 'draft',
    leadDesignerId: users.founder,
    budgetCop: 95_000_000,
    startDate: '2026-09-14',
    dueDate: null,
    location: 'Provenza, El Poblado',
    summary: 'Café de especialidad de 80 m²: barra, terraza y mezzanine; primera reunión de concepto pendiente.',
    tags: [],
    coverAssetId: null,
    year: null,
    sourceFolderUrl: null,
  });
  add('projects', P.rutaN, {
    name: 'Oficinas Ruta N piso 4',
    client: 'Ruta N',
    clientUserId: null,
    type: 'commercial',
    phase: 'procurement',
    serviceCode: 'E',
    pipelineStatus: 'procurement',
    creativeDirection: 'set',
    approval: 'approved',
    leadDesignerId: users.studio,
    budgetCop: 240_000_000,
    startDate: '2026-05-04',
    dueDate: '2026-12-20',
    location: 'Ruta N, Medellín',
    summary: 'Oficinas abiertas para 60 personas: puestos, salas, cafetería; iluminación circadiana.',
    tags: [],
    coverAssetId: null,
    year: null,
    sourceFolderUrl: null,
  });

  // Sections (D-022): Asana-style groups per project; the Work views group, column and swimlane by them.
  const sections: [string, string | null, string][] = [
    [S.laurelesBrief, P.laureles, 'Levantamiento y brief'],
    [S.laurelesConcepto, P.laureles, 'Concepto'],
    [S.laurelesDesarrollo, P.laureles, 'Desarrollo de diseño'],
    [S.laurelesDocs, P.laureles, 'Documentación'],
    [S.laurelesCompras, P.laureles, 'Compras y proveedores'],
    [S.laurelesObra, P.laureles, 'Obra e instalación'],
    [S.noamDiseno, P.noam, 'Diseño'],
    [S.noamDocs, P.noam, 'Documentación'],
    [S.noamCompras, P.noam, 'Compras y proveedores'],
    [S.noamObra, P.noam, 'Obra e instalación'],
    [S.noamEntrega, P.noam, 'Entrega'],
    [S.hvConcepto, P.honeyValley, 'Concepto'],
    [S.hvPrototipos, P.honeyValley, 'Prototipos'],
    [S.hvConcursos, P.honeyValley, 'Concursos 2027'],
    [S.provenzaLead, P.provenza, 'Lead y concepto'],
    [S.rutaNCompras, P.rutaN, 'Compras y proveedores'],
    [S.rutaNObra, P.rutaN, 'Obra e instalación'],
    [S.studioAdmin, null, 'Administración del estudio'],
    [S.studioMarca, null, 'Marca y concursos'],
  ];
  const orderByProject = new Map<string | null, number>();
  for (const [id, projectId, name] of sections) {
    const order = orderByProject.get(projectId) ?? 0;
    orderByProject.set(projectId, order + 1);
    add('sections', id, { projectId, name, order });
  }

  const tasks: Parameters<typeof add<'tasks'>>[2][] = [
    { ...TASK_DEFAULTS, projectId: P.laureles, sectionId: S.laurelesDesarrollo, title: 'Verificar medidas cocina y estudio', ownerRole: 'studio', assigneeId: users.studio, status: 'doing', priority: 'high', startDate: '2026-09-17', dueDate: '2026-09-24', dependsOn: ['tsk-laureles-propuesta'], tags: ['medidas'], order: 1, description: 'Confirmar en sitio las medidas de cocina y estudio antes del chequeo de consistencia.', subtasks: [{ id: 'st-1', label: 'Cocina: alturas de mesón y muebles altos', done: true }, { id: 'st-2', label: 'Estudio: vano de ventana y puntos eléctricos', done: false }] },
    { ...TASK_DEFAULTS, projectId: P.laureles, sectionId: S.laurelesDesarrollo, title: 'Chequeo de consistencia propuesta sala', ownerRole: 'studio', assigneeId: users.studio, status: 'todo', priority: 'high', startDate: '2026-09-25', dueDate: '2026-09-28', dependsOn: ['tsk-laureles-medidas'], tags: ['revisión'], order: 2 },
    { ...TASK_DEFAULTS, projectId: P.laureles, sectionId: S.laurelesDesarrollo, title: 'Aprobación final propuesta sala', ownerRole: 'founder', assigneeId: users.founder, status: 'todo', priority: 'normal', startDate: '2026-09-29', dueDate: '2026-10-02', dependsOn: ['tsk-laureles-check'], tags: ['aprobación'], order: 3 },
    { ...TASK_DEFAULTS, projectId: P.noam, sectionId: S.noamObra, title: 'Visita de obra: revisión carpintería cocina', ownerRole: 'studio', assigneeId: users.studio, status: 'todo', priority: 'normal', startDate: null, dueDate: '2026-09-26', dependsOn: ['tsk-noam-inst-carpinteria'], tags: ['obra'], order: 2 },
    { ...TASK_DEFAULTS, projectId: P.noam, sectionId: S.noamCompras, title: 'Pago 2 a Ebanistería Robledo', ownerRole: 'ops', assigneeId: users.ops, status: 'todo', priority: 'high', startDate: '2026-09-28', dueDate: '2026-09-30', dependsOn: ['tsk-noam-fabricacion'], tags: ['pagos'], order: 3 },
    { ...TASK_DEFAULTS, projectId: P.honeyValley, sectionId: S.hvConcepto, title: 'Moodboard latón y vidrio ámbar', ownerRole: 'studio', assigneeId: users.studio, status: 'done', priority: 'normal', startDate: '2026-09-01', dueDate: '2026-09-12', dependsOn: [], tags: ['concepto', 'iluminación'], order: 0, completedAt: '2026-09-11' },
    { ...TASK_DEFAULTS, projectId: P.honeyValley, sectionId: S.hvConcursos, title: 'Presentación de la colección para concursos', ownerRole: 'brand', assigneeId: users.brand, status: 'doing', priority: 'normal', startDate: '2026-09-15', dueDate: '2026-10-15', dependsOn: ['tsk-hv-moodboard'], tags: ['concurso', 'presentación'], order: 0, subtasks: [{ id: 'st-1', label: 'Estructura de 12 láminas', done: true }, { id: 'st-2', label: 'Renders del colgante', done: false }, { id: 'st-3', label: 'Texto curatorial EN / ES', done: false }] },
    { ...TASK_DEFAULTS, projectId: P.provenza, sectionId: S.provenzaLead, title: 'Reunión de concepto con Grupo Provenza', ownerRole: 'founder', assigneeId: users.founder, status: 'todo', priority: 'high', startDate: '2026-09-22', dueDate: '2026-09-25', dependsOn: [], tags: ['cliente'], order: 0 },
    { ...TASK_DEFAULTS, projectId: null, sectionId: S.studioMarca, title: 'Organizar carpetas de concursos 2027 por fecha de entrega', ownerRole: 'brand', assigneeId: users.brand, status: 'doing', priority: 'normal', startDate: '2026-09-21', dueDate: '2026-10-01', dependsOn: [], tags: ['concurso'], order: 0 },
    { ...TASK_DEFAULTS, projectId: null, sectionId: S.studioAdmin, title: 'Informe mensual de pagos y pendientes', ownerRole: 'ops', assigneeId: users.ops, status: 'todo', priority: 'normal', startDate: '2026-09-26', dueDate: '2026-09-30', dependsOn: [], tags: ['informes', 'pagos'], order: 0 },
  ];
  const taskIds = ['tsk-laureles-medidas', 'tsk-laureles-check', 'tsk-laureles-aprobacion', 'tsk-noam-visita', 'tsk-noam-pago2', 'tsk-hv-moodboard', 'tsk-hv-presentacion', 'tsk-provenza-concepto', 'tsk-concursos-carpetas', 'tsk-informe-pagos'];
  tasks.forEach((t, i) => add('tasks', taskIds[i], t));

  add('meetings', 'mtg-provenza-concepto', { title: 'Concepto Café Provenza', projectId: P.provenza, kind: 'client', startsAt: '2026-09-25T09:00:00-05:00', endsAt: '2026-09-25T10:30:00-05:00', location: 'Provenza, El Poblado', attendeeIds: [users.founder, users.studio], notes: 'Llevar referencias de barra y terraza.' });
  add('meetings', 'mtg-noam-obra', { title: 'Visita de obra Noam', projectId: P.noam, kind: 'site-visit', startsAt: '2026-09-26T14:00:00-05:00', endsAt: '2026-09-26T16:00:00-05:00', location: 'Envigado', attendeeIds: [users.studio, users.ops], notes: 'Revisar carpintería cocina con Ebanistería Robledo.' });
  add('meetings', 'mtg-hoy-marmol', { title: 'Mármoles de Antioquia: muestras recepción', projectId: P.hoy, kind: 'supplier', startsAt: '2026-09-23T10:00:00-05:00', endsAt: '2026-09-23T11:00:00-05:00', location: 'Taller Aluzina', attendeeIds: [users.ops, users.studio], notes: '' });
  add('meetings', 'mtg-semanal', { title: 'Reunión semanal de equipo', projectId: null, kind: 'internal', startsAt: '2026-09-22T08:30:00-05:00', endsAt: '2026-09-22T09:30:00-05:00', location: 'Taller Aluzina', attendeeIds: [users.founder, users.ops, users.studio, users.brand], notes: 'Pendientes, alertas y calendario de concursos.' });
  add('meetings', 'mtg-laureles-presentacion', { title: 'Presentación propuesta sala Casa Laureles', projectId: P.laureles, kind: 'client', startsAt: '2026-10-03T16:00:00-05:00', endsAt: '2026-10-03T17:30:00-05:00', location: 'Laureles', attendeeIds: [users.founder, users.studio], notes: 'Después de la aprobación final.' });
  add('meetings', 'mtg-partnership-luminarias', { title: 'Alianza con Luminarias del Valle', projectId: P.honeyValley, kind: 'strategic', startsAt: '2026-10-08T11:00:00-05:00', endsAt: '2026-10-08T12:00:00-05:00', location: 'Videollamada', attendeeIds: [users.founder], notes: 'Producción de la colección Honey Valley.' });

  add('alerts', 'alr-hoy-marmol', { title: 'Cotizaciones mármol HOY vencen', severity: 'urgent', dueDate: '2026-09-23', leadDays: 5, forRole: 'ops', entity: 'quotes', entityId: 'qte-hoy-marmol-antioquia', status: 'open' });
  add('alerts', 'alr-noam-pago2', { title: 'Pago 2 Ebanistería Robledo', severity: 'warning', dueDate: '2026-09-30', leadDays: 10, forRole: 'ops', entity: 'payments', entityId: 'pay-noam-robledo-2', status: 'open' });
  add('alerts', 'alr-laureles-anticipo', { title: 'Anticipo Casa Laureles vencido', severity: 'urgent', dueDate: '2026-09-15', leadDays: 7, forRole: 'ops', entity: 'payments', entityId: 'pay-laureles-anticipo', status: 'acknowledged' });
  add('alerts', 'alr-laureles-aprobacion', { title: 'Propuesta sala Casa Laureles espera aprobación', severity: 'info', dueDate: '2026-10-02', leadDays: 7, forRole: 'founder', entity: 'projects', entityId: P.laureles, status: 'open' });
  add('alerts', 'alr-hoy-aprobacion', { title: 'Documentación HOY espera aprobación final', severity: 'warning', dueDate: '2026-09-27', leadDays: 7, forRole: 'founder', entity: 'projects', entityId: P.hoy, status: 'open' });
  add('alerts', 'alr-concursos-carpetas', { title: 'Carpetas de concursos 2027 sin fechas de entrega', severity: 'info', dueDate: '2026-10-01', leadDays: 14, forRole: 'brand', entity: 'competitions', entityId: 'cmp-2027-01', status: 'open' });
}
