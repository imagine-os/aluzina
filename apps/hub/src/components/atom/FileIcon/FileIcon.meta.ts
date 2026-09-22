import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'FileIcon',
  tier: 'atom',
  purpose: 'Glyph for a file family (pdf, image, vector, presentation, spreadsheet, document, cad, model3d, video, audio, archive, folder, other): a sheet with a folded corner and a distinct inner mark per type over a soft tint. Inline SVG, currentColor strokes.',
  props: { type: 'FileType (domain/archive)', size: "'sm' | 'md' | 'lg' = 'md' (1.25 / 2 / 3.5 rem)", label: 'string? – accessible name (pass the translated FILE_TYPE_LABELS text); defaults to the type id', className: 'string?' },
  a11y: ['role=img with aria-label; the svg itself is aria-hidden', 'shape differs per type: colour is never the only cue (P-03)', 'tints and inks come from tokens, so light, dark and the metal switch apply'],
  usages: ['Thumb (fallback when there is no thumbnail)', 'DocumentViewer (non-previewable files)', 'S-12 archive file lists', 'G-08, K-01 / K-02, K-03 and K-05 through Thumb (ar-17)'],
});
