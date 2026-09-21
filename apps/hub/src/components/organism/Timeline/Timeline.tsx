import { useMemo } from 'react';
import { cx } from '../../../design/cx';
import { formatDate } from '../../../i18n/format';
import { useT } from '../../../i18n/I18nProvider';
import type { Tone } from '../../atom/Badge/Badge';
import './Timeline.css';

export interface TimelineRow {
  id: string;
  label: string;
  /** `YYYY-MM-DD` */
  start: string;
  end: string;
  dependsOn?: string[];
  tone?: Tone;
  /** Short text at the end of the bar (status, owner). */
  meta?: string;
}

export interface TimelineProps {
  rows: TimelineRow[];
  label: string;
  /** `YYYY-MM-DD`; marks today. Defaults to the current date. */
  today?: string;
  onActivate?: (row: TimelineRow) => void;
}

const DAY = 86_400_000;
const toMs = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).getTime();

/**
 * Rows with date-range bars on a shared scale; dependencies are listed under the label and marked on the bar.
 * Bars are positioned in percent, so it works from 360 to 3840; under 768 the label sits above the bar.
 */
export function Timeline({ rows, label, today, onActivate }: TimelineProps) {
  const { t, lang } = useT();
  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const { min, max, months } = useMemo(() => {
    if (rows.length === 0) return { min: 0, max: 1, months: [] as { label: string; left: number }[] };
    const starts = rows.map((r) => toMs(r.start));
    const ends = rows.map((r) => toMs(r.end));
    const lo = Math.min(...starts) - 2 * DAY;
    const hi = Math.max(...ends) + 2 * DAY;
    const ms: { label: string; left: number }[] = [];
    const d = new Date(lo);
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    while (d.getTime() < hi) {
      ms.push({ label: new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { month: 'short' }).format(d), left: ((d.getTime() - lo) / (hi - lo)) * 100 });
      d.setMonth(d.getMonth() + 1);
    }
    return { min: lo, max: hi, months: ms };
  }, [rows, lang]);
  const pct = (iso: string) => Math.min(100, Math.max(0, ((toMs(iso) - min) / (max - min)) * 100));
  const todayIso = today ?? new Date().toISOString().slice(0, 10);
  const todayPct = toMs(todayIso) >= min && toMs(todayIso) <= max ? pct(todayIso) : null;

  return (
    <div className="timeline" role="group" aria-label={label}>
      <div className="timeline__axis" aria-hidden="true">
        <span className="timeline__axis-label" />
        <span className="timeline__axis-track">
          {months.map((m) => (
            <span key={m.left} className="timeline__month" style={{ left: `${m.left}%` }}>
              {m.label}
            </span>
          ))}
        </span>
      </div>
      <ol className="timeline__rows">
        {rows.map((r) => {
          const left = pct(r.start);
          const width = Math.max(1.5, pct(r.end) - left);
          const deps = (r.dependsOn ?? []).map((id) => byId.get(id)?.label ?? id);
          const Bar = onActivate ? 'button' : 'div';
          return (
            <li key={r.id} className="timeline__row">
              <div className="timeline__label">
                <span className="timeline__name">{r.label}</span>
                <span className="timeline__dates">
                  {formatDate(r.start, lang, { day: 'numeric', month: 'short' })} – {formatDate(r.end, lang, { day: 'numeric', month: 'short' })}
                </span>
                {deps.length > 0 && (
                  <span className="timeline__deps" data-depends={r.dependsOn?.join(' ')}>
                    ↳ {t('core.timeline.dependsOn', { items: deps.join(', ') })}
                  </span>
                )}
              </div>
              <div className="timeline__track">
                {todayPct !== null && <span className="timeline__today" style={{ left: `${todayPct}%` }} aria-hidden="true" />}
                <Bar
                  type={onActivate ? 'button' : undefined}
                  className={cx('timeline__bar', `timeline__bar--${r.tone ?? 'neutral'}`, deps.length > 0 && 'timeline__bar--dep')}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  onClick={onActivate ? () => onActivate(r) : undefined}
                  aria-label={onActivate ? r.label : undefined}
                >
                  {r.meta && <span className="timeline__meta">{r.meta}</span>}
                </Bar>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
