import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'StatTile',
  tier: 'molecule',
  purpose: 'KPI tile for dashboards: label, large value, hint line, tone bar; optionally a button.',
  props: { label: 'string', value: 'ReactNode', hint: 'ReactNode?', tone: 'Tone?', glyph: 'string?', onActivate: '() => void?' },
  a11y: ['tone is a side bar plus text; never colour alone', 'button variant when onActivate', 'value wraps rather than overflowing at 360'],
  usages: ['portal dashboards', 'dev specs page'],
});
