import type { Project, Section, Task } from '../data/schema';
import type { WorkContext, WorkPerson } from './model';

/** Static rows for the component examples on /#/dev/components (not the seeds). */
const AT = '2026-09-20T12:00:00.000Z';
const base = { created_at: AT, updated_at: AT };

export const SAMPLE_PEOPLE: WorkPerson[] = [
  { id: 'u-alejandra', name: 'Alejandra Guerra', initials: 'AG' },
  { id: 'u-miguel', name: 'Miguel', initials: 'M' },
  { id: 'u-sarai', name: 'Sarai', initials: 'S' },
  { id: 'u-angelica', name: 'Angélica', initials: 'A' },
];

export const SAMPLE_PROJECTS: Project[] = [
  { ...base, id: 'prj-laureles', name: 'Casa Laureles', client: 'Familia Restrepo', clientUserId: null, type: 'residential', phase: 'development', serviceCode: '03', pipelineStatus: 'design-development', creativeDirection: 'set', approval: 'in-check', leadDesignerId: 'u-sarai', budgetCop: 185_000_000, startDate: '2026-07-06', dueDate: '2026-12-15', location: 'Laureles', summary: '' },
];

export const SAMPLE_SECTIONS: Section[] = [
  { ...base, id: 'sec-a', projectId: 'prj-laureles', name: 'Desarrollo de diseño', order: 0 },
  { ...base, id: 'sec-b', projectId: 'prj-laureles', name: 'Documentación', order: 1 },
  { ...base, id: 'sec-c', projectId: 'prj-laureles', name: 'Compras y proveedores', order: 2 },
];

const task = (id: string, sectionId: string, title: string, assigneeId: string, status: Task['status'], priority: Task['priority'], startDate: string | null, dueDate: string | null, dependsOn: string[] = [], tags: string[] = []): Task => ({
  ...base,
  id,
  projectId: 'prj-laureles',
  sectionId,
  title,
  description: '',
  ownerRole: 'studio',
  assigneeId,
  createdById: null,
  status,
  priority,
  startDate,
  dueDate,
  dependsOn,
  tags,
  subtasks: id === 't1' ? [{ id: 's1', label: 'Cocina', done: true }, { id: 's2', label: 'Estudio', done: false }] : [],
  completedAt: status === 'done' ? dueDate : null,
  order: 0,
});

export const SAMPLE_TASKS: Task[] = [
  task('t0', 'sec-a', 'Propuesta sala y comedor', 'u-sarai', 'doing', 'high', '2026-08-17', '2026-09-22', [], ['propuesta']),
  task('t1', 'sec-a', 'Verificar medidas cocina y estudio', 'u-sarai', 'doing', 'high', '2026-09-17', '2026-09-24', ['t0'], ['medidas']),
  task('t2', 'sec-a', 'Chequeo de consistencia propuesta sala', 'u-sarai', 'todo', 'high', '2026-09-25', '2026-09-28', ['t1']),
  task('t3', 'sec-a', 'Aprobación final propuesta sala', 'u-alejandra', 'todo', 'normal', '2026-09-29', '2026-10-02', ['t2'], ['aprobación']),
  task('t4', 'sec-a', 'Presentación a la familia', 'u-alejandra', 'todo', 'normal', null, '2026-10-03', ['t3'], ['cliente']),
  task('t5', 'sec-b', 'Planos de iluminación zonas sociales', 'u-sarai', 'todo', 'normal', '2026-10-05', '2026-10-23', ['t3'], ['iluminación']),
  task('t6', 'sec-c', 'Cotizar luminarias sala', 'u-miguel', 'blocked', 'urgent', '2026-09-10', '2026-09-19', ['t5'], ['proveedores']),
  task('t7', 'sec-c', 'Moodboard zonas sociales', 'u-sarai', 'done', 'normal', '2026-07-20', '2026-08-05'),
];

export const SAMPLE_CONTEXT: WorkContext = {
  sections: SAMPLE_SECTIONS,
  projects: SAMPLE_PROJECTS,
  people: SAMPLE_PEOPLE,
  commentCounts: { t1: 2, t6: 1 },
  today: '2026-09-21',
};
