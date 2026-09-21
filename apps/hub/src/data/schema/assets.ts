import type { BaseRow, Id, ISODate } from './base';

/**
 * Assets (prompt 0013): files the studio publishes or keeps as brand memory, held as rows so they can be
 * related to projects, clients and services (D-026) instead of living only as static files. A `document`
 * is a served PDF (`url` relative to the site root, Vite `publicDir`); its `page` rows point at the page
 * renders in `docs/brand/<doc>/page-NN.jpg` (`repoPath`, not served by the app, so `url` is null) and say
 * which document they belong to (`parentId`). Seeds derive every row from `docs/brand/<doc>/index.json`
 * through the `@docs` alias, so the repo's visual memory stays the single source (`seed/assets.ts`).
 */
export type AssetKind = 'document' | 'page' | 'image' | 'logo' | 'texture';
export const ASSET_KINDS: readonly AssetKind[] = ['document', 'page', 'image', 'logo', 'texture'];

export type AssetStatus = 'current' | 'superseded' | 'draft';

export interface Asset extends BaseRow {
  kind: AssetKind;
  /** English title; the Spanish one when it differs (the source documents are Spanish). */
  title: string;
  titleEs: string | null;
  /** URL-safe, unique per kind (`portfolio`, `portfolio-p01`). */
  slug: string;
  /** Served path relative to the site root (`./brand/aluzina-portfolio.pdf`); null when the file is not served (page renders). */
  url: string | null;
  /** Path in the repo (`docs/brand/portfolio/page-01.jpg`, `docs/source/brand/ALUZINA.pdf`); null when the file is not in the repo. */
  repoPath: string | null;
  mimeType: string;
  bytes: number | null;
  /** Pages of a document; null for other kinds. */
  pageCount: number | null;
  /** 1-based page number of a `page`; null for other kinds. */
  pageNumber: number | null;
  /** The document a page belongs to (`part-of` is also written as a relation); null for top-level assets. */
  parentId: Id | null;
  /** Where the file came from: the Slack file id and the original filename, when known. */
  sourceFileId: string | null;
  sourceName: string | null;
  /** When the studio published it; null when the document is undated (both marketing PDFs are). */
  publishedAt: ISODate | null;
  language: 'es' | 'en' | null;
  /** Dominant colours (`#rrggbb`) and font names read from the file; empty when unknown. */
  palette: string[];
  fonts: string[];
  /** The headline or the first lines of text, for lists and search; empty when the page has no text. */
  textExcerpt: string;
  tags: string[];
  status: AssetStatus;
  /** The asset this one replaces (a re-exported PDF supersedes the previous row); null otherwise. */
  supersedesId: Id | null;
}
