import { useMemo, useState } from 'react';
import type { Task } from '../../../data/schema';
import { useWorkLabels } from '../../../work/labels';
import { groupTasks } from '../../../work/model';
import { SAMPLE_CONTEXT, SAMPLE_TASKS } from '../../../work/sample';
import { toast } from '../../atom/Toast/Toast';
import { statusPatch, WorkList } from './WorkList';

export default function WorkListExample() {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const labels = useWorkLabels(SAMPLE_CONTEXT.people);
  const groups = useMemo(() => groupTasks(tasks, 'section', SAMPLE_CONTEXT, labels.groups), [tasks, labels]);
  const patch = (task: Task, p: Partial<Task>) => setTasks((ts) => ts.map((x) => (x.id === task.id ? { ...x, ...p } : x)));
  return (
    <WorkList
      label="Casa Laureles"
      groups={groups}
      ctx={SAMPLE_CONTEXT}
      sort="order"
      canEdit={(x) => x.assigneeId !== 'u-alejandra'}
      canAdd
      onOpen={(x) => toast(x.title)}
      onPatch={patch}
      onToggleComplete={(x) => patch(x, statusPatch(x.status === 'done' ? 'todo' : 'done', SAMPLE_CONTEXT.today))}
      onAdd={(g, title) => setTasks((ts) => [...ts, { ...ts[0], id: `n${ts.length}`, title, sectionId: g.sectionId ?? null, status: 'todo', dependsOn: [], tags: [], subtasks: [], startDate: null, dueDate: null }])}
    />
  );
}
