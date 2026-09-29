import type { DeskItem, DeskModel, ItemKind } from './types';
import { ITEM_KINDS } from './types';

/**
 * A synthetic desk for `scripts/desk-check.mjs`: every object kind, multi-row devices (1x2 phones, 2x2 tablets, 3x2
 * screens, 1x3 pages, 2x3 fanned pages) mixed with 1x1 and 2x1 papers in groups of every size, on mats with and
 * without a person, so the packer's 2D first fit is exercised at every sub-mat width. Not rendered anywhere.
 */
export function syntheticDesk(): DeskModel {
  const items: DeskItem[] = [];
  const mats = ['a', 'b', 'c', 'd', 'e'];
  const counts = [1, 2, 3, 5, 8, 13];
  let n = 0;
  mats.forEach((mat, mi) => {
    counts.forEach((count, gi) => {
      for (let k = 0; k < count; k++) {
        const kind: ItemKind = ITEM_KINDS[(n + mi * 3 + gi) % ITEM_KINDS.length];
        items.push({ id: `x${n++}`, kind, phase: mat, group: `g${gi}`, source: 'row', title: { en: kind }, lines: [], openAt: { path: '/' } });
      }
    });
  });
  // One mat of only devices, one of only papers.
  for (let k = 0; k < 11; k++) items.push({ id: `dev${k}`, kind: (['phone', 'screen', 'page', 'tablet', 'pages'] as const)[k % 5], phase: 'f', group: 'g', source: 'row', title: { en: 'device' }, lines: [], openAt: { path: '/' } });
  for (let k = 0; k < 17; k++) items.push({ id: `pap${k}`, kind: k % 4 === 0 ? 'folder' : 'sheet', phase: 'g', group: 'g', source: 'row', title: { en: 'paper' }, lines: [], openAt: { path: '/' } });
  // A work mat (a free mat, D-114): stored squares, one taken twice, one off the grid, one missing.
  const at = [{ col: 0, row: 0 }, { col: 0, row: 0 }, { col: 8, row: 1 }, { col: 3, row: 2 }, undefined, { col: 20, row: 1 }];
  at.forEach((a, k) => items.push({ id: `wm${k}`, kind: k % 2 ? 'card' : 'profile', phase: 'w', group: 'free', source: 'row', title: { en: 'lead' }, lines: [], openAt: { path: '/' }, at: a }));
  return {
    code: 'CHECK',
    mats: [...[...mats, 'f', 'g'].map((id) => ({ id, label: { en: id } })), { id: 'w', label: { en: 'Work mat' }, free: { cols: 9, rows: 4 } }],
    items,
    people: ['a', 'c', 'f'].map((phase) => ({ phase, role: { id: 'r', playbookRole: { en: 'Role' }, roleId: null, note: { en: '' } }, roleId: null, look: 'customer', basis: 'closest' as const, inferred: true, rationale: { en: '' }, props: ['phone', 'mug'] as ['phone', 'mug'] })),
  };
}
