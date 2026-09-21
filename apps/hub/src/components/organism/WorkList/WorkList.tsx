import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../../design/cx';
import type { Priority, Task, TaskStatus } from '../../../data/schema';
import { useT } from '../../../i18n/I18nProvider';
import { useWorkLabels } from '../../../work/labels';
import { blockedBy, dueToneOf, PRIORITIES, PRIORITY_TONES, sortTasks, STATUSES, subtaskProgress, type SortBy, type WorkContext, type WorkGroup } from '../../../work/model';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { Checkbox } from '../../atom/Checkbox/Checkbox';
import { Input } from '../../atom/Input/Input';
import { Select } from '../../atom/Select/Select';
import { StatusPill } from '../../atom/StatusPill/StatusPill';
import { toast } from '../../atom/Toast/Toast';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './WorkList.css';

export interface WorkListProps {
  /** Accessible name of the list. */
  label: string;
  groups: WorkGroup[];
  ctx: WorkContext;
  sort: SortBy;
  canEdit: (task: Task) => boolean;
  canAdd?: boolean;
  onOpen: (task: Task) => void;
  /** Field edits (title, assignee, dates, status, priority, section) go through here, one row at a time. */
  onPatch: (task: Task, patch: Partial<Task>) => void | Promise<unknown>;
  onToggleComplete: (task: Task) => void | Promise<unknown>;
  onAdd?: (group: WorkGroup, title: string) => void;
  /** Show the project name on each row (multi-project lists). */
  showProject?: boolean;
}

const ROW = '.work-row:not(.work-row--add)';

/**
 * Asana-style list (D-021): collapsible groups, rows with inline title, assignee, due date, status and
 * priority editors, tags, subtask / dependency / comment indicators, multi-select with a bulk bar.
 * Keyboard on a focused row: arrows move, Enter opens, Space toggles complete, Shift+Space selects,
 * Shift+arrows extend the selection. Under 768 px each row becomes a card. Nothing is hover-only (P-03).
 */
