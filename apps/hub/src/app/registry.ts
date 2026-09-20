import { coreStrings } from '../i18n/core';
import type { StringTable } from '../i18n/types';
import type { RouteDef } from '../specs/PageSpec';

interface ModuleExports {
  routes: RouteDef[];
  strings: StringTable;
}

/** Modules register themselves by existing: nobody edits this file to add a page. */
const modules = import.meta.glob<ModuleExports>('../modules/*/index.ts', { eager: true });

export const routes: RouteDef[] = Object.values(modules).flatMap((m) => m.routes);

export const strings: StringTable = Object.assign({}, coreStrings, ...Object.values(modules).map((m) => m.strings));
