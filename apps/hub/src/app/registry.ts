import { withDeskActions } from '../desk/actions';
import { deskStrings } from '../desk/strings';
import { coreStrings } from '../i18n/core';
import type { StringTable } from '../i18n/types';
import type { RouteDef, RouteDeskOverride } from '../specs/PageSpec';

interface ModuleExports {
  routes: RouteDef[];
  strings: StringTable;
  /** Page desk overrides by page code (D-106): `{ 'W-04': { self: true } }`. */
  desk?: Record<string, RouteDeskOverride>;
}

/** Modules register themselves by existing: nobody edits this file to add a page (src/modules/README.md). */
const modules = import.meta.glob<ModuleExports>('../modules/*/index.ts', { eager: true });

/**
 * Every route, with its module's desk override (by page code) and, when the shell mounts a page desk above it, the
 * shared `desk.*` actions appended to its spec (D-106).
 */
const all = Object.values(modules).flatMap((m) => m.routes.map((r) => withDeskActions(r.desk || !m.desk?.[r.code] ? r : { ...r, desk: m.desk[r.code] })));

/** One route per path; when two modules declare the same path a built route wins over a stub. */
const byPath = new Map<string, RouteDef>();
for (const r of all) {
  const prev = byPath.get(r.path);
  if (!prev || (prev.status === 'stub' && r.status === 'built')) byPath.set(r.path, r);
  else if (import.meta.env.DEV) console.warn(`[registry] duplicate route ${r.path}: keeping ${prev.code}, ignoring ${r.code}`);
}

export const routes: RouteDef[] = [...byPath.values()];

export const strings: StringTable = Object.assign({}, coreStrings, deskStrings, ...Object.values(modules).map((m) => m.strings));

/** Routes of one surface that have a menu entry, sorted by nav order (shells). */
export function navRoutesFor(surface: string, from: RouteDef[] = routes): RouteDef[] {
  return from.filter((r) => r.surface === surface && r.nav).sort((a, b) => (a.nav?.order ?? 100) - (b.nav?.order ?? 100));
}
