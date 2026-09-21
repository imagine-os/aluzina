import type { RoleId } from './roles';

/**
 * One demo identity per role (D-015). Fictional-but-matching: the founder is the real public figure
 * behind the studio; the team members carry only the first names the founder used in her roster
 * (`docs/knowledge/team.md`); the client and the developer are invented. No real contact data.
 */
export interface DemoUser {
  id: string;
  role: RoleId;
  name: string;
  initials: string;
  /** Core string key for the job title. */
  titleKey: string;
  email: string;
}

export const DEMO_USERS: readonly DemoUser[] = [
  { id: 'u-alejandra', role: 'founder', name: 'Alejandra Guerra', initials: 'AG', titleKey: 'core.role.founder', email: 'alejandra@demo.aluzina.local' },
  { id: 'u-miguel', role: 'ops', name: 'Miguel', initials: 'M', titleKey: 'core.role.ops', email: 'miguel@demo.aluzina.local' },
  { id: 'u-sarai', role: 'studio', name: 'Sarai', initials: 'S', titleKey: 'core.role.studio', email: 'sarai@demo.aluzina.local' },
  { id: 'u-angelica', role: 'brand', name: 'Angélica', initials: 'A', titleKey: 'core.role.brand', email: 'angelica@demo.aluzina.local' },
  { id: 'u-client', role: 'client', name: 'Familia Restrepo', initials: 'FR', titleKey: 'core.role.client', email: 'cliente@demo.aluzina.local' },
  { id: 'u-dev', role: 'dev', name: 'Dev', initials: 'DV', titleKey: 'core.role.dev', email: 'dev@demo.aluzina.local' },
];

export const DEFAULT_USER_ID = 'u-dev';

export function demoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

export function demoUserForRole(role: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.role === role);
}
