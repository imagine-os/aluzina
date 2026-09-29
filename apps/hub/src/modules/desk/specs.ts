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
  { id: 'desk.followProject', label: 'Follow a project', intent: 'follow the project {project} on the desk', permission, params: { project: 'id' } },
  { id: 'desk.clearProject', label: 'Stop following the project', intent: 'stop following the project', permission },
  { id: 'desk.playTrail', label: 'Play the light trail', intent: 'play the project’s trail', permission },
  { id: 'desk.pauseTrail', label: 'Pause the light trail', intent: 'pause the trail', permission },
  { id: 'desk.stepTrail', label: 'Step through the trail', intent: 'go to the {dir} event', permission, params: { dir: 'enum:prev|next' } },
  { id: 'desk.openRow', label: 'Open a record’s page', intent: 'open the page of the {entity} {id}', permission, params: { entity: 'string', id: 'id' } },
  // The desk system's toolbar (D-106), registered by the engine (`src/desk/useDesk.ts`) like zoom / fit / reset / tilt.
  { id: 'desk.fullscreen', label: 'Full screen desk', intent: 'show the desk full screen, or leave full screen', permission },
  { id: 'desk.setHeight', label: 'Desk size', intent: 'make the desk {size}', permission, params: { size: 'enum:s|m|l' } },
  { id: 'desk.toggleWheelZoom', label: 'Scroll wheel zooms', intent: 'make the scroll wheel zoom the desk, or move it', permission },
  { id: 'desk.legend', label: 'Desk legend', intent: 'show what the objects on the desk are', permission },
  // Lead dossiers (D-114): a followed project's lead tile goes to a work mat of the Leads desk (A-08).
  { id: 'desk.sendToWorkMat', label: 'Send to a work mat', intent: 'put {object} on work mat {mat} of the Leads desk', permission, params: { object: 'id', mat: 'string' } },
];

