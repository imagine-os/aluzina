import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import { POST_KIND_ICONS } from '../../atom/Icon/iconMap';
import { StatusPill } from '../../atom/StatusPill/StatusPill';
import { Thumb } from '../Thumb/Thumb';
import { cx } from '../../../design/cx';
import type { FileType } from '../../../domain/archive';
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
  /**
   * File family of the file a `kind: 'file'` post carries (ar-17). Setting it shows a `Thumb` beside the
   * title; the card stays one button, so the thumbnail is never a second tab stop.
   */
  thumbType?: FileType;
  /** Served thumbnail of that file; null (or a failed load) draws the `FileIcon` on a tint instead. */
  thumbSrc?: string | null;
  /** Accessible name of the fallback icon (the translated `FILE_TYPE_LABELS` text); defaults to the title. */
  thumbLabel?: string;
  onOpen: () => void;
}

/**
 * One post in a space's list (K-01 / K-02): title, kind pill, "also in N spaces" chip (the point of the
 * many-to-many model), tags, author and date. The whole card is one button (44 px+), nothing hover-only.
 */
export function PostCard({ title, kind, status, pinned, tags = [], author, updated, alsoIn = 0, excerpt, url, thumbType, thumbSrc = null, thumbLabel, onOpen }: PostCardProps) {
  const { t } = useT();
  return (
    <button type="button" className={cx('pcard', pinned && 'pcard--pinned', thumbType && 'pcard--media')} onClick={onOpen} data-kind={kind}>
      <span className="pcard__top">
        {pinned && (
          <span className="pcard__pin" title={t('core.spaces.pinned')}>
            <Icon name="pin" size="sm" />
            <span className="visually-hidden">{t('core.spaces.pinned')}</span>
          </span>
        )}
        <span className="pcard__mark" aria-hidden="true"><Icon name={POST_KIND_ICONS[kind] ?? 'note'} size="sm" /></span>
        <Badge tone={kind === 'decision' ? 'danger' : kind === 'procedure' ? 'success' : kind === 'announcement' ? 'accent' : 'neutral'}>{t(`core.spaces.kind.${kind}`)}</Badge>
        {status && status !== 'published' && <StatusPill status={status} />}
        {alsoIn > 0 && <Badge tone="info">{t(alsoIn === 1 ? 'core.spaces.alsoInOne' : 'core.spaces.alsoIn', { n: alsoIn })}</Badge>}
        {url && <span className="pcard__url">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>}
      </span>
      <span className="pcard__row">
        {thumbType && <Thumb className="pcard__thumb" src={thumbSrc} alt={title} type={thumbType} ratio="4:3" size="sm" iconLabel={thumbLabel ?? title} />}
        <span className="pcard__text">
          <span className="pcard__title">{title}</span>
          {excerpt && <span className="pcard__excerpt">{excerpt}</span>}
        </span>
      </span>
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
