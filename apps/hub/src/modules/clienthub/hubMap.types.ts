/**
 * The hub map contract, schema `hoy.hub-map/1` (verbatim from the client's side, `imagine-os/hoy`
 * `src/hub/hubMap.types.ts`): one machine-readable description of a client's whole hub — roles, experiences,
 * pages, tools, captures, the embed pattern and a hint per host lens — published at `{baseUrl}hub-map.json`.
 * aluzina renders it (W-05, D-16); between-gigs and the client's own hub read the same file (docs/tenant/hub-map-consumer.md).
 * Pure types. A breaking change on the client's side bumps the schema id.
 */
export type Bi = { es: string; en: string };
export type HubDevice = 'phone' | 'tablet' | 'desktop' | 'page' | 'sheet'; // phone 390x844 app screen; tablet 768x1024; desktop 1280x800; page = tall scrolling website page (390 wide, full length); sheet = document/markdown page
export type HubBand = 'outside' | 'team' | 'build';
export type HubLensId = 'aluzina' | 'between-gigs' | 'standalone';
export type ThumbKey = 'es-phone' | 'en-phone' | 'es-desktop' | 'en-desktop' | 'es-phone-dark' | 'en-phone-dark' | 'es-desktop-dark' | 'en-desktop-dark';
export type ShotKey = 'es-390' | 'en-390' | 'es-1280' | 'en-1280' | 'es-390-full' | 'en-390-full';
export interface HubShots { thumbs: Partial<Record<ThumbKey, string>>; full: Partial<Record<ShotKey, string>>; } // URLs relative to product.baseUrl, e.g. 'hub-map/shots/C-01/thumb-es-phone.jpg' (thumbs are 195x422 phone / 640x400 desktop; full 390-wide and 1280-wide captures; '-full' = full-page tall capture, website pages only)
export interface HubRole { id: string; label: Bi; description: Bi; band: HubBand; home: string; device: HubDevice; demoUser?: { id: string; firstName: string }; look: string; props: [string, string]; }
// role ids: customer public teacher front_desk coordinator finance admin super_admin maintenance; look ∈ customer teacher frontdesk coordinator finance admin superadmin public maintenance; props from the existing PropId vocabulary in src/desk/people.ts
export interface HubExperience { id: string; code: string; label: Bi; purpose: Bi; roleId: string; roles: string[]; band: HubBand; device: HubDevice; route: string; url: string; featured?: boolean; secondary?: { label: Bi; route: string }; pageCodes: string[]; shots: HubShots; }
// 13 experiences: app(C-01, customer, phone, featured) site(W-01, public, page) teacher(S-03, teacher, phone) desk(S-02 check-in, front_desk, desktop) inbox(S-06, front_desk) pos(S-04 register, front_desk) admin(M-01, admin) crm(M-06, coordinator) finance(M-09, finance) manual(K-03, sheet) docs(K-02, sheet) kb(K-01, super_admin) dev(D-03, super_admin)
/** A sub-mat: the group a page sits in inside its experience (e.g. the customer app's Book / Pay / Account / Sign in). `order` sorts groups within an experience, ascending. Ids are stable across releases; labels are copy. (hoy 0.11.1, additive.) */
export interface HubGroup { id: string; label: Bi; order: number; }
export interface HubPage { code: string; route: string; name: Bi; purpose: Bi; surface: string; roles: string[]; experienceId: string; device: HubDevice; status: 'built' | 'stub'; actions: string[]; shots: HubShots; /** Additive since hoy 0.11.1: the sub-mat this page belongs to inside its experience; absent in older files. */ group?: HubGroup; } // ~87 pages
export interface HubTool { id: string; code: string; label: Bi; purpose: Bi; route: string; url: string; device: 'desktop'; shots: HubShots; } // 9 tools: canvas simulator specs layout tables components tokens decisions screenshots
export interface HubLensHint { title: Bi; framing: Bi; groupBy: 'role' | 'experience' | 'surface'; showTools: boolean; entry: string; }
export interface HubMap { schema: 'hoy.hub-map/1'; generatedAt: string; product: { id: 'hoy'; name: Bi; tagline: Bi; version: string; baseUrl: string; hubRoute: string; brand: { accent: string; wordmark?: string } }; embed: { pattern: string; note: Bi }; roles: HubRole[]; experiences: HubExperience[]; pages: HubPage[]; tools: HubTool[]; lenses: Record<HubLensId, HubLensHint>; }
// embed.pattern = '{baseUrl}#{route}?as={role}&lang={lang}&theme={theme}&dev=0&live=0' — substitute and put in an iframe; the page renders signed in as that demo role without touching the tester's own session. Both sites are on imagine-os.github.io (same origin).

export const HUB_LENS_IDS: readonly HubLensId[] = ['aluzina', 'between-gigs', 'standalone'];
