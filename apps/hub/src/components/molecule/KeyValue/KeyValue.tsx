import type { ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './KeyValue.css';

export interface KeyValueItem {
  key: string;
  value: ReactNode;
}

export interface KeyValueProps {
  items: KeyValueItem[];
  /** Max columns on wide screens (default 2). */
  columns?: 1 | 2 | 3;
  className?: string;
}

/** Definition list for detail panels: label above value, wraps into columns. */
export function KeyValue({ items, columns = 2, className }: KeyValueProps) {
  return (
    <dl className={cx('kv', `kv--${columns}`, className)}>
      {items.map((it) => (
        <div className="kv__item" key={it.key}>
          <dt className="kv__key">{it.key}</dt>
          <dd className="kv__value">{it.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
