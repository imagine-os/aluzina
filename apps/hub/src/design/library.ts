import type { ComponentType } from 'react';
import type { ComponentMeta, Tier } from './meta';

/**
 * The component library as data (P-07): every `<Name>.meta.ts` and its optional `<Name>.example.tsx`
 * under src/components/<tier>/<Name>/ is picked up here. Nobody edits this file to add a component.
 */
const metas = import.meta.glob<{ default: ComponentMeta }>('../components/*/*/*.meta.ts', { eager: true });
const examples = import.meta.glob<{ default: ComponentType }>('../components/*/*/*.example.tsx', { eager: true });

export interface LibraryEntry {
  meta: ComponentMeta;
  /** Folder path relative to src/, e.g. `components/atom/Button`. */
  path: string;
  Example?: ComponentType;
}

export const TIERS: readonly Tier[] = ['atom', 'molecule', 'organism', 'template'];

function folderOf(modulePath: string): string {
  return modulePath.replace(/^\.\.\//, '').replace(/\/[^/]+$/, '');
}

const exampleByFolder = new Map(Object.entries(examples).map(([p, m]) => [folderOf(p), m.default]));

export const library: LibraryEntry[] = Object.entries(metas)
  .map(([p, m]) => ({ meta: m.default, path: folderOf(p), Example: exampleByFolder.get(folderOf(p)) }))
  .sort((a, b) => TIERS.indexOf(a.meta.tier) - TIERS.indexOf(b.meta.tier) || a.meta.name.localeCompare(b.meta.name));

export function libraryByTier(): Record<Tier, LibraryEntry[]> {
  const out = { atom: [], molecule: [], organism: [], template: [] } as Record<Tier, LibraryEntry[]>;
  for (const e of library) out[e.meta.tier].push(e);
  return out;
}
