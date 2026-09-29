import { useState } from 'react';
import { Button } from '../../atom/Button/Button';
import { OverflowMenu } from './OverflowMenu';

export default function OverflowMenuExample() {
  const [tilt, setTilt] = useState(true);
  const [size, setSize] = useState('m');
  return (
    <OverflowMenu label="More" aria-label="More view controls" align="start">
      <Button size="sm" variant="ghost" aria-pressed={tilt} onClick={() => setTilt(!tilt)}>
        {tilt ? 'Tilted' : 'Flat'}
      </Button>
      <Button size="sm" variant="ghost">
        Reset
      </Button>
      <div className="omenu__row" role="group" aria-label="Size" data-keep-open="">
        <span className="omenu__rowlabel">Size</span>
        <span>
          {['s', 'm', 'l'].map((s) => (
            <Button key={s} size="sm" variant={size === s ? 'primary' : 'secondary'} aria-pressed={size === s} onClick={() => setSize(s)}>
              {s.toUpperCase()}
            </Button>
          ))}
        </span>
      </div>
      <Button size="sm" variant="ghost" disabled>
        Disabled row
      </Button>
    </OverflowMenu>
  );
}
