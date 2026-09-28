import type { RoleId } from './auth/roles';
import { TENANT } from './config';
import { PORTAL_ROLES, type PrototypePageId, type SurfaceId } from '../modules/hub/specs';

/**
 * The hub's card lists as tenant data (tp-05, D-089): which portals, product surfaces, builder tools and prototype
 * pages HUB-01 shows, in order. `modules/hub/HubPage.tsx` renders them; `scripts/thumbnails.mjs` reads them in tp-07.
 * Card state (live / stub / planned) is never stored here: HubPage derives it from the route manifest by page code.
 */

/** Canonical repository (`tenant.json` `repo`). */
export const REPO_URL = TENANT.repo;
/** The tenant's own public website, linked as P-00 (`tenant.json` `identity.publicSite`). */
export const WEBSITE_URL = TENANT.publicSite;

/**
 * A card on the Product surfaces or Builder and dev tools grids (pass 0013). `route`: live when a built route
 * with `code` is registered (its path is the href), stub when the route is a stub, planned otherwise, exactly
 * like portal cards; `fallbackHref` keeps a planned surface reachable outside the app (docs on GitHub).
 * `static`: always live at `href`. `external`: a site outside the OS.
 */
export interface SurfaceEntry {
  id: SurfaceId;
  code: string;
  key: string;
  kind: 'route' | 'static' | 'external';
  href?: string;
  fallbackHref?: string;
  /** Route-derived cards that need a session switch first (the client app opens as the demo client). */
  enterAs?: RoleId;
  /** With `enterAs`: the permission that makes the switch unnecessary (the current role can already open it). */
  enterUnless?: string;
}

/** Product surfaces: what clients and the team use. */
export const PRODUCT_SURFACES: SurfaceEntry[] = [
  { id: 'website', code: 'P-00', key: 'website', kind: 'external', href: WEBSITE_URL },
  { id: 'services', code: 'P-01', key: 'services', kind: 'route' },
  { id: 'brand-docs', code: 'G-08', key: 'brandDocs', kind: 'route', enterAs: 'brand', enterUnless: 'brand.manage' },
  { id: 'client', code: 'C-01', key: 'client', kind: 'route', enterAs: 'client' },
  { id: 'manual', code: 'M-01', key: 'manual', kind: 'route' },
  { id: 'docs', code: 'D-06', key: 'docs', kind: 'route', fallbackHref: `${REPO_URL}/tree/main/docs` },
  { id: 'archive', code: 'S-12', key: 'archive', kind: 'route', enterAs: 'studio', enterUnless: 'projects.read' },
  { id: 'spaces', code: 'K-01', key: 'spaces', kind: 'static', href: '#/founder/spaces' },
  { id: 'business-os', code: 'BOS-01', key: 'businessOs', kind: 'static', href: './business-os/' },
];

/** Builder and dev tools: how the system is built and checked (D-xx). */
export const TOOL_SURFACES: SurfaceEntry[] = [
  { id: 'design', code: 'D-12', key: 'design', kind: 'route' },
  { id: 'plan', code: 'D-05', key: 'plan', kind: 'route' },
  { id: 'canvas', code: 'D-07', key: 'canvas', kind: 'route' },
  { id: 'simulator', code: 'D-08', key: 'simulator', kind: 'route' },
  { id: 'actions', code: 'D-09', key: 'actions', kind: 'route' },
  { id: 'tokens', code: 'D-10', key: 'tokens', kind: 'route' },
  { id: 'testing', code: 'D-11', key: 'testing', kind: 'route' },
  { id: 'components', code: 'D-02', key: 'components', kind: 'route' },
  { id: 'specs', code: 'D-03', key: 'specs', kind: 'route' },
  { id: 'multiuser', code: 'D-04', key: 'multiuser', kind: 'route' },
];

export interface PortalEntry {
  role: RoleId;
  key: string;
}

/** One card per role (D-014). Status comes from the route manifest at render time (see portalStatus); the client portal has no route yet. */
export const PORTALS: PortalEntry[] = [...PORTAL_ROLES.map((role) => ({ role, key: role })), { role: 'client', key: 'client' }];

export interface PrototypePage {
  id: PrototypePageId;
  code: string;
  key: string;
  href: string;
}

/** The other pages of the Claude Design export (URL-safe entry points, D-010). Canvas.dc.html is empty and not listed. */
export const PROTOTYPE_PAGES: PrototypePage[] = [
  { id: 'home', code: 'BOS-02', key: 'home', href: './business-os/home.html' },
  { id: 'cyber-bridge', code: 'BOS-03', key: 'cyberBridge', href: './business-os/cyber-bridge.html' },
  { id: 'cyber-bridge-deck', code: 'BOS-04', key: 'cyberBridgeDeck', href: './business-os/cyber-bridge-deck.html' },
  { id: 'image-generation-plan', code: 'BOS-05', key: 'imageGenerationPlan', href: './business-os/image-generation-plan.html' },
  { id: 'lod-ladder', code: 'BOS-06', key: 'lodLadder', href: './business-os/lod-ladder.html' },
];
