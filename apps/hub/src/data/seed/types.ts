import type { NewRow } from '../provider';
import type { EntityName } from '../schema';

/** Seed rows get a fixed timestamp so the mock data is deterministic between runs. */
export const SEED_AT = '2026-09-20T12:00:00.000Z';

export interface SeedCtx {
  add<E extends EntityName>(entity: E, id: string, row: NewRow<E>): void;
  /** Demo user ids (src/auth/demoUsers.ts). */
  users: { founder: string; ops: string; studio: string; brand: string; client: string; dev: string };
}

export interface SeedModule {
  /** Lower runs first (projects at 0, everything that references them later). */
  order?: number;
  seed(ctx: SeedCtx): void;
}
