import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'StatusPill',
  tier: 'atom',
  purpose: 'Status badge with a dot; tone derived from the shared status vocabulary (STATUS_TONES), label from core.status.* strings.',
  props: { status: 'string – raw status value (e.g. awaiting-founder)', label: 'string? – translated override', tone: 'Tone? – override' },
  a11y: ['label always visible; dot is decoration', 'no interaction'],
  usages: ['DataTable', 'Kanban', 'ApprovalQueue', 'dev specs page'],
});
