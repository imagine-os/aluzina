import { useState } from 'react';
import { Kanban, type KanbanCard } from './Kanban';

const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'Doing', tone: 'accent' as const },
  { id: 'blocked', title: 'Blocked', tone: 'warning' as const },
  { id: 'done', title: 'Done', tone: 'success' as const },
];

export default function KanbanExample() {
  const [cards, setCards] = useState<KanbanCard[]>([
    { id: 't1', columnId: 'doing', title: 'Verificar medidas cocina', subtitle: 'Casa Laureles', meta: 'Due 24 Sep' },
    { id: 't2', columnId: 'todo', title: 'Chequeo de consistencia sala', subtitle: 'Casa Laureles', meta: 'Due 28 Sep' },
    { id: 't3', columnId: 'blocked', title: 'Confirmar entrega luminarias', subtitle: 'HOY', meta: 'Waiting on quotes' },
    { id: 't4', columnId: 'done', title: 'Moodboard latón y ámbar', subtitle: 'Honey Valley' },
  ]);
  return <Kanban label="Tasks" columns={COLUMNS} cards={cards} onMove={(id, col) => setCards((cs) => cs.map((c) => (c.id === id ? { ...c, columnId: col } : c)))} />;
}
