import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useRegisterActions } from '../../actions';
import { Badge, type Tone } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Kanban } from '../../components/organism/Kanban/Kanban';
import { useT } from '../../i18n/I18nProvider';
import { PLAN, PLAN_STATUSES, planBlockers, planDepth, planDependents, planOrder, planTask, type PlanStatus, type PlanTask } from '../../plan';
import { planSpec } from './specs';
import './tools.css';

type PlanView = 'board' | 'list' | 'timeline';
const VIEWS: PlanView[] = ['board', 'list', 'timeline'];

/** Board order: what is left, then what is next, then what is moving, then what is finished. */
const COLUMNS: PlanStatus[] = ['backlog', 'next', 'doing', 'done'];

const TONES: Record<PlanStatus, Tone> = { done: 'success', doing: 'accent', next: 'info', backlog: 'neutral' };

/** Rough natural sort for build-plan steps ("0", "9a", "13", "R2"). */
function stepRank(step: string): number {
  const n = Number.parseInt(step, 10);
  if (Number.isNaN(n)) return 1000 + (Number.parseInt(step.replace(/\D/g, ''), 10) || 0);
  return n * 10 + (step.length > String(n).length ? step.charCodeAt(String(n).length) - 96 : 0);
}

interface ArrowLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function PlanPage() {
  const { t, lang } = useT();
  const [view, setView] = useState<PlanView>('board');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [model, setModel] = useState('');
  const [step, setStep] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const statusLabel = useCallback((s: PlanStatus) => t(`tools.plan.status.${s}`), [t]);

  const counts = useMemo(() => {
    const c: Record<PlanStatus, number> = { done: 0, doing: 0, next: 0, backlog: 0 };
    for (const task of PLAN.tasks) c[task.status] += 1;
    return c;
  }, []);

  const models = useMemo(() => [...new Set(PLAN.tasks.map((task) => task.model))].sort(), []);
  const steps = useMemo(() => [...new Set(PLAN.tasks.map((task) => task.step))].sort((a, b) => stepRank(a) - stepRank(b)), []);

