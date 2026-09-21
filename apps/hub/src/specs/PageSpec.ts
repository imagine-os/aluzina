import type { ReactElement } from 'react';

/**
 * Surfaces: the hub, one per portal (D-014), the client app, dev tools, docs / manual and bare public pages.
 * A route's surface decides which sidebar it appears in (DesktopShell groups the routes of the current surface).
 */
export type Surface = 'hub' | 'founder' | 'ops' | 'studio' | 'brand' | 'client' | 'dev' | 'design' | 'docs' | 'manual' | 'public';

export const SURFACES: readonly Surface[] = ['hub', 'founder', 'ops', 'studio', 'brand', 'client', 'dev', 'design', 'docs', 'manual', 'public'];

export type ParamType = 'string' | 'number' | 'id' | 'date' | 'boolean' | `enum:${string}`;

/**
 * One entry per button / menu item / form submit on a page (P-05).
 * `id` is `<module>.<verb>`, `intent` is what a person would say,
 * `permission` is the string the page checks. This is the WebMCP / voice vocabulary.
 */
export interface ActionDef {
  id: string;
  label: string;
  intent: string;
  permission?: string;
  params?: Record<string, ParamType>;
}

export interface PageSpec {
  /** Page code, e.g. `O-01` (prefixes: `docs/README.md`). */
  code: string;
  name: string;
  purpose: string;
  surface: Surface;
  /** Sidebar group key from `src/app/navGroups.ts`; omit for detail pages that are not in the menu. */
  navGroup?: string;
  /** Top-to-bottom description of the layout. */
  layout: string[];
  /** Entities read / written through the DataProvider (`src/data/schema`). */
  dataTables: string[];
  /** Roles that use the page (documentation; the guard is `RouteDef.permission`). */
  roles: string[];
  logic: string[];
  /** Library components used (each has a `.meta.ts`). */
  components: string[];
  actions: ActionDef[];
  /** Widths (px) verified by a human or a screenshot pass (P-01). */
  checkedAt: number[];
  notes?: string[];
}

const REQUIRED: (keyof PageSpec)[] = ['code', 'name', 'purpose', 'surface', 'layout', 'dataTables', 'roles', 'logic', 'components', 'actions', 'checkedAt'];
const CODE_RE = /^(HUB|BOS|[PCAOSGMDWK])-\d{2}$/;

/** Validates the required fields once at module load, so a half-written spec fails fast in dev and in the smoke test. */
export function defineSpec(spec: PageSpec): PageSpec {
  const missing = REQUIRED.filter((k) => spec[k] === undefined || spec[k] === null);
  if (missing.length) throw new Error(`[spec] ${spec.code ?? '?'} is missing: ${missing.join(', ')}`);
  if (!CODE_RE.test(spec.code)) throw new Error(`[spec] "${spec.code}" is not a page code (e.g. O-01)`);
  if (!SURFACES.includes(spec.surface)) throw new Error(`[spec] ${spec.code}: unknown surface "${spec.surface}"`);
  for (const a of spec.actions) {
    if (!/^[a-z][a-z0-9]*\.[a-zA-Z][a-zA-Z0-9]*$/.test(a.id)) throw new Error(`[spec] ${spec.code}: action id "${a.id}" must be <module>.<verb>`);
  }
  return spec;
}

export type RouteStatus = 'built' | 'stub';
export type ShellKind = 'desktop' | 'phone' | 'bare';

export interface NavDef {
  /** String key rendered with useT(); the module's `strings` must define it. */
  labelKey: string;
  /** Sort order inside the group (lower first). */
  order?: number;
  /** Optional glyph (one or two characters) shown before the label. */
  glyph?: string;
}

export interface RouteDef {
  path: string;
  code: string;
  surface: Surface;
  status: RouteStatus;
  /** Permission checked by RequireRole; omit for public pages (the hub). */
  permission?: string;
  shell: ShellKind;
  spec: PageSpec;
  element: ReactElement;
  /** Present when the page has a sidebar / bottom-nav entry. */
  nav?: NavDef;
}

export interface SpecCompleteness {
  score: number;
  total: number;
  missing: string[];
}

/** What a spec still lacks to count as complete (used by /#/dev/specs, D-03). */
export function specCompleteness(route: RouteDef): SpecCompleteness {
  const s = route.spec;
  const checks: [string, boolean][] = [
    ['purpose', s.purpose.trim().length > 20],
    ['layout', s.layout.length > 0],
    ['roles', s.roles.length > 0],
    ['logic', s.logic.length > 0],
    ['components', s.components.length > 0],
    ['actions', s.actions.length > 0],
    ['checkedAt', s.checkedAt.length >= 3],
    ['navGroup', route.nav === undefined || s.navGroup !== undefined],
    ['built', route.status === 'built'],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([k]) => k);
  return { score: checks.length - missing.length, total: checks.length, missing };
}
