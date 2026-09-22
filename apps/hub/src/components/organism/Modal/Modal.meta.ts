import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Modal',
  tier: 'organism',
  purpose: 'Centered dialog with header, scrolling body and footer; focus trap, Escape and backdrop close, focus returns to the opener.',
  props: { open: 'boolean', onClose: '() => void – any identity; since ar-20 the focus trap keeps it in a ref, so callers need no useCallback', title: 'string', children: 'ReactNode', footer: 'ReactNode? – Buttons', size: "'sm' | 'md' | 'lg'" },
  a11y: ['role=dialog aria-modal aria-labelledby', 'Tab cycles inside; Escape always closes (never a trap for the page)', 'close is a labelled 44 px Button', 'body scroll locked while open'],
  usages: ['confirmations in portals', 'dev components page'],
});