  const tasks = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PLAN.tasks.filter(
      (task) =>
        (!status || task.status === status) &&
        (!model || task.model === model) &&
        (!step || task.step === step) &&
        (!needle || `${task.id} ${task.title} ${task.step} ${task.model} ${task.codes.join(' ')}`.toLowerCase().includes(needle)),
    );
  }, [q, status, model, step]);

  const open = openId ? planTask(openId) : undefined;
  const filtered = q !== '' || status !== '' || model !== '' || step !== '';
  const clear = () => {
    setQ('');
    setStatus('');
    setModel('');
    setStep('');
  };

  useRegisterActions({
    'tools.switchPlanView': ({ view: v }) => {
      const next = VIEWS.find((x) => x === String(v));
      if (!next) return `unknown view "${String(v)}"`;
      setView(next);
      return `plan shown as ${next}`;
    },
    'tools.searchPlan': ({ query }) => {
      const needle = query === undefined ? '' : String(query);
      setQ(needle);
      return `searching the plan for "${needle}"`;
    },
    'tools.filterPlanStatus': ({ status: s }) => {
      const next = String(s ?? 'all');
      const value = next === 'all' ? '' : PLAN_STATUSES.find((x) => x === next);
      if (value === undefined) return `unknown status "${next}"`;
      setStatus(value);
      return `status filter: ${value || 'all'}`;
    },
    'tools.filterPlanModel': ({ model: m }) => {
      const next = String(m ?? 'all');
      const value = next === 'all' ? '' : models.find((x) => x.toLowerCase() === next.toLowerCase());
      if (value === undefined) return `unknown model "${next}"`;
      setModel(value);
      return `model filter: ${value || 'all'}`;
    },
    'tools.filterPlanStep': ({ step: s }) => {
      const next = String(s ?? 'all');
      const value = next === 'all' ? '' : steps.find((x) => x === next);
      if (value === undefined) return `unknown step "${next}"`;
      setStep(value);
      return `step filter: ${value || 'all'}`;
    },
    'tools.openPlanTask': ({ task }) => {
      const id = String(task ?? '');
      const found = planTask(id);
      if (!found) return `no plan task "${id}"`;
      setOpenId(id);
      return `opened ${found.id}: ${found.title}`;
    },
    'tools.movePlanTask': ({ task }) =>
      `read-only: move ${String(task ?? 'the task')} in docs/plan/plan.json and keep build-plan.md and kanban.md in step with it (D-037)`,
  });

  const blockerLabel = (id: string) => {
    const n = planBlockers(id).length;
    return n === 0 ? t('tools.plan.noBlockers') : n === 1 ? t('tools.plan.blockersOne') : t('tools.plan.blockers', { n });
  };

  return (
    <>
      <PageHeader
        code={planSpec.code}
        title={t('tools.plan.title')}
        subtitle={t('tools.plan.subtitle', { tasks: PLAN.tasks.length })}
        breadcrumb={[{ label: t('core.portal.dev'), to: '/dev/components' }, { label: t('tools.plan.title') }]}
      />
      <p className="tools-note">
        {t('tools.plan.updated', { version: PLAN.version, date: PLAN.updatedAt })} · {t('tools.plan.readOnly')}
      </p>
      <div className="tools-stats">
        {COLUMNS.map((s) => (
          <StatTile key={s} label={statusLabel(s)} value={counts[s]} tone={TONES[s]} onActivate={() => setStatus(status === s ? '' : s)} />
        ))}
      </div>
      <FilterBar onClear={filtered ? clear : undefined} summary={t('tools.summary', { shown: tasks.length, total: PLAN.tasks.length })}>
        <SearchField value={q} onChange={setQ} placeholder={t('tools.plan.search')} />
        <Select label={t('tools.plan.status')} hideLabel value={status} onChange={(e) => setStatus(e.target.value)} placeholder={t('tools.plan.allStatuses')} options={COLUMNS.map((s) => ({ value: s, label: statusLabel(s) }))} />
        <Select label={t('tools.plan.model')} hideLabel value={model} onChange={(e) => setModel(e.target.value)} placeholder={t('tools.plan.allModels')} options={models.map((m) => ({ value: m, label: m }))} />
        <Select label={t('tools.plan.step')} hideLabel value={step} onChange={(e) => setStep(e.target.value)} placeholder={t('tools.plan.allSteps')} options={steps.map((s) => ({ value: s, label: t('tools.plan.lane', { step: s }) }))} />
      </FilterBar>

      <Tabs
        label={t('tools.plan.views')}
        value={view}
        onChange={(id) => setView(id as PlanView)}
        tabs={VIEWS.map((v) => ({ id: v, label: t(`tools.plan.tab.${v}`), count: v === 'board' ? tasks.length : undefined }))}
      >
        {tasks.length === 0 ? (
          <EmptyState title={t('tools.plan.none')} description={t('tools.plan.noneHint')} glyph="◇">
            <Button onClick={clear}>{t('core.filter.clear')}</Button>
          </EmptyState>
        ) : view === 'board' ? (
          <div className="tools-board">
            <div className="tools-board__bar">
              <Placeholder what={t('tools.plan.moveWhat')}>
                <Button size="sm" icon="⇄">
                  {t('tools.plan.move')}
                </Button>
              </Placeholder>
            </div>
            <Kanban
              label={t('tools.plan.board')}
              columns={COLUMNS.map((s) => ({ id: s, title: statusLabel(s), tone: TONES[s] }))}
              cards={tasks.map((task) => ({
                id: task.id,
                columnId: task.status,
                title: task.title,
                subtitle: t('tools.plan.lane', { step: task.step }),
                meta: (
                  <span className="tools-card__meta">
                    <Badge tone="info">{task.model}</Badge>
                    {task.codes.map((c) => (
                      <Badge key={c}>{c}</Badge>
                    ))}
                    <span className="tools-muted">{blockerLabel(task.id)}</span>
                  </span>
                ),
              }))}
              onActivate={(card) => setOpenId(card.id)}
            />
          </div>
        ) : view === 'list' ? (
          <DataTable
            caption={t('tools.plan.list')}
            rows={tasks}
            rowKey={(task) => task.id}
            initialSort={{ key: 'step', dir: 'asc' }}
            onRowActivate={(task) => setOpenId(task.id)}
            columns={[
              { key: 'id', header: t('tools.plan.col.id'), sortable: true, render: (task) => <code>{task.id}</code> },
              { key: 'title', header: t('tools.plan.col.title'), sortable: true },
              { key: 'step', header: t('tools.plan.col.step'), sortable: true, sortValue: (task) => stepRank(task.step), render: (task) => t('tools.plan.lane', { step: task.step }) },
              { key: 'status', header: t('tools.plan.col.status'), sortable: true, render: (task) => <StatusPill status={task.status} label={statusLabel(task.status)} tone={TONES[task.status]} /> },
              { key: 'model', header: t('tools.plan.col.model'), sortable: true },
              { key: 'codes', header: t('tools.plan.col.codes'), sortValue: (task) => task.codes.join(' '), render: (task) => (task.codes.length ? task.codes.join(', ') : '—') },
              { key: 'deps', header: t('tools.plan.col.deps'), align: 'end', sortable: true, sortValue: (task) => task.dependsOn.length, render: (task) => task.dependsOn.length },
              { key: 'changelog', header: t('tools.plan.col.changelog'), sortable: true, sortValue: (task) => task.changelog ?? '', render: (task) => task.changelog ?? '—' },
            ]}
          />
        ) : (
          <DependencyTimeline tasks={tasks} onOpen={setOpenId} statusLabel={statusLabel} />
        )}
      </Tabs>

      <Drawer open={open !== undefined} onClose={() => setOpenId(null)} title={open ? `${open.id} · ${t('tools.plan.lane', { step: open.step })}` : ''}>
        {open && <TaskDetail task={open} onOpen={setOpenId} statusLabel={statusLabel} lang={lang} />}
      </Drawer>
    </>
  );
}

