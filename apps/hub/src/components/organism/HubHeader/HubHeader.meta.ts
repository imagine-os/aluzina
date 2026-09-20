import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'HubHeader',
  tier: 'organism',
  purpose: 'Hub header: brand mark and the language / theme / dev-mode toggles.',
  props: {},
  a11y: ['controls grouped in a <nav> with an accessible name', 'each toggle is a 44 px ToggleButton with a full aria-label', 'wraps at phone width, no horizontal scroll'],
  usages: ['HubPage'],
});
