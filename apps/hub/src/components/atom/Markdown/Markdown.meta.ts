import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Markdown',
  tier: 'atom',
  purpose: 'Safe Markdown renderer for post bodies (K-03): headings (demoted one level), paragraphs, bullet / numbered / task lists, block quotes, fenced code, pipe tables; inline bold, italic, code and http(s) / mailto links. Builds React elements, never HTML strings.',
  props: { source: 'string – Markdown text', className: 'string?' },
  a11y: ['headings start at h2 so the page keeps its h1', 'task items expose "[x]" / "[ ]" to screen readers', 'links open in a new tab with rel=noreferrer; non-http URLs render as text', 'tables have th scope=col and scroll inside their wrapper'],
  usages: ['K-03 post detail', 'K-01 / K-02 space description (read mode)'],
});
