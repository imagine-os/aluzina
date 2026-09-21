import { SERVICES, type Service } from '../../domain';
import { defineSpec, type ActionDef, type PageSpec } from '../../specs/PageSpec';

/** Widths verified with Playwright on this pass, light and dark, EN and ES (P-01). */
const WIDTHS = [360, 390, 768, 1280, 1920, 2560, 3840];

const PRINT: ActionDef = { id: 'manual.print', label: 'Print / PDF', intent: 'print this page of the manual', permission: 'manual.read' };
const OPEN_SERVICE: ActionDef = {
  id: 'manual.openService',
  label: 'Open service',
  intent: 'open the service {service} in the manual',
  permission: 'manual.read',
  params: { service: 'enum:01|02|03|E|04' },
};
const OPEN_SECTION: ActionDef = {
  id: 'manual.openSection',
  label: 'Open manual section',
  intent: 'open the manual section {section}',
  permission: 'manual.read',
  params: { section: 'enum:overview|commercial|governance|statuses|validation|purchases|roles|assets|kpis|rules' },
};

export const overviewSpec: PageSpec = defineSpec({
  code: 'M-01',
  name: 'Operations manual',
  purpose:
    'Every role reads how ALUZINA works: the purpose of the method, the ten-step client journey, the five-rung service ladder and the way into the commercial process, the governance rules, the status architecture and the KPIs.',
  surface: 'manual',
  navGroup: 'manual',
  layout: [
    'PageHeader: title, subtitle, Print / PDF action',
    'Motto banner: "One studio. One method. Different depths of service." + the purpose paragraph and the source line',
    'Client journey: horizontal stepper of the 10 CLIENT_JOURNEY steps, wrapping to a column on phones',
    'Service ladder: 5 rows (service name -> ladder word -> Open) plus SERVICE_LADDER_LOGIC',
    'Governance summary Card: rule count by kind, link to M-08',
    'Quick links Card: commercial process, governance rules, status architecture, KPI layer',
  ],
  dataTables: [],
  roles: ['founder', 'ops', 'studio', 'brand', 'marketing', 'client', 'dev'],
  logic: [
    'Every word on the page comes from `src/domain/playbook.ts` (CLIENT_JOURNEY, SERVICES, SERVICE_LADDER_LOGIC, GOVERNANCE_RULES, FINAL_PRINCIPLE) through `pick(text, lang)`; nothing is a hard-coded copy.',
    'The stepper is an ordered list of connected chips: it scrolls horizontally from 768 px and stacks into a column below it (no hover-only affordance, no drag).',
    'Print / PDF calls window.print(); the module print stylesheet drops interactive chrome and prints the manual content only.',
  ],
  components: ['PageHeader', 'Card', 'Button', 'Badge'],
  actions: [OPEN_SERVICE, OPEN_SECTION, PRINT],
  checkedAt: WIDTHS,
  notes: ['The manual surface is guarded by `manual.read`, which every role holds.'],
});

export const commercialSpec: PageSpec = defineSpec({
  code: 'M-02',
  name: 'General commercial process',
  purpose:
    'How a lead enters ALUZINA and reaches the right service: the seven entry channels, the lead record and commercial data recorded immediately, the first pipeline status, the ten qualification questions, the routing logic and the commercial rule that governs it.',
  surface: 'manual',
  navGroup: 'manual',
  layout: [
    'PageHeader: title, subtitle, Print / PDF action',
    'Lead entry channels: the 7 LEAD_CHANNELS as chips',
    'Immediate registration: two KeyValue blocks (LEAD_RECORD_FIELDS, COMMERCIAL_FIELDS) with the `leads` column each field maps to',
    'First status: the `lead-new` StatusPill with the playbook wording',
    'Initial qualification: the 10 QUALIFICATION_QUESTIONS as an ordered list, closed answers listed',
    'Service routing: the five services with their central question, and G-10 highlighted as the commercial rule',
    'Route a client: read-only widget, one Select per closed question, showing routeService()’s suggestion and reason, Clear answers, and a Placeholder "Create lead"',
  ],
  dataTables: [],
  roles: ['founder', 'ops', 'brand', 'marketing', 'studio', 'dev'],
  logic: [
    'The widget holds the answers in component state and calls `routeService(answers)` on every change: it never writes a row, so the manual stays read-only (the CRM is A-08).',
    'Only the closed questions (typology, floor plan, project status, depth, execution, plus the on-site visit answer) are Selects; the open questions are listed as the script to ask.',
    'G-10 is rendered from GOVERNANCE_RULES by kind `commercial`, not copied into a string.',
    '`manual.routeClient` runs the same routing from the actions bus and returns { code, then, reason } so voice and WebMCP get the suggestion without the UI.',
  ],
  components: ['PageHeader', 'Card', 'KeyValue', 'StatusPill', 'Badge', 'Select', 'Button', 'Placeholder'],
  actions: [
    {
      id: 'manual.routeClient',
      label: 'Route a client',
      intent: 'route a client who needs {depth} and wants execution {execute}',
      permission: 'manual.read',
      params: {
        typology: 'enum:residential|commercial|hospitality|wellness|other',
        floorPlan: 'enum:yes|no',
        projectStatus: 'enum:built|under-construction|conceptual',
        depth: 'enum:ideas|full-design|styling',
        execute: 'enum:yes|no|later',
        visit: 'enum:yes|no',
      },
    },
    { id: 'manual.createLead', label: 'Create lead', intent: 'create a lead from these answers', permission: 'leads.manage' },
    OPEN_SERVICE,
    OPEN_SECTION,
    PRINT,
  ],
  checkedAt: WIDTHS,
  notes: ['"Create lead" is a Placeholder until the founder / ops leads page A-08 exists (another worker, same pass).'],
});

