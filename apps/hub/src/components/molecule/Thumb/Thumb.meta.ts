import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Thumb',
  tier: 'molecule',
  purpose: 'Fixed-ratio thumbnail box: lazy image when there is a source, the FileIcon on a tint when there is none or the image fails, optional corner badge ("12 p.", "PDF") and caption line. A plain figure: the parent makes it a button or link.',
  props: { src: 'string | null', alt: 'string', type: 'FileType (domain/archive)', ratio: "'4:3' | '16:9' | '1:1' | '3:4' = '4:3'", badge: 'string?', caption: 'string? – one line, ellipsis', size: "'sm' | 'md' | 'lg' = 'md'", iconLabel: 'string? – name of the fallback icon (translated file-type label)', className: 'string?' },
  a11y: ['img alt is the caller\'s text; the fallback icon is role=img with iconLabel or alt', 'not interactive by itself: wrap in Card onActivate, Button href or an <a> for one tab stop', 'aspect-ratio box: the grid never shifts while images load (P-01)', 'loading=lazy decoding=async'],
  usages: ['S-12 archive browser (project covers, file grids)', 'DocumentViewer (page thumbnail strip)', 'project portal file lists'],
});
