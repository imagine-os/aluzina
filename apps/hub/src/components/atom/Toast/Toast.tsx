import { useEffect, useState } from 'react';
import './Toast.css';

type Listener = (message: string) => void;
const listeners = new Set<Listener>();

/** Fire a transient message. Rendered by <Toaster/>, mounted once in App. */
export function toast(message: string): void {
  listeners.forEach((l) => l(message));
}

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const listener: Listener = (m) => {
      setMessage(m);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 2800);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="toaster" role="status" aria-live="polite">
      {message && <div className="toast">{message}</div>}
    </div>
  );
}