/** W-04 on the four portals and on dev; the surface only changes the shell, guard and breadcrumb (like W-01, D-021). */
export function deskSpec(surface: Surface, permission = 'projects.read'): PageSpec {
  return defineSpec({
    code: 'W-04',
    name: 'Method desk',
    purpose: 'The whole method at a glance as physical objects on a desk, with a seated professional for the role that owns each phase: one felt mat per phase of the client journey, sub-mats that group statuses, forms, procedures, deliverables, money, communication, rules, team and measures, and every template or item as a small sheet, form, checklist, document, folder, box, token or card whose face previews its real content (prompt 0026, D-103). Follow a project and the desk becomes its spatial view: its status glows, its records land as light tiles on the mats where they belong, a money strip sums what was quoted, approved, paid and is outstanding, and its events travel as light from mat to mat (prompt 0028, D-105).',
    surface,
    navGroup: surface === 'dev' ? 'developer' : 'projects',
    layout: [
      'PageHeader (W-04, object, people and mat counts)',
      'Desk frame (src/desk DeskStage, D-106): toolbar zoom − / percentage (aria-live) / zoom +, Fit, Tilt toggle, phase Select, Reset, Legend, size S / M / L, Full screen, Settings (Scroll wheel zooms); hint line; height handle at the stage\'s bottom edge; minimap in the stage corner; hover / focus tooltip',
      'Light toolbar: project Select ("Follow a project…", active first), Clear, Previous / Play-Pause / Next; trail caption line (aria-live)',
      'Stage (perspective) > camera (rotateX 22° or flat) > world (translate + scale): ten mats in reading order, 5 per row on landscape stages, 3 on squarish ones, 2 on tall phones',
      'Mat: label button (number, phase, object count) + sub-mats with a label strip and a chess-square grid (1 square = 64 world px)',
      'Objects: 1x1 or 2x1 squares, CSS 3D thickness (top face + side faces or stacked discs), real-content preview on the top face',
      'Person station on each mat\'s near edge (5 x 3 squares, below the sub-mats): rug, CSS 3D desk, chair, seated role figure, phase props, tent nameplate (prompt 0027, D-104)',
      'Followed project: status token halo, current mat framed in the brand light, earlier mats tinted done; a project sub-mat (and a messages sub-mat) of light tiles on each mat that has its records; money strip along the near edge (quoted, approved, paid, outstanding, communication); a pulse of light travelling along the trail',
      'Drawer: large preview, kind / phase / group / source / code, full contents list, Open (navigates); for a person: portrait, role, portal role, demo person, basis, why here, responsibilities, owned phases, Open portal (navigates); for a light tile: its face, kind, project, mat, managing page, why this mat, every field, Open',
    ],
    dataTables: ['projects', 'leads', 'engagements', 'meetings', 'documents', 'quotes', 'changeOrders', 'revisionItems', 'revisions', 'purchases', 'payments', 'deliveries', 'siteReports', 'messages', 'alerts', 'activity', 'suppliers'],
    roles: ['founder', 'ops', 'studio', 'brand', 'dev'],
    logic: [
      'Content is derived, never hand-placed: `buildItems()` reads SERVICES (folders, one checklist per phase, delivery document and kit box), PIPELINE / VALIDATION / PURCHASE statuses (tokens), LEAD_RECORD_FIELDS / COMMERCIAL_FIELDS / QUALIFICATION_QUESTIONS (forms), LEAD_CHANNELS, OPERATIONAL_ASSETS, GOVERNANCE_RULES + FINAL_PRINCIPLE, ROLE_RESPONSIBILITIES, KPIS and the project template phases; classification tables map each to a journey phase with a fallback.',
      '`layoutDesk()` packs each group first-fit into a sub-mat (dense, row-major, no overlaps), shelf-packs sub-mats inside the mat, and rows the mats (equal height per row); positions are multiples of the 64 px square.',
      'Camera = world point at the stage centre + zoom; the world transform is written through a ref and requestAnimationFrame during wheel, drag, pinch and fly-to, and committed to state (percentage, --desk-zoom) when the gesture ends. Screen <-> desk-plane maths inverts rotateX + perspective, so zoom stays anchored under the cursor even tilted.',
      'Inputs (D-106): two-finger scroll / plain wheel pans (both axes; at the desk\'s edge, or when it fits, a vertical scroll goes on to the page), pinch or ctrl / cmd + wheel zooms about the cursor, the persisted "Scroll wheel zooms" switch makes a mouse wheel zoom; drag pans with a short inertia (off under reduced motion), Space + drag or the middle button pans from anywhere; double-click an object zooms to it, on the empty desk one step in; touch / pen: one-finger drag, two-finger pinch about the midpoint, double-tap zooms, taps activate (drag threshold 10 px); keys + / − zoom, arrows pan, 0 resets, F fits; Tab walks mat labels, sub-mat labels, objects; keyboard focus flies the object into view.',
      'Frame (D-106): Full screen uses the Fullscreen API on the desk frame (toolbar, stage, rail) and falls back to a fixed overlay where the API is missing (iPhone Safari); Esc exits; the height is S / M / L (40 / 60 / 85 % of the viewport, default M here) or dragged / arrow-keyed on the handle, stored per page code; under 768 px the desk can collapse to a bar (open by default on W-04).',
      'Activating a mat label fits that mat; activating an object flies to it and opens the drawer. Open navigates to the page the object names; when the role lacks that route\'s permission the session switches to the demo user of its surface first, with the D-07 toast (D-015). `desk.openItem` answers "opened <code> (#<path>)".',
      'Tilt is a toggle (22° / flat top-down); prefers-reduced-motion removes the camera animations (moves are instant) and the tilt transition.',
      'People are data (`deskPeople.ts`): phase -> ROLE_RESPONSIBILITIES role with a basis (project template phase ownerRole, role responsibility, or closest role = inferred); the station is a button after its mat\'s objects in the Tab order, activating it flies to it and opens the person drawer; Open portal navigates to the role\'s portal (switching the session when needed); `desk.openPersonPortal` answers "opened <code> (#<path>)".',
      'Light layer (D-105): following a project reads its rows live (`useTable` per entity, re-rendered from `subscribe`, D-023); `deskFlow.ts` FLOW_RULES places each entity on a mat (leads Lead, engagements Brief, quotes / change orders Development, revision items / brand revisions Validation, purchases / payments / deliveries / site reports Delivery, documents by kind, messages / alerts the current phase, meetings the current phase or Diagnosis); at most 6 tiles per kind ("+N more") and 40 per project.',
      'Money strip: quoted = per comparison group the selected quote, else the lowest not rejected; approved = purchases past Quoted + approved or executed change orders; paid = Σ paidCop of payments (in / out); outstanding = Σ amountCop − paidCop of payments not paid. Communication: messages in the project channel (client / team), meetings, the lead\'s intake channel.',
      'Trail: one event per placed row at its own date (purchase date, payment paid or due date, message time, ...; created_at when it has none) plus one per `activity` line on the project or its rows; Play moves a pulse (CSS transform, 700 ms per hop) to each event\'s tile and lights it, Previous / Next step; Space (stage focused) plays / pauses, [ and ] step; reduced motion jumps.',
      'Textures are procedural: SVG feTurbulence noise as data-URI layers over token colours for the felt mats, linen sub-mats, paper grain and the desk; no images, no dependencies.',
    ],
    components: ['PageHeader', 'Button', 'Select', 'Checkbox', 'Drawer', 'KeyValue', 'Toast'],
    actions: deskActions(permission),
    checkedAt: WIDTHS,
  });
}
