import { useState } from 'react';
import { Button } from '../../atom/Button/Button';
import { KeyValue } from '../../molecule/KeyValue/KeyValue';
import { Drawer } from './Drawer';

export default function DrawerExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Casa Laureles" footer={<Button variant="primary" onClick={() => setOpen(false)}>Done</Button>}>
        <KeyValue columns={1} items={[{ key: 'Client', value: 'Familia Restrepo' }, { key: 'Phase', value: 'development' }, { key: 'Budget', value: '$ 185.000.000' }]} />
      </Drawer>
    </>
  );
}
