import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { cx } from '../../../design/cx';
import { useData, useRow, useTable } from '../../../data/DataContext';
import type { Priority, Task, TaskStatus } from '../../../data/schema';
import { useT } from '../../../i18n/I18nProvider';
import { useWorkLabels } from '../../../work/labels';
import { ancestorTitles, PRIORITIES, PRIORITY_TONES, STATUSES, wouldCycle, type WorkContext } from '../../../work/model';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { Checkbox } from '../../atom/Checkbox/Checkbox';
import { Input } from '../../atom/Input/Input';
import { Select } from '../../atom/Select/Select';
import { StatusPill } from '../../atom/StatusPill/StatusPill';
import { Textarea } from '../../atom/Textarea/Textarea';
import { toast } from '../../atom/Toast/Toast';
import { Drawer } from '../Drawer/Drawer';
import './TaskDetailDrawer.css';

export interface TaskDetailDrawerProps {
  /** Task to show; null closes the drawer. */
  taskId: string | null;
  onClose: () => void;
  canEdit: (task: Task) => boolean;
  ctx: Pick<WorkContext, 'sections' | 'projects' | 'people' | 'deliverables' | 'today'>;
  /** Every task the dependency picker may offer (same project). */
  allTasks: Task[];
}

const FIELD_KEYS: Record<string, string> = {
  title: 'core.work.col.title',
  description: 'core.work.detail.description',
  sectionId: 'core.work.detail.section',
  assigneeId: 'core.work.detail.assignee',
  startDate: 'core.work.detail.start',
  dueDate: 'core.work.detail.due',
  status: 'core.work.detail.status',
  priority: 'core.work.detail.priority',
  tags: 'core.work.detail.tags',
  subtasks: 'core.work.subtasks',
  dependsOn: 'core.work.dependencies',
  completedAt: 'core.work.completed',
  deliverableId: 'core.work.detail.deliverable',
  parentTaskId: 'core.work.detail.parent',
};

/**
 * The task drawer (D-021): title, description, section, assignee, start / due dates, status, priority,
 * tags, the deliverable it produces, dependencies (cycle-safe), subtasks, comments thread (`comments`
 * entity), activity trail (`activity` entity) and "Mark complete". A nested task names its ancestors as a
 * breadcrumb and an imported one names its Asana id (D-062). Every write goes through the DataProvider with
 * `basedOn` so a newer row from another tab is reported (D-024); read-only for people without edit rights.
 */
