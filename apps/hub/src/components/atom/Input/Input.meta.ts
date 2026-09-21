import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Input',
  tier: 'atom',
  purpose: 'Labelled text input with hint, error and optional prefix; the shared .field styles used by Select, Textarea and Checkbox.',
  props: { label: 'string', hint: 'string?', error: 'string? – sets aria-invalid and role=alert', prefix: 'ReactNode?', hideLabel: 'boolean? – visually hidden label', '...rest': 'native input attributes (value, onChange, type, placeholder, required)' },
  a11y: ['<label for> always rendered (visually hidden at most)', 'hint / error linked via aria-describedby', '44 px tall', 'error announced with role=alert'],
  usages: ['SearchField', 'dev components page'],
});
