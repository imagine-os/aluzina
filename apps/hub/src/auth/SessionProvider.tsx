import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_USER_ID, DEMO_USERS, demoUserById, demoUserForRole, type DemoUser } from './demoUsers';
import { hasPermission } from './permissions';
import { isRoleId, type Role } from './roles';

export const SESSION_STORAGE_KEY = 'aluzina.session';
/** Mirror of `devMode` kept for the pre-paint script in index.html and older tooling. */
export const DEV_MODE_STORAGE_KEY = 'aluzina.devMode';

interface StoredSession {
  userId: string;
  viewAs: Role | null;
  devMode: boolean;
}

export interface Session {
  /** The demo identity (mocked until real auth, guards stay real: P-12). */
  user: DemoUser;
  /** Effective role: `viewAs` when set, otherwise the user's own role. */
  role: Role;
  viewingAs: Role | null;
  users: readonly DemoUser[];
  /** Become the demo user of a role (or a user id); clears `viewAs`. */
  switchUser: (roleOrUserId: string) => void;
  /** Look at the system as another role without changing identity (needs `session.viewAs`). */
  viewAs: (role: Role | null) => void;
  can: (permission: string) => boolean;
  devMode: boolean;
  setDevMode: (on: boolean) => void;
  toggleDevMode: () => void;
}

const Ctx = createContext<Session | null>(null);

function readQueryRole(): string | null {
  try {
    const search = new URLSearchParams(window.location.search).get('as');
    if (search) return search;
    const hash = window.location.hash;
    const q = hash.indexOf('?');
    if (q !== -1) return new URLSearchParams(hash.slice(q + 1)).get('as');
  } catch {
    /* no window */
  }
  return null;
}

function readInitial(): StoredSession {
  let stored: Partial<StoredSession> = {};
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<StoredSession>;
    if (stored.devMode === undefined) stored.devMode = localStorage.getItem(DEV_MODE_STORAGE_KEY) === 'on';
  } catch {
    /* storage unavailable or corrupt */
  }
  let userId = typeof stored.userId === 'string' && demoUserById(stored.userId) ? stored.userId : DEFAULT_USER_ID;
  // `?as=<role>` on first load (thumbnails, QA, deep links): documented in docs/reference/surfaces.md.
  const as = readQueryRole();
  if (as && isRoleId(as)) {
    const u = demoUserForRole(as);
    if (u) userId = u.id;
    stored.viewAs = null;
  }
  return { userId, viewAs: typeof stored.viewAs === 'string' ? stored.viewAs : null, devMode: Boolean(stored.devMode) };
}

function persist(s: StoredSession) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
    localStorage.setItem(DEV_MODE_STORAGE_KEY, s.devMode ? 'on' : 'off');
  } catch {
    /* storage unavailable */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredSession>(readInitial);

  useEffect(() => {
    persist(state);
    if (state.devMode) document.documentElement.setAttribute('data-dev', 'on');
    else document.documentElement.removeAttribute('data-dev');
    document.documentElement.setAttribute('data-role', state.viewAs ?? demoUserById(state.userId)?.role ?? '');
  }, [state]);

  const switchUser = useCallback((roleOrUserId: string) => {
    const u = demoUserById(roleOrUserId) ?? demoUserForRole(roleOrUserId);
    if (!u) return;
    setState((s) => ({ ...s, userId: u.id, viewAs: null }));
  }, []);

  const user = demoUserById(state.userId) ?? DEMO_USERS[0];
  const role = state.viewAs ?? user.role;

  const viewAs = useCallback(
    (next: Role | null) => {
      if (next !== null && !hasPermission(user.role, 'session.viewAs')) return;
      setState((s) => ({ ...s, viewAs: next }));
    },
    [user.role],
  );

  const setDevMode = useCallback((on: boolean) => setState((s) => ({ ...s, devMode: on })), []);
  const toggleDevMode = useCallback(() => setState((s) => ({ ...s, devMode: !s.devMode })), []);
  const can = useCallback((permission: string) => hasPermission(role, permission), [role]);

  const value = useMemo<Session>(
    () => ({ user, role, viewingAs: state.viewAs, users: DEMO_USERS, switchUser, viewAs, can, devMode: state.devMode, setDevMode, toggleDevMode }),
    [user, role, state.viewAs, state.devMode, switchUser, viewAs, can, setDevMode, toggleDevMode],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

/** `const can = useCan(); if (can('quotes.compare')) ...` */
export function useCan(): (permission: string) => boolean {
  return useSession().can;
}

/** Dev mode lives in the session (was DevModeProvider); same shape as before for callers. */
export function useDevMode(): Pick<Session, 'devMode' | 'setDevMode' | 'toggleDevMode'> {
  const { devMode, setDevMode, toggleDevMode } = useSession();
  return { devMode, setDevMode, toggleDevMode };
}
