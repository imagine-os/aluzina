import { useState, type ReactNode } from 'react';
import { useT } from '../../../i18n/I18nProvider';
import { Button } from '../../atom/Button/Button';
import { StatusPill } from '../../atom/StatusPill/StatusPill';
import { Textarea } from '../../atom/Textarea/Textarea';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './ApprovalQueue.css';

export interface ApprovalItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  status: string;
}

export interface ApprovalQueueProps {
  items: ApprovalItem[];
  label: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onComment: (id: string, text: string) => void;
  emptyTitle?: string;
  /** Hide approve / reject for items already decided. */
  isOpen?: (item: ApprovalItem) => boolean;
}

/** List of items awaiting a decision with approve / reject / comment; the comment box opens inline. */
export function ApprovalQueue({ items, label, onApprove, onReject, onComment, emptyTitle, isOpen }: ApprovalQueueProps) {
  const { t } = useT();
  const [commenting, setCommenting] = useState<string | null>(null);
  const [text, setText] = useState('');

  if (items.length === 0) return <EmptyState title={emptyTitle ?? t('core.approval.empty')} glyph="✓" />;

  return (
    <ul className="approvals" aria-label={label}>
      {items.map((it) => {
        const open = isOpen ? isOpen(it) : true;
        const isCommenting = commenting === it.id;
        return (
          <li key={it.id} className="approvals__item">
            <div className="approvals__main">
              <div className="approvals__text">
                <span className="approvals__title">{it.title}</span>
                {it.subtitle && <span className="approvals__sub">{it.subtitle}</span>}
                {it.meta && <span className="approvals__meta">{it.meta}</span>}
              </div>
              <StatusPill status={it.status} />
            </div>
            <div className="approvals__actions">
              {open && (
                <>
                  <Button variant="primary" size="sm" onClick={() => onApprove(it.id)}>
                    {t('core.approval.approve')}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onReject(it.id)}>
                    {t('core.approval.reject')}
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" aria-expanded={isCommenting} onClick={() => { setCommenting(isCommenting ? null : it.id); setText(''); }}>
                {t('core.approval.comment')}
              </Button>
            </div>
            {isCommenting && (
              <form
                className="approvals__comment"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!text.trim()) return;
                  onComment(it.id, text.trim());
                  setCommenting(null);
                  setText('');
                }}
              >
                <Textarea label={t('core.approval.commentLabel')} value={text} onChange={(e) => setText(e.target.value)} rows={2} />
                <Button type="submit" size="sm" variant="primary" disabled={!text.trim()}>
                  {t('core.approval.send')}
                </Button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
