import { SERVICES } from '../../domain';
import { defineSpec, type ActionDef } from '../../specs/PageSpec';

/** Slug vocabulary for `public.openService` (the public URLs; visitors never see the internal codes 01 / 02 / 03 / E / 04). */
export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);
const SLUG_ENUM = `enum:${SERVICE_SLUGS.join('|')}` as const;
const SERVICE_ENUM = 'enum:01|02|03|E|04' as const;
/** The two published studio documents (P-05); the ids match src/modules/public/documents.ts. */
const DOC_ENUM = 'enum:portfolio|brochure' as const;

/** Rendered by `PublicLayout` on every public page, so every public spec declares them (P-05). */
const LAYOUT_ACTIONS: ActionDef[] = [
  { id: 'public.openWebsite', label: 'Open the studio site', intent: 'open the Aluzina website aluzinaa.com' },
  { id: 'public.openHub', label: 'Open the staff hub', intent: 'open the Aluzina Business OS hub' },
];

const OPEN_SERVICE: ActionDef = {
  id: 'public.openService',
  label: 'Open a service',
  intent: 'open the page of the service {service}',
  params: { service: SLUG_ENUM },
};

const START_PROJECT: ActionDef = {
  id: 'public.startProject',
  label: 'Start a project',
  intent: 'start the intake form, optionally for the service {service}',
  params: { service: SERVICE_ENUM },
};

/** Widths verified with Playwright against the dev server in both themes (P-01). */
const CHECKED = [360, 390, 768, 1280, 1920, 2560, 3840];

export const servicesSpec = defineSpec({
  code: 'P-01',
  name: 'Services',
  purpose:
    'The public front door of Aluzina: who the studio is (interior design and emotional lighting in Medellín, Alejandra Guerra as Founder & Creative Director), the five services as a ladder a client can enter at any step, how a project unfolds, and the way into the intake form.',
  surface: 'public',
  navGroup: 'overview',
  layout: [
    'PublicLayout header (wordmark, tagline, section nav, EN/ES + theme + dev controls, staff link to the hub)',
    'Hero: h1 studio identity, lead paragraph, founder line, primary CTA "Start your project" and secondary "Read our method"',
    'Service ladder: five Cards from SERVICES (ladder word Badge, name, outcome, "ideal for", central question or promise) linking to /services/:slug',
    'How we work: the 10-step CLIENT_JOURNEY as a numbered stepper',
    'One studio, different depths: SERVICE_LADDER_LOGIC paragraph',
    'Closing CTA Card: "Tell us about your space" -> /start',
    'PublicLayout footer (aluzinaa.com, Instagram and WhatsApp as Placeholders)',
  ],
  dataTables: [],
  roles: ['public'],
  logic: [
    'Everything on the page is rendered from `SERVICES`, `CLIENT_JOURNEY` and `SERVICE_LADDER_LOGIC` in src/domain/playbook.ts through pick(text, lang); no service copy is duplicated in the module.',
    'Service codes (01 / 02 / 03 / E / 04), pipeline statuses and checklist ids are internal: the public pages address services by slug and name only (D-035).',
    'No permission and no session requirement: the route is public and the shell is bare (the module draws its own header).',
  ],
  components: ['Card', 'Badge', 'Button', 'Placeholder', 'ToggleButton'],
  actions: [OPEN_SERVICE, START_PROJECT, ...LAYOUT_ACTIONS],
  checkedAt: CHECKED,
  notes: [
    'P-00 (aluzinaa.com, the Lovable site) stays the studio home; this page is the services + intake surface inside the OS (D-031, D-035).',
  ],
});

