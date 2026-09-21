import { useState } from 'react';
import { useTable } from '../../../data/DataContext';
import { SAMPLE_PEOPLE } from '../../../work/sample';
import { Button } from '../../atom/Button/Button';
import { TaskDetailDrawer } from './TaskDetailDrawer';

/** Live against the seeded data: opens the HOY marble comparison task (tsk-hoy-marmol). */
export default function TaskDetailDrawerExample() {
  const [id, setId] = useState<string | null>(null);
  const { rows: tasks } = useTable('tasks');
  const { rows: sections } = useTable('sections');
  const { rows: projects } = useTable('projects');
  return (
    <>
      <Button onClick={() => setId('tsk-hoy-marmol')}>Open a task</Button>
      <TaskDetailDrawer taskId={id} onClose={() => setId(null)} canEdit={() => true} ctx={{ sections, projects, people: SAMPLE_PEOPLE, today: '2026-09-21' }} allTasks={tasks} />
    </>
  );
}
