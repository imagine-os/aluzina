import type { NewRow } from '../provider';
import type { Priority, TaskStatus } from '../schema';
import { PROJECT_IDS, SECTION_IDS, TASK_DEFAULTS } from './projects';
import { SEED_AT, type SeedCtx } from './types';

/** Runs after projects.ts (sections and the first twelve tasks live there). */
export const order = 1;

type TaskRow = NewRow<'tasks'>;

interface TaskSpec {
  id: string;
  project: string | null;
  section: string;
  title: string;
  role: string;
  assignee: string;
  status: TaskStatus;
  priority?: Priority;
  /** null = milestone (only a due date). */
  start: string | null;
  due: string | null;
  deps?: string[];
  tags?: string[];
  description?: string;
  subtasks?: { label: string; done: boolean }[];
  order?: number;
}

function row(s: TaskSpec): TaskRow {
  return {
    ...TASK_DEFAULTS,
    projectId: s.project,
    sectionId: s.section,
    title: s.title,
    ownerRole: s.role,
    assigneeId: s.assignee,
    status: s.status,
    priority: s.priority ?? 'normal',
    startDate: s.start,
    dueDate: s.due,
    dependsOn: s.deps ?? [],
    tags: s.tags ?? [],
    description: s.description ?? '',
    subtasks: (s.subtasks ?? []).map((st, i) => ({ id: `st-${i + 1}`, ...st })),
    completedAt: s.status === 'done' ? s.due : null,
    order: s.order ?? 0,
  };
}

/**
 * The rest of the project work (D-022): enough dated, dependent tasks per section for the Timeline of
 * Casa Laureles, HOY Wellness Center and Noam Residential to read like a real plan on 2026-09-21.
 * Spanish titles are the studio's own vocabulary; dates are plausible, not confirmed facts.
 */
