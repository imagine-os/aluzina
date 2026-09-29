import { GEOMETRY, MAT_COLS, MAT_GAP, MAT_HEAD, MAT_PAD, PERSON_COLS, PERSON_ROWS, SQ, SUB_HEAD, type DeskItem, type DeskLayout, type DeskMatDef, type Mat, type PlacedItem, type SubMat } from './types';

/**
 * The desk layout engine (D-103, generalised in D-106): objects -> sub-mats -> mats -> rows. Deterministic,
 * grid-aligned, no overlaps (checked by script at seven widths). Nothing is hand-placed: a client gives mats and
 * objects, the engine computes every position.
 */

/** Dense first-fit packing of 1x1 / 2x1 objects into `cols` columns; returns cell positions and the row count. */
function pack(items: DeskItem[], cols: number): { cells: { col: number; row: number }[]; rows: number } {
  const taken: boolean[][] = [];
  const free = (r: number, c: number) => !(taken[r]?.[c] ?? false);
  const cells: { col: number; row: number }[] = [];
  for (const item of items) {
    const w = GEOMETRY[item.kind].w;
    let placed = false;
    for (let r = 0; !placed; r++) {
      for (let c = 0; c + w <= cols; c++) {
        if (free(r, c) && (w === 1 || free(r, c + 1))) {
          for (let k = 0; k < w; k++) (taken[r] ??= [])[c + k] = true;
          cells.push({ col: c, row: r });
          placed = true;
          break;
        }
      }
    }
  }
  return { cells, rows: taken.length };
}

/**
 * Columns for a sub-mat, chosen so small groups pair up on one shelf of the mat (3 + 4, 4 + 4, 3 + 5 fit in 9 with the
 * half-square gap) and big groups take the whole width.
 */
function subCols(items: DeskItem[]): number {
  const area = items.reduce((n, i) => n + GEOMETRY[i.kind].w, 0);
  const cols = area <= 3 ? 3 : area <= 8 ? 4 : area <= 10 ? 5 : MAT_COLS;
  return Math.min(MAT_COLS, cols);
}

export interface LayoutInput {
  mats: readonly DeskMatDef[];
  /** Sub-mat order by group id; groups not listed follow in the order of their first object. */
  groups?: readonly string[];
  items: readonly DeskItem[];
}

/**
 * Lays out every object. `perRow` mats per row; each mat is as long as its content (a mat with little on it is a
 * short mat, which is information too). `people` are the mats that seat a person: the station takes its own rows on
 * the mat's near edge, after the sub-mats, so it never shares a square with an object (D-104).
 */
export function layoutDesk(input: LayoutInput, perRow: number, people: ReadonlySet<string> = new Set()): DeskLayout {
  const matW = MAT_COLS * SQ + 2 * MAT_PAD;
  const rank = (g: string) => {
    const i = input.groups?.indexOf(g) ?? -1;
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const byMat = new Map<string, DeskItem[]>();
  for (const it of input.items) (byMat.get(it.phase) ?? byMat.set(it.phase, []).get(it.phase)!).push(it);

  const mats: Mat[] = input.mats.map((def, index) => {
    const mine = byMat.get(def.id) ?? [];
    const order: string[] = [];
    for (const it of mine) if (!order.includes(it.group)) order.push(it.group);
    order.sort((a, b) => rank(a) - rank(b));
    // Sub-mats: pack each group, then shelf-pack the sub-mats inside the mat.
    const subs: SubMat[] = [];
    let shelfX = 0;
    let shelfY = MAT_HEAD;
    let shelfH = 0;
    for (const group of order) {
      const groupItems = mine.filter((i) => i.group === group);
      const cols = subCols(groupItems);
      const { cells, rows } = pack(groupItems, cols);
      const w = cols * SQ;
      const h = SUB_HEAD + rows * SQ;
      if (shelfX > 0 && shelfX + MAT_PAD + w > MAT_COLS * SQ) {
        shelfY += shelfH + MAT_PAD;
        shelfX = 0;
        shelfH = 0;
      }
      const x = MAT_PAD + (shelfX === 0 ? 0 : shelfX + MAT_PAD);
      const placed: PlacedItem[] = groupItems.map((item, k) => ({
        ...item,
        x: cells[k].col * SQ,
        y: SUB_HEAD + cells[k].row * SQ,
        cw: GEOMETRY[item.kind].w * SQ,
        ch: SQ,
      }));
      subs.push({ id: `${def.id}:${group}`, group, label: def.subLabels?.[group], x, y: shelfY, w, h, items: placed });
      shelfX = x - MAT_PAD + w;
      shelfH = Math.max(shelfH, h);
    }
    let h = shelfY + shelfH + MAT_PAD;
    let person: Mat['person'];
    if (people.has(def.id)) {
      person = { x: MAT_PAD + Math.floor((MAT_COLS - PERSON_COLS) / 2) * SQ, y: h, w: PERSON_COLS * SQ, h: PERSON_ROWS * SQ };
      h += PERSON_ROWS * SQ + MAT_PAD / 2;
    }
    const lights = mine.filter((i) => i.kind === 'light').length;
    const count = mine.reduce((n, i) => n + (i.kind === 'light' ? 0 : i.kind === 'stack' ? i.more ?? 0 : 1), 0);
    return { id: def.id, index, label: def.label, x: 0, y: 0, w: matW, h, subs, count, lights, person };
  });

  // Rows of mats in model order, top-aligned.
  const rows: Mat[][] = [];
  mats.forEach((m, i) => (rows[Math.floor(i / perRow)] ??= []).push(m));
  let y = MAT_GAP;
  for (const row of rows) {
    const rowH = Math.max(...row.map((m) => m.h));
    row.forEach((m, i) => {
      m.x = MAT_GAP + i * (matW + MAT_GAP);
      m.y = y;
    });
    y += rowH + MAT_GAP;
  }
  const width = MAT_GAP + Math.max(1, Math.min(perRow, mats.length)) * (matW + MAT_GAP);

  // World coordinates of every object (mat + sub-mat + cell), for fly-to, the minimap and the actions.
  const placed: PlacedItem[] = mats.flatMap((m) => m.subs.flatMap((s) => s.items.map((it) => ({ ...it, x: m.x + s.x + it.x, y: m.y + s.y + it.y }))));
  return { mats, items: placed, width, height: Math.max(y, MAT_GAP * 2 + MAT_HEAD) };
}

/** Finds an object by id, code or title words (en or es), for the focus / open actions. */
export function findItem<I extends DeskItem>(items: readonly I[], query: string): I | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return (
    items.find((i) => i.id.toLowerCase() === q) ??
    items.find((i) => i.ref?.id.toLowerCase() === q) ??
    items.find((i) => i.code?.toLowerCase() === q) ??
    items.find((i) => i.title.en.toLowerCase() === q || i.title.es?.toLowerCase() === q) ??
    items.find((i) => i.title.en.toLowerCase().includes(q) || (i.title.es ?? '').toLowerCase().includes(q))
  );
}
