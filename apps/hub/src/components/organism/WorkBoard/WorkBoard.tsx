import { useMemo, useState } from 'react';
import { cx } from '../../../design/cx';
import type { Task } from '../../../data/schema';
import { useT } from '../../../i18n/I18nProvider';
import { useWorkLabels } from '../../../work/labels';
import { blockedBy, childCounts, deliverableOf, dueToneOf, PRIORITY_TONES, sortTasks, subtaskProgress, topLevel, type SortBy, type WorkContext, type WorkGroup } from '../../../work/model';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { Input } from '../../atom/Input/Input';
import { Select } from '../../atom/Select/Select';
import './WorkBoard.css';

export interface WorkBoardProps {
  label: string;
  /** One column per group (sections, or statuses when grouped by status). */
  groups: WorkGroup[];
  ctx: WorkContext;
  sort: SortBy;
  canEdit: (task: Task) => boolean;
  canAdd?: boolean;
  onOpen: (task: Task) => void;
  /** Card moved to another column: the page writes sectionId / status / assigneeId from the target group. */
  onMove: (task: Task, to: WorkGroup) => void;
  onAdd?: (group: WorkGroup, title: string) => void;
}

/**
 * Asana-style board (D-021): columns are the groups, cards carry assignee, due date (overdue tone),
 * priority dot, tags, deliverable badge, dependency and comment indicators. Only **top-level** tasks get a
 * card (D-062); a parent shows how many children it has and the List is where the tree is worked.
 * Cards move with a "Move to…" select and the
 * prev / next buttons, never drag-only (P-03); each column has an inline "Add task" and a WIP count.
 * Columns scroll horizontally and snap on phones.
 */
export function WorkBoard({ label, groups, ctx, sort, canEdit, canAdd, onOpen, onMove, onAdd }: WorkBoardProps) {
  const { t } = useT();
  const labels = useWorkLabels(ctx.people);
  const all = useMemo(() => groups.flatMap((g) => g.tasks), [groups]);
  const byId = useMemo(() => new Map(all.map((x) => [x.id, x])), [all]);
  const kids = useMemo(() => childCounts(all), [all]);
  const [adding, setAdding] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const submitAdd = (group: WorkGroup) => {
    const title = newTitle.trim();
    if (title && onAdd) onAdd(group, title);
    setNewTitle('');
    setAdding(null);
  };

  return (
    <div className="work-board" role="group" aria-label={label}>
      {groups.map((g, ci) => {
        const prev = groups[ci - 1];
        const next = groups[ci + 1];
        const cards = sortTasks(topLevel(g.tasks), sort, ctx);
        return (
          <section key={g.id} className="work-col" aria-labelledby={`wcol-${g.id}`}>
            <header className="work-col__head">
              <h3 id={`wcol-${g.id}`} className="work-col__title">{g.label}</h3>
              <Badge tone={g.tone ?? 'neutral'} aria-label={t('core.work.wip', { n: cards.length })}>{cards.length}</Badge>
            </header>
            <ul className="work-col__list">
              {cards.map((task) => {
                const editable = canEdit(task);
                const waiting = blockedBy(task, byId);
                const sub = subtaskProgress(task);
                const comments = ctx.commentCounts[task.id] ?? 0;
                const person = ctx.people.find((p) => p.id === task.assigneeId);
                const deliverable = deliverableOf(task, ctx);
                const children = kids[task.id] ?? 0;
                return (
                  <li key={task.id} className={cx('work-card', task.status === 'done' && 'work-card--done', task.status === 'blocked' && 'work-card--blocked')}>
                    <button type="button" className="work-card__main" onClick={() => onOpen(task)} aria-label={t('core.work.open', { title: task.title || t('core.work.untitled') })}>
                      <span className="work-card__title">{task.title || t('core.work.untitled')}</span>
                      {(deliverable || task.tags.length > 0) && (
                        <span className="work-card__tags">
                          {deliverable && <Badge tone="success">▣ {deliverable.name}</Badge>}
                          {task.tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </span>
                      )}
                      <span className="work-card__foot">
                        <Avatar size="sm" name={labels.person(task.assigneeId)} initials={person?.initials} />
                        {task.dueDate && <Badge tone={dueToneOf(task, ctx.today)}>{labels.date(task.dueDate)}</Badge>}
                        <Badge tone={PRIORITY_TONES[task.priority]} dot>{labels.priority(task.priority)}</Badge>
                        {children > 0 && <span className="work-card__ind" title={t('core.work.childCountLabel', { n: children })}>{t('core.work.childCount', { n: children })}</span>}
                        {sub.total > 0 && <span className="work-card__ind">☑ {sub.done}/{sub.total}</span>}
                        {task.dependsOn.length > 0 && <span className={cx('work-card__ind', waiting.length > 0 && 'work-card__ind--warn')}>↳ {task.dependsOn.length}</span>}
                        {comments > 0 && <span className="work-card__ind">✎ {comments}</span>}
                      </span>
                    </button>
                    {editable && groups.length > 1 && (
                      <div className="work-card__moves">
                        <Select
                          className="work-inline work-card__move"
                          label={t('core.work.moveCard', { title: task.title || t('core.work.untitled') })}
                          hideLabel
                          value=""
                          onChange={(e) => {
                            const to = groups.find((x) => x.id === e.target.value);
                            if (to) onMove(task, to);
                          }}
                          options={[{ value: '', label: t('core.work.moveTo') }, ...groups.filter((x) => x.id !== g.id).map((x) => ({ value: x.id, label: x.label }))]}
                        />
                        <Button size="sm" variant="ghost" icon="◀" aria-label={t('core.kanban.moveTo', { title: task.title || t('core.work.untitled'), column: prev?.label ?? '' })} disabled={!prev} onClick={() => prev && onMove(task, prev)} />
                        <Button size="sm" variant="ghost" icon="▶" aria-label={t('core.kanban.moveTo', { title: task.title || t('core.work.untitled'), column: next?.label ?? '' })} disabled={!next} onClick={() => next && onMove(task, next)} />
                      </div>
                    )}
                  </li>
                );
              })}
              {cards.length === 0 && <li className="work-col__empty">{t('core.kanban.empty')}</li>}
            </ul>
            {canAdd && onAdd && (
              <div className="work-col__add">
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
                  <Button variant="ghost" icon="+" fullWidth onClick={() => setAdding(g.id)} aria-label={t('core.work.addTo', { group: g.label })}>
                    {t('core.work.addTask')}
                  </Button>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
