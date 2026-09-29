import { GEOMETRY, MAT_COLS, MAT_GAP, MAT_HEAD, MAT_PAD, PERSON_COLS, PERSON_ROWS, SQ, SUB_HEAD, type DeskItem, type DeskLayout, type DeskMatDef, type Mat, type PlacedItem, type SubMat } from './types';

/**
 * The desk layout engine (D-103, generalised in D-106): objects -> sub-mats -> mats -> rows. Deterministic,
 * grid-aligned, no overlaps (checked by `scripts/desk-check.mjs` at seven stage widths, in every build). Nothing is hand-placed: a client gives mats and
 * objects, the engine computes every position.
 */

/**
 * Dense first-fit packing into `cols` columns over a 2D grid: each object takes `w` x `h` squares (1x1 papers, 2x1
 * folders, 1x2 phones, 3x2 screens, 1x3 pages...) at the first free cell in row-major order where its whole footprint
 * is free. Deterministic (same input, same cells); returns cell positions and the row count.
 */
export function pack(items: readonly DeskItem[], cols: number): { cells: { col: number; row: number }[]; rows: number } {
  const taken: boolean[][] = [];
  const free = (r: number, c: number) => !(taken[r]?.[c] ?? false);
  const fits = (r: number, c: number, w: number, h: number) => {
    for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) if (!free(r + dr, c + dc)) return false;
    return true;
  };
  const cells: { col: number; row: number }[] = [];
  for (const item of items) {
    const g = GEOMETRY[item.kind];
    const w = Math.min(g.w, cols);
    const h = g.h;
    let placed = false;
    for (let r = 0; !placed; r++) {
      for (let c = 0; c + w <= cols; c++) {
        if (fits(r, c, w, h)) {
          for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) (taken[r + dr] ??= [])[c + dc] = true;
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
 * half-square gap) and big groups take the whole width. Groups with multi-row objects (devices) size by their row
 * width instead: one row of devices when they fit in 5 columns, the whole mat otherwise; never narrower than the
 * widest object.
 */
export function subCols(items: readonly DeskItem[]): number {
  const geo = items.map((i) => GEOMETRY[i.kind]);
  const widest = geo.reduce((n, g) => Math.max(n, g.w), 1);
  if (geo.some((g) => g.h > 1)) {
    const row = geo.reduce((n, g) => n + g.w, 0);
    return Math.min(MAT_COLS, Math.max(widest, row <= 3 ? 3 : row <= 4 ? 4 : row <= 5 ? 5 : MAT_COLS));
  }
  const area = geo.reduce((n, g) => n + g.w, 0);
  const cols = area <= 3 ? 3 : area <= 8 ? 4 : area <= 10 ? 5 : MAT_COLS;
  return Math.min(MAT_COLS, Math.max(widest, cols));
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
    if (def.free) return freeMat(def, index, mine, matW);
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
        ch: GEOMETRY[item.kind].h * SQ,
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

/**
 * A free mat (D-114): one sub-mat whose objects lie where a person put them (`at`, snapped to squares). An object whose
 * square is taken or off the grid, or that has no `at`, goes to the first free square in reading order, so the result
 * never overlaps whatever the stored arrangement says.
 */
function freeMat(def: DeskMatDef, index: number, items: readonly DeskItem[], matW: number): Mat {
  const free = def.free!;
  const cols = Math.min(MAT_COLS, Math.max(1, free.cols));
  const taken: boolean[][] = [];
  const fits = (r: number, c: number, w: number, h: number) => {
    if (r < 0 || c < 0 || c + w > cols) return false;
    for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) if (taken[r + dr]?.[c + dc]) return false;
    return true;
  };
  const take = (r: number, c: number, w: number, h: number) => {
    for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) (taken[r + dr] ??= [])[c + dc] = true;
  };
  const cells = new Map<string, { col: number; row: number }>();
  const wait: DeskItem[] = [];
  for (const it of items) {
    const g = GEOMETRY[it.kind];
    const w = Math.min(g.w, cols);
    if (it.at && fits(it.at.row, it.at.col, w, g.h)) {
      take(it.at.row, it.at.col, w, g.h);
      cells.set(it.id, it.at);
    } else wait.push(it);
  }
  for (const it of wait) {
    const g = GEOMETRY[it.kind];
    const w = Math.min(g.w, cols);
    for (let r = 0; !cells.has(it.id); r++)
      for (let c = 0; c + w <= cols; c++)
        if (fits(r, c, w, g.h)) {
          take(r, c, w, g.h);
          cells.set(it.id, { col: c, row: r });
          break;
        }
  }
  const rows = Math.max(free.rows, taken.length);
  const placed: PlacedItem[] = items.map((item) => {
    const cell = cells.get(item.id)!;
    return { ...item, at: cell, x: cell.col * SQ, y: SUB_HEAD + cell.row * SQ, cw: GEOMETRY[item.kind].w * SQ, ch: GEOMETRY[item.kind].h * SQ };
  });
  const sub: SubMat = { id: `${def.id}:free`, group: 'free', label: free.label ?? def.subLabels?.free, x: MAT_PAD, y: MAT_HEAD, w: cols * SQ, h: SUB_HEAD + rows * SQ, items: placed };
  const count = items.length;
  return { id: def.id, index, label: def.label, x: 0, y: 0, w: matW, h: MAT_HEAD + sub.h + MAT_PAD, subs: [sub], count, lights: 0 };
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
