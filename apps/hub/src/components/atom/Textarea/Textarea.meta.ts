import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Textarea',
  tier: 'atom',
  purpose: 'Labelled multi-line input with hint and error; vertical resize only.',
  props: { label: 'string', rows: 'number? (default 3)', hint: 'string?', error: 'string?', hideLabel: 'boolean?', '...rest': 'native textarea attributes' },
  a11y: ['<label for>', 'hint / error via aria-describedby', 'min height two targets'],
  usages: ['ApprovalQueue (comment)'],
});
