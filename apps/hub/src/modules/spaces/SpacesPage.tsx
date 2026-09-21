import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEMO_USERS, demoUserById } from '../../auth/demoUsers';
import { useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Input } from '../../components/atom/Input/Input';
import { Markdown } from '../../components/atom/Markdown/Markdown';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { PostCard } from '../../components/molecule/PostCard/PostCard';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Modal } from '../../components/organism/Modal/Modal';
import { SpaceTree } from '../../components/organism/SpaceTree/SpaceTree';
import { useData, useTable } from '../../data/DataContext';
import { POST_KINDS, SPACE_KINDS, type Post, type PostKind, type Space, type SpaceKind } from '../../data/schema';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { ancestorsOf, buildTree, excerptOf, matchingSpaceIds, postCountsBySpace, postMatches, slugify, toTreeNodes, type SpaceNode } from './model';
import { spaceViewSpec, spacesHomeSpec } from './specs';
import './spaces.css';

type SortBy = 'updated' | 'title' | 'kind' | 'author';

function filterTree(nodes: SpaceNode[], keep: Set<string>): SpaceNode[] {
  return nodes.filter((n) => keep.has(n.space.id)).map((n) => ({ space: n.space, children: filterTree(n.children, keep) }));
}

function pathLabel(spaces: Space[], s: Space): string {
  return [...ancestorsOf(spaces, s.id).map((a) => a.name), s.name].join(' / ');
}

