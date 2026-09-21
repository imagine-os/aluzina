import { Button } from '../../atom/Button/Button';
import { EmptyState } from './EmptyState';

export default function EmptyStateExample() {
  return (
    <EmptyState title="No quotes yet" description="Request the first quote from a supplier and it will appear here." glyph="◇">
      <Button variant="primary">Request a quote</Button>
    </EmptyState>
  );
}