export function seed({ add, users }: SeedCtx): void {
  const P = PROJECT_IDS;
  const S = SECTION_IDS;
  const U = users;

  const tasks: TaskSpec[] = [
    // ---- Casa Laureles: 2026-07-06 -> 2026-12-15 ------------------------------------------------
    { id: 'tsk-laureles-levantamiento', project: P.laureles, section: S.laurelesBrief, title: 'Levantamiento de medidas de la casa', role: 'studio', assignee: U.studio, status: 'done', start: '2026-07-08', due: '2026-07-15', tags: ['medidas'], order: 0 },
    { id: 'tsk-laureles-brief', project: P.laureles, section: S.laurelesBrief, title: 'Brief con la Familia Restrepo', role: 'founder', assignee: U.founder, status: 'done', start: '2026-07-10', due: '2026-07-17', tags: ['cliente'], order: 1 },
    { id: 'tsk-laureles-moodboard', project: P.laureles, section: S.laurelesConcepto, title: 'Moodboard zonas sociales', role: 'studio', assignee: U.studio, status: 'done', start: '2026-07-20', due: '2026-08-05', deps: ['tsk-laureles-brief'], tags: ['concepto'], order: 0 },
    { id: 'tsk-laureles-direccion', project: P.laureles, section: S.laurelesConcepto, title: 'Dirección creativa sala y comedor', role: 'founder', assignee: U.founder, status: 'done', start: '2026-08-06', due: '2026-08-12', deps: ['tsk-laureles-moodboard'], tags: ['concepto'], order: 1 },
    { id: 'tsk-laureles-concepto-cliente', project: P.laureles, section: S.laurelesConcepto, title: 'Presentación de concepto al cliente', role: 'founder', assignee: U.founder, status: 'done', start: null, due: '2026-08-14', deps: ['tsk-laureles-direccion'], tags: ['cliente', 'presentación'], order: 2 },
    { id: 'tsk-laureles-propuesta', project: P.laureles, section: S.laurelesDesarrollo, title: 'Propuesta sala y comedor', role: 'studio', assignee: U.studio, status: 'doing', priority: 'high', start: '2026-08-17', due: '2026-09-22', deps: ['tsk-laureles-direccion'], tags: ['propuesta'], order: 0, description: 'Planta, alzados y paleta de materiales de sala y comedor según la dirección creativa aprobada.', subtasks: [{ label: 'Planta amoblada', done: true }, { label: 'Alzados de muro TV y comedor', done: true }, { label: 'Paleta de materiales', done: false }] },
    { id: 'tsk-laureles-presentacion', project: P.laureles, section: S.laurelesDesarrollo, title: 'Presentación propuesta sala a la familia', role: 'founder', assignee: U.founder, status: 'todo', start: null, due: '2026-10-03', deps: ['tsk-laureles-aprobacion'], tags: ['cliente', 'presentación'], order: 4 },
    { id: 'tsk-laureles-planos-luz', project: P.laureles, section: S.laurelesDocs, title: 'Planos de iluminación zonas sociales', role: 'studio', assignee: U.studio, status: 'todo', start: '2026-10-05', due: '2026-10-23', deps: ['tsk-laureles-aprobacion'], tags: ['documentación', 'iluminación'], order: 0 },
    { id: 'tsk-laureles-cuadro', project: P.laureles, section: S.laurelesDocs, title: 'Cuadro de luminarias y materiales', role: 'studio', assignee: U.studio, status: 'todo', start: '2026-10-12', due: '2026-10-30', deps: ['tsk-laureles-planos-luz'], tags: ['documentación'], order: 1 },
    { id: 'tsk-laureles-pdf', project: P.laureles, section: S.laurelesDocs, title: 'PDF de proyecto Casa Laureles', role: 'founder', assignee: U.founder, status: 'todo', start: '2026-10-26', due: '2026-11-06', deps: ['tsk-laureles-cuadro'], tags: ['documentación', 'cliente'], order: 2 },
    { id: 'tsk-laureles-cotizar', project: P.laureles, section: S.laurelesCompras, title: 'Cotizar luminarias sala con tres proveedores', role: 'ops', assignee: U.ops, status: 'todo', start: '2026-10-19', due: '2026-11-04', deps: ['tsk-laureles-cuadro'], tags: ['proveedores', 'cotizaciones', 'iluminación'], order: 0 },
    { id: 'tsk-laureles-comparativo', project: P.laureles, section: S.laurelesCompras, title: 'Comparativo de precios luminarias', role: 'ops', assignee: U.ops, status: 'todo', start: '2026-11-05', due: '2026-11-10', deps: ['tsk-laureles-cotizar'], tags: ['cotizaciones'], order: 1 },
    { id: 'tsk-laureles-carpinteria', project: P.laureles, section: S.laurelesCompras, title: 'Pedido de carpintería a medida', role: 'ops', assignee: U.ops, status: 'todo', priority: 'high', start: '2026-11-09', due: '2026-11-16', deps: ['tsk-laureles-comparativo'], tags: ['proveedores'], order: 2 },
    { id: 'tsk-laureles-instalacion', project: P.laureles, section: S.laurelesObra, title: 'Instalación eléctrica y luminarias', role: 'ops', assignee: U.ops, status: 'todo', start: '2026-11-23', due: '2026-12-08', deps: ['tsk-laureles-carpinteria'], tags: ['obra', 'iluminación'], order: 0 },
    { id: 'tsk-laureles-entrega', project: P.laureles, section: S.laurelesObra, title: 'Entrega Casa Laureles', role: 'founder', assignee: U.founder, status: 'todo', priority: 'high', start: null, due: '2026-12-15', deps: ['tsk-laureles-instalacion'], tags: ['entrega', 'cliente'], order: 1 },


    // HOY Wellness Center's tasks are the Asana import (seed/asana.ts, D-056); nothing is seeded here.

    // ---- Noam Residential: 2026-01-19 -> 2026-11-30 --------------------------------------------
    { id: 'tsk-noam-propuesta', project: P.noam, section: S.noamDiseno, title: 'Propuesta integral del apartamento', role: 'studio', assignee: U.studio, status: 'done', start: '2026-01-19', due: '2026-03-13', tags: ['propuesta'], order: 0 },
    { id: 'tsk-noam-planos', project: P.noam, section: S.noamDocs, title: 'Planos y detalles de carpintería', role: 'studio', assignee: U.studio, status: 'done', start: '2026-03-16', due: '2026-04-30', deps: ['tsk-noam-propuesta'], tags: ['documentación'], order: 0 },
    { id: 'tsk-noam-pedido-carpinteria', project: P.noam, section: S.noamCompras, title: 'Pedido carpintería a Ebanistería Robledo', role: 'ops', assignee: U.ops, status: 'done', start: '2026-05-04', due: '2026-05-15', deps: ['tsk-noam-planos'], tags: ['proveedores'], order: 0 },
    { id: 'tsk-noam-pago1', project: P.noam, section: S.noamCompras, title: 'Pago 1 a Ebanistería Robledo', role: 'ops', assignee: U.ops, status: 'done', start: null, due: '2026-05-15', deps: ['tsk-noam-pedido-carpinteria'], tags: ['pagos'], order: 1 },
    { id: 'tsk-noam-pedido-marmol', project: P.noam, section: S.noamCompras, title: 'Pedido de mármol zonas húmedas', role: 'ops', assignee: U.ops, status: 'done', start: '2026-05-18', due: '2026-06-05', deps: ['tsk-noam-planos'], tags: ['proveedores'], order: 2 },
    { id: 'tsk-noam-pago3', project: P.noam, section: S.noamCompras, title: 'Pago 3 final carpintería', role: 'ops', assignee: U.ops, status: 'todo', start: '2026-11-16', due: '2026-11-20', deps: ['tsk-noam-inst-carpinteria'], tags: ['pagos'], order: 4 },
    { id: 'tsk-noam-fabricacion', project: P.noam, section: S.noamObra, title: 'Fabricación de carpintería', role: 'ops', assignee: U.ops, status: 'done', start: '2026-05-18', due: '2026-08-28', deps: ['tsk-noam-pedido-carpinteria'], tags: ['proveedores', 'obra'], order: 0 },
    { id: 'tsk-noam-inst-carpinteria', project: P.noam, section: S.noamObra, title: 'Instalación carpintería cocina y closets', role: 'studio', assignee: U.studio, status: 'doing', priority: 'high', start: '2026-09-07', due: '2026-10-02', deps: ['tsk-noam-fabricacion'], tags: ['obra'], order: 1, description: 'Supervisión de la instalación con Ebanistería Robledo; visita semanal.' },
    { id: 'tsk-noam-inst-marmol', project: P.noam, section: S.noamObra, title: 'Instalación de mármol', role: 'ops', assignee: U.ops, status: 'todo', start: '2026-10-05', due: '2026-10-23', deps: ['tsk-noam-inst-carpinteria', 'tsk-noam-pedido-marmol'], tags: ['obra'], order: 3 },
    { id: 'tsk-noam-luminarias', project: P.noam, section: S.noamObra, title: 'Instalación luminarias colección Aluzina', role: 'founder', assignee: U.founder, status: 'todo', start: '2026-10-26', due: '2026-11-06', deps: ['tsk-noam-inst-marmol'], tags: ['obra', 'iluminación'], order: 4 },
    { id: 'tsk-noam-styling', project: P.noam, section: S.noamEntrega, title: 'Limpieza y styling final', role: 'studio', assignee: U.studio, status: 'todo', start: '2026-11-16', due: '2026-11-24', deps: ['tsk-noam-luminarias'], tags: ['entrega'], order: 0 },
    { id: 'tsk-noam-fotos', project: P.noam, section: S.noamEntrega, title: 'Fotografía del proyecto para portafolio y concursos', role: 'brand', assignee: U.brand, status: 'todo', start: '2026-11-25', due: '2026-11-27', deps: ['tsk-noam-styling'], tags: ['concurso', 'marca'], order: 1 },
    { id: 'tsk-noam-entrega', project: P.noam, section: S.noamEntrega, title: 'Entrega Noam', role: 'founder', assignee: U.founder, status: 'todo', priority: 'high', start: null, due: '2026-11-30', deps: ['tsk-noam-styling'], tags: ['entrega', 'cliente'], order: 2 },

    // ---- Honey Valley, Ruta N, studio ----------------------------------------------------------
    { id: 'tsk-hv-prototipo', project: P.honeyValley, section: S.hvPrototipos, title: 'Prototipo colgante en latón', role: 'founder', assignee: U.founder, status: 'doing', start: '2026-09-14', due: '2026-10-16', deps: ['tsk-hv-moodboard'], tags: ['producto', 'iluminación'], order: 0 },
    { id: 'tsk-hv-fotos', project: P.honeyValley, section: S.hvPrototipos, title: 'Fotografía de prototipos', role: 'brand', assignee: U.brand, status: 'todo', start: '2026-10-19', due: '2026-10-30', deps: ['tsk-hv-prototipo'], tags: ['marca', 'concurso'], order: 1 },
    { id: 'tsk-rutan-comparativo', project: P.rutaN, section: S.rutaNCompras, title: 'Comparativo de puestos de trabajo', role: 'ops', assignee: U.ops, status: 'doing', start: '2026-09-07', due: '2026-09-25', tags: ['cotizaciones', 'proveedores'], order: 0 },
    { id: 'tsk-rutan-luminarias', project: P.rutaN, section: S.rutaNCompras, title: 'Pedido luminarias circadianas', role: 'ops', assignee: U.ops, status: 'todo', start: '2026-09-28', due: '2026-10-09', deps: ['tsk-rutan-comparativo'], tags: ['proveedores', 'iluminación'], order: 1 },
    { id: 'tsk-rutan-obra', project: P.rutaN, section: S.rutaNObra, title: 'Instalación piso 4', role: 'ops', assignee: U.ops, status: 'todo', start: '2026-11-02', due: '2026-12-11', deps: ['tsk-rutan-luminarias'], tags: ['obra'], order: 0 },
    { id: 'tsk-studio-semanal', project: null, section: S.studioAdmin, title: 'Preparar agenda de la reunión semanal', role: 'ops', assignee: U.ops, status: 'doing', start: '2026-09-21', due: '2026-09-22', tags: ['reuniones'], order: 1 },
    { id: 'tsk-brand-identidad', project: null, section: S.studioMarca, title: 'Revisión de identidad en plantillas de presentación', role: 'brand', assignee: U.brand, status: 'todo', start: '2026-09-28', due: '2026-10-09', tags: ['marca'], order: 1 },
  ];
  for (const s of tasks) add('tasks', s.id, row(s));

  // Comments (D-022) on the tasks the team is discussing this week.
  const comments: [string, string, string, string][] = [
    ['cmt-laureles-medidas-1', 'tsk-laureles-medidas', U.studio, 'Cocina medida; el estudio queda para el jueves con la familia.'],
    ['cmt-noam-pago2-1', 'tsk-noam-pago2', U.ops, 'El pago sale cuando Sarai confirme la visita del 26.'],
    ['cmt-laureles-propuesta-1', 'tsk-laureles-propuesta', U.founder, 'Revisa la altura del muro TV con las medidas nuevas antes del chequeo.'],
  ];
  for (const [id, taskId, authorId, body] of comments) add('comments', id, { entity: 'tasks', entityId: taskId, authorId, body });

  // A short activity trail so the drawer and D-04 show history from the first load.
  const activity: [string, string, string, string, string | null, string | null][] = [
    ['act-seed-3', 'tsk-laureles-medidas', U.studio, 'status', 'todo', 'doing'],
    ['act-seed-4', 'tsk-hv-moodboard', U.studio, 'status', 'doing', 'done'],
  ];
  activity.forEach(([id, taskId, actorId, field, from, to], i) => {
    const at = new Date(new Date(SEED_AT).getTime() - (activity.length - i) * 3_600_000).toISOString();
    add('activity', id, { entity: 'tasks', entityId: taskId, actorId, field, from, to, at });
  });
}
