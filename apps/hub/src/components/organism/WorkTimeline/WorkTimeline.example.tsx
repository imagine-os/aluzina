import { useMemo, useState } from 'react';
import { useWorkLabels } from '../../../work/labels';
import { groupTasks, type TimelineZoom } from '../../../work/model';
import { SAMPLE_CONTEXT, SAMPLE_TASKS } from '../../../work/sample';
import { toast } from '../../atom/Toast/Toast';
import { WorkTimeline } from './WorkTimeline';

export default function WorkTimelineExample() {
  const [zoom, setZoom] = useState<TimelineZoom>('week');
  const labels = useWorkLabels(SAMPLE_CONTEXT.people);
  const groups = useMemo(() => groupTasks(SAMPLE_TASKS, 'section', SAMPLE_CONTEXT, labels.groups), [labels]);
  return <WorkTimeline label="Casa Laureles" groups={groups} ctx={SAMPLE_CONTEXT} sort="dueDate" zoom={zoom} onZoom={setZoom} onOpen={(x) => toast(x.title)} />;
}
