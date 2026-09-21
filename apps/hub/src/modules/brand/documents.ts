import { downloadUrl } from '../../design/clipboard';
import type { Asset } from '../../data/schema';

/**
 * The studio PDFs served with the app (`apps/hub/public/brand/`, Vite `base: './'`, so the paths are
 * relative to the site root and survive the GitHub Pages sub-path). Since prompt 0013 the list is data:
 * `assets` rows with `kind: 'document'` (seeded from `docs/brand/<doc>/index.json`), read by G-08 through
 * `useTable` and turned into `BrandDoc` with `docFromAsset`; `BRAND_DOCUMENTS` is the fallback while the
 * table loads (and the list G-01 still uses). Replacing a file is a `Placeholder` (P-09) until file storage
 * exists. The same documents are published to visitors on P-05 `/portfolio`; when a `DocumentViewer`
 * organism lands in the library both pages use it (request in docs/changelog/_pending/brand-docs.md).
 */
export const BRAND_DOC_IDS = ['portfolio', 'brochure'] as const;
export type BrandDocId = (typeof BRAND_DOC_IDS)[number];

export interface BrandDoc {
  /** The asset `slug` (`portfolio`, `brochure`): the `?doc=` value, the action enum and the strings key. */
  id: string;
  /** `assets.id` of the row; null for the static fallback entries. */
  assetId: string | null;
  /** Served path, relative to the site root (never absolute: the app can live under /<repo>/ on Pages). */
  href: string;
  /** Filename the browser saves, independent of the served path. */
  downloadName: string;
  /** Page count and size of the file that is committed today; both move when the PDF is replaced. */
  pages: number;
  bytes: number;
  /** Full title from the row (`title` / `titleEs`) and what the renderer read from the file. */
  title: string;
  titleEs: string | null;
  palette: string[];
  fonts: string[];
}

export const BRAND_DOCUMENTS: readonly BrandDoc[] = [
  { id: 'portfolio', assetId: 'ast-portfolio', href: './brand/aluzina-portfolio.pdf', downloadName: 'Aluzina-Portfolio.pdf', pages: 37, bytes: 2_928_197, title: 'Aluzina portfolio (Universo de Diseño)', titleEs: 'Portafolio Aluzina (Universo de Diseño)', palette: [], fonts: [] },
  { id: 'brochure', assetId: 'ast-brochure', href: './brand/aluzina-brochure.pdf', downloadName: 'Aluzina-Brochure.pdf', pages: 19, bytes: 3_130_687, title: 'Aluzina brochure (Interiorismo / Iluminación)', titleEs: 'Brochure Aluzina (Interiorismo / Iluminación)', palette: [], fonts: [] },
];

/** A served `document` asset as the page's document; null for pages, images and unserved rows. */
export function docFromAsset(a: Asset): BrandDoc | null {
  if (a.kind !== 'document' || !a.url) return null;
  return { id: a.slug, assetId: a.id, href: a.url, downloadName: downloadNameFor(a.slug), pages: a.pageCount ?? 0, bytes: a.bytes ?? 0, title: a.title, titleEs: a.titleEs, palette: a.palette, fonts: a.fonts };
}

/** `Aluzina-Portfolio.pdf` from the slug, so the saved file is named the same on every surface. */
export function downloadNameFor(slug: string): string {
  const words = slug.split('-').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return `Aluzina-${words.join('-') || 'Document'}.pdf`;
}

/** Documents rows -> the page list; the static entries while the table loads or when it is empty. */
export function docsFromAssets(rows: readonly Asset[], loading: boolean): readonly BrandDoc[] {
  if (loading) return BRAND_DOCUMENTS;
  const docs = rows.map(docFromAsset).filter((d): d is BrandDoc => d !== null);
  return docs.length ? docs : BRAND_DOCUMENTS;
}

export function docIn(docs: readonly BrandDoc[], value: unknown): BrandDoc | undefined {
  return typeof value === 'string' ? docs.find((d) => d.id === value) : undefined;
}

/** Font names the renderer read from the file, without its own remarks ("(wordmark: …)"). */
export function fontNames(fonts: readonly string[]): string[] {
  return fonts.filter((f) => !f.startsWith('('));
}

/** Size in MB with the language's decimal mark ("2.8" in English, "2,8" in Spanish). */
export function formatMb(bytes: number, lang: string): string {
  return (bytes / 1024 / 1024).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function isBrandDocId(value: unknown): value is BrandDocId {
  return typeof value === 'string' && (BRAND_DOC_IDS as readonly string[]).includes(value);
}

export function brandDoc(id: BrandDocId): BrandDoc {
  return BRAND_DOCUMENTS.find((d) => d.id === id) ?? BRAND_DOCUMENTS[0];
}

/** Absolute URL of a served document, for "open in a new tab" and for the shared link. */
export function absoluteUrl(href: string): string {
  return new URL(href, window.location.href).href;
}

export { copyText } from '../../design/clipboard';

/** Saves a served file without a visible link (the action bus and voice call this, not a click). */
export function triggerDownload(doc: BrandDoc): string {
  return downloadUrl(doc.href, doc.downloadName);
}
