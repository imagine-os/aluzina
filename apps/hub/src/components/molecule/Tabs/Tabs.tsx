import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './Tabs.css';

export interface TabDef {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabDef[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name of the tab list. */
  label: string;
  /** Panel content for the current tab. */
  children?: ReactNode;
}

/** WAI-ARIA tabs: arrow keys move between tabs (roving tabindex), Home/End jump, panel linked by ids. */
export function Tabs({ tabs, value, onChange, label, children }: TabsProps) {
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === value);
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].id);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
  };

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={label} ref={listRef} onKeyDown={onKey}>
        {tabs.map((t) => {
          const selected = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel`}
              tabIndex={selected ? 0 : -1}
              className={cx('tabs__tab', selected && 'tabs__tab--selected')}
              onClick={() => onChange(t.id)}
            >
              {t.label}
              {t.count !== undefined && <span className="tabs__count">{t.count}</span>}
            </button>
          );
        })}
      </div>
      {children !== undefined && (
        <div className="tabs__panel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${value}`} tabIndex={0}>
          {children}
        </div>
      )}
    </div>
  );
}
