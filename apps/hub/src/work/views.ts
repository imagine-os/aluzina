import { EMPTY_FILTERS, type GroupBy, type SortBy, type WorkFilters, type WorkView } from './model';

/** What a saved view remembers (D-025): the view, its filters, sort and grouping. */
export interface ViewState {
  view: WorkView;
  filters: WorkFilters;
  sort: SortBy;
  groupBy: GroupBy;
}

export interface SavedView extends ViewState {
  id: string;
  name: string;
}

export const DEFAULT_VIEW_STATE: ViewState = { view: 'list', filters: EMPTY_FILTERS, sort: 'order', groupBy: 'section' };

/** localStorage key per user (D-025); a `views` table replaces it later behind the same functions. */
export const VIEWS_STORAGE_PREFIX = 'aluzina.views.';

interface StoredViews {
  views: SavedView[];
  /** Last state per scope (`all` or a project id), restored on return. */
  last?: Record<string, ViewState>;
}

function read(userId: string): StoredViews {
  try {
    const raw = localStorage.getItem(`${VIEWS_STORAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredViews;
      if (Array.isArray(parsed.views)) return parsed;
    }
  } catch {
    /* storage unavailable or corrupt */
  }
  return { views: [] };
}

function write(userId: string, stored: StoredViews) {
  try {
    localStorage.setItem(`${VIEWS_STORAGE_PREFIX}${userId}`, JSON.stringify(stored));
  } catch {
    /* storage unavailable */
  }
}

export function loadSavedViews(userId: string): SavedView[] {
  return read(userId).views;
}

export function saveSavedViews(userId: string, views: SavedView[]): void {
  write(userId, { ...read(userId), views });
}

export function loadLastState(userId: string, scope: string): ViewState | null {
  const s = read(userId).last?.[scope];
  return s ? { ...DEFAULT_VIEW_STATE, ...s, filters: { ...EMPTY_FILTERS, ...s.filters } } : null;
}

export function saveLastState(userId: string, scope: string, state: ViewState): void {
  const stored = read(userId);
  write(userId, { ...stored, last: { ...(stored.last ?? {}), [scope]: state } });
}

export function newViewId(): string {
  return `view-${Date.now().toString(36)}`;
}
