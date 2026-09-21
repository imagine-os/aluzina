import { defineSpec } from '../../specs/PageSpec';

/** Product surfaces and builder tools on the hub (pass 0013): each card names a page code and is live when a built route with that code exists. */
export const SURFACE_IDS = ['website', 'services', 'client', 'manual', 'docs', 'spaces', 'business-os', 'plan', 'canvas', 'simulator', 'actions', 'tokens', 'testing', 'components', 'specs', 'multiuser'] as const;
export type SurfaceId = (typeof SURFACE_IDS)[number];

/** Pages of the Claude Design export served under ./business-os/ (BOS-02..BOS-06, D-010). */
export const PROTOTYPE_PAGE_IDS = ['home', 'cyber-bridge', 'cyber-bridge-deck', 'image-generation-plan', 'lod-ladder'] as const;
export type PrototypePageId = (typeof PROTOTYPE_PAGE_IDS)[number];

/** Portal cards (D-014): one per role; the client portal is planned. */
export const PORTAL_ROLES = ['founder', 'ops', 'studio', 'brand'] as const;

export const hubSpec = defineSpec({
  code: 'HUB-01',
  name: 'Hub',
  purpose: 'Entry point to every surface of the Aluzina system: portals per role (enter as a demo user), the prototype, the public site, docs and dev tools; language, theme, dev-mode and role controls.',
  surface: 'hub',
  layout: [
    'HubHeader (brand, "Viewing as" RoleSwitcher, EN/ES, theme, dev mode)',
    'Title + subtitle',
    'Portals grid: A-01 Founder, O-01 Administration and Operations, S-01 Interior Design, G-01 Graphic Design and Communication (cards enter as the demo user; status Live / Stub read from the route manifest), C-01 Client (planned: no route)',
    'Product surfaces grid: P-00 website (external), P-01 services and intake, C-01 client app, M-01 manual, D-06 docs (GitHub link while no route), K-01 Spaces (opens on the current role\'s surface; founder when the role has none), BOS-01 prototype; each card is live when a built route with its code is registered, else Planned (Placeholder)',
    'Builder and dev tools grid: D-05 plan viewer, D-07 canvas, D-08 demo simulator, D-09 actions, D-10 tokens, D-11 testing hub, D-02 components, D-03 specs, D-04 multiuser; same route-derived status',
    'Prototype pages grid (BOS-02..06)',
    'Footer (version, repo link, dev hint)',
  ],
  dataTables: [],
  roles: ['public'],
  logic: [
    'A portal card calls switchUser(role) then navigates to the portal dashboard (hub.enterAs); the RoleSwitcher changes the demo user in place (hub.switchRole).',
    'Live / stub surfaces render as links or buttons; planned surfaces render through Placeholder (P-09).',
    'Surface and tool cards derive their status from the route manifest by page code (built -> Live, stub -> Stub, no route -> Planned) exactly like portal cards; only P-00, BOS-01 and Spaces are static (pass 0013).',
    'Language, theme, session (user, viewAs, dev mode) persist in localStorage (aluzina.lang / aluzina.theme / aluzina.session).',
    '?as=<role> on first load selects that demo user (thumbnails, QA, deep links; docs/reference/surfaces.md).',
    'Ctrl+. toggles the dev panel when dev mode is on.',
    'The Spaces card (K-01, prompt 0005) opens /<surface>/spaces for the current role\'s surface (founder for roles without a portal), so the hub never sends a person into another role\'s shell.',
    'Card thumbnails load lazily from ./thumbs/<code>.jpg?v=<buildId>, written by scripts/thumbnails.mjs after every CI build (D-011); a missing file falls back to the bilingual tile, planned cards always show the tile.',
  ],
  components: ['HubHeader', 'RoleSwitcher', 'ToggleButton', 'SurfaceCard', 'Placeholder', 'Toast'],
  actions: [
    {
      id: 'hub.enterAs',
      label: 'Enter portal as role',
      intent: 'open the {role} portal as its demo user',
      params: { role: `enum:${PORTAL_ROLES.join('|')}` },
    },
    {
      id: 'hub.switchRole',
      label: 'Switch role',
      intent: 'view the system as {role}',
      params: { role: 'enum:founder|ops|studio|brand|client|dev' },
    },
    {
      id: 'hub.openSurface',
      label: 'Open surface',
      intent: 'open the {surface}',
      params: { surface: `enum:${SURFACE_IDS.join('|')}` },
    },
    {
      id: 'hub.openPrototypePage',
      label: 'Open prototype page',
      intent: 'open the prototype page {page}',
      params: { page: `enum:${PROTOTYPE_PAGE_IDS.join('|')}` },
    },
    { id: 'hub.setLang', label: 'Set language', intent: 'switch the language to {lang}', params: { lang: 'enum:en|es' } },
    { id: 'hub.toggleTheme', label: 'Toggle theme', intent: 'switch between light and dark' },
    { id: 'hub.toggleDevMode', label: 'Toggle developer mode', intent: 'turn developer mode on or off', permission: 'dev.tools' },
  ],
  checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840],
  notes: [
    'Demo simulator (D-08), canvas (D-07) and plan viewer (D-05) are built in pass 0013 (build plan step 13); until their modules land the cards are Planned.',
    'Business OS prototype (BOS-01) and its pages (BOS-02..06) are the static Claude Design bundle at ./business-os/ (D-007).',
    'Portal card status is derived from the registered dashboard route (built -> Live, stub -> Stub, no route -> Planned), never hard-coded.',
  ],
});
