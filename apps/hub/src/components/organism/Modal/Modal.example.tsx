import { useState } from 'react';
import { Button } from '../../atom/Button/Button';
import { Modal } from './Modal';

export default function ModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Approve proposal?" footer={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => setOpen(false)}>Approve</Button></>}>
        Casa Laureles: sala y comedor. The client will be notified.
      </Modal>
    </>
  );
}
