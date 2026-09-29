import { useCallback, useEffect, useRef, useState } from 'react';
import { clientHub } from './registry';
import type { HubMap } from './hubMap.types';

/**
 * Loading a client's hub map (W-05, D-16): the bundled snapshot renders first (its own lazy chunk), the live map is
 * fetched in parallel with the browser's default HTTP cache and replaces it when it arrives. In memory the live map
 * is kept 10 minutes (stale-while-revalidate: an older copy renders at once and is refreshed in the background).
 * A failed fetch (offline, 404 before the client publishes, a map with another schema) keeps the snapshot and says so.
 */
export type HubMapSource = 'live' | 'snapshot';

export interface HubMapState {
  map: HubMap | null;
  source: HubMapSource | null;
  /** When the rendered map was fetched (live) or generated (snapshot), ISO. */
  asOf: string | null;
  /** Why the live map is not the one rendered ('' while it is, or while the first fetch runs). */
  liveError: string;
  loading: boolean;
  /** Fetches the live map again (bypassing the 10-minute memory); resolves to a readable result. */
  reload: () => Promise<string>;
}

const STALE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 8000;
const memory = new Map<string, { map: HubMap; at: number }>();

/** A minimal shape check: the schema id and the arrays a host lays out. */
export function isHubMap(x: unknown): x is HubMap {
  const m = x as Partial<HubMap> | null;
  return !!m && m.schema === 'hoy.hub-map/1' && !!m.product?.baseUrl && [m.roles, m.experiences, m.pages, m.tools].every(Array.isArray) && !!m.lenses;
}

async function fetchLive(url: string): Promise<HubMap> {
  const ctl = new AbortController();
  const timer = window.setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: unknown = await res.json();
    if (!isHubMap(json)) throw new Error('not a hoy.hub-map/1 document');
    memory.set(url, { map: json, at: Date.now() });
    return json;
  } finally {
    window.clearTimeout(timer);
  }
}

export function useHubMap(clientId: string): HubMapState {
  const hub = clientHub(clientId);
  const cached = hub ? memory.get(hub.mapUrl) : undefined;
  const [map, setMap] = useState<HubMap | null>(cached?.map ?? null);
  const [source, setSource] = useState<HubMapSource | null>(cached ? 'live' : null);
  const [asOf, setAsOf] = useState<string | null>(cached ? new Date(cached.at).toISOString() : null);
  const [liveError, setLiveError] = useState('');
  const [loading, setLoading] = useState(!cached);
  const liveRef = useRef(Boolean(cached));
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);

  const goLive = useCallback(async (force: boolean): Promise<string> => {
    if (!hub) return `no client hub "${clientId}"`;
    const have = memory.get(hub.mapUrl);
    if (!force && have && Date.now() - have.at < STALE_MS) return 'live map (fresh in memory)';
    try {
      const live = await fetchLive(hub.mapUrl);
      if (!alive.current) return 'live map fetched';
      liveRef.current = true;
      setMap(live);
      setSource('live');
      setAsOf(new Date().toISOString());
      setLiveError('');
      setLoading(false);
      return `live map ${live.product.version} (${live.pages.length} pages, generated ${live.generatedAt.slice(0, 10)})`;
    } catch (e) {
      const why = e instanceof Error ? (e.name === 'AbortError' ? 'timed out' : e.message) : String(e);
      if (alive.current) setLiveError(why);
      return `live map unavailable (${why}); ${liveRef.current ? 'keeping the last live map' : 'showing the bundled snapshot'}`;
    }
  }, [hub, clientId]);

  useEffect(() => {
    if (!hub) return;
    let off = false;
    if (!liveRef.current) {
      void hub.snapshot().then((snap) => {
        if (off || liveRef.current || !alive.current) return;
        setMap(snap);
        setSource('snapshot');
        setAsOf(snap.generatedAt);
        setLoading(false);
      });
    }
    void goLive(false);
    return () => {
      off = true;
    };
  }, [hub, goLive]);

  const reload = useCallback(() => goLive(true), [goLive]);
  return { map, source, asOf, liveError, loading: loading && !map, reload };
}