function TaskDetail({ task, onOpen, statusLabel, lang }: { task: PlanTask; onOpen: (id: string) => void; statusLabel: (s: PlanStatus) => string; lang: string }) {
  const { t } = useT();
  const blockers = planBlockers(task.id);
  const dependents = planDependents(task.id);
  const files = ['docs/plan/plan.json', ...(task.changelog ? [`docs/changelog/${task.changelog}-*.md`] : []), ...task.codes.filter((c) => /^[A-Z]+-\d{2}$/.test(c)).map((c) => `docs/pages/${c}.md`)];

  const links = (list: PlanTask[]) =>
    list.length === 0 ? (
      <span className="tools-muted">{t('tools.plan.noDeps')}</span>
    ) : (
      <ul className="tools-links">
        {list.map((d) => (
          <li key={d.id}>
            <Button size="sm" variant="ghost" onClick={() => onOpen(d.id)}>
              <StatusPill status={d.status} label={statusLabel(d.status)} tone={TONES[d.status]} /> {d.title}
            </Button>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="tools-detail" lang={lang}>
      <h3 className="tools-detail__title">{task.title}</h3>
      <KeyValue
        columns={1}
        items={[
          { key: t('tools.plan.col.status'), value: <StatusPill status={task.status} label={statusLabel(task.status)} tone={TONES[task.status]} /> },
          { key: t('tools.plan.col.step'), value: t('tools.plan.lane', { step: task.step }) },
          { key: t('tools.plan.col.model'), value: task.model },
          { key: t('tools.plan.col.codes'), value: task.codes.length ? task.codes.join(', ') : '—' },
          { key: t('tools.plan.owner'), value: task.owner ?? '—' },
          { key: t('tools.plan.depthLabel'), value: planDepth(task.id) },
          { key: t('tools.plan.col.changelog'), value: task.changelog ?? '—' },
        ]}
      />
      <h4 className="tools-h4">{t('tools.plan.dependsOn')}</h4>
      {links(task.dependsOn.map(planTask).filter((d): d is PlanTask => d !== undefined))}
      <h4 className="tools-h4">{t('tools.plan.blockedBy')}</h4>
      {links(blockers)}
      <h4 className="tools-h4">{t('tools.plan.dependents')}</h4>
      {links(dependents)}
      <h4 className="tools-h4">{t('tools.plan.files')}</h4>
      <ul className="tools-list">
        {files.map((f) => (
          <li key={f}>
            <code>{f}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Dependency-ordered swimlane: one lane per build-plan step, a task in the column of its dependency depth.
 * The Timeline organism needs real start / end dates and the plan has none (tasks are bound by dependencies,
 * not calendar days, D-037), so this is built from library primitives instead of inventing dates.
 */
function DependencyTimeline({ tasks, onOpen, statusLabel }: { tasks: PlanTask[]; onOpen: (id: string) => void; statusLabel: (s: PlanStatus) => string }) {
  const { t } = useT();
  const stageRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<ArrowLine[]>([]);

  const ordered = useMemo(() => planOrder(tasks), [tasks]);
  const lanes = useMemo(() => {
    const map = new Map<string, PlanTask[]>();
    for (const task of ordered) {
      const list = map.get(task.step);
      if (list) list.push(task);
      else map.set(task.step, [task]);
    }
    return [...map.entries()].sort((a, b) => stepRank(a[0]) - stepRank(b[0]));
  }, [ordered]);
  const depths = useMemo(() => new Map(ordered.map((task) => [task.id, planDepth(task.id)])), [ordered]);
  const maxDepth = useMemo(() => Math.max(0, ...depths.values()), [depths]);
  const shown = useMemo(() => new Set(ordered.map((task) => task.id)), [ordered]);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) {
      setLines([]);
      return;
    }
    if (window.innerWidth < 768) {
      setLines([]);
      return;
    }
    const base = stage.getBoundingClientRect();
    const box = (id: string) => stage.querySelector<HTMLElement>(`[data-task="${CSS.escape(id)}"]`)?.getBoundingClientRect();
    const next: ArrowLine[] = [];
    for (const task of ordered) {
      const to = box(task.id);
      if (!to) continue;
      for (const dep of task.dependsOn) {
        if (!shown.has(dep)) continue;
        const from = box(dep);
        if (!from) continue;
        next.push({
          id: `${dep}->${task.id}`,
          x1: from.right - base.left + stage.scrollLeft,
          y1: from.top + from.height / 2 - base.top + stage.scrollTop,
          x2: to.left - base.left + stage.scrollLeft,
          y2: to.top + to.height / 2 - base.top + stage.scrollTop,
        });
      }
    }
    setLines(next);
  }, [ordered, shown]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  /** Arrow keys walk the dependency order; Home / End jump to the ends (P-03, P-04). */
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const stage = stageRef.current;
    if (!stage) return;
    const bars = [...stage.querySelectorAll<HTMLButtonElement>('button[data-task]')];
    const i = bars.indexOf(document.activeElement as HTMLButtonElement);
    if (i === -1) return;
    e.preventDefault();
    const last = bars.length - 1;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? last : e.key === 'ArrowDown' || e.key === 'ArrowRight' ? Math.min(last, i + 1) : Math.max(0, i - 1);
    bars[next]?.focus();
  };

  const stageStyle = { ['--plan-depths' as string]: String(maxDepth + 1) };

  return (
    <div className="tools-timeline">
      <p className="tools-note">{t('tools.plan.timelineHint')}</p>
      <div className="tools-timeline__stage" ref={stageRef} role="group" aria-label={t('tools.plan.timeline')} onKeyDown={onKey} style={stageStyle}>
        <svg className="tools-timeline__arrows" aria-hidden="true" focusable="false">
          {lines.map((l) => (
            <path key={l.id} d={`M ${l.x1} ${l.y1} C ${l.x1 + 24} ${l.y1}, ${l.x2 - 24} ${l.y2}, ${l.x2} ${l.y2}`} />
          ))}
        </svg>
        {lanes.map(([lane, items]) => (
          <section key={lane} className="tools-lane" aria-labelledby={`lane-${lane}`}>
            <h3 id={`lane-${lane}`} className="tools-lane__title">
              {t('tools.plan.lane', { step: lane })}
            </h3>
            <ol className="tools-lane__rows">
              {items.map((task) => {
                const depth = depths.get(task.id) ?? 0;
                const deps = task.dependsOn.map((d) => planTask(d)?.title ?? d);
                return (
                  <li key={task.id} className="tools-lane__row" style={{ ['--plan-depth' as string]: String(depth) }}>
                    <button
                      type="button"
                      data-task={task.id}
                      className={`tools-bar tools-bar--${task.status}`}
                      onClick={() => onOpen(task.id)}
                      aria-label={t('tools.plan.taskLabel', { title: task.title, step: task.step, status: statusLabel(task.status), depth })}
                    >
                      <span className="tools-bar__title">{task.title}</span>
                      <span className="tools-bar__meta">
                        {statusLabel(task.status)} · {t('tools.plan.depth', { n: depth })} · {task.model}
                      </span>
                      {deps.length > 0 && <span className="tools-bar__deps">↳ {t('core.timeline.dependsOn', { items: deps.join(', ') })}</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
