import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoUserById } from '../auth/demoUsers';
import { useSession } from '../auth/SessionProvider';
import { toast } from '../components/atom/Toast/Toast';
import { useT } from '../i18n/I18nProvider';
import { MockProvider } from './MockProvider';
import type { DataProvider, Query, Row } from './provider';
import type { EntityName } from './schema';

const Ctx = createContext<DataProvider | null>(null);

/** Mounts the one provider for the app (MockProvider today, D-016). Pass `provider` to swap it in tests. */
export function DataContextProvider({ provider, children }: { provider?: DataProvider; children: ReactNode }) {
  const value = useMemo(() => provider ?? new MockProvider(), [provider]);
  return (
    <Ctx.Provider value={value}>
      <DataSession provider={value} />
      {children}
    </Ctx.Provider>
  );
}

/** Tells the provider who is writing and turns conflicts (D-024) into a toast naming the other writer. */
function DataSession({ provider }: { provider: DataProvider }) {
  const { user } = useSession();
  const { t } = useT();
  useEffect(() => {
    provider.setActor(user.id);
  }, [provider, user.id]);
  useEffect(
    () =>
      provider.onConflict((c) => {
        const name = (c.by && demoUserById(c.by)?.name) ?? t('core.data.someone');
        toast(t('core.data.conflict', { name }));
      }),
    [provider, t],
  );
  return null;
}

/** The raw provider: `const data = useData(); await data.update('quotes', id, { status: 'selected' })`. */
export function useData(): DataProvider {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useData must be used inside <DataContextProvider>');
  return ctx;
}

export interface TableState<E extends EntityName> {
  rows: Row<E>[];
  loading: boolean;
  refresh: () => void;
}

/**
 * Live list: reloads whenever the entity changes (subscribe). The query is compared by value,
 * so an inline object literal is fine.
 */
export function useTable<E extends EntityName>(entity: E, query?: Query<E>): TableState<E> {
  const data = useData();
  const [rows, setRows] = useState<Row<E>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const queryKey = JSON.stringify(query ?? null);

  useEffect(() => {
    let alive = true;
    const q = JSON.parse(queryKey) as Query<E> | null;
    data.list(entity, q ?? undefined).then((r) => {
      if (!alive) return;
      setRows(r);
      setLoading(false);
    });
    const unsub = data.subscribe(entity, () => setTick((n) => n + 1));
    return () => {
      alive = false;
      unsub();
    };
  }, [data, entity, queryKey, tick]);

  const refresh = useCallback(() => setTick((n) => n + 1), []);
  return { rows, loading, refresh };
}

export interface RowState<E extends EntityName> {
  row: Row<E> | null;
  loading: boolean;
}

/** One live row by id. */
export function useRow<E extends EntityName>(entity: E, id: string | null | undefined): RowState<E> {
  const data = useData();
  const [row, setRow] = useState<Row<E> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    if (!id) {
      setRow(null);
      setLoading(false);
      return;
    }
    data.get(entity, id).then((r) => {
      if (!alive) return;
      setRow(r);
      setLoading(false);
    });
    const unsub = data.subscribe(entity, (c) => {
      if (c.id === id || c.kind === 'reset') setTick((n) => n + 1);
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [data, entity, id, tick]);

  return { row, loading };
}
