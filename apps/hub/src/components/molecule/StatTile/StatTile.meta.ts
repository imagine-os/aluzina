import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'StatTile',
  tier: 'molecule',
  purpose: 'KPI tile for dashboards: label, large value, hint line, tone bar; optionally a button.',
  props: { label: 'string', value: 'ReactNode', hint: 'ReactNode?', tone: 'Tone?', glyph: 'string?', onActivate: '() => void?' },
  a11y: ['tone is a side bar plus text; never colour alone', 'button variant when onActivate', 'value never splits inside a number: nowrap, type scales with the tile (container query), ellipsis as last resort'],
  usages: ['portal dashboards', 'dev specs page'],
});