export function WorkList({ label, groups, ctx, sort, canEdit, canAdd, onOpen, onPatch, onToggleComplete, onAdd, showProject }: WorkListProps) {
  const { t } = useT();
  const labels = useWorkLabels(ctx.people);
  const rootRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const byId = useMemo(() => new Map(groups.flatMap((g) => g.tasks).map((x) => [x.id, x])), [groups]);
  const total = groups.reduce((n, g) => n + g.tasks.length, 0);
  const visibleSelected = [...selected].map((id) => byId.get(id)).filter((x): x is Task => Boolean(x) && canEdit(x!));

  const toggleGroup = (id: string) =>
    setCollapsed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const toggleSelect = (id: string, on?: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on ?? !n.has(id)) n.add(id);
      else n.delete(id);
      return n;
    });

  const rows = () => [...(rootRef.current?.querySelectorAll<HTMLElement>(ROW) ?? [])];

  const onRowKey = (e: KeyboardEvent<HTMLLIElement>, task: Task) => {
    const li = e.currentTarget;
    const onRow = e.target === li;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!onRow) return;
      e.preventDefault();
      const all = rows();
      const i = all.indexOf(li);
      const next = all[e.key === 'ArrowDown' ? i + 1 : i - 1];
      if (next) {
        if (e.shiftKey) {
          toggleSelect(task.id, true);
          toggleSelect(next.dataset.id ?? '', true);
        }
        next.focus();
      }
    } else if (e.key === 'Enter' && onRow) {
      e.preventDefault();
      onOpen(task);
    } else if (e.key === ' ' && onRow) {
      e.preventDefault();
      if (e.shiftKey) toggleSelect(task.id);
      else if (canEdit(task)) onToggleComplete(task);
    } else if (e.key === 'Escape' && selected.size) {
      setSelected(new Set());
    }
  };

  const bulk = async (patch: Partial<Task>) => {
    await Promise.all(visibleSelected.map((x) => onPatch(x, patch)));
    toast(t('core.work.bulk.done', { n: visibleSelected.length }));
  };

  const submitAdd = (group: WorkGroup) => {
    const title = newTitle.trim();
    if (title && onAdd) onAdd(group, title);
    setNewTitle('');
    setAdding(null);
  };

  if (total === 0 && !canAdd) return <EmptyState title={t('core.work.empty')} description={t('core.work.emptyHint')} glyph="▤" />;

  return (
    <div ref={rootRef} className="work-list" role="region" aria-label={label}>
      {visibleSelected.length > 0 && (
        <div className="work-bulk" role="toolbar" aria-label={t('core.work.selected', { n: visibleSelected.length })}>
          <Badge tone="accent">{t('core.work.selected', { n: visibleSelected.length })}</Badge>
          <Select className="work-inline" label={t('core.work.bulk.assign')} hideLabel value="" onChange={(e) => e.target.value && bulk({ assigneeId: e.target.value })} options={[{ value: '', label: t('core.work.bulk.assign') }, ...ctx.people.map((p) => ({ value: p.id, label: p.name }))]} />
          <Select className="work-inline" label={t('core.work.bulk.status')} hideLabel value="" onChange={(e) => e.target.value && bulk(statusPatch(e.target.value as TaskStatus, ctx.today))} options={[{ value: '', label: t('core.work.bulk.status') }, ...STATUSES.map((s) => ({ value: s, label: labels.status(s) }))]} />
          <Input className="work-inline" type="date" label={t('core.work.bulk.due')} hideLabel value="" onChange={(e) => e.target.value && bulk({ dueDate: e.target.value })} />
          {ctx.sections.length > 0 && (
            <Select className="work-inline" label={t('core.work.bulk.section')} hideLabel value="" onChange={(e) => e.target.value && bulk({ sectionId: e.target.value === 'none' ? null : e.target.value })} options={[{ value: '', label: t('core.work.bulk.section') }, ...ctx.sections.map((s) => ({ value: s.id, label: s.name })), { value: 'none', label: t('core.work.noSection') }]} />
          )}
          <Button variant="ghost" onClick={() => setSelected(new Set())}>
            {t('core.work.bulk.clear')}
          </Button>
        </div>
      )}

      <div className="work-list__head" aria-hidden="true">
        <span />
        <span>{t('core.work.col.done')}</span>
        <span>{t('core.work.col.title')}</span>
        <span>{t('core.work.col.assignee')}</span>
        <span>{t('core.work.col.due')}</span>
        <span>{t('core.work.col.status')}</span>
        <span>{t('core.work.col.priority')}</span>
        <span />
      </div>

      {groups.map((g) => {
        const open = !collapsed.has(g.id);
        const list = sortTasks(g.tasks, sort, ctx);
        return (
          <section key={g.id} className="work-group" aria-labelledby={`wg-${g.id}`}>
            <h3 className="work-group__head">
              <button type="button" className="work-group__toggle" aria-expanded={open} onClick={() => toggleGroup(g.id)} aria-label={t(open ? 'core.work.collapse' : 'core.work.expand', { section: g.label })}>
                <span className="work-group__chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
                <span id={`wg-${g.id}`} className="work-group__name">{g.label}</span>
                <Badge tone={g.tone ?? 'neutral'}>{g.tasks.length}</Badge>
              </button>
            </h3>
            {open && (
              <ul className="work-list__rows">
                {list.map((task) => {
                  const editable = canEdit(task);
                  const done = task.status === 'done';
                  const waiting = blockedBy(task, byId);
                  const sub = subtaskProgress(task);
                  const comments = ctx.commentCounts[task.id] ?? 0;
                  const project = showProject ? ctx.projects.find((p) => p.id === task.projectId)?.name : undefined;
                  return (
                    <li
                      key={task.id}
                      data-id={task.id}
                      className={cx('work-row', done && 'work-row--done', selected.has(task.id) && 'work-row--selected', !editable && 'work-row--readonly')}
                      tabIndex={0}
                      aria-label={t('core.work.rowLabel', { title: task.title, status: labels.status(task.status), assignee: labels.person(task.assigneeId), due: labels.date(task.dueDate) })}
                      onKeyDown={(e) => onRowKey(e, task)}
                    >
                      <span className="work-row__select">
                        <Checkbox label={t('core.work.select', { title: task.title })} checked={selected.has(task.id)} onChange={(e) => toggleSelect(task.id, e.target.checked)} />
                      </span>
                      <Button className={cx('work-row__done', done && 'work-row__done--on')} variant="ghost" icon={done ? '✓' : '○'} aria-pressed={done} aria-label={t(done ? 'core.work.reopen' : 'core.work.complete', { title: task.title })} disabled={!editable} onClick={() => onToggleComplete(task)} />
                      <div className="work-row__main">
                        <TitleCell task={task} editable={editable} onOpen={() => onOpen(task)} onSave={(title) => onPatch(task, { title })} />
                        <div className="work-row__meta">
                          {project && <span className="work-row__project">{project}</span>}
                          <span className="work-row__priority-inline"><Badge tone={PRIORITY_TONES[task.priority]} dot>{labels.priority(task.priority)}</Badge></span>
                          {task.tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                          {sub.total > 0 && <span className="work-row__ind" title={t('core.work.subtasks')}>☑ {sub.done}/{sub.total}</span>}
                          {task.dependsOn.length > 0 && (
                            <span className={cx('work-row__ind', waiting.length > 0 && 'work-row__ind--warn')} title={waiting.length ? t('core.work.blockedBy', { items: waiting.map((w) => w.title).join(', ') }) : t('core.work.dependencies')}>
                              ↳ {task.dependsOn.length}
                            </span>
                          )}
                          {comments > 0 && <span className="work-row__ind" title={t('core.work.comments')}>✎ {comments}</span>}
                        </div>
                      </div>
                      <div className="work-row__assignee" data-label={t('core.work.col.assignee')}>
                        <Avatar size="sm" name={labels.person(task.assigneeId)} initials={ctx.people.find((p) => p.id === task.assigneeId)?.initials} />
                        {editable ? (
                          <Select className="work-inline" label={t('core.work.col.assignee')} hideLabel value={task.assigneeId} onChange={(e) => onPatch(task, { assigneeId: e.target.value })} options={ctx.people.map((p) => ({ value: p.id, label: p.name }))} />
                        ) : (
                          <span className="work-row__text">{labels.person(task.assigneeId)}</span>
                        )}
                      </div>
                      <div className="work-row__due" data-label={t('core.work.col.due')}>
                        {editable ? (
                          <Input className={cx('work-inline', `work-inline--${dueToneOf(task, ctx.today)}`)} type="date" label={t('core.work.col.due')} hideLabel value={task.dueDate ?? ''} onChange={(e) => onPatch(task, { dueDate: e.target.value || null })} />
                        ) : (
                          <Badge tone={dueToneOf(task, ctx.today)}>{labels.date(task.dueDate)}</Badge>
                        )}
                      </div>
                      <div className="work-row__status" data-label={t('core.work.col.status')}>
                        {editable ? (
                          <Select className={cx('work-inline', `work-inline--status-${task.status}`)} label={t('core.work.col.status')} hideLabel value={task.status} onChange={(e) => onPatch(task, statusPatch(e.target.value as TaskStatus, ctx.today))} options={STATUSES.map((s) => ({ value: s, label: labels.status(s) }))} />
                        ) : (
                          <StatusPill status={task.status} />
                        )}
                      </div>
                      <div className="work-row__priority" data-label={t('core.work.col.priority')}>
                        {editable ? (
                          <Select className={cx('work-inline', `work-inline--${PRIORITY_TONES[task.priority]}`)} label={t('core.work.col.priority')} hideLabel value={task.priority} onChange={(e) => onPatch(task, { priority: e.target.value as Priority })} options={PRIORITIES.map((p) => ({ value: p, label: labels.priority(p) }))} />
                        ) : (
                          <Badge tone={PRIORITY_TONES[task.priority]} dot>{labels.priority(task.priority)}</Badge>
                        )}
                      </div>
                      <Button className="work-row__open" variant="ghost" icon="›" aria-label={t('core.work.open', { title: task.title })} onClick={() => onOpen(task)} />
                    </li>
                  );
                })}
                {canAdd && onAdd && (
                  <li className="work-row work-row--add" data-id="">
                    {adding === g.id ? (
                      <form
                        className="work-add"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitAdd(g);
                        }}
                      >
                        <Input className="work-inline work-add__input" label={t('core.work.newTaskTitle')} hideLabel placeholder={t('core.work.newTaskTitle')} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Escape' && setAdding(null)} />
                        <Button type="submit" variant="primary" size="sm" disabled={!newTitle.trim()}>
                          {t('core.work.add')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setAdding(null)}>
                          {t('core.work.cancel')}
                        </Button>
                      </form>
                    ) : (
                      <Button variant="ghost" icon="+" className="work-add__btn" onClick={() => setAdding(g.id)} aria-label={t('core.work.addTo', { group: g.label })}>
                        {t('core.work.addTask')}
                      </Button>
                    )}
                  </li>
                )}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Status change with the completedAt bookkeeping every view shares. */
export function statusPatch(status: TaskStatus, today: string): Partial<Task> {
  return status === 'done' ? { status, completedAt: today } : { status, completedAt: null };
}

function TitleCell({ task, editable, onOpen, onSave }: { task: Task; editable: boolean; onOpen: () => void; onSave: (title: string) => void }) {
  const { t } = useT();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.title);
  const commit = () => {
    const v = value.trim();
    if (v && v !== task.title) onSave(v);
    else setValue(task.title);
    setEditing(false);
  };
  if (editing) {
    return (
      <Input
        className="work-inline work-row__title-input"
        label={t('core.work.editTitle', { title: task.title })}
        hideLabel
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setValue(task.title);
            setEditing(false);
          }
        }}
      />
    );
  }
  return (
    <span className="work-row__title-wrap">
      <button type="button" className="work-row__title" onClick={onOpen}>
        {task.title}
      </button>
      {editable && <Button variant="ghost" size="sm" icon="✎" className="work-row__edit" aria-label={t('core.work.editTitle', { title: task.title })} onClick={() => { setValue(task.title); setEditing(true); }} />}
    </span>
  );
}
