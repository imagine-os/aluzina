import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Asset } from '../../../data/schema';
import type { FileType } from '../../../domain/archive';
import { cx } from '../../../design/cx';
import { Button } from '../../atom/Button/Button';
import { FileIcon } from '../../atom/FileIcon/FileIcon';
import './DocumentViewer.css';

export type ViewerAsset = Pick<Asset, 'title' | 'titleEs' | 'url' | 'sourceUrl' | 'mimeType' | 'previewUrls' | 'pageCount' | 'thumbnailUrl'> & { fileType: FileType };

export interface DocumentViewerLabels {
  /** Sentence shown when the browser cannot render the file in the page. */
  fallback: string;
  download: string;
  openSource: string;
  /** "Page {n} of {total}", formatted by the caller. */
  page: (n: number, total: number) => string;
  prev: string;
  next: string;
  /** Name of the thumbnail strip (nav landmark). */
  thumbnails: string;
  /** Name of the file-type icon in the fallback (translated `FILE_TYPE_LABELS`); defaults to the mime type. */
  fileType?: string;
}

export interface DocumentViewerProps {
  asset: ViewerAsset;
  /** 1-based page, controlled; uncontrolled (starts at 1) when omitted. */
  page?: number;
  onPage?: (n: number) => void;
  labels: DocumentViewerLabels;
  /** Suggested file name for the Download button (`Button download`). */
  downloadName?: string;
  /** Render the viewer's own "Open at source" / "Download" row (default true); a page with its own action row passes false. */
  controls?: boolean;
  className?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * In-app preview of one asset (P-07). Four modes, picked from the data:
 * 1. `previewUrls` present -> paged image viewer over the served page renders (archived PDFs, D-055): prev / next
 *    buttons (>= 44 px), ArrowLeft / ArrowRight and Home / End on the focused stage, "Page n of N", a thumbnail
 *    strip where each page is a button.
 * 2. PDF with a served `url` -> `<object>` / `<iframe>` chain with a sentence + Download fallback (G-08's own
 *    DocFrame worked this way and was replaced by this organism in ar-17).
 * 3. Image with `url` or `thumbnailUrl` -> one large `<img>`; video with `url` -> `<video controls>`.
 * 4. Anything else -> `FileIcon`, the mime type and the buttons "Open at source" (`sourceUrl`, new tab) and
 *    "Download" (`url`), each rendered only when its link exists (`controls={false}` hides the row in every mode).
 * An image whose file fails to load falls back to mode 4 (as `Thumb` does), so a missing render reads as a state.
 */
export function DocumentViewer({ asset, page, onPage, labels, downloadName, controls = true, className }: DocumentViewerProps) {
  const pages = asset.previewUrls;
  const total = pages.length;
  const [inner, setInner] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = asset.url ?? asset.thumbnailUrl ?? null;
  useEffect(() => setImageFailed(false), [imageSrc]);
  const current = clamp(page ?? inner, 1, Math.max(total, 1));
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLElement>(null);

  const go = (n: number) => {
    const next = clamp(n, 1, Math.max(total, 1));
    if (page === undefined) setInner(next);
    onPage?.(next);
  };

  // Keep the current page's thumbnail in view when the page changes from the buttons or the keyboard.
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-page="${current}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [current]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(current - 1);
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') go(current + 1);
    else if (e.key === 'Home') go(1);
    else if (e.key === 'End') go(total);
    else return;
    e.preventDefault();
  };

  const actions = controls ? (
    <div className="doc-viewer__actions">
      {asset.sourceUrl && (
        <Button href={asset.sourceUrl} external iconEnd="↗">
          {labels.openSource}
        </Button>
      )}
      {asset.url && (
        <Button href={asset.url} download={downloadName ?? true}>
          {labels.download}
        </Button>
      )}
    </div>
  ) : null;

  const empty = (
    <div className={cx('doc-viewer', 'doc-viewer--none', className)}>
      <div className="doc-viewer__empty">
        <FileIcon type={asset.fileType} size="lg" label={labels.fileType ?? asset.mimeType} />
        <div className="doc-viewer__empty-text">
          <p className="doc-viewer__empty-title">{asset.title}</p>
          <p className="doc-viewer__empty-mime">{asset.mimeType}</p>
          <p className="doc-viewer__fallback">{labels.fallback}</p>
        </div>
      </div>
      {actions}
    </div>
  );

  if (total > 0) {
    return (
      <div className={cx('doc-viewer', 'doc-viewer--pages', className)}>
        <div className="doc-viewer__bar">
          <Button variant="ghost" icon="‹" aria-label={labels.prev} onClick={() => go(current - 1)} disabled={current <= 1} />
          <output className="doc-viewer__counter" aria-live="polite">
            {labels.page(current, total)}
          </output>
          <Button variant="ghost" icon="›" aria-label={labels.next} onClick={() => go(current + 1)} disabled={current >= total} />
        </div>
        <div ref={stageRef} className="doc-viewer__stage" tabIndex={0} onKeyDown={onKey} aria-label={labels.page(current, total)}>
          <img key={pages[current - 1]} className="doc-viewer__page" src={pages[current - 1]} alt={`${asset.title} — ${labels.page(current, total)}`} decoding="async" />
        </div>
        {total > 1 && (
          <nav ref={stripRef} className="doc-viewer__strip" aria-label={labels.thumbnails}>
            {pages.map((src, i) => {
              const n = i + 1;
              return (
                <button key={src} type="button" data-page={n} className={cx('doc-viewer__thumb', n === current && 'doc-viewer__thumb--current')} aria-label={labels.page(n, total)} aria-current={n === current ? 'page' : undefined} onClick={() => go(n)}>
                  <img src={src} alt="" loading="lazy" decoding="async" />
                  <span className="doc-viewer__thumb-n">{n}</span>
                </button>
              );
            })}
          </nav>
        )}
        {actions}
      </div>
    );
  }

  if (asset.fileType === 'pdf' && asset.url) {
    const src = page && page > 0 ? `${asset.url}#page=${page}` : asset.url;
    return (
      <div className={cx('doc-viewer', 'doc-viewer--pdf', className)}>
        <div className="doc-viewer__frame">
          <object key={src} className="doc-viewer__object" type="application/pdf" data={src} aria-label={asset.title}>
            <iframe className="doc-viewer__object" src={src} title={asset.title}>
              <p className="doc-viewer__fallback">{labels.fallback}</p>
            </iframe>
            <p className="doc-viewer__fallback">
              {labels.fallback} {actions}
            </p>
          </object>
        </div>
        {actions}
      </div>
    );
  }

  if (asset.fileType === 'image' && imageSrc && !imageFailed) {
    return (
      <div className={cx('doc-viewer', 'doc-viewer--image', className)}>
        <div className="doc-viewer__stage">
          <img className="doc-viewer__page" src={imageSrc} alt={asset.title} decoding="async" onError={() => setImageFailed(true)} />
        </div>
        {actions}
      </div>
    );
  }

  if (asset.fileType === 'video' && asset.url) {
    return (
      <div className={cx('doc-viewer', 'doc-viewer--video', className)}>
        {/* Captions are not part of the archive yet; the title and controls are the accessible alternative for now. */}
        <video className="doc-viewer__video" controls preload="metadata" src={asset.url} aria-label={asset.title} />
        {actions}
      </div>
    );
  }

  return empty;
}
