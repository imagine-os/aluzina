import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { demoUserById } from '../../auth/demoUsers';
import { useSession } from '../../auth/SessionProvider';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Input } from '../../components/atom/Input/Input';
import { Markdown } from '../../components/atom/Markdown/Markdown';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { Thumb } from '../../components/molecule/Thumb/Thumb';
import { DocumentViewer } from '../../components/organism/DocumentViewer/DocumentViewer';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useRow, useTable } from '../../data/DataContext';
import { RELATION_KINDS, type Asset, type PostStatus, type RelationKind } from '../../data/schema';
import { FILE_TYPE_LABELS, fileTypeOf, isPreviewable, pick } from '../../domain';
import { formatDate, formatDateTime } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { RELATABLE_TYPES, useEntityIndex, type EntityOption } from './entities';
import { ancestorsOf } from './model';
import { postSpec } from './specs';
import './spaces.css';

const NONE = '__none__';

/** K-03: one post, its filings, tags, relations, backlinks, comments and activity. */
export function PostPage({ surface }: { surface: Surface }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { postId } = useParams();
  const id = postId ?? NONE;
  const { user, can } = useSession();
  const data = useData();
  const { row: post, loading } = useRow('posts', postId);
  const filings = useTable('filings', { where: { postId: id } });
  const outgoing = useTable('relations', { where: { fromType: 'posts', fromId: id } });
  const incoming = useTable('relations', { where: { toType: 'posts', toId: id } });
  const comments = useTable('comments', { where: { entity: 'posts', entityId: id }, orderBy: 'created_at' });
  const activity = useTable('activity', { where: { entity: 'posts', entityId: id }, orderBy: 'at', dir: 'desc' });
  const assets = useTable('assets');
  const index = useEntityIndex(surface);
  const canWrite = can('spaces.write');
  const base = `/${surface}/spaces`;
  const spec = postSpec(surface);

  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [bodyDraft, setBodyDraft] = useState('');
  const [tagsDraft, setTagsDraft] = useState('');
  const [fileOpen, setFileOpen] = useState(false);
  const [fileQuery, setFileQuery] = useState('');
  const [relType, setRelType] = useState<string>('spaces');
  const [relQuery, setRelQuery] = useState('');
  const [relTarget, setRelTarget] = useState<EntityOption | null>(null);
  const [relKind, setRelKind] = useState<RelationKind>('references');
  const [relNote, setRelNote] = useState('');
  const [comment, setComment] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const filedSpaces = useMemo(() => filings.rows.map((f) => ({ filing: f, space: index.spaces.find((s) => s.id === f.spaceId) })).filter((x) => x.space), [filings.rows, index.spaces]);
  const spaceOptions = useMemo(() => {
    const q = fileQuery.trim().toLowerCase();
    return index.spaces
      .filter((s) => !s.archived)
      .map((s) => ({ space: s, path: [...ancestorsOf(index.spaces, s.id).map((a) => a.name), s.name].join(' / ') }))
      .filter((x) => !q || x.path.toLowerCase().includes(q))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [index.spaces, fileQuery]);
  const relResults = useMemo(() => index.search(relType, relQuery, 8).filter((o) => !(relType === 'posts' && o.id === id)), [index, relType, relQuery, id]);

  /**
   * ar-17: the file a `file` post points at - the first `assets` row among its relations (D-026). When the
   * row has served page renders (or is a served PDF, image or video) the post previews in place through the
   * shared `DocumentViewer`; anything else keeps its link, which for the Dropbox archive is the whole point.
   */
  const fileAsset: Asset | null = useMemo(() => {
    if (post?.kind !== 'file') return null;
    for (const r of outgoing.rows) {
      if (r.toType !== 'assets') continue;
      const a = assets.rows.find((x) => x.id === r.toId);
      if (a) return a;
    }
    return null;
  }, [post?.kind, outgoing.rows, assets.rows]);
  const fileType = fileTypeOf(fileAsset?.sourceName ?? fileAsset?.title ?? post?.title ?? '');
  const previewable = Boolean(fileAsset && (fileAsset.previewUrls.length > 0 || (fileAsset.url && isPreviewable(fileType))));

  const openPreview = (): string => {
    if (!previewable) return 'not previewable: this post has no file the browser can show; its link opens it at the source';
    setPreviewOpen(true);
    return fileAsset?.id ?? 'open';
  };
  const closePreview = (): string => {
    setPreviewOpen(false);
    return 'closed';
  };
  useRegisterActions({
    'spaces.previewAsset': () => openPreview(),
    'spaces.closeAssetPreview': () => closePreview(),
  });

  if (!loading && !post) {
    return (
      <div className="spaces-page">
        <PageHeader code={spec.code} title={t('spaces.post')} breadcrumb={[{ label: t(`core.portal.${surface}`), to: `/${surface}` }, { label: t('spaces.title'), to: base }]} />
        <EmptyState title={t('spaces.postNotFound')} glyph="◈">
          <Button variant="primary" href={`#${base}`}>{t('spaces.allSpaces')}</Button>
        </EmptyState>
      </div>
    );
  }
  if (!post) return <div className="spaces-page" aria-busy="true" />;

  const author = demoUserById(post.authorId);
  const first = filedSpaces[0]?.space;
  const visible = post.status === 'published' || canWrite || post.authorId === user.id;

  const startEdit = () => {
    setTitleDraft(post.title);
    setBodyDraft(post.body);
    setTagsDraft(post.tags.join(', '));
    setEditing(true);
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    await data.update('posts', post.id, { title: titleDraft.trim() || post.title, body: bodyDraft, tags: tagsDraft.split(',').map((x) => x.trim().replace(/^#/, '')).filter(Boolean) }, { basedOn: post.updated_at });
    setEditing(false);
    toast(t('spaces.saved'));
  };
  const togglePin = async () => {
    await data.update('posts', post.id, { pinned: !post.pinned }, { basedOn: post.updated_at });
    toast(t(post.pinned ? 'spaces.unpinned' : 'spaces.pinned'));
  };
  const setStatus = async (status: PostStatus) => {
    await data.update('posts', post.id, { status }, { basedOn: post.updated_at });
    toast(t('spaces.statusSet', { status: t(`core.status.${status}`) }));
  };
  const toggleFiling = async (spaceId: string, on: boolean) => {
    const existing = filings.rows.find((f) => f.spaceId === spaceId);
    if (on && !existing) {
      await data.create('filings', { postId: post.id, spaceId });
      toast(t('spaces.filed', { space: index.spaces.find((s) => s.id === spaceId)?.name ?? '' }));
    } else if (!on && existing) {
      if (filings.rows.length === 1) {
        toast(t('spaces.lastFiling'));
        return;
      }
      await data.remove('filings', existing.id);
      toast(t('spaces.unfiled'));
    }
  };
  const addRelation = async (e: FormEvent) => {
    e.preventDefault();
    if (!relTarget) return;
    await data.create('relations', { fromType: 'posts', fromId: post.id, toType: relType, toId: relTarget.id, kind: relKind, note: relNote.trim() });
    setRelTarget(null);
    setRelQuery('');
    setRelNote('');
    toast(t('spaces.related'));
  };
  const removeRelation = async (relId: string) => {
    await data.remove('relations', relId);
    toast(t('spaces.unrelated'));
  };
  const submitComment = async (e: FormEvent) => {
    e.preventDefault();
    const body = comment.trim();
    if (!body) return;
    await data.create('comments', { entity: 'posts', entityId: post.id, authorId: user.id, body });
    setComment('');
  };
  const openTarget = (type: string, targetId: string) => {
    const r = index.resolve(type, targetId);
    if (r?.route) navigate(r.route);
    else toast(t('spaces.noRoute'));
  };

  const crumbs = [{ label: t(`core.portal.${surface}`), to: `/${surface}` }, { label: t('spaces.title'), to: base }, ...(first ? [{ label: first.name, to: `${base}/${first.id}` }] : []), { label: post.title }];

  return (
    <div className="spaces-page">
      <PageHeader
        code={spec.code}
        title={post.title}
        breadcrumb={crumbs}
        actions={
          <>
            {previewable && <Button variant="secondary" icon="images" onClick={openPreview}>{t('spaces.preview')}</Button>}
            {post.url && !previewable && <Button href={post.url} external iconEnd="↗">{t('spaces.openLink')}</Button>}
            {canWrite && <Button variant={post.pinned ? 'primary' : 'secondary'} icon="⚲" aria-pressed={post.pinned} onClick={togglePin}>{t(post.pinned ? 'spaces.unpin' : 'spaces.pin')}</Button>}
            {canWrite && !editing && <Button onClick={startEdit} icon="✎">{t('spaces.edit')}</Button>}
            {canWrite && <Select className="spaces-status" label={t('spaces.status')} hideLabel value={post.status} onChange={(e) => setStatus(e.target.value as PostStatus)} options={(['draft', 'published', 'archived'] as PostStatus[]).map((s) => ({ value: s, label: t(`core.status.${s}`) }))} />}
          </>
        }
      />

      {!visible ? (
        <EmptyState title={t('spaces.postHidden')} glyph="◈" />
      ) : (
        <div className="spaces-post">
          <article className="spaces-post__main" aria-labelledby="post-title">
            <h2 id="post-title" className="visually-hidden">{post.title}</h2>
            <div className="spaces-post__meta">
              <Badge tone={post.kind === 'decision' ? 'danger' : post.kind === 'procedure' ? 'success' : 'neutral'}>{t(`core.spaces.kind.${post.kind}`)}</Badge>
              {post.status !== 'published' && <StatusPill status={post.status} />}
              {post.pinned && <Badge tone="accent">{t('core.spaces.pinned')}</Badge>}
              {author && (
                <span className="spaces-post__author">
                  <Avatar name={author.name} initials={author.initials} size="sm" /> {author.name}
                </span>
              )}
              <span className="spaces-muted">{t('spaces.updatedAt', { date: formatDate(post.updated_at, lang) })}</span>
              {post.tags.length > 0 && (
                <span className="spaces-tags" aria-label={t('spaces.tags')}>
                  {post.tags.map((x) => (
                    <span key={x} className="spaces-tag">#{x}</span>
                  ))}
                </span>
              )}
            </div>

            {/* ar-17: the file of a `file` post - its Thumb (served render or the family icon) and the way in. */}
            {post.kind === 'file' && (
              <section className="spaces-post__file" aria-labelledby="post-file-title">
                <h3 id="post-file-title" className="visually-hidden">{t('spaces.file')}</h3>
                <Thumb className="spaces-post__thumb" src={fileAsset?.thumbnailUrl ?? null} alt={fileAsset?.title ?? post.title} type={fileType} ratio="4:3" size="sm" iconLabel={pick(FILE_TYPE_LABELS[fileType], lang)} />
                <div className="spaces-post__file-facts">
                  <p className="spaces-muted">
                    {pick(FILE_TYPE_LABELS[fileType], lang)}
                    {fileAsset?.previewUrls.length ? ` · ${t('spaces.filePages', { count: fileAsset.previewUrls.length })}` : ''}
                  </p>
                  <div className="spaces-actions">
                    {previewable ? (
                      <Button size="sm" variant="primary" icon="images" onClick={openPreview}>{t('spaces.preview')}</Button>
                    ) : (
                      <p className="spaces-muted spaces-hint">{t('spaces.noFilePreview')}</p>
                    )}
                    {post.url && <Button size="sm" variant="ghost" href={post.url} external iconEnd="↗">{t('spaces.openLink')}</Button>}
                    {fileAsset?.sourceUrl && fileAsset.sourceUrl !== post.url && <Button size="sm" variant="ghost" href={fileAsset.sourceUrl} external iconEnd="↗">{t('spaces.openSource')}</Button>}
                  </div>
                </div>
              </section>
            )}

            {editing ? (
              <form className="spaces-form" onSubmit={save}>
                <Input label={t('spaces.form.title')} value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} required />
                <Textarea label={t('spaces.form.body')} hint={t('spaces.form.bodyHint')} rows={14} value={bodyDraft} onChange={(e) => setBodyDraft(e.target.value)} />
                <Input label={t('spaces.form.tags')} hint={t('spaces.form.tagsHint')} value={tagsDraft} onChange={(e) => setTagsDraft(e.target.value)} />
                <div className="spaces-actions">
                  <Button type="submit" variant="primary">{t('spaces.save')}</Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}>{t('spaces.cancel')}</Button>
                </div>
              </form>
            ) : post.body.trim() ? (
              <Markdown source={post.body} />
            ) : (
              <p className="spaces-muted">{t('spaces.noBody')}</p>
            )}

            <section className="spaces-section" aria-labelledby="post-comments">
              <h3 id="post-comments" className="spaces-h3">
                {t('spaces.comments')} <Badge>{comments.rows.length}</Badge>
              </h3>
              {comments.rows.length === 0 && <p className="spaces-muted">{t('spaces.noComments')}</p>}
              <ol className="spaces-comments">
                {comments.rows.map((c) => {
                  const a = demoUserById(c.authorId);
                  return (
                    <li key={c.id} className="spaces-comment">
                      <Avatar name={a?.name ?? c.authorId} initials={a?.initials} size="sm" />
                      <div>
                        <div className="spaces-comment__head">
                          <strong>{a?.name ?? c.authorId}</strong> <span className="spaces-muted">{formatDateTime(c.created_at, lang)}</span>
                        </div>
                        <p>{c.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <form className="spaces-comment-form" onSubmit={submitComment}>
                <Textarea label={t('spaces.commentLabel')} hideLabel placeholder={t('spaces.commentLabel')} rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
                <Button type="submit" disabled={!comment.trim()}>{t('spaces.comment')}</Button>
              </form>
            </section>
          </article>

          <aside className="spaces-post__side">
            <section className="spaces-section" aria-labelledby="post-filed">
              <div className="spaces-section__head">
                <h3 id="post-filed" className="spaces-h3">{t('spaces.filedIn')} <Badge>{filedSpaces.length}</Badge></h3>
                {canWrite && <Button size="sm" onClick={() => setFileOpen(true)} icon="+">{t('spaces.fileIn')}</Button>}
              </div>
              <ul className="spaces-chips">
                {filedSpaces.map(({ filing, space }) => (
                  <li key={filing.id} className="spaces-chip">
                    <Button size="sm" variant="ghost" href={`#${base}/${space!.id}`} icon={space!.glyph}>{space!.name}</Button>
                    {canWrite && <Button size="sm" variant="ghost" icon="×" aria-label={t('spaces.unfileFrom', { space: space!.name })} onClick={() => toggleFiling(space!.id, false)} />}
                  </li>
                ))}
              </ul>
              <p className="spaces-muted spaces-hint">{t('spaces.filedHint')}</p>
            </section>

            <section className="spaces-section" aria-labelledby="post-relations">
              <h3 id="post-relations" className="spaces-h3">{t('spaces.relations')} <Badge>{outgoing.rows.length}</Badge></h3>
              {outgoing.rows.length === 0 && <p className="spaces-muted">{t('spaces.noRelations')}</p>}
              <ul className="spaces-rel-list">
                {outgoing.rows.map((r) => {
                  const target = index.resolve(r.toType, r.toId);
                  return (
                    <li key={r.id} className="spaces-rel">
                      <Badge tone="info">{t(`spaces.relation.${r.kind}`)}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => openTarget(r.toType, r.toId)} iconEnd="›">
                        {target?.label ?? r.toId}
                      </Button>
                      {canWrite ? <Button size="sm" variant="ghost" icon="×" aria-label={t('spaces.removeRelation')} onClick={() => removeRelation(r.id)} /> : <span />}
                      <span className="spaces-muted spaces-rel__type">{target?.sub ?? r.toType}{r.note && ` · ${r.note}`}</span>
                    </li>
                  );
                })}
              </ul>
              {canWrite && (
                <form className="spaces-rel-form" onSubmit={addRelation} aria-label={t('spaces.addRelation')}>
                  <Select label={t('spaces.rel.type')} value={relType} onChange={(e) => { setRelType(e.target.value); setRelTarget(null); setRelQuery(''); }} options={RELATABLE_TYPES.map((x) => ({ value: x, label: t(`spaces.type.${x}`) }))} />
                  <div className="spaces-rel-form__target">
                    <SearchField value={relQuery} onChange={(v) => { setRelQuery(v); setRelTarget(null); }} label={t('spaces.rel.target')} placeholder={t('spaces.rel.targetPlaceholder')} />
                    {relTarget ? (
                      <Badge tone="accent">{relTarget.label}</Badge>
                    ) : (
                      <ul className="spaces-rel-results" aria-label={t('spaces.rel.results')}>
                        {relResults.map((o) => (
                          <li key={o.id}>
                            <Button size="sm" variant="ghost" onClick={() => setRelTarget(o)}>{o.label}</Button>
                          </li>
                        ))}
                        {relResults.length === 0 && <li className="spaces-muted">{t('spaces.rel.noResults')}</li>}
                      </ul>
                    )}
                  </div>
                  <Select label={t('spaces.rel.kind')} value={relKind} onChange={(e) => setRelKind(e.target.value as RelationKind)} options={RELATION_KINDS.map((k) => ({ value: k, label: t(`spaces.relation.${k}`) }))} />
                  <Input label={t('spaces.rel.note')} value={relNote} onChange={(e) => setRelNote(e.target.value)} />
                  <Button type="submit" variant="primary" size="sm" disabled={!relTarget}>{t('spaces.addRelation')}</Button>
                </form>
              )}
            </section>

            <section className="spaces-section" aria-labelledby="post-backlinks">
              <h3 id="post-backlinks" className="spaces-h3">{t('spaces.referencedBy')} <Badge>{incoming.rows.length}</Badge></h3>
              {incoming.rows.length === 0 && <p className="spaces-muted">{t('spaces.noBacklinks')}</p>}
              <ul className="spaces-rel-list">
                {incoming.rows.map((r) => {
                  const source = index.resolve(r.fromType, r.fromId);
                  return (
                    <li key={r.id} className="spaces-rel">
                      <Button size="sm" variant="ghost" onClick={() => openTarget(r.fromType, r.fromId)} iconEnd="›">{source?.label ?? r.fromId}</Button>
                      <Badge tone="info">{t(`spaces.relation.${r.kind}`)}</Badge>
                      <span />
                      <span className="spaces-muted spaces-rel__type">{source?.sub ?? r.fromType}</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="spaces-section" aria-labelledby="post-activity">
              <h3 id="post-activity" className="spaces-h3">{t('spaces.activity')} <Badge>{activity.rows.length}</Badge></h3>
              {activity.rows.length === 0 && <p className="spaces-muted">{t('spaces.noActivity')}</p>}
              <ol className="spaces-activity">
                {activity.rows.slice(0, 20).map((a) => (
                  <li key={a.id}>
                    <span className="spaces-muted">{formatDateTime(a.at, lang)}</span> <strong>{(a.actorId && demoUserById(a.actorId)?.name) ?? t('core.data.someone')}</strong> {t('spaces.changed', { field: a.field })} {a.from ?? '—'} → {a.to ?? '—'}
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      )}

      {/* ar-17: the shared viewer in the page's existing Drawer pattern, not a bare link out. */}
      <Drawer open={previewOpen && fileAsset !== null} onClose={closePreview} title={fileAsset?.title ?? post.title}>
        {fileAsset && (
          <>
            <DocumentViewer
              asset={{ title: fileAsset.title, titleEs: fileAsset.titleEs, url: fileAsset.url, sourceUrl: fileAsset.sourceUrl, mimeType: fileAsset.mimeType, previewUrls: fileAsset.previewUrls, pageCount: fileAsset.pageCount, thumbnailUrl: fileAsset.thumbnailUrl, fileType }}
              downloadName={fileAsset.title}
              controls={false}
              labels={{
                fallback: t('spaces.noFilePreview'),
                download: t('spaces.download'),
                openSource: t('spaces.openSource'),
                page: (n, total) => t('spaces.viewerPosition', { index: n, total }),
                prev: t('spaces.viewerPrev'),
                next: t('spaces.viewerNext'),
                thumbnails: t('spaces.viewerThumbnails'),
                fileType: pick(FILE_TYPE_LABELS[fileType], lang),
              }}
            />
            <div className="spaces-actions">
              {fileAsset.url && <Button href={fileAsset.url} download={fileAsset.title}>{t('spaces.download')}</Button>}
              {(fileAsset.sourceUrl ?? post.url) && <Button variant="ghost" href={(fileAsset.sourceUrl ?? post.url) as string} external>{t('spaces.openSource')}</Button>}
              <Button variant="ghost" onClick={closePreview}>{t('spaces.close')}</Button>
            </div>
          </>
        )}
      </Drawer>

      <Drawer open={fileOpen} onClose={() => setFileOpen(false)} title={t('spaces.fileInTitle', { post: post.title })}>
        <div className="spaces-form">
          <SearchField value={fileQuery} onChange={setFileQuery} label={t('spaces.search')} placeholder={t('spaces.searchSpaces')} />
          <ul className="spaces-file-list">
            {spaceOptions.map(({ space, path }) => (
              <li key={space.id}>
                <Checkbox label={path} checked={filings.rows.some((f) => f.spaceId === space.id)} onChange={(e) => toggleFiling(space.id, e.target.checked)} />
              </li>
            ))}
          </ul>
        </div>
      </Drawer>
    </div>
  );
}
