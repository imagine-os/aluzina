import { applyQuery, type Change, type Conflict, type DataProvider, type NewRow, type Patch, type Query, type Row, type Unsubscribe, type WriteOptions } from './provider';
import { ENTITIES, type EntityName } from './schema';
import { runSeeds, SEED_VERSION } from './seed';

export const DATA_STORAGE_KEY = 'aluzina.data';
/** BroadcastChannel name every tab of the same origin joins for data changes (D-023). */
export const DATA_CHANNEL = 'aluzina-data';
/** Keep the activity table small (D-022): oldest rows are dropped past this. */
const ACTIVITY_LIMIT = 500;
/** Entities whose updates are not logged to `activity` (they are the log). */
const UNLOGGED: readonly EntityName[] = ['activity', 'comments'];

type Tables = { [E in EntityName]: Row<E>[] };

interface Stored {
  seedVersion: number;
  tables: Tables;
}

/** What one tab tells the others after a write. */
interface Broadcast {
  change: Change;
  tabId: string;
}

function emptyTables(): Tables {
  return Object.fromEntries(ENTITIES.map((e) => [e, []])) as unknown as Tables;
}

let counter = 0;
export function newId(prefix = 'row'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`;
}

const TAB_ID = newId('tab');

function summarize(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > 80 ? `${s.slice(0, 77)}…` : s;
}

/**
 * In-memory tables persisted to localStorage (D-016). Seeds run once per SEED_VERSION; writes persist on
 * every mutation; `subscribe` fires synchronously after each write so lists re-render from events (P-14).
 *
 * Multiuser (D-023, D-024): every write is broadcast on `BroadcastChannel('aluzina-data')` (fallback: the
 * `storage` event); a receiving tab reloads the tables from localStorage and emits the same change through
 * `subscribe`, so a second tab (another demo user) sees it live. Supabase Realtime replaces the channel
 * behind the same `subscribe`. Writes with `basedOn` older than the stored row are applied last-write-wins
 * and reported through `onConflict`. Every update also appends `activity` rows (one per changed field).
 */
export class MockProvider implements DataProvider {
  readonly name = 'mock';
  private tables: Tables;
  private listeners = new Map<EntityName | '*', Set<(c: Change) => void>>();
  private conflictListeners = new Set<(c: Conflict) => void>();
  private actor: string | null = null;
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.tables = this.load();
    this.listenToOtherTabs();
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

  /** Realtime seam (D-023): BroadcastChannel when available, the `storage` event otherwise. */
  private listenToOtherTabs() {
    if (typeof window === 'undefined') return;
    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(DATA_CHANNEL);
        this.channel.onmessage = (ev: MessageEvent<Broadcast>) => {
          if (!ev.data || ev.data.tabId === TAB_ID) return;
          this.tables = this.load();
          this.emit(ev.data.change);
        };
        return;
      } catch {
        this.channel = null;
      }
    }
    window.addEventListener('storage', (e) => {
      if (e.key !== DATA_STORAGE_KEY || e.newValue === null) return;
      this.tables = this.load();
      for (const entity of ENTITIES) this.emit({ entity, kind: 'reset', id: null });
    });
  }

  private emit(change: Change) {
    this.listeners.get(change.entity)?.forEach((cb) => cb(change));
    this.listeners.get('*')?.forEach((cb) => cb(change));
  }

  /** Persist, notify this tab, notify the other tabs. */
  private commit(change: Change) {
    this.persist();
    this.emit(change);
    try {
      this.channel?.postMessage({ change, tabId: TAB_ID } satisfies Broadcast);
    } catch {
      /* channel closed */
    }
  }

  private logActivity<E extends EntityName>(entity: E, id: string, before: Row<E>, after: Row<E>, patch: Patch<E>) {
    if (UNLOGGED.includes(entity)) return;
    const now = after.updated_at;
    const rows = this.tables.activity;
    for (const key of Object.keys(patch) as (keyof Row<E>)[]) {
      const from = before[key];
      const to = after[key];
      if (JSON.stringify(from) === JSON.stringify(to)) continue;
      rows.push({
        id: newId('act'),
        created_at: now,
        updated_at: now,
        updated_by: this.actor,
        entity,
        entityId: id,
        actorId: this.actor,
        field: String(key),
        from: summarize(from),
        to: summarize(to),
        at: now,
      });
    }
    if (rows.length > ACTIVITY_LIMIT) rows.splice(0, rows.length - ACTIVITY_LIMIT);
  }

  setActor(userId: string | null): void {
    this.actor = userId;
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
    const row = { ...data, id, created_at: now, updated_at: now, updated_by: this.actor } as Row<E>;
    (this.tables[entity] as Row<E>[]).push(row);
    this.commit({ entity, kind: 'create', id });
    return { ...row };
  }

  async update<E extends EntityName>(entity: E, id: string, patch: Patch<E>, options?: WriteOptions): Promise<Row<E>> {
    const rows = this.tables[entity] as Row<E>[];
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) throw new Error(`[data] ${entity}/${id} not found`);
    const before = rows[i];
    if (options?.basedOn && before.updated_at > options.basedOn) {
      const conflict: Conflict = { entity, id, by: before.updated_by ?? null, at: before.updated_at };
      this.conflictListeners.forEach((cb) => cb(conflict));
    }
    const row = { ...before, ...patch, id, updated_at: new Date().toISOString(), updated_by: this.actor } as Row<E>;
    rows[i] = row;
    this.logActivity(entity, id, before, row, patch);
    this.commit({ entity, kind: 'update', id });
    if (!UNLOGGED.includes(entity)) this.emit({ entity: 'activity', kind: 'create', id: null });
    return { ...row };
  }

  async remove<E extends EntityName>(entity: E, id: string): Promise<void> {
    const rows = this.tables[entity] as Row<E>[];
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return;
    (this.tables[entity] as Row<E>[]) = next;
    this.commit({ entity, kind: 'remove', id });
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

  onConflict(cb: (conflict: Conflict) => void): Unsubscribe {
    this.conflictListeners.add(cb);
    return () => this.conflictListeners.delete(cb);
  }

  async reset(): Promise<void> {
    try {
      localStorage.removeItem(DATA_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.tables = this.load();
    for (const e of ENTITIES) this.commit({ entity: e, kind: 'reset', id: null });
  }
}
