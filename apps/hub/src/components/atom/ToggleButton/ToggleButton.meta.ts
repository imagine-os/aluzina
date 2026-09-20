import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'ToggleButton',
  tier: 'atom',
  purpose: 'Pill button for header controls (language, theme, dev mode).',
  props: { label: 'string – accessible name', onClick: '() => void', pressed: 'boolean? – aria-pressed when a two-state toggle', children: 'ReactNode' },
  a11y: ['44 px minimum target', 'aria-label carries the full name when the visible text is short', 'aria-pressed on two-state toggles', 'focus ring from the global :focus-visible rule'],
  usages: ['HubHeader'],
});
