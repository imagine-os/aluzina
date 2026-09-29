import { deskActionsFor } from '../../desk/actions';
import { defineSpec, type ActionDef, type PageSpec, type Surface } from '../../specs/PageSpec';

/** Page codes (prompt 0030). */
export const HUB_CODE = 'W-05';

const WIDTHS = [360, 390, 768, 1280, 1920, 2560, 3840];

/** Every control of W-05 (P-05). Registered while mounted; `permission` is the route guard of the surface. */
export const hubActions = (permission: string): ActionDef[] => [
  { id: 'clienthub.open', label: 'Open a screen', intent: 'open the {code} screen of the client hub', permission, params: { code: 'string' } },
  { id: 'clienthub.focusRole', label: 'Go to a role', intent: 'show me the {role} mat of the client hub', permission, params: { role: 'string' } },
  { id: 'clienthub.setLens', label: 'Point of view', intent: 'show the client hub as {lens} sees it', permission, params: { lens: 'enum:aluzina|between-gigs|standalone' } },
  { id: 'clienthub.setFacesLang', label: 'Language of the screens', intent: 'show the client screens in {lang}', permission, params: { lang: 'enum:es|en' } },
  { id: 'clienthub.toggleTools', label: 'Show the client tools', intent: 'show or hide the client hub tools', permission },
  { id: 'clienthub.openLive', label: 'Open live', intent: 'open the {code} screen live as its role', permission, params: { code: 'string' } },
  { id: 'clienthub.closeLive', label: 'Close live', intent: 'close the live screen', permission },
  { id: 'clienthub.stepObject', label: 'Previous or next screen', intent: 'go to the {dir} screen on this sub-mat', permission, params: { dir: 'enum:prev|next' } },
  { id: 'clienthub.openInClient', label: 'Open in the client’s app', intent: 'open the {code} screen in the client app in a new tab', permission, params: { code: 'string' } },
  { id: 'clienthub.openProject', label: 'Open the client project', intent: 'open the client’s project work', permission },
  { id: 'clienthub.reloadMap', label: 'Reload the hub map', intent: 'reload the client hub map', permission },
];

