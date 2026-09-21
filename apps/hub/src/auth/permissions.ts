import type { Role } from './roles';

/**
 * Permission strings (D-015). Derived from the founder's roster (`docs/knowledge/team.md`) and the
 * role -> portal map (`docs/knowledge/roles-and-portals.md`). Pages check these through `can()`;
 * `RouteDef.permission` guards a route; `ActionDef.permission` names what an action needs.
 * Append-only: renaming a string means updating the knowledge doc's change log.
 */
export const PERMISSIONS = [
  // Founder (A-xx): approvals, client quotes and proposals, sales, partnerships, product development
  'projects.approve',
  'projects.write',
  'quotes.review',
  'proposals.write',
  'clients.write',
  'sales.write',
  'partnerships.write',
  'products.write',
  'settings.write',
  // Administration and Operations (O-xx)
  'schedule.manage',
  'tasks.manage',
  'meetings.manage',
  'suppliers.manage',
  'quotes.request',
  'quotes.compare',
  'deliveries.manage',
  'payments.manage',
  'documents.manage',
  'alerts.manage',
  'reports.write',
  // Interior Design / studio (S-xx)
  'design.develop',
  'references.manage',
  'materials.manage',
  'plans.write',
  'schedules.write',
  'renders.brief',
  'measurements.write',
  'projects.check',
  // Graphic Design and Communication / brand (G-xx)
  'brand.manage',
  'competitions.manage',
  'presentations.write',
  'images.write',
  'revisions.manage',
  'assets.manage',
  // Client (C-xx)
  'own.projects.read',
  'own.proposals.approve',
  'own.messages.write',
  'own.payments.read',
  // Marketing strategist (Slack "marketing-strategist", D-028): portal M-xx planned, lands on Spaces in the brand surface
  'marketing.plan',
  'marketing.content',
  'marketing.channels',
  // Design system (D-01/D-05/D-08): the brand manual, the tokens and the finishes, open to every role
  'design.read',
  // Spaces (K-xx, D-026): read for every role, write for the roles that publish, admin (archive / move) founder + dev
  'spaces.read',
  'spaces.write',
  'spaces.admin',
  // Shared
  'projects.read',
  /** Edit the tasks assigned to me or created by me, read every task (Work views W-01 / W-02, D-020). `tasks.manage` covers all. */
  'tasks.own.write',
  'suppliers.read',
  'dev.tools',
  'session.viewAs',
  // Service playbook (prompt 0009, D-034): lead intake and pipeline, engagements (service checklists), revision matrix,
  // change orders, purchasing control, site control, project messages, the ops manual and the in-app docs
  'leads.manage',
  'leads.read',
  'engagements.write',
  'engagements.read',
  'revisionMatrix.write',
  'changeOrders.manage',
  'purchases.manage',
  'siteReports.write',
  'messages.write',
  'manual.read',
  'docs.read',
  /** The client comments on their own project's revision matrix (03 stage 10). */
  'own.revisions.write',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** `*` grants everything; `<area>.*` grants an area. */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  founder: ['*'],
  ops: [
    'design.read',
    'projects.read',
    'suppliers.read',
    'spaces.read',
    'spaces.write',
    'schedule.manage',
    'tasks.manage',
    'meetings.manage',
    'suppliers.manage',
    'quotes.request',
    'quotes.compare',
    'deliveries.manage',
    'payments.manage',
    'documents.manage',
    'alerts.manage',
    'reports.write',
    'leads.manage',
    'leads.read',
    'engagements.write',
    'engagements.read',
    'revisionMatrix.write',
    'changeOrders.manage',
    'purchases.manage',
    'siteReports.write',
    'messages.write',
    'manual.read',
    'docs.read',
  ],
  studio: ['design.read', 'projects.read', 'suppliers.read', 'spaces.read', 'tasks.own.write', 'design.develop', 'references.manage', 'materials.manage', 'plans.write', 'schedules.write', 'renders.brief', 'measurements.write', 'projects.check', 'engagements.write', 'engagements.read', 'revisionMatrix.write', 'siteReports.write', 'messages.write', 'manual.read', 'docs.read'],
  brand: ['design.read', 'projects.read', 'spaces.read', 'spaces.write', 'tasks.own.write', 'brand.manage', 'competitions.manage', 'presentations.write', 'images.write', 'revisions.manage', 'assets.manage', 'leads.read', 'engagements.read', 'manual.read', 'docs.read'],
  marketing: ['design.read', 'projects.read', 'spaces.read', 'spaces.write', 'tasks.own.write', 'marketing.plan', 'marketing.content', 'marketing.channels', 'leads.read', 'engagements.read', 'manual.read', 'docs.read'],
  client: ['design.read', 'spaces.read', 'own.projects.read', 'own.proposals.approve', 'own.messages.write', 'own.payments.read', 'own.revisions.write', 'messages.write', 'manual.read'],
  dev: ['design.read', 'projects.read', 'spaces.read', 'spaces.write', 'spaces.admin', 'dev.tools', 'session.viewAs', 'engagements.read', 'manual.read', 'docs.read'],
};

export function hasPermission(role: Role, permission: string): boolean {
  const grants = ROLE_PERMISSIONS[role] ?? [];
  if (grants.includes('*') || grants.includes(permission)) return true;
  const area = permission.split('.')[0];
  return grants.includes(`${area}.*`);
}

/** Every role that holds a permission, for RequireRole's "switch to a role that can" shortcuts. */
export function rolesWith(permission: string): Role[] {
  return Object.keys(ROLE_PERMISSIONS).filter((r) => hasPermission(r, permission));
}
