/**
 * Sidebar groups, in display order. A route's `spec.navGroup` names one of these keys; the
 * DesktopShell groups the current surface's routes by it. Labels are core strings (`core.nav.<key>`).
 * Modules never edit this file: if a group is missing, ask for it in the integration pass.
 */
export const NAV_GROUPS = [
  'overview',
  'approvals',
  'projects',
  'spaces',
  'sales',
  'schedule',
  'suppliers',
  'money',
  'documents',
  'design',
  'references',
  'brand',
  'competitions',
  'communication',
  'alerts',
  'reports',
  'settings',
  'developer',
  'docs',
] as const;

export type NavGroup = (typeof NAV_GROUPS)[number];

export function navGroupOrder(key: string | undefined): number {
  const i = NAV_GROUPS.indexOf(key as NavGroup);
  return i === -1 ? NAV_GROUPS.length : i;
}
