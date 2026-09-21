import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoUserById } from '../auth/demoUsers';
import { useSession } from '../auth/SessionProvider';
import type { PresencePerson } from '../components/molecule/PresenceBar/PresenceBar';

/** BroadcastChannel every tab joins for presence heartbeats (D-023); Supabase Presence replaces it. */
export const PRESENCE_CHANNEL = 'aluzina-presence';
/** localStorage fallback key when BroadcastChannel is unavailable. */
export const PRESENCE_STORAGE_KEY = 'aluzina.presence';
export const HEARTBEAT_MS = 5_000;
export const EXPIRE_MS = 15_000;

interface Beat {
  tabId: string;
  userId: string;
  route: string;
  at: number;
  bye?: boolean;
}

export interface PresenceEntry extends PresencePerson {
  at: number;
  tabs: number;
}

interface PresenceValue {
  /** Everyone present (one entry per person, self included and flagged), newest first. */
  people: PresenceEntry[];
  selfId: string;
  tabId: string;
}

const Ctx = createContext<PresenceValue | null>(null);
const TAB_ID = `tab-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function currentRoute(): string {
  try {
    const h = window.location.hash.replace(/^#/, '');
    return h.split('?')[0] || '/';
  } catch {
    return '/';
  }
}

/**
 * Heartbeats `{ tabId, userId, route, at }` every 5 s over BroadcastChannel('aluzina-presence') (fallback:
 * a localStorage map + `storage` events), drops tabs silent for 15 s and says goodbye on unload (D-023).
 * `usePresence()` gives the PresenceBar its people; the DesktopShell and WorkHeader render it.
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [beats, setBeats] = useState<Record<string, Beat>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    const receive = (b: Beat) => {
      if (!b || b.tabId === TAB_ID) return;
      setBeats((s) => {
        if (b.bye) {
          if (!s[b.tabId]) return s;
          const { [b.tabId]: _gone, ...rest } = s;
          return rest;
        }
        return { ...s, [b.tabId]: b };
      });
    };
    const send = (b: Beat) => {
      if (channel) {
        try {
          channel.postMessage(b);
          return;
        } catch {
          /* closed */
        }
      }
      try {
        const map = JSON.parse(localStorage.getItem(PRESENCE_STORAGE_KEY) ?? '{}') as Record<string, Beat>;
        if (b.bye) delete map[b.tabId];
        else map[b.tabId] = b;
        localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(map));
      } catch {
        /* storage unavailable */
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PRESENCE_STORAGE_KEY || !e.newValue) return;
      try {
        const map = JSON.parse(e.newValue) as Record<string, Beat>;
        setBeats((s) => {
          const next: Record<string, Beat> = {};
          for (const b of Object.values(map)) if (b.tabId !== TAB_ID) next[b.tabId] = b;
          return { ...Object.fromEntries(Object.entries(s).filter(([k]) => map[k])), ...next };
        });
      } catch {
        /* corrupt */
      }
    };

    if ('BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel(PRESENCE_CHANNEL);
        channel.onmessage = (ev: MessageEvent<Beat>) => receive(ev.data);
      } catch {
        channel = null;
      }
    }
    if (!channel) window.addEventListener('storage', onStorage);

    const beat = () => send({ tabId: TAB_ID, userId: user.id, route: currentRoute(), at: Date.now() });
    beat();
    const timer = window.setInterval(() => {
      beat();
      const cutoff = Date.now() - EXPIRE_MS;
      setBeats((s) => {
        const alive = Object.fromEntries(Object.entries(s).filter(([, b]) => b.at >= cutoff));
        return Object.keys(alive).length === Object.keys(s).length ? s : alive;
      });
    }, HEARTBEAT_MS);
    const onRoute = () => beat();
    const bye = () => send({ tabId: TAB_ID, userId: user.id, route: currentRoute(), at: Date.now(), bye: true });
    window.addEventListener('hashchange', onRoute);
    window.addEventListener('beforeunload', bye);
    window.addEventListener('pagehide', bye);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('hashchange', onRoute);
      window.removeEventListener('beforeunload', bye);
      window.removeEventListener('pagehide', bye);
      window.removeEventListener('storage', onStorage);
      bye();
      channel?.close();
    };
  }, [user.id]);

  const value = useMemo<PresenceValue>(() => {
    const byUser = new Map<string, PresenceEntry>();
    const self = demoUserById(user.id);
    byUser.set(user.id, { id: user.id, name: self?.name ?? user.id, initials: self?.initials, route: currentRoute(), self: true, at: Date.now(), tabs: 1 });
    for (const b of Object.values(beats).sort((a, c) => c.at - a.at)) {
      const existing = byUser.get(b.userId);
      if (existing) {
        existing.tabs += 1;
        continue;
      }
      const u = demoUserById(b.userId);
      byUser.set(b.userId, { id: b.userId, name: u?.name ?? b.userId, initials: u?.initials, route: b.route, at: b.at, tabs: 1 });
    }
    return { people: [...byUser.values()], selfId: user.id, tabId: TAB_ID };
  }, [beats, user.id]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePresence(): PresenceValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePresence must be used inside <PresenceProvider>');
  return ctx;
}
