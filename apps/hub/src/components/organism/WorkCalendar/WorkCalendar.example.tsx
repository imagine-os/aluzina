import { useState } from 'react';
import { SAMPLE_CONTEXT, SAMPLE_TASKS } from '../../../work/sample';
import { toast } from '../../atom/Toast/Toast';
import { WorkCalendar } from './WorkCalendar';

export default function WorkCalendarExample() {
  const [month, setMonth] = useState('2026-09');
  return <WorkCalendar label="Casa Laureles" tasks={SAMPLE_TASKS} ctx={SAMPLE_CONTEXT} month={month} onMonthChange={setMonth} onOpen={(x) => toast(x.title)} />;
}
