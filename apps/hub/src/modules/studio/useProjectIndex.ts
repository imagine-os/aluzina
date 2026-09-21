import { useMemo } from 'react';
import { useTable } from '../../data/DataContext';
import type { Project } from '../../data/schema';

export interface ProjectIndex {
  projects: Project[];
  byId: Map<string, Project>;
  /** Project name for a (possibly null) id; falls back to the id so nothing renders blank. */
  nameOf: (id: string | null | undefined) => string;
  /** Options for a project Select, already sorted by name. */
  options: { value: string; label: string }[];
  loading: boolean;
}

/** Every studio page names projects; this keeps the lookup in one place (S-01..S-09). */
export function useProjectIndex(fallback = '—'): ProjectIndex {
  const { rows, loading } = useTable('projects', { orderBy: 'name' });
  return useMemo(() => {
    const byId = new Map(rows.map((p) => [p.id, p]));
    return {
      projects: rows,
      byId,
      nameOf: (id) => (id ? (byId.get(id)?.name ?? id) : fallback),
      options: rows.map((p) => ({ value: p.id, label: p.name })),
      loading,
    };
  }, [rows, loading, fallback]);
}
