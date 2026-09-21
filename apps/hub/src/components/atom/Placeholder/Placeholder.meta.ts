import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'Placeholder',
  tier: 'atom',
  purpose: 'Marks UI that is not wired yet: tooltip on hover/focus, toast on activation, dev-mode outline + badge, data-placeholder. Around plain content it is a button; around a Button / <button> / <a> it is a span wrapper that decorates the control (D-019).',
  props: { what: 'string (translated) – what the real control will do', bare: 'boolean? – force wrapper mode (auto for Button, <button>, <a> children)', className: 'string?', children: 'ReactNode' },
  a11y: ['plain content: one real <button>, 44 px minimum', 'control child: no nested buttons, one tab stop; the control gets aria-describedby and the toast on click', 'tooltip shown on hover, focus and focus-within, display:none otherwise (never widens the page)', 'activation announces via the Toast live region'],
  usages: ['SurfaceCard (planned surfaces)', 'PageStub', 'every portal page for unwired actions'],
});