export function TaskDetailDrawer({ taskId, onClose, canEdit, ctx, allTasks }: TaskDetailDrawerProps) {
  const { t, lang } = useT();
  const data = useData();
  const { user } = useSession();
  const labels = useWorkLabels(ctx.people);
  const { row: task } = useRow('tasks', taskId);
  const { rows: comments } = useTable('comments', taskId ? { where: { entity: 'tasks', entityId: taskId }, orderBy: 'created_at' } : { where: { entity: 'tasks', entityId: '__none__' } });
  const { rows: activity } = useTable('activity', taskId ? { where: { entity: 'tasks', entityId: taskId }, orderBy: 'at', dir: 'desc', limit: 12 } : { where: { entity: 'tasks', entityId: '__none__' } });
  const [draft, setDraft] = useState({ title: '', description: '', tags: '' });
  const [comment, setComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) setDraft({ title: task.title, description: task.description, tags: task.tags.join(', ') });
  }, [task?.id, task?.title, task?.description, task?.tags.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const byId = useMemo(() => new Map(allTasks.map((x) => [x.id, x])), [allTasks]);
  const editable = task ? canEdit(task) : false;
  const sections = useMemo(() => ctx.sections.filter((s) => (task ? s.projectId === task.projectId : false)), [ctx.sections, task]);
  const project = task?.projectId ? ctx.projects.find((p) => p.id === task.projectId) : undefined;
  const ancestors = useMemo(() => (task ? ancestorTitles(task, byId) : []), [task, byId]);

  const patch = async (p: Partial<Task>) => {
    if (!task) return;
    await data.update('tasks', task.id, p, { basedOn: task.updated_at });
  };

  const setStatus = (status: TaskStatus) => patch(status === 'done' ? { status, completedAt: ctx.today } : { status, completedAt: null });

  const dependencyOptions = useMemo(() => {
    if (!task) return [];
    return allTasks
      .filter((x) => x.id !== task.id && x.projectId === task.projectId && !task.dependsOn.includes(x.id))
      .map((x) => ({ value: x.id, label: x.title, disabled: wouldCycle(task.id, x.id, byId) }));
  }, [task, allTasks, byId]);

  const addDependency = async (id: string) => {
    if (!task || !id) return;
    if (wouldCycle(task.id, id, byId)) {
      toast(t('core.work.detail.cycle', { title: byId.get(id)?.title ?? id }));
      return;
    }
    await patch({ dependsOn: [...task.dependsOn, id] });
  };

  const submitComment = async () => {
    const body = comment.trim();
    if (!task || !body) return;
    await data.create('comments', { entity: 'tasks', entityId: task.id, authorId: user.id, body });
    setComment('');
  };

  const addSubtask = async () => {
    const label = newSubtask.trim();
    if (!task || !label) return;
    await patch({ subtasks: [...task.subtasks, { id: `st-${Date.now().toString(36)}`, label, done: false }] });
    setNewSubtask('');
  };

  const fieldLabel = (field: string) => (FIELD_KEYS[field] ? t(FIELD_KEYS[field]) : field);
  const valueLabel = (field: string, v: string | null) => {
    if (v === null) return '—';
    if (field === 'status') return labels.status(v as TaskStatus);
    if (field === 'priority') return labels.priority(v as Priority);
    if (field === 'assigneeId') return labels.person(v);
    if (field === 'sectionId') return ctx.sections.find((s) => s.id === v)?.name ?? v;
    if (field === 'deliverableId') return ctx.deliverables.find((d) => d.id === v)?.name ?? v;
    if (field === 'parentTaskId') return byId.get(v)?.title || v;
    if (field === 'startDate' || field === 'dueDate' || field === 'completedAt') return labels.date(v);
    return v;
  };

  return (
    <Drawer
      open={taskId !== null}
      onClose={onClose}
      title={task ? task.title || t('core.work.untitled') : '…'}
      footer={
        task &&
        editable && (
          <Button variant={task.status === 'done' ? 'secondary' : 'primary'} icon={task.status === 'done' ? '↺' : '✓'} onClick={() => setStatus(task.status === 'done' ? 'todo' : 'done')}>
            {t(task.status === 'done' ? 'core.work.markIncomplete' : 'core.work.markComplete')}
          </Button>
        )
      }
    >
      {task && (
        <div className="task-detail">
          <div className="task-detail__top">
            <StatusPill status={task.status} />
            <Badge tone={PRIORITY_TONES[task.priority]} dot>{labels.priority(task.priority)}</Badge>
            {project && <Badge tone="accent">{project.name}</Badge>}
            {task.completedAt && <span className="task-detail__muted">{t('core.work.detail.completedAt', { date: labels.date(task.completedAt) })}</span>}
          </div>
          {ancestors.length > 0 && (
            <p className="task-detail__crumbs">
              <span className="task-detail__muted">{t('core.work.detail.parent')}: </span>
              {ancestors.map((title, i) => (
                <span key={`${title}-${i}`}>
                  {i > 0 && <span aria-hidden="true"> › </span>}
                  {title || t('core.work.untitled')}
                </span>
              ))}
              <span aria-hidden="true"> › </span>
              <strong>{task.title || t('core.work.untitled')}</strong>
            </p>
          )}
          {task.externalId && <p className="task-detail__imported">{t('core.work.detail.imported', { id: task.externalId })}</p>}
          {!editable && <p className="task-detail__readonly">{t('core.work.detail.readOnly')}</p>}

          {editable ? (
            <Input label={t('core.work.col.title')} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} onBlur={() => draft.title.trim() && draft.title !== task.title && patch({ title: draft.title.trim() })} />
          ) : null}

          <Textarea label={t('core.work.detail.description')} rows={3} value={draft.description} readOnly={!editable} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} onBlur={() => draft.description !== task.description && patch({ description: draft.description })} />

          <div className="task-detail__grid">
            <Select label={t('core.work.detail.section')} value={task.sectionId ?? ''} disabled={!editable} onChange={(e) => patch({ sectionId: e.target.value || null })} options={[{ value: '', label: t('core.work.noSection') }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
            <Select label={t('core.work.detail.assignee')} value={task.assigneeId} disabled={!editable} onChange={(e) => patch({ assigneeId: e.target.value })} options={ctx.people.map((p) => ({ value: p.id, label: p.name }))} />
            <Input type="date" label={t('core.work.detail.start')} value={task.startDate ?? ''} readOnly={!editable} onChange={(e) => patch({ startDate: e.target.value || null })} />
            <Input type="date" label={t('core.work.detail.due')} value={task.dueDate ?? ''} readOnly={!editable} onChange={(e) => patch({ dueDate: e.target.value || null })} />
            <Select label={t('core.work.detail.status')} value={task.status} disabled={!editable} onChange={(e) => setStatus(e.target.value as TaskStatus)} options={STATUSES.map((s) => ({ value: s, label: labels.status(s) }))} />
            <Select label={t('core.work.detail.priority')} value={task.priority} disabled={!editable} onChange={(e) => patch({ priority: e.target.value as Priority })} options={PRIORITIES.map((p) => ({ value: p, label: labels.priority(p) }))} />
            <Select className="task-detail__wide" label={t('core.work.detail.deliverable')} value={task.deliverableId ?? ''} disabled={!editable} onChange={(e) => patch({ deliverableId: e.target.value || null })} options={[{ value: '', label: t('core.work.noDeliverable') }, ...ctx.deliverables.map((d) => ({ value: d.id, label: d.name }))]} />
          </div>

          <Input label={t('core.work.detail.tags')} value={draft.tags} readOnly={!editable} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))} onBlur={() => { const tags = draft.tags.split(',').map((x) => x.trim()).filter(Boolean); if (tags.join('|') !== task.tags.join('|')) patch({ tags }); }} />

          <section className="task-detail__section" aria-labelledby="td-deps">
            <h3 id="td-deps" className="task-detail__h">{t('core.work.dependencies')}</h3>
            {task.dependsOn.length === 0 && <p className="task-detail__muted">{t('core.work.detail.noDependencies')}</p>}
            <ul className="task-detail__list">
              {task.dependsOn.map((id) => {
                const dep = byId.get(id);
                return (
                  <li key={id} className="task-detail__dep">
                    <StatusPill status={dep?.status ?? 'todo'} />
                    <span className="task-detail__dep-title">{dep?.title ?? id}</span>
                    {editable && <Button size="sm" variant="ghost" icon="×" aria-label={t('core.work.detail.removeDependency', { title: dep?.title ?? id })} onClick={() => patch({ dependsOn: task.dependsOn.filter((d) => d !== id) })} />}
                  </li>
                );
              })}
            </ul>
            {editable && dependencyOptions.length > 0 && <Select label={t('core.work.detail.addDependency')} hideLabel value="" onChange={(e) => addDependency(e.target.value)} options={[{ value: '', label: t('core.work.detail.addDependency') }, ...dependencyOptions.map((o) => ({ ...o, label: o.disabled ? t('core.work.detail.cycle', { title: o.label }) : o.label }))]} />}
          </section>

          <section className="task-detail__section" aria-labelledby="td-sub">
            <h3 id="td-sub" className="task-detail__h">
              {t('core.work.subtasks')} <Badge>{t('core.work.subtasksCount', { done: task.subtasks.filter((s) => s.done).length, total: task.subtasks.length })}</Badge>
            </h3>
            <div className="task-detail__subtasks">
              {task.subtasks.map((s) => (
                <Checkbox key={s.id} label={s.label} checked={s.done} disabled={!editable} className={cx(s.done && 'task-detail__sub--done')} onChange={(e) => patch({ subtasks: task.subtasks.map((x) => (x.id === s.id ? { ...x, done: e.target.checked } : x)) })} />
              ))}
            </div>
            {editable && (
              <form
                className="task-detail__add"
                onSubmit={(e) => {
                  e.preventDefault();
                  addSubtask();
                }}
              >
                <Input label={t('core.work.detail.addSubtask')} hideLabel placeholder={t('core.work.detail.addSubtask')} value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} />
                <Button type="submit" size="sm" disabled={!newSubtask.trim()}>
                  {t('core.work.add')}
                </Button>
              </form>
            )}
          </section>

          <section className="task-detail__section" aria-labelledby="td-comments">
            <h3 id="td-comments" className="task-detail__h">
              {t('core.work.comments')} <Badge>{comments.length}</Badge>
            </h3>
            {comments.length === 0 && <p className="task-detail__muted">{t('core.work.detail.noComments')}</p>}
            <ol className="task-detail__comments">
              {comments.map((c) => (
                <li key={c.id} className="task-detail__comment">
                  <Avatar size="sm" name={labels.person(c.authorId)} initials={ctx.people.find((p) => p.id === c.authorId)?.initials} />
                  <div>
                    <div className="task-detail__comment-head">
                      <strong>{labels.person(c.authorId)}</strong> <span className="task-detail__muted">{labels.ago(c.created_at)}</span>
                    </div>
                    <p className="task-detail__comment-body">{c.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <form
              className="task-detail__comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                submitComment();
              }}
            >
              <Textarea label={t('core.work.detail.comment')} hideLabel placeholder={t('core.work.detail.comment')} rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button type="submit" variant="primary" size="sm" disabled={!comment.trim()}>
                {t('core.work.detail.send')}
              </Button>
            </form>
          </section>

          <section className="task-detail__section" aria-labelledby="td-activity">
            <h3 id="td-activity" className="task-detail__h">{t('core.work.detail.activity')}</h3>
            <ol className="task-detail__activity">
              {activity.map((a) => (
                <li key={a.id}>
                  <span>{t('core.work.detail.activityLine', { name: labels.person(a.actorId), field: fieldLabel(a.field), when: labels.ago(a.at) })}</span>
                  <span className="task-detail__muted"> {valueLabel(a.field, a.from)} → {valueLabel(a.field, a.to)}</span>
                </li>
              ))}
              <li className="task-detail__muted">{t('core.work.detail.activityCreated', { when: new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(task.created_at)) })}</li>
            </ol>
          </section>
        </div>
      )}
    </Drawer>
  );
}
