import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../../design/cx';
import type { Task } from '../../../data/schema';
import { useT } from '../../../i18n/I18nProvider';
import { useWorkLabels } from '../../../work/labels';
import { childCounts, isOverdue, sortTasks, topLevel, type SortBy, type TimelineZoom, type WorkContext, type WorkGroup } from '../../../work/model';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge, type Tone } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { ToggleButton } from '../../atom/ToggleButton/ToggleButton';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './WorkTimeline.css';

export interface WorkTimelineProps {
  label: string;
  groups: WorkGroup[];
  ctx: WorkContext;
  sort: SortBy;
  zoom: TimelineZoom;
  onZoom: (zoom: TimelineZoom) => void;
  onOpen: (task: Task) => void;
}

const DAY = 86_400_000;
const ZOOMS: readonly TimelineZoom[] = ['day', 'week', 'month'];
/** Width of one day per zoom, in rem (so the `--scale` bands keep it legible on a TV). */
const DAY_REM: Record<TimelineZoom, number> = { day: 3, week: 1, month: 0.3 };
const LEFT_REM = 16;

const toMs = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).getTime();
const toIso = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface TaskRow {
  kind: 'task';
  task: Task;
  /** Day index of the bar start and end (inclusive); equal for a milestone. */
  start: number;
  end: number;
  milestone: boolean;
  tone: Tone;
  /** Nested tasks under this one (D-062); they have no bar of their own. */
  children: number;
}
interface GroupRow {
  kind: 'group';
  group: WorkGroup;
  start: number | null;
  end: number | null;
}
type Row = TaskRow | GroupRow;

