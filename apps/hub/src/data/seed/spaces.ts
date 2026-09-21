import type { Client, Deliverable, Post, Relation, Space, Tag, Tool } from '../schema';
import { PROJECT_IDS } from './projects';
import type { SeedCtx } from './types';

/** After projects (0) and the portal seeds: posts relate to documents, presentations and brand assets. */
export const order = 50;

/**
 * Spaces (K-xx, prompt 0005, D-027): Justin's Slack sidebar transcribed as the initial space tree, plus a
 * Projects area and an Archive; 30 posts filed in several spaces each to show the point of the model;
 * catalogs of clients, deliverable types and tools (D-029). Ids are stable so docs and tests can name them.
 */
export const SPACE_IDS = {
  artTools: 'sp-art-tools',
  toolChatgpt: 'sp-tool-chatgpt',
  toolLovart: 'sp-tool-lovart',
  toolMagnific: 'sp-tool-magnific',
  projectManagement: 'sp-project-management',
  importAsana: 'sp-import-asana',
  marketing: 'sp-marketing',
  contentProduction: 'sp-content-production',
  marketingChannels: 'sp-marketing-channels',
  marketingStrategyGuide: 'sp-marketing-strategy-guide',
  socialProductionSoftware: 'sp-social-production-software',
  brandMemory: 'sp-brand-memory',
  driveScraping: 'sp-drive-scraping',
  websiteScraping: 'sp-website-scraping',
  socialScraping: 'sp-social-scraping',
  brandKit: 'sp-aluzina-brand-kit',
  brandVoice: 'sp-brand-voice-and-tone',
  brandVisual: 'sp-brand-visual-identity',
  operationsManual: 'sp-operations-manual',
  allRoles: 'sp-all-roles',
  roleOps: 'sp-role-administrative-assistant',
  roleClient: 'sp-role-customer-portal',
  roleDev: 'sp-role-developer',
  roleStudio: 'sp-role-interior-design-jr',
  roleMarketing: 'sp-role-marketing-strategist',
  roleFounder: 'sp-role-owner',
  pastClients: 'sp-past-clients',
  clientHoy: 'sp-client-hoy',
  clientSporti: 'sp-client-sporti',
  deliverables: 'sp-deliverables',
  delivContract: 'sp-deliverable-contract',
  delivFinalPresentation: 'sp-deliverable-final-presentation',
  delivFurnitureSelection: 'sp-deliverable-furniture-selection',
  delivProposal: 'sp-deliverable-proposal',
  projects: 'sp-projects',
  projectLaureles: 'sp-project-casa-laureles',
  projectHoy: 'sp-project-hoy',
  projectNoam: 'sp-project-noam',
  projectHoneyValley: 'sp-project-honey-valley',
  projectProvenza: 'sp-project-cafe-provenza',
  projectRutaN: 'sp-project-ruta-n',
  archive: 'sp-archive',
} as const;

export const CLIENT_IDS = {
  hoy: 'cl-hoy',
  sporti: 'cl-sporti',
  restrepo: 'cl-familia-restrepo',
  noam: 'cl-noam',
  provenza: 'cl-grupo-provenza',
  rutaN: 'cl-ruta-n',
} as const;

export const TOOL_IDS = {
  chatgpt: 'tool-chatgpt',
  lovart: 'tool-lovart',
  magnific: 'tool-magnific',
  asana: 'tool-asana',
  slack: 'tool-slack',
  lovable: 'tool-lovable',
  claudeDesign: 'tool-claude-design',
  supabase: 'tool-supabase',
  stripe: 'tool-stripe',
} as const;

export const DELIVERABLE_IDS = {
  brief: 'del-brief-intake',
  survey: 'del-site-survey',
  concept: 'del-concept-presentation',
  moodBoard: 'del-mood-board',
  palette: 'del-material-palette',
  lightingConcept: 'del-lighting-concept',
  lightingPlan: 'del-lighting-plan',
  furnitureSchedule: 'del-furniture-schedule',
  furnitureSelection: 'del-furniture-selection',
  drawings: 'del-technical-drawings',
  renderPack: 'del-render-pack',
  budget: 'del-budget-quote-comparison',
  rfq: 'del-rfq-packet',
  invoice: 'del-invoice',
  schedule: 'del-project-schedule',
  proposal: 'del-proposal',
  contract: 'del-contract',
  approval: 'del-client-approval-record',
  purchaseOrders: 'del-purchase-orders',
  installation: 'del-installation-plan',
  punchList: 'del-punch-list',
  finalPresentation: 'del-final-presentation',
  handover: 'del-handover-package',
  careManual: 'del-care-operations-manual',
  projectPdf: 'del-project-pdf',
  competitionKit: 'del-competition-submission-kit',
  caseStudy: 'del-case-study',
} as const;

type SpaceRow = Omit<Space, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type PostRow = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;

const ALL_TYPES: Deliverable['requiredFor'] = ['residential', 'commercial', 'hospitality', 'wellness'];
const SPACE_TYPES: Deliverable['requiredFor'] = ['residential', 'commercial', 'hospitality', 'wellness'];

