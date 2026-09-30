import { CAPTION_H, DEVICE_KINDS, GEOMETRY, type DeskItem, type ItemKind, type PlacedItem } from './types';

/**
 * Paper objects (changelog 0045, D-117): the pure rules behind the redesigned faces, shared by the renderer
 * (`DeskObject.tsx`), the stage (glows, dossier anchors) and `scripts/desk-check.mjs` (which proves a turned face
 * still lies inside its chess squares). No React, no DOM.
 *
 * - **Band**: a thin top band coloured by playbook service (the five `--color-service-*` tokens), or, for everything
 *   else, by the row's status tone (page desks) or by kind (a graphite ink step per kind). It carries a tiny caps code.
 * - **Turn**: a deterministic hand-placed rotation of at most ±1.5° from the object's id, for the paper kinds only.
 * - **Title fit**: the largest title size (in em of the face font) at which the title's longest word fits the face and
 *   the whole title fits its line budget, so short titles read from a mat's fit and long ones never overflow.
 */

/** Service code -> its band (the service ladder word): `--color-service-<band>`. */
export const SERVICE_BANDS: Readonly<Record<string, 'clarity' | 'direction' | 'definition' | 'materialization' | 'soul'>> = {
  '01': 'clarity',
  '02': 'direction',
  '03': 'definition',
  E: 'materialization',
  '04': 'soul',
};

/** Kinds that lie on the desk as paper (or card, folder, box) and take a hand-placed turn. */
const TURN_KINDS: ReadonlySet<ItemKind> = new Set<ItemKind>(['sheet', 'form', 'checklist', 'document', 'folder', 'box', 'card', 'stack']);
/** The largest turn, degrees. */
export const MAX_TURN = 1.5;

/** FNV-1a of a string (stable across runs and engines). */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** The object's turn in degrees (-1.5 .. 1.5, 0.1° steps), 0 for kinds that are not paper and for plain tiles. */
export function turnOf(item: Pick<DeskItem, 'id' | 'kind' | 'plain'>): number {
  if (!TURN_KINDS.has(item.kind) || item.plain) return 0;
  const steps = Math.round(MAX_TURN * 10);
  return ((hash(item.id) % (2 * steps + 1)) - steps) / 10;
}

/** Extra room a document's page edges take at its bottom and right (world px): three leaves, 1.4 px apart. */
export const DOC_EDGES = 4.2;

/** The top face's rectangle inside the object's cell (world px): the body the object draws, centred on its squares
 *  (a device together with its caption strip; a fanned `pages` stack leaves room for its leaves; a document its page
 *  edges; a folder its tab). */
export function faceBox(item: Pick<PlacedItem, 'kind' | 'cw' | 'ch'>): { left: number; top: number; width: number; height: number } {
  const g = GEOMETRY[item.kind];
  const capH = DEVICE_KINDS.has(item.kind) && item.kind !== 'screen' ? CAPTION_H : 0;
  const edge = item.kind === 'document' ? DOC_EDGES / 2 : 0;
  return {
    left: (item.cw - g.face.w) / 2 - (item.kind === 'pages' ? 5 : 0) - edge,
    top: (item.ch - g.face.h - capH) / 2 + (item.kind === 'folder' ? 4 : 0) + (item.kind === 'screen' ? -4 : 0) - edge,
    width: g.face.w,
    height: g.face.h,
  };
}

/** Height of a folder's tab above its face (world px). */
export const FOLDER_TAB = 7;

/**
 * Everything the face draws, turned, as a box inside the cell (world px): the face plus its page edges (document),
 * its tab (folder), its lid overhang (box). `scripts/desk-check.mjs` fails the build when this leaves the cell.
 */
export function drawnBox(item: Pick<PlacedItem, 'id' | 'kind' | 'plain' | 'cw' | 'ch'>): { x0: number; y0: number; x1: number; y1: number } {
  const f = faceBox(item);
  const extraR = item.kind === 'document' ? DOC_EDGES : 0.6;
  const extraB = item.kind === 'document' ? DOC_EDGES : 0.6;
  const extraT = item.kind === 'folder' ? FOLDER_TAB : 0;
  const w = f.width + extraR;
  const h = f.height + extraB + extraT;
  const cx = f.left + w / 2;
  const cy = f.top - extraT + h / 2;
  const a = (Math.abs(turnOf(item)) * Math.PI) / 180;
  const bw = w * Math.cos(a) + h * Math.sin(a);
  const bh = w * Math.sin(a) + h * Math.cos(a);
  return { x0: cx - bw / 2, y0: cy - bh / 2, x1: cx + bw / 2, y1: cy + bh / 2 };
}

/** The band of a face: its colour class and whether it comes from a service. */
export function bandClass(item: Pick<DeskItem, 'kind' | 'service' | 'pill' | 'group'>): string {
  const svc = item.service ? SERVICE_BANDS[item.service] : undefined;
  if (svc) return `dp--band-svc dp--svc-${svc}`;
  if (item.pill) return `dp--band-tone dp--tone-${item.pill.tone}`;
  if (item.kind === 'card' && (item.group === 'rules' || item.group === 'team' || item.group === 'measures')) return `dp--band-kind dp--band-${item.group}`;
  return `dp--band-kind dp--band-${item.kind}`;
}

/** Service phase code `03-11` -> `11` (the stage number inside its service), else undefined. */
export function stageOf(code: string | undefined): string | undefined {
  const m = code ? /^[0-9A-Z]{1,2}-(\d+)$/.exec(code) : null;
  return m ? m[1].padStart(2, '0') : undefined;
}

/** Caps width estimate (em per character with the tracking; em per space): measured on the widest face it falls back
 *  to (system-ui bold caps 0.71 em + 0.05 em tracking), rounded up. Used where no measurer is given (the check). */
const CAPS_CH = 0.8;
const CAPS_SP = 0.36;

/** Width of a word (or of a space, `' '`) in bold tracked caps, in em. */
export type CapsMeasure = (word: string) => number;
const estimate: CapsMeasure = (w) => (w === ' ' ? CAPS_SP : w.length * CAPS_CH);

/** Lines `text` takes in bold caps at `size` em in `widthEm` (greedy wrap); Infinity when a word does not fit. */
export function wrapLines(text: string, widthEm: number, size: number, measure: CapsMeasure = estimate): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  const room = widthEm / size;
  const sp = measure(' ');
  let n = 1;
  let used = 0;
  for (const w of words) {
    const len = measure(w);
    if (len > room) return Infinity;
    const need = used === 0 ? len : used + sp + len;
    if (need <= room) used = need;
    else {
      n++;
      used = len;
    }
  }
  return n;
}

/**
 * The largest title size (em of the face font) between `minEm` and `maxEm` at which `text`, set in bold caps with
 * the brand's tracking, wraps into at most `lines` lines of `widthEm` (a word never breaks unless even `minEm` is too
 * large for it), and the lines it then takes. The face still clamps its lines as a safety.
 */
export function fitTitle(text: string, widthEm: number, maxEm: number, minEm: number, lines: number, measure: CapsMeasure = estimate): { size: number; lines: number } {
  for (let s = maxEm; s > minEm; s = Math.round((s - 0.05) * 100) / 100) {
    const n = wrapLines(text, widthEm, s, measure);
    if (n <= lines) return { size: s, lines: n };
  }
  return { size: minEm, lines: Math.min(lines, wrapLines(text, widthEm, minEm, measure)) };
}
