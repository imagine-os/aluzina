import { defineSpec, type ActionDef, type PageSpec, type Surface } from '../../specs/PageSpec';

/** Widths verified by the screenshot pass of changelog 0033 (P-01). */
export const DESK_CODE = 'W-04';

const WIDTHS = [360, 390, 768, 1280, 1920, 2560, 3840];

/** Every control of the Method desk (P-05); the voice / WebMCP vocabulary. Registered while mounted. `permission` is the route guard of the surface. */
export const deskActions = (permission: string): ActionDef[] => [
  { id: 'desk.zoom', label: 'Zoom the desk', intent: 'zoom the desk to {zoom} percent', permission, params: { zoom: 'number' } },
  { id: 'desk.fit', label: 'Fit the desk', intent: 'show the whole desk', permission },
  { id: 'desk.reset', label: 'Reset the view', intent: 'reset the desk view', permission },
  { id: 'desk.toggleTilt', label: 'Tilt or flatten the desk', intent: 'tilt the desk or look straight down', permission },
  { id: 'desk.focusPhase', label: 'Go to a phase', intent: 'show the {phase} mat', permission, params: { phase: 'enum:lead|diagnosis|brief|analysis|concept|development|validation|delivery|closure|follow-up' } },
  { id: 'desk.focusItem', label: 'Look at an object', intent: 'show me the {item}', permission, params: { item: 'id' } },
  { id: 'desk.openItem', label: 'Open the object’s page', intent: 'open the page of the {item}', permission, params: { item: 'id' } },
  { id: 'desk.focusPerson', label: 'Look at a phase’s person', intent: 'show me who owns the {phase} phase', permission, params: { phase: 'string' } },
  { id: 'desk.openPersonPortal', label: 'Open the person’s portal', intent: 'open the portal of the {phase} owner', permission, params: { phase: 'string' } },
];

/** W-04 on the four portals and on dev; the surface only changes the shell, guard and breadcrumb (like W-01, D-021). */
export function deskSpec(surface: Surface, permission = 'projects.read'): PageSpec {
  return defineSpec({
    code: 'W-04',
    name: 'Method desk',
    purpose: 'The whole method at a glance as physical objects on a desk, with a seated professional for the role that owns each phase: one felt mat per phase of the client journey, sub-mats that group statuses, forms, procedures, deliverables, money, communication, rules, team and measures, and every template or item as a small sheet, form, checklist, document, folder, box, token or card whose face previews its real content (prompt 0026, D-103).',
    surface,
    navGroup: surface === 'dev' ? 'developer' : 'projects',
    layout: [
      'PageHeader (W-04, object, people and mat counts)',
      'Toolbar: zoom − / percentage (aria-live) / zoom +, Fit, Tilt toggle, phase Select, Reset; hint line',
      'Stage (perspective) > camera (rotateX 22° or flat) > world (translate + scale): ten mats in reading order, 5 per row on landscape stages, 3 on squarish ones, 2 on tall phones',
      'Mat: label button (number, phase, object count) + sub-mats with a label strip and a chess-square grid (1 square = 64 world px)',
      'Objects: 1x1 or 2x1 squares, CSS 3D thickness (top face + side faces or stacked discs), real-content preview on the top face',
      'Person station on each mat\'s near edge (5 x 3 squares, below the sub-mats): rug, CSS 3D desk, chair, seated role figure, phase props, tent nameplate (prompt 0027, D-104)',
      'Drawer: large preview, kind / phase / group / source / code, full contents list, Open (Placeholder); for a person: portrait, role, portal role, demo person, basis, why here, responsibilities, owned phases, Open portal (Placeholder)',
    ],
    dataTables: [],
    roles: ['founder', 'ops', 'studio', 'brand', 'dev'],
    logic: [
      'Content is derived, never hand-placed: `buildItems()` reads SERVICES (folders, one checklist per phase, delivery document and kit box), PIPELINE / VALIDATION / PURCHASE statuses (tokens), LEAD_RECORD_FIELDS / COMMERCIAL_FIELDS / QUALIFICATION_QUESTIONS (forms), LEAD_CHANNELS, OPERATIONAL_ASSETS, GOVERNANCE_RULES + FINAL_PRINCIPLE, ROLE_RESPONSIBILITIES, KPIS and the project template phases; classification tables map each to a journey phase with a fallback.',
      '`layoutDesk()` packs each group first-fit into a sub-mat (dense, row-major, no overlaps), shelf-packs sub-mats inside the mat, and rows the mats (equal height per row); positions are multiples of the 64 px square.',
      'Camera = world point at the stage centre + zoom; the world transform is written through a ref and requestAnimationFrame during wheel, drag, pinch and fly-to, and committed to state (percentage, --desk-zoom) when the gesture ends. Screen <-> desk-plane maths inverts rotateX + perspective, so zoom stays anchored under the cursor even tilted.',
      'Inputs: wheel zooms about the cursor (ctrl + wheel = trackpad pinch), shift + wheel pans; pointer drag on the desk pans (mouse, touch, pen), two-finger pinch zooms; keys + / − zoom, arrows pan, 0 resets, F fits; Tab walks mat labels then objects and keyboard focus flies the object into view.',
      'Activating a mat label fits that mat; activating an object flies to it and opens the drawer. Open is a Placeholder: `desk.openItem` answers "not wired yet: <page>" with the code, name and path of the page that will open it (D-047).',
      'Tilt is a toggle (22° / flat top-down); prefers-reduced-motion removes the camera animations (moves are instant) and the tilt transition.',
      'People are data (`deskPeople.ts`): phase -> ROLE_RESPONSIBILITIES role with a basis (project template phase ownerRole, role responsibility, or closest role = inferred); the station is a button after its mat\'s objects in the Tab order, activating it flies to it and opens the person drawer; `desk.openPersonPortal` answers "not wired yet: <portal> (#<path>)" (D-047).',
      'Textures are procedural: SVG feTurbulence noise as data-URI layers over token colours for the felt mats, linen sub-mats, paper grain and the desk; no images, no dependencies.',
    ],
    components: ['PageHeader', 'Button', 'Select', 'Drawer', 'KeyValue', 'Placeholder'],
    actions: deskActions(permission),
    checkedAt: WIDTHS,
  });
}
