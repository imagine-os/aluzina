import type { RoleId } from '../../auth/roles';
import type { ServiceCode, Text } from '../playbook';

/**
 * Project templates as typed bilingual data (D-055), not database rows: "create project from template"
 * (W-03) walks a `ProjectTemplate` and writes `projects` + `sections` + `tasks` through the DataProvider.
 *
 * The one template today, `tpl-aluzina-workflow`, is the merge of the founder's two living Asana template
 * projects (`docs/knowledge/asana-conventions.md`): the Spanish ALUZINA WORKFLOW FOR EVERY PROJECT tree is
 * the spine, WORK CHRONOGRAM ALUZINA ENGLISH supplies the `en` labels where a task matches, and PROYECTO
 * HOY's kickoff section is phase 0.
 */
export interface ProjectTemplate {
  id: string;
  name: Text;
  /** Where the tree comes from, shown on the review step and in the page doc. */
  source: Text;
  /** The playbook service this template delivers (`domain/playbook.ts`); null when service-agnostic. */
  serviceCode: ServiceCode | null;
  phases: TemplatePhase[];
}

/** One phase = one `sections` row in the created project (an Asana section). */
export interface TemplatePhase {
  id: string;
  name: Text;
  /** Who owns the phase; every task without its own `ownerRole` inherits it. */
  ownerRole: RoleId;
  tasks: TemplateTask[];
}

export interface TemplateTask {
  id: string;
  title: Text;
  /** Overrides the phase owner for this task and its children. */
  ownerRole?: RoleId;
  /** `deliverables` catalog id this task produces, or null. */
  deliverableId: string | null;
  /** Generated once per selected zone instead of once; the zone name is appended to the title. */
  zoneScoped?: boolean;
  children: TemplateTask[];
}

/** A space of the project. The founder's eleven are the default list; W-03 lets people add their own. */
export interface Zone {
  id: string;
  name: Text;
}

/** One of the sixteen trades the founder asks for quotes from (COTIZACION step 2). */
export interface Trade {
  id: string;
  name: Text;
}
