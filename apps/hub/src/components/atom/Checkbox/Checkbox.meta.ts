import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Checkbox',
  tier: 'atom',
  purpose: 'Native checkbox with label and hint; the row is the target.',
  props: { label: 'string', hint: 'string?', '...rest': 'native input attributes (checked, onChange, disabled)' },
  a11y: ['native input, label wraps the row (44 px)', 'hint via aria-describedby', 'accent-color from tokens'],
  usages: ['dev components page', 'consistency check lists (studio module)'],
});
