import type { Asset, Project } from '../../data/schema';
import { fileTypeOf } from '../../domain';
import type { Lang, StringTable } from '../../i18n/types';
import { strings } from './strings';

/**
 * P-06 reads its whole state from the URL: `/sets?p=<id>,<id>&t=<title>&lang=es|en&print=1`. Nothing about a
 * set is stored anywhere (D proposal: stateless set links), so a link the studio sends keeps working after a
 * re-seed, needs no auth and no row, and a client can forward it without anyone losing track of a record.
 */
export interface SetParams {
  ids: string[];
  title: string;
  lang: Lang;
  print: boolean;
}

/** Project ids in the order the studio picked them, de-duplicated; `p` is a comma list. */
export function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  const out: string[] = [];
  for (const part of raw.split(',')) {
    const id = part.trim();
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

export function readSetParams(params: URLSearchParams): SetParams {
  return {
    ids: parseIds(params.get('p')),
    title: (params.get('t') ?? '').trim(),
    // Spanish is the default: the clients and the founder are Spanish-first (D-004 for the public pages).
    lang: params.get('lang') === 'en' ? 'en' : 'es',
    print: params.get('print') === '1',
  };
}

/** The query string of a set link, in the page's own vocabulary; used by S-12 and by the language toggle. */
export function setQuery(ids: readonly string[], opts: { title?: string; lang?: Lang; print?: boolean } = {}): string {
  const out = new URLSearchParams();
  out.set('p', ids.join(','));
  if (opts.title) out.set('t', opts.title);
  if (opts.lang) out.set('lang', opts.lang);
  if (opts.print) out.set('print', '1');
  return out.toString();
}

/**
 * The page's own translator. P-06 never switches the app-wide language: the URL is the source of truth while
 * the page is mounted, so the studio's own EN session is not rewritten by opening a client link in a tab.
 */
export function translator(lang: Lang, table: StringTable = strings) {
  return (key: string, vars?: Record<string, string | number>): string => {
    const entry = table[key];
    let text = entry === undefined ? `<${key}>` : typeof entry === 'string' ? entry : (lang === 'es' && entry.es) || entry.en;
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    return text;
  };
}

/**
 * Sentences that are studio memory, not client copy: the crawler's provenance (folder names, file and folder
 * counts, crawl dates, "featured project with a full index") and every "inferred; confirm with the founder"
 * note (D-060). They are stripped here rather than rewritten in the data, so the studio keeps seeing the
 * caveat on S-12 / S-13 while the client reads finished sentences only — and reads nothing at all when the
 * studio has not written any yet (the paragraph is omitted, never half-filled).
 */
const INTERNAL_SENTENCE =
  /(inferid|confirmar|dropbox|subcarpeta|carpeta "|última modificaci|ultima modificaci|pendiente la adaptaci|tasks imported|asana|sin archivos|rastread|crawl|índice completo|indice completo|proyecto destacado|archivos? (en|fechados)|carpetas|\d{4}-\d{2}-\d{2})/i;

/** The client-facing part of `project.summary`: whole sentences with no internal note; `''` when nothing is left. */
export function clientSummary(summary: string): string {
  const sentences = summary.match(/[^.!?]+[.!?]*/g) ?? [];
  return sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !INTERNAL_SENTENCE.test(s))
    .join(' ')
    .trim();
}

/** Placeholders the archive seed writes when a fact is unknown; never printed for a client. */
const PLACEHOLDER_TEXT = /^(ubicaci[oó]n no publicada|unknown|desconocido|sin dato|n\/a|-|—)$/i;

export function realText(value: string | null | undefined): string {
  const text = (value ?? '').trim();
  return text && !PLACEHOLDER_TEXT.test(text) ? text : '';
}

/** Tags that describe the archive, not the work: the client sees vocabulary about the project only. */
const INTERNAL_TAGS = new Set(['archive', 'archivo', 'dropbox', 'drive', 'confidencial', 'redactado', 'interno']);

export function clientTags(project: Project, alsoDrop: readonly string[] = []): string[] {
  const drop = new Set(alsoDrop.map((value) => value.trim().toLowerCase()));
  return project.tags.filter((tag) => {
    const key = tag.trim().toLowerCase();
    return key.length > 0 && !INTERNAL_TAGS.has(key) && !drop.has(key) && !/^\d{4}(-\d{4})?$/.test(key);
  });
}

/**
 * A file that may leave the studio (D-059): tagged `confidencial` or redacted by the crawler, it is never
 * shown and its name is never printed — the strip simply does not contain it.
 */
export function isConfidential(file: Asset): boolean {
  return file.tags.includes('confidencial') || /redact/i.test(file.title) || /redact/i.test(file.slug);
}

/**
 * Up to `max` design previews of a project: a file with a served render, nothing confidential or redacted
 * (D-059). Images come first — a photograph or a render reads as the work, a document page reads as paperwork —
 * and the archive's own file order decides the rest, so the strip is stable between loads.
 */
export function clientPreviews(files: readonly Asset[], max = 8): Asset[] {
  const shown = files.filter((f) => Boolean(f.thumbnailUrl) && !isConfidential(f));
  const rank = (file: Asset) => (fileTypeOf(file.slug.includes('.') ? file.slug : file.title || file.mimeType) === 'image' ? 0 : 1);
  return shown.map((file, index) => ({ file, index })).sort((a, b) => rank(a.file) - rank(b.file) || a.index - b.index).map((entry) => entry.file).slice(0, max);
}

/** The markdown list S-12 files in Spaces and the intro line of a set: one line per project. */
export function projectLine(project: Project, typeLabel: string): string {
  return [project.name, project.year ?? '', typeLabel].filter((part) => String(part).length > 0).join(' · ');
}
