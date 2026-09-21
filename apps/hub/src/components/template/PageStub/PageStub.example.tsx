import { PageStub } from './PageStub';

export default function PageStubExample() {
  return <PageStub code="O-01" title="Operations" description="Miguel's dashboard: schedule, tasks, suppliers, quotes, payments, alerts." sections={['Schedule', 'Pending tasks', 'Alerts', 'Payments']} />;
}
