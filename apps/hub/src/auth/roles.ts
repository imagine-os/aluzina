import type { Surface } from '../specs/PageSpec';

/**
 * Roles are strings (D-015): pages call `can('<area>.<verb>')` and never compare roles.
 * These seven are the ones that exist today (`docs/knowledge/roles-and-portals.md`); `marketing` (the Slack
 * "marketing-strategist" channel, D-028) has no portal of its own yet and lands on Spaces inside the brand surface.
 */
export const ROLES = ['founder', 'ops', 'studio', 'brand', 'marketing', 'client', 'dev'] as const;
export type RoleId = (typeof ROLES)[number];
export type Role = string;

export interface RoleMeta {
  id: RoleId;
  /** Page-code prefix of the role's portal. */
  codePrefix: string;
  /** Code of the portal's dashboard (the hub card). */
  homeCode: string;
  /** Hash-router path of the portal's dashboard. */
  homePath: string;
  surface: Surface;
  /** Core string keys for the role's name and the portal's name. */
  labelKey: string;
  portalKey: string;
}

export const ROLE_META: Record<RoleId, RoleMeta> = {
  founder: { id: 'founder', codePrefix: 'A', homeCode: 'A-01', homePath: '/founder', surface: 'founder', labelKey: 'core.role.founder', portalKey: 'core.portal.founder' },
  ops: { id: 'ops', codePrefix: 'O', homeCode: 'O-01', homePath: '/ops', surface: 'ops', labelKey: 'core.role.ops', portalKey: 'core.portal.ops' },
  studio: { id: 'studio', codePrefix: 'S', homeCode: 'S-01', homePath: '/studio', surface: 'studio', labelKey: 'core.role.studio', portalKey: 'core.portal.studio' },
  brand: { id: 'brand', codePrefix: 'G', homeCode: 'G-01', homePath: '/brand', surface: 'brand', labelKey: 'core.role.brand', portalKey: 'core.portal.brand' },
  marketing: { id: 'marketing', codePrefix: 'G', homeCode: 'K-01', homePath: '/brand/spaces', surface: 'brand', labelKey: 'core.role.marketing', portalKey: 'core.portal.marketing' },
  client: { id: 'client', codePrefix: 'C', homeCode: 'C-01', homePath: '/client', surface: 'client', labelKey: 'core.role.client', portalKey: 'core.portal.client' },
  dev: { id: 'dev', codePrefix: 'D', homeCode: 'D-02', homePath: '/dev/components', surface: 'dev', labelKey: 'core.role.dev', portalKey: 'core.portal.dev' },
};

export function isRoleId(v: unknown): v is RoleId {
  return typeof v === 'string' && (ROLES as readonly string[]).includes(v);
}

/** The surface a role lands on, used by RequireRole's "switch role" shortcuts and the hub cards. */
export function roleForSurface(surface: Surface): RoleId | undefined {
  return ROLES.find((r) => ROLE_META[r].surface === surface);
}
