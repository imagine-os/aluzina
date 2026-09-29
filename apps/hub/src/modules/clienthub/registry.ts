import type { Bi, HubLensId, HubMap } from './hubMap.types';

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
  /**
   * The host's own wording for the map's lens hints, merged over the map's text per language (changelog 0041):
   * ALUZINA's house style (the studio's name in capitals, "tapete" for mat, natural Spanish) until the client's
   * map carries the same words. Only the strings given here replace the map's.
   */
  lensCopy?: Partial<Record<HubLensId, { title?: Partial<Bi>; framing?: Partial<Bi> }>>;
}

export const CLIENT_HUBS: Record<string, ClientHub> = {
  hoy: {
    id: 'hoy',
    name: 'HOY',
    projectId: 'prj-hoy',
    clientRowId: 'cl-hoy',
    mapUrl: 'https://imagine-os.github.io/hoy/hub-map.json',
    snapshot: () => import('./hoy.hub-map.snapshot.json').then((m) => (m.default ?? m) as unknown as HubMap),
    lensCopy: {
      aluzina: {
        title: { en: 'hoy in the ALUZINA studio', es: 'hoy en el estudio ALUZINA' },
        framing: { es: 'Un entregable del estudio: un tapete por cada rol del cliente, con las pantallas de ese rol encima.' },
      },
      'between-gigs': { title: { es: 'hoy como gig' }, framing: { es: 'Un gig con sus superficies y sus herramientas.' } },
      standalone: {
        title: { es: 'El hub de pruebas de hoy' },
        framing: { es: 'Cada superficie agrupada por banda y cada herramienta de prueba, tal como se ven en /#/.' },
      },
    },
  },
};

export const clientHub = (id: string): ClientHub | undefined => CLIENT_HUBS[id];

/** The map with the host's lens wording merged in (`lensCopy`); the same object when there is nothing to merge. */
export function withLensCopy(map: HubMap | null, hub: ClientHub | undefined): HubMap | null {
  if (!map || !hub?.lensCopy) return map;
  const lenses = { ...map.lenses };
  for (const [id, copy] of Object.entries(hub.lensCopy) as [HubLensId, NonNullable<ClientHub['lensCopy']>[HubLensId]][]) {
    const hint = lenses[id];
    if (!hint || !copy) continue;
    lenses[id] = { ...hint, title: { ...hint.title, ...copy.title }, framing: { ...hint.framing, ...copy.framing } };
  }
  return { ...map, lenses };
}
