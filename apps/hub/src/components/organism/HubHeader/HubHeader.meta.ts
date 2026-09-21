import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'HubHeader',
  tier: 'organism',
  purpose: 'Hub header: brand, "Viewing as" RoleSwitcher and the global controls (language, theme, dev mode).',
  props: {},
  a11y: ['brand is a link to #/', 'controls are ToggleButtons with aria-pressed and a native Select', 'wraps at phone width'],
  usages: ['HubPage'],
});
