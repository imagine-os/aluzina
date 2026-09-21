import { useMemo } from 'react';
import { formatDate } from '../../../i18n/format';
import { useT } from '../../../i18n/I18nProvider';
import { Badge, type Tone } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './Calendar.css';

export interface CalendarEvent {
  id: string;
  /** `YYYY-MM-DD` or ISO date-time. */
  date: string;
  title: string;
  meta?: string;
  tone?: Tone;
}

export interface CalendarProps {
  /** `YYYY-MM` */
  month: string;
  onMonthChange: (month: string) => void;
  events: CalendarEvent[];
  label: string;
  onSelect?: (event: CalendarEvent) => void;
  /** `YYYY-MM-DD`; defaults to now. */
  today?: string;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Month list view: prev / next / today controls, then one block per day that has events. Works at every width. */
export function Calendar({ month, onMonthChange, events, label, onSelect, today }: CalendarProps) {
  const { t, lang } = useT();
  const todayIso = today ?? new Date().toISOString().slice(0, 10);
  const days = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const day = e.date.slice(0, 10);
      if (!day.startsWith(month)) continue;
      const list = map.get(day) ?? [];
      list.push(e);
      map.set(day, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [events, month]);
  const monthLabel = new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`));

  return (
    <div className="calendar" role="group" aria-label={label}>
      <div className="calendar__head">
        <h3 className="calendar__month" aria-live="polite">{monthLabel}</h3>
        <div className="calendar__nav">
          <Button icon="‹" aria-label={t('core.calendar.prev')} onClick={() => onMonthChange(shiftMonth(month, -1))} />
          <Button onClick={() => onMonthChange(todayIso.slice(0, 7))}>{t('core.calendar.today')}</Button>
          <Button icon="›" aria-label={t('core.calendar.next')} onClick={() => onMonthChange(shiftMonth(month, 1))} />
        </div>
      </div>
      {days.length === 0 ? (
        <EmptyState title={t('core.calendar.empty')} glyph="▦" />
      ) : (
        <ol className="calendar__days">
          {days.map(([day, list]) => (
            <li key={day} className={`calendar__day${day === todayIso ? ' calendar__day--today' : ''}`}>
              <div className="calendar__date">
                <span className="calendar__dow">{formatDate(day, lang, { weekday: 'short' })}</span>
                <span className="calendar__num">{Number(day.slice(8, 10))}</span>
              </div>
              <ul className="calendar__events">
                {list.map((e) => {
                  const inner = (
                    <>
                      <span className="calendar__title">{e.title}</span>
                      {e.meta && <span className="calendar__meta">{e.meta}</span>}
                      {e.tone && <Badge tone={e.tone} dot>{e.date.length > 10 ? formatDate(e.date, lang, { hour: '2-digit', minute: '2-digit' }) : t('core.calendar.allDay')}</Badge>}
                    </>
                  );
                  return (
                    <li key={e.id}>
                      {onSelect ? (
                        <button type="button" className="calendar__event calendar__event--btn" onClick={() => onSelect(e)}>
                          {inner}
                        </button>
                      ) : (
                        <div className="calendar__event">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
