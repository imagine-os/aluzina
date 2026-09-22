import type { NewRow, Row } from '../provider';
import type { EntityName } from '../schema';
import { SEED_AT, type SeedCtx, type SeedModule } from './types';

/**
 * Bump when the seed shape changes so existing browsers re-seed (MockProvider stores it).
 * 9: changelog 0021 (step 14 pass 2) — 18 deep indexes of PROYECTOS 2026 and the 12 company documents of
 * "00 INFORMACION RELEVANTE ALUZINA 2023" land as rows; existing stores re-seed to see them.
 * 10: ar-19 — archived files leave the seed (no `assets` rows or `belongs-to` relations for archive projects; they load per
 * project from `docs/archive/projects/<slug>/index.json`, `data/archiveFiles.ts`); `projects` gain `fileCount`, `coverUrl`,
 * `archiveSlug`, `fileTypes`. Tags / stages saved on archived files at version 9 are not carried over (they lived on seeded rows).
 */
export const SEED_VERSION = 11;

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
