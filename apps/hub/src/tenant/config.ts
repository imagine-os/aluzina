import manifest from '../../../../tenant.json';
import type { Lang } from '../i18n/types';

/**
 * The tenant this build is (D-088, D-090): the single source of the tenant id and of every name derived
 * from it. Values come from the root `tenant.json` (manifestVersion 1, spec in `docs/tenant/manifest.md`),
 * so a host that mounts another tenant changes the manifest, not the code. For aluzina every derived value
 * equals the literal the app used before tp-02 (`aluzina.lang`, `aluzina-data`, `__aluzina`, ...), so no
 * saved browser state migrates.
 */
export const TENANT = {
  /** Tenant id and namespace root (`^[a-z][a-z0-9-]*$`). */
  id: manifest.id,
  /** Display name per language. */
  name: manifest.name as Record<Lang, string>,
  /** URL slug the host routes the tenant under (`routing.pathPrefix`); the id today. */
  slug: manifest.id,
  /** Mirrors root `package.json` `version` (the validator checks the two agree). */
  version: manifest.version,
  /** UI languages the string tables cover. */
  locales: manifest.identity.languages as Lang[],
  defaultLocale: manifest.identity.defaultLanguage as Lang,
  currency: manifest.identity.currency,
  numberLocale: manifest.identity.numberLocale,
  dateLocale: manifest.identity.dateLocale,
  timezone: manifest.identity.timezone,
  routing: manifest.routing,
} as const;

/** localStorage / sessionStorage key: `${TENANT.id}.${name}` (`aluzina.lang`, `aluzina.session`, ...). */
export function storageKey(name: string): string {
  return `${TENANT.id}.${name}`;
}

/** BroadcastChannel name: `${TENANT.id}-${name}` (`aluzina-data`, `aluzina-presence`). */
export function channelName(name: string): string {
  return `${TENANT.id}-${name}`;
}

/** The window global the route manifest and actions bus publish under: `__${TENANT.id}` (`window.__aluzina`). */
export const GLOBAL_NAME = `__${TENANT.id}`;
