import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'DataTable',
  tier: 'organism',
  purpose: 'Sortable data table with keyboard row focus, row actions, loading and empty states; collapses to stacked cards under 768 px.',
  props: {
    columns: '{ key, header, render?, sortValue?, sortable?, align?, width? }[]',
    rows: 'T[]',
    rowKey: '(row) => string',
    caption: 'string – table name (visually hidden)',
    loading: 'boolean? – Skeleton',
    emptyTitle: 'string?',
    emptyDescription: 'string?',
    onRowActivate: '(row) => void? – rows focusable, Enter / click',
    rowActions: '{ id, label, onClick, variant?, when? }[]?',
    initialSort: '{ key, dir }?',
    dense: 'boolean?',
  },
  a11y: ['<caption>, <th scope=col>, aria-sort on the sorted column', 'sort headers are buttons with a translated label', 'rows: tabindex 0, ArrowUp / ArrowDown move focus, Enter or Space activate', 'phone layout keeps every header via data-label; no horizontal page scroll'],
  usages: ['dev specs page', 'portal list pages'],
});
