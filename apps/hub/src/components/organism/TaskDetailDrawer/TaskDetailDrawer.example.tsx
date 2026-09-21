import { useState } from 'react';
import { useTable } from '../../../data/DataContext';
import { SAMPLE_PEOPLE } from '../../../work/sample';
import { Button } from '../../atom/Button/Button';
import { TaskDetailDrawer } from './TaskDetailDrawer';

/** Live against the seeded data: opens the Casa Laureles living-room proposal (tsk-laureles-propuesta). */
export default function TaskDetailDrawerExample() {
  const [id, setId] = useState<string | null>(null);
  const { rows: tasks } = useTable('tasks');
  const { rows: sections } = useTable('sections');
  const { rows: projects } = useTable('projects');
  const { rows: deliverables } = useTable('deliverables', { orderBy: 'name' });
  return (
    <>
      <Button onClick={() => setId('tsk-laureles-propuesta')}>Open a task</Button>
      <TaskDetailDrawer taskId={id} onClose={() => setId(null)} canEdit={() => true} ctx={{ sections, projects, people: SAMPLE_PEOPLE, deliverables, today: '2026-09-21' }} allTasks={tasks} />
    </>
  );
}