export const serviceDetailSpec = defineSpec({
  code: 'P-02',
  name: 'Service detail',
  purpose:
    'One page per service: what the client receives, how the service unfolds step by step (titles always visible, the checklist items expandable), what the scope does not cover, the natural next step, and the way into the intake form pre-filled with this service.',
  surface: 'public',
  layout: [
    'PublicLayout header',
    'PageHeader: breadcrumb Services / <service>, name, outcome; ladder word Badge',
    'Identity card: ideal for, central question or promise',
    'What you receive: deliveryContents list',
    'How it unfolds: one Card per phase / stage, numbered, with a Button that expands its checklist items (aria-expanded / aria-controls) and the phase notes',
    'What is not included (only when the service declares it)',
    'The natural next step (only when the service declares it)',
    'CTA "Start with this service" -> /start?service=<code>',
    'Previous / next service links',
    'PublicLayout footer',
  ],
  dataTables: [],
  roles: ['public'],
  logic: [
    'The :slug param is matched against SERVICES[].slug; an unknown slug renders an EmptyState with a link back to /services instead of a redirect, so a stale link still explains itself.',
    'Phase ids (01-1, 03-11, E-6, …) and the engagements checklist keys stay internal: the visitor sees "Step 1", the phase title and its items.',
    'Grouped phases (the strategic brief and the diagnosis) are flattened with phaseItems() so the list reads as one checklist.',
    'The CTA carries ?service=<code> so the intake form preselects the requested service.',
  ],
  components: ['PageHeader', 'Card', 'Badge', 'Button', 'EmptyState', 'Placeholder'],
  actions: [OPEN_SERVICE, START_PROJECT, ...LAYOUT_ACTIONS],
  checkedAt: CHECKED,
  notes: ['Prices are not published anywhere on this page: the playbook sets investment per project (D-033).'],
});

export const startSpec = defineSpec({
  code: 'P-03',
  name: 'Start your project',
  purpose:
    'The public intake flow: four steps (about you, your space, what you need, review) that turn a visitor into a traceable lead row, with the studio\'s suggested path shown in plain language before they send it.',
  surface: 'public',
  navGroup: 'intake',
  layout: [
    'PublicLayout header',
    'PageHeader: title, subtitle',
    'Stepper: four steps, visited ones are Buttons, current carries aria-current="step"; progress text "Step 2 of 4"',
    'Step 1 About you: name, phone, email, city (Input)',
    'Step 2 Your space: project type, approximate m², current state, floor plan (Select / Input)',
    'Step 3 What you need: the qualification questions (Select where the playbook defines options, Textarea otherwise), how they found the studio, the service they have in mind',
    'Step 4 Review: KeyValue summary, the suggested path with its reason, consent Checkbox, Submit',
    'Confirmation screen: reference number, what happens now, and the reserve-with-a-deposit Placeholder or the proposal note',
    'PublicLayout footer',
  ],
  dataTables: ['leads'],
  roles: ['public'],
  logic: [
    'Answers live in sessionStorage (aluzina.public.intake) so a reload, a language switch or a wrong Back does not lose them; the key is cleared once the lead is created.',
    'Validation runs per step on Next and on Submit: name, email, city, project type, what they want to transform, the depth they need, how they found the studio and the consent box are required; inline error text is announced (role="alert") and focus moves to the first invalid field.',
    'Step 2 and step 3 both write into the same QUALIFICATION_QUESTIONS answer map (typology / areaM2 / floorPlan / projectStatus come from step 2), so routeService() sees every answer.',
    'The review step calls routeService(answers) and shows the suggested service and its reason in client language; the text says the team confirms the path (G-10: the suggestion never decides).',
    'Submit creates a leads row through useData().create with status lead-new, source public-intake, ownerId null, projectId null, suggestedService from routeService() and requestedService from the form or the ?service= parameter.',
    'The investment answer is free text; it becomes budgetCop only when it carries exactly one amount of at least six digits, otherwise null and the sentence stays in qualification.investment (a range is never flattened into a number).',
    'The reserve-with-a-deposit button is a Placeholder: payments arrive with Stripe (D-035). For the deeper paths the page says a proposal follows the consultation instead.',
  ],
  components: ['PageHeader', 'Card', 'Input', 'Select', 'Textarea', 'Checkbox', 'Button', 'KeyValue', 'Badge', 'Placeholder'],
  actions: [
    { id: 'public.nextStep', label: 'Next step', intent: 'go to the next step of the intake form' },
    { id: 'public.prevStep', label: 'Previous step', intent: 'go back to the previous step of the intake form' },
    { id: 'public.submitIntake', label: 'Send the request', intent: 'send the intake form and open a lead' },
    { id: 'public.reserveDeposit', label: 'Reserve with a deposit', intent: 'pay the deposit that reserves the service {service}', params: { service: SERVICE_ENUM } },
    START_PROJECT,
    ...LAYOUT_ACTIONS,
  ],
  checkedAt: CHECKED,
  notes: [
    'Anonymous writes: useData().create is unguarded on the MockProvider today. The Supabase adapter needs a row-level policy that lets an anonymous visitor insert a leads row with source = public-intake and nothing else, and read none (request in docs/changelog/_pending/public.md).',
    'The "when do you want to start" answer stays free text in qualification.start; leads.desiredStart is only set when the answer is an ISO date.',
  ],
});

