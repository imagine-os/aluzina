import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Button',
  tier: 'atom',
  purpose: 'The one button: primary / secondary / ghost / danger variants, sm / md / lg sizes, icon slots, link mode via href.',
  props: {
    variant: "'primary' | 'secondary' | 'ghost' | 'danger' (default secondary)",
    size: "'sm' | 'md' | 'lg' (default md; every size is >= 44 px tall)",
    icon: 'ReactNode? – before the label',
    iconEnd: 'ReactNode? – after the label',
    href: 'string? – renders an <a> styled as a button',
    external: 'boolean? – new tab + rel=noreferrer',
    fullWidth: 'boolean?',
    'aria-label': 'string – required when icon-only',
    '...rest': 'native button attributes (onClick, disabled, type, title)',
  },
  a11y: ['native <button> or <a>', 'min 44 x 44 px in every size', 'global :focus-visible ring', 'icon-only buttons need aria-label; icons are aria-hidden'],
  usages: ['RequireRole', 'DesktopShell', 'Kanban', 'ApprovalQueue', 'Modal', 'Drawer', 'HubPage'],
});
