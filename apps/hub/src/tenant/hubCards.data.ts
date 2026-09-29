import manifest from '../../../../tenant.json' with { type: 'json' };

/**
 * Plain data behind `hubCards.ts` (tp-07, D-089): the same card lists, with no type-only imports and no
 * import chain through files `node --experimental-strip-types` cannot resolve (this project's relative
 * TS imports are extensionless, which Node's own resolver does not fill in). `hubCards.ts` re-exports
 * everything here with its full types for the app; `scripts/thumbnails.mjs` and `scripts/screenshots.mjs`
 * import this file directly instead of hand-duplicating the lists. Keep this file's shape identical to
 * `hubCards.ts`'s exports; a mismatch is a bug, not a style choice.
 */

/** Canonical repository (`tenant.json` `repo`). */
export const REPO_URL = manifest.repo;
/** The tenant's own public website, linked as P-00 (`tenant.json` `identity.publicSite`). */
export const WEBSITE_URL = manifest.identity.publicSite;

/** Product surfaces: what clients and the team use. Shape: `hubCards.ts`'s `SurfaceEntry`. */
export const PRODUCT_SURFACES = [
  { id: 'website', code: 'P-00', key: 'website', kind: 'external', href: WEBSITE_URL },
  { id: 'services', code: 'P-01', key: 'services', kind: 'route' },
  { id: 'brand-docs', code: 'G-08', key: 'brandDocs', kind: 'route', enterAs: 'brand', enterUnless: 'brand.manage' },
  { id: 'client', code: 'C-01', key: 'client', kind: 'route', enterAs: 'client' },
  { id: 'manual', code: 'M-01', key: 'manual', kind: 'route' },
  { id: 'docs', code: 'D-06', key: 'docs', kind: 'route', fallbackHref: `${REPO_URL}/tree/main/docs` },
  { id: 'archive', code: 'S-12', key: 'archive', kind: 'route', enterAs: 'studio', enterUnless: 'projects.read' },
  { id: 'spaces', code: 'K-01', key: 'spaces', kind: 'static', href: '#/founder/spaces' },
  { id: 'desk', code: 'W-04', key: 'desk', kind: 'static', href: '#/founder/desk' },
  { id: 'business-os', code: 'BOS-01', key: 'businessOs', kind: 'static', href: './business-os/' },
];

/** Builder and dev tools: how the system is built and checked (D-xx). Shape: `hubCards.ts`'s `SurfaceEntry`. */
export const TOOL_SURFACES = [
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

/** Must match `apps/hub/src/modules/hub/specs.ts`'s `PORTAL_ROLES` (founder, ops, studio, brand). */
export const PORTAL_ROLES = ['founder', 'ops', 'studio', 'brand'];

/** One card per role (D-014); the client portal has no route yet. Shape: `hubCards.ts`'s `PortalEntry`. */
export const PORTALS = [...PORTAL_ROLES.map((role) => ({ role, key: role })), { role: 'client', key: 'client' }];

/** The other pages of the Claude Design export (URL-safe entry points, D-010). Shape: `hubCards.ts`'s `PrototypePage`. */
export const PROTOTYPE_PAGES = [
  { id: 'home', code: 'BOS-02', key: 'home', href: './business-os/home.html' },
  { id: 'cyber-bridge', code: 'BOS-03', key: 'cyberBridge', href: './business-os/cyber-bridge.html' },
  { id: 'cyber-bridge-deck', code: 'BOS-04', key: 'cyberBridgeDeck', href: './business-os/cyber-bridge-deck.html' },
  { id: 'image-generation-plan', code: 'BOS-05', key: 'imageGenerationPlan', href: './business-os/image-generation-plan.html' },
  { id: 'lod-ladder', code: 'BOS-06', key: 'lodLadder', href: './business-os/lod-ladder.html' },
];