/** W-05 on the four portals and on dev (like W-04, D-021): the surface only changes the shell, guard and breadcrumb. */
export function hubSpec(surface: Surface, permission: string): PageSpec {
  return defineSpec({
    code: 'W-05',
    name: 'Client hub · HOY',
    purpose:
      'HOY (a wellness studio, an ALUZINA client, project prj-hoy) has its own OS; this page lays that whole hub on the desk physically, the way ALUZINA sees a client: one felt mat per HOY role with a seated figure of that role, the role’s experiences as sub-mats, and every page as a device whose face is the real screen (phones for the member and teacher apps, tall pages and a fanned stack for the website, screens on stands for the staff and admin desktops, documents for the manual and docs). Read from HOY’s published hub map (hoy.hub-map/1), with a bundled snapshot when it cannot be fetched; open any screen to read what it is for, which actions it declares, and to try it live as that role inside the drawer. A lens switch shows the same map as Between Gigs (by experience, as one gig) and as HOY on its own. (ES: Hub del cliente · HOY: todo el hub de HOY sobre la mesa, un tapete por rol, cada página como un dispositivo con su pantalla real.)',
    surface,
    navGroup: surface === 'dev' ? 'developer' : 'projects',
    layout: [
      'PageHeader (W-05): breadcrumb portal / Clients / Client hub · HOY, title, subtitle with page and mat counts',
      'Header strip (role="toolbar"): client wordmark (image, falls back to the name) and version, "ALUZINA client · project prj-hoy" (Button, opens W-02 of the project), map state StatusPill (Live map · date / Bundled snapshot · date) with Reload map, point-of-view Tabs (ALUZINA / Between Gigs / On its own; ?lens= in the hash query), screens language buttons ES / EN (faces only, independent of the UI language), Tools toggle (aria-pressed)',
      'Framing line: the lens hint’s framing from the map; Between Gigs adds a gig Card (name, version, tagline, counts, Open the client)',
      'Desk frame (src/desk DeskStage): toolbar, stage (default L), minimap, legend, handle, hint; home zoom so phones are >= 44 px and read at 10 feet (>= 200 px tall at 3840)',
      'ALUZINA lens: mats Customer, Web · Public, Teacher, Front desk, Coordinator, Finance, Admin, Super admin (maintenance only when it owns pages); each seats the role figure (hub map look, props, role caption, demo first name); sub-mats = the role’s experiences (the member app split Book / Pay / Account / Sign in; admin in two halves); objects = pages as phone / page / screen / document devices with image faces; the website mat opens with a fanned stack of the whole site; Tools as a sub-mat of screens on Super admin when shown',
      'Between Gigs lens: mats Website, Apps, Back office, Build (+ Tools), one figure per mat (the role owning most of it), sub-mats by experience, condensed at 12 per sub-mat with a stack',
      'On its own lens: one mat, the hub itself first (start here), then one screen per experience by band (outside / team / build), then the testing tools',
      'Drawer (right from 768 px, 56rem while live on desktop screens; bottom sheet below): large face, code, role, experience, device, route, status, purpose, declared actions; footer Previous / Next (within the sub-mat), Open live / Close live (iframe sized to the device, scaled to fit), Open in HOY ↗ (new tab); for a person: portrait, role, demo person, home, device, what sits on the mat, Open live as that role; for the website stack or a +N stack: its pages, each a button',
    ],
    dataTables: [],
    roles: ['founder', 'ops', 'studio', 'brand', 'dev'],
    logic: [
      'Data is the client’s hub map (`modules/clienthub/hubMap.types.ts`, schema hoy.hub-map/1): `useHubMap(clientId)` renders the bundled snapshot (`hoy.hub-map.snapshot.json`, its own lazy chunk) and fetches https://imagine-os.github.io/hoy/hub-map.json with the default HTTP cache; the live map replaces the snapshot when it arrives and is kept 10 minutes in memory (stale-while-revalidate); a failure (offline, not published, wrong schema) keeps the snapshot and the pill says why.',
      '`buildLens(map, lens, ctx)` (`lenses.ts`) builds the DeskModel of each lens from the same map: device per page = phone for phone / tablet, page for website pages, screen for desktop, document for sheets; faces = the capture in the faces language, dark variant when the app is dark, falling back to the other language, the full 390 / 1280 capture, the other device form; tall pages prefer the full-length capture anchored at the top; nothing is hand-placed.',
      'Caps for this desk: 16 objects per sub-mat and 48 per mat on the ALUZINA lens (every page visible), 12 / 30 on Between Gigs (condensed; a stack lists the rest and opens each page); past the face budget (200) objects are plain and request no image.',
      'Open live builds the embed URL from the map’s pattern ({baseUrl}#{route}?as={role}&lang={lang}&theme={theme}&dev=0&live=0) with the object’s role (the mat’s role when the page allows it, else its first role), the faces language and the app theme; the iframe is created only on Open live and removed on Close live or when the drawer closes; it is sized to the device (phone 390 × 844, tablet 768 × 1024, desktop 1280 × 800, web page 390 wide scrolling) and scaled to the drawer’s width.',
      'The lens, the faces language and the tools switch live in the hash query (?lens=aluzina|between-gigs|standalone&faces=es|en&tools=1|0); defaults: aluzina, the UI language, the lens hint’s showTools.',
      'Keyboard and inputs are the desk system’s (docs/design/desk-system.md): Tab walks mats, sub-mats and objects (multi-row devices included), Enter opens, Esc closes the drawer; nothing is hover-only; every object, label and station is a native button with an aria-label.',
    ],
    components: ['PageHeader', 'Button', 'Tabs', 'StatusPill', 'Card', 'Drawer', 'KeyValue', 'Toast'],
    actions: [...hubActions(permission), ...deskActionsFor(permission)],
    checkedAt: WIDTHS,
  });
}
