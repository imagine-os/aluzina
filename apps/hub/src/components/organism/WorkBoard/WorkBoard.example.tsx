import { useMemo, useState } from 'react';
import type { Task } from '../../../data/schema';
import { useWorkLabels } from '../../../work/labels';
import { groupTasks } from '../../../work/model';
import { SAMPLE_CONTEXT, SAMPLE_TASKS } from '../../../work/sample';
import { toast } from '../../atom/Toast/Toast';
import { WorkBoard } from './WorkBoard';

export default function WorkBoardExample() {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const labels = useWorkLabels(SAMPLE_CONTEXT.people);
  const groups = useMemo(() => groupTasks(tasks, 'status', SAMPLE_CONTEXT, labels.groups), [tasks, labels]);
  return (
    <WorkBoard
      label="Casa Laureles"
      groups={groups}
      ctx={SAMPLE_CONTEXT}
      sort="priority"
      canEdit={() => true}
      canAdd
      onOpen={(x) => toast(x.title)}
      onMove={(task, to) => setTasks((ts) => ts.map((x) => (x.id === task.id && to.status ? { ...x, status: to.status } : x)))}
      onAdd={(g, title) => setTasks((ts) => [...ts, { ...ts[0], id: `n${ts.length}`, title, status: g.status ?? 'todo', dependsOn: [], tags: [], subtasks: [], startDate: null, dueDate: null }])}
    />
  );
}
