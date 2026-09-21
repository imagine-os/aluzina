import { Button } from '../Button/Button';
import { toast } from './Toast';

export default function ToastExample() {
  return <Button onClick={() => toast('Quote marked as selected')}>Show a toast</Button>;
}
