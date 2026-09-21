import { Textarea } from './Textarea';

export default function TextareaExample() {
  return (
    <div style={{ maxWidth: '28rem' }}>
      <Textarea label="Notes" defaultValue="Temperatura 2700 K, rasante sobre muro texturizado." hint="Visible to the studio only" />
    </div>
  );
}
