import { useState } from 'react';
import { DEFAULT_VIEW_STATE, type SavedView, type ViewState } from '../../../work/views';
import { SAMPLE_PEOPLE, SAMPLE_PROJECTS } from '../../../work/sample';
import { toast } from '../../atom/Toast/Toast';
import { WorkHeader } from './WorkHeader';

export default function WorkHeaderExample() {
  const [state, setState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  const [views, setViews] = useState<SavedView[]>([{ id: 'v1', name: 'Mis tareas de la semana', ...DEFAULT_VIEW_STATE, view: 'board' }]);
  return (
    <WorkHeader
      label="Casa Laureles"
      state={state}
      onChange={(n) => setState((s) => ({ ...s, ...n }))}
      counts={{ list: 8, board: 8, timeline: 7, calendar: 8 }}
      people={SAMPLE_PEOPLE}
      projects={SAMPLE_PROJECTS}
      tags={['aprobación', 'cliente', 'iluminación', 'proveedores']}
      onAddTask={() => toast('Add task')}
      savedViews={views}
      onSaveView={(name) => setViews((v) => [...v, { id: `v${v.length + 1}`, name, ...state }])}
      onApplyView={(id) => {
        const v = views.find((x) => x.id === id);
        if (v) setState({ view: v.view, filters: v.filters, sort: v.sort, groupBy: v.groupBy });
      }}
      onDeleteView={(id) => setViews((v) => v.filter((x) => x.id !== id))}
    />
  );
}
