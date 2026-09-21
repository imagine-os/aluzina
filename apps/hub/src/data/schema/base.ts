/** Every row carries these (P-14): writes go by id, `updated_at` drives optimistic concurrency later. */
export interface BaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

/** ISO 8601 date (`YYYY-MM-DD`) or date-time. */
export type ISODate = string;
/** Colombian pesos, whole units; never a float with cents. */
export type CentsCop = number;

export type Id = string;
