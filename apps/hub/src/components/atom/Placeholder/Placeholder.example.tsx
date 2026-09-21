import { Card } from '../../molecule/Card/Card';
import { Placeholder } from './Placeholder';

export default function PlaceholderExample() {
  return (
    <div style={{ maxWidth: '20rem' }}>
      <Placeholder what="export the comparison as PDF">
        <Card title="Export PDF" subtitle="Not wired yet: hover, focus or activate" />
      </Placeholder>
    </div>
  );
}
