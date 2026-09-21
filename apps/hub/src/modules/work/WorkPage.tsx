import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useSession } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { toast } from '../../components/atom/Toast/Toast';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { PresenceBar } from '../../components/molecule/PresenceBar/PresenceBar';
import { TaskDetailDrawer } from '../../components/organism/TaskDetailDrawer/TaskDetailDrawer';
import { WorkBoard } from '../../components/organism/WorkBoard/WorkBoard';
import { WorkCalendar } from '../../components/organism/WorkCalendar/WorkCalendar';
import { WorkHeader } from '../../components/organism/WorkHeader/WorkHeader';
import { WorkList } from '../../components/organism/WorkList/WorkList';
import { WorkTimeline } from '../../components/organism/WorkTimeline/WorkTimeline';
import type { Task } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';
import { usePresence } from '../../presence/PresenceProvider';
import type { Surface } from '../../specs/PageSpec';
import { useWorkLabels } from '../../work/labels';
import { allTags, EMPTY_FILTERS, filterTasks, groupTasks, topLevel, type TimelineZoom, type WorkGroup } from '../../work/model';
import { useWork } from '../../work/useWork';
import { DEFAULT_VIEW_STATE, loadLastState, loadSavedViews, newViewId, saveLastState, saveSavedViews, type SavedView, type ViewState } from '../../work/views';
import { projectWorkSpec, workSpec } from './specs';
import './work.css';

/** The view each role lands on (prompt 0004): founder list by project + approvals, ops timeline, studio board, brand list filtered to her. */
function roleDefault(role: string, userId: string): ViewState {
  switch (role) {
    case 'founder':
      return { ...DEFAULT_VIEW_STATE, view: 'list', groupBy: 'project', filters: { ...EMPTY_FILTERS, tag: 'aprobación', showDone: false } };
    case 'ops':
      return { ...DEFAULT_VIEW_STATE, view: 'timeline', groupBy: 'section', sort: 'dueDate' };
    case 'studio':
      return { ...DEFAULT_VIEW_STATE, view: 'board', groupBy: 'status', sort: 'priority' };
    case 'brand':
      return { ...DEFAULT_VIEW_STATE, view: 'list', groupBy: 'section', filters: { ...EMPTY_FILTERS, assignee: userId } };
    default:
      return DEFAULT_VIEW_STATE;
  }
}

