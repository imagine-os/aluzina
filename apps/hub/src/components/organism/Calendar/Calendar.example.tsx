import { useState } from 'react';
import { Calendar } from './Calendar';

export default function CalendarExample() {
  const [month, setMonth] = useState('2026-09');
  return (
    <Calendar
      label="Schedule"
      month={month}
      onMonthChange={setMonth}
      today="2026-09-21"
      events={[
        { id: '1', date: '2026-09-22T08:30:00', title: 'Reunión semanal de equipo', meta: 'Taller Aluzina', tone: 'neutral' },
        { id: '2', date: '2026-09-23T10:00:00', title: 'Mármoles de Antioquia: muestras', meta: 'HOY', tone: 'accent' },
        { id: '3', date: '2026-09-23', title: 'Cotizaciones mármol vencen', meta: 'Alert', tone: 'danger' },
        { id: '4', date: '2026-09-25T09:00:00', title: 'Concepto Café Provenza', meta: 'Provenza', tone: 'accent' },
        { id: '5', date: '2026-09-30', title: 'Pago 2 Ebanistería Robledo', meta: '$ 16.000.000', tone: 'warning' },
      ]}
    />
  );
}
