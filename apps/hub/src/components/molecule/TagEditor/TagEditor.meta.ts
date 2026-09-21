import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'TagEditor',
  tier: 'molecule',
  purpose: 'Tag chips plus a suggestion combobox: type to filter the known tags, Enter or Add to add, × on a chip to remove. Values are trimmed, lower-cased and de-duplicated, empty strings rejected, and the count is announced through aria-live. The caller owns the array and decides when to write it.',
  props: {
    value: 'string[] – the tags as stored',
    onChange: '(next: string[]) => void',
    suggestions: 'string[] – known tags, filtered as you type (max 8 shown)',
    label: 'string – label of the field and name of the listbox',
    placeholder: 'string?',
    addLabel: 'string – the explicit Add button (touch and mouse)',
    removeLabel: '(tag: string) => string – accessible name of each × button',
    disabled: 'boolean?',
    max: 'number? – locks the field once value.length reaches it',
    hint: 'string? – line under the field and row, linked with aria-describedby',
    countLabel: '(count: number) => string? – text of the aria-live count, defaults to the bare number',
    className: 'string?',
  },
  a11y: [
    'the input is a combobox: aria-expanded / aria-controls / aria-autocomplete=list / aria-activedescendant',
    'keyboard: ArrowDown / ArrowUp walk the suggestions, Enter adds the highlighted one or what is typed, comma and semicolon add, Backspace on an empty field removes the last chip, Escape closes the list',
    'every remove button is a 44 px target (--target); the suggestion rows are 44 px too, so touch works without hover',
    'the count line is aria-live=polite, so adding or removing a tag is announced',
    'light and dark through tokens only; the active option is background + text colour, never colour alone (it is also the aria-selected option)',
  ],
  usages: ['S-13 project portal: file tags in the preview drawer and project tags in the hero', 'planned: post tags in Spaces (K-03), asset tags on G-08'],
});
