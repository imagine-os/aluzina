import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'DocumentViewer',
  tier: 'organism',
  purpose: 'In-app preview of one asset: paged image viewer over served page renders (archived PDFs), object/iframe chain for served PDFs, large image, video with controls, or the file icon with "Open at source" and "Download" for everything else.',
  props: {
    asset: "Pick<Asset,'title'|'titleEs'|'url'|'sourceUrl'|'mimeType'|'previewUrls'|'pageCount'|'thumbnailUrl'> & { fileType: FileType }",
    page: 'number? – 1-based, controlled; uncontrolled from 1 when omitted',
    onPage: '(n: number) => void?',
    labels: '{ fallback, download, openSource, prev, next, thumbnails: string; page: (n, total) => string; fileType?: string }',
    downloadName: 'string? – suggested file name for Download',
    controls: 'boolean? – render the viewer\'s own "Open at source" / "Download" row (default true); false when the page has its own action row',
    className: 'string?',
  },
  a11y: ['prev / next are library Buttons (>= 44 px); ArrowLeft / ArrowRight, PageUp / PageDown, Home / End on the focused stage', 'page counter is an <output aria-live=polite>', 'thumbnail strip is a nav of buttons with aria-current=page on the current one', 'every mode keeps a text alternative: alt on the page image, title on the iframe, a sentence + buttons when nothing can render; an image that fails to load falls back to the icon + sentence (onError)', 'links to the source open in a new tab with rel=noreferrer (Button external)'],
  usages: ['S-12 archive project portal (file preview in a Drawer / Modal)', 'G-08 brand documents (migration card, replaces DocFrame)', 'P-05 public portfolio (planned)'],
});
