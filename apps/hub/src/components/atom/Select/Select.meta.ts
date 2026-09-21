import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Select',
  tier: 'atom',
  purpose: 'Labelled native select with options, hint, error and an optional empty placeholder option.',
  props: { label: 'string', options: '{ value, label, disabled? }[]', placeholder: 'string? – empty first option', hint: 'string?', error: 'string?', hideLabel: 'boolean?', '...rest': 'native select attributes (value, onChange)' },
  a11y: ['native <select>: keyboard, touch, d-pad and voice for free', '<label for> always rendered', '44 px tall'],
  usages: ['RoleSwitcher', 'FilterBar', 'Kanban (move to column)'],
});
