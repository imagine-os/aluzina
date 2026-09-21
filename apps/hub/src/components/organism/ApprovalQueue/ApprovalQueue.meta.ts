import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'ApprovalQueue',
  tier: 'organism',
  purpose: 'Items awaiting a decision with Approve / Reject / Comment; the comment form opens inline and submits on Enter.',
  props: { items: '{ id, title, subtitle?, meta?, status }[]', label: 'string', onApprove: '(id) => void', onReject: '(id) => void', onComment: '(id, text) => void', emptyTitle: 'string?', isOpen: '(item) => boolean? – hides decisions for closed items' },
  a11y: ['list with aria-label', 'comment toggle has aria-expanded', 'all controls are Buttons / Textarea; status is a StatusPill (text + dot)'],
  usages: ['founder approvals (A-xx)', 'client proposal approvals (C-xx)', 'dev components page'],
});
