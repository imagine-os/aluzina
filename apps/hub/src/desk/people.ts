import type { RoleResponsibility, Text } from '../tenant/domain';
import type { RoleId } from '../tenant/auth/roles';

/**
 * People on a desk (D-104): a seated professional at a small desk on the near edge of a mat, standing for a role,
 * never a likeness. The engine renders them (`DeskPerson.tsx`); a client decides who sits where (W-04:
 * `modules/desk/deskPeople.ts`, phase -> playbook role with a basis).
 */

/** Props on the person's desk. `pop` props stand up (a plane leaning like the figure); the rest lie flat on the desk top. */
export type PropId =
  | 'laptop'
  | 'phone'
  | 'clipboard'
  | 'tape'
  | 'contract'
  | 'calculator'
  | 'plans'
  | 'ruler'
  | 'sketchbook'
  | 'pencils'
  | 'samples'
  | 'swatches'
  | 'board'
  | 'stamp'
  | 'hardhat'
  | 'tablet'
  | 'book'
  | 'keys'
  | 'mug'
  | 'rating';

export const POP_PROPS: ReadonlySet<PropId> = new Set<PropId>(['laptop', 'pencils', 'samples', 'board', 'hardhat', 'mug']);

/** Where the claim "this role owns this mat" comes from: a template phase owner, a role responsibility, or the closest role (inferred). */
export type PersonBasis = 'template' | 'responsibility' | 'closest';

export interface DeskPerson {
  /** The mat the person sits at. */
  phase: string;
  role: RoleResponsibility;
  /** Portal role that holds it today (null: none yet). Also the figure's look (`desk-person--<look>`). */
  roleId: RoleId | null;
  look: string;
  /** First name of the demo user holding the portal role, if any. */
  firstName?: string;
  basis: PersonBasis;
  inferred: boolean;
  rationale: Text;
  props: [PropId, PropId];
  /** The portal this role works in (Open portal navigates there). */
  portal?: { path: string; portalKey: string };
}
