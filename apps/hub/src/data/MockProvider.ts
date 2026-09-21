import { applyQuery, type Change, type DataProvider, type NewRow, type Patch, type Query, type Row, type Unsubscribe } from './provider';
import { ENTITIES, type EntityName } from './schema';
import { runSeeds, SEED_VERSION } from './seed';

export const DATA_STORAGE_KEY = 'aluzina.data';

type Tables = { [E in EntityName]: Row<E>[] };

interface Stored {
  seedVersion: number;
  tables: Tables;
}

function emptyTables(): Tables {
  return Object.fromEntries(ENTITIES.map((e) => [e, []])) as unknown as Tables;
}

let counter = 0;
export function newId(prefix = 'row'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`;
}

/**
 * In-memory tables persisted to localStorage (D-016). Seeds run once per SEED_VERSION; writes persist
 * on every mutation; `subscribe` fires synchronously after each write so lists re-render from events (P-14).
 */
export class MockProvider implements DataProvider {
  readonly name = 'mock';
  private tables: Tables;
  private listeners = new Map<EntityName | '*', Set<(c: Change) => void>>();

  constructor() {
    this.tables = this.load();
  }

  private load(): Tables {
    try {
      const raw = localStorage.getItem(DATA_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Stored;
        if (stored.seedVersion === SEED_VERSION && stored.tables) return { ...emptyTables(), ...stored.tables };
      }
    } catch {
      /* storage unavailable or corrupt: fall through to a fresh seed */
    }
    const tables = emptyTables();
    runSeeds(tables);
    this.persist(tables);
    return tables;
  }

  private persist(tables = this.tables) {
    try {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify({ seedVersion: SEED_VERSION, tables } satisfies Stored));
    } catch {
      /* storage unavailable: memory only */
    }
  }

  private emit(change: Change) {
    this.listeners.get(change.entity)?.forEach((cb) => cb(change));
    this.listeners.get('*')?.forEach((cb) => cb(change));
  }

  async list<E extends EntityName>(entity: E, query?: Query<E>): Promise<Row<E>[]> {
    return applyQuery(this.tables[entity] as Row<E>[], query).map((r) => ({ ...r }));
  }

  async get<E extends EntityName>(entity: E, id: string): Promise<Row<E> | null> {
    const row = (this.tables[entity] as Row<E>[]).find((r) => r.id === id);
    return row ? { ...row } : null;
  }

  async create<E extends EntityName>(entity: E, data: NewRow<E>, id = newId(entity.slice(0, 3))): Promise<Row<E>> {
    const now = new Date().toISOString();
    const row = { ...data, id, created_at: now, updated_at: now } as Row<E>;
    (this.tables[entity] as Row<E>[]).push(row);
    this.persist();
    this.emit({ entity, kind: 'create', id });
    return { ...row };
  }

  async update<E extends EntityName>(entity: E, id: string, patch: Patch<E>): Promise<Row<E>> {
    const rows = this.tables[entity] as Row<E>[];
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) throw new Error(`[data] ${entity}/${id} not found`);
    const row = { ...rows[i], ...patch, id, updated_at: new Date().toISOString() } as Row<E>;
    rows[i] = row;
    this.persist();
    this.emit({ entity, kind: 'update', id });
    return { ...row };
  }

  async remove<E extends EntityName>(entity: E, id: string): Promise<void> {
    const rows = this.tables[entity] as Row<E>[];
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return;
    (this.tables[entity] as Row<E>[]) = next;
    this.persist();
    this.emit({ entity, kind: 'remove', id });
  }

  subscribe(entity: EntityName | '*', cb: (change: Change) => void): Unsubscribe {
    let set = this.listeners.get(entity);
    if (!set) {
      set = new Set();
      this.listeners.set(entity, set);
    }
    set.add(cb);
    return () => set?.delete(cb);
  }

  async reset(): Promise<void> {
    try {
      localStorage.removeItem(DATA_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.tables = this.load();
    for (const e of ENTITIES) this.emit({ entity: e, kind: 'reset', id: null });
  }
}
