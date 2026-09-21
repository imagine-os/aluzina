import type { BaseRow, EntityMap, EntityName } from './schema';

export type Row<E extends EntityName> = EntityMap[E];
/** What a caller supplies to create a row: everything but the base columns. */
export type NewRow<E extends EntityName> = Omit<Row<E>, keyof BaseRow>;
export type Patch<E extends EntityName> = Partial<NewRow<E>>;

export interface Query<E extends EntityName> {
  /** Equality filters; arrays match rows whose value is in the array. */
  where?: { [K in keyof Row<E>]?: Row<E>[K] | Row<E>[K][] };
  orderBy?: keyof Row<E>;
  dir?: 'asc' | 'desc';
  limit?: number;
}

export type ChangeKind = 'create' | 'update' | 'remove' | 'reset';

export interface Change<E extends EntityName = EntityName> {
  entity: E;
  kind: ChangeKind;
  id: string | null;
}

export type Unsubscribe = () => void;

/**
 * The data seam (D-016, P-14). MockProvider today (localStorage), Supabase behind the same
 * interface later; Company-OS only when Justin says so (P-15). Every method is async so the swap is silent.
 */
export interface DataProvider {
  readonly name: string;
  list<E extends EntityName>(entity: E, query?: Query<E>): Promise<Row<E>[]>;
  get<E extends EntityName>(entity: E, id: string): Promise<Row<E> | null>;
  create<E extends EntityName>(entity: E, data: NewRow<E>, id?: string): Promise<Row<E>>;
  update<E extends EntityName>(entity: E, id: string, patch: Patch<E>): Promise<Row<E>>;
  remove<E extends EntityName>(entity: E, id: string): Promise<void>;
  /** Fires after every write to `entity` (or to any entity when `entity` is `'*'`). */
  subscribe(entity: EntityName | '*', cb: (change: Change) => void): Unsubscribe;
  /** Drops local state and re-seeds (dev tools). */
  reset(): Promise<void>;
}

export function applyQuery<E extends EntityName>(rows: Row<E>[], query?: Query<E>): Row<E>[] {
  let out = rows;
  if (query?.where) {
    for (const [k, v] of Object.entries(query.where) as [keyof Row<E>, unknown][]) {
      if (v === undefined) continue;
      out = Array.isArray(v) ? out.filter((r) => (v as unknown[]).includes(r[k])) : out.filter((r) => r[k] === v);
    }
  }
  if (query?.orderBy) {
    const key = query.orderBy;
    const sign = query.dir === 'desc' ? -1 : 1;
    out = [...out].sort((a, b) => {
      const x = a[key];
      const y = b[key];
      if (x === y) return 0;
      if (x === null || x === undefined) return 1;
      if (y === null || y === undefined) return -1;
      return (x < y ? -1 : 1) * sign;
    });
  }
  if (query?.limit !== undefined) out = out.slice(0, query.limit);
  return out;
}
