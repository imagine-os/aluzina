import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../../design/cx';
import { useT } from '../../../i18n/I18nProvider';
import { Button, type ButtonVariant } from '../../atom/Button/Button';
import { Skeleton } from '../../atom/Skeleton/Skeleton';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './DataTable.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  /** Value used for sorting; defaults to `row[key]`. */
  sortValue?: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  align?: 'start' | 'end';
  width?: string;
}

export interface RowAction<T> {
  id: string;
  label: string;
  onClick: (row: T) => void;
  variant?: ButtonVariant;
  /** Hide the action for some rows. */
  when?: (row: T) => boolean;
}

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Table caption (visually hidden); required so the table has a name. */
  caption: string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Rows become focusable; Enter / Space or click activates. */
  onRowActivate?: (row: T) => void;
  rowActions?: RowAction<T>[];
  initialSort?: SortState;
  dense?: boolean;
}

function defaultValue<T>(row: T, key: string): string | number | null | undefined {
  const v = (row as Record<string, unknown>)[key];
  return typeof v === 'string' || typeof v === 'number' ? v : v == null ? null : String(v);
}

/**
 * Sortable table with keyboard row focus (arrows, Enter) and per-row actions; collapses to stacked
 * cards under 768 px (each cell shows its header via data-label). Never hand-roll a table in a page (P-07).
 */
export function DataTable<T>({ columns, rows, rowKey, caption, loading, emptyTitle, emptyDescription, onRowActivate, rowActions, initialSort, dense }: DataTableProps<T>) {
  const { t } = useT();
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const val = (r: T) => (col?.sortValue ? col.sortValue(r) : defaultValue(r, sort.key));
    const sign = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * sign;
      return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' }) * sign;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key: string) => setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const onRowKey = (e: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    const tr = e.currentTarget;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const sibling = e.key === 'ArrowDown' ? tr.nextElementSibling : tr.previousElementSibling;
      (sibling as HTMLElement | null)?.focus();
    } else if ((e.key === 'Enter' || e.key === ' ') && e.target === tr && onRowActivate) {
      e.preventDefault();
      onRowActivate(row);
    }
  };

  const hasActions = rowActions && rowActions.length > 0;

  if (loading) {
    return (
      <div className="table-wrap" aria-busy="true">
        <Skeleton lines={4} />
      </div>
    );
  }
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle ?? t('core.table.empty')} description={emptyDescription} glyph="▤" />;
  }

  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={caption}>
      <table className={cx('table', dense && 'table--dense', onRowActivate && 'table--interactive')}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th key={c.key} scope="col" style={{ width: c.width }} className={cx(c.align === 'end' && 'table__cell--end')} aria-sort={active ? (sort?.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortable ? (
                    <button type="button" className="table__sort" onClick={() => toggleSort(c.key)} aria-label={t('core.table.sortBy', { column: c.header })}>
                      {c.header}
                      <span className="table__sort-glyph" aria-hidden="true">{active ? (sort?.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
            {hasActions && <th scope="col" className="table__cell--end">{t('core.table.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={rowKey(row)} tabIndex={onRowActivate ? 0 : undefined} onKeyDown={onRowActivate ? (e) => onRowKey(e, row) : undefined} onClick={onRowActivate ? (e) => { if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return; onRowActivate(row); } : undefined}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.header} className={cx(c.align === 'end' && 'table__cell--end')}>
                  {c.render ? c.render(row) : (defaultValue(row, c.key) ?? '—')}
                </td>
              ))}
              {hasActions && (
                <td data-label={t('core.table.actions')} className="table__cell--end table__actions">
                  {rowActions.filter((a) => !a.when || a.when(row)).map((a) => (
                    <Button key={a.id} size="sm" variant={a.variant ?? 'ghost'} onClick={() => a.onClick(row)}>
                      {a.label}
                    </Button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
