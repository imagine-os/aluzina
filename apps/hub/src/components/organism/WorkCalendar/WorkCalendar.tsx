import { useMemo } from 'react';
import type { Task } from '../../../data/schema';
import { useWorkLabels } from '../../../work/labels';
import { dueToneOf, type WorkContext } from '../../../work/model';
import { Calendar, type CalendarEvent } from '../Calendar/Calendar';
import './WorkCalendar.css';

export interface WorkCalendarProps {
  label: string;
  tasks: Task[];
  ctx: WorkContext;
  /** `YYYY-MM` */
  month: string;
  onMonthChange: (month: string) => void;
  onOpen: (task: Task) => void;
}

/** Tasks by due date on the library Calendar (D-021): one event per dated task, tone from overdue / status, assignee as meta. */
export function WorkCalendar({ label, tasks, ctx, month, onMonthChange, onOpen }: WorkCalendarProps) {
  const labels = useWorkLabels(ctx.people);
  const byId = useMemo(() => new Map(tasks.map((x) => [x.id, x])), [tasks]);
  const events = useMemo<CalendarEvent[]>(
    () =>
      tasks
        .filter((x) => x.dueDate)
        .map((x) => ({
          id: x.id,
          date: x.dueDate as string,
          title: x.title,
          meta: `${labels.person(x.assigneeId)} · ${labels.status(x.status)}`,
          tone: x.status === 'done' ? 'success' : x.status === 'blocked' ? 'warning' : dueToneOf(x, ctx.today) === 'danger' ? 'danger' : 'accent',
        })),
    [tasks, labels, ctx.today],
  );
  return (
    <div className="work-calendar">
      <Calendar label={label} month={month} onMonthChange={onMonthChange} events={events} today={ctx.today} onSelect={(e) => { const x = byId.get(e.id); if (x) onOpen(x); }} />
    </div>
  );
}
