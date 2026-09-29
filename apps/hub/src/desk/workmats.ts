import { useCallback, useEffect, useRef, useState } from 'react';
import { storageKey } from '../tenant/config';

/**
 * Work mats (D-114): free mats on a leads desk where a person arranges leads and dossier cards by hand, apart from the
 * process stacks (the status sub-mats, which stay the source of truth). A work mat holds references, never copies: an
 * entry is a lead id (and a dossier card id) with the square it lies on, and the desk draws it from the live row, so
 * its status keeps updating. Stored per page code and person in the browser, `storageKey('desk.workmats.<code>')`
 * = `{ [userId]: { mats, entries } }`; the layout is never written into the entities.
 */

export interface WorkMat {
  id: string;
  name: string;
  /** Stamped on save when the mat is new or renamed (multiplayer-ready, like every row). */
  updated_at?: string;
}

export interface WorkMatEntry {
  /** `lead:<leadId>` or `card:<leadId>:<cardId>` (a dossier card). */
  ref: string;
  mat: string;
  col: number;
  row: number;
  /** Stamped on save when the entry is new or moved. */
  updated_at?: string;
}

export interface WorkMatState {
  mats: WorkMat[];
  entries: WorkMatEntry[];
}

/** Squares of a work mat: the width of any mat, four rows to begin with (it grows as things are put on it). */
export const WORK_COLS = 9;
export const WORK_ROWS = 4;

const EMPTY: WorkMatState = { mats: [{ id: 'wm-1', name: '' }], entries: [] };

const keyOf = (code: string) => storageKey(`desk.workmats.${code}`);

function readAll(code: string): Record<string, WorkMatState> {
  try {
    const raw = window.localStorage.getItem(keyOf(code));
    const v = raw ? (JSON.parse(raw) as unknown) : null;
    return v && typeof v === 'object' ? (v as Record<string, WorkMatState>) : {};
  } catch {
    return {};
  }
}

function clean(s: WorkMatState | undefined): WorkMatState {
  if (!s || !Array.isArray(s.mats) || s.mats.length === 0) return { mats: [...EMPTY.mats], entries: [] };
  const ids = new Set(s.mats.map((m) => m.id));
  const entries = (Array.isArray(s.entries) ? s.entries : []).filter((e) => e && typeof e.ref === 'string' && ids.has(e.mat) && Number.isInteger(e.col) && Number.isInteger(e.row));
  return { mats: s.mats.filter((m) => m && typeof m.id === 'string').map((m) => ({ id: m.id, name: String(m.name ?? ''), ...(typeof m.updated_at === 'string' ? { updated_at: m.updated_at } : {}) })), entries };
}

export function loadWorkMats(code: string, user: string): WorkMatState {
  return clean(readAll(code)[user]);
}

export function saveWorkMats(code: string, user: string, state: WorkMatState): void {
  try {
    const all = readAll(code);
    const prev = clean(all[user]);
    const now = new Date().toISOString();
    const pm = new Map(prev.mats.map((m) => [m.id, m]));
    const pe = new Map(prev.entries.map((e) => [`${e.mat}|${e.ref}`, e]));
    all[user] = {
      mats: state.mats.map((m) => {
        const o = pm.get(m.id);
        return o && o.name === m.name ? { ...m, updated_at: o.updated_at ?? now } : { ...m, updated_at: now };
      }),
      entries: state.entries.map((e) => {
        const o = pe.get(`${e.mat}|${e.ref}`);
        return o && o.col === e.col && o.row === e.row ? { ...e, updated_at: o.updated_at ?? now } : { ...e, updated_at: now };
      }),
    };
    window.localStorage.setItem(keyOf(code), JSON.stringify(all));
  } catch {
    /* private window or blocked storage: the arrangement lasts for this visit */
  }
}

/** The ref of a lead and of one of its dossier cards. */
export const leadRef = (leadId: string) => `lead:${leadId}`;
export const cardRef = (leadId: string, cardId: string) => `card:${leadId}:${cardId}`;
export function parseRef(ref: string): { leadId: string; cardId?: string } | null {
  const [kind, leadId, cardId] = ref.split(':');
  if (kind === 'lead' && leadId) return { leadId };
  if (kind === 'card' && leadId && cardId) return { leadId, cardId };
  return null;
}

/** The desk object id of an entry (unique per mat and ref). */
export const entryItemId = (e: Pick<WorkMatEntry, 'mat' | 'ref'>) => `workmat:${e.mat}:${e.ref}`;
export function entryOfItem(state: WorkMatState, itemId: string): WorkMatEntry | undefined {
  return state.entries.find((e) => entryItemId(e) === itemId);
}

/** The first square of `mat` a footprint of `w` squares fits on, after the ones taken (reading order). */
export function firstFree(state: WorkMatState, mat: string, w = 1, skip?: string): { col: number; row: number } {
  const taken = new Set<string>();
  for (const e of state.entries) {
    if (e.mat !== mat || e.ref === skip) continue;
    const ew = e.ref.startsWith('lead:') ? 2 : 1;
    for (let k = 0; k < ew; k++) taken.add(`${e.col + k},${e.row}`);
  }
  for (let row = 0; ; row++)
    for (let col = 0; col + w <= WORK_COLS; col++) {
      let ok = true;
      for (let k = 0; k < w && ok; k++) if (taken.has(`${col + k},${row}`)) ok = false;
      if (ok) return { col, row };
    }
}

/** The footprint of a ref in squares (a lead's profile card is two squares wide, a dossier card one). */
export const refWidth = (ref: string) => (ref.startsWith('lead:') ? 2 : 1);

/** True when `ref` fits at (col, row) on `mat` without covering another entry. */
export function canPlace(state: WorkMatState, mat: string, ref: string, col: number, row: number): boolean {
  const w = refWidth(ref);
  if (col < 0 || row < 0 || col + w > WORK_COLS) return false;
  return !state.entries.some((e) => e.mat === mat && e.ref !== ref && e.row === row && e.col < col + w && col < e.col + refWidth(e.ref));
}

/** The work mats of a page desk for the signed-in person, persisted; every change writes through. */
export function useWorkMats(code: string, user: string) {
  const [state, setState] = useState<WorkMatState>(() => loadWorkMats(code, user));
  useEffect(() => setState(loadWorkMats(code, user)), [code, user]);
  // Another tab of the same person changed the arrangement.
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === keyOf(code)) setState(loadWorkMats(code, user));
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, [code, user]);
  const ref = useRef(state);
  ref.current = state;
  const update = useCallback(
    (f: (s: WorkMatState) => WorkMatState) => {
      const next = clean(f(ref.current));
      ref.current = next;
      saveWorkMats(code, user, next);
      setState(next);
      return next;
    },
    [code, user],
  );
  return { state, update };
}

/** Writes an entry into another page's work mats (W-04's "Send to work mat" puts a lead on A-08's first work mat). */
export function sendToOtherDesk(code: string, user: string, ref: string, matId?: string): { mat: WorkMat; col: number; row: number; already: boolean } {
  const s = loadWorkMats(code, user);
  const mat = s.mats.find((m) => m.id === matId) ?? s.mats[0];
  const have = s.entries.find((e) => e.ref === ref && e.mat === mat.id);
  if (have) return { mat, col: have.col, row: have.row, already: true };
  const at = firstFree(s, mat.id, refWidth(ref));
  saveWorkMats(code, user, { ...s, entries: [...s.entries, { ref, mat: mat.id, ...at }] });
  return { mat, ...at, already: false };
}