const SERVICE_CODES_BY_PAGE: Record<string, Service['code']> = { 'M-03': '01', 'M-04': '02', 'M-05': '03', 'M-06': 'E', 'M-07': '04' };

/** M-03..M-07: one spec per service so each has its own page doc and its own nav entry. */
export function serviceSpec(code: string): PageSpec {
  const serviceCode = SERVICE_CODES_BY_PAGE[code];
  const service = SERVICES.find((s) => s.code === serviceCode);
  if (!service) throw new Error(`[manual] no service for page ${code}`);
  const unit = service.phaseLabel === 'phase' ? 'phases' : 'stages';
  return defineSpec({
    code,
    name: `Service ${service.code} – ${service.name.en}`,
    purpose: `The delivery manual for service ${service.code} (${service.name.en}): outcome, central question or promise, who it is for, its ${service.phases.length} ${unit} with every checklist item, what the client receives, what it does not include and the natural next step.`,
    surface: 'manual',
    navGroup: 'manual',
    layout: [
      'PageHeader: service name, breadcrumb Manual > Services, Print / PDF action',
      'Header card: code badge, outcome, ladder word, central question / promise, ideal for',
      `Sticky phase index (≥ 1280 px): one Button per ${unit}, jumping to its card`,
      `One Card per ${unit}: numbered title, read-only checklist of its items (sub-headings for grouped items), notes`,
      'Delivery card: what the client receives',
      'Not included card (scope protection) when the playbook states one',
      'Natural next step callout when the playbook states one',
      'Previous / next service links',
    ],
    dataTables: [],
    roles: ['founder', 'ops', 'studio', 'brand', 'client', 'dev'],
    logic: [
      'Rendered from the matching `SERVICES` entry: phases, grouped items, notes, delivery contents, exclusions and next step all come from the playbook data.',
      'The checklist is read-only here (the working checkboxes are `engagements.checks` on the studio engagement page); each item shows an empty box glyph and its text, so it prints as a paper checklist.',
      'The phase index is a nav of Buttons that scroll the phase card into view and move focus to its heading: no anchor link, because the app runs on a HashRouter.',
      '`manual.jumpToPhase` accepts a phase id (e.g. `03-11`) or its number and does the same from the actions bus.',
    ],
    components: ['PageHeader', 'Card', 'Badge', 'Button'],
    actions: [
      { id: 'manual.jumpToPhase', label: 'Jump to phase', intent: 'jump to phase {phase} of this service', permission: 'manual.read', params: { phase: 'string' } },
      OPEN_SERVICE,
      PRINT,
    ],
    checkedAt: WIDTHS,
    notes: [`Playbook ${unit}: ${service.phases.map((p) => p.number).join(', ')}.`],
  });
}

export const governanceSpec: PageSpec = defineSpec({
  code: 'M-08',
  name: 'Governance, statuses, roles and KPIs',
  purpose:
    'The rules that hold the method together: the fourteen governance rules with the page that enforces each one, the fifteen-status architecture, the validation and purchase statuses, the six roles and their portals, the eleven operational assets and the ten KPIs.',
  surface: 'manual',
  navGroup: 'manual',
  layout: [
    'PageHeader: title, subtitle, Print / PDF action',
    'Rules: one Card per G-01..G-14 with a kind Badge, the rule, the playbook page and "Enforced by" (a link when a route with that page code is registered, a Placeholder otherwise)',
    'Status architecture: the 15 PIPELINE_STATUSES as pills grouped lead / sale / design / build / close, each with the playbook wording',
    'Validation statuses (3) and purchase statuses (6) as pill rows',
    'Roles and responsibilities: 6 rows with the portal each maps to',
    'Operational assets: 11 rows with the product mapping and the matching `deliverables` template status when there is one',
    'KPI layer: 10 rows with the unit, and a Placeholder "Open KPI dashboard"',
    'Final principle callout',
  ],
  dataTables: ['deliverables'],
  roles: ['founder', 'ops', 'studio', 'brand', 'marketing', 'dev'],
  logic: [
    'Page codes are extracted from each rule’s `enforcedBy` text and matched against `useRoutes()`: a registered code becomes a link to that route, an unregistered one becomes a Placeholder, so the manual tells the truth about what the product enforces today.',
    'Operational assets are matched to `deliverables` rows by name; a match shows the deliverable’s StatusPill (e.g. template-ready), otherwise the row stays a plain entry.',
    'Every status pill uses the shared StatusPill vocabulary, so the manual and the pipeline pages always show the same tone and label.',
  ],
  components: ['PageHeader', 'Card', 'Badge', 'StatusPill', 'KeyValue', 'Button', 'Placeholder'],
  actions: [
    { id: 'manual.openEnforcingPage', label: 'Open enforcing page', intent: 'open the page that enforces the rule {rule}', permission: 'manual.read', params: { rule: 'string' } },
    { id: 'manual.openKpiDashboard', label: 'Open KPI dashboard', intent: 'open the KPI dashboard', permission: 'manual.read' },
    OPEN_SECTION,
    PRINT,
  ],
  checkedAt: WIDTHS,
  notes: ['The KPI dashboard does not exist yet: the button is a Placeholder (P-09).'],
});
