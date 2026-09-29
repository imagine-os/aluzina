import type { HubMap } from './hubMap.types';

/**
 * Client hubs aluzina can lay on its desk: a client whose own OS publishes a hub map (`hub-map.json`, schema
 * `hoy.hub-map/1`). Each entry ties the map to the client's rows in aluzina (the seeded project and client) and
 * carries a bundled snapshot, rendered first and whenever the live map cannot be fetched (offline, not published yet).
 * The snapshot is ONE json file per client so swapping it for a freshly generated map is a one-file change.
 */
export interface ClientHub {
  /** Route segment and action vocabulary: `/<surface>/clients/<id>/hub`. */
  id: string;
  /** The client's name in aluzina (page title, breadcrumb); the map's product name is the OS's own name. */
  name: string;
  /** aluzina's project and client rows for this client (tenant seed). */
  projectId: string;
  clientRowId: string;
  /** The live map (fetched with the browser's default cache; kept 10 minutes in memory). */
  mapUrl: string;
  /** The bundled copy, loaded lazily (its own chunk). */
  snapshot: () => Promise<HubMap>;
}

export const CLIENT_HUBS: Record<string, ClientHub> = {
  hoy: {
    id: 'hoy',
    name: 'HOY',
    projectId: 'prj-hoy',
    clientRowId: 'cl-hoy',
    mapUrl: 'https://imagine-os.github.io/hoy/hub-map.json',
    snapshot: () => import('./hoy.hub-map.snapshot.json').then((m) => (m.default ?? m) as unknown as HubMap),
  },
};

export const clientHub = (id: string): ClientHub | undefined => CLIENT_HUBS[id];
