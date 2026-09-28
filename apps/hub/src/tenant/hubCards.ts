import type { RoleId } from './auth/roles';
import { type PrototypePageId, type SurfaceId } from '../modules/hub/specs';
import * as data from './hubCards.data';

/**
 * The hub's card lists as tenant data (tp-05, D-089): which portals, product surfaces, builder tools and prototype
 * pages HUB-01 shows, in order. `modules/hub/HubPage.tsx` renders them. The lists themselves live in
 * `hubCards.data.ts` (tp-07) so `scripts/thumbnails.mjs` and `scripts/screenshots.mjs` can read them too, instead
 * of hand-duplicating them; this file only adds the app's types on top.
 * Card state (live / stub / planned) is never stored here: HubPage derives it from the route manifest by page code.
 */

/** Canonical repository (`tenant.json` `repo`). */
export const REPO_URL: string = data.REPO_URL;
/** The tenant's own public website, linked as P-00 (`tenant.json` `identity.publicSite`). */
export const WEBSITE_URL: string = data.WEBSITE_URL;

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

/** Product surfaces: what clients and the team use. Data: `hubCards.data.ts`. */
export const PRODUCT_SURFACES: SurfaceEntry[] = data.PRODUCT_SURFACES as SurfaceEntry[];

/** Builder and dev tools: how the system is built and checked (D-xx). Data: `hubCards.data.ts`. */
export const TOOL_SURFACES: SurfaceEntry[] = data.TOOL_SURFACES as SurfaceEntry[];

export interface PortalEntry {
  role: RoleId;
  key: string;
}

/** One card per role (D-014). Status comes from the route manifest at render time (see portalStatus); the client portal has no route yet. */
export const PORTALS: PortalEntry[] = data.PORTALS as PortalEntry[];

export interface PrototypePage {
  id: PrototypePageId;
  code: string;
  key: string;
  href: string;
}

/** The other pages of the Claude Design export (URL-safe entry points, D-010). Canvas.dc.html is empty and not listed. */
export const PROTOTYPE_PAGES: PrototypePage[] = data.PROTOTYPE_PAGES as PrototypePage[];
