import { Button } from '../../atom/Button/Button';
import { PageHeader } from './PageHeader';

export default function PageHeaderExample() {
  return (
    <PageHeader
      code="O-02"
      title="Quotes and comparisons"
      subtitle="Supplier quotes grouped for side-by-side comparison."
      breadcrumb={[{ label: 'Operations', to: '/ops' }, { label: 'Quotes' }]}
      actions={
        <>
          <Button>Export</Button>
          <Button variant="primary">Request quote</Button>
        </>
      }
    />
  );
}
