import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'OverflowMenu',
  tier: 'molecule',
  purpose:
    'A "More" menu for controls that do not fit a toolbar row: native <details>, the summary styled as a ghost Button, the panel a raised surface with full-width button rows and labelled rows (.omenu__row) for grouped toggles. States: closed, open (trigger raised), focus (global ring), a row disabled.',
  props: {
    label: 'string – visible trigger text',
    'aria-label': 'string? – full name, contains the visible label',
    panelLabel: 'string? – the panel group name',
    icon: "IconName | ReactNode – default 'more'",
    open: 'boolean? – controlled',
    onOpenChange: '(open) => void',
    align: "'start' | 'end' – panel edge",
    size: "'sm' | 'md'",
    children: 'ReactNode – Buttons and .omenu__row groups',
  },
  a11y: [
    'native details / summary: Enter and Space toggle, the open state is announced',
    'Escape closes and returns focus to the trigger; focus or a pointer leaving the menu closes it',
    'a button activated inside closes the menu unless it sits in [data-keep-open] (grouped toggles such as S / M / L)',
    'trigger and every row are >= 44 px; nothing is hover-only',
  ],
  usages: ['DeskStage (desk toolbar overflow, changelog 0043)', 'dev components page'],
});