/** W-01 (all projects) and W-02 (`:projectId`) share this page; the surface only changes shell, breadcrumb and role default. */
export function WorkPage({ surface }: { surface: Surface }) {
  const { t } = useT();
  const navigate = useNavigate();
  const { projectId: routeProjectId } = useParams();
  const projectId = routeProjectId ?? null;
  const { user, role, can } = useSession();
  const work = useWork(projectId);
  const labels = useWorkLabels(work.people);
  const { people } = usePresence();
  const scope = projectId ?? 'all';
  const home = `/${surface}`;
  // W-03 only exists on the surfaces whose role may create projects (`projects.write`, D-062).
  const canCreateProject = can('projects.write') && (surface === 'founder' || surface === 'ops');

  const [state, setState] = useState<ViewState>(() => loadLastState(user.id, scope) ?? roleDefault(role, user.id));
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => loadSavedViews(user.id));
  const [openId, setOpenId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<TimelineZoom>('week');
  const [month, setMonth] = useState(() => work.today.slice(0, 7));

  useEffect(() => {
    setState(loadLastState(user.id, scope) ?? roleDefault(role, user.id));
    setSavedViews(loadSavedViews(user.id));
  }, [user.id, role, scope]);
  useEffect(() => saveLastState(user.id, scope, state), [user.id, scope, state]);

  const project = projectId ? work.ctx.projects.find((p) => p.id === projectId) : undefined;
  const filtered = useMemo(() => filterTasks(work.tasks, state.filters, work.today), [work.tasks, state.filters, work.today]);
  const groups = useMemo(() => groupTasks(filtered, state.groupBy, work.ctx, labels.groups), [filtered, state.groupBy, work.ctx, labels.groups]);
  // The Board and the Timeline only show top-level tasks (D-062), so their tab counts say so too.
  const roots = useMemo(() => topLevel(filtered), [filtered]);
  const dated = roots.filter((x) => x.dueDate || x.startDate).length;
  const tags = useMemo(() => allTags(work.tasks), [work.tasks]);
  const change = useCallback((next: Partial<ViewState>) => setState((s) => ({ ...s, ...next })), []);

  const open = (task: Task) => setOpenId(task.id);

  const add = async (group: WorkGroup | null, title: string) => {
    const created = await work.addTask({
      title,
      sectionId: group?.key === 'section' ? group.sectionId ?? null : projectId ? work.ctx.sections[0]?.id ?? null : null,
      status: group?.key === 'status' ? group.status : undefined,
      assigneeId: group?.key === 'assignee' ? group.assigneeId : undefined,
      projectId: group?.key === 'project' ? (group.id === 'none' ? null : group.id) : undefined,
    });
    toast(t('work.added'));
    if (!group) setOpenId(created.id);
  };

  const move = async (task: Task, to: WorkGroup) => {
    const r = work.moveTo(task, to);
    if (r === false) {
      toast(t('work.cannotMove', { group: to.label }));
      return;
    }
    await r;
    toast(t('work.moved'));
  };

  const saveView = (name: string) => {
    const next = [...savedViews, { id: newViewId(), name, ...state }];
    setSavedViews(next);
    saveSavedViews(user.id, next);
    toast(t('work.viewSaved', { name }));
  };
  const applyView = (id: string) => {
    const v = savedViews.find((x) => x.id === id);
    if (v) setState({ view: v.view, filters: { ...EMPTY_FILTERS, ...v.filters }, sort: v.sort, groupBy: v.groupBy });
  };
  const deleteView = (id: string) => {
    const next = savedViews.filter((x) => x.id !== id);
    setSavedViews(next);
    saveSavedViews(user.id, next);
    toast(t('work.viewDeleted'));
  };

  // The Work views declare 31 `work.*` actions and register none since 0008 (the bus landed in 0013);
  // the two this pass adds are wired here so at least the new ones answer (P-05, D-047). Backlog card.
  useRegisterActions({
    'work.newProject': canCreateProject ? () => { navigate(`${home}/work/new`); return 'opened W-03'; } : false,
    'work.setDeliverable': work.canAdd
      ? async ({ task, deliverable }) => {
          const row = work.tasks.find((x) => x.id === String(task));
          if (!row) return `unknown task: ${String(task)}`;
          const id = String(deliverable ?? '');
          if (id && !work.ctx.deliverables.some((d) => d.id === id)) return `unknown deliverable: ${id}`;
          await work.patch(row, { deliverableId: id || null });
          return `${row.title}: ${id || 'no deliverable'}`;
        }
      : false,
  });

  const spec = projectId ? projectWorkSpec(surface) : workSpec(surface);
  const title = project?.name ?? t('work.title');
  const openCount = work.tasks.filter((x) => x.status !== 'done').length;

  if (projectId && !work.loading && !project) {
    return (
      <div className="work-page">
        <PageHeader code={spec.code} title={t('work.title')} breadcrumb={[{ label: t(`core.portal.${surface}`), to: home }, { label: t('work.title'), to: `${home}/work` }]} />
        <EmptyState title={t('work.project.notFound')} glyph="◌">
          <Button variant="primary" href={`#${home}/work`}>{t('work.allWork')}</Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="work-page">
      <PageHeader
        code={spec.code}
        title={title}
        subtitle={project ? t('work.project.subtitle', { client: project.client, n: work.tasks.length, sections: work.ctx.sections.length, open: openCount }) : t('work.subtitle')}
        breadcrumb={project ? [{ label: t(`core.portal.${surface}`), to: home }, { label: t('work.title'), to: `${home}/work` }, { label: project.name }] : [{ label: t(`core.portal.${surface}`), to: home }, { label: t('work.title') }]}
        actions={
          project ? (
            <Button href={`#${home}/work`} icon="‹">{t('work.allWork')}</Button>
          ) : (
            <>
              <Select className="work-page__project" label={t('work.openProject')} hideLabel value="" onChange={(e) => e.target.value && navigate(`${home}/work/${e.target.value}`)} options={[{ value: '', label: t('work.openProject') }, ...work.ctx.projects.map((p) => ({ value: p.id, label: p.name }))]} />
              {canCreateProject && (
                <Button variant="primary" icon="+" href={`#${home}/work/new`}>
                  {t('work.new.open')}
                </Button>
              )}
            </>
          )
        }
      />

      <WorkHeader
        label={title}
        state={state}
        onChange={change}
        counts={{ list: filtered.length, board: roots.length, timeline: dated, calendar: filtered.filter((x) => x.dueDate).length }}
        people={work.people}
        projects={work.ctx.projects}
        tags={tags}
        deliverables={work.ctx.deliverables}
        showProjectFilter={!projectId}
        onAddTask={work.canAdd ? () => add(null, t('core.work.newTaskTitle')) : undefined}
        savedViews={savedViews}
        onSaveView={saveView}
        onApplyView={applyView}
        onDeleteView={deleteView}
        aside={<PresenceBar people={people} />}
      />

      {state.view === 'list' && <WorkList label={title} groups={groups} ctx={work.ctx} sort={state.sort} canEdit={work.canEdit} canAdd={work.canAdd} onOpen={open} onPatch={work.patch} onToggleComplete={work.toggleComplete} onAdd={add} showProject={!projectId && state.groupBy !== 'project'} />}
      {state.view === 'board' && <WorkBoard label={title} groups={groups} ctx={work.ctx} sort={state.sort} canEdit={work.canEdit} canAdd={work.canAdd} onOpen={open} onMove={move} onAdd={add} />}
      {state.view === 'timeline' && <WorkTimeline label={title} groups={groups} ctx={work.ctx} sort={state.sort} zoom={zoom} onZoom={setZoom} onOpen={open} />}
      {state.view === 'calendar' && <WorkCalendar label={title} tasks={filtered} ctx={work.ctx} month={month} onMonthChange={setMonth} onOpen={open} />}

      <TaskDetailDrawer taskId={openId} onClose={() => setOpenId(null)} canEdit={work.canEdit} ctx={work.ctx} allTasks={work.tasks} />
    </div>
  );
}
