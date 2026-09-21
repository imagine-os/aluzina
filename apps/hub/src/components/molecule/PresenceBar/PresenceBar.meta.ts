import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'PresenceBar',
  tier: 'molecule',
  purpose: 'Who is here right now: stacked avatars (self ringed in accent) and a visible "Miguel, Sarai are here" line; tooltips name the route each person is on.',
  props: { people: '{ id, name, initials?, route?, self? }[]', compact: 'boolean? – avatars only, text for screen readers', max: 'number? (default 5)' },
  a11y: ['role=group with a label; the sentence is always in the DOM (visually hidden in compact mode)', 'avatars carry the person name as their accessible label; the route is a title, never the only cue', 'the text hides under 768 px to keep the toolbar to one row'],
  usages: ['WorkHeader (W-01, W-02)', 'DesktopShell top bar', 'D-04 multiuser page'],
});
