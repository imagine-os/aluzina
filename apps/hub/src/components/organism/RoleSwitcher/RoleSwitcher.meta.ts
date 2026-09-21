import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'RoleSwitcher',
  tier: 'organism',
  purpose: '"Viewing as" select over the demo users; switches the session identity (hub.switchRole). Mock identity, real guards.',
  props: { compact: 'boolean? – small uppercase label, no avatar (hub header)', onSwitched: '(role) => void? – e.g. navigate to the portal' },
  a11y: ['native Select with a visible "Viewing as" label in both modes', 'Avatar carries the current user name'],
  usages: ['HubHeader', 'DesktopShell (user menu)'],
});
