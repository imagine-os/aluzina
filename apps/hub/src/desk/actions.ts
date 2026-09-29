import type { ActionDef, RouteDef, Surface } from '../specs/PageSpec';

/**
 * The page desks' vocabulary (D-106): declared once here and appended by the registry to the spec of every route that
 * carries a page desk, with that route's guard, so D-09, voice and WebMCP see them per page. `PageDesk` registers
 * them while it is mounted (the camera verbs through `useDesk`, the object verbs itself).
 */
export const deskActionsFor = (permission?: string): ActionDef[] => [
  { id: 'desk.zoom', label: 'Zoom the desk', intent: 'zoom the desk to {zoom} percent', permission, params: { zoom: 'number' } },
  { id: 'desk.fit', label: 'Fit the desk', intent: 'show the whole desk', permission },
  { id: 'desk.reset', label: 'Reset the view', intent: 'reset the desk view', permission },
  { id: 'desk.toggleTilt', label: 'Tilt or flatten the desk', intent: 'tilt the desk or look straight down', permission },
  { id: 'desk.focusMat', label: 'Go to a mat', intent: 'show the {mat} mat of the desk', permission, params: { mat: 'string' } },
  { id: 'desk.focusObject', label: 'Look at an object', intent: 'show me {object} on the desk', permission, params: { object: 'id' } },
  { id: 'desk.openObject', label: 'Open an object', intent: 'open {object} on the desk', permission, params: { object: 'id' } },
  { id: 'desk.fullscreen', label: 'Full screen desk', intent: 'show the desk full screen, or leave full screen', permission },
  { id: 'desk.setHeight', label: 'Desk size', intent: 'make the desk {size}', permission, params: { size: 'enum:s|m|l' } },
  { id: 'desk.toggleWheelZoom', label: 'Scroll wheel zooms', intent: 'make the scroll wheel zoom the desk, or move it', permission },
  { id: 'desk.legend', label: 'Desk legend', intent: 'show what the objects on the desk are', permission },
];

/**
 * The leads desk's vocabulary (D-114): dossiers and work mats, appended to the routes whose page desk shows leads
 * (their `dataTables` read `leads`; A-08 first) and registered by `useLeadDesk` while that desk is mounted.
 */
export const dossierActionsFor = (permission?: string): ActionDef[] => [
  { id: 'desk.fanOut', label: 'Fan out a dossier', intent: "fan out {object}'s dossier on the desk", permission, params: { object: 'id' } },
  { id: 'desk.stackUp', label: 'Stack a dossier', intent: "stack {object}'s dossier back up", permission, params: { object: 'id' } },
  { id: 'desk.sortStack', label: 'Sort a dossier', intent: "sort {object}'s dossier by {by}", permission, params: { object: 'id', by: 'enum:kind|date|network' } },
  { id: 'desk.flipCard', label: 'Flip a dossier card', intent: 'turn over the {card} card', permission, params: { card: 'id' } },
  { id: 'desk.addWorkMat', label: 'Add a work mat', intent: 'add a work mat to the desk', permission },
  { id: 'desk.renameWorkMat', label: 'Rename a work mat', intent: 'call work mat {mat} {name}', permission, params: { mat: 'string', name: 'string' } },
  { id: 'desk.removeWorkMat', label: 'Remove a work mat', intent: 'remove work mat {mat}', permission, params: { mat: 'string' } },
  { id: 'desk.sendToWorkMat', label: 'Send to a work mat', intent: 'put {object} on work mat {mat}', permission, params: { object: 'id', mat: 'string' } },
  { id: 'desk.moveOnWorkMat', label: 'Move on a work mat', intent: 'move {object} to square {x}, {y} of its work mat', permission, params: { object: 'id', x: 'number', y: 'number' } },
  { id: 'desk.removeFromWorkMat', label: 'Remove from a work mat', intent: 'take {object} off its work mat', permission, params: { object: 'id' } },
];

/** The surfaces whose pages carry a page desk this pass (the four portals; D-106). */
export const DESK_SURFACES: readonly Surface[] = ['founder', 'ops', 'studio', 'brand'];

/** True when the DesktopShell mounts a page desk above this route (a portal page that is not itself a desk). */
export function hasPageDesk(route: Pick<RouteDef, 'shell' | 'surface' | 'desk'>): boolean {
  return route.shell === 'desktop' && DESK_SURFACES.includes(route.surface) && !route.desk?.self;
}

/** The route with the page desk's actions appended (registry, once per route). */
export function withDeskActions(route: RouteDef): RouteDef {
  if (!hasPageDesk(route)) return route;
  const have = new Set(route.spec.actions.map((a) => a.id));
  const own = [...deskActionsFor(route.permission), ...(route.spec.dataTables.includes('leads') ? dossierActionsFor(route.permission) : [])];
  const extra = own.filter((a) => !have.has(a.id)).map((a) => (a.permission ? a : { ...a, permission: undefined }));
  return { ...route, spec: { ...route.spec, actions: [...route.spec.actions, ...extra] } };
}
