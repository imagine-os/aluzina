import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Drawer',
  tier: 'organism',
  purpose: 'Side or bottom panel for details and phone menus; focus trap, Escape and backdrop close.',
  props: { open: 'boolean', onClose: '() => void – any identity; since ar-20 the focus trap keeps it in a ref, so callers need no useCallback', title: 'string', children: 'ReactNode', footer: 'ReactNode?', side: "'right' | 'left' | 'bottom'" },
  a11y: ['role=dialog aria-modal aria-labelledby', 'Escape closes, focus returns to the opener', 'full width under 28rem so nothing is clipped on phones'],
  usages: ['DesktopShell (phone navigation, user menu)', 'detail panels in portals'],
});
