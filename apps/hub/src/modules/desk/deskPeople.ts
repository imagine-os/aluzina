import { ROLE_RESPONSIBILITIES, type Text } from '../../tenant/domain';
import { TEMPLATES } from '../../tenant/domain/templates';
import { demoUserForRole } from '../../tenant/auth/demoUsers';
import { ROLE_META, type RoleId } from '../../tenant/auth/roles';
import type { DeskPerson, PropId } from '../../desk/people';
import type { JourneyId } from './model';

export type { DeskPerson } from '../../desk/people';

/**
 * W-04 people (prompt 0027, D-104): one seated figure per journey mat, standing for the playbook role that owns the
 * phase. Not real staff and not a likeness: a stylised vector figure per role, labelled with the role and, when a
 * demo user holds that portal role, their first name (`tenant/auth/demoUsers.ts`).
 *
 * The playbook does not assign stages to roles ("who does it" is its recommended next build, `service-playbook.md`),
 * so the mapping below is data with a basis per row:
 * - `template`: the project template's phase `ownerRole` names the role (checked against `TEMPLATES` at load; a
 *   mismatch demotes the row to inferred, so the desk never claims a source that changed);
 * - `responsibility`: the role's own responsibility line (`ROLE_RESPONSIBILITIES`, p. 17) names the work;
 * - `closest`: nobody is named, the closest role is used and the row is `inferred: true` (same convention as the
 *   knowledge base), to be confirmed by the founder.
 */

type Basis = { kind: 'template'; templatePhase: string } | { kind: 'responsibility' } | { kind: 'closest' };

interface PersonRow {
  phase: JourneyId;
  /** `ROLE_RESPONSIBILITIES` id. */
  responsibility: string;
  basis: Basis;
  rationale: Text;
  /** Left prop and right prop on the desk. */
  props: [PropId, PropId];
}

const T = (en: string, es: string): Text => ({ en, es });

/** Phase -> owning role. One line of rationale each; `closest` rows are inferred. */
const PEOPLE: readonly PersonRow[] = [
  { phase: 'lead', responsibility: 'creative-director', basis: { kind: 'closest' }, props: ['laptop', 'phone'], rationale: T('Closest role: the Creative Director holds client relations, and every lead gets an assigned ALUZINA owner (G-01).', 'Rol más cercano: la directora creativa lleva la relación con clientes y cada lead recibe un responsable de ALUZINA (G-01).') },
  { phase: 'diagnosis', responsibility: 'interior-designer', basis: { kind: 'closest' }, props: ['clipboard', 'tape'], rationale: T('Closest role: the Interior Designer turns the visit and survey into references and plans.', 'Rol más cercano: la diseñadora de interiores convierte la visita y el levantamiento en referencias y planos.') },
  { phase: 'brief', responsibility: 'administrative-assistant', basis: { kind: 'template', templatePhase: 'phase-cierre' }, props: ['contract', 'calculator'], rationale: T('Project template: “Client close · first design payment” is owned by operations; activation is the assistant’s.', 'Plantilla de proyecto: “Cierre de cliente · primer pago de diseño” es de operaciones; la activación es del asistente.') },
  { phase: 'analysis', responsibility: 'interior-designer', basis: { kind: 'closest' }, props: ['plans', 'ruler'], rationale: T('Closest role: the Interior Designer works the references, palettes and plans the analysis produces.', 'Rol más cercano: la diseñadora de interiores trabaja las referencias, paletas y planos que produce el análisis.') },
  { phase: 'concept', responsibility: 'creative-director', basis: { kind: 'template', templatePhase: 'phase-diseno' }, props: ['sketchbook', 'pencils'], rationale: T('Project template: DESIGN is owned by the founder, who holds creative direction.', 'Plantilla de proyecto: DISEÑO es de la fundadora, que lleva la dirección creativa.') },
  { phase: 'development', responsibility: 'interior-designer', basis: { kind: 'responsibility' }, props: ['samples', 'swatches'], rationale: T('Role responsibilities: “design development” is the Interior Designer’s (the template’s Planning and Quotation on this mat are operations’).', 'Responsabilidades: el “desarrollo de diseño” es de la diseñadora de interiores (Planeación y Cotización de la plantilla, en este tapete, son de operaciones).') },
  { phase: 'validation', responsibility: 'brand-designer', basis: { kind: 'closest' }, props: ['board', 'stamp'], rationale: T('Closest role: the Brand Designer prepares the presentations and revisions the client validates; final approval stays with the Creative Director.', 'Rol más cercano: la diseñadora de marca prepara las presentaciones y revisiones que el cliente valida; la aprobación final sigue siendo de la directora creativa.') },
  { phase: 'delivery', responsibility: 'administrative-assistant', basis: { kind: 'template', templatePhase: 'phase-produccion' }, props: ['hardhat', 'tablet'], rationale: T('Project template: PRODUCTION is owned by operations; suppliers, purchases and site control records are the assistant’s.', 'Plantilla de proyecto: PRODUCCIÓN es de operaciones; proveedores, compras y registros de obra son del asistente.') },
  { phase: 'closure', responsibility: 'brand-designer', basis: { kind: 'closest' }, props: ['book', 'keys'], rationale: T('Closest role: the Brand Designer makes the delivery documents with the brand identity.', 'Rol más cercano: la diseñadora de marca hace los documentos de entrega con la identidad de marca.') },
  { phase: 'follow-up', responsibility: 'creative-director', basis: { kind: 'closest' }, props: ['mug', 'rating'], rationale: T('Closest role: client relations after delivery stay with the Creative Director.', 'Rol más cercano: la relación con el cliente tras la entrega sigue con la directora creativa.') },
];


const templateOwner = (phaseId: string): RoleId | undefined => TEMPLATES.flatMap((t) => t.phases).find((p) => p.id === phaseId)?.ownerRole;

/** The people on the desk, one per mapped phase, joined with the role data. Rows whose role is missing are dropped. */
export function buildPeople(): DeskPerson[] {
  return PEOPLE.flatMap((row) => {
    const role = ROLE_RESPONSIBILITIES.find((r) => r.id === row.responsibility);
    if (!role) return [];
    const roleId = role.roleId;
    const sourced = row.basis.kind === 'responsibility' || (row.basis.kind === 'template' && templateOwner(row.basis.templatePhase) === roleId);
    const user = roleId ? demoUserForRole(roleId) : undefined;
    const meta = roleId ? ROLE_META[roleId] : undefined;
    return [
      {
        phase: row.phase,
        role,
        roleId,
        look: roleId ?? role.id,
        firstName: user?.name.split(' ')[0],
        basis: sourced ? row.basis.kind : 'closest',
        inferred: !sourced,
        rationale: row.rationale,
        props: row.props,
        portal: meta ? { path: meta.homePath, portalKey: meta.portalKey } : undefined,
      },
    ];
  });
}
