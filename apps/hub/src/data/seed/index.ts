import type { NewRow, Row } from '../provider';
import type { EntityName } from '../schema';
import { SEED_AT, type SeedCtx, type SeedModule } from './types';

/**
 * Bump when the seed shape changes so existing browsers re-seed (MockProvider stores it).
 * 9: changelog 0021 (step 14 pass 2) — 18 deep indexes of PROYECTOS 2026 and the 12 company documents of
 * "00 INFORMACION RELEVANTE ALUZINA 2023" land as rows; existing stores re-seed to see them.
 */
export const SEED_VERSION = 9;

/** One file per area, globbed: add `src/data/seed/<area>.ts` exporting `seed(ctx)` (+ `order`), never edit this file. */
const modules = import.meta.glob<SeedModule>(['./*.ts', '!./index.ts', '!./types.ts'], { eager: true });

export function runSeeds(tables: { [E in EntityName]: Row<E>[] }): void {
  const ctx: SeedCtx = {
    add(entity, id, row) {
      (tables[entity] as Row<typeof entity>[]).push({ ...(row as NewRow<typeof entity>), id, created_at: SEED_AT, updated_at: SEED_AT } as Row<typeof entity>);
    },
    users: { founder: 'u-alejandra', ops: 'u-miguel', studio: 'u-sarai', brand: 'u-angelica', marketing: 'u-valentina', client: 'u-client', dev: 'u-dev' },
  };
  Object.values(modules)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    .forEach((m) => m.seed(ctx));
}
