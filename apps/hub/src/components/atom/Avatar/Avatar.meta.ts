import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Avatar',
  tier: 'atom',
  purpose: 'Initials or photo in a circle for a person (demo users, assignees).',
  props: { name: 'string – accessible label', initials: 'string? (derived from name)', src: 'string? – image', size: "'sm' | 'md' | 'lg'" },
  a11y: ['role=img with aria-label=name', 'image alt empty (name already given)'],
  usages: ['DesktopShell (user menu)', 'RoleSwitcher', 'HubPage portal cards'],
});
