import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTable } from '../../data/DataContext';
import type { Asset, Project, Relation } from '../../data/schema';
import { DELIVERY_STAGES, compareFolderPaths, fileTypeOf, lifecycleOf, type DeliveryStage, type FileType, type Lifecycle } from '../../domain';

/** One place for the archive's derived reads, so S-12 and S-13 count files the same way. */
export interface ArchiveData {
  projects: Project[];
  /** Files of a project, already sorted by folder order then name. */
  filesByProject: Map<string, Asset[]>;
  assetsById: Map<string, Asset>;
  loading: boolean;
}

/** Files sort in the studio's own folder order (`compareFolderPaths`), then by name inside a folder. */
function byFolderThenName(a: Asset, b: Asset): number {
  const folder = compareFolderPaths(a.folderPath ?? '', b.folderPath ?? '');
  if (folder !== 0) return folder;
  return (a.title || a.slug).localeCompare(b.title || b.slug, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Projects, their archived files and the `belongs-to` relations that connect them, as maps built once.
 * Every project is returned, not only the archived ones: the browser's point is that you can see
 * everything and then narrow it (Justin, #past-projects).
 */
export function useArchiveData(): ArchiveData {
  const projects = useTable('projects');
  const files = useTable('assets', { where: { kind: 'file' } });
  const relations = useTable('relations', { where: { kind: 'belongs-to' } });

  return useMemo(() => {
    const assetsById = new Map(files.rows.map((a) => [a.id, a]));
    const filesByProject = new Map<string, Asset[]>();
    for (const rel of relations.rows as Relation[]) {
      if (rel.fromType !== 'assets' || rel.toType !== 'projects') continue;
      const asset = assetsById.get(rel.fromId);
      if (!asset) continue;
      const list = filesByProject.get(rel.toId);
      if (list) list.push(asset);
      else filesByProject.set(rel.toId, [asset]);
    }
    for (const list of filesByProject.values()) list.sort(byFolderThenName);
    return {
      projects: projects.rows as Project[],
      filesByProject,
      assetsById,
      loading: projects.loading || files.loading || relations.loading,
    };
  }, [projects.rows, projects.loading, files.rows, files.loading, relations.rows, relations.loading]);
}

/** The lifecycle a project sits in (`prospect | active | past`), from its pipeline status. */
export function lifecycleOfProject(project: Project): Lifecycle {
  return lifecycleOf(project.pipelineStatus);
}

/** The file type of an asset: its own extension when it has one, else the mime family. */
export function fileTypeOfAsset(asset: Asset): FileType {
  return fileTypeOf(asset.slug.includes('.') ? asset.slug : asset.title || asset.mimeType);
}

/** Delivery stage of a file: the stored `stage` when the seed set one, else `'other'`. */
export function stageOfAsset(asset: Asset): DeliveryStage {
  return (asset.stage ?? 'other') as DeliveryStage;
}

/** Up to four file-type icons for a project without a cover, most common first (the mosaic on S-12). */
export function topFileTypes(files: readonly Asset[], max = 4): FileType[] {
  const counts = new Map<FileType, number>();
  for (const f of files) {
    const type = fileTypeOfAsset(f);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([type]) => type);
}

/** Stages that actually hold files, in delivery order, with their counts. */
export function stageCounts(files: readonly Asset[]): { stage: DeliveryStage; count: number }[] {
  const counts = new Map<DeliveryStage, number>();
  for (const f of files) {
    const s = stageOfAsset(f);
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return DELIVERY_STAGES.map((s) => ({ stage: s.id, count: counts.get(s.id) ?? 0 }));
}

// ---------------------------------------------------------------------------------------------
// Portfolio set: the projects the studio is assembling to show one client
// ---------------------------------------------------------------------------------------------

export const SET_STORAGE_KEY = 'aluzina.archive.set';
const SET_EVENT = 'aluzina:archive-set';

function readSet(): string[] {
  try {
    const raw = localStorage.getItem(SET_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeSet(ids: string[]): void {
  try {
    localStorage.setItem(SET_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable (private window): the set stays in memory for this page */
  }
  window.dispatchEvent(new CustomEvent(SET_EVENT));
}

export interface PortfolioSet {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean;
  add: (id: string) => boolean;
  clear: () => void;
}

/**
 * The portfolio set lives in `localStorage` so it survives a reload and is shared by S-12 and S-13;
 * a window event keeps two mounted pages (and two tabs, through `storage`) in step. It is the only
 * write this module makes (D-026 keeps real collections in Spaces, which is the queued next step).
 */
export function usePortfolioSet(): PortfolioSet {
  const [ids, setIds] = useState<string[]>(readSet);

  useEffect(() => {
    const sync = () => setIds(readSet());
    window.addEventListener(SET_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SET_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const next = readSet();
    const i = next.indexOf(id);
    if (i === -1) next.push(id);
    else next.splice(i, 1);
    writeSet(next);
    return i === -1;
  }, []);

  const add = useCallback((id: string) => {
    const next = readSet();
    if (next.includes(id)) return false;
    next.push(id);
    writeSet(next);
    return true;
  }, []);

  const clear = useCallback(() => writeSet([]), []);

  return { ids, has, toggle, add, clear };
}

/** Bytes as a short human string; `null` when the crawler did not record a size. */
export function formatBytes(bytes: number | null, lang: 'en' | 'es'): string | null {
  if (bytes === null || bytes <= 0) return null;
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = value < 10 && unit > 0 ? 1 : 0;
  return `${value.toLocaleString(lang === 'es' ? 'es-CO' : 'en-US', { maximumFractionDigits: digits })} ${units[unit]}`;
}

/** The extension of a file, upper-cased, for the Thumb badge; empty when the name has none. */
export function extOf(asset: Asset): string {
  const name = asset.slug.includes('.') ? asset.slug : asset.title;
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toUpperCase() : '';
}
