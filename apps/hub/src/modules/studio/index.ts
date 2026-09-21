import { createElement } from 'react';
import type { RouteDef } from '../../specs/PageSpec';
import { ChecksPage } from './ChecksPage';
import { MaterialsPage } from './MaterialsPage';
import { MeasurementsPage } from './MeasurementsPage';
import { PacksPage } from './PacksPage';
import { PlansPage } from './PlansPage';
import { ProjectsPage } from './ProjectsPage';
import { ReferencesPage } from './ReferencesPage';
import { RevisionMatrixPage } from './RevisionMatrixPage';
import { SchedulesPage } from './SchedulesPage';
import { ServiceChecklistPage } from './ServiceChecklistPage';
import { StudioHome } from './StudioHome';
import { checklistSpec, checksSpec, homeSpec, materialsSpec, measurementsSpec, packsSpec, plansSpec, projectsSpec, referencesSpec, revisionsSpec, schedulesSpec } from './specs';

export { strings } from './strings';

/**
 * Studio portal (S-01..S-11, D-014): Sarai's view of project development, from the creative
 * direction Alejandra sets to the consistency check that hands work back to her.
 * Nav order also decides the phone bottom nav (the first four): dashboard, projects, checks, schedules.
 */
export const routes: RouteDef[] = [
  {
    path: '/studio',
    code: homeSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'design.develop',
    shell: 'desktop',
    spec: homeSpec,
    element: createElement(StudioHome),
    nav: { labelKey: 'studio.nav.home', order: 0, glyph: '◈' },
  },
  {
    path: '/studio/projects',
    code: projectsSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'design.develop',
    shell: 'desktop',
    spec: projectsSpec,
    element: createElement(ProjectsPage),
    nav: { labelKey: 'studio.nav.projects', order: 10, glyph: '▤' },
  },
  {
    path: '/studio/checks',
    code: checksSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'projects.check',
    shell: 'desktop',
    spec: checksSpec,
    element: createElement(ChecksPage),
    nav: { labelKey: 'studio.nav.checks', order: 20, glyph: '✓' },
  },
  {
    path: '/studio/schedules',
    code: schedulesSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'schedules.write',
    shell: 'desktop',
    spec: schedulesSpec,
    element: createElement(SchedulesPage),
    nav: { labelKey: 'studio.nav.schedules', order: 30, glyph: '☷' },
  },
  {
    path: '/studio/references',
    code: referencesSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'references.manage',
    shell: 'desktop',
    spec: referencesSpec,
    element: createElement(ReferencesPage),
    nav: { labelKey: 'studio.nav.references', order: 40, glyph: '◇' },
  },
  {
    path: '/studio/materials',
    code: materialsSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'materials.manage',
    shell: 'desktop',
    spec: materialsSpec,
    element: createElement(MaterialsPage),
    nav: { labelKey: 'studio.nav.materials', order: 50, glyph: '◆' },
  },
  {
    path: '/studio/plans',
    code: plansSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'plans.write',
    shell: 'desktop',
    spec: plansSpec,
    element: createElement(PlansPage),
    nav: { labelKey: 'studio.nav.plans', order: 60, glyph: '▦' },
  },
  {
    path: '/studio/packs',
    code: packsSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'renders.brief',
    shell: 'desktop',
    spec: packsSpec,
    element: createElement(PacksPage),
    nav: { labelKey: 'studio.nav.packs', order: 70, glyph: '▷' },
  },
  {
    path: '/studio/measurements',
    code: measurementsSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'measurements.write',
    shell: 'desktop',
    spec: measurementsSpec,
    element: createElement(MeasurementsPage),
    nav: { labelKey: 'studio.nav.measurements', order: 80, glyph: '▣' },
  },
  {
    path: '/studio/checklist',
    code: checklistSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'engagements.write',
    shell: 'desktop',
    spec: checklistSpec,
    element: createElement(ServiceChecklistPage),
    nav: { labelKey: 'studio.nav.checklist', order: 45, glyph: '☑' },
  },
  {
    // Same page (S-10), deep-linked to one project; not in the menu.
    path: '/studio/checklist/:projectId',
    code: checklistSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'engagements.write',
    shell: 'desktop',
    spec: checklistSpec,
    element: createElement(ServiceChecklistPage),
  },
  {
    path: '/studio/revisions',
    code: revisionsSpec.code,
    surface: 'studio',
    status: 'built',
    permission: 'revisionMatrix.write',
    shell: 'desktop',
    spec: revisionsSpec,
    element: createElement(RevisionMatrixPage),
    nav: { labelKey: 'studio.nav.revisions', order: 46, glyph: '⊞' },
  },
];
