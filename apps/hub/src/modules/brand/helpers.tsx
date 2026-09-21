import type { ReactNode } from 'react';
import type { CompetitionStatus, PresentationStatus, RevisionStatus } from '../../data/schema';
import { daysUntil } from '../../i18n/format';
import type { Tone } from '../../components/atom/Badge/Badge';

/**
 * Small shared bits of the brand module. The rule that matters here: a fact nobody has told us
 * stays null in the data and renders as "unknown" (docs/knowledge/competitions.md), never as a
 * placeholder date, a zero or an invented name.
 */

/** Renders `value` or the translated "unknown" marker when it is empty. */
export function unknownable(value: string | number | null | undefined, unknownLabel: string): ReactNode {
  if (value === null || value === undefined || value === '' || value === 0) {
    return <span className="brand-unknown">{unknownLabel}</span>;
  }
  return value;
}

export const COMPETITION_FLOW: readonly CompetitionStatus[] = ['slot', 'researching', 'preparing', 'ready', 'submitted', 'result'];
export const PRESENTATION_FLOW: readonly PresentationStatus[] = ['requested', 'drafting', 'review', 'final'];
export const REVISION_FLOW: readonly RevisionStatus[] = ['requested', 'in-progress', 'delivered', 'approved'];

/** Next status along a flow, or null at the end of it. */
export function nextStatus<T extends string>(flow: readonly T[], current: T): T | null {
  const i = flow.indexOf(current);
  return i === -1 || i === flow.length - 1 ? null : flow[i + 1];
}

/** Tone for a due date: past is danger, within a week is warning, otherwise neutral. */
export function dueTone(iso: string | null | undefined): Tone {
  if (!iso) return 'neutral';
  const d = daysUntil(iso);
  if (d < 0) return 'danger';
  if (d <= 7) return 'warning';
  return 'neutral';
}

export function isOverdue(iso: string | null | undefined): boolean {
  return !!iso && daysUntil(iso) < 0;
}

/**
 * Sort key that keeps "organized by submission date" honest: dated rows first in date order,
 * undated rows last (the seeded 2027 slots have no dates yet).
 */
export function byDateThen<T>(date: (row: T) => string | null, tiebreak: (row: T) => number | string) {
  return (a: T, b: T): number => {
    const da = date(a);
    const db = date(b);
    if (da !== db) {
      if (!da) return 1;
      if (!db) return -1;
      return da < db ? -1 : 1;
    }
    const ta = tiebreak(a);
    const tb = tiebreak(b);
    return ta === tb ? 0 : ta < tb ? -1 : 1;
  };
}
