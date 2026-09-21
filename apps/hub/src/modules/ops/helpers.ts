import { useMemo } from 'react';
import type { Tone } from '../../components/atom/Badge/Badge';
import { demoUserById } from '../../auth/demoUsers';
import { useTable } from '../../data/DataContext';
import { daysUntil } from '../../i18n/format';

/** Today as `YYYY-MM-DD` (local), the reference date for every "due" calculation in this module. */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Live name lookups shared by the ops pages (projects and suppliers are read-only here). */
export function useLookups() {
  const { rows: projects } = useTable('projects', { orderBy: 'name' });
  const { rows: suppliers } = useTable('suppliers', { orderBy: 'name' });
  return useMemo(() => {
    const byProject = new Map(projects.map((p) => [p.id, p.name]));
    const bySupplier = new Map(suppliers.map((s) => [s.id, s.name]));
    return {
      projects,
      suppliers,
      projectName: (id: string | null | undefined): string | null => (id ? byProject.get(id) ?? id : null),
      supplierName: (id: string | null | undefined): string | null => (id ? bySupplier.get(id) ?? id : null),
      userName: (id: string): string => demoUserById(id)?.name ?? id,
    };
  }, [projects, suppliers]);
}

/** "Due today" / "in n days" / "n days overdue", already translated. */
export function dueLabel(iso: string | null | undefined, t: (key: string, vars?: Record<string, string | number>) => string): string {
  if (!iso) return t('ops.common.noDate');
  const n = daysUntil(iso);
  if (n === 0) return t('ops.common.dueToday');
  if (n < 0) return t('ops.common.overdueBy', { n: -n });
  return t('ops.common.inDays', { n });
}

/** Tone for a date: past is danger, inside the lead window is warning, else neutral. */
export function dueTone(iso: string | null | undefined, leadDays = 7): Tone {
  if (!iso) return 'neutral';
  const n = daysUntil(iso);
  if (n < 0) return 'danger';
  if (n <= leadDays) return 'warning';
  return 'neutral';
}

/** Outstanding balance of a payment row. */
export function outstanding(row: { amountCop: number; paidCop: number }): number {
  return Math.max(0, row.amountCop - row.paidCop);
}

/** `YYYY-MM` of an ISO date or date-time. */
export function monthOf(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 7) : '';
}
