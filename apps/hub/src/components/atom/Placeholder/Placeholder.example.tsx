import { Button } from '../Button/Button';
import { Card } from '../../molecule/Card/Card';
import { Placeholder } from './Placeholder';

export default function PlaceholderExample() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: '28rem' }}>
      <Placeholder what="export the comparison as PDF">
        <Card title="Export PDF" subtitle="Plain content: the Placeholder is the button" />
      </Placeholder>
      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
        <Placeholder what="send the quote request to the supplier">
          <Button variant="primary">Request quote</Button>
        </Placeholder>
        <Placeholder what="download the report">
          <Button>Download</Button>
        </Placeholder>
      </div>
    </div>
  );
}
