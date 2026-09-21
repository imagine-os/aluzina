import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge } from '../../atom/Badge/Badge';
import { StatusPill } from '../../atom/StatusPill/StatusPill';
import { cx } from '../../../design/cx';
import { useT } from '../../../i18n/I18nProvider';
import './PostCard.css';

export interface PostCardProps {
  title: string;
  /** Post kind (note, link, file, decision, procedure, brief, announcement); label comes from core strings. */
  kind: string;
  /** Post status; `published` is not shown, `draft` / `archived` get a pill. */
  status?: string;
  pinned?: boolean;
  tags?: string[];
  author?: { name: string; initials?: string } | null;
  /** Already formatted date. */
  updated: string;
  /** Spaces this post is also filed in (besides the one being viewed). */
  alsoIn?: number;
  /** First lines of the body, plain text. */
  excerpt?: string;
  /** Present when the post is a link. */
  url?: string | null;
  onOpen: () => void;
}

/**
 * One post in a space's list (K-01 / K-02): title, kind pill, "also in N spaces" chip (the point of the
 * many-to-many model), tags, author and date. The whole card is one button (44 px+), nothing hover-only.
 */
export function PostCard({ title, kind, status, pinned, tags = [], author, updated, alsoIn = 0, excerpt, url, onOpen }: PostCardProps) {
  const { t } = useT();
  return (
    <button type="button" className={cx('pcard', pinned && 'pcard--pinned')} onClick={onOpen} data-kind={kind}>
      <span className="pcard__top">
        {pinned && (
          <span className="pcard__pin" title={t('core.spaces.pinned')}>
            <span aria-hidden="true">⚲</span>
            <span className="visually-hidden">{t('core.spaces.pinned')}</span>
          </span>
        )}
        <Badge tone={kind === 'decision' ? 'danger' : kind === 'procedure' ? 'success' : kind === 'announcement' ? 'accent' : 'neutral'}>{t(`core.spaces.kind.${kind}`)}</Badge>
        {status && status !== 'published' && <StatusPill status={status} />}
        {alsoIn > 0 && <Badge tone="info">{t(alsoIn === 1 ? 'core.spaces.alsoInOne' : 'core.spaces.alsoIn', { n: alsoIn })}</Badge>}
        {url && <span className="pcard__url">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>}
      </span>
      <span className="pcard__title">{title}</span>
      {excerpt && <span className="pcard__excerpt">{excerpt}</span>}
      <span className="pcard__meta">
        {author && (
          <span className="pcard__author">
            <Avatar name={author.name} initials={author.initials} size="sm" />
            <span>{author.name}</span>
          </span>
        )}
        <span className="pcard__date">{updated}</span>
        {tags.length > 0 && (
          <span className="pcard__tags">
            {tags.map((tag) => (
              <span key={tag} className="pcard__tag">#{tag}</span>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}
