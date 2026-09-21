import { Timeline } from './Timeline';

export default function TimelineExample() {
  return (
    <Timeline
      label="Casa Laureles"
      today="2026-09-21"
      rows={[
        { id: 'a', label: 'Verificar medidas', start: '2026-09-15', end: '2026-09-24', tone: 'accent', meta: 'Sarai' },
        { id: 'b', label: 'Chequeo de consistencia', start: '2026-09-24', end: '2026-09-28', dependsOn: ['a'], meta: 'Sarai' },
        { id: 'c', label: 'Aprobación final', start: '2026-09-28', end: '2026-10-02', dependsOn: ['b'], tone: 'warning', meta: 'Alejandra' },
        { id: 'd', label: 'Presentación al cliente', start: '2026-10-03', end: '2026-10-03', dependsOn: ['c'], tone: 'success' },
      ]}
    />
  );
}
