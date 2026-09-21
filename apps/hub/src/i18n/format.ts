import type { Lang } from './types';

const LOCALE: Record<Lang, string> = { en: 'en-US', es: 'es-CO' };

/** Colombian pesos, no decimals: `$ 18.400.000` (es) / `COP 18,400,000` (en). */
export function formatCop(amount: number, lang: Lang = 'es'): string {
  return new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

/** `YYYY-MM-DD` or ISO date-time -> short date in the current language; `null` -> em dash. */
export function formatDate(iso: string | null | undefined, lang: Lang = 'en', opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  if (!iso) return '—';
  const d = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALE[lang], opts).format(d);
}

export function formatDateTime(iso: string | null | undefined, lang: Lang = 'en'): string {
  return formatDate(iso, lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Whole days from today (local) to `iso`; negative when past. */
export function daysUntil(iso: string, today = new Date()): number {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  return Math.round((d.getTime() - t.getTime()) / 86_400_000);
}
