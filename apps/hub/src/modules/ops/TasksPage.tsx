import { useMemo, useState } from 'react';
import { useCan, useSession } from '../../auth/SessionProvider';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Kanban, type KanbanCard } from '../../components/organism/Kanban/Kanban';
import { useData, useTable } from '../../data/DataContext';
import type { Task, TaskStatus } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { dueLabel, useLookups } from './helpers';
import './ops.css';
import { tasksSpec } from './specs';

const COLUMNS: TaskStatus[] = ['todo', 'doing', 'blocked', 'done'];
const ROLES = ['ops', 'studio', 'founder', 'brand'];

export function TasksPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { user } = useSession();
  const { projects, projectName, userName } = useLookups();
  const { rows: tasks } = useTable('tasks', { orderBy: 'dueDate' });
  const [query, setQuery] = useState('');
  const [project, setProject] = useState('');
  const [role, setRole] = useState('');
  const [mine, setMine] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      tasks.filter((x) => {
        if (query && !x.title.toLowerCase().includes(query.toLowerCase())) return false;
        if (project && x.projectId !== project) return false;
        if (role && x.ownerRole !== role) return false;
        if (mine && x.assigneeId !== user.id) return false;
        return true;
      }),
    [tasks, query, project, role, mine, user.id],
  );

  const cards = useMemo<KanbanCard[]>(
    () =>
      filtered.map((x) => ({
        id: x.id,
        columnId: x.status,
        title: x.title,
        subtitle: projectName(x.projectId) ?? t('ops.common.internal'),
        meta: `${dueLabel(x.dueDate, t)} · ${userName(x.assigneeId)}`,
      })),
    [filtered, projectName, userName, t],
  );

  const open = openId ? tasks.find((x) => x.id === openId) ?? null : null;

  const move = async (id: string, to: string) => {
    await data.update('tasks', id, { status: to as TaskStatus });
    toast(t('ops.tasks.moved'));
  };
  const complete = async (task: Task) => {
    await data.update('tasks', task.id, { status: 'done' });
    toast(t('ops.tasks.moved'));
    setOpenId(null);
  };

  const clear = () => {
    setQuery('');
    setProject('');
    setRole('');
    setMine(false);
  };

  return (
    <div className="ops-stack">
      <PageHeader
        code={tasksSpec.code}
        title={t('ops.tasks.title')}
        subtitle={t('ops.tasks.subtitle')}
        breadcrumb={[{ label: t('ops.nav.home'), to: '/ops' }, { label: t('ops.tasks.title') }]}
        actions={
          <Placeholder what={t('ops.tasks.newWhat')}>
            <Button variant="primary">{t('ops.tasks.new')}</Button>
          </Placeholder>
        }
      />

      <FilterBar onClear={clear} summary={t('ops.common.count', { n: filtered.length, total: tasks.length })}>
        <SearchField value={query} onChange={setQuery} placeholder={t('ops.tasks.searchPlaceholder')} />
        <Select
          className="ops-filter-field"
          label={t('ops.common.project')}
          hideLabel
          value={project}
          onChange={(e) => setProject(e.target.value)}
          options={[{ value: '', label: t('ops.common.allProjects') }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
        />
        <Select
          className="ops-filter-field"
          label={t('ops.common.role')}
          hideLabel
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[{ value: '', label: t('ops.common.role') }, ...ROLES.map((r) => ({ value: r, label: t(`core.role.${r}`) }))]}
        />
        <Checkbox label={t('ops.common.mine')} checked={mine} onChange={(e) => setMine(e.target.checked)} />
      </FilterBar>

      <Kanban
        label={t('ops.tasks.board')}
        columns={COLUMNS.map((c) => ({ id: c, title: t(`ops.tasks.col.${c}`), tone: c === 'blocked' ? 'warning' : c === 'done' ? 'success' : 'neutral' }))}
        cards={cards}
        onMove={can('tasks.manage') ? move : undefined}
        onActivate={(card) => setOpenId(card.id)}
      />

      <Drawer open={open !== null} onClose={() => setOpenId(null)} title={open?.title ?? t('ops.common.detail')}>
        {open && (
          <>
            <StatusPill status={open.status} />
            <KeyValue
              columns={1}
              items={[
                { key: t('ops.common.project'), value: projectName(open.projectId) ?? t('ops.common.internal') },
                { key: t('ops.tasks.assignee'), value: userName(open.assigneeId) },
                { key: t('ops.common.role'), value: t(`core.role.${open.ownerRole}`) },
                { key: t('ops.tasks.priority'), value: t(`ops.priority.${open.priority}`) },
                { key: t('ops.common.due'), value: `${formatDate(open.dueDate, lang)} · ${dueLabel(open.dueDate, t)}` },
                {
                  key: t('ops.tasks.dependsOn'),
                  value: open.dependsOn.length
                    ? open.dependsOn.map((id) => tasks.find((y) => y.id === id)?.title ?? id).join(', ')
                    : '—',
                },
              ]}
            />
            {can('tasks.manage') && open.status !== 'done' && (
              <div className="ops-drawer-section">
                <Button variant="primary" onClick={() => complete(open)}>
                  {t('ops.tasks.complete')}
                </Button>
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