function toneOf(task: Task, today: string): Tone {
  if (task.status === 'done') return 'success';
  if (isOverdue(task, today)) return 'danger';
  if (task.status === 'blocked') return 'warning';
  if (task.status === 'doing') return 'accent';
  return 'neutral';
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/**
 * Gantt (D-021): one row per task grouped by section, bars from startDate to dueDate, milestones for
 * due-only tasks, today line, Day | Week | Month zoom, dependency arrows drawn from `dependsOn`, overdue
 * and blocked tones; the left task column and the axis stay sticky while the chart scrolls inside its
 * own container (the page never scrolls sideways). Bars are buttons (44 px targets, arrows move between
 * them, Enter opens); dates are edited in the drawer, never by drag only (P-03). Under 768 px the chart
 * falls back to a list with percent-based mini bars.
 */
export function WorkTimeline({ label, groups, ctx, sort, zoom, onZoom, onOpen }: WorkTimelineProps) {
  const { t, lang } = useT();
  const labels = useWorkLabels(ctx.people);
  const compact = useMediaQuery('(max-width: 767.98px)');
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const { rows, lo, days, undated, months, ticks, todayIdx } = useMemo(() => {
    // Only top-level tasks get a bar (D-062); a parent's bar names how many children it carries.
    const kids = childCounts(groups.flatMap((g) => g.tasks));
    const dated: Task[] = [];
    let undatedCount = 0;
    for (const g of groups) for (const x of topLevel(g.tasks)) (x.dueDate || x.startDate ? dated : (undatedCount += 1, [])).push(x);
    const todayMs = toMs(ctx.today);
    let loMs = todayMs - 7 * DAY;
    let hiMs = todayMs + 14 * DAY;
    for (const x of dated) {
      const s = toMs(x.startDate ?? x.dueDate!);
      const e = toMs(x.dueDate ?? x.startDate!);
      loMs = Math.min(loMs, s - 7 * DAY);
      hiMs = Math.max(hiMs, e + 14 * DAY);
    }
    // Snap the range to Mondays so week ticks line up.
    const loDate = new Date(loMs);
    loDate.setDate(loDate.getDate() - ((loDate.getDay() + 6) % 7));
    loMs = loDate.getTime();
    const idx = (iso: string) => Math.round((toMs(iso) - loMs) / DAY);
    const total = Math.round((hiMs - loMs) / DAY) + 7;

    const rows: Row[] = [];
    for (const g of groups) {
      const list = sortTasks(topLevel(g.tasks), sort, ctx).filter((x) => x.dueDate || x.startDate);
      if (list.length === 0) continue;
      const taskRows: TaskRow[] = list.map((x) => {
        const start = idx(x.startDate ?? x.dueDate!);
        const end = Math.max(start, idx(x.dueDate ?? x.startDate!));
        return { kind: 'task', task: x, start, end, milestone: !x.startDate || x.startDate === x.dueDate, tone: toneOf(x, ctx.today), children: kids[x.id] ?? 0 };
      });
      rows.push({ kind: 'group', group: g, start: Math.min(...taskRows.map((r) => r.start)), end: Math.max(...taskRows.map((r) => r.end)) });
      rows.push(...taskRows);
    }

    const fmtMonth = new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { month: 'short', year: 'numeric' });
    const months: { idx: number; span: number; label: string }[] = [];
    const m = new Date(loMs);
    m.setDate(1);
    while (m.getTime() < loMs + total * DAY) {
      const startIdx = Math.max(0, Math.round((m.getTime() - loMs) / DAY));
      const next = new Date(m);
      next.setMonth(next.getMonth() + 1);
      const endIdx = Math.min(total, Math.round((next.getTime() - loMs) / DAY));
      months.push({ idx: startIdx, span: endIdx - startIdx, label: fmtMonth.format(m) });
      m.setMonth(m.getMonth() + 1);
    }
    const ticks: { idx: number; label: string }[] = [];
    if (zoom === 'day') for (let i = 0; i < total; i += 1) ticks.push({ idx: i, label: String(new Date(loMs + i * DAY).getDate()) });
    else if (zoom === 'week') for (let i = 0; i < total; i += 7) ticks.push({ idx: i, label: String(new Date(loMs + i * DAY).getDate()) });

    return { rows, lo: loMs, days: total, undated: undatedCount, months, ticks, todayIdx: idx(ctx.today) };
  }, [groups, sort, ctx, zoom, lang]);

  const rowIndex = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r, i) => r.kind === 'task' && map.set(r.task.id, i));
    return map;
  }, [rows]);

  const arrows = useMemo(() => {
    const out: { id: string; d: string; x: number; y: number }[] = [];
    rows.forEach((r, i) => {
      if (r.kind !== 'task') return;
      for (const depId of r.task.dependsOn) {
        const j = rowIndex.get(depId);
        const dep = j === undefined ? undefined : (rows[j] as TaskRow);
        if (!dep) continue;
        const x1 = dep.end + 1;
        const y1 = j! + 0.5;
        const x2 = r.start;
        const y2 = i + 0.5;
        const xm = x2 > x1 ? (x1 + x2) / 2 : x1 + 0.5;
        out.push({ id: `${depId}-${r.task.id}`, d: `M ${x1} ${y1} H ${xm} V ${y2} H ${x2}`, x: x2, y: i });
      }
    });
    return out;
  }, [rows, rowIndex]);

  // Keep today about a third in from the left of the visible chart on mount and zoom change.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || compact) return;
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const todayPx = todayIdx * DAY_REM[zoom] * fs;
    el.scrollLeft = Math.max(0, todayPx - (el.clientWidth - LEFT_REM * fs) / 3);
  }, [zoom, todayIdx, compact]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('work-tl__bar')) return;
    const bars = [...(rootRef.current?.querySelectorAll<HTMLElement>('.work-tl__bar') ?? [])];
    const i = bars.indexOf(target);
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = i + 1;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = bars.length - 1;
    else return;
    e.preventDefault();
    bars[next]?.focus();
  };

  const scrollToToday = () => {
    const el = scrollRef.current;
    if (!el) return;
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    el.scrollTo({ left: Math.max(0, todayIdx * DAY_REM[zoom] * fs - (el.clientWidth - LEFT_REM * fs) / 3), behavior: 'smooth' });
  };

  const barLabel = (r: TaskRow) =>
    r.milestone
      ? t('core.work.timelineMilestone', { title: r.task.title || t('core.work.untitled'), date: labels.date(r.task.dueDate ?? r.task.startDate) })
      : t('core.work.timelineBar', { title: r.task.title || t('core.work.untitled'), start: labels.date(r.task.startDate), end: labels.date(r.task.dueDate) });

  // Nothing dated is not the same as nothing matching: an imported project starts with no dates at all.
  if (rows.length === 0) {
    return undated > 0 ? (
      <EmptyState title={t('core.work.noDatesTitle')} description={`${t('core.work.noDates', { n: undated })}. ${t('core.work.noDatesHint')}`} glyph="▭" />
    ) : (
      <EmptyState title={t('core.work.empty')} description={t('core.work.emptyHint')} glyph="▭" />
    );
  }

  const toolbar = (
    <div className="work-tl__bar-row">
      <div className="work-tl__zoom" role="group" aria-label={t('core.work.zoom')}>
        {ZOOMS.map((z) => (
          <ToggleButton key={z} label={`${t('core.work.zoom')}: ${t(`core.work.zoom.${z}`)}`} pressed={zoom === z} onClick={() => onZoom(z)}>
            {t(`core.work.zoom.${z}`)}
          </ToggleButton>
        ))}
      </div>
      {!compact && (
        <Button variant="ghost" onClick={scrollToToday}>
          {t('core.work.goToday')}
        </Button>
      )}
      <span className="work-tl__note">
        {undated > 0 && <span>{t('core.work.noDates', { n: undated })}</span>}
        {!compact && <span className="work-tl__hint">{t('core.work.keyboardHint')}</span>}
      </span>
    </div>
  );

  if (compact) {
    const pct = (i: number) => (i / days) * 100;
    return (
      <div ref={rootRef} className="work-tl work-tl--compact" role="group" aria-label={label} onKeyDown={onKey}>
        {toolbar}
        <ol className="work-tl__mini">
          {rows.map((r, i) =>
            r.kind === 'group' ? (
              <li key={`g-${r.group.id}`} className="work-tl__mini-group">
                {r.group.label} <Badge tone={r.group.tone ?? 'neutral'}>{r.group.tasks.length}</Badge>
              </li>
            ) : (
              <li key={r.task.id} className="work-tl__mini-row">
                <div className="work-tl__mini-label">
                  <span className="work-tl__name">{r.task.title || t('core.work.untitled')}</span>
                  <span className="work-tl__dates">{r.milestone ? labels.date(r.task.dueDate ?? r.task.startDate) : `${labels.date(r.task.startDate)} – ${labels.date(r.task.dueDate)}`} · {labels.person(r.task.assigneeId)}</span>
                  {r.children > 0 && <span className="work-tl__deps-text">{t('core.work.childCountLabel', { n: r.children })}</span>}
                  {r.task.dependsOn.length > 0 && <span className="work-tl__deps-text">↳ {t('core.work.dependsOnCount', { n: r.task.dependsOn.length })}</span>}
                </div>
                <div className="work-tl__mini-track">
                  <span className="work-tl__today" style={{ left: `${pct(todayIdx)}%` }} aria-hidden="true" />
                  <button type="button" className={cx('work-tl__bar', `work-tl__bar--${r.tone}`, r.milestone && 'work-tl__bar--milestone')} style={{ left: `${pct(r.start)}%`, width: r.milestone ? undefined : `${Math.max(1.5, pct(r.end + 1) - pct(r.start))}%` }} aria-label={barLabel(r)} data-row={i} onClick={() => onOpen(r.task)}>
                    <span className="work-tl__fill" />
                  </button>
                </div>
              </li>
            ),
          )}
        </ol>
      </div>
    );
  }

  const dayVar = { ['--tl-day' as string]: `${DAY_REM[zoom]}rem`, ['--tl-left' as string]: `${LEFT_REM}rem` };
  const x = (i: number) => `calc(${i} * var(--tl-day))`;

  return (
    <div ref={rootRef} className="work-tl" role="group" aria-label={label} style={dayVar} onKeyDown={onKey}>
      {toolbar}
      <div ref={scrollRef} className="work-tl__scroll">
        <div className="work-tl__grid" style={{ width: `calc(var(--tl-left) + ${days} * var(--tl-day))` }}>
          <div className="work-tl__axis" aria-hidden="true">
            <div className="work-tl__corner" />
            <div className="work-tl__axis-track">
              {months.map((m) => (
                <span key={m.idx} className="work-tl__month" style={{ left: x(m.idx), width: x(m.span) }}>
                  {m.label}
                </span>
              ))}
              {ticks.map((k) => (
                <span key={k.idx} className={cx('work-tl__tick', zoom === 'day' && 'work-tl__tick--day')} style={{ left: x(k.idx), width: x(zoom === 'day' ? 1 : 7) }}>
                  {k.label}
                </span>
              ))}
            </div>
          </div>
          <div className="work-tl__rows">
            <span className="work-tl__today work-tl__today--tall" style={{ left: `calc(var(--tl-left) + ${x(todayIdx)})` }} aria-hidden="true">
              <span className="work-tl__today-label">{t('core.work.today')} · {labels.date(toIso(lo + todayIdx * DAY))}</span>
            </span>
            <svg className="work-tl__deps" viewBox={`0 0 ${days} ${rows.length}`} preserveAspectRatio="none" aria-hidden="true" style={{ width: x(days), height: `calc(${rows.length} * var(--tl-row))` }}>
              {arrows.map((a) => (
                <path key={a.id} d={a.d} vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
            {arrows.map((a) => (
              <span key={`h-${a.id}`} className="work-tl__arrowhead" aria-hidden="true" style={{ left: `calc(var(--tl-left) + ${x(a.x)})`, top: `calc(${a.y} * var(--tl-row) + var(--tl-row) / 2)` }} />
            ))}
            {rows.map((r, i) =>
              r.kind === 'group' ? (
                <div key={`g-${r.group.id}`} className="work-tl__row work-tl__row--group">
                  <div className="work-tl__left">
                    <span className="work-tl__group-name">{r.group.label}</span>
                    <Badge tone={r.group.tone ?? 'neutral'}>{r.group.tasks.length}</Badge>
                  </div>
                  <div className="work-tl__track">{r.start !== null && r.end !== null && <span className="work-tl__summary" style={{ left: x(r.start), width: x(r.end - r.start + 1) }} />}</div>
                </div>
              ) : (
                <div key={r.task.id} className="work-tl__row">
                  <div className="work-tl__left">
                    <Avatar size="sm" name={labels.person(r.task.assigneeId)} initials={ctx.people.find((p) => p.id === r.task.assigneeId)?.initials} />
                    <span className="work-tl__left-text">
                      <span className="work-tl__name">{r.task.title || t('core.work.untitled')}</span>
                      <span className="work-tl__dates">
                        {r.milestone ? labels.date(r.task.dueDate ?? r.task.startDate) : `${labels.date(r.task.startDate)} – ${labels.date(r.task.dueDate)}`}
                        {r.children > 0 && ` · ${t('core.work.childCountLabel', { n: r.children })}`}
                      </span>
                    </span>
                  </div>
                  <div className="work-tl__track">
                    <button type="button" className={cx('work-tl__bar', `work-tl__bar--${r.tone}`, r.milestone && 'work-tl__bar--milestone')} style={{ left: x(r.start), width: r.milestone ? undefined : x(r.end - r.start + 1) }} aria-label={barLabel(r)} data-row={i} onClick={() => onOpen(r.task)} title={barLabel(r)}>
                      <span className="work-tl__fill">{!r.milestone && <span className="work-tl__fill-text">{r.task.title || t('core.work.untitled')}</span>}</span>
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
