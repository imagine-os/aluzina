import type { Asset } from '../../data/schema';

/**
 * The studio PDFs a visitor can read (`apps/hub/public/brand/`, Vite `base: './'`, so the paths are
 * relative to the site root and survive the GitHub Pages sub-path). Since prompt 0013 the list is data:
 * `assets` rows with `kind: 'document'` (seeded from `docs/brand/<doc>/index.json`), read by P-05 through
 * `useTable` and turned into `PublicDoc` with `docFromAsset`; `PUBLIC_DOCUMENTS` is the fallback while the
 * table loads. The same rows are managed by the brand portal on G-08 `/brand/documents`; the helpers are
 * duplicated there because a module never imports another module (a shared `DocumentViewer` organism is
 * requested in docs/changelog/_pending/brand-docs.md).
 */
export const PUBLIC_DOC_IDS = ['portfolio', 'brochure'] as const;
export type PublicDocId = (typeof PUBLIC_DOC_IDS)[number];

export interface PublicDoc {
  /** The asset `slug`: the `?doc=` value, the action enum and the strings key. */
  id: string;
  assetId: string | null;
  href: string;
  downloadName: string;
  /** Page count and size of the file that is committed today; both move when the PDF is replaced. */
  pages: number;
  bytes: number;
  title: string;
  titleEs: string | null;
  palette: string[];
  fonts: string[];
}

export const PUBLIC_DOCUMENTS: readonly PublicDoc[] = [
  { id: 'portfolio', assetId: 'ast-portfolio', href: './brand/aluzina-portfolio.pdf', downloadName: 'Aluzina-Portfolio.pdf', pages: 37, bytes: 2_928_197, title: 'Aluzina portfolio (Universo de Diseño)', titleEs: 'Portafolio Aluzina (Universo de Diseño)', palette: [], fonts: [] },
  { id: 'brochure', assetId: 'ast-brochure', href: './brand/aluzina-brochure.pdf', downloadName: 'Aluzina-Brochure.pdf', pages: 19, bytes: 3_130_687, title: 'Aluzina brochure (Interiorismo / Iluminación)', titleEs: 'Brochure Aluzina (Interiorismo / Iluminación)', palette: [], fonts: [] },
];

/** A served `document` asset as the page's document; null for pages, images and unserved rows. */
export function docFromAsset(a: Asset): PublicDoc | null {
  if (a.kind !== 'document' || !a.url) return null;
  const words = a.slug.split('-').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return { id: a.slug, assetId: a.id, href: a.url, downloadName: `Aluzina-${words.join('-') || 'Document'}.pdf`, pages: a.pageCount ?? 0, bytes: a.bytes ?? 0, title: a.title, titleEs: a.titleEs, palette: a.palette, fonts: a.fonts };
}

/** Documents rows -> the page list; the static entries while the table loads or when it is empty. */
export function docsFromAssets(rows: readonly Asset[], loading: boolean): readonly PublicDoc[] {
  if (loading) return PUBLIC_DOCUMENTS;
  const docs = rows.map(docFromAsset).filter((d): d is PublicDoc => d !== null);
  return docs.length ? docs : PUBLIC_DOCUMENTS;
}

export function docIn(docs: readonly PublicDoc[], value: unknown): PublicDoc | undefined {
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

export function isPublicDocId(value: unknown): value is PublicDocId {
  return typeof value === 'string' && (PUBLIC_DOC_IDS as readonly string[]).includes(value);
}

export function publicDoc(id: PublicDocId): PublicDoc {
  return PUBLIC_DOCUMENTS.find((d) => d.id === id) ?? PUBLIC_DOCUMENTS[0];
}

/** Absolute URL of a served document, for "open in a new tab". */
export function absoluteDocUrl(href: string): string {
  return new URL(href, window.location.href).href;
}

/** Saves a served file without a visible link (the action bus and voice call this, not a click). */
export function triggerDocDownload(doc: PublicDoc): string {
  const a = document.createElement('a');
  a.href = doc.href;
  a.download = doc.downloadName;
  a.rel = 'noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return doc.downloadName;
}
