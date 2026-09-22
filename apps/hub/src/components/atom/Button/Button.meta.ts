import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Button',
  tier: 'atom',
  purpose: 'The one button: primary / secondary / ghost / danger variants, sm / md / lg sizes, icon slots, link mode via href.',
  props: {
    variant: "'primary' | 'secondary' | 'ghost' | 'danger' (default secondary)",
    size: "'sm' | 'md' | 'lg' (default md; every size is >= 44 px tall)",
    icon: 'IconName | ReactNode? – before the label; a string resolves as an icon name, then as a mapped Unicode glyph, then renders as text (D-064)',
    iconEnd: 'IconName | ReactNode? – after the label; same resolution as icon',
    href: 'string? – renders an <a> styled as a button',
    external: 'boolean? – new tab + rel=noreferrer',
    download: 'boolean | string? – with href, downloads the target (true, or a suggested file name) instead of navigating',
    fullWidth: 'boolean?',
    'aria-label': 'string – required when icon-only',
    '...rest': 'native button attributes (onClick, disabled, type, title)',
  },
  a11y: ['native <button> or <a>', 'min 44 x 44 px in every size', 'global :focus-visible ring', 'icon-only buttons need aria-label; icons are aria-hidden'],
  usages: ['RequireRole', 'DesktopShell', 'Kanban', 'ApprovalQueue', 'Modal', 'Drawer', 'HubPage'],
});