export const methodSpec = defineSpec({
  code: 'P-04',
  name: 'Our method',
  purpose:
    'The studio operating logic written for a visitor: one studio with one method at different depths, the ten-step journey, what comprehensive design promises, why design and construction are separate stages, the roles that work on a project and why the studio works this way.',
  surface: 'public',
  navGroup: 'overview',
  layout: [
    'PublicLayout header',
    'PageHeader: "One studio. One method. Different depths of service."',
    'The journey: the 10-step CLIENT_JOURNEY',
    'We observe, then we process, then we design (G-11)',
    'What comprehensive design means here (the promise of the comprehensive design service)',
    'Design and construction are separate stages (G-13)',
    'Who works on your project: the playbook roles, generically, with the founder named',
    'Why we work like this: FINAL_PRINCIPLE',
    'See the work: link to aluzinaa.com',
    'CTA "Start your project"',
    'PublicLayout footer',
  ],
  dataTables: [],
  roles: ['public'],
  logic: [
    'Roles come from ROLE_RESPONSIBILITIES but only the role name is published; the internal notes naming staff members stay inside the OS. Alejandra Guerra is named because she is the studio public face.',
    'The governance rules are quoted as studio promises, without their ids or the entities that enforce them.',
    'aluzinaa.com remains the portfolio: this page links to it rather than duplicating the work (D-031).',
  ],
  components: ['PageHeader', 'Card', 'Badge', 'Button', 'Placeholder'],
  actions: [START_PROJECT, ...LAYOUT_ACTIONS],
  checkedAt: CHECKED,
});

export const portfolioSpec = defineSpec({
  code: 'P-05',
  name: 'Portfolio and brochure',
  purpose:
    'The two documents a visitor asks for before they write to the studio: the Aluzina portfolio and the brochure, readable in the page and downloadable as a PDF, with the studio site one click away for the full body of work.',
  surface: 'public',
  navGroup: 'overview',
  layout: [
    'PublicLayout header',
    'PageHeader: title, subtitle',
    'Short intro paragraph',
    'One Card per assets row of kind document (portfolio, brochure): description, page count and size, the colours and typefaces read from the file, View, Download, Open in a new tab',
    'Viewer: Tabs (one per document) around an <object> PDF viewer with an <iframe> and a plain-text fallback',
    'Card "See the built work": link to aluzinaa.com',
    'PublicLayout footer',
  ],
  dataTables: ['assets'],
  roles: ['public'],
  logic: [
    'The list is useTable(assets, { where: { kind: document, status: current } }): one row per served PDF (url, pageCount, bytes, palette, fonts), seeded from docs/brand/<doc>/index.json; the static list in documents.ts is only the fallback while the table loads.',
    'The files are static assets served with the app (./brand/aluzina-portfolio.pdf, ./brand/aluzina-brochure.pdf); the paths are relative so the page works under the GitHub Pages sub-path.',
    'The document on screen is the ?doc= query parameter (portfolio by default), so /portfolio?doc=brochure is a link the studio can send.',
    'The viewer is three deep: <object>, then an <iframe> for browsers without a PDF plugin, then a paragraph with the download link - which is also what a visitor sees when the file is missing from the server.',
    '"View" moves focus to the viewer and scrolls to it, so the keyboard path matches the visual one (P-03).',
    'Download is an anchor with the download attribute wearing the Button classes: the library Button has no download attribute yet (requested), and a plain href would open the PDF instead of saving it.',
    'No session and no permission: the route is public and the shell is bare (D-035); the brand portal manages the same two files on G-08.',
  ],
  components: ['PageHeader', 'Card', 'Tabs', 'Button'],
  actions: [
    { id: 'public.viewDocument', label: 'View a document', intent: 'show the {doc} in the viewer', params: { doc: DOC_ENUM } },
    { id: 'public.downloadDocument', label: 'Download a document', intent: 'download the {doc} as a PDF', params: { doc: DOC_ENUM } },
    { id: 'public.openDocumentTab', label: 'Open a document in a new tab', intent: 'open the {doc} in a new tab', params: { doc: DOC_ENUM } },
    ...LAYOUT_ACTIONS,
  ],
  checkedAt: CHECKED,
  notes: [
    'aluzinaa.com stays the studio portfolio site (D-031): this page publishes the PDFs, it does not replace the site.',
    'Page count, size, palette and fonts come from the assets row (seeded from docs/brand/<doc>/index.json, prompt 0013); the numbers in src/modules/public/documents.ts are only the loading fallback.',
  ],
});
