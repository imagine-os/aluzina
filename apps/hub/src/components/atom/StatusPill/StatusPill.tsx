import { useT } from '../../../i18n/I18nProvider';
import { Badge, type Tone } from '../Badge/Badge';

/** Known status values across the schema -> tone. Anything else is neutral. */
export const STATUS_TONES: Record<string, Tone> = {
  // generic
  done: 'success', paid: 'success', approved: 'success', 'client-approved': 'success', passed: 'success', final: 'success', signed: 'success', delivered: 'success', confirmed: 'success', selected: 'success', active: 'success', current: 'success', ready: 'success', submitted: 'success', built: 'success',
  doing: 'accent', 'in-progress': 'accent', 'in-check': 'accent', 'in-review': 'accent', review: 'accent', received: 'accent', shortlisted: 'accent', sampled: 'accent', rendering: 'accent', drafting: 'accent', preparing: 'accent', researching: 'accent', partial: 'accent', sent: 'accent', acknowledged: 'accent',
  todo: 'neutral', draft: 'neutral', requested: 'neutral', pending: 'neutral', proposed: 'neutral', briefing: 'neutral', slot: 'neutral', trial: 'neutral', stub: 'neutral', open: 'neutral', info: 'neutral',
  blocked: 'warning', 'awaiting-founder': 'warning', due: 'warning', delayed: 'warning', issues: 'warning', 'changes-requested': 'warning', paused: 'warning', warning: 'warning', superseded: 'warning',
  overdue: 'danger', rejected: 'danger', urgent: 'danger',
  // Spaces catalogs (K-05): posts, deliverables, tools, clients
  published: 'success', archived: 'neutral', defined: 'neutral', 'template-ready': 'accent', automated: 'success', 'in-use': 'accent', evaluating: 'neutral', 'to-replace': 'warning', replaced: 'success', planned: 'neutral', past: 'neutral', prospect: 'info',
};

export interface StatusPillProps {
  /** Raw status value from a row, e.g. `awaiting-founder`. */
  status: string;
  /** Translated label; defaults to `core.status.<status>` when defined, else the raw value. */
  label?: string;
  tone?: Tone;
}

/** Badge with a dot whose tone follows the status vocabulary (never colour alone: the label is always shown). */
export function StatusPill({ status, label, tone }: StatusPillProps) {
  const { t } = useT();
  const key = `core.status.${status}`;
  const text = label ?? (t(key) === `<${key}>` ? status : t(key));
  return (
    <Badge tone={tone ?? STATUS_TONES[status] ?? 'neutral'} dot>
      {text}
    </Badge>
  );
}
