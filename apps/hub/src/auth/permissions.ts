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
  // Shared
  'projects.read',
  'dev.tools',
  'session.viewAs',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** `*` grants everything; `<area>.*` grants an area. */
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  founder: ['*'],
  ops: [
    'projects.read',
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
  ],
  studio: ['projects.read', 'design.develop', 'references.manage', 'materials.manage', 'plans.write', 'schedules.write', 'renders.brief', 'measurements.write', 'projects.check'],
  brand: ['projects.read', 'brand.manage', 'competitions.manage', 'presentations.write', 'images.write', 'revisions.manage', 'assets.manage'],
  client: ['own.projects.read', 'own.proposals.approve', 'own.messages.write', 'own.payments.read'],
  dev: ['projects.read', 'dev.tools', 'session.viewAs'],
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
