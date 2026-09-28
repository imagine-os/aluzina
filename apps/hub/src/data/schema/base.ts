/**
 * Every row carries these (P-14): writes go by id, `updated_at` drives optimistic concurrency today and `version` the merge UI
 * that replaces it. The provider stamps all of them (`NewRow` omits them): callers never write `tenant_id` or `version`.
 */
export interface BaseRow {
  id: string;
  created_at: string;
  updated_at: string;
  /** Demo user id of the last writer (MockProvider sets it from the session; D-024 conflict notice names them). Seeds leave it unset. */
  updated_by?: string | null;
  /** The tenant that owns the row (D-091): `TENANT.id` from `tenant/config.ts`; a host's real provider filters by it. */
  tenant_id: string;
  /** Row version (D-091): 1 on create and on every seeded row, +1 on every `update`; the future merge UI compares it. */
  version: number;
}

/** ISO 8601 date (`YYYY-MM-DD`) or date-time. */
export type ISODate = string;
/** Colombian pesos, whole units; never a float with cents. */
export type CentsCop = number;

export type Id = string;