/** K-01 (default selection) and K-02 (`:spaceId`) share this page; the surface only changes the shell. */
export function SpacesPage({ surface }: { surface: Surface }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { spaceId: routeSpaceId } = useParams();
  const { user, role, can } = useSession();
  const data = useData();
  const spaces = useTable('spaces');
  const posts = useTable('posts');
  const filings = useTable('filings');
  const tagRows = useTable('tags');
  const canWrite = can('spaces.write');
  const canAdmin = can('spaces.admin');
  const base = `/${surface}/spaces`;

  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [kind, setKind] = useState('');
  const [tag, setTag] = useState('');
  const [author, setAuthor] = useState('');
  const [sort, setSort] = useState<SortBy>('updated');
  const [treeOpen, setTreeOpen] = useState(false);
  const [newSpace, setNewSpace] = useState(false);
  const [newPost, setNewPost] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  const roleSpace = useMemo(() => spaces.rows.find((s) => s.aboutType === 'roles' && s.aboutId === role && !s.archived), [spaces.rows, role]);
  const firstArea = useMemo(() => [...spaces.rows].filter((s) => !s.parentId && !s.archived).sort((a, b) => a.order - b.order)[0], [spaces.rows]);
  const selectedId = routeSpaceId ?? roleSpace?.id ?? firstArea?.id ?? null;
  const selected = spaces.rows.find((s) => s.id === selectedId) ?? null;
  const ancestors = selected ? ancestorsOf(spaces.rows, selected.id) : [];

  // expand the path to the selection (and the selection itself) whenever it changes
  useEffect(() => {
    if (!selected) return;
    setExpanded((e) => {
      const next = { ...e, [selected.id]: true };
      for (const a of ancestorsOf(spaces.rows, selected.id)) next[a.id] = true;
      return next;
    });
  }, [selected, spaces.rows]);

  useEffect(() => {
    setEditingDesc(false);
  }, [selectedId]);

  const searchHits = useMemo(() => matchingSpaceIds(spaces.rows, query), [spaces.rows, query]);
  const counts = useMemo(() => postCountsBySpace(filings.rows), [filings.rows]);
  const tree = useMemo(() => {
    const all = buildTree(spaces.rows, showArchived || Boolean(selected?.archived));
    return query.trim() ? filterTree(all, searchHits) : all;
  }, [spaces.rows, showArchived, selected?.archived, query, searchHits]);
  const treeExpanded = useMemo(() => (query.trim() ? { ...expanded, ...Object.fromEntries([...searchHits].map((id) => [id, true])) } : expanded), [expanded, query, searchHits]);
  const treeNodes = useMemo(() => toTreeNodes(tree, counts), [tree, counts]);

  const filingsBySpace = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const f of filings.rows) m.set(f.spaceId, [...(m.get(f.spaceId) ?? []), f.postId]);
    return m;
  }, [filings.rows]);
  const filingCountByPost = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of filings.rows) m.set(f.postId, (m.get(f.postId) ?? 0) + 1);
    return m;
  }, [filings.rows]);

  const searching = query.trim().length > 0;
  const visiblePosts = useMemo(() => {
    const inSpace = new Set(selectedId ? filingsBySpace.get(selectedId) ?? [] : []);
    let list = posts.rows.filter((p) => (searching ? postMatches(p, query) : inSpace.has(p.id)));
    if (!canWrite) list = list.filter((p) => p.status === 'published' || p.authorId === user.id);
    if (kind) list = list.filter((p) => p.kind === kind);
    if (tag) list = list.filter((p) => p.tags.includes(tag));
    if (author) list = list.filter((p) => p.authorId === author);
    const by: Record<SortBy, (a: Post, b: Post) => number> = {
      updated: (a, b) => b.updated_at.localeCompare(a.updated_at),
      title: (a, b) => a.title.localeCompare(b.title),
      kind: (a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title),
      author: (a, b) => (demoUserById(a.authorId)?.name ?? '').localeCompare(demoUserById(b.authorId)?.name ?? ''),
    };
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || by[sort](a, b));
  }, [posts.rows, filingsBySpace, selectedId, searching, query, canWrite, user.id, kind, tag, author, sort]);

  const usedTags = useMemo(() => {
    const set = new Set<string>(tagRows.rows.map((x) => x.name));
    posts.rows.forEach((p) => p.tags.forEach((x) => set.add(x)));
    return [...set].sort();
  }, [tagRows.rows, posts.rows]);
  const authors = useMemo(() => DEMO_USERS.filter((u) => posts.rows.some((p) => p.authorId === u.id)), [posts.rows]);
  const children = useMemo(() => (selected ? spaces.rows.filter((s) => s.parentId === selected.id && (showArchived || !s.archived)).sort((a, b) => a.order - b.order) : []), [spaces.rows, selected, showArchived]);
  const rolePostCount = roleSpace ? counts.get(roleSpace.id) ?? 0 : 0;

  const select = (id: string) => {
    setTreeOpen(false);
    navigate(`${base}/${id}`);
  };
  const toggle = (id: string, open: boolean) => setExpanded((e) => ({ ...e, [id]: open }));
  const clearFilters = () => {
    setKind('');
    setTag('');
    setAuthor('');
  };

  const saveDescription = async () => {
    if (!selected) return;
    await data.update('spaces', selected.id, { description: descDraft }, { basedOn: selected.updated_at });
    setEditingDesc(false);
    toast(t('spaces.saved'));
  };
  const toggleArchive = async () => {
    if (!selected) return;
    await data.update('spaces', selected.id, { archived: !selected.archived }, { basedOn: selected.updated_at });
    toast(t(selected.archived ? 'spaces.unarchived' : 'spaces.archived'));
  };

  const spec = routeSpaceId ? spaceViewSpec(surface) : spacesHomeSpec(surface);
  const home = `/${surface}`;
  const crumbs = [{ label: t(`core.portal.${surface}`), to: home }, { label: t('spaces.title'), to: base }, ...ancestors.map((a) => ({ label: a.name, to: `${base}/${a.id}` })), ...(selected && routeSpaceId ? [{ label: selected.name }] : [])];

  if (routeSpaceId && !spaces.loading && !selected) {
    return (
      <div className="spaces-page">
        <PageHeader code={spec.code} title={t('spaces.title')} breadcrumb={[{ label: t(`core.portal.${surface}`), to: home }, { label: t('spaces.title'), to: base }]} />
        <EmptyState title={t('spaces.notFound')} glyph="◈">
          <Button variant="primary" href={`#${base}`}>{t('spaces.allSpaces')}</Button>
        </EmptyState>
      </div>
    );
  }

  const treePanel = (
    <div className="spaces-tree">
      <SearchField value={query} onChange={setQuery} label={t('spaces.search')} placeholder={t('spaces.searchPlaceholder')} />
      <Checkbox label={t('spaces.showArchived')} checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
      {treeNodes.length === 0 ? <p className="spaces-muted">{t('spaces.noTreeMatch')}</p> : <SpaceTree nodes={treeNodes} selectedId={selectedId} onSelect={select} expanded={treeExpanded} onToggle={toggle} label={t('spaces.treeLabel')} />}
    </div>
  );

  return (
    <div className="spaces-page">
      <PageHeader
        code={spec.code}
        title={selected && routeSpaceId ? selected.name : t('spaces.title')}
        subtitle={selected && routeSpaceId ? t(`spaces.kind.${selected.kind}`) + (selected.archived ? ` · ${t('core.status.archived')}` : '') : t('spaces.subtitle')}
        breadcrumb={crumbs}
        actions={
          <>
            <Button className="spaces-browse" icon="☰" onClick={() => setTreeOpen(true)} aria-expanded={treeOpen}>
              {t('spaces.browse')}
            </Button>
            {canAdmin && selected && routeSpaceId && (
              <Button variant="ghost" onClick={toggleArchive}>
                {t(selected.archived ? 'spaces.unarchive' : 'spaces.archive')}
              </Button>
            )}
            {canWrite && <Button onClick={() => setNewSpace(true)} icon="+">{t('spaces.newSpace')}</Button>}
            {canWrite && <Button variant="primary" onClick={() => setNewPost(true)} icon="+">{t('spaces.newPost')}</Button>}
          </>
        }
      />

      {roleSpace && (
        <Card raised className="spaces-role" title={t('spaces.role.title', { space: roleSpace.name })} subtitle={t(rolePostCount === 1 ? 'spaces.role.countOne' : 'spaces.role.count', { n: rolePostCount })} actions={roleSpace.id !== selectedId ? <Button size="sm" onClick={() => select(roleSpace.id)}>{t('spaces.role.go')}</Button> : undefined} />
      )}

      <div className="spaces-layout">
        <aside className="spaces-side" aria-label={t('spaces.treeLabel')}>{treePanel}</aside>

        <section className="spaces-main" aria-label={selected?.name ?? t('spaces.title')}>
          {selected && !searching && (
            <div className="spaces-desc">
              <div className="spaces-desc__head">
                <h2 className="spaces-h2">
                  <span className="spaces-glyph" aria-hidden="true">{selected.glyph}</span> {selected.name} <Badge>{t(`spaces.kind.${selected.kind}`)}</Badge>
                </h2>
                {canWrite && !editingDesc && (
                  <Button size="sm" variant="ghost" onClick={() => { setDescDraft(selected.description); setEditingDesc(true); }}>
                    {t('spaces.editDescription')}
                  </Button>
                )}
              </div>
              {editingDesc ? (
                <form className="spaces-desc__form" onSubmit={(e) => { e.preventDefault(); saveDescription(); }}>
                  <Textarea label={t('spaces.description')} hideLabel rows={3} value={descDraft} onChange={(e) => setDescDraft(e.target.value)} />
                  <div className="spaces-actions">
                    <Button type="submit" variant="primary" size="sm">{t('spaces.save')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingDesc(false)}>{t('spaces.cancel')}</Button>
                  </div>
                </form>
              ) : selected.description ? (
                <Markdown source={selected.description} className="spaces-desc__body" />
              ) : (
                <p className="spaces-muted">{t('spaces.noDescription')}</p>
              )}
            </div>
          )}

          {!searching && children.length > 0 && (
            <div className="spaces-children">
              <h3 className="spaces-h3">{t('spaces.children', { n: children.length })}</h3>
              <ul className="spaces-children__grid">
                {children.map((c) => (
                  <li key={c.id}>
                    <Card onActivate={() => select(c.id)} aria-label={c.name} padding="sm" className="spaces-child">
                      <span className="spaces-child__row">
                        <span className="spaces-glyph" aria-hidden="true">{c.glyph}</span>
                        <span className="spaces-child__name">{c.name}</span>
                        <Badge>{t(`spaces.kind.${c.kind}`)}</Badge>
                      </span>
                      <span className="spaces-child__meta">
                        {t(counts.get(c.id) === 1 ? 'spaces.postsOne' : 'spaces.posts', { n: counts.get(c.id) ?? 0 })}
                        {spaces.rows.some((s) => s.parentId === c.id) && ` · ${t('spaces.hasChildren')}`}
                      </span>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FilterBar
            summary={t(visiblePosts.length === 1 ? 'spaces.postsOne' : 'spaces.posts', { n: visiblePosts.length }) + (searching ? ` · ${t('spaces.searchResults', { query: query.trim() })}` : '')}
            onClear={kind || tag || author ? clearFilters : undefined}
          >
            <Select label={t('spaces.filter.kind')} hideLabel value={kind} onChange={(e) => setKind(e.target.value)} options={[{ value: '', label: t('spaces.filter.allKinds') }, ...POST_KINDS.map((k) => ({ value: k, label: t(`core.spaces.kind.${k}`) }))]} />
            <Select label={t('spaces.filter.tag')} hideLabel value={tag} onChange={(e) => setTag(e.target.value)} options={[{ value: '', label: t('spaces.filter.allTags') }, ...usedTags.map((x) => ({ value: x, label: `#${x}` }))]} />
            <Select label={t('spaces.filter.author')} hideLabel value={author} onChange={(e) => setAuthor(e.target.value)} options={[{ value: '', label: t('spaces.filter.allAuthors') }, ...authors.map((u) => ({ value: u.id, label: u.name }))]} />
            <Select label={t('spaces.sort')} hideLabel value={sort} onChange={(e) => setSort(e.target.value as SortBy)} options={(['updated', 'title', 'kind', 'author'] as SortBy[]).map((s) => ({ value: s, label: t(`spaces.sort.${s}`) }))} />
          </FilterBar>

          {visiblePosts.length === 0 ? (
            <EmptyState title={searching ? t('spaces.noResults') : t('spaces.noPosts')} description={canWrite && !searching ? t('spaces.noPostsHint') : undefined} glyph="◈">
              {canWrite && !searching && <Button variant="primary" onClick={() => setNewPost(true)}>{t('spaces.newPost')}</Button>}
            </EmptyState>
          ) : (
            <ul className="spaces-posts">
              {visiblePosts.map((p) => {
                const a = demoUserById(p.authorId);
                return (
                  <li key={p.id}>
                    <PostCard title={p.title} kind={p.kind} status={p.status} pinned={p.pinned} tags={p.tags} author={a ? { name: a.name, initials: a.initials } : null} updated={formatDate(p.updated_at, lang)} alsoIn={Math.max(0, (filingCountByPost.get(p.id) ?? 0) - (searching ? 0 : 1))} excerpt={excerptOf(p.body)} url={p.url} onOpen={() => navigate(`${base}/post/${p.id}`)} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Drawer open={treeOpen} onClose={() => setTreeOpen(false)} title={t('spaces.treeLabel')} side="left">
        {treePanel}
      </Drawer>

      {newSpace && <NewSpaceModal spaces={spaces.rows} parentId={selected?.id ?? null} onClose={() => setNewSpace(false)} onCreated={(id) => { setNewSpace(false); navigate(`${base}/${id}`); }} />}
      {newPost && selected && <NewPostModal space={selected} onClose={() => setNewPost(false)} onCreated={(id) => { setNewPost(false); navigate(`${base}/post/${id}`); }} />}
    </div>
  );
}

function NewSpaceModal({ spaces, parentId, onClose, onCreated }: { spaces: Space[]; parentId: string | null; onClose: () => void; onCreated: (id: string) => void }) {
  const { t } = useT();
  const data = useData();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<SpaceKind>('topic');
  const [parent, setParent] = useState(parentId ?? '');
  const [description, setDescription] = useState('');
  const options = useMemo(() => [...spaces].filter((s) => !s.archived).map((s) => ({ value: s.id, label: pathLabel(spaces, s) })).sort((a, b) => a.label.localeCompare(b.label)), [spaces]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const siblings = spaces.filter((s) => s.parentId === (parent || null));
    const row = await data.create('spaces', { name: name.trim(), slug: slugify(name), parentId: parent || null, kind, description: description.trim(), glyph: kind === 'area' ? '◇' : '▸', order: siblings.length + 1, visibility: 'team', archived: false, aboutType: null, aboutId: null });
    toast(t('spaces.spaceCreated'));
    onCreated(row.id);
  };
  return (
    <Modal open onClose={onClose} title={t('spaces.newSpace')} footer={<><Button variant="ghost" onClick={onClose}>{t('spaces.cancel')}</Button><Button variant="primary" type="submit" form="spaces-new-space" disabled={!name.trim()}>{t('spaces.create')}</Button></>}>
      <form id="spaces-new-space" className="spaces-form" onSubmit={submit}>
        <Input label={t('spaces.form.name')} value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        <Select label={t('spaces.form.kind')} value={kind} onChange={(e) => setKind(e.target.value as SpaceKind)} options={SPACE_KINDS.map((k) => ({ value: k, label: t(`spaces.kind.${k}`) }))} />
        <Select label={t('spaces.form.parent')} value={parent} onChange={(e) => setParent(e.target.value)} options={[{ value: '', label: t('spaces.form.noParent') }, ...options]} />
        <Textarea label={t('spaces.description')} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </form>
    </Modal>
  );
}

function NewPostModal({ space, onClose, onCreated }: { space: Space; onClose: () => void; onCreated: (id: string) => void }) {
  const { t } = useT();
  const data = useData();
  const { user } = useSession();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<PostKind>('note');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const post = await data.create('posts', { title: title.trim(), body, kind, authorId: user.id, url: kind === 'link' && url.trim() ? url.trim() : null, pinned: false, status: 'published', tags: tags.split(',').map((x) => x.trim().replace(/^#/, '')).filter(Boolean) });
    await data.create('filings', { postId: post.id, spaceId: space.id });
    toast(t('spaces.postCreated', { space: space.name }));
    onCreated(post.id);
  };
  return (
    <Modal open onClose={onClose} title={t('spaces.newPostIn', { space: space.name })} size="lg" footer={<><Button variant="ghost" onClick={onClose}>{t('spaces.cancel')}</Button><Button variant="primary" type="submit" form="spaces-new-post" disabled={!title.trim()}>{t('spaces.publish')}</Button></>}>
      <form id="spaces-new-post" className="spaces-form" onSubmit={submit}>
        <Input label={t('spaces.form.title')} value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        <Select label={t('spaces.form.kind')} value={kind} onChange={(e) => setKind(e.target.value as PostKind)} options={POST_KINDS.map((k) => ({ value: k, label: t(`core.spaces.kind.${k}`) }))} />
        {kind === 'link' && <Input label={t('spaces.form.url')} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />}
        <Textarea label={t('spaces.form.body')} hint={t('spaces.form.bodyHint')} rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
        <Input label={t('spaces.form.tags')} hint={t('spaces.form.tagsHint')} value={tags} onChange={(e) => setTags(e.target.value)} />
      </form>
    </Modal>
  );
}