export function seed({ add, users }: SeedCtx): void {
  const S = SPACE_IDS;
  const C = CLIENT_IDS;
  const T = TOOL_IDS;
  const D = DELIVERABLE_IDS;
  const P = PROJECT_IDS;

  // ---- Spaces: the Slack sidebar (sections -> areas, channels -> children), plus Projects and Archive ----
  const space = (id: string, row: Partial<SpaceRow> & Pick<SpaceRow, 'name' | 'slug' | 'kind'>) =>
    add('spaces', id, { parentId: null, description: '', glyph: '◇', order: 0, visibility: 'team', archived: false, aboutType: null, aboutId: null, ...row });

  space(S.artTools, { name: 'Art Tools', slug: 'art-tools', kind: 'area', glyph: '✎', order: 10, description: 'AI image and text tools the studio uses for concepts, renders and briefs (Slack section "Art Tools").' });
  space(S.toolChatgpt, { name: 'chatgpt', slug: 'chatgpt', kind: 'tool', parentId: S.artTools, glyph: '◌', order: 1, aboutType: 'tools', aboutId: T.chatgpt, description: 'Prompts, briefs and research done with ChatGPT.' });
  space(S.toolLovart, { name: 'lovart', slug: 'lovart', kind: 'tool', parentId: S.artTools, glyph: '◌', order: 2, aboutType: 'tools', aboutId: T.lovart, description: 'Concept imagery generated with Lovart.' });
  space(S.toolMagnific, { name: 'magnific', slug: 'magnific', kind: 'tool', parentId: S.artTools, glyph: '◌', order: 3, aboutType: 'tools', aboutId: T.magnific, description: 'Upscaling and detail passes on renders with Magnific.' });

  space(S.projectManagement, { name: 'Project Management', slug: 'project-management', kind: 'area', glyph: '◫', order: 20, description: 'How the studio plans and tracks work; Asana today, the Work views (W-01) in the Hub.' });
  space(S.importAsana, { name: 'import-asana', slug: 'import-asana', kind: 'topic', parentId: S.projectManagement, glyph: '⇥', order: 1, description: 'Everything about moving Asana projects, sections and tasks into the Hub.' });

  space(S.marketing, { name: 'Marketing', slug: 'marketing', kind: 'area', glyph: '◎', order: 30, description: 'Strategy, channels and content production for Aluzina.' });
  space(S.contentProduction, { name: 'content-production', slug: 'content-production', kind: 'topic', parentId: S.marketing, glyph: '▸', order: 1, description: 'Posts, reels, case studies and the calendar that produces them.' });
  space(S.marketingChannels, { name: 'marketing-channels', slug: 'marketing-channels', kind: 'topic', parentId: S.marketing, glyph: '▸', order: 2, description: 'Instagram, website, referrals, competitions: what each channel is for.' });
  space(S.marketingStrategyGuide, { name: 'marketing-strategy-guide', slug: 'marketing-strategy-guide', kind: 'topic', parentId: S.marketing, glyph: '▸', order: 3, description: 'The living strategy guide: positioning, audiences, voice.' });
  space(S.socialProductionSoftware, { name: 'social-production-software', slug: 'social-production-software', kind: 'topic', parentId: S.marketing, glyph: '▸', order: 4, description: 'Tools evaluated for producing and scheduling social content.' });

  space(S.brandMemory, { name: 'Brand Memory', slug: 'brand-memory', kind: 'area', glyph: '◈', order: 40, description: 'What Aluzina is and how it works: identity and the operations manual.' });
  // Added by Justin on 2026-09-21 03:24 UTC (three intake channels; taxonomy.md change log): the instructions live in Slack until Claude + GitHub are connected there.
  space(S.driveScraping, { name: 'drive-scraping', slug: 'drive-scraping', kind: 'topic', parentId: S.brandMemory, glyph: '▸', order: 1, description: 'Intake instructions for archiving the proper Google Drive content into the repo memory (Spaces posts + files).' });
  space(S.websiteScraping, { name: 'website-scraping', slug: 'website-scraping', kind: 'topic', parentId: S.brandMemory, glyph: '▸', order: 2, description: 'Intake instructions for archiving the old website (aluzinaa.com) into the repo memory.' });
  space(S.socialScraping, { name: 'social-scraping', slug: 'social-scraping', kind: 'topic', parentId: S.brandMemory, glyph: '▸', order: 3, description: 'Intake instructions for archiving the social content into the repo memory.' });
  space(S.brandKit, { name: 'aluzina-brand-kit', slug: 'aluzina-brand-kit', kind: 'topic', parentId: S.brandMemory, glyph: '▸', order: 4, description: 'Logos, type, palette, voice: the kit every deliverable follows.' });
  space(S.brandVoice, { name: 'voice-and-tone', slug: 'voice-and-tone', kind: 'topic', parentId: S.brandKit, glyph: '·', order: 1, description: 'How Aluzina speaks, in Spanish and English.' });
  space(S.brandVisual, { name: 'visual-identity', slug: 'visual-identity', kind: 'topic', parentId: S.brandKit, glyph: '·', order: 2, description: 'Logo usage, typography, colour, layout grids.' });
  space(S.operationsManual, { name: 'operations-manual', slug: 'operations-manual', kind: 'topic', parentId: S.brandMemory, glyph: '▸', order: 5, description: 'Procedures per role; rendered later as the M-xx manual.' });

  space(S.allRoles, { name: 'All Roles', slug: 'all-roles', kind: 'area', glyph: '◉', order: 50, description: 'One space per role: what applies to that point of view. A post filed here reaches everyone in the role.' });
  space(S.roleOps, { name: 'administrative-assistant', slug: 'administrative-assistant', kind: 'role', parentId: S.allRoles, glyph: '◦', order: 1, aboutType: 'roles', aboutId: 'ops', description: 'Administration and Operations (Miguel): schedule, suppliers, quotes, payments, documents.' });
  space(S.roleClient, { name: 'customer-portal', slug: 'customer-portal', kind: 'role', parentId: S.allRoles, glyph: '◦', order: 2, aboutType: 'roles', aboutId: 'client', description: 'What clients see and approve (C-xx portal, planned).' });
  space(S.roleDev, { name: 'developer', slug: 'developer', kind: 'role', parentId: S.allRoles, glyph: '◦', order: 3, aboutType: 'roles', aboutId: 'dev', description: 'Building the Hub: repo, data, imports, deploy.' });
  space(S.roleStudio, { name: 'interior-design-jr', slug: 'interior-design-jr', kind: 'role', parentId: S.allRoles, glyph: '◦', order: 4, aboutType: 'roles', aboutId: 'studio', description: 'Interior Design (Sarai): proposals, references, palettes, plans, schedules.' });
  space(S.roleMarketing, { name: 'marketing-strategist', slug: 'marketing-strategist', kind: 'role', parentId: S.allRoles, glyph: '◦', order: 5, aboutType: 'roles', aboutId: 'marketing', description: 'Marketing strategy, channels and content.' });
  space(S.roleFounder, { name: 'owner', slug: 'owner', kind: 'role', parentId: S.allRoles, glyph: '◦', order: 6, aboutType: 'roles', aboutId: 'founder', description: 'Founder (Alejandra Guerra): approvals, sales, client quotes and proposals, partnerships.' });

  space(S.pastClients, { name: 'Past Clients', slug: 'past-clients', kind: 'area', glyph: '◇', order: 60, description: 'Delivered projects and what we learned; case-study material.' });
  space(S.clientHoy, { name: 'hoy', slug: 'hoy', kind: 'client', parentId: S.pastClients, glyph: '◦', order: 1, aboutType: 'clients', aboutId: C.hoy, description: 'HOY Wellness Center, Medellín.' });
  space(S.clientSporti, { name: 'sporti', slug: 'sporti', kind: 'client', parentId: S.pastClients, glyph: '◦', order: 2, aboutType: 'clients', aboutId: C.sporti, description: 'Sporti: details still unknown.' });

  space(S.deliverables, { name: 'Deliverables', slug: 'deliverables', kind: 'area', glyph: '▣', order: 70, description: 'One space per deliverable type: templates, checklists and examples. The full catalog is in Spaces > Catalog.' });
  space(S.delivContract, { name: 'contract', slug: 'contract', kind: 'deliverable', parentId: S.deliverables, glyph: '◦', order: 1, aboutType: 'deliverables', aboutId: D.contract, description: 'Design contract: clauses, checklist, signed examples.' });
  space(S.delivFinalPresentation, { name: 'final-presentation', slug: 'final-presentation', kind: 'deliverable', parentId: S.deliverables, glyph: '◦', order: 2, aboutType: 'deliverables', aboutId: D.finalPresentation, description: 'The closing presentation of a project.' });
  space(S.delivFurnitureSelection, { name: 'furniture-selection', slug: 'furniture-selection', kind: 'deliverable', parentId: S.deliverables, glyph: '◦', order: 3, aboutType: 'deliverables', aboutId: D.furnitureSelection, description: 'Selected pieces per room with supplier, price and lead time.' });
  space(S.delivProposal, { name: 'proposal', slug: 'proposal', kind: 'deliverable', parentId: S.deliverables, glyph: '◦', order: 4, aboutType: 'deliverables', aboutId: D.proposal, description: 'Commercial proposal to the client: scope, fees, schedule.' });

  space(S.projects, { name: 'Projects', slug: 'projects', kind: 'area', glyph: '▥', order: 80, description: 'One space per project for notes, briefs and decisions; tasks live in Work.' });
  space(S.projectLaureles, { name: 'Casa Laureles', slug: 'casa-laureles', kind: 'project', parentId: S.projects, glyph: '◦', order: 1, aboutType: 'projects', aboutId: P.laureles });
  space(S.projectHoy, { name: 'HOY Wellness Center', slug: 'hoy-wellness-center', kind: 'project', parentId: S.projects, glyph: '◦', order: 2, aboutType: 'projects', aboutId: P.hoy });
  space(S.projectNoam, { name: 'Noam Residential', slug: 'noam-residential', kind: 'project', parentId: S.projects, glyph: '◦', order: 3, aboutType: 'projects', aboutId: P.noam });
  space(S.projectHoneyValley, { name: 'Honey Valley Lighting', slug: 'honey-valley-lighting', kind: 'project', parentId: S.projects, glyph: '◦', order: 4, aboutType: 'projects', aboutId: P.honeyValley });
  space(S.projectProvenza, { name: 'Café Provenza', slug: 'cafe-provenza', kind: 'project', parentId: S.projects, glyph: '◦', order: 5, aboutType: 'projects', aboutId: P.provenza });
  space(S.projectRutaN, { name: 'Oficinas Ruta N', slug: 'oficinas-ruta-n', kind: 'project', parentId: S.projects, glyph: '◦', order: 6, aboutType: 'projects', aboutId: P.rutaN });

  space(S.archive, { name: 'Archive', slug: 'archive', kind: 'archive', glyph: '▫', order: 90, description: 'Retired posts and spaces stay findable here.' });

  // ---- Clients (D-029): Hoy and Sporti from Slack "Past Clients"; the rest derived from the projects ----
  const client = (id: string, row: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'updated_by'>) => add('clients', id, row);
  client(C.hoy, { name: 'HOY Wellness Center', kind: 'past', sector: 'wellness', city: 'Medellín', contactName: null, notes: 'Slack channel "hoy" under Past Clients. The HOY Wellness Center project (prj-hoy) is the delivered work; see also imagine-os/hoy (HOY OS).', projectIds: [P.hoy] });
  client(C.sporti, { name: 'Sporti', kind: 'past', sector: null, city: null, contactName: null, notes: 'Slack channel "sporti" under Past Clients. Sector, city, contact and the project delivered are unknown; ask the founder.', projectIds: [] });
  client(C.restrepo, { name: 'Familia Restrepo', kind: 'current', sector: 'residential', city: 'Medellín', contactName: null, notes: 'Casa Laureles (sala y comedor). Demo client user u-client.', projectIds: [P.laureles] });
  client(C.noam, { name: 'Noam', kind: 'current', sector: 'residential', city: null, contactName: null, notes: 'Noam Residential.', projectIds: [P.noam] });
  client(C.provenza, { name: 'Grupo Provenza', kind: 'prospect', sector: 'hospitality', city: 'Medellín', contactName: null, notes: 'Café Provenza: lead with a brief and a sales presentation; no contract yet.', projectIds: [P.provenza] });
  client(C.rutaN, { name: 'Ruta N', kind: 'current', sector: 'commercial', city: 'Medellín', contactName: null, notes: 'Oficinas Ruta N piso 4.', projectIds: [P.rutaN] });

  // ---- Deliverable types (D-029): Justin's four plus the gaps for an interior design + lighting + experience design studio ----
  const deliverable = (id: string, row: Omit<Deliverable, 'id' | 'created_at' | 'updated_at' | 'updated_by'>) => add('deliverables', id, row);
  deliverable(D.brief, { name: 'Brief and intake form', phase: 'lead', description: 'What the client wants, budget range, spaces, dates, constraints; the form that starts every project.', templateDocKind: 'brief', ownerRole: 'founder', typicalDays: 2, requiredFor: ALL_TYPES, status: 'defined' });
  deliverable(D.survey, { name: 'Site survey and measurements', phase: 'concept', description: 'Measured plan, photos, existing installations, lighting conditions.', templateDocKind: 'S-09', ownerRole: 'studio', typicalDays: 3, requiredFor: SPACE_TYPES, status: 'template-ready' });
  deliverable(D.concept, { name: 'Concept presentation', phase: 'concept', description: 'Creative direction, references and first spatial ideas presented to the client.', templateDocKind: 'presentation', ownerRole: 'studio', typicalDays: 10, requiredFor: ALL_TYPES, status: 'defined' });
  deliverable(D.moodBoard, { name: 'Mood board', phase: 'concept', description: 'Curated references per space that fix the atmosphere before development.', templateDocKind: 'S-03', ownerRole: 'studio', typicalDays: 3, requiredFor: SPACE_TYPES, status: 'template-ready' });
  deliverable(D.palette, { name: 'Material palette', phase: 'development', description: 'Materials, finishes and samples per space with supplier and status.', templateDocKind: 'S-04', ownerRole: 'studio', typicalDays: 5, requiredFor: SPACE_TYPES, status: 'template-ready' });
  deliverable(D.lightingConcept, { name: 'Lighting concept', phase: 'concept', description: 'Layers of light, scenes and atmosphere per space; the experience-design core of an Aluzina project.', templateDocKind: null, ownerRole: 'studio', typicalDays: 5, requiredFor: ALL_TYPES, status: 'defined' });
  deliverable(D.lightingPlan, { name: 'Lighting plan', phase: 'documentation', description: 'Fixture positions, circuits, controls and the fixture schedule.', templateDocKind: null, ownerRole: 'studio', typicalDays: 8, requiredFor: ALL_TYPES, status: 'defined' });
  deliverable(D.furnitureSchedule, { name: 'Furniture and elements schedule', phase: 'development', description: 'Every piece per space with dimensions, material, quantity and reference.', templateDocKind: 'S-06', ownerRole: 'studio', typicalDays: 5, requiredFor: SPACE_TYPES, status: 'template-ready' });
  deliverable(D.furnitureSelection, { name: 'Furniture selection', phase: 'procurement', description: 'Selected pieces with supplier, price, lead time and the client\'s choice (Slack channel "furniture-selection").', templateDocKind: null, ownerRole: 'studio', typicalDays: 7, requiredFor: SPACE_TYPES, status: 'defined' });
  deliverable(D.drawings, { name: 'Technical drawings set', phase: 'documentation', description: 'Plans, sections, elevations and details for construction.', templateDocKind: 'S-05', ownerRole: 'studio', typicalDays: 15, requiredFor: SPACE_TYPES, status: 'template-ready' });
  deliverable(D.renderPack, { name: 'Render pack', phase: 'development', description: 'Views, camera list, materials and lighting brief for the renderer; the delivered images.', templateDocKind: 'S-07', ownerRole: 'studio', typicalDays: 10, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.budget, { name: 'Budget and quote comparison', phase: 'procurement', description: 'Supplier quotes side by side per comparison group with the selected option.', templateDocKind: 'O-05', ownerRole: 'ops', typicalDays: 7, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.rfq, { name: 'RFQ packet per trade', phase: 'procurement', description: 'The design specifications packaged per trade (the founder\'s sixteen: demolition, plumber, electrician, ceiling, floor, cement and drywall, plating, dry wall, installation, windows and doors, closings, wallpaper and paint, online buying, lighting installation, wood and furniture, metalwork) so each provider quotes the same scope. COTIZACION step 2 in Asana (D-062).', templateDocKind: 'O-04', ownerRole: 'ops', typicalDays: 5, requiredFor: SPACE_TYPES, status: 'defined' });
  deliverable(D.invoice, { name: 'Invoice', phase: 'lead', description: 'The invoice for a payment of the engagement: the design fee instalments and the monthly execution administration. FACTURACION in the Asana kickoff section (D-062).', templateDocKind: 'O-07', ownerRole: 'ops', typicalDays: 1, requiredFor: ALL_TYPES, status: 'defined' });
  deliverable(D.schedule, { name: 'Project schedule', phase: 'development', description: 'Phases, milestones and dependencies; the Work timeline exported for the client.', templateDocKind: 'W-01', ownerRole: 'ops', typicalDays: 2, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.proposal, { name: 'Proposal', phase: 'lead', description: 'Commercial proposal: scope, phases, fees, schedule and conditions (Slack channel "proposal").', templateDocKind: 'A-04', ownerRole: 'founder', typicalDays: 3, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.contract, { name: 'Contract', phase: 'lead', description: 'Design services contract signed by both parties (Slack channel "contract").', templateDocKind: 'contract', ownerRole: 'founder', typicalDays: 5, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.approval, { name: 'Client approval record', phase: 'development', description: 'What the client approved, when and on which version; the chain studio check -> founder -> client.', templateDocKind: 'A-02', ownerRole: 'founder', typicalDays: null, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.purchaseOrders, { name: 'Purchase orders', phase: 'procurement', description: 'Orders to suppliers with amounts, dates and payment terms.', templateDocKind: null, ownerRole: 'ops', typicalDays: 3, requiredFor: SPACE_TYPES, status: 'defined' });
  deliverable(D.installation, { name: 'Installation plan', phase: 'execution', description: 'Sequence of deliveries and installation per space, with who is on site.', templateDocKind: null, ownerRole: 'ops', typicalDays: 3, requiredFor: SPACE_TYPES, status: 'defined' });
  deliverable(D.punchList, { name: 'Punch list', phase: 'execution', description: 'Defects and pending items after installation, with owner and date.', templateDocKind: null, ownerRole: 'ops', typicalDays: 2, requiredFor: SPACE_TYPES, status: 'defined' });
  deliverable(D.finalPresentation, { name: 'Final presentation', phase: 'delivered', description: 'Closing presentation: the project as delivered, photos, lessons (Slack channel "final-presentation").', templateDocKind: 'G-03', ownerRole: 'brand', typicalDays: 5, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.handover, { name: 'Handover package', phase: 'delivered', description: 'Warranties, supplier contacts, drawings as built, care instructions in one bundle.', templateDocKind: null, ownerRole: 'ops', typicalDays: 3, requiredFor: SPACE_TYPES, status: 'defined' });
  deliverable(D.careManual, { name: 'Care and operations manual', phase: 'delivered', description: 'How to clean, maintain and operate materials, furniture and lighting scenes.', templateDocKind: null, ownerRole: 'studio', typicalDays: 3, requiredFor: SPACE_TYPES, status: 'defined' });
  deliverable(D.projectPdf, { name: 'Project PDF', phase: 'development', description: 'The branded PDF of a proposal or a phase, produced from the templates.', templateDocKind: 'A-04', ownerRole: 'founder', typicalDays: 2, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.competitionKit, { name: 'Competition submission kit', phase: 'delivered', description: 'Boards, texts, images and forms per competition entry (2027 programme).', templateDocKind: 'G-02', ownerRole: 'brand', typicalDays: 10, requiredFor: ALL_TYPES, status: 'template-ready' });
  deliverable(D.caseStudy, { name: 'Case study', phase: 'delivered', description: 'Story of a delivered project for the website and sales presentations.', templateDocKind: null, ownerRole: 'marketing', typicalDays: 4, requiredFor: ALL_TYPES, status: 'defined' });

  // ---- Tools (D-029, D-030): what is paid for today and what replaces it ----
  const tool = (id: string, row: Omit<Tool, 'id' | 'created_at' | 'updated_at' | 'updated_by'>) => add('tools', id, row);
  tool(T.chatgpt, { name: 'ChatGPT', vendor: 'OpenAI', category: 'ai-text', usedFor: 'Briefs, research, drafting texts and prompts for image tools.', status: 'in-use', replacedByModule: 'Research assistant (planned)', notes: 'Slack section "Art Tools".' });
  tool(T.lovart, { name: 'Lovart', vendor: 'Lovart', category: 'ai-image', usedFor: 'Concept imagery and mood images before renders.', status: 'in-use', replacedByModule: null, notes: 'Slack section "Art Tools". Likely an integration rather than a rebuild (D-030).' });
  tool(T.magnific, { name: 'Magnific', vendor: 'Magnific', category: 'ai-image', usedFor: 'Upscaling and detail passes on renders.', status: 'in-use', replacedByModule: 'Render pipeline (planned)', notes: 'Slack section "Art Tools".' });
  tool(T.asana, { name: 'Asana', vendor: 'Asana', category: 'pm', usedFor: 'Project management: list, timeline and board views.', status: 'to-replace', replacedByModule: 'W-01', notes: 'Slack channel "import-asana". The Work views cover list, board, timeline and calendar; the import is K-06.' });
  tool(T.slack, { name: 'Slack', vendor: 'Salesforce', category: 'chat', usedFor: 'Team chat and, until now, the sidebar as the organizing structure.', status: 'to-replace', replacedByModule: 'K-01 + Comms (planned)', notes: 'Spaces replaces the sidebar now; chat moves when the Comms module ships (D-027).' });
  tool(T.lovable, { name: 'Lovable', vendor: 'Lovable', category: 'website-builder', usedFor: 'The public website aluzinaa.com.', status: 'in-use', replacedByModule: 'P-xx public site (planned)', notes: 'Stays until Justin decides whether the site joins the OS (kanban: awaiting Justin).' });
  tool(T.claudeDesign, { name: 'Claude Design', vendor: 'Anthropic', category: 'design', usedFor: 'The Business OS prototype.', status: 'replaced', replacedByModule: 'BOS-01', notes: 'The export is served at ./business-os/ and is being modularised into the Hub (build plan step 3).' });
  tool(T.supabase, { name: 'Supabase', vendor: 'Supabase', category: 'infra', usedFor: 'Database, auth, realtime and storage behind the DataProvider.', status: 'planned', replacedByModule: null, notes: 'Assumed later (P-15); nothing wired yet.' });
  tool(T.stripe, { name: 'Stripe', vendor: 'Stripe', category: 'finance', usedFor: 'Payments and payroll.', status: 'planned', replacedByModule: null, notes: 'Assumed later (P-15); nothing wired yet.' });

  // ---- Tags registry ----
  const tags: [string, Tag['tone']][] = [['brand', 'accent'], ['marketing', 'info'], ['procesos', 'neutral'], ['plantillas', 'success'], ['asana', 'warning'], ['slack', 'warning'], ['clientes', 'info'], ['entregables', 'success'], ['herramientas', 'neutral'], ['decisión', 'danger'], ['iluminación', 'accent'], ['dev', 'neutral']];
  tags.forEach(([name, tone]) => add('tags', `tag-${name}`, { name, tone }));

  // ---- Posts filed in several spaces (the point of the model) ----
  const post = (id: string, spaces: string[], row: Partial<PostRow> & Pick<PostRow, 'title' | 'body' | 'kind' | 'authorId'>) => {
    add('posts', id, { url: null, pinned: false, status: 'published', tags: [], ...row });
    spaces.forEach((spaceId, i) => add('filings', `fil-${id.replace(/^post-/, '')}-${i + 1}`, { postId: id, spaceId }));
  };
  const relate = (id: string, row: Omit<Relation, 'id' | 'created_at' | 'updated_at' | 'updated_by' | 'note'> & { note?: string }) => add('relations', id, { note: '', ...row });

  post('post-brand-voice', [S.brandVoice, S.marketingStrategyGuide, S.roleMarketing, S.roleStudio], {
    title: 'Brand voice rules',
    kind: 'procedure',
    authorId: users.brand,
    pinned: true,
    tags: ['brand', 'procesos'],
    body: `# Cómo habla Aluzina\n\nUna sola voz en todo lo que sale del estudio: propuestas, PDFs, redes, correos.\n\n- **Cálida y precisa**: hablamos de luz, espacio y experiencia con palabras concretas, sin adjetivos vacíos.\n- **Español primero**, inglés cuando el cliente lo pide; nunca mezclamos en el mismo párrafo.\n- **Tuteamos** al cliente en redes y en la propuesta; *usted* solo en contratos.\n- Nombramos el proyecto por su nombre (Casa Laureles), no por el cliente.\n\n> Si una frase no la diría Alejandra en una reunión, no va.\n\nAplica a todos los roles: por eso está archivada en marketing y en diseño interior a la vez.`,
  });
  relate('rel-brand-voice-guideline', { fromType: 'posts', fromId: 'post-brand-voice', toType: 'brandAssets', toId: 'ast-guideline', kind: 'references', note: 'Manual de identidad' });
  relate('rel-brand-voice-marketing', { fromType: 'posts', fromId: 'post-brand-voice', toType: 'roles', toId: 'marketing', kind: 'applies-to' });
  relate('rel-brand-voice-studio', { fromType: 'posts', fromId: 'post-brand-voice', toType: 'roles', toId: 'studio', kind: 'applies-to' });

  post('post-asana-import-notes', [S.importAsana, S.roleDev], {
    title: 'Asana import notes',
    kind: 'note',
    authorId: users.dev,
    tags: ['asana', 'dev'],
    body: `## What we know about the Asana workspace\n\n- Plan and number of projects: unknown (ask Justin before exporting).\n- Views the team uses: **List**, **Timeline**, **Board** (prompt 0004).\n- Sections map to \`sections\`, tasks to \`tasks\` (title, assignee, due, tags, subtasks, dependencies), comments to \`comments\`.\n\n## Import path (K-06)\n\n1. Export each project as CSV / JSON from Asana.\n2. Map assignees to demo users, then to real users when auth exists.\n3. Dry run into a fresh \`aluzina.data\`, review in Work, then commit.\n\nThe upload control on K-06 is a placeholder until the export arrives.`,
  });
  relate('rel-asana-notes-tool', { fromType: 'posts', fromId: 'post-asana-import-notes', toType: 'tools', toId: T.asana, kind: 'applies-to' });

  post('post-proposal-template-v3', [S.delivProposal, S.roleFounder, S.roleClient], {
    title: 'Proposal template v3',
    kind: 'file',
    authorId: users.founder,
    pinned: true,
    tags: ['plantillas', 'entregables'],
    body: `# Plantilla de propuesta v3\n\nEstructura vigente para toda propuesta comercial:\n\n1. Portada con nombre del proyecto y fecha\n2. Qué entendimos (brief en tres párrafos)\n3. Alcance por fases: concepto, desarrollo, documentación, compras, obra\n4. Honorarios y forma de pago (COP, sin centavos)\n5. Cronograma estimado (exportado de Work)\n6. Condiciones y vigencia (15 días)\n\nEl archivo InDesign vive en la carpeta de plantillas de marca; el PDF sale desde A-04. Los clientes lo verán en su portal (C-xx) cuando exista.`,
  });
  relate('rel-proposal-template-deliverable', { fromType: 'posts', fromId: 'post-proposal-template-v3', toType: 'deliverables', toId: D.proposal, kind: 'produced-by' });
  relate('rel-proposal-template-pdf', { fromType: 'posts', fromId: 'post-proposal-template-v3', toType: 'brandAssets', toId: 'ast-template-pdf', kind: 'references' });

  post('post-contract-checklist', [S.delivContract, S.roleFounder, S.roleOps], {
    title: 'Contract checklist before signature',
    kind: 'procedure',
    authorId: users.ops,
    tags: ['entregables', 'procesos'],
    body: `## Antes de enviar a firma\n\n- [ ] Datos del cliente completos (NIT o cédula, dirección, correo)\n- [ ] Alcance idéntico al de la propuesta aprobada\n- [ ] Hitos de pago con fechas, no con "al finalizar"\n- [ ] Cláusula de cambios de alcance\n- [ ] Anexo: cronograma de Work\n\nEjemplo firmado: *Contrato de diseño Casa Laureles* (O-08).`,
  });
  relate('rel-contract-checklist-deliverable', { fromType: 'posts', fromId: 'post-contract-checklist', toType: 'deliverables', toId: D.contract, kind: 'produced-by' });
  relate('rel-contract-checklist-doc', { fromType: 'posts', fromId: 'post-contract-checklist', toType: 'documents', toId: 'doc-laureles-contrato', kind: 'references', note: 'Signed example' });

  post('post-final-presentation-structure', [S.delivFinalPresentation, S.brandKit, S.roleStudio], {
    title: 'Final presentation: structure and slide order',
    kind: 'procedure',
    authorId: users.brand,
    tags: ['entregables', 'brand'],
    body: `1. Portada (foto hero del espacio terminado)\n2. El brief en una frase\n3. Antes / después por espacio\n4. La luz: escenas y capas (vídeo corto si existe)\n5. Materiales y piezas clave con proveedor\n6. Lo que aprendimos\n7. Cierre: siguiente paso con el cliente\n\nPlantilla: *Plantilla presentación de ventas* adaptada; salida desde G-03.`,
  });
  relate('rel-final-presentation-deliverable', { fromType: 'posts', fromId: 'post-final-presentation-structure', toType: 'deliverables', toId: D.finalPresentation, kind: 'produced-by' });
  relate('rel-final-presentation-example', { fromType: 'posts', fromId: 'post-final-presentation-structure', toType: 'presentations', toId: 'prs-laureles-propuesta', kind: 'references' });

  post('post-furniture-selection-flow', [S.delivFurnitureSelection, S.roleStudio, S.roleOps], {
    title: 'Furniture selection: from schedule to purchase order',
    kind: 'procedure',
    authorId: users.studio,
    tags: ['entregables', 'procesos'],
    body: `**Sarai** cierra el cuadro de mobiliario (S-06) -> **Miguel** pide tres cotizaciones por grupo (O-05) -> **Alejandra** aprueba la selección -> el cliente aprueba en su portal -> **Miguel** emite la orden de compra.\n\nCada pieza lleva: referencia, proveedor, precio COP, tiempo de entrega, estado (propuesta / cotizada / aprobada / pedida).`,
  });
  relate('rel-furniture-selection-deliverable', { fromType: 'posts', fromId: 'post-furniture-selection-flow', toType: 'deliverables', toId: D.furnitureSelection, kind: 'produced-by' });
  relate('rel-furniture-selection-depends', { fromType: 'deliverables', fromId: D.furnitureSelection, toType: 'deliverables', toId: D.furnitureSchedule, kind: 'depends-on' });

  post('post-hoy-case', [S.clientHoy, S.contentProduction, S.projectHoy], {
    title: 'HOY Wellness Center: what we delivered',
    kind: 'note',
    authorId: users.founder,
    tags: ['clientes'],
    body: `Centro de bienestar en Medellín: recepción, salas de tratamiento y zonas comunes. Concepto de luz por escenas (llegada, tratamiento, descanso).\n\nMaterial para caso de estudio: fotos finales, planos técnicos (O-08) y la presentación de cierre. El sistema operativo de HOY (imagine-os/hoy) es un proyecto aparte.\n\n_Fechas de entrega y presupuesto final: por confirmar con Alejandra._`,
  });
  relate('rel-hoy-case-client', { fromType: 'posts', fromId: 'post-hoy-case', toType: 'clients', toId: C.hoy, kind: 'for-client' });
  relate('rel-hoy-case-project', { fromType: 'posts', fromId: 'post-hoy-case', toType: 'projects', toId: P.hoy, kind: 'references' });
  relate('rel-hoy-case-deliverable', { fromType: 'posts', fromId: 'post-hoy-case', toType: 'deliverables', toId: D.caseStudy, kind: 'produced-by' });
  relate('rel-hoy-project-client', { fromType: 'projects', fromId: P.hoy, toType: 'clients', toId: C.hoy, kind: 'for-client' });
  relate('rel-laureles-project-client', { fromType: 'projects', fromId: P.laureles, toType: 'clients', toId: C.restrepo, kind: 'for-client' });
  relate('rel-noam-project-client', { fromType: 'projects', fromId: P.noam, toType: 'clients', toId: C.noam, kind: 'for-client' });
  relate('rel-provenza-project-client', { fromType: 'projects', fromId: P.provenza, toType: 'clients', toId: C.provenza, kind: 'for-client' });
  relate('rel-rutan-project-client', { fromType: 'projects', fromId: P.rutaN, toType: 'clients', toId: C.rutaN, kind: 'for-client' });

  post('post-sporti-notes', [S.clientSporti, S.roleFounder], {
    title: 'Sporti: what we know',
    kind: 'note',
    authorId: users.dev,
    status: 'draft',
    tags: ['clientes'],
    body: `Cliente anterior según el canal de Slack \`sporti\`.\n\n- Sector: _desconocido_\n- Ciudad: _desconocida_\n- Proyecto entregado: _desconocido_\n- Contacto: _desconocido_\n\nPendiente: Alejandra completa la ficha en Catálogo > Clientes.`,
  });
  relate('rel-sporti-notes-client', { fromType: 'posts', fromId: 'post-sporti-notes', toType: 'clients', toId: C.sporti, kind: 'for-client' });

  post('post-chatgpt-prompts', [S.toolChatgpt, S.marketingStrategyGuide, S.roleMarketing], {
    title: 'ChatGPT prompts we reuse for briefs',
    kind: 'procedure',
    authorId: users.marketing,
    tags: ['herramientas', 'marketing'],
    body: `Prompts que funcionan (copiar y adaptar):\n\n- **Resumir un brief**: "Resume estas notas de reunión en tres párrafos: qué quiere el cliente, restricciones, presupuesto y fechas. Español, tono Aluzina."\n- **Preguntas que faltan**: "Lista las preguntas que un diseñador de iluminación haría antes de proponer para este espacio."\n- **Texto para redes**: "Escribe tres opciones de pie de foto para esta imagen de proyecto, máx. 40 palabras, sin hashtags."\n\nCuando exista el asistente del Hub estos prompts se vuelven acciones (D-030).`,
  });
  relate('rel-chatgpt-prompts-tool', { fromType: 'posts', fromId: 'post-chatgpt-prompts', toType: 'tools', toId: T.chatgpt, kind: 'applies-to' });

  post('post-lovart-workflow', [S.toolLovart, S.roleStudio], {
    title: 'Lovart: concept image workflow',
    kind: 'procedure',
    authorId: users.studio,
    tags: ['herramientas'],
    body: `1. Partir del mood board aprobado (S-03), nunca de cero.\n2. Un prompt por espacio con: uso, materiales de la paleta, hora del día, temperatura de color.\n3. Generar 4, elegir 1, iterar máximo dos veces.\n4. Guardar prompt + imagen en la carpeta del proyecto y enlazar aquí.\n\nLas imágenes de Lovart son *referencia de concepto*; el render final sale del pack de render (S-07).`,
  });
  relate('rel-lovart-workflow-tool', { fromType: 'posts', fromId: 'post-lovart-workflow', toType: 'tools', toId: T.lovart, kind: 'applies-to' });
  relate('rel-lovart-workflow-moodboard', { fromType: 'posts', fromId: 'post-lovart-workflow', toType: 'deliverables', toId: D.moodBoard, kind: 'references' });

  post('post-magnific-settings', [S.toolMagnific, S.roleStudio], {
    title: 'Magnific upscaling settings for renders',
    kind: 'note',
    authorId: users.studio,
    tags: ['herramientas'],
    body: `Ajustes que dan buen resultado en renders de interiores:\n\n- Escala 2x para presentaciones, 4x solo para impresión\n- Creatividad baja (las texturas de la paleta no deben cambiar)\n- Resemblance alto\n- Revisar siempre las luminarias: el modelo inventa reflejos\n\nGuardar el original y la versión escalada en el pack de render.`,
  });
  relate('rel-magnific-settings-tool', { fromType: 'posts', fromId: 'post-magnific-settings', toType: 'tools', toId: T.magnific, kind: 'applies-to' });
  relate('rel-magnific-settings-renderpack', { fromType: 'posts', fromId: 'post-magnific-settings', toType: 'deliverables', toId: D.renderPack, kind: 'references' });

  post('post-content-calendar', [S.contentProduction, S.marketingChannels, S.roleMarketing], {
    title: 'Content calendar: weekly rhythm',
    kind: 'procedure',
    authorId: users.marketing,
    tags: ['marketing', 'procesos'],
    body: `| Día | Pieza | Fuente |\n| --- | --- | --- |\n| Lunes | Proyecto en proceso (foto o render) | Work / pack de render |\n| Miércoles | La luz explicada (carrusel corto) | Concepto de iluminación |\n| Viernes | Caso o testimonio | Clientes anteriores |\n\nTodo pasa por la revisión de marca (G-06) antes de publicarse.`,
  });

  post('post-channels-map', [S.marketingChannels, S.marketingStrategyGuide], {
    title: 'Marketing channels and what each is for',
    kind: 'note',
    authorId: users.marketing,
    tags: ['marketing'],
    body: `- **Instagram**: mostrar proceso y luz; conversación con arquitectos y clientes residenciales.\n- **Sitio web (aluzinaa.com)**: portafolio y contacto; hoy en Lovable.\n- **Referidos**: clientes anteriores y aliados; el CRM (planeado) los seguirá.\n- **Concursos**: visibilidad y reconocimiento; calendario 2027 en G-02.\n\nMétricas por canal: _pendiente de definir_.`,
  });

  post('post-social-software-eval', [S.socialProductionSoftware, S.roleMarketing, S.roleDev], {
    title: 'Social production software: shortlist',
    kind: 'decision',
    authorId: users.marketing,
    status: 'draft',
    tags: ['herramientas', 'decisión', 'marketing'],
    body: `Opciones evaluadas para producir y programar contenido: _nombres por confirmar_.\n\nCriterios: programación multi-canal, aprobación previa (revisión de marca), plantillas con la identidad, exportación de métricas.\n\n**Decisión pendiente**: comprar una herramienta ahora o esperar al módulo de producción de contenido del Hub (D-030). Recomendación del desarrollador: esperar si la fecha del módulo es menor a tres meses.`,
  });

  post('post-ops-manual-index', [S.operationsManual, S.roleOps, S.roleFounder], {
    title: 'Operations manual: chapter index',
    kind: 'announcement',
    authorId: users.ops,
    pinned: true,
    tags: ['procesos'],
    body: `1. Cómo entra un proyecto (brief, propuesta, contrato)\n2. Cómo se planifica (Work: secciones, fechas, dependencias)\n3. Proveedores y cotizaciones (tres por grupo)\n4. Entregas y obra\n5. Pagos y documentos\n6. Alertas antes de que sea urgente\n7. Cierre y entrega\n\nCada capítulo será una publicación aquí y una página del manual M-xx.`,
  });
  relate('rel-ops-manual-role', { fromType: 'posts', fromId: 'post-ops-manual-index', toType: 'roles', toId: 'ops', kind: 'owned-by' });

  post('post-slack-to-hub', [S.roleFounder, S.roleOps, S.roleStudio, S.roleMarketing, S.roleDev, S.roleClient, S.operationsManual], {
    title: 'We organize in the Hub now (Slack stays for chat)',
    kind: 'decision',
    authorId: users.dev,
    pinned: true,
    tags: ['decisión', 'slack'],
    body: `**Decision (D-027)**: the Slack sidebar was the first map of what the Hub needs. From today the Hub's **Spaces** are the organizing mechanism: unlimited nesting, one post filed in many spaces, typed relations between anything.\n\nSlack keeps the conversation until the Comms module ships. When you would have pasted something into three channels, file one post in three spaces instead.\n\nThis post is filed in every role space, which is exactly the point.`,
  });
  relate('rel-slack-to-hub-tool', { fromType: 'posts', fromId: 'post-slack-to-hub', toType: 'tools', toId: T.slack, kind: 'replaces', note: 'The sidebar, not the chat' });
  relate('rel-slack-to-hub-space', { fromType: 'posts', fromId: 'post-slack-to-hub', toType: 'spaces', toId: S.allRoles, kind: 'references' });

  post('post-lighting-concept-checklist', [S.deliverables, S.roleStudio], {
    title: 'Lighting concept: what a client must see',
    kind: 'procedure',
    authorId: users.founder,
    tags: ['iluminación', 'entregables'],
    body: `Un concepto de iluminación Aluzina siempre muestra:\n\n- Las **capas**: ambiente, tarea, acento, decorativa\n- Las **escenas**: llegada, uso, noche; con temperatura de color por escena\n- Dónde *no* hay luz (la sombra también se diseña)\n- Una imagen de referencia por espacio\n- Qué se controla y desde dónde\n\nEl plan de iluminación (documentación) depende de este concepto aprobado.`,
  });
  relate('rel-lighting-checklist-deliverable', { fromType: 'posts', fromId: 'post-lighting-concept-checklist', toType: 'deliverables', toId: D.lightingConcept, kind: 'produced-by' });
  relate('rel-lighting-plan-depends', { fromType: 'deliverables', fromId: D.lightingPlan, toType: 'deliverables', toId: D.lightingConcept, kind: 'depends-on' });
  relate('rel-contract-depends-proposal', { fromType: 'deliverables', fromId: D.contract, toType: 'deliverables', toId: D.proposal, kind: 'depends-on' });
  relate('rel-po-depends-budget', { fromType: 'deliverables', fromId: D.purchaseOrders, toType: 'deliverables', toId: D.budget, kind: 'depends-on' });
  relate('rel-handover-depends-punch', { fromType: 'deliverables', fromId: D.handover, toType: 'deliverables', toId: D.punchList, kind: 'depends-on' });
  relate('rel-final-depends-render', { fromType: 'deliverables', fromId: D.finalPresentation, toType: 'deliverables', toId: D.renderPack, kind: 'depends-on' });

  post('post-honey-valley-brief', [S.projectHoneyValley, S.roleFounder], {
    title: 'Honey Valley: collection brief',
    kind: 'brief',
    authorId: users.founder,
    tags: ['iluminación'],
    body: `Colección propia de luminarias. Tres piezas para 2027: colgante, aplique, lámpara de mesa. Materiales: latón cepillado, vidrio soplado ámbar.\n\nObjetivo: presentar en los concursos del calendario 2027 y vender en los proyectos residenciales del estudio.`,
  });
  relate('rel-hv-brief-project', { fromType: 'posts', fromId: 'post-honey-valley-brief', toType: 'projects', toId: P.honeyValley, kind: 'belongs-to' });

  post('post-laureles-kickoff', [S.projectLaureles, S.roleStudio, S.roleOps], {
    title: 'Casa Laureles: kickoff notes',
    kind: 'note',
    authorId: users.studio,
    body: `Reunión de arranque con la familia Restrepo. Sala y comedor; luz cálida, madera clara, sin plafón central. Presupuesto acotado: priorizar iluminación y una pieza fuerte de mobiliario.\n\nSiguiente paso: levantamiento (S-09) y mood board (S-03). Las tareas están en Work > Casa Laureles.`,
  });
  relate('rel-laureles-kickoff-project', { fromType: 'posts', fromId: 'post-laureles-kickoff', toType: 'projects', toId: P.laureles, kind: 'belongs-to' });
  relate('rel-laureles-kickoff-client', { fromType: 'posts', fromId: 'post-laureles-kickoff', toType: 'clients', toId: C.restrepo, kind: 'for-client' });

  post('post-provenza-lead', [S.projectProvenza, S.roleFounder], {
    title: 'Café Provenza: lead notes and next step',
    kind: 'note',
    authorId: users.founder,
    tags: ['clientes'],
    body: `Grupo Provenza quiere renovar el café en El Poblado. Brief recibido; presentación comercial en preparación (G-03). Siguiente paso: propuesta con la plantilla v3 antes de fin de mes.`,
  });
  relate('rel-provenza-lead-client', { fromType: 'posts', fromId: 'post-provenza-lead', toType: 'clients', toId: C.provenza, kind: 'for-client' });
  relate('rel-provenza-lead-brief', { fromType: 'posts', fromId: 'post-provenza-lead', toType: 'documents', toId: 'doc-provenza-brief', kind: 'references' });
  relate('rel-provenza-lead-deck', { fromType: 'posts', fromId: 'post-provenza-lead', toType: 'presentations', toId: 'prs-provenza-ventas', kind: 'references' });

  post('post-roles-map', [S.allRoles, S.operationsManual], {
    title: 'Who owns what (roles map)',
    kind: 'procedure',
    authorId: users.founder,
    pinned: true,
    tags: ['procesos'],
    body: `- **Owner** (Alejandra): aprobaciones, ventas, cotización y propuesta al cliente, alianzas, producto.\n- **Administrative assistant** (Miguel): cronograma, proveedores, cotizaciones, entregas, pagos, documentos, alertas.\n- **Interior design jr** (Sarai): propuestas, referencias, paletas, planos, cuadros, packs de render, medidas, chequeo.\n- **Graphic design and communication** (Angélica): concursos, presentaciones, identidad, imágenes, revisiones, activos.\n- **Marketing strategist**: estrategia, canales, contenido.\n- **Developer**: el Hub.\n- **Customer portal**: lo que el cliente ve y aprueba.\n\nDetalle y permisos: \`docs/knowledge/roles-and-portals.md\`.`,
  });
  relate('rel-roles-map-founder', { fromType: 'posts', fromId: 'post-roles-map', toType: 'roles', toId: 'founder', kind: 'applies-to' });
  relate('rel-roles-map-ops', { fromType: 'posts', fromId: 'post-roles-map', toType: 'roles', toId: 'ops', kind: 'applies-to' });

  post('post-brand-kit-files', [S.brandVisual, S.contentProduction], {
    title: 'Brand kit: logos, type, palette',
    kind: 'link',
    authorId: users.brand,
    url: 'https://aluzinaa.com/',
    tags: ['brand'],
    body: `Activos vigentes en G-04 / G-07: logotipo principal y monocromo, tipografías Playfair Display + Roboto, paleta negro cálido / ámbar / crema.\n\nEl sitio público muestra la identidad aplicada. Cualquier pieza nueva usa estos archivos, nunca copias locales.`,
  });
  relate('rel-brand-kit-logo', { fromType: 'posts', fromId: 'post-brand-kit-files', toType: 'brandAssets', toId: 'ast-logo-primary', kind: 'references' });
  relate('rel-brand-kit-palette', { fromType: 'posts', fromId: 'post-brand-kit-files', toType: 'brandAssets', toId: 'ast-palette', kind: 'references' });

  post('post-asana-to-work-map', [S.importAsana, S.roleDev, S.roleOps], {
    title: 'Asana to Work: where each view went',
    kind: 'procedure',
    authorId: users.dev,
    tags: ['asana', 'dev'],
    body: `| Asana | Hub |\n| --- | --- |\n| Project | Project + its sections (W-02) |\n| Section | \`sections\` row: list group, board column, timeline swimlane |\n| Task | \`tasks\` row with assignee, dates, tags, subtasks, dependencies |\n| Comment | \`comments\` row on the task |\n| List / Board / Timeline | W-01 views (plus Calendar) |\n| Saved view | per-user saved views (D-025) |\n\nWhat has no home yet: custom fields, attachments, rules.`,
  });
  relate('rel-asana-map-tool', { fromType: 'posts', fromId: 'post-asana-to-work-map', toType: 'tools', toId: T.asana, kind: 'applies-to' });

  post('post-client-portal-scope', [S.roleClient, S.roleDev], {
    title: 'Customer portal: what clients will see (C-xx)',
    kind: 'brief',
    authorId: users.dev,
    tags: ['clientes', 'dev'],
    body: `Phone-first (PhoneShell). A client sees: their projects and phase, proposals and PDFs to review, approvals with a record, messages, payment status (read only).\n\nPosts filed in the \`customer-portal\` role space are the content clients will read once the portal exists: keep them client-safe.`,
  });
  relate('rel-client-portal-approval', { fromType: 'posts', fromId: 'post-client-portal-scope', toType: 'deliverables', toId: D.approval, kind: 'references' });

  post('post-dev-setup', [S.roleDev], {
    title: 'Developer setup: repo, build, deploy',
    kind: 'link',
    authorId: users.dev,
    url: 'https://github.com/imagine-os/aluzina',
    tags: ['dev'],
    body: `\`npm ci\`, \`npm run build\` (tokens + tsc + vite), \`npm run preview\`. Push to \`main\` deploys GitHub Pages through Actions; thumbnails regenerate at deploy.\n\nStart with \`docs/README.md\`, then \`docs/platform-principles.md\` and \`apps/hub/src/modules/README.md\`.`,
  });

  post('post-competition-kit', [S.deliverables, S.brandKit], {
    title: 'Competition submission kit checklist',
    kind: 'procedure',
    authorId: users.brand,
    tags: ['entregables', 'brand'],
    body: `Por cada concurso del calendario 2027 (G-02):\n\n- Bases leídas y fecha de entrega en Work con alerta 10 días antes\n- Láminas con la plantilla de identidad\n- Textos en el idioma de las bases (revisar voz de marca)\n- Imágenes: render final + foto de obra si existe\n- Formularios y pagos de inscripción (Miguel)\n- Copia del envío archivada en el espacio del proyecto`,
  });
  relate('rel-competition-kit-deliverable', { fromType: 'posts', fromId: 'post-competition-kit', toType: 'deliverables', toId: D.competitionKit, kind: 'produced-by' });

  post('post-supabase-stripe-plan', [S.roleDev, S.roleFounder], {
    title: 'Supabase and Stripe: when and why',
    kind: 'decision',
    authorId: users.dev,
    status: 'draft',
    tags: ['decisión', 'dev'],
    body: `Assumed infrastructure (P-15), nothing wired yet:\n\n- **Supabase** (DB, auth, realtime, storage) replaces the mock provider behind the same \`DataProvider\` interface once real users need real accounts.\n- **Stripe** for client payments and payroll when the Finance module exists.\n\nTrigger to start: the client portal (C-xx) needs real identities. Until then, demo users and localStorage.`,
  });
  relate('rel-supabase-plan-tool', { fromType: 'posts', fromId: 'post-supabase-stripe-plan', toType: 'tools', toId: T.supabase, kind: 'references' });
  relate('rel-stripe-plan-tool', { fromType: 'posts', fromId: 'post-supabase-stripe-plan', toType: 'tools', toId: T.stripe, kind: 'references' });

  // Archive intake (Justin, 2026-09-21 03:24 UTC): one draft procedure per intake channel; the real instructions wait in Slack.
  const intake = (id: string, spaceId: string, title: string, what: string) => {
    post(id, [spaceId, S.roleDev, S.operationsManual], {
      title,
      kind: 'procedure',
      authorId: users.dev,
      status: 'draft',
      tags: ['procesos', 'dev'],
      body: `**Pending instructions.** The intake instructions for ${what} live in the Slack channel of the same name and will be archived here once Justin connects Claude + GitHub there.\n\nWhat this procedure will define:\n\n- What to archive and what to skip\n- Where it lands: posts in Spaces (kind note / link / file) and files in the repo memory\n- Which spaces each item is filed in and which relations are added\n- Access needed (Drive, social accounts) and who grants it\n\nUntil then this post is a draft and the roadmap phase "Archive intake" (build plan) depends on it.`,
    });
    relate(`rel-${id.replace(/^post-/, '')}-slack`, { fromType: 'posts', fromId: id, toType: 'tools', toId: T.slack, kind: 'depends-on', note: 'Instructions live in the Slack channel' });
  };
  intake('post-website-intake', S.websiteScraping, 'Website archive intake (pending instructions)', 'archiving the old website (aluzinaa.com)');
  intake('post-social-intake', S.socialScraping, 'Social content intake (pending instructions)', 'archiving the social content');
  intake('post-drive-intake', S.driveScraping, 'Google Drive intake (pending instructions)', 'archiving the proper Google Drive content');

  // Comments on two posts (reuses the Work `comments` entity, D-022)
  add('comments', 'cmt-brand-voice-1', { entity: 'posts', entityId: 'post-brand-voice', authorId: users.studio, body: '¿Aplica también a los textos dentro de los planos? Pregunto por las notas técnicas.' });
  add('comments', 'cmt-brand-voice-2', { entity: 'posts', entityId: 'post-brand-voice', authorId: users.brand, body: 'Sí: notas cortas, en español, sin abreviaturas raras. Lo agrego al manual.' });
  add('comments', 'cmt-slack-to-hub-1', { entity: 'posts', entityId: 'post-slack-to-hub', authorId: users.ops, body: '¿Dónde van las conversaciones rápidas mientras no exista Comms? Sigo en Slack, entiendo.' });
}
